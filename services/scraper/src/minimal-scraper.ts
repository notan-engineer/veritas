import { CheerioCrawler } from 'crawlee';
import Parser from 'rss-parser';
import * as crypto from 'crypto';
import { NewsSource, ScrapedArticle, JobStatus } from './types';
import { logJobActivity, saveArticle, updateJobProgress, getSourceByName } from './database';
import { extractArticleContent, detectLanguage, generateContentHash } from './utils';

// Configure Crawlee for minimal usage
// Note: These config options may not be available in all Crawlee versions
// Configuration is set per crawler instance instead

// Store active crawlers for cancellation
const activeCrawlers = new Map<string, CheerioCrawler>();

export class MinimalRSSScraper {
  private rssParser: Parser;
  
  constructor() {
    this.rssParser = new Parser();
  }
  
  async scrapeJob(jobId: string, sources: string[], articlesPerSource: number) {
    // Create crawler for this job
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: 100,
      maxConcurrency: 3,
      requestHandlerTimeoutSecs: 30,
      
      requestHandler: async ({ request, $ }) => {
        const { jobId, sourceId, sourceName } = request.userData;
        
        try {
          // Extract article content using robust strategies
          const article = extractArticleContent($, request.url);
          
          // Detect language
          const language = detectLanguage(article.content);
          
          // Save article
          await saveArticle({
            title: article.title,
            content: article.content,
            author: article.author || undefined,
            publicationDate: article.date || undefined,
            sourceUrl: request.url,
            sourceName,
            language,
            contentHash: generateContentHash(article.title, article.content),
          });
          
          // Log success
          await logJobActivity({
            jobId,
            sourceId,
            level: 'info',
            message: 'Article processed successfully',
            additionalData: {
              url: request.url,
              title: article.title,
              language,
              content_length: article.content.length
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;
          await logJobActivity({
            jobId,
            sourceId,
            level: 'error',
            message: `Failed to extract content from ${request.url}`,
            additionalData: {
              error_type: error?.constructor?.name || 'Unknown',
              error_message: errorMessage,
              error_stack: errorStack
            }
          });
        }
      },
      
      failedRequestHandler: async ({ request, error }) => {
        const { jobId, sourceId } = request.userData;
        await logJobActivity({
          jobId,
          sourceId,
          level: 'error',
          message: `Failed to process ${request.url}`,
          additionalData: {
            error_type: error instanceof Error ? error.constructor.name : 'Unknown',
            error_message: error instanceof Error ? error.message : String(error),
            status_code: (error as any).statusCode,
            will_retry: request.retryCount < 3,
            retry_count: request.retryCount
          }
        });
      }
    });
    
    // Store for cancellation
    activeCrawlers.set(jobId, crawler);
    
    try {
      let processedSources = 0;
      let totalArticlesProcessed = 0;
      let totalErrors = 0;
      const totalArticlesExpected = sources.length * articlesPerSource;
      
      // Process each source
      for (const sourceName of sources) {
        const source = await getSourceByName(sourceName);
        
        // Update progress
        await updateJobProgress(jobId, { 
          currentSource: source.name,
          processedSources,
          totalSources: sources.length,
          articlesPerSource,
          totalArticlesExpected,
          articlesProcessed: totalArticlesProcessed,
          articlesErrored: totalErrors
        });
        
        // Fetch and parse RSS feed (outside Crawlee)
        try {
          const rssResponse = await fetch(source.rssUrl, {
            headers: { 'User-Agent': source.userAgent || 'Veritas/1.0' }
          });
          const rssText = await rssResponse.text();
          const feed = await this.rssParser.parseString(rssText);
          
          // Log RSS success
          await logJobActivity({
            jobId,
            sourceId: source.id,
            level: 'info',
            message: 'RSS feed parsed successfully',
            additionalData: {
              feed_title: feed.title,
              total_items: feed.items.length,
              items_to_process: Math.min(feed.items.length, articlesPerSource)
            }
          });
          
          // Queue article URLs
          const articleRequests = feed.items
            .slice(0, articlesPerSource)
            .map(item => ({
              url: item.link!,
              userData: {
                jobId,
                sourceId: source.id,
                sourceName: source.name,
                articleTitle: item.title
              }
            }));
          
          await crawler.addRequests(articleRequests);
          totalArticlesProcessed += articleRequests.length;
        } catch (error) {
          totalErrors++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logJobActivity({
            jobId,
            sourceId: source.id,
            level: 'error',
            message: `Failed to fetch RSS feed: ${source.rssUrl}`,
            additionalData: {
              error_type: error?.constructor?.name || 'Unknown',
              error_message: errorMessage
            }
          });
        }
        
        processedSources++;
      }
      
      // Run crawler
      await crawler.run();
    } finally {
      // Cleanup
      activeCrawlers.delete(jobId);
    }
  }
  
  async cancelJob(jobId: string): Promise<void> {
    const crawler = activeCrawlers.get(jobId);
    if (crawler) {
      await crawler.teardown();
      activeCrawlers.delete(jobId);
    }
  }
} 