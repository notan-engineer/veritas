import { Pool, PoolClient } from 'pg';
import { 
  NewsSource, 
  ScrapedContent, 
  EnhancedScrapingJob, 
  ScrapingLogEntry, 
  SourceScrapingConfig,
  CrawleeClassification 
} from './types';

/**
 * Database client for Veritas scraper service
 * Connects to Railway PostgreSQL database
 */
class ScraperDatabase {
  private pool: Pool | null = null;
  private isInitialized = false;

  /**
   * Initialize database connection pool
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }

    console.log('[Scraper DB] Initializing connection pool...');
    console.log(`[Scraper DB] DATABASE_URL format: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`[Scraper DB] Connecting to: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
      console.log(`[Scraper DB] SSL Configuration: { rejectUnauthorized: false }`);
      
      this.pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        ssl: { rejectUnauthorized: false }, // Allow Railway's self-signed certificates
        max: 5, // Smaller pool for scraper service
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      // Test connection
      console.log('[Scraper DB] Testing database connection...');
      await this.pool.query('SELECT 1');
      this.isInitialized = true;
      console.log('✅ [Scraper DB] Database connection pool initialized successfully');
    } catch (error) {
      console.error('❌ [Scraper DB] Failed to connect:', error);
      this.pool = null;
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a query
   */
  async query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number | null }> {
    await this.initialize();
    
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('[Scraper DB] Query error:', error);
      console.error('[Scraper DB] Query:', text);
      throw error;
    }
  }

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
    return result.rows[0].id;
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
    return result.rows[0].id;
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
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('🔌 [Scraper DB] Connection pool closed');
    }
  }
}

// Export singleton instance
export const scraperDb = new ScraperDatabase(); 