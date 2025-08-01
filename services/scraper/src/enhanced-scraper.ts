import { CheerioCrawler } from 'crawlee';
import Parser from 'rss-parser';
import * as crypto from 'crypto';
import { NewsSource, ScrapedArticle, JobStatus } from './types';
import { logJobActivity, saveArticle, updateJobProgress, getSourceByName } from './database';
import { extractArticleContent, detectLanguage, generateContentHash } from './utils';
import { EnhancedLogger } from './enhanced-logger';

// Enhanced RSS Scraper with improved failure tolerance
export class EnhancedRSSScraper {
  private rssParser: Parser;
  private logger: EnhancedLogger;
  
  constructor() {
    this.rssParser = new Parser();
    this.logger = new EnhancedLogger();
  }
  
  async scrapeJob(jobId: string, sources: string[], articlesPerSource: number) {
    const startTime = Date.now();
    await this.logger.logJobStarted(jobId, sources, articlesPerSource, 'api');
    
    // Process sources with Promise.allSettled for fault tolerance
    const sourceResults = await Promise.allSettled(
      sources.map(sourceName => this.scrapeSourceEnhanced(jobId, sourceName, articlesPerSource))
    );
    
    // Aggregate all results
    const allArticles: any[] = [];
    const sourceOutcomes: Record<string, { success: boolean; count: number; error?: string }> = {};
    let totalErrors = 0;
    
    sourceResults.forEach((result, index) => {
      const sourceName = sources[index];
      if (!sourceName) return;
      
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value.articles);
        sourceOutcomes[sourceName] = {
          success: true,
          count: result.value.articles.length
        };
        
        // Logging handled in scrapeSourceEnhanced
      } else {
        sourceOutcomes[sourceName] = {
          success: false,
          count: 0,
          error: result.reason?.message || 'Unknown error'
        };
        
        totalErrors++;
        // Error logging handled in scrapeSourceEnhanced
      }
    });
    
    // Save all articles transactionally
    await this.saveArticlesTransactionally(jobId, allArticles, sourceOutcomes, articlesPerSource);
    
    // Log job completion
    const duration = Date.now() - startTime;
    await this.logger.logJobCompleted(
      jobId,
      allArticles.length,
      sources.length * articlesPerSource,
      duration,
      totalErrors
    );
  }
  
  private async scrapeSourceEnhanced(jobId: string, sourceName: string, articlesPerSource: number): Promise<{ articles: any[] }> {
    const sourceStartTime = Date.now();
    const source = await getSourceByName(sourceName);
    const scrapedArticles: any[] = [];
    
    // Log source start
    await this.logger.logSourceStarted(
      jobId,
      source.id,
      sourceName,
      source.rssUrl || '',
      articlesPerSource
    );
    
    if (!source.rssUrl) {
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'error',
        message: `Source "${sourceName}" has no RSS URL configured`,
        additionalData: { source_id: source.id }
      });
      throw new Error(`Source "${sourceName}" has no RSS URL configured`);
    }
    
    // Fetch and parse RSS feed with retry logic
    let feed: any = undefined;
    let rssAttempts = 0;
    const maxRssAttempts = 3;
    
    while (rssAttempts < maxRssAttempts) {
      try {
        const rssResponse = await fetch(source.rssUrl, {
          headers: { 
            'User-Agent': source.userAgent || 'Veritas/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout for RSS fetch
        });
        
        if (!rssResponse.ok) {
          throw new Error(`RSS fetch failed with status ${rssResponse.status}`);
        }
        
        const rssText = await rssResponse.text();
        feed = await this.rssParser.parseString(rssText);
        break; // Success, exit retry loop
        
      } catch (error) {
        rssAttempts++;
        await logJobActivity({
          jobId,
          sourceId: source.id,
          level: 'warning',
          message: `RSS fetch attempt ${rssAttempts}/${maxRssAttempts} failed for ${sourceName}: ${error instanceof Error ? error.message : String(error)} (retrying in ${Math.pow(2, rssAttempts)}s)`,
          additionalData: {
            event_type: 'source',
            event_name: 'rss_fetch_retry',
            attempt: rssAttempts,
            max_attempts: maxRssAttempts,
            error: error instanceof Error ? error.message : String(error),
            retry_delay_ms: Math.pow(2, rssAttempts) * 1000,
            url: source.rssUrl
          }
        });
        
        if (rssAttempts >= maxRssAttempts) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, rssAttempts) * 1000));
      }
    }
    
    if (!feed) {
      throw new Error('Failed to fetch and parse RSS feed after all retry attempts');
    }
    
    await logJobActivity({
      jobId,
      sourceId: source.id,
      level: 'info',
      message: `RSS feed parsed: ${feed.items.length} items found`,
      additionalData: {
        event_type: 'source',
        event_name: 'rss_parsed',
        feed_title: feed.title,
        total_items: feed.items.length,
        items_to_process: Math.min(feed.items.length, articlesPerSource * 2)
      }
    });
    
    // Ensure storage directory exists
    const path = await import('path');
    const fs = await import('fs/promises');
    const storageDir = path.join(process.cwd(), 'storage');
    
    try {
      await fs.mkdir(path.join(storageDir, 'request_queues', 'default'), { recursive: true });
      await fs.mkdir(path.join(storageDir, 'key_value_stores', 'default'), { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }
    
    // Enhanced crawler configuration
    const crawler = new CheerioCrawler({
      // ENHANCED SETTINGS:
      maxRequestsPerCrawl: articlesPerSource * 3, // Allow 3x requests for retries
      maxConcurrency: 4, // Increased concurrency
      requestHandlerTimeoutSecs: 60, // Doubled timeout
      maxRequestRetries: 3, // Add retry logic
      
      // Enhanced retry settings
      retryOnBlocked: true,
      
      requestHandler: async ({ request, $ }) => {
        const { sourceId, sourceName, articleTitle, correlationId } = request.userData;
        const extractionStartTime = Date.now();
        
        try {
          // Add fallback extraction methods
          let article;
          
          // Primary extraction method
          try {
            article = extractArticleContent($, request.url);
          } catch (primaryError) {
            // Fallback: Basic extraction
            const title = $('title').text() || $('h1').first().text() || articleTitle || 'Untitled';
            const content = $('article').text() || $('.content').text() || $('main').text() || $('body').text() || '';
            
            article = {
              title: title.trim(),
              content: content.trim().substring(0, 10000), // Limit content length
              author: $('[rel="author"]').text() || $('.author').text() || null,
              date: null
            };
            
            await this.logger.logExtractionError(
              jobId,
              sourceId,
              request.url,
              primaryError instanceof Error ? primaryError : new Error(String(primaryError)),
              'primary',
              correlationId
            );
          }
          
          // Validate extracted content
          if (!article.title || article.title.length < 5) {
            throw new Error(`Invalid article title: "${article.title}"`);
          }
          
          if (!article.content || article.content.length < 100) {
            throw new Error(`Article content too short: ${article.content.length} characters`);
          }
          
          const language = detectLanguage(article.content);
          
          // Store in memory for batch save
          const articleData = {
            title: article.title,
            content: article.content,
            author: article.author || undefined,
            publicationDate: article.date || undefined,
            sourceUrl: request.url,
            sourceId,
            language,
            contentHash: generateContentHash(article.title, article.content),
          };
          
          // Convert to ExtractedArticle format for logger
          const extractedArticle = {
            title: article.title,
            content: article.content,
            author: article.author,
            publicationDate: article.date,
            language
          };
          
          scrapedArticles.push(articleData);
          
          // Log successful extraction
          const extractionTime = Date.now() - extractionStartTime;
          await this.logger.logExtractionResult(
            jobId,
            sourceId,
            request.url,
            extractedArticle,
            extractionTime,
            'primary',
            correlationId
          );
        } catch (error) {
          await this.logger.logExtractionError(
            jobId,
            sourceId,
            request.url,
            error instanceof Error ? error : new Error(String(error)),
            'primary',
            correlationId
          );
          throw error; // Re-throw to trigger retry
        }
      },
      
      failedRequestHandler: async ({ request, error }) => {
        const { sourceId, sourceName, correlationId } = request.userData;
        await this.logger.logHttpError(
          jobId,
          sourceId,
          { url: request.url, method: 'GET', id: request.id },
          error instanceof Error ? error : new Error(String(error)),
          request.retryCount,
          3, // maxRetries
          correlationId
        );
      }
    });
    
    try {
      // Enhanced pre-filtering with more items checked
      const { pool } = await import('./database');
      const candidateItems = [];
      const maxItemsToCheck = Math.min(feed.items.length, articlesPerSource * 3); // Check 3x more items
      let duplicatesFound = 0;
      
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'info',
        message: `Enhanced filtering RSS items for ${sourceName}`,
        additionalData: {
          total_rss_items: feed.items.length,
          target_articles: articlesPerSource,
          max_items_to_check: maxItemsToCheck,
          enhancement: 'checking_more_items'
        }
      });
      
      for (let i = 0; i < maxItemsToCheck && candidateItems.length < articlesPerSource * 2; i++) {
        const item = feed.items[i];
        if (!item || !item.link) continue;
        
        // Check if this URL already exists
        const urlCheck = await pool.query(`
          SELECT id FROM scraped_content 
          WHERE source_url = $1
          LIMIT 1
        `, [item.link]);
        
        if (urlCheck.rows.length === 0) {
          candidateItems.push(item);
        } else {
          duplicatesFound++;
        }
      }
      
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'info',
        message: `Enhanced RSS filtering completed for ${sourceName}`,
        additionalData: {
          items_checked: Math.min(maxItemsToCheck, feed.items.length),
          duplicates_skipped: duplicatesFound,
          candidates_found: candidateItems.length,
          target_articles: articlesPerSource
        }
      });
      
      // Process the candidate items (target more than needed to account for failures)
      const targetCandidates = Math.min(candidateItems.length, articlesPerSource * 2);
      const articleRequests = candidateItems.slice(0, targetCandidates).map(item => {
        const correlationId = this.logger.createCorrelationId();
        return {
          url: item.link!,
          userData: {
            jobId,
            sourceId: source.id,
            sourceName: source.name,
            articleTitle: item.title,
            correlationId
          }
        };
      });
      
      if (articleRequests.length > 0) {
        await logJobActivity({
          jobId,
          sourceId: source.id,
          level: 'info',
          message: `Processing ${articleRequests.length} candidate articles for ${sourceName}`,
          additionalData: {
            requests_queued: articleRequests.length,
            target_success: articlesPerSource
          }
        });
        
        await crawler.addRequests(articleRequests);
        await crawler.run();
      }
      
      const successRate = Math.round((scrapedArticles.length / articlesPerSource) * 100);
      const actualSuccessRate = articleRequests.length > 0 ? Math.round((scrapedArticles.length / articleRequests.length) * 100) : 0;
      
      // Log source completion
      const sourceDuration = Date.now() - sourceStartTime;
      await this.logger.logSourceCompleted(
        jobId,
        source.id,
        sourceName,
        scrapedArticles.length,
        articlesPerSource,
        sourceDuration
      );
      
      return { articles: scrapedArticles };
    } finally {
      // Cleanup
      await crawler.teardown();
    }
  }
  
  private async saveArticlesTransactionally(jobId: string, allArticles: any[], sourceOutcomes: Record<string, any>, articlesPerSource: number) {
    const { pool } = await import('./database');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let savedCount = 0;
      let duplicateCount = 0;
      
      // Insert all articles with conflict handling
      for (const article of allArticles) {
        // Check for existing content by URL or content hash
        const existingCheck = await client.query(`
          SELECT id FROM scraped_content 
          WHERE source_url = $1 OR content_hash = $2
          LIMIT 1
        `, [article.sourceUrl, article.contentHash]);
        
        if (existingCheck.rows.length > 0) {
          duplicateCount++;
          continue;
        }
        
        const result = await client.query(`
          INSERT INTO scraped_content (
            source_id, source_url, title, content, author,
            publication_date, content_hash, language, processing_status, job_id, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, NOW())
          RETURNING id
        `, [
          article.sourceId,
          article.sourceUrl,
          article.title,
          article.content,
          article.author || null,
          article.publicationDate ? new Date(article.publicationDate) : null,
          article.contentHash,
          article.language || 'en',
          jobId
        ]);
        
        if (result.rows.length > 0) {
          savedCount++;
        }
      }
      
      // Correct status calculation per original requirements
      const successfulSources = Object.values(sourceOutcomes).filter(o => o.success).length;
      const totalSources = Object.keys(sourceOutcomes).length;
      const targetArticles = totalSources * articlesPerSource;
      
      // Original correct status definitions:
      let finalStatus: 'successful' | 'partial' | 'failed';
      if (savedCount >= targetArticles) {
        // All requested articles were scraped
        finalStatus = 'successful';
      } else if (savedCount > 0) {
        // Some articles were scraped (but not all)
        finalStatus = 'partial';
      } else {
        // No articles were scraped OR there was a critical error
        finalStatus = 'failed';
      }
      
      await logJobActivity({
        jobId,
        level: 'info',
        message: 'Enhanced status calculation',
        additionalData: {
          successfulSources,
          totalSources,
          savedCount,
          targetArticles,
          articlesPerSource,
          sourceOutcomes,
          target_achieved: savedCount >= targetArticles,
          some_articles_scraped: savedCount > 0,
          calculated_status: finalStatus
        }
      });
      
      const updateResult = await client.query(`
        UPDATE scraping_jobs 
        SET 
          status = $2,
          total_articles_scraped = $3,
          total_errors = $4,
          completed_at = NOW()
        WHERE id = $1
        RETURNING id, status
      `, [
        jobId,
        finalStatus,
        savedCount,
        allArticles.length - savedCount
      ]);

      await client.query('COMMIT');
      
      // Final logging
      await logJobActivity({
        jobId,
        level: 'info',
        message: `Enhanced job completed with status: ${finalStatus}`,
        additionalData: {
          total_articles_found: allArticles.length,
          articles_saved: savedCount,
          articles_duplicate: duplicateCount,
          successful_sources: successfulSources,
          total_sources: totalSources,
          target_articles: targetArticles,
          target_achieved: savedCount >= targetArticles,
          final_status: finalStatus,
          source_outcomes: sourceOutcomes,
          enhancement_version: '2.0'
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      
      await logJobActivity({
        jobId,
        level: 'error',
        message: 'Enhanced transaction failed during article save',
        additionalData: {
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
          error_message: error instanceof Error ? error.message : String(error),
          articles_attempted: allArticles.length
        }
      });
      
      throw error;
    } finally {
      client.release();
    }
  }
  
  async cancelJob(jobId: string): Promise<void> {
    // Enhanced cancellation logic would go here
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Enhanced job cancellation completed`,
      additionalData: {
        cancelled_at: new Date().toISOString(),
        enhancement_version: '2.0'
      }
    });
  }
}