import { CheerioCrawler, Configuration, CheerioCrawlingContext } from 'crawlee';
import RSSParser, { Item } from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { scraperDb } from './database';
import { 
  RSSItem, 
  ScrapedArticle, 
  ScrapingJob, 
  ScrapingLog, 
  NewsSource, 
  TriggerScrapingRequest 
} from './types';

/**
 * Main scraper service for Veritas platform
 * Handles RSS feed parsing and article content extraction
 */
export class VeritasScraper {
  private rssParser: RSSParser;
  private crawler: CheerioCrawler;
  private currentJob: ScrapingJob | null = null;

  // Predefined news sources
  private readonly sources: Omit<NewsSource, 'id'>[] = [
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

  constructor() {
    this.rssParser = new RSSParser();
    
    // Configure Crawlee for minimal, respectful scraping
    this.crawler = new CheerioCrawler({
      requestHandlerTimeoutSecs: 30,
      maxRequestRetries: 2,
      requestHandler: this.handleArticleScraping.bind(this),
    });
  }

  /**
   * Main scraping method
   */
  async scrapeContent(request: TriggerScrapingRequest): Promise<ScrapingJob> {
    const jobId = uuidv4();
    
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

    } catch (error) {
      this.currentJob.status = 'failed';
      this.currentJob.endTime = new Date();
      this.log('error', `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`, jobId);
    }

    return this.currentJob;
  }

  /**
   * Setup news sources in database
   */
  private async setupSources(): Promise<void> {
    for (const source of this.sources) {
      try {
        await scraperDb.upsertSource(source);
        this.log('info', `Source setup completed: ${source.name}`);
      } catch (error) {
        this.log('error', `Failed to setup source ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Process RSS feed for a single source
   */
  private async processSingleSource(sourceName: string): Promise<void> {
    const source = this.sources.find(s => 
      s.name.toLowerCase() === sourceName.toLowerCase() || 
      s.domain.includes(sourceName.toLowerCase())
    );

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
      const dbSource = await scraperDb.getSourceByDomain(source.domain);
      if (!dbSource || !dbSource.id) {
        throw new Error(`Database source not found for ${source.domain}`);
      }

      // Process articles (limited by maxArticles)
      const itemsToProcess = feed.items.slice(0, this.currentJob!.maxArticles);
      
      for (const item of itemsToProcess) {
        await this.processRSSItem(item, dbSource.id);
      }

    } catch (error) {
      this.currentJob!.results.errors++;
      this.log('error', `Failed to process source ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process individual RSS item
   */
  private async processRSSItem(item: Item, sourceId: number): Promise<void> {
    if (!item.link) {
      this.log('warn', 'RSS item missing link, skipping');
      return;
    }

    try {
      // Check if content already exists
      const exists = await scraperDb.contentExists(item.link);
      if (exists) {
        this.log('info', `Content already exists, skipping: ${item.link}`);
        return;
      }

      // Scrape full article content
      const article = await this.scrapeArticleContent(item);
      
      if (article) {
        // Store in database
        await scraperDb.insertScrapedContent({
          sourceId,
          sourceUrl: article.sourceUrl,
          title: article.title,
          content: article.content,
          author: article.author,
          publicationDate: article.publicationDate,
          contentType: 'article',
          language: article.language,
          processingStatus: 'completed'
        });

        this.currentJob!.results.articlesStored++;
        this.log('info', `Article stored: ${article.title.substring(0, 50)}...`);
      }

    } catch (error) {
      this.currentJob!.results.errors++;
      this.log('error', `Failed to process RSS item ${item.link}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scrape full article content from URL
   */
  private async scrapeArticleContent(rssItem: Item): Promise<ScrapedArticle | null> {
    try {
      this.currentJob!.results.articlesScraped++;

      // Use Crawlee to scrape the article
      await this.crawler.addRequests([{
        url: rssItem.link,
        userData: { rssItem }
      }]);

      await this.crawler.run();

      // Return basic article data (enhanced by crawler handler)
      return {
        sourceUrl: rssItem.link || '',
        title: rssItem.title || 'No title',
        content: (rssItem as any).contentSnippet || (rssItem as any).content || rssItem.summary || 'No content available',
        author: rssItem.creator || (rssItem as any)['dc:creator'] || undefined,
        publicationDate: rssItem.pubDate ? new Date(rssItem.pubDate) : undefined,
        language: 'en'
      };

    } catch (error) {
      this.log('error', `Article scraping failed for ${rssItem.link}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Crawlee request handler for article content extraction
   */
  private async handleArticleScraping({ request, $ }: CheerioCrawlingContext): Promise<void> {
    try {
      // Basic content extraction - can be enhanced later
      const title = $('h1').first().text().trim() || 
                   $('title').text().trim() || 
                   request.userData.rssItem.title;

      const content = $('article').text().trim() || 
                     $('.content').text().trim() || 
                     $('.story-body').text().trim() ||
                     $('main').text().trim() ||
                     request.userData.rssItem.contentSnippet;

      this.log('info', `Content extracted from ${request.url}: ${title?.substring(0, 50)}...`);

      // Store enhanced content (this is basic - can be improved)
      request.userData.extractedContent = {
        title,
        content,
        extractedAt: new Date()
      };

    } catch (error) {
      this.log('warn', `Content extraction failed for ${request.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Log scraping activity
   */
  private log(level: 'info' | 'warn' | 'error', message: string, source?: string): void {
    const logEntry: ScrapingLog = {
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
  getCurrentJob(): ScrapingJob | null {
    return this.currentJob;
  }
}

// Export singleton instance
export const scraper = new VeritasScraper(); 