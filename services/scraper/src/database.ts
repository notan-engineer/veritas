import { Pool, PoolClient } from 'pg';
import { NewsSource, ScrapedContent } from './types';

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
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      const url = new URL(process.env.DATABASE_URL);
      this.pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        // No SSL configuration - let Railway handle it internally
        max: 5, // Smaller pool for scraper service
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      // Test connection
      await this.pool.query('SELECT 1');
      this.isInitialized = true;
      console.log('✅ [Scraper DB] Database connection pool initialized');
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
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
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