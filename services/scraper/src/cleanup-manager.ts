import { EventEmitter } from 'events';
import { scraperDb } from './database';
import { resourceMonitor } from './resource-monitor';
import { ScrapedContent } from './types';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface CleanupPolicy {
  name: string;
  enabled: boolean;
  retention: {
    contentDays: number;
    jobsDays: number;
    logsDays: number;
    errorContentDays: number;
  };
  archival: {
    enabled: boolean;
    archiveAfterDays: number;
    compressionLevel: number;
  };
  storage: {
    maxStorageSize: number; // MB
    compressionEnabled: boolean;
    deduplicationEnabled: boolean;
  };
  scheduling: {
    intervalHours: number;
    maxExecutionTime: number; // minutes
  };
}

export interface CleanupResult {
  timestamp: Date;
  policy: string;
  operations: {
    contentCleanup: {
      deleted: number;
      archived: number;
      spaceSaved: number;
    };
    jobsCleanup: {
      deleted: number;
      spaceSaved: number;
    };
    logsCleanup: {
      deleted: number;
      spaceSaved: number;
    };
    compression: {
      compressed: number;
      spaceSaved: number;
    };
    deduplication: {
      duplicatesRemoved: number;
      spaceSaved: number;
    };
  };
  totalSpaceSaved: number;
  executionTime: number; // ms
  errors: string[];
}

export interface ArchiveEntry {
  id: string;
  originalId: string;
  content: string;
  fullHtml: string;
  metadata: {
    sourceId: string;
    title: string;
    createdAt: Date;
    archivedAt: Date;
    originalSize: number;
    compressedSize: number;
  };
  compressedContent: Buffer;
  compressedHtml: Buffer;
}

export interface StorageMetrics {
  totalSize: number;
  contentSize: number;
  htmlSize: number;
  compressedSize: number;
  archiveSize: number;
  compressionRatio: number;
  totalRecords: number;
  archivedRecords: number;
}

export interface CleanupSchedule {
  policyName: string;
  nextRun: Date;
  lastRun?: Date;
  isRunning: boolean;
  averageExecutionTime: number;
}

export class CleanupManager extends EventEmitter {
  private isInitialized = false;
  private cleanupSchedules: Map<string, CleanupSchedule> = new Map();
  private cleanupHistory: CleanupResult[] = [];
  private maxHistorySize = 100;
  private activeCleanupJobs: Set<string> = new Set();
  private scheduledIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Default cleanup policies
  private defaultPolicies: Map<string, CleanupPolicy> = new Map([
    ['default', {
      name: 'default',
      enabled: true,
      retention: {
        contentDays: 30,
        jobsDays: 14,
        logsDays: 7,
        errorContentDays: 90
      },
      archival: {
        enabled: true,
        archiveAfterDays: 30,
        compressionLevel: 6
      },
      storage: {
        maxStorageSize: 1024, // 1GB
        compressionEnabled: true,
        deduplicationEnabled: true
      },
      scheduling: {
        intervalHours: 24,
        maxExecutionTime: 60
      }
    }],
    ['aggressive', {
      name: 'aggressive',
      enabled: false,
      retention: {
        contentDays: 7,
        jobsDays: 7,
        logsDays: 3,
        errorContentDays: 30
      },
      archival: {
        enabled: true,
        archiveAfterDays: 7,
        compressionLevel: 9
      },
      storage: {
        maxStorageSize: 512, // 512MB
        compressionEnabled: true,
        deduplicationEnabled: true
      },
      scheduling: {
        intervalHours: 6,
        maxExecutionTime: 30
      }
    }],
    ['conservative', {
      name: 'conservative',
      enabled: false,
      retention: {
        contentDays: 90,
        jobsDays: 60,
        logsDays: 30,
        errorContentDays: 180
      },
      archival: {
        enabled: true,
        archiveAfterDays: 90,
        compressionLevel: 3
      },
      storage: {
        maxStorageSize: 2048, // 2GB
        compressionEnabled: false,
        deduplicationEnabled: true
      },
      scheduling: {
        intervalHours: 72,
        maxExecutionTime: 120
      }
    }]
  ]);

  constructor() {
    super();
    this.setupCleanupMonitoring();
  }

  /**
   * Initialize cleanup manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[CleanupManager] Initializing cleanup manager...');

    try {
      // Create archive table if it doesn't exist
      await this.createArchiveTable();

      // Load existing cleanup schedules
      await this.loadCleanupSchedules();

      // Start scheduled cleanup tasks
      await this.startScheduledCleanups();

      // Set up resource monitor integration
      this.setupResourceMonitorIntegration();

      this.isInitialized = true;
      console.log('[CleanupManager] Cleanup manager initialized successfully');
      
      this.emit('initialized');
    } catch (error) {
      console.error('[CleanupManager] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Create archive table for storing compressed historical data
   */
  private async createArchiveTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS scraped_content_archive (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_id UUID NOT NULL,
        source_id UUID REFERENCES sources(id),
        title TEXT NOT NULL,
        content TEXT,
        full_html TEXT,
        compressed_content BYTEA,
        compressed_html BYTEA,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        original_size BIGINT,
        compressed_size BIGINT,
        compression_ratio DECIMAL(5,2)
      );

      CREATE INDEX IF NOT EXISTS idx_archive_original_id ON scraped_content_archive(original_id);
      CREATE INDEX IF NOT EXISTS idx_archive_source_id ON scraped_content_archive(source_id);
      CREATE INDEX IF NOT EXISTS idx_archive_created_at ON scraped_content_archive(created_at);
      CREATE INDEX IF NOT EXISTS idx_archive_archived_at ON scraped_content_archive(archived_at);
    `;

    await scraperDb.query(query);
    console.log('[CleanupManager] Archive table created/verified');
  }

  /**
   * Execute cleanup based on policy
   */
  async executeCleanup(policyName: string = 'default'): Promise<CleanupResult> {
    const policy = this.defaultPolicies.get(policyName);
    if (!policy) {
      throw new Error(`Cleanup policy '${policyName}' not found`);
    }

    if (!policy.enabled) {
      throw new Error(`Cleanup policy '${policyName}' is disabled`);
    }

    if (this.activeCleanupJobs.has(policyName)) {
      throw new Error(`Cleanup job for policy '${policyName}' is already running`);
    }

    const startTime = Date.now();
    this.activeCleanupJobs.add(policyName);

    console.log(`[CleanupManager] Starting cleanup with policy: ${policyName}`);

    const result: CleanupResult = {
      timestamp: new Date(),
      policy: policyName,
      operations: {
        contentCleanup: { deleted: 0, archived: 0, spaceSaved: 0 },
        jobsCleanup: { deleted: 0, spaceSaved: 0 },
        logsCleanup: { deleted: 0, spaceSaved: 0 },
        compression: { compressed: 0, spaceSaved: 0 },
        deduplication: { duplicatesRemoved: 0, spaceSaved: 0 }
      },
      totalSpaceSaved: 0,
      executionTime: 0,
      errors: []
    };

    try {
      // Execute cleanup operations in sequence
      if (policy.archival.enabled) {
        const archiveResult = await this.archiveOldContent(policy);
        result.operations.contentCleanup.archived = archiveResult.archived;
        result.operations.contentCleanup.spaceSaved += archiveResult.spaceSaved;
      }

      const contentResult = await this.cleanupOldContent(policy);
      result.operations.contentCleanup.deleted = contentResult.deleted;
      result.operations.contentCleanup.spaceSaved += contentResult.spaceSaved;

      const jobsResult = await this.cleanupOldJobs(policy);
      result.operations.jobsCleanup.deleted = jobsResult.deleted;
      result.operations.jobsCleanup.spaceSaved = jobsResult.spaceSaved;

      const logsResult = await this.cleanupOldLogs(policy);
      result.operations.logsCleanup.deleted = logsResult.deleted;
      result.operations.logsCleanup.spaceSaved = logsResult.spaceSaved;

      if (policy.storage.compressionEnabled) {
        const compressionResult = await this.compressContent(policy);
        result.operations.compression.compressed = compressionResult.compressed;
        result.operations.compression.spaceSaved = compressionResult.spaceSaved;
      }

      if (policy.storage.deduplicationEnabled) {
        const deduplicationResult = await this.deduplicateContent(policy);
        result.operations.deduplication.duplicatesRemoved = deduplicationResult.duplicatesRemoved;
        result.operations.deduplication.spaceSaved = deduplicationResult.spaceSaved;
      }

      // Calculate totals
      result.totalSpaceSaved = 
        result.operations.contentCleanup.spaceSaved +
        result.operations.jobsCleanup.spaceSaved +
        result.operations.logsCleanup.spaceSaved +
        result.operations.compression.spaceSaved +
        result.operations.deduplication.spaceSaved;

      result.executionTime = Date.now() - startTime;

      // Update schedule
      const schedule = this.cleanupSchedules.get(policyName);
      if (schedule) {
        schedule.lastRun = new Date();
        schedule.isRunning = false;
        schedule.averageExecutionTime = (schedule.averageExecutionTime + result.executionTime) / 2;
      }

      // Store result
      this.cleanupHistory.push(result);
      if (this.cleanupHistory.length > this.maxHistorySize) {
        this.cleanupHistory = this.cleanupHistory.slice(-this.maxHistorySize);
      }

      console.log(`[CleanupManager] Cleanup completed for policy ${policyName}: ${(result.totalSpaceSaved / 1024 / 1024).toFixed(2)}MB saved in ${result.executionTime}ms`);

      this.emit('cleanup-completed', result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error(`[CleanupManager] Cleanup failed for policy ${policyName}:`, error);
      
      this.emit('cleanup-error', { policy: policyName, error: errorMessage });
      
    } finally {
      this.activeCleanupJobs.delete(policyName);
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Archive old content with compression
   */
  private async archiveOldContent(policy: CleanupPolicy): Promise<{ archived: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.archival.archiveAfterDays);

    console.log(`[CleanupManager] Archiving content older than ${cutoffDate.toISOString()}`);

    // Get content to archive
    const query = `
      SELECT id, source_id, title, content, full_html, created_at,
             LENGTH(content) as content_size,
             LENGTH(COALESCE(full_html, '')) as html_size
      FROM scraped_content 
      WHERE created_at < $1 
      AND id NOT IN (SELECT original_id FROM scraped_content_archive)
      LIMIT 1000
    `;

    const result = await scraperDb.query(query, [cutoffDate]);
    
    if (result.rows.length === 0) {
      return { archived: 0, spaceSaved: 0 };
    }

    let totalSpaceSaved = 0;
    let archivedCount = 0;

    // Process in batches
    for (const row of result.rows) {
      try {
        const originalSize = parseInt(row.content_size) + parseInt(row.html_size);
        
        // Compress content
        const compressedContent = await this.compressText(row.content, policy.archival.compressionLevel);
        const compressedHtml = row.full_html ? await this.compressText(row.full_html, policy.archival.compressionLevel) : Buffer.alloc(0);
        
        const compressedSize = compressedContent.length + compressedHtml.length;
        const compressionRatio = originalSize > 0 ? (compressedSize / originalSize) : 0;

        // Insert into archive
        const archiveQuery = `
          INSERT INTO scraped_content_archive (
            original_id, source_id, title, content, full_html,
            compressed_content, compressed_html, metadata,
            created_at, original_size, compressed_size, compression_ratio
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;

        const metadata = {
          sourceId: row.source_id,
          title: row.title,
          createdAt: row.created_at,
          archivedAt: new Date(),
          originalSize: originalSize,
          compressedSize: compressedSize
        };

        await scraperDb.query(archiveQuery, [
          row.id,
          row.source_id,
          row.title,
          row.content,
          row.full_html,
          compressedContent,
          compressedHtml,
          JSON.stringify(metadata),
          row.created_at,
          originalSize,
          compressedSize,
          compressionRatio
        ]);

        totalSpaceSaved += originalSize - compressedSize;
        archivedCount++;

      } catch (error) {
        console.error(`[CleanupManager] Failed to archive content ${row.id}:`, error);
      }
    }

    console.log(`[CleanupManager] Archived ${archivedCount} items, saved ${(totalSpaceSaved / 1024 / 1024).toFixed(2)}MB`);

    return { archived: archivedCount, spaceSaved: totalSpaceSaved };
  }

  /**
   * Clean up old content
   */
  private async cleanupOldContent(policy: CleanupPolicy): Promise<{ deleted: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention.contentDays);

    console.log(`[CleanupManager] Cleaning up content older than ${cutoffDate.toISOString()}`);

    return await scraperDb.cleanupOldContent(policy.retention.contentDays);
  }

  /**
   * Clean up old jobs
   */
  private async cleanupOldJobs(policy: CleanupPolicy): Promise<{ deleted: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention.jobsDays);

    console.log(`[CleanupManager] Cleaning up jobs older than ${cutoffDate.toISOString()}`);

    // Get size of jobs to be deleted
    const sizeQuery = `
      SELECT 
        COUNT(*) as count,
        SUM(LENGTH(COALESCE(job_logs, ''))) as logs_size
      FROM scraping_jobs 
      WHERE completed_at < $1
    `;

    const sizeResult = await scraperDb.query(sizeQuery, [cutoffDate]);
    const count = parseInt(sizeResult.rows[0]?.count || '0');
    const spaceSaved = parseInt(sizeResult.rows[0]?.logs_size || '0');

    if (count === 0) {
      return { deleted: 0, spaceSaved: 0 };
    }

    // Delete old jobs
    const deleteQuery = 'DELETE FROM scraping_jobs WHERE completed_at < $1';
    const deleteResult = await scraperDb.query(deleteQuery, [cutoffDate]);

    console.log(`[CleanupManager] Deleted ${deleteResult.rowCount} old jobs, saved ${(spaceSaved / 1024 / 1024).toFixed(2)}MB`);

    return {
      deleted: deleteResult.rowCount || 0,
      spaceSaved
    };
  }

  /**
   * Clean up old logs
   */
  private async cleanupOldLogs(policy: CleanupPolicy): Promise<{ deleted: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention.logsDays);

    console.log(`[CleanupManager] Cleaning up logs older than ${cutoffDate.toISOString()}`);

    // Get size of logs to be deleted
    const sizeQuery = `
      SELECT 
        COUNT(*) as count,
        SUM(LENGTH(COALESCE(message, ''))) as message_size,
        SUM(LENGTH(COALESCE(additional_data::text, ''))) as data_size
      FROM scraping_logs 
      WHERE timestamp < $1
    `;

    const sizeResult = await scraperDb.query(sizeQuery, [cutoffDate]);
    const count = parseInt(sizeResult.rows[0]?.count || '0');
    const messageSize = parseInt(sizeResult.rows[0]?.message_size || '0');
    const dataSize = parseInt(sizeResult.rows[0]?.data_size || '0');
    const spaceSaved = messageSize + dataSize;

    if (count === 0) {
      return { deleted: 0, spaceSaved: 0 };
    }

    // Delete old logs
    const deleteQuery = 'DELETE FROM scraping_logs WHERE timestamp < $1';
    const deleteResult = await scraperDb.query(deleteQuery, [cutoffDate]);

    console.log(`[CleanupManager] Deleted ${deleteResult.rowCount} old logs, saved ${(spaceSaved / 1024 / 1024).toFixed(2)}MB`);

    return {
      deleted: deleteResult.rowCount || 0,
      spaceSaved
    };
  }

  /**
   * Compress existing content
   */
  private async compressContent(policy: CleanupPolicy): Promise<{ compressed: number; spaceSaved: number }> {
    console.log('[CleanupManager] Compressing existing content...');

    // Get uncompressed content
    const query = `
      SELECT id, content, full_html,
             LENGTH(content) as content_size,
             LENGTH(COALESCE(full_html, '')) as html_size
      FROM scraped_content 
      WHERE compressed_content IS NULL 
      AND LENGTH(content) > 1000
      LIMIT 100
    `;

    const result = await scraperDb.query(query);
    
    if (result.rows.length === 0) {
      return { compressed: 0, spaceSaved: 0 };
    }

    let totalSpaceSaved = 0;
    let compressedCount = 0;

    for (const row of result.rows) {
      try {
        const originalSize = parseInt(row.content_size) + parseInt(row.html_size);
        
        // Compress content
        const compressedContent = await this.compressText(row.content, 6);
        const compressedHtml = row.full_html ? await this.compressText(row.full_html, 6) : null;
        
        const compressedSize = compressedContent.length + (compressedHtml ? compressedHtml.length : 0);

        // Update record with compressed content
        const updateQuery = `
          UPDATE scraped_content 
          SET compressed_content = $1, compressed_html = $2, compression_ratio = $3
          WHERE id = $4
        `;

        const compressionRatio = originalSize > 0 ? (compressedSize / originalSize) : 0;

        await scraperDb.query(updateQuery, [
          compressedContent,
          compressedHtml,
          compressionRatio,
          row.id
        ]);

        totalSpaceSaved += originalSize - compressedSize;
        compressedCount++;

      } catch (error) {
        console.error(`[CleanupManager] Failed to compress content ${row.id}:`, error);
      }
    }

    console.log(`[CleanupManager] Compressed ${compressedCount} items, saved ${(totalSpaceSaved / 1024 / 1024).toFixed(2)}MB`);

    return { compressed: compressedCount, spaceSaved: totalSpaceSaved };
  }

  /**
   * Remove duplicate content
   */
  private async deduplicateContent(policy: CleanupPolicy): Promise<{ duplicatesRemoved: number; spaceSaved: number }> {
    console.log('[CleanupManager] Deduplicating content...');

    // Find duplicates by content hash
    const query = `
      SELECT content_hash, COUNT(*) as count, 
             STRING_AGG(id::text, ',') as ids,
             SUM(LENGTH(content)) as total_size
      FROM scraped_content 
      WHERE content_hash IS NOT NULL 
      GROUP BY content_hash 
      HAVING COUNT(*) > 1
      LIMIT 100
    `;

    const result = await scraperDb.query(query);
    
    if (result.rows.length === 0) {
      return { duplicatesRemoved: 0, spaceSaved: 0 };
    }

    let totalSpaceSaved = 0;
    let duplicatesRemoved = 0;

    for (const row of result.rows) {
      try {
        const ids = row.ids.split(',');
        const keepId = ids[0]; // Keep the first one
        const removeIds = ids.slice(1); // Remove the rest

        // Calculate space saved
        const avgSize = parseInt(row.total_size) / parseInt(row.count);
        const spaceSaved = avgSize * removeIds.length;

        // Remove duplicates
        const deleteQuery = 'DELETE FROM scraped_content WHERE id = ANY($1)';
        const deleteResult = await scraperDb.query(deleteQuery, [removeIds]);

        totalSpaceSaved += spaceSaved;
        duplicatesRemoved += deleteResult.rowCount || 0;

      } catch (error) {
        console.error(`[CleanupManager] Failed to remove duplicates for hash ${row.content_hash}:`, error);
      }
    }

    console.log(`[CleanupManager] Removed ${duplicatesRemoved} duplicates, saved ${(totalSpaceSaved / 1024 / 1024).toFixed(2)}MB`);

    return { duplicatesRemoved, spaceSaved: totalSpaceSaved };
  }

  /**
   * Compress text content
   */
  private async compressText(text: string, level: number = 6): Promise<Buffer> {
    return await gzip(Buffer.from(text, 'utf8'), { level });
  }

  /**
   * Decompress text content
   */
  private async decompressText(buffer: Buffer): Promise<string> {
    const decompressed = await gunzip(buffer);
    return decompressed.toString('utf8');
  }

  /**
   * Get storage metrics
   */
  async getStorageMetrics(): Promise<StorageMetrics> {
    const query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(LENGTH(content)) as content_size,
        SUM(LENGTH(COALESCE(full_html, ''))) as html_size,
        SUM(CASE WHEN compressed_content IS NOT NULL THEN LENGTH(compressed_content) ELSE 0 END) as compressed_content_size,
        SUM(CASE WHEN compressed_html IS NOT NULL THEN LENGTH(compressed_html) ELSE 0 END) as compressed_html_size,
        (SELECT COUNT(*) FROM scraped_content_archive) as archived_records,
        (SELECT SUM(compressed_size) FROM scraped_content_archive) as archive_size
      FROM scraped_content
    `;

    const result = await scraperDb.query(query);
    const row = result.rows[0];

    const totalRecords = parseInt(row.total_records || '0');
    const contentSize = parseInt(row.content_size || '0');
    const htmlSize = parseInt(row.html_size || '0');
    const compressedContentSize = parseInt(row.compressed_content_size || '0');
    const compressedHtmlSize = parseInt(row.compressed_html_size || '0');
    const archivedRecords = parseInt(row.archived_records || '0');
    const archiveSize = parseInt(row.archive_size || '0');

    const totalSize = contentSize + htmlSize;
    const compressedSize = compressedContentSize + compressedHtmlSize;
    const compressionRatio = totalSize > 0 ? (compressedSize / totalSize) : 0;

    return {
      totalSize,
      contentSize,
      htmlSize,
      compressedSize,
      archiveSize,
      compressionRatio,
      totalRecords,
      archivedRecords
    };
  }

  /**
   * Get cleanup history
   */
  getCleanupHistory(): CleanupResult[] {
    return [...this.cleanupHistory];
  }

  /**
   * Get cleanup schedules
   */
  getCleanupSchedules(): CleanupSchedule[] {
    return Array.from(this.cleanupSchedules.values());
  }

  /**
   * Get cleanup policies
   */
  getCleanupPolicies(): CleanupPolicy[] {
    return Array.from(this.defaultPolicies.values());
  }

  /**
   * Update cleanup policy
   */
  updateCleanupPolicy(policy: CleanupPolicy): void {
    this.defaultPolicies.set(policy.name, policy);
    
    // Update schedule if changed
    if (policy.enabled) {
      this.scheduleCleanup(policy.name, policy.scheduling.intervalHours);
    } else {
      this.unscheduleCleanup(policy.name);
    }
    
    console.log(`[CleanupManager] Updated cleanup policy: ${policy.name}`);
    this.emit('policy-updated', policy);
  }

  /**
   * Load cleanup schedules from database or initialize defaults
   */
  private async loadCleanupSchedules(): Promise<void> {
    // Initialize default schedules
    for (const [name, policy] of this.defaultPolicies) {
      if (policy.enabled) {
        const schedule: CleanupSchedule = {
          policyName: name,
          nextRun: new Date(Date.now() + policy.scheduling.intervalHours * 60 * 60 * 1000),
          isRunning: false,
          averageExecutionTime: 0
        };
        this.cleanupSchedules.set(name, schedule);
      }
    }

    console.log(`[CleanupManager] Loaded ${this.cleanupSchedules.size} cleanup schedules`);
  }

  /**
   * Start scheduled cleanup tasks
   */
  private async startScheduledCleanups(): Promise<void> {
    for (const [name, schedule] of this.cleanupSchedules) {
      this.scheduleCleanup(name, this.defaultPolicies.get(name)?.scheduling.intervalHours || 24);
    }

    console.log(`[CleanupManager] Started ${this.scheduledIntervals.size} scheduled cleanups`);
  }

  /**
   * Schedule cleanup task
   */
  private scheduleCleanup(policyName: string, intervalHours: number): void {
    // Clear existing schedule
    this.unscheduleCleanup(policyName);

    const interval = setInterval(async () => {
      try {
        await this.executeCleanup(policyName);
      } catch (error) {
        console.error(`[CleanupManager] Scheduled cleanup failed for policy ${policyName}:`, error);
      }
    }, intervalHours * 60 * 60 * 1000);

    this.scheduledIntervals.set(policyName, interval);
    console.log(`[CleanupManager] Scheduled cleanup for policy ${policyName} every ${intervalHours} hours`);
  }

  /**
   * Unschedule cleanup task
   */
  private unscheduleCleanup(policyName: string): void {
    const interval = this.scheduledIntervals.get(policyName);
    if (interval) {
      clearInterval(interval);
      this.scheduledIntervals.delete(policyName);
      console.log(`[CleanupManager] Unscheduled cleanup for policy ${policyName}`);
    }
  }

  /**
   * Setup cleanup monitoring
   */
  private setupCleanupMonitoring(): void {
    // Monitor cleanup job status
    setInterval(() => {
      const activeJobs = Array.from(this.activeCleanupJobs);
      if (activeJobs.length > 0) {
        console.log(`[CleanupManager] Active cleanup jobs: ${activeJobs.join(', ')}`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Setup resource monitor integration
   */
  private setupResourceMonitorIntegration(): void {
    // Listen for resource alerts
    resourceMonitor.on('alert', (alert) => {
      if (alert.type === 'storage' && alert.level === 'warning') {
        console.log('[CleanupManager] Storage warning detected, triggering cleanup...');
        this.executeCleanup('aggressive').catch(console.error);
      }
    });
  }

  /**
   * Shutdown cleanup manager
   */
  async shutdown(): Promise<void> {
    console.log('[CleanupManager] Shutting down cleanup manager...');

    // Clear all scheduled intervals
    for (const [name, interval] of this.scheduledIntervals) {
      clearInterval(interval);
    }
    this.scheduledIntervals.clear();

    // Wait for active jobs to complete
    while (this.activeCleanupJobs.size > 0) {
      console.log(`[CleanupManager] Waiting for ${this.activeCleanupJobs.size} active cleanup jobs to complete...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('[CleanupManager] Cleanup manager shutdown complete');
    this.emit('shutdown');
  }
}

// Export singleton instance
export const cleanupManager = new CleanupManager(); 