import { EventEmitter } from 'events';
import { scraperDb } from './database';
import { NewsSource, SourceScrapingConfig } from './types';

export interface SourceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rssItemCount?: number;
  responseTime?: number;
  contentType?: string;
  lastChecked: Date;
}

export interface SourceHealth {
  sourceId: string;
  isHealthy: boolean;
  lastSuccessfulScrape?: Date;
  lastFailedScrape?: Date;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  totalScrapes: number;
  lastHealthCheck: Date;
}

export interface SourcePerformanceMetrics {
  sourceId: string;
  sourceName: string;
  totalArticles: number;
  successfulArticles: number;
  failedArticles: number;
  duplicateArticles: number;
  averageProcessingTime: number;
  lastScrapedAt?: Date;
  createdAt: Date;
}

export interface CreateSourceRequest {
  name: string;
  domain: string;
  url: string;
  rssUrl: string;
  description: string;
  category?: string;
  scrapingConfig?: SourceScrapingConfig;
  isActive?: boolean;
  isEnabled?: boolean;
}

export interface UpdateSourceRequest {
  id: string;
  name?: string;
  domain?: string;
  url?: string;
  rssUrl?: string;
  description?: string;
  category?: string;
  scrapingConfig?: SourceScrapingConfig;
  isActive?: boolean;
  isEnabled?: boolean;
}

/**
 * Source Management System for dynamic source configuration and health monitoring
 */
export class SourceManager extends EventEmitter {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly healthCheckIntervalMs: number = 300000; // 5 minutes
  private sourceHealthCache: Map<string, SourceHealth> = new Map();
  private performanceMetricsCache: Map<string, SourcePerformanceMetrics> = new Map();

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.on('source-created', this.handleSourceCreated.bind(this));
    this.on('source-updated', this.handleSourceUpdated.bind(this));
    this.on('source-deleted', this.handleSourceDeleted.bind(this));
    this.on('health-check-completed', this.handleHealthCheckCompleted.bind(this));
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      return;
    }

    console.log('[SourceManager] Starting health monitoring...');
    
    // Initial health check
    this.performHealthChecks();
    
    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckIntervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('[SourceManager] Health monitoring stopped');
    }
  }

  /**
   * Create a new source
   */
  async createSource(request: CreateSourceRequest): Promise<string> {
    try {
      // Validate source data
      const validation = await this.validateSourceData(request);
      if (!validation.isValid) {
        throw new Error(`Source validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for domain conflicts
      const existingSource = await scraperDb.getSourceByDomain(request.domain);
      if (existingSource) {
        throw new Error(`Source with domain ${request.domain} already exists`);
      }

      // Create source in database
      const sourceData: Omit<NewsSource, 'id'> = {
        name: request.name,
        domain: request.domain,
        url: request.url,
        description: request.description,
        isActive: request.isActive ?? true,
        rssUrl: request.rssUrl,
        scrapingConfig: request.scrapingConfig,
        isEnabled: request.isEnabled ?? true
      };

      const sourceId = await scraperDb.upsertSource(sourceData);
      
      // Initialize health metrics
      await this.initializeSourceHealth(sourceId.toString());
      
      this.emit('source-created', sourceId, sourceData);
      
      console.log(`[SourceManager] Source created successfully: ${request.name} (ID: ${sourceId})`);
      return sourceId.toString();

    } catch (error) {
      console.error('[SourceManager] Failed to create source:', error);
      throw error;
    }
  }

  /**
   * Update an existing source
   */
  async updateSource(request: UpdateSourceRequest): Promise<void> {
    try {
      // Get existing source
      const existingSource = await this.getSourceById(request.id);
      if (!existingSource) {
        throw new Error(`Source with ID ${request.id} not found`);
      }

      // Validate updated data
      const mergedData = { ...existingSource, ...request };
      const validation = await this.validateSourceData(mergedData);
      if (!validation.isValid) {
        throw new Error(`Source validation failed: ${validation.errors.join(', ')}`);
      }

      // Update source in database
      const updateData: Partial<NewsSource> = {};
      if (request.name !== undefined) updateData.name = request.name;
      if (request.domain !== undefined) updateData.domain = request.domain;
      if (request.url !== undefined) updateData.url = request.url;
      if (request.rssUrl !== undefined) updateData.rssUrl = request.rssUrl;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.scrapingConfig !== undefined) updateData.scrapingConfig = request.scrapingConfig;
      if (request.isActive !== undefined) updateData.isActive = request.isActive;
      if (request.isEnabled !== undefined) updateData.isEnabled = request.isEnabled;

      await this.updateSourceInDatabase(request.id, updateData);
      
      this.emit('source-updated', request.id, updateData);
      
      console.log(`[SourceManager] Source updated successfully: ${request.id}`);

    } catch (error) {
      console.error('[SourceManager] Failed to update source:', error);
      throw error;
    }
  }

  /**
   * Delete a source
   */
  async deleteSource(sourceId: string): Promise<void> {
    try {
      const source = await this.getSourceById(sourceId);
      if (!source) {
        throw new Error(`Source with ID ${sourceId} not found`);
      }

      await this.deleteSourceFromDatabase(sourceId);
      
      // Clean up health cache
      this.sourceHealthCache.delete(sourceId);
      this.performanceMetricsCache.delete(sourceId);
      
      this.emit('source-deleted', sourceId);
      
      console.log(`[SourceManager] Source deleted successfully: ${sourceId}`);

    } catch (error) {
      console.error('[SourceManager] Failed to delete source:', error);
      throw error;
    }
  }

  /**
   * Get source by ID
   */
  async getSourceById(sourceId: string): Promise<NewsSource | null> {
    try {
      const result = await scraperDb.query<NewsSource>(
        'SELECT * FROM sources WHERE id = $1',
        [sourceId]
      );
      
      return result.rows.length > 0 ? result.rows[0]! : null;

    } catch (error) {
      console.error('[SourceManager] Failed to get source by ID:', error);
      return null;
    }
  }

  /**
   * Get all sources with optional filtering
   */
  async getAllSources(options?: {
    activeOnly?: boolean;
    enabledOnly?: boolean;
    category?: string;
  }): Promise<NewsSource[]> {
    try {
      let query = 'SELECT * FROM sources';
      const conditions: string[] = [];
      const params: any[] = [];

      if (options?.activeOnly) {
        conditions.push('is_active = true');
      }

      if (options?.enabledOnly) {
        conditions.push('is_enabled = true');
      }

      if (options?.category) {
        conditions.push('category = $' + (params.length + 1));
        params.push(options.category);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY name ASC';

      const result = await scraperDb.query<any>(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        domain: row.domain,
        url: row.url,
        description: row.description,
        iconUrl: row.icon_url,
        isActive: row.is_active,
        rssUrl: row.rss_url,
        scrapingConfig: row.scraping_config ? JSON.parse(row.scraping_config) : undefined,
        lastScrapedAt: row.last_scraped_at,
        successRate: parseFloat(row.success_rate),
        isEnabled: row.is_enabled,
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error('[SourceManager] Failed to get all sources:', error);
      return [];
    }
  }

  /**
   * Validate source data
   */
  async validateSourceData(data: CreateSourceRequest | UpdateSourceRequest): Promise<SourceValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let rssItemCount: number | undefined;
    let responseTime: number | undefined;
    let contentType: string | undefined;

    // Basic validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Source name is required');
    }

    if (!data.domain || data.domain.trim().length === 0) {
      errors.push('Source domain is required');
    }

    if (!data.url || data.url.trim().length === 0) {
      errors.push('Source URL is required');
    }

    if (!data.rssUrl || data.rssUrl.trim().length === 0) {
      errors.push('RSS URL is required');
    }

    // URL validation
    if (data.url) {
      try {
        new URL(data.url);
      } catch {
        errors.push('Invalid source URL format');
      }
    }

    if (data.rssUrl) {
      try {
        new URL(data.rssUrl);
      } catch {
        errors.push('Invalid RSS URL format');
      }
    }

    // RSS feed validation
    if (data.rssUrl && errors.length === 0) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(data.rssUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Veritas-Scraper/1.0'
          }
        });

        clearTimeout(timeoutId);
        responseTime = Date.now() - startTime;
        contentType = response.headers.get('content-type') || undefined;

        if (!response.ok) {
          errors.push(`RSS feed returned HTTP ${response.status}`);
        } else {
          const contentType = response.headers.get('content-type');
          if (!contentType || (!contentType.includes('xml') && !contentType.includes('rss'))) {
            warnings.push('RSS feed may not be valid XML/RSS format');
          }

          // Try to parse RSS content
          try {
            const content = await response.text();
            const itemMatches = content.match(/<item>/g);
            rssItemCount = itemMatches ? itemMatches.length : 0;
            
            if (rssItemCount === 0) {
              warnings.push('RSS feed contains no items');
            }
          } catch (parseError) {
            errors.push('Failed to parse RSS feed content');
          }
        }

      } catch (fetchError) {
        errors.push(`Failed to fetch RSS feed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    }

    // Domain validation
    if (data.domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(data.domain)) {
        errors.push('Invalid domain format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rssItemCount,
      responseTime,
      contentType,
      lastChecked: new Date()
    };
  }

  /**
   * Test source connectivity
   */
  async testSource(sourceId: string): Promise<SourceValidationResult> {
    try {
      const source = await this.getSourceById(sourceId);
      if (!source) {
        return {
          isValid: false,
          errors: ['Source not found'],
          warnings: [],
          lastChecked: new Date()
        };
      }

      // Convert NewsSource to CreateSourceRequest for validation
      const sourceForValidation: CreateSourceRequest = {
        name: source.name,
        domain: source.domain,
        url: source.url,
        rssUrl: source.rssUrl || source.url,
        description: source.description,
        category: undefined,
        scrapingConfig: source.scrapingConfig,
        isActive: source.isActive,
        isEnabled: source.isEnabled
      };
      
      return await this.validateSourceData(sourceForValidation);

    } catch (error) {
      return {
        isValid: false,
        errors: [`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get source health metrics
   */
  async getSourceHealth(sourceId: string): Promise<SourceHealth | null> {
    // Check cache first
    const cached = this.sourceHealthCache.get(sourceId);
    if (cached) {
      return cached;
    }

    // Generate health metrics from database
    return await this.calculateSourceHealth(sourceId);
  }

  /**
   * Get source performance metrics
   */
  async getSourcePerformanceMetrics(sourceId: string): Promise<SourcePerformanceMetrics | null> {
    // Check cache first
    const cached = this.performanceMetricsCache.get(sourceId);
    if (cached) {
      return cached;
    }

    // Generate performance metrics from database
    return await this.calculateSourcePerformanceMetrics(sourceId);
  }

  /**
   * Get all source health metrics
   */
  async getAllSourceHealth(): Promise<SourceHealth[]> {
    const sources = await this.getAllSources({ enabledOnly: true });
    const healthMetrics: SourceHealth[] = [];

    for (const source of sources) {
      const health = await this.getSourceHealth(source.id!);
      if (health) {
        healthMetrics.push(health);
      }
    }

    return healthMetrics;
  }

  /**
   * Perform health checks for all sources
   */
  private async performHealthChecks(): Promise<void> {
    console.log('[SourceManager] Starting health checks...');
    
    try {
      const sources = await this.getAllSources({ enabledOnly: true });
      
      for (const source of sources) {
        try {
          const health = await this.calculateSourceHealth(source.id!);
          if (health) {
            this.sourceHealthCache.set(source.id!, health);
            this.emit('health-check-completed', source.id, health);
          }
        } catch (error) {
          console.error(`[SourceManager] Health check failed for source ${source.id}:`, error);
        }
      }

      console.log(`[SourceManager] Health checks completed for ${sources.length} sources`);

    } catch (error) {
      console.error('[SourceManager] Health check process failed:', error);
    }
  }

  /**
   * Calculate source health metrics
   */
  private async calculateSourceHealth(sourceId: string): Promise<SourceHealth | null> {
    try {
      // This would require additional database queries to get scraping history
      // For now, return mock data structure
      const health: SourceHealth = {
        sourceId,
        isHealthy: true,
        successRate: 95.0,
        averageResponseTime: 1200,
        errorCount: 2,
        totalScrapes: 40,
        lastHealthCheck: new Date()
      };

      return health;

    } catch (error) {
      console.error('[SourceManager] Failed to calculate source health:', error);
      return null;
    }
  }

  /**
   * Calculate source performance metrics
   */
  private async calculateSourcePerformanceMetrics(sourceId: string): Promise<SourcePerformanceMetrics | null> {
    try {
      const source = await this.getSourceById(sourceId);
      if (!source) {
        return null;
      }

      // This would require additional database queries
      // For now, return mock data structure
      const metrics: SourcePerformanceMetrics = {
        sourceId,
        sourceName: source.name,
        totalArticles: 150,
        successfulArticles: 142,
        failedArticles: 8,
        duplicateArticles: 25,
        averageProcessingTime: 3500,
        lastScrapedAt: source.lastScrapedAt,
        createdAt: source.createdAt || new Date()
      };

      return metrics;

    } catch (error) {
      console.error('[SourceManager] Failed to calculate performance metrics:', error);
      return null;
    }
  }

  /**
   * Initialize source health tracking
   */
  private async initializeSourceHealth(sourceId: string): Promise<void> {
    const health = await this.calculateSourceHealth(sourceId);
    if (health) {
      this.sourceHealthCache.set(sourceId, health);
    }
  }

  /**
   * Update source in database
   */
  private async updateSourceInDatabase(sourceId: string, updateData: Partial<NewsSource>): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }

    if (updateData.domain !== undefined) {
      updateFields.push(`domain = $${paramIndex++}`);
      values.push(updateData.domain);
    }

    if (updateData.url !== undefined) {
      updateFields.push(`url = $${paramIndex++}`);
      values.push(updateData.url);
    }

    if (updateData.rssUrl !== undefined) {
      updateFields.push(`rss_url = $${paramIndex++}`);
      values.push(updateData.rssUrl);
    }

    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updateData.description);
    }

    if (updateData.scrapingConfig !== undefined) {
      updateFields.push(`scraping_config = $${paramIndex++}`);
      values.push(JSON.stringify(updateData.scrapingConfig));
    }

    if (updateData.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      values.push(updateData.isActive);
    }

    if (updateData.isEnabled !== undefined) {
      updateFields.push(`is_enabled = $${paramIndex++}`);
      values.push(updateData.isEnabled);
    }

    if (updateFields.length === 0) {
      return;
    }

    values.push(sourceId);
    const query = `UPDATE sources SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

    await scraperDb.query(query, values);
  }

  /**
   * Delete source from database
   */
  private async deleteSourceFromDatabase(sourceId: string): Promise<void> {
    await scraperDb.query('DELETE FROM sources WHERE id = $1', [sourceId]);
  }

  /**
   * Event handlers
   */
  private async handleSourceCreated(sourceId: string, sourceData: Omit<NewsSource, 'id'>): Promise<void> {
    console.log(`[SourceManager] Source created event: ${sourceData.name}`);
  }

  private async handleSourceUpdated(sourceId: string, updateData: Partial<NewsSource>): Promise<void> {
    console.log(`[SourceManager] Source updated event: ${sourceId}`);
    
    // Refresh health cache
    this.sourceHealthCache.delete(sourceId);
    this.performanceMetricsCache.delete(sourceId);
  }

  private async handleSourceDeleted(sourceId: string): Promise<void> {
    console.log(`[SourceManager] Source deleted event: ${sourceId}`);
  }

  private async handleHealthCheckCompleted(sourceId: string, health: SourceHealth): Promise<void> {
    if (!health.isHealthy) {
      console.warn(`[SourceManager] Source health alert: ${sourceId} - Success rate: ${health.successRate}%`);
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.stopHealthMonitoring();
    this.sourceHealthCache.clear();
    this.performanceMetricsCache.clear();
    console.log('[SourceManager] Shutdown complete');
  }
}

// Export singleton instance
export const sourceManager = new SourceManager(); 