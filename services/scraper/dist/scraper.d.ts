import { ScrapingJob, TriggerScrapingRequest } from './types';
/**
 * Main scraper service for Veritas platform
 * Handles RSS feed parsing and article content extraction
 */
export declare class VeritasScraper {
    private rssParser;
    private crawler;
    private currentJob;
    private readonly sources;
    constructor();
    /**
     * Main scraping method
     */
    scrapeContent(request: TriggerScrapingRequest): Promise<ScrapingJob>;
    /**
     * Setup news sources in database
     */
    private setupSources;
    /**
     * Process RSS feed for a single source
     */
    private processSingleSource;
    /**
     * Process individual RSS item
     */
    private processRSSItem;
    /**
     * Scrape full article content from URL
     */
    private scrapeArticleContent;
    /**
     * Crawlee request handler for article content extraction
     */
    private handleArticleScraping;
    /**
     * Log scraping activity
     */
    private log;
    /**
     * Get current job status
     */
    getCurrentJob(): ScrapingJob | null;
}
export declare const scraper: VeritasScraper;
