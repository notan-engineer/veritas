import { NewsSource, ScrapedContent } from './types';
/**
 * Database client for Veritas scraper service
 * Connects to Railway PostgreSQL database
 */
declare class ScraperDatabase {
    private pool;
    private isInitialized;
    /**
     * Initialize database connection pool
     */
    private initialize;
    /**
     * Execute a query
     */
    query<T = any>(text: string, params?: unknown[]): Promise<{
        rows: T[];
        rowCount: number | null;
    }>;
    /**
     * Upsert news source
     */
    upsertSource(source: Omit<NewsSource, 'id'>): Promise<number>;
    /**
     * Insert scraped content
     */
    insertScrapedContent(content: Omit<ScrapedContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>;
    /**
     * Check if content already exists by URL
     */
    contentExists(sourceUrl: string): Promise<boolean>;
    /**
     * Get source by domain
     */
    getSourceByDomain(domain: string): Promise<NewsSource | null>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
}
export declare const scraperDb: ScraperDatabase;
export {};
