import { Pool, PoolClient } from 'pg';
import { 
  NewsSource, 
  ScrapedContent, 
  EnhancedScrapingJob, 
  ScrapingLogEntry, 
  SourceScrapingConfig,
  CrawleeClassification 
} from './types';

// Import resource monitor for performance tracking
import { resourceMonitor } from './resource-monitor';

export interface BatchInsertResult {
  successful: number;
  failed: number;
  errors: Error[];
}

export interface QueryPerformanceMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  rowsAffected: number;
}

export interface ConnectionPoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}

/**
 * Enhanced database client for Veritas scraper service
 * Optimized for performance with connection pooling, batch operations, and monitoring
 */
class ScraperDatabase {
  private pool: Pool | null = null;
  private isInitialized = false;
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;
  private connectionHealthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: Date | null = null;

  // Connection pool configuration optimized for scraper workloads
  private poolConfig = {
    max: 10, // Increased for better concurrency
    min: 2,  // Maintain minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout
    acquireTimeoutMillis: 60000,    // Time to wait for connection
    reapIntervalMillis: 1000,       // Check for idle connections
    createTimeoutMillis: 30000,     // Time to create new connection
    createRetryIntervalMillis: 2000, // Retry interval
    allowExitOnIdle: false,         // Keep pool alive
    statement_timeout: 30000,       // 30 second query timeout
    query_timeout: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };

  /**
   * Initialize database connection pool with enhanced configuration
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }

    console.log('[Scraper DB] Initializing enhanced connection pool...');
    console.log(`[Scraper DB] DATABASE_URL format: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`[Scraper DB] Connecting to: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
      console.log(`[Scraper DB] Pool config: max=${this.poolConfig.max}, min=${this.poolConfig.min}`);
      
      this.pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        ssl: { rejectUnauthorized: false },
        ...this.poolConfig
      });

      // Set up pool event handlers for monitoring
      this.pool.on('connect', (client) => {
        console.log('[Scraper DB] New client connected');
      });

      this.pool.on('remove', (client) => {
        console.log('[Scraper DB] Client removed from pool');
      });

      this.pool.on('error', (err, client) => {
        console.error('[Scraper DB] Pool error:', err);
      });

      // Test connection
      console.log('[Scraper DB] Testing database connection...');
      const testStart = Date.now();
      await this.pool.query('SELECT 1');
      const testDuration = Date.now() - testStart;
      
      this.isInitialized = true;
      console.log(`✅ [Scraper DB] Enhanced connection pool initialized (${testDuration}ms)`);
      
      // Start health monitoring
      this.startHealthMonitoring();
      
    } catch (error) {
      console.error('❌ [Scraper DB] Failed to connect:', error);
      this.pool = null;
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start connection health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.connectionHealthCheckInterval) {
      clearInterval(this.connectionHealthCheckInterval);
    }

    this.connectionHealthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        console.error('[Scraper DB] Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform database health check
   */
  private async healthCheck(): Promise<void> {
    if (!this.pool) return;

    try {
      const start = Date.now();
      await this.pool.query('SELECT 1');
      const duration = Date.now() - start;
      
      this.lastHealthCheck = new Date();
      
      if (duration > 5000) { // 5 second threshold
        console.warn(`[Scraper DB] Slow health check: ${duration}ms`);
      }
      
    } catch (error) {
      console.error('[Scraper DB] Health check failed:', error);
      // Attempt to reconnect
      await this.reconnect();
    }
  }

  /**
   * Reconnect to database
   */
  private async reconnect(): Promise<void> {
    console.log('[Scraper DB] Attempting to reconnect...');
    
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (error) {
        console.error('[Scraper DB] Error closing pool:', error);
      }
    }
    
    this.pool = null;
    this.isInitialized = false;
    
    // Retry connection with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.initialize();
        console.log(`✅ [Scraper DB] Reconnected successfully (attempt ${attempt})`);
        return;
      } catch (error) {
        console.error(`❌ [Scraper DB] Reconnection attempt ${attempt} failed:`, error);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw new Error('Failed to reconnect after 3 attempts');
  }

  /**
   * Execute a query with performance monitoring
   */
  async query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number | null }> {
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const start = Date.now();
    let result: { rows: T[]; rowCount: number | null };
    
    try {
      result = await this.pool.query(text, params) as unknown as { rows: T[]; rowCount: number | null };
      
      const duration = Date.now() - start;
      
      // Record performance metrics
      this.recordQueryMetrics(text, duration, result.rowCount || 0);
      
      // Report to resource monitor
      resourceMonitor.recordQueryTime(duration);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - start;
      this.recordQueryMetrics(text, duration, 0);
      
      console.error('[Scraper DB] Query error:', error);
      console.error('[Scraper DB] Query:', text);
      console.error('[Scraper DB] Duration:', duration + 'ms');
      
      throw error;
    }
  }

  /**
   * Execute query with retry logic
   */
  async queryWithRetry<T = any>(
    text: string, 
    params?: unknown[], 
    maxRetries: number = 3
  ): Promise<{ rows: T[]; rowCount: number | null }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.query<T>(text, params);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`[Scraper DB] Query attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Should not reach here');
  }

  /**
   * Execute query in transaction
   */
  async executeTransaction<T>(
    operations: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await operations(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Batch insert scraped content with optimized performance
   */
  async batchInsertScrapedContent(
    contents: Omit<ScrapedContent, 'id' | 'createdAt'>[]
  ): Promise<BatchInsertResult> {
    if (contents.length === 0) {
      return { successful: 0, failed: 0, errors: [] };
    }

    const batchSize = 100; // Process in batches of 100
    const result: BatchInsertResult = { successful: 0, failed: 0, errors: [] };

    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);
      
      try {
        await this.executeTransaction(async (client) => {
          const query = `
            INSERT INTO scraped_content (
              source_id, source_url, title, content, author, publication_date,
              content_type, language, processing_status, category, tags, 
              full_html, crawlee_classification, content_hash
            ) VALUES ${batch.map((_, idx) => 
              `($${idx * 14 + 1}, $${idx * 14 + 2}, $${idx * 14 + 3}, $${idx * 14 + 4}, $${idx * 14 + 5}, $${idx * 14 + 6}, $${idx * 14 + 7}, $${idx * 14 + 8}, $${idx * 14 + 9}, $${idx * 14 + 10}, $${idx * 14 + 11}, $${idx * 14 + 12}, $${idx * 14 + 13}, $${idx * 14 + 14})`
            ).join(', ')}
            ON CONFLICT (source_url) DO NOTHING
          `;

          const values = batch.flatMap(content => [
            content.sourceId,
            content.sourceUrl,
            content.title,
            content.content,
            content.author || null,
            content.publicationDate || null,
            content.contentType,
            content.language,
            content.processingStatus,
            content.category || null,
            content.tags || null,
            content.fullHtml || null,
            content.crawleeClassification ? JSON.stringify(content.crawleeClassification) : null,
            content.contentHash || null
          ]);

          const insertResult = await client.query(query, values);
          result.successful += insertResult.rowCount || 0;
        });
      } catch (error) {
        result.failed += batch.length;
        result.errors.push(error as Error);
        console.error(`[Scraper DB] Batch insert failed for batch ${i / batchSize + 1}:`, error);
      }
    }

    console.log(`[Scraper DB] Batch insert completed: ${result.successful} successful, ${result.failed} failed`);
    return result;
  }

  /**
   * Batch insert scraping logs
   */
  async batchInsertScrapingLogs(logs: Omit<ScrapingLogEntry, 'id'>[]): Promise<BatchInsertResult> {
    if (logs.length === 0) {
      return { successful: 0, failed: 0, errors: [] };
    }

    const batchSize = 500; // Larger batch size for logs
    const result: BatchInsertResult = { successful: 0, failed: 0, errors: [] };

    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      
      try {
        const query = `
          INSERT INTO scraping_logs (job_id, source_id, log_level, message, timestamp, additional_data)
          VALUES ${batch.map((_, idx) => 
            `($${idx * 6 + 1}, $${idx * 6 + 2}, $${idx * 6 + 3}, $${idx * 6 + 4}, $${idx * 6 + 5}, $${idx * 6 + 6})`
          ).join(', ')}
        `;

        const values = batch.flatMap(log => [
          log.jobId,
          log.sourceId || null,
          log.logLevel,
          log.message,
          log.timestamp,
          log.additionalData ? JSON.stringify(log.additionalData) : null
        ]);

        const insertResult = await this.query(query, values);
        result.successful += insertResult.rowCount || 0;
        
      } catch (error) {
        result.failed += batch.length;
        result.errors.push(error as Error);
        console.error(`[Scraper DB] Batch log insert failed for batch ${i / batchSize + 1}:`, error);
      }
    }

    return result;
  }

  /**
   * Get content with pagination for memory efficiency
   */
  async getScrapedContentPaginated(
    page: number = 1,
    limit: number = 100,
    sourceId?: number,
    language?: string
  ): Promise<{ content: ScrapedContent[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (sourceId) {
      whereClause += ` AND source_id = $${paramIndex++}`;
      params.push(sourceId);
    }

    if (language) {
      whereClause += ` AND language = $${paramIndex++}`;
      params.push(language);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM scraped_content ${whereClause}`;
    const countResult = await this.query<{ count: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    // Get paginated results
    const dataQuery = `
      SELECT * FROM scraped_content 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(limit, offset);
    const dataResult = await this.query<any>(dataQuery, params);

    const content = dataResult.rows.map(row => ({
      id: row.id,
      sourceId: row.source_id,
      sourceUrl: row.source_url,
      title: row.title,
      content: row.content,
      author: row.author,
      publicationDate: row.publication_date,
      contentType: row.content_type,
      language: row.language,
      processingStatus: row.processing_status,
      category: row.category,
      tags: row.tags,
      fullHtml: row.full_html,
      crawleeClassification: row.crawlee_classification ? JSON.parse(row.crawlee_classification) : null,
      contentHash: row.content_hash,
      createdAt: row.created_at
    }));

    return {
      content,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * Cleanup old content for storage optimization
   */
  async cleanupOldContent(daysToKeep: number = 30): Promise<{ deleted: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Get size of content to be deleted
    const sizeQuery = `
      SELECT 
        COUNT(*) as count,
        SUM(LENGTH(content)) as content_size,
        SUM(LENGTH(COALESCE(full_html, ''))) as html_size
      FROM scraped_content 
      WHERE created_at < $1
    `;
    
    const sizeResult = await this.query<{
      count: string;
      content_size: string;
      html_size: string;
    }>(sizeQuery, [cutoffDate]);

    const count = parseInt(sizeResult.rows[0]?.count || '0');
    const contentSize = parseInt(sizeResult.rows[0]?.content_size || '0');
    const htmlSize = parseInt(sizeResult.rows[0]?.html_size || '0');
    const spaceSaved = contentSize + htmlSize;

    if (count === 0) {
      return { deleted: 0, spaceSaved: 0 };
    }

    // Delete old content
    const deleteQuery = 'DELETE FROM scraped_content WHERE created_at < $1';
    const deleteResult = await this.query(deleteQuery, [cutoffDate]);

    console.log(`[Scraper DB] Cleaned up ${deleteResult.rowCount} old records, saved ${(spaceSaved / 1024 / 1024).toFixed(2)}MB`);
    
    return {
      deleted: deleteResult.rowCount || 0,
      spaceSaved
    };
  }

  /**
   * Record query performance metrics
   */
  private recordQueryMetrics(query: string, duration: number, rowsAffected: number): void {
    this.queryMetrics.push({
      query: query.substring(0, 100), // Truncate long queries
      duration,
      timestamp: new Date(),
      rowsAffected
    });

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get connection pool metrics
   */
  getConnectionPoolMetrics(): ConnectionPoolMetrics {
    if (!this.pool) {
      return { totalConnections: 0, idleConnections: 0, waitingClients: 0 };
    }

    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount
    };
  }

  /**
   * Get query performance metrics
   */
  getQueryMetrics(): QueryPerformanceMetrics[] {
    return [...this.queryMetrics];
  }

  /**
   * Get slow queries (above threshold)
   */
  getSlowQueries(thresholdMs: number = 1000): QueryPerformanceMetrics[] {
    return this.queryMetrics.filter(metric => metric.duration > thresholdMs);
  }

  // ===============================================
  // EXISTING METHODS (unchanged)
  // ===============================================

  /**
   * Upsert news source
   */
  async upsertSource(source: Omit<NewsSource, 'id'>): Promise<number> {
    const query = `
      INSERT INTO sources (name, domain, url, description, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (domain) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active
      RETURNING id
    `;
    
    const values = [source.name, source.domain, source.url, source.description, source.isActive];
    const result = await this.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Insert scraped content
   */
  async insertScrapedContent(content: Omit<ScrapedContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const query = `
      INSERT INTO scraped_content (
        source_id, source_url, title, content, author,
        publication_date, content_type, language, processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const values = [
      content.sourceId,
      content.sourceUrl,
      content.title,
      content.content,
      content.author || null,
      content.publicationDate || null,
      content.contentType,
      content.language,
      content.processingStatus
    ];
    
    const result = await this.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Check if content already exists by URL
   */
  async contentExists(sourceUrl: string): Promise<boolean> {
    const query = 'SELECT id FROM scraped_content WHERE source_url = $1 LIMIT 1';
    const result = await this.query(query, [sourceUrl]);
    return result.rows.length > 0;
  }

  /**
   * Get source by domain
   */
  async getSourceByDomain(domain: string): Promise<NewsSource | null> {
    const query = 'SELECT * FROM sources WHERE domain = $1';
    const result = await this.query(query, [domain]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      domain: row.domain,
      url: row.url,
      description: row.description,
      isActive: row.is_active
    };
  }

  // ===============================================
  // ENHANCED SCHEMA METHODS
  // ===============================================

  /**
   * Create a new scraping job
   */
  async createScrapingJob(job: Omit<EnhancedScrapingJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.initialize();
    
    const query = `
      INSERT INTO scraping_jobs (
        triggered_at, completed_at, status, sources_requested, 
        articles_per_source, total_articles_scraped, total_errors, job_logs
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const values = [
      job.triggeredAt,
      job.completedAt || null,
      job.status,
      job.sourcesRequested,
      job.articlesPerSource,
      job.totalArticlesScraped,
      job.totalErrors,
      job.jobLogs || null
    ];
    
    const result = await this.query<{ id: string }>(query, values);
    if (result.rows.length === 0) {
      throw new Error('Failed to create scraping job - no ID returned');
    }
    return result.rows[0]!.id;
  }

  /**
   * Update scraping job status and stats
   */
  async updateScrapingJob(
    jobId: string, 
    updates: Partial<Pick<EnhancedScrapingJob, 'status' | 'completedAt' | 'totalArticlesScraped' | 'totalErrors' | 'jobLogs'>>
  ): Promise<void> {
    await this.initialize();
    
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    
    if (updates.completedAt !== undefined) {
      updateFields.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }
    
    if (updates.totalArticlesScraped !== undefined) {
      updateFields.push(`total_articles_scraped = $${paramIndex++}`);
      values.push(updates.totalArticlesScraped);
    }
    
    if (updates.totalErrors !== undefined) {
      updateFields.push(`total_errors = $${paramIndex++}`);
      values.push(updates.totalErrors);
    }
    
    if (updates.jobLogs !== undefined) {
      updateFields.push(`job_logs = $${paramIndex++}`);
      values.push(updates.jobLogs);
    }
    
    if (updateFields.length === 0) return;
    
    values.push(jobId);
    const query = `UPDATE scraping_jobs SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
    
    await this.query(query, values);
  }

  /**
   * Add log entry for a scraping job
   */
  async addScrapingLog(log: Omit<ScrapingLogEntry, 'id'>): Promise<void> {
    await this.initialize();
    
    const query = `
      INSERT INTO scraping_logs (job_id, source_id, log_level, message, timestamp, additional_data)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const values = [
      log.jobId,
      log.sourceId || null,
      log.logLevel,
      log.message,
      log.timestamp,
      log.additionalData ? JSON.stringify(log.additionalData) : null
    ];
    
    await this.query(query, values);
  }

  /**
   * Insert enhanced scraped content with new fields
   */
  async insertEnhancedScrapedContent(content: Omit<ScrapedContent, 'id' | 'createdAt'>): Promise<string> {
    await this.initialize();
    
    const query = `
      INSERT INTO scraped_content (
        source_id, source_url, title, content, author, publication_date,
        content_type, language, processing_status, category, tags, 
        full_html, crawlee_classification, content_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `;
    
    const values = [
      content.sourceId,
      content.sourceUrl,
      content.title,
      content.content,
      content.author || null,
      content.publicationDate || null,
      content.contentType,
      content.language,
      content.processingStatus,
      content.category || null,
      content.tags || null,
      content.fullHtml || null,
      content.crawleeClassification ? JSON.stringify(content.crawleeClassification) : null,
      content.contentHash || null
    ];
    
    const result = await this.query<{ id: string }>(query, values);
    if (result.rows.length === 0) {
      throw new Error('Failed to insert enhanced scraped content - no ID returned');
    }
    return result.rows[0]!.id;
  }

  /**
   * Check if content exists by hash (for duplicate detection)
   */
  async contentExistsByHash(contentHash: string): Promise<boolean> {
    await this.initialize();
    
    const query = 'SELECT 1 FROM scraped_content WHERE content_hash = $1 LIMIT 1';
    const result = await this.query(query, [contentHash]);
    
    return result.rows.length > 0;
  }

  /**
   * Get enabled sources for scraping
   */
  async getEnabledSources(): Promise<NewsSource[]> {
    await this.initialize();
    
    const query = `
      SELECT id, name, domain, url, description, icon_url, is_active,
             rss_url, scraping_config, last_scraped_at, success_rate, is_enabled, created_at
      FROM sources 
      WHERE is_enabled = true AND is_active = true
      ORDER BY success_rate DESC, name ASC
    `;
    
    const result = await this.query<any>(query);
    
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
  }

  /**
   * Get last health check status
   */
  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck;
  }

  /**
   * Add compression support to scraped_content table
   */
  async addCompressionSupport(): Promise<void> {
    console.log('[Scraper DB] Adding compression support to scraped_content table...');
    
    const query = `
      DO $$
      BEGIN
        -- Add compression columns if they don't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'scraped_content' AND column_name = 'compressed_content'
        ) THEN
          ALTER TABLE scraped_content ADD COLUMN compressed_content BYTEA;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'scraped_content' AND column_name = 'compressed_html'
        ) THEN
          ALTER TABLE scraped_content ADD COLUMN compressed_html BYTEA;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'scraped_content' AND column_name = 'compression_ratio'
        ) THEN
          ALTER TABLE scraped_content ADD COLUMN compression_ratio DECIMAL(5,2);
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'scraped_content' AND column_name = 'original_size'
        ) THEN
          ALTER TABLE scraped_content ADD COLUMN original_size BIGINT;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'scraped_content' AND column_name = 'compressed_size'
        ) THEN
          ALTER TABLE scraped_content ADD COLUMN compressed_size BIGINT;
        END IF;
      END $$;
      
      -- Add indexes for compression queries
      CREATE INDEX IF NOT EXISTS idx_scraped_content_compressed ON scraped_content(compressed_content) WHERE compressed_content IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_scraped_content_compression_ratio ON scraped_content(compression_ratio) WHERE compression_ratio IS NOT NULL;
    `;
    
    await this.query(query);
    console.log('[Scraper DB] Compression support added successfully');
  }

  /**
   * Get storage statistics for cleanup manager
   */
  async getStorageStats(): Promise<{
    totalRecords: number;
    totalSize: number;
    contentSize: number;
    htmlSize: number;
    compressedSize: number;
    averageCompressionRatio: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(LENGTH(content)) as content_size,
        SUM(LENGTH(COALESCE(full_html, ''))) as html_size,
        SUM(CASE WHEN compressed_content IS NOT NULL THEN LENGTH(compressed_content) ELSE 0 END) as compressed_content_size,
        SUM(CASE WHEN compressed_html IS NOT NULL THEN LENGTH(compressed_html) ELSE 0 END) as compressed_html_size,
        AVG(compression_ratio) as avg_compression_ratio
      FROM scraped_content
    `;
    
    const result = await this.query(query);
    const row = result.rows[0];
    
    const totalRecords = parseInt(row.total_records || '0');
    const contentSize = parseInt(row.content_size || '0');
    const htmlSize = parseInt(row.html_size || '0');
    const compressedContentSize = parseInt(row.compressed_content_size || '0');
    const compressedHtmlSize = parseInt(row.compressed_html_size || '0');
    const totalSize = contentSize + htmlSize;
    const compressedSize = compressedContentSize + compressedHtmlSize;
    const averageCompressionRatio = parseFloat(row.avg_compression_ratio || '0');
    
    return {
      totalRecords,
      totalSize,
      contentSize,
      htmlSize,
      compressedSize,
      averageCompressionRatio
    };
  }

  /**
   * Get content candidates for compression
   */
  async getCompressionCandidates(limit: number = 100): Promise<{
    id: string;
    content: string;
    fullHtml: string;
    contentSize: number;
    htmlSize: number;
  }[]> {
    const query = `
      SELECT 
        id,
        content,
        full_html,
        LENGTH(content) as content_size,
        LENGTH(COALESCE(full_html, '')) as html_size
      FROM scraped_content
      WHERE compressed_content IS NULL
      AND LENGTH(content) > 500
      ORDER BY LENGTH(content) DESC
      LIMIT $1
    `;
    
    const result = await this.query(query, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      fullHtml: row.full_html,
      contentSize: parseInt(row.content_size),
      htmlSize: parseInt(row.html_size)
    }));
  }

  /**
   * Update content with compression data
   */
  async updateContentCompression(
    id: string,
    compressedContent: Buffer,
    compressedHtml: Buffer | null,
    originalSize: number,
    compressedSize: number
  ): Promise<void> {
    const compressionRatio = originalSize > 0 ? (compressedSize / originalSize) : 0;
    
    const query = `
      UPDATE scraped_content 
      SET 
        compressed_content = $1,
        compressed_html = $2,
        original_size = $3,
        compressed_size = $4,
        compression_ratio = $5
      WHERE id = $6
    `;
    
    await this.query(query, [
      compressedContent,
      compressedHtml,
      originalSize,
      compressedSize,
      compressionRatio,
      id
    ]);
  }

  /**
   * Get duplicate content candidates
   */
  async getDuplicateCandidates(limit: number = 100): Promise<{
    contentHash: string;
    count: number;
    ids: string[];
    totalSize: number;
  }[]> {
    const query = `
      SELECT 
        content_hash,
        COUNT(*) as count,
        ARRAY_AGG(id::text) as ids,
        SUM(LENGTH(content) + LENGTH(COALESCE(full_html, ''))) as total_size
      FROM scraped_content
      WHERE content_hash IS NOT NULL
      GROUP BY content_hash
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT $1
    `;
    
    const result = await this.query(query, [limit]);
    
    return result.rows.map(row => ({
      contentHash: row.content_hash,
      count: parseInt(row.count),
      ids: row.ids,
      totalSize: parseInt(row.total_size)
    }));
  }

  /**
   * Delete content by IDs
   */
  async deleteContentByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    
    const query = 'DELETE FROM scraped_content WHERE id = ANY($1)';
    const result = await this.query(query, [ids]);
    
    return result.rowCount || 0;
  }

  /**
   * Enhanced cleanup old content with archival support
   */
  async cleanupOldContentWithArchival(
    daysToKeep: number = 30,
    archiveBeforeDelete: boolean = true
  ): Promise<{ deleted: number; archived: number; spaceSaved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Get content to be cleaned up
    const sizeQuery = `
      SELECT 
        COUNT(*) as count,
        SUM(LENGTH(content)) as content_size,
        SUM(LENGTH(COALESCE(full_html, ''))) as html_size
      FROM scraped_content 
      WHERE created_at < $1
      AND (NOT $2 OR id NOT IN (SELECT original_id FROM scraped_content_archive))
    `;
    
    const sizeResult = await this.query<{
      count: string;
      content_size: string;
      html_size: string;
    }>(sizeQuery, [cutoffDate, archiveBeforeDelete]);

    const count = parseInt(sizeResult.rows[0]?.count || '0');
    const contentSize = parseInt(sizeResult.rows[0]?.content_size || '0');
    const htmlSize = parseInt(sizeResult.rows[0]?.html_size || '0');
    const spaceSaved = contentSize + htmlSize;

    if (count === 0) {
      return { deleted: 0, archived: 0, spaceSaved: 0 };
    }

    let archivedCount = 0;
    
    // Archive content if requested
    if (archiveBeforeDelete) {
      const archiveQuery = `
        INSERT INTO scraped_content_archive (
          original_id, source_id, title, content, full_html, metadata, created_at
        )
        SELECT 
          id, source_id, title, content, full_html,
          json_build_object(
            'sourceId', source_id,
            'title', title,
            'createdAt', created_at,
            'archivedAt', NOW(),
            'originalSize', LENGTH(content) + LENGTH(COALESCE(full_html, ''))
          ),
          created_at
        FROM scraped_content
        WHERE created_at < $1
        AND id NOT IN (SELECT original_id FROM scraped_content_archive)
        ON CONFLICT (original_id) DO NOTHING
      `;
      
      const archiveResult = await this.query(archiveQuery, [cutoffDate]);
      archivedCount = archiveResult.rowCount || 0;
    }

    // Delete old content
    const deleteQuery = `
      DELETE FROM scraped_content 
      WHERE created_at < $1
      AND (NOT $2 OR id IN (SELECT original_id FROM scraped_content_archive))
    `;
    
    const deleteResult = await this.query(deleteQuery, [cutoffDate, archiveBeforeDelete]);
    const deletedCount = deleteResult.rowCount || 0;

    console.log(`[Scraper DB] Cleaned up ${deletedCount} old records (${archivedCount} archived), saved ${(spaceSaved / 1024 / 1024).toFixed(2)}MB`);
    
    return {
      deleted: deletedCount,
      archived: archivedCount,
      spaceSaved
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.connectionHealthCheckInterval) {
      clearInterval(this.connectionHealthCheckInterval);
      this.connectionHealthCheckInterval = null;
    }
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('🔌 [Scraper DB] Enhanced connection pool closed');
    }
  }
}

// Export singleton instance
export const scraperDb = new ScraperDatabase();

// Export database client for resource monitor
export const getDatabaseClient = () => scraperDb; 