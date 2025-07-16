import { CheerioCrawler, Configuration, CheerioCrawlingContext } from 'crawlee';
import RSSParser, { Item } from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { scraperDb } from './database';
import { jobManager } from './job-manager';
import { contentClassifier } from './content-classifier';
import { duplicateDetector } from './duplicate-detector';
import { sourceManager } from './source-manager';
import { resourceMonitor } from './resource-monitor';
import { cleanupManager } from './cleanup-manager';
import { enhancedLogger } from './enhanced-logger';
import { 
  RSSItem, 
  ScrapedArticle, 
  ScrapingJob, 
  ScrapingLog, 
  NewsSource, 
  TriggerScrapingRequest 
} from './types';

/**
 * Enhanced scraper service for Veritas platform
 * Handles RSS feed parsing, content classification, and duplicate detection
 */
export class VeritasScraper {
  private rssParser: RSSParser;
  private crawler: CheerioCrawler;
  private currentJobId: string | null = null;
  private scrapedResults: Map<string, ScrapedArticle> = new Map();

  // Note: Sources are now managed dynamically via sourceManager
  // Default sources will be initialized on startup if none exist

  constructor() {
    this.rssParser = new RSSParser();
    
    // Configure Crawlee for enhanced scraping with performance optimizations
    this.crawler = new CheerioCrawler({
      requestHandlerTimeoutSecs: 45,
      maxRequestRetries: 3,
      maxConcurrency: 5, // Limit concurrent requests for better resource management
      requestHandler: this.handleEnhancedArticleScraping.bind(this),
      maxRequestsPerMinute: 120, // Rate limiting
      autoscaledPoolOptions: {
        maxConcurrency: 5,
        minConcurrency: 1,
        systemStatusOptions: {
          maxEventLoopOverloadedRatio: 0.8,
          maxCpuOverloadedRatio: 0.9,
          maxMemoryOverloadedRatio: 0.8,
        },
      },
    });

    // Set up job manager event listeners
    this.setupJobManagerIntegration();
    
    // Initialize source manager
    this.initializeSourceManager();
    
    // Start resource monitoring
    this.initializeResourceMonitoring();
    
    // Initialize cleanup manager
    this.initializeCleanupManager();
  }

  /**
   * Setup job manager integration
   */
  private setupJobManagerIntegration(): void {
    console.log('[VeritasScraper] Setting up job manager integration and event listeners');
    
    // Listen for source processing requests from job manager
    jobManager.on('process-source', async (jobId: string, sourceName: string) => {
      console.log(`[VeritasScraper] Received process-source event for job ${jobId}, source: ${sourceName}`);
      this.currentJobId = jobId;
      
      try {
        console.log(`[VeritasScraper] Starting processSingleSource for ${sourceName}`);
        await this.processSingleSource(sourceName);
        console.log(`[VeritasScraper] Successfully processed source ${sourceName}, signaling completion`);
        await jobManager.signalSourceCompleted(jobId, sourceName);
        console.log(`[VeritasScraper] Signaled completion for source ${sourceName}`);
      } catch (error) {
        console.error(`[VeritasScraper] Error processing source ${sourceName}:`, error);
        await jobManager.signalSourceCompleted(jobId, sourceName, error instanceof Error ? error : new Error('Unknown error'));
        console.log(`[VeritasScraper] Signaled completion with error for source ${sourceName}`);
      }
    });
    
    console.log('[VeritasScraper] Job manager integration completed');
  }

  /**
   * Initialize source manager
   */
  private initializeSourceManager(): void {
    // Start source health monitoring
    sourceManager.startHealthMonitoring();
    
    console.log('[VeritasScraper] Source manager initialized');
  }

  /**
   * Initialize resource monitoring
   */
  private initializeResourceMonitoring(): void {
    // Start resource monitoring with 60-second intervals
    resourceMonitor.startMonitoring(60000);
    
    // Listen for resource alerts
    resourceMonitor.on('alert', (alert) => {
      console.warn(`[VeritasScraper] Resource alert: ${alert.message}`);
      
      // Log critical alerts
      if (alert.level === 'critical') {
        console.error(`[VeritasScraper] Critical resource alert: ${alert.message}`, {
          type: alert.type,
          timestamp: alert.timestamp,
          metrics: alert.metrics,
        });
      }
    });
    
    // Listen for metrics updates
    resourceMonitor.on('metrics', (metrics) => {
      // Record performance metrics - use simple count for now
      resourceMonitor.recordJobCount(this.currentJobId ? 1 : 0);
      resourceMonitor.recordArticleCount(this.scrapedResults.size);
    });
    
    console.log('[VeritasScraper] Resource monitoring initialized');
  }

  /**
   * Initialize cleanup manager
   */
  private async initializeCleanupManager(): Promise<void> {
    try {
      // Initialize cleanup manager
      await cleanupManager.initialize();
      
      // Add compression support to database
      await scraperDb.addCompressionSupport();
      
      // Set up cleanup manager event listeners
      cleanupManager.on('cleanup-completed', (result) => {
        console.log(`[VeritasScraper] Cleanup completed: ${(result.totalSpaceSaved / 1024 / 1024).toFixed(2)}MB saved`);
      });
      
      cleanupManager.on('cleanup-error', (error) => {
        console.error(`[VeritasScraper] Cleanup error: ${error.error}`);
      });
      
      console.log('[VeritasScraper] Cleanup manager initialized');
    } catch (error) {
      console.error('[VeritasScraper] Failed to initialize cleanup manager:', error);
    }
  }

  /**
   * Enhanced scraping method using job management
   */
  async scrapeContent(request: TriggerScrapingRequest): Promise<{ jobId: string; message: string }> {
    try {
      // Setup sources in database first
      await this.setupSources();

      // Queue job with job manager
      const jobId = await jobManager.queueJob(request);
      
      return {
        jobId,
        message: `Scraping job ${jobId} queued for ${request.sources.length} sources`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[VeritasScraper] Failed to queue scraping job:', errorMessage);
      
      return {
        jobId: '',
        message: `Failed to start scraping job: ${errorMessage}`
      };
    }
  }

  /**
   * Setup default news sources in database if none exist
   */
  private async setupSources(): Promise<void> {
    try {
      // Check if any sources exist
      const existingSources = await sourceManager.getAllSources();
      
      if (existingSources.length === 0) {
        console.log('[VeritasScraper] No sources found, creating default sources...');
        
        // Create default sources
        const defaultSources = [
          {
            name: 'CNN',
            domain: 'cnn.com',
            url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
            rssUrl: 'http://rss.cnn.com/rss/cnn_topstories.rss',
            description: 'CNN Top Stories RSS Feed'
          },
          {
            name: 'Fox News',
            domain: 'foxnews.com',
            url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
            rssUrl: 'https://moxie.foxnews.com/google-publisher/latest.xml',
            description: 'Fox News Latest RSS Feed'
          },
          {
            name: 'BBC News',
            domain: 'bbc.com',
            url: 'http://feeds.bbci.co.uk/news/rss.xml',
            rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
            description: 'BBC News RSS Feed'
          },
          {
            name: 'Reuters',
            domain: 'reuters.com',
            url: 'https://feeds.reuters.com/reuters/topNews',
            rssUrl: 'https://feeds.reuters.com/reuters/topNews',
            description: 'Reuters Top News RSS Feed'
          }
        ];

        for (const sourceData of defaultSources) {
          try {
            await sourceManager.createSource(sourceData);
            console.log(`[VeritasScraper] Default source created: ${sourceData.name}`);
          } catch (error) {
            console.error(`[VeritasScraper] Failed to create default source ${sourceData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } else {
        console.log(`[VeritasScraper] Found ${existingSources.length} existing sources`);
      }
    } catch (error) {
      console.error('[VeritasScraper] Failed to setup sources:', error);
    }
  }

  /**
   * Process RSS feed for a single source with enhanced capabilities
   */
  private async processSingleSource(sourceName: string): Promise<void> {
    console.log(`[VeritasScraper] Starting processSingleSource for: ${sourceName}`);
    
    const startTime = Date.now();
    let source;
    
    try {
      // Get active sources from source manager
      console.log(`[VeritasScraper] Fetching all sources from source manager...`);
      const allSources = await sourceManager.getAllSources({ 
        activeOnly: true, 
        enabledOnly: true 
      });
      
      console.log(`[VeritasScraper] Found ${allSources.length} active sources`);
      
      source = allSources.find(s => 
        s.name.toLowerCase() === sourceName.toLowerCase() || 
        s.domain.includes(sourceName.toLowerCase())
      );

      if (!source) {
        console.error(`[VeritasScraper] Source not found: ${sourceName}. Available sources: ${allSources.map(s => s.name).join(', ')}`);
        return;
      }

      console.log(`[VeritasScraper] Found source: ${source.name} (${source.domain}), RSS URL: ${source.rssUrl}`);
      
      // Enhanced logging for source start
      await enhancedLogger.logSourceStart(
        this.currentJobId || 'unknown',
        source.id || 'unknown',
        source.name,
        source.rssUrl || ''
      );
      
    } catch (error) {
      console.error(`[VeritasScraper] Error in source lookup for ${sourceName}:`, error);
      return;
    }

    console.log(`[VeritasScraper] Processing RSS feed: ${source.name}`);

    try {
      // Parse RSS feed
      const rssStartTime = Date.now();
      const rssUrl = source.rssUrl || '';
      if (!rssUrl) {
        throw new Error(`No RSS URL configured for source ${source.name}`);
      }
      const feed = await this.rssParser.parseURL(rssUrl);
      const rssDuration = Date.now() - rssStartTime;
      
      console.log(`[VeritasScraper] RSS feed parsed. Found ${feed.items.length} items from ${source.domain}`);
      
      // Enhanced logging for RSS parse result
      await enhancedLogger.logRSSParseResult(
        this.currentJobId || 'unknown',
        source.id || 'unknown',
        source.name,
        feed.items.length,
        rssDuration
      );

      // Get database source
      const dbSource = await scraperDb.getSourceByDomain(source.domain);
      if (!dbSource || !dbSource.id) {
        throw new Error(`Database source not found for ${source.domain}`);
      }

      // Process articles (limited by maxArticles - default 3)
      const maxArticles = 3; // Default value
      const itemsToProcess = feed.items.slice(0, maxArticles);
      
      console.log(`[VeritasScraper] Processing ${itemsToProcess.length} items (max: ${maxArticles})`);
      
      // Enhanced duplicate detection
      const newItems: Item[] = [];
      for (const item of itemsToProcess) {
        console.log(`[VeritasScraper] Checking item: ${item.title}, link: ${item.link}`);
        
        if (item.link) {
          console.log(`[VeritasScraper] Running duplicate check for: ${item.link}`);
          
          const duplicateCheck = await duplicateDetector.checkForDuplicate({
            url: item.link,
            title: item.title || 'No title',
            content: (item as any).contentSnippet || (item as any).content || item.summary || 'No content',
            author: item.creator || (item as any)['dc:creator'],
            publishDate: item.pubDate ? new Date(item.pubDate) : undefined
          });

          console.log(`[VeritasScraper] Duplicate check result: isDuplicate=${duplicateCheck.isDuplicate}, type=${duplicateCheck.duplicateType}, reason=${duplicateCheck.reason}`);

          if (!duplicateCheck.isDuplicate) {
            newItems.push(item);
            console.log(`[VeritasScraper] Added item to processing queue: ${item.title}`);
          } else {
            console.log(`[VeritasScraper] Duplicate content detected (${duplicateCheck.duplicateType}): ${item.link} - ${duplicateCheck.reason}`);
          }
        } else {
          console.log(`[VeritasScraper] Skipping item with no link: ${item.title}`);
        }
      }

      console.log(`[VeritasScraper] After duplicate filtering: ${newItems.length} new items to process`);

      if (newItems.length > 0) {
        // Batch process all new articles with enhanced scraping
        const scrapedArticles = await this.scrapeMultipleArticles(newItems);
        
        // Store results in database with enhanced schema using batch operations
        const contentToInsert = scrapedArticles.map(article => ({
          sourceId: dbSource.id!,
          sourceUrl: article.sourceUrl,
          title: article.title,
          content: article.content,
          author: article.author,
          publicationDate: article.publicationDate,
          contentType: 'article' as const,
          language: article.language,
          processingStatus: 'completed' as const,
          category: article.category,
          tags: article.tags,
          fullHtml: article.fullHtml,
          crawleeClassification: article.crawleeClassification,
          contentHash: article.contentHash
        }));

        console.log(`[VeritasScraper] Batch inserting ${contentToInsert.length} articles`);
        
        // Use batch insert for better performance
        const batchResult = await scraperDb.batchInsertScrapedContent(contentToInsert);
        
        const articlesProcessed = batchResult.successful;
        const errors = batchResult.failed;
        
        console.log(`[VeritasScraper] Batch insert completed: ${articlesProcessed} successful, ${errors} failed`);
        
        // Log any batch errors
        if (batchResult.errors.length > 0) {
          console.error(`[VeritasScraper] Batch insert errors:`, batchResult.errors);
        }
        
        // Record metrics for resource monitoring
        resourceMonitor.recordArticleCount(articlesProcessed);
        if (errors > 0) {
          resourceMonitor.recordErrorCount(errors);
        }

        // Update job progress
        if (this.currentJobId) {
          await jobManager.updateJobProgress(this.currentJobId, articlesProcessed, errors);
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[VeritasScraper] Failed to process source ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Enhanced logging for RSS parse error
      await enhancedLogger.logRSSParseResult(
        this.currentJobId || 'unknown',
        source.id || 'unknown',
        source.name,
        0,
        duration,
        error instanceof Error ? error : new Error('Unknown error')
      );
      
      // Update job progress with error
      if (this.currentJobId) {
        await jobManager.updateJobProgress(this.currentJobId, 0, 1);
      }
    }
  }

  /**
   * Scrape multiple articles in a batch with enhanced processing
   */
  private async scrapeMultipleArticles(rssItems: Item[]): Promise<ScrapedArticle[]> {
    if (rssItems.length === 0) {
      return [];
    }

    console.log(`[VeritasScraper] Batch processing ${rssItems.length} articles`);
    
    // Clear previous results
    this.scrapedResults.clear();

    // Create requests for all articles
    const requests = rssItems
      .filter(item => item.link)
      .map(item => ({
        url: item.link!,
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
      
      // Return collected results
      return Array.from(this.scrapedResults.values());
      
    } catch (error) {
      console.error(`[VeritasScraper] Batch scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Enhanced Crawlee request handler for article content extraction with classification
   */
  private async handleEnhancedArticleScraping({ request, $ }: CheerioCrawlingContext): Promise<void> {
    try {
      const rssItem = request.userData.rssItem;
      
      // Use content classifier to extract and classify content
      const classification = await contentClassifier.classifyContent($, request.url);
      
      // Generate content hash for duplicate detection
      const contentItem = {
        url: request.url,
        title: classification.extractedContent?.title || rssItem.title || 'No title',
        content: classification.extractedContent?.content || (rssItem as any).contentSnippet || (rssItem as any).content || rssItem.summary || 'No content available',
        author: classification.extractedContent?.author || rssItem.creator || (rssItem as any)['dc:creator'],
        publishDate: classification.extractedContent?.publishDate || (rssItem.pubDate ? new Date(rssItem.pubDate) : undefined)
      };
      
      const contentHash = duplicateDetector.generateContentHash(contentItem);

      // Create enhanced scraped article
      const scrapedArticle: ScrapedArticle = {
        sourceUrl: request.url,
        title: contentItem.title,
        content: contentItem.content,
        author: contentItem.author,
        publicationDate: contentItem.publishDate,
        language: classification.extractedContent?.language || 'en',
        category: classification.category,
        tags: classification.tags,
        fullHtml: $('html').html() || undefined,
        crawleeClassification: classification.crawleeClassification,
        contentHash: contentHash
      };

      // Store result in Map for collection
      this.scrapedResults.set(request.url, scrapedArticle);

      console.log(`[VeritasScraper] Enhanced content extracted from ${request.url}: ${scrapedArticle.title.substring(0, 50)}... (${classification.contentType})`);

    } catch (error) {
      console.warn(`[VeritasScraper] Enhanced content extraction failed for ${request.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Store fallback article data even if extraction failed
      const rssItem = request.userData.rssItem;
      const fallbackArticle: ScrapedArticle = {
        sourceUrl: request.url,
        title: rssItem.title || 'No title',
        content: (rssItem as any).contentSnippet || (rssItem as any).content || rssItem.summary || 'No content available',
        author: rssItem.creator || (rssItem as any)['dc:creator'] || undefined,
        publicationDate: rssItem.pubDate ? new Date(rssItem.pubDate) : undefined,
        language: 'en'
      };
      
      this.scrapedResults.set(request.url, fallbackArticle);
    }
  }

  /**
   * Get current job status from job manager
   */
  getCurrentJob(): string | null {
    return this.currentJobId;
  }

  /**
   * Get job status from job manager
   */
  getJobStatus(jobId: string) {
    return jobManager.getJobStatus(jobId);
  }

  /**
   * Get job queue status
   */
  getQueueStatus() {
    return jobManager.getQueueStatus();
  }

  /**
   * Get available sources for scraping
   */
  async getAvailableSources() {
    return await sourceManager.getAllSources({ 
      activeOnly: true, 
      enabledOnly: true 
    });
  }

  /**
   * Get source manager instance
   */
  getSourceManager() {
    return sourceManager;
  }
}

// Export singleton instance
export const scraper = new VeritasScraper(); 