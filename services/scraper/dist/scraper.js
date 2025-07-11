"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraper = exports.VeritasScraper = void 0;
const crawlee_1 = require("crawlee");
const rss_parser_1 = __importDefault(require("rss-parser"));
const uuid_1 = require("uuid");
const database_1 = require("./database");
/**
 * Main scraper service for Veritas platform
 * Handles RSS feed parsing and article content extraction
 */
class VeritasScraper {
    constructor() {
        this.currentJob = null;
        this.scrapedResults = new Map();
        // Predefined news sources
        this.sources = [
            {
                name: 'CNN',
                domain: 'cnn.com',
                url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
                description: 'CNN Top Stories RSS Feed',
                isActive: true
            },
            {
                name: 'Fox News',
                domain: 'foxnews.com',
                url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
                description: 'Fox News Latest RSS Feed',
                isActive: true
            }
        ];
        this.rssParser = new rss_parser_1.default();
        // Configure Crawlee for minimal, respectful scraping
        this.crawler = new crawlee_1.CheerioCrawler({
            requestHandlerTimeoutSecs: 30,
            maxRequestRetries: 2,
            requestHandler: this.handleArticleScraping.bind(this),
        });
    }
    /**
     * Main scraping method
     */
    async scrapeContent(request) {
        const jobId = (0, uuid_1.v4)();
        this.currentJob = {
            id: jobId,
            sources: request.sources,
            maxArticles: request.maxArticles || 3,
            status: 'running',
            startTime: new Date(),
            logs: [],
            results: {
                articlesScraped: 0,
                articlesStored: 0,
                errors: 0
            }
        };
        this.log('info', 'Starting scraping job', jobId);
        try {
            // Setup sources in database
            await this.setupSources();
            // Process each requested source
            for (const sourceName of request.sources) {
                await this.processSingleSource(sourceName);
            }
            this.currentJob.status = 'completed';
            this.currentJob.endTime = new Date();
            this.log('info', `Scraping completed. Articles: ${this.currentJob.results.articlesStored}`, jobId);
        }
        catch (error) {
            this.currentJob.status = 'failed';
            this.currentJob.endTime = new Date();
            this.log('error', `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`, jobId);
        }
        return this.currentJob;
    }
    /**
     * Setup news sources in database
     */
    async setupSources() {
        for (const source of this.sources) {
            try {
                await database_1.scraperDb.upsertSource(source);
                this.log('info', `Source setup completed: ${source.name}`);
            }
            catch (error) {
                this.log('error', `Failed to setup source ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    /**
     * Process RSS feed for a single source
     */
    async processSingleSource(sourceName) {
        const source = this.sources.find(s => s.name.toLowerCase() === sourceName.toLowerCase() ||
            s.domain.includes(sourceName.toLowerCase()));
        if (!source) {
            this.log('warn', `Source not found: ${sourceName}`);
            return;
        }
        this.log('info', `Processing RSS feed: ${source.name}`);
        try {
            // Parse RSS feed
            const feed = await this.rssParser.parseURL(source.url);
            this.log('info', `RSS feed parsed. Found ${feed.items.length} items`, source.domain);
            // Get database source
            const dbSource = await database_1.scraperDb.getSourceByDomain(source.domain);
            if (!dbSource || !dbSource.id) {
                throw new Error(`Database source not found for ${source.domain}`);
            }
            // Process articles (limited by maxArticles)
            const itemsToProcess = feed.items.slice(0, this.currentJob.maxArticles);
            // Filter out items that already exist in database
            const newItems = [];
            for (const item of itemsToProcess) {
                if (item.link && !(await database_1.scraperDb.contentExists(item.link))) {
                    newItems.push(item);
                }
                else {
                    this.log('info', `Content already exists, skipping: ${item.link}`);
                }
            }
            if (newItems.length > 0) {
                // Batch process all new articles
                const scrapedArticles = await this.scrapeMultipleArticles(newItems);
                // Store results in database
                for (const article of scrapedArticles) {
                    try {
                        await database_1.scraperDb.insertScrapedContent({
                            sourceId: dbSource.id,
                            sourceUrl: article.sourceUrl,
                            title: article.title,
                            content: article.content,
                            author: article.author,
                            publicationDate: article.publicationDate,
                            contentType: 'article',
                            language: article.language,
                            processingStatus: 'completed'
                        });
                        this.currentJob.results.articlesStored++;
                        this.log('info', `Article stored: ${article.title.substring(0, 50)}...`);
                    }
                    catch (error) {
                        this.currentJob.results.errors++;
                        this.log('error', `Failed to store article ${article.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            }
        }
        catch (error) {
            this.currentJob.results.errors++;
            this.log('error', `Failed to process source ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Scrape multiple articles in a batch for better performance
     */
    async scrapeMultipleArticles(rssItems) {
        if (rssItems.length === 0) {
            return [];
        }
        this.log('info', `Batch processing ${rssItems.length} articles`);
        // Clear previous results
        this.scrapedResults.clear();
        // Create requests for all articles
        const requests = rssItems
            .filter(item => item.link)
            .map(item => ({
            url: item.link,
            userData: { rssItem: item }
        }));
        if (requests.length === 0) {
            return [];
        }
        try {
            // Add all requests to crawler
            await this.crawler.addRequests(requests);
            // Run crawler once for all articles
            await this.crawler.run();
            // Update counters
            this.currentJob.results.articlesScraped += requests.length;
            // Return collected results
            return Array.from(this.scrapedResults.values());
        }
        catch (error) {
            this.log('error', `Batch scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.currentJob.results.errors += requests.length;
            return [];
        }
    }
    /**
     * Crawlee request handler for article content extraction
     */
    async handleArticleScraping({ request, $ }) {
        try {
            const rssItem = request.userData.rssItem;
            // Extract enhanced content from webpage
            const extractedTitle = $('h1').first().text().trim() ||
                $('title').text().trim();
            const extractedContent = $('article').text().trim() ||
                $('.content').text().trim() ||
                $('.story-body').text().trim() ||
                $('main').text().trim();
            // Create scraped article with enhanced content
            const scrapedArticle = {
                sourceUrl: request.url,
                title: extractedTitle || rssItem.title || 'No title',
                content: extractedContent || rssItem.contentSnippet || rssItem.content || rssItem.summary || 'No content available',
                author: rssItem.creator || rssItem['dc:creator'] || undefined,
                publicationDate: rssItem.pubDate ? new Date(rssItem.pubDate) : undefined,
                language: 'en'
            };
            // Store result in Map for collection
            this.scrapedResults.set(request.url, scrapedArticle);
            this.log('info', `Content extracted from ${request.url}: ${scrapedArticle.title.substring(0, 50)}...`);
        }
        catch (error) {
            this.log('warn', `Content extraction failed for ${request.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Store fallback article data even if extraction failed
            const rssItem = request.userData.rssItem;
            const fallbackArticle = {
                sourceUrl: request.url,
                title: rssItem.title || 'No title',
                content: rssItem.contentSnippet || rssItem.content || rssItem.summary || 'No content available',
                author: rssItem.creator || rssItem['dc:creator'] || undefined,
                publicationDate: rssItem.pubDate ? new Date(rssItem.pubDate) : undefined,
                language: 'en'
            };
            this.scrapedResults.set(request.url, fallbackArticle);
        }
    }
    /**
     * Log scraping activity
     */
    log(level, message, source) {
        const logEntry = {
            timestamp: new Date(),
            level,
            message,
            source
        };
        if (this.currentJob) {
            this.currentJob.logs.push(logEntry);
        }
        console.log(`[Scraper ${level.toUpperCase()}] ${message}${source ? ` (${source})` : ''}`);
    }
    /**
     * Get current job status
     */
    getCurrentJob() {
        return this.currentJob;
    }
}
exports.VeritasScraper = VeritasScraper;
// Export singleton instance
exports.scraper = new VeritasScraper();
