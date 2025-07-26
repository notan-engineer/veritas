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
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Starting multi-source scrape for ${sources.length} sources`,
      additionalData: {
        source_count: sources.length,
        articles_per_source: articlesPerSource,
        total_expected: sources.length * articlesPerSource
      }
    });
    
    // Process sources with Promise.allSettled for fault tolerance
    const sourceResults = await Promise.allSettled(
      sources.map(sourceName => this.scrapeSource(jobId, sourceName, articlesPerSource))
    );
    
    // Aggregate all results
    const allArticles: any[] = [];
    const sourceOutcomes: Record<string, { success: boolean; count: number; error?: string }> = {};
    
    sourceResults.forEach((result, index) => {
      const sourceName = sources[index];
      if (!sourceName) return; // Skip if index is out of bounds
      
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value.articles);
        sourceOutcomes[sourceName] = {
          success: true,
          count: result.value.articles.length
        };
        
        logJobActivity({
          jobId,
          level: 'info',
          message: `Source ${sourceName} completed successfully`,
          additionalData: {
            source: sourceName,
            articles_scraped: result.value.articles.length,
            total_articles_so_far: allArticles.length
          }
        });
      } else {
        sourceOutcomes[sourceName] = {
          success: false,
          count: 0,
          error: result.reason?.message || 'Unknown error'
        };
        
        logJobActivity({
          jobId,
          level: 'error',
          message: `Source ${sourceName} failed completely`,
          additionalData: {
            source: sourceName,
            error_type: result.reason?.constructor?.name || 'Unknown',
            error_message: result.reason?.message || 'Unknown error'
          }
        });
      }
    });
    
    // Save all articles transactionally
    await this.saveArticlesTransactionally(jobId, allArticles, sourceOutcomes, articlesPerSource);
  }
  
  private async scrapeSource(jobId: string, sourceName: string, articlesPerSource: number): Promise<{ articles: any[] }> {
    const source = await getSourceByName(sourceName);
    const scrapedArticles: any[] = [];
    
    // Defensive checks
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
    
    await logJobActivity({
      jobId,
      sourceId: source.id,
      level: 'info',
      message: `Starting scrape for source: ${sourceName}`,
      additionalData: {
        source_name: sourceName,
        source_id: source.id,
        rss_url: source.rssUrl,
        target_articles: articlesPerSource
      }
    });
    
    // Fetch and parse RSS feed
    const rssResponse = await fetch(source.rssUrl, {
      headers: { 'User-Agent': source.userAgent || 'Veritas/1.0' }
    });
    const rssText = await rssResponse.text();
    const feed = await this.rssParser.parseString(rssText);
    
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
    
    // Create crawler instance for this source
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: articlesPerSource + 10, // Buffer for retries
      maxConcurrency: 2, // Reduced concurrency per source
      requestHandlerTimeoutSecs: 30,
      
      requestHandler: async ({ request, $ }) => {
        const { sourceId, sourceName, articleTitle } = request.userData;
        
        try {
          // Extract article content
          const article = extractArticleContent($, request.url);
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
          
          scrapedArticles.push(articleData);
          
          await logJobActivity({
            jobId,
            sourceId,
            level: 'info',
            message: 'Article extracted successfully',
            additionalData: {
              url: request.url,
              title: article.title,
              language,
              content_length: article.content.length,
              source_articles_count: scrapedArticles.length
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logJobActivity({
            jobId,
            sourceId,
            level: 'error',
            message: `Failed to extract content from ${request.url}`,
            additionalData: {
              url: request.url,
              error_type: error?.constructor?.name || 'Unknown',
              error_message: errorMessage,
              source_name: sourceName
            }
          });
          throw error; // Re-throw to mark article as failed
        }
      },
      
      failedRequestHandler: async ({ request, error }) => {
        const { sourceId, sourceName } = request.userData;
        await logJobActivity({
          jobId,
          sourceId,
          level: 'error',
          message: `Failed to process ${request.url}`,
          additionalData: {
            url: request.url,
            error_type: error instanceof Error ? error.constructor.name : 'Unknown',
            error_message: error instanceof Error ? error.message : String(error),
            status_code: (error as any).statusCode,
            retry_count: request.retryCount,
            source_name: sourceName
          }
        });
      }
    });
    
    // Store crawler for potential cancellation
    activeCrawlers.set(`${jobId}-${sourceName}`, crawler);
    
    try {
      // Pre-filter RSS items to avoid processing known duplicates
      const { pool } = await import('./database');
      const candidateItems = [];
      const maxItemsToCheck = Math.min(feed.items.length, 50); // Check up to 50 items (reasonable for most RSS feeds)
      let duplicatesFound = 0;
      
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'info',
        message: `Filtering RSS items for ${sourceName}`,
        additionalData: {
          total_rss_items: feed.items.length,
          target_articles: articlesPerSource,
          max_items_to_check: maxItemsToCheck
        }
      });
      
      for (let i = 0; i < maxItemsToCheck && candidateItems.length < articlesPerSource; i++) {
        const item = feed.items[i];
        if (!item || !item.link) continue;
        
        // Check if this URL already exists (quick URL-based check)
        const urlCheck = await pool.query(`
          SELECT id FROM scraped_content 
          WHERE source_url = $1
          LIMIT 1
        `, [item.link]);
        
        if (urlCheck.rows.length === 0) {
          // URL is not a duplicate, add to candidates
          candidateItems.push(item);
        } else {
          duplicatesFound++;
        }
      }
      
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'info',
        message: `RSS filtering completed for ${sourceName}`,
        additionalData: {
          items_checked: Math.min(maxItemsToCheck, feed.items.length),
          duplicates_skipped: duplicatesFound,
          candidates_found: candidateItems.length,
          target_articles: articlesPerSource
        }
      });
      
      // Process the candidate items
      const articleRequests = candidateItems.map(item => ({
        url: item.link!,
        userData: {
          jobId,
          sourceId: source.id,
          sourceName: source.name,
          articleTitle: item.title
        }
      }));
      
      if (articleRequests.length > 0) {
        await crawler.addRequests(articleRequests);
        await crawler.run();
      }
      
      await logJobActivity({
        jobId,
        sourceId: source.id,
        level: 'info',
        message: `Source scraping completed: ${sourceName}`,
        additionalData: {
          source_name: sourceName,
          articles_scraped: scrapedArticles.length,
          target_articles: articlesPerSource,
          success_rate: Math.round((scrapedArticles.length / articlesPerSource) * 100)
        }
      });
      
      return { articles: scrapedArticles };
    } finally {
      // Cleanup this source's crawler
      activeCrawlers.delete(`${jobId}-${sourceName}`);
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
          continue; // Skip this article as it's a duplicate
        }
        
        const result = await client.query(`
          INSERT INTO scraped_content (
            source_id, source_url, title, content, author,
            publication_date, content_hash, language, processing_status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', NOW())
          RETURNING id
        `, [
          article.sourceId,
          article.sourceUrl,
          article.title,
          article.content,
          article.author || null,
          article.publicationDate ? new Date(article.publicationDate) : null,
          article.contentHash,
          article.language || 'en'
        ]);
        
        if (result.rows.length > 0) {
          savedCount++;
        }
      }
      
      // Update job with final status and counts
      const successfulSources = Object.values(sourceOutcomes).filter(o => o.success).length;
      const totalSources = Object.keys(sourceOutcomes).length;
      const targetArticles = totalSources * articlesPerSource;
      
      // Debug logging
      await logJobActivity({
        jobId,
        level: 'info',
        message: 'Status calculation debug',
        additionalData: {
          successfulSources,
          totalSources,
          savedCount,
          targetArticles,
          articlesPerSource,
          sourceOutcomes
        }
      });
      
      let finalStatus: 'successful' | 'partial' | 'failed';
      if (successfulSources === totalSources && savedCount >= targetArticles) {
        finalStatus = 'successful'; // All sources succeeded AND target achieved
      } else if (successfulSources > 0 && savedCount > 0) {
        finalStatus = 'partial'; // Some success but target not fully achieved
      } else {
        finalStatus = 'failed'; // No success or no articles saved
      }
      
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

      // Debug logging for database update
      await logJobActivity({
        jobId,
        level: 'info',
        message: 'Database UPDATE operation result',
        additionalData: {
          update_attempted_status: finalStatus,
          update_result: updateResult.rows[0],
          rows_affected: updateResult.rowCount
        }
      });
      
      await client.query('COMMIT');
      
      // Final logging
      await logJobActivity({
        jobId,
        level: 'info',
        message: `Job completed with status: ${finalStatus}`,
        additionalData: {
          total_articles_found: allArticles.length,
          articles_saved: savedCount,
          articles_duplicate: duplicateCount,
          successful_sources: successfulSources,
          total_sources: totalSources,
          target_articles: targetArticles,
          target_achieved: savedCount >= targetArticles,
          final_status: finalStatus,
          source_outcomes: sourceOutcomes
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      
      await logJobActivity({
        jobId,
        level: 'error',
        message: 'Transaction failed during article save',
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
    // Cancel all crawlers for this job (including per-source crawlers)
    const crawlerKeys = Array.from(activeCrawlers.keys()).filter(key => key.startsWith(jobId));
    
    for (const key of crawlerKeys) {
      const crawler = activeCrawlers.get(key);
      if (crawler) {
        await crawler.teardown();
        activeCrawlers.delete(key);
      }
    }
    
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Job cancellation completed`,
      additionalData: {
        crawlers_cancelled: crawlerKeys.length,
        cancelled_at: new Date().toISOString()
      }
    });
  }
} 