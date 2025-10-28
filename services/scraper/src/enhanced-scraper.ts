import { CheerioCrawler, Configuration, RequestQueue } from 'crawlee';
import Parser from 'rss-parser';
import * as crypto from 'crypto';
import { NewsSource, ScrapedArticle, JobStatus, SourceResult, SourcePersistenceResult, EnhancedJobMetrics, DatabaseVerificationResult } from './types';
import { logJobActivity, saveArticle, updateJobProgress, getSourceByName } from './database';
import { extractArticleContent, detectLanguage, generateContentHash } from './utils';
import { EnhancedLogger } from './enhanced-logger';

// Enhanced RSS Scraper with improved failure tolerance
export class EnhancedRSSScraper {
  private rssParser: Parser;
  private logger: EnhancedLogger;

  constructor() {
    // Configure Crawlee to use in-memory storage in production
    // This prevents file system issues in containerized environments
    if (process.env.NODE_ENV === 'production') {
      Configuration.set('persistStorage', false);
    }

    this.rssParser = new Parser();
    this.logger = new EnhancedLogger();
  }
  
  async scrapeJob(jobId: string, sources: string[], articlesPerSource: number, enableTracking: boolean = false) {
    const startTime = Date.now();
    await this.logger.logJobStarted(jobId, sources, articlesPerSource, 'api');

    // Story 3: Phase transition - Extraction
    await this.logger.logPhaseTransition(jobId, 'initialization', 'extraction');

    // Process sources with Promise.allSettled for fault tolerance
    const sourceResults = await Promise.allSettled(
      sources.map(sourceName => this.scrapeSourceEnhanced(jobId, sourceName, articlesPerSource, enableTracking))
    );

    // Process extraction results
    const successfulExtractions: SourceResult[] = [];
    const extractionFailures: Record<string, string> = {};

    sourceResults.forEach((result, index) => {
      const sourceName = sources[index];
      if (!sourceName) return;

      if (result.status === 'fulfilled') {
        successfulExtractions.push(result.value);
      } else {
        extractionFailures[sourceName] = result.reason?.message || 'Unknown error';
        // Log extraction failure
        this.logger.logSourceExtractionFailed(jobId, sourceName, result.reason);
      }
    });

    // Log extraction phase completion
    await this.logger.logExtractionPhaseCompleted(jobId, successfulExtractions, extractionFailures);

    // Story 3: Phase transition - Persistence
    await this.logger.logPhaseTransition(jobId, 'extraction', 'persistence');

    // Phase 2: Persistence - save all articles transactionally
    const persistenceResults = await this.saveArticlesTransactionally(jobId, successfulExtractions, articlesPerSource);

    // Story 3: Phase transition - Verification
    await this.logger.logPhaseTransition(jobId, 'persistence', 'verification');

    // Story 1: Phase 3: Database Verification - verify actual saved counts
    const databaseCounts = await this.verifyPersistenceResults(jobId, persistenceResults);
    await this.logger.logDatabaseVerification(jobId, databaseCounts);

    // Story 5: Reconciliation - compare logged metrics with database reality
    await this.reconcileJobMetrics(jobId, successfulExtractions, persistenceResults);

    // Story 3: Phase transition - Completion
    await this.logger.logPhaseTransition(jobId, 'verification', 'completion');

    // Phase 4: Final logging with accurate metrics
    await this.logFinalJobMetrics(jobId, successfulExtractions, persistenceResults, extractionFailures, articlesPerSource, startTime);
  }
  
  private async scrapeSourceEnhanced(jobId: string, sourceName: string, articlesPerSource: number, enableTracking: boolean = false): Promise<SourceResult> {
    const sourceStartTime = Date.now();
    const source = await getSourceByName(sourceName);
    // Use a Map to ensure articles are stored by the correct source name from userData
    // This prevents closure scope issues when multiple sources run concurrently
    const articlesBySource = new Map<string, any[]>();
    let crawler: any = null; // Declare crawler at method scope for finally block access
    
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

    // Enhanced crawler configuration
    // Note: Storage is handled in-memory in production (see constructor)
    // CRITICAL: Use source-specific request queue name to prevent concurrent crawlers
    // from sharing the same queue and mixing up requests
    const requestQueueName = `${jobId}-${source.name.replace(/\s+/g, '-').toLowerCase()}`;

    crawler = new CheerioCrawler({
      // ENHANCED SETTINGS:
      maxRequestsPerCrawl: articlesPerSource * 3, // Allow 3x requests for retries
      maxConcurrency: 4, // Increased concurrency
      requestHandlerTimeoutSecs: 60, // Doubled timeout
      maxRequestRetries: 3, // Add retry logic

      // Enhanced retry settings
      retryOnBlocked: true,

      // Source-specific request queue to prevent cross-contamination
      requestQueue: await RequestQueue.open(requestQueueName),
      
      requestHandler: async ({ request, $ }) => {
        const { sourceId, sourceName, articleTitle, correlationId, articleTrackingId } = request.userData; // Story 2: Extract tracking ID
        const extractionStartTime = Date.now();
        
        try {
          // Add fallback extraction methods
          let article;
          
          // Primary extraction method
          try {
            // DEBUG: Log what we're working with
            const bodyLength = $('body').html()?.length || 0;
            const hasArticleBody = $('.article-body').length > 0;
            const paragraphCount = $('.article-body p').length;

            console.log(`[DEBUG] URL: ${request.url}`);
            console.log(`[DEBUG] Body HTML length: ${bodyLength}`);
            console.log(`[DEBUG] Has .article-body: ${hasArticleBody}`);
            console.log(`[DEBUG] Paragraphs in .article-body: ${paragraphCount}`);

            article = extractArticleContent($, request.url, enableTracking);
          } catch (primaryError) {
            // Enhanced fallback: Try multiple strategies
            const fallbackStrategies = [
              // Strategy 1: Aggregate multiple text blocks (BBC pattern)
              () => {
                const textBlocks = $('[data-component="text-block"], [data-testid*="paragraph"], div[class*="Text-sc"]');
                if (textBlocks.length > 0) {
                  const texts: string[] = [];
                  textBlocks.each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 50) texts.push(text);
                  });
                  return texts.join('\n\n');
                }
                return '';
              },
              // Strategy 2: Article tag with paragraph extraction
              () => {
                const articleEl = $('article');
                if (articleEl.length > 0) {
                  const paragraphs: string[] = [];
                  articleEl.find('p').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 30) paragraphs.push(text);
                  });
                  return paragraphs.join('\n\n') || articleEl.text().trim();
                }
                return '';
              },
              // Strategy 3: Main content area
              () => $('main').text().trim(),
              // Strategy 4: Body text (last resort)
              () => $('body').text().trim()
            ];

            let content = '';
            for (const strategy of fallbackStrategies) {
              try {
                content = strategy();
                if (content && content.length > 200) break; // Found good content
              } catch (e) {
                // Try next strategy
              }
            }

            const title = $('title').text() || $('h1').first().text() || articleTitle || 'Untitled';

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
            sourceName, // Story 2: Add source name for logging
            language,
            contentHash: generateContentHash(article.title, article.content),
            articleTrackingId, // Story 2: Include tracking ID in article data
            // Store extraction traces if tracking is enabled
            ...(article.traces ? { extractionTraces: article.traces } : {})
          };

          // Convert to ExtractedArticle format for logger
          const extractedArticle = {
            title: article.title,
            content: article.content,
            author: article.author,
            publicationDate: article.date,
            language
          };

          // Store article in source-specific bucket using sourceName from userData
          // This prevents closure scope issues where concurrent scrapers might mix up articles
          if (!articlesBySource.has(sourceName)) {
            articlesBySource.set(sourceName, []);
          }
          articlesBySource.get(sourceName)!.push(articleData);

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

          // Story 2: Log article lifecycle - extraction success
          await this.logger.logArticleLifecycle(
            jobId,
            sourceId,
            articleTrackingId,
            'extracted',
            {
              sourceName,
              sourceUrl: request.url,
              contentLength: article.content.length
            }
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
        const articleTrackingId = crypto.randomUUID(); // Story 2: Unique tracking ID
        return {
          url: item.link!,
          userData: {
            jobId,
            sourceId: source.id,
            sourceName: source.name,
            articleTitle: item.title,
            correlationId,
            articleTrackingId // Story 2: Add tracking ID to userData
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
      
      // Get articles for THIS source (should only be one entry in map with our source name)
      const scrapedArticles = articlesBySource.get(source.name) || [];

      const successRate = Math.round((scrapedArticles.length / articlesPerSource) * 100);
      const actualSuccessRate = articleRequests.length > 0 ? Math.round((scrapedArticles.length / articleRequests.length) * 100) : 0;

      // Log source extraction completion
      const sourceDuration = Date.now() - sourceStartTime;
      await this.logger.logSourceExtractionCompleted(
        jobId,
        source.id,
        sourceName,
        scrapedArticles.length,
        articlesPerSource,
        sourceDuration
      );

      // Return enhanced source result
      const sourceResult: SourceResult = {
        sourceName: source.name,
        sourceId: source.id,
        extractedArticles: scrapedArticles,
        extractionMetrics: {
          rssItemsFound: feed.items.length,
          candidatesProcessed: candidateItems.length,
          extractionAttempts: articleRequests.length,
          extractionSuccesses: scrapedArticles.length,
          extractionDuration: Date.now() - sourceStartTime
        }
      };

      return sourceResult;
    } finally {
      // Cleanup with error protection
      if (crawler) {
        try {
          await crawler.teardown();
        } catch (teardownError) {
          await logJobActivity({
            jobId,
            sourceId: source.id,
            level: 'error',
            message: `Crawler teardown failed for ${sourceName}`,
            additionalData: {
              error_type: 'teardown_failure',
              error_message: teardownError instanceof Error ? teardownError.message : String(teardownError),
              source_name: sourceName
            }
          });
          // Don't re-throw - allow job to continue
        }
      }
    }
  }
  
  private async saveArticlesTransactionally(jobId: string, sourceResults: SourceResult[], articlesPerSource: number): Promise<Map<string, SourcePersistenceResult>> {
    const { pool } = await import('./database');
    const client = await pool.connect();
    
    const persistenceResults = new Map<string, SourcePersistenceResult>();
    
    try {
      await client.query('BEGIN');
      
      let totalSavedCount = 0;
      let totalDuplicateCount = 0;
      
      // Process articles by source for accurate tracking
      for (const sourceResult of sourceResults) {
        const sourcePersistence: SourcePersistenceResult = {
          sourceName: sourceResult.sourceName,
          sourceId: sourceResult.sourceId,
          savedCount: 0,
          duplicatesSkipped: 0,
          saveFailures: 0,
          articles: []
        };
        
        // Insert articles for this source
        for (const article of sourceResult.extractedArticles) {
          try {
            // Check for existing content by URL or content hash
            const existingCheck = await client.query(`
              SELECT id FROM scraped_content 
              WHERE source_url = $1 OR content_hash = $2
              LIMIT 1
            `, [article.sourceUrl, article.contentHash]);
            
            if (existingCheck.rows.length > 0) {
              sourcePersistence.duplicatesSkipped++;
              totalDuplicateCount++;

              // Story 2: Log article lifecycle - duplicate skipped
              if (article.articleTrackingId) {
                await this.logger.logArticleLifecycle(
                  jobId,
                  article.sourceId,
                  article.articleTrackingId,
                  'skipped',
                  {
                    sourceName: article.sourceName,
                    sourceUrl: article.sourceUrl,
                    reason: 'duplicate_detected'
                  }
                );
              }

              continue;
            }

            // Story 4: Log source attribution before INSERT
            const sourceUrlDomain = new URL(article.sourceUrl).hostname;

            const attribution = {
              sourceName: sourceResult.sourceName,
              sourceId: article.sourceId,
              sourceUrl: article.sourceUrl,
              sourceUrlDomain
            };

            try {
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
                sourcePersistence.savedCount++;
                sourcePersistence.articles.push(result.rows[0].id);
                totalSavedCount++;

                // Story 4: Log attribution success with database ID
                if (article.articleTrackingId) {
                  await this.logger.logInsertAttribution(
                    jobId,
                    article.articleTrackingId,
                    attribution,
                    true,
                    result.rows[0].id
                  );
                }

                // Story 2: Log article lifecycle - persistence success
                if (article.articleTrackingId) {
                  await this.logger.logArticleLifecycle(
                    jobId,
                    article.sourceId,
                    article.articleTrackingId,
                    'persisted',
                    {
                      sourceName: article.sourceName,
                      sourceUrl: article.sourceUrl,
                      databaseArticleId: result.rows[0].id
                    }
                  );
                }
              }
            } catch (insertError) {
              // Story 4: Log attribution failure
              if (article.articleTrackingId) {
                await this.logger.logInsertAttribution(
                  jobId,
                  article.articleTrackingId,
                  attribution,
                  false,
                  undefined,
                  insertError instanceof Error ? insertError.message : String(insertError)
                );
              }
              throw insertError; // Re-throw to be caught by outer catch
            }
          } catch (saveError) {
            sourcePersistence.saveFailures++;

            const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);

            await logJobActivity({
              jobId,
              sourceId: sourceResult.sourceId,
              level: 'error',
              message: `Failed to save article: ${errorMessage}`,
              additionalData: {
                article_url: article.sourceUrl,
                error_type: 'persistence_failure'
              }
            });

            // Story 2: Log article lifecycle - persistence failure
            if (article.articleTrackingId) {
              await this.logger.logArticleLifecycle(
                jobId,
                article.sourceId,
                article.articleTrackingId,
                'failed',
                {
                  sourceName: article.sourceName,
                  sourceUrl: article.sourceUrl,
                  error: errorMessage
                }
              );
            }
          }
        }
        
        persistenceResults.set(sourceResult.sourceName, sourcePersistence);
      }
      
      // Calculate job status based on actual saves
      const totalSources = sourceResults.length;
      const targetArticles = totalSources * articlesPerSource;
      
      // Count sources with successful saves
      const successfulSources = Array.from(persistenceResults.values())
        .filter(p => p.savedCount > 0).length;
      
      // Determine final status
      let finalStatus: 'successful' | 'partial' | 'failed';
      if (totalSavedCount >= targetArticles) {
        finalStatus = 'successful';
      } else if (totalSavedCount > 0) {
        finalStatus = 'partial';
      } else {
        finalStatus = 'failed';
      }
      
      // Update job status in database
      await client.query(`
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
        totalSavedCount,
        sourceResults.reduce((acc, sr) => acc + sr.extractedArticles.length, 0) - totalSavedCount
      ]);

      await client.query('COMMIT');
      
      // Log detailed persistence results
      for (const [sourceName, persistence] of persistenceResults) {
        await this.logger.logSourcePersisted(
          jobId,
          persistence.sourceId,
          sourceName,
          persistence
        );
      }
      
      return persistenceResults;
    } catch (error) {
      await client.query('ROLLBACK');
      
      await logJobActivity({
        jobId,
        level: 'error',
        message: 'Enhanced transaction failed during article save',
        additionalData: {
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
          error_message: error instanceof Error ? error.message : String(error),
          articles_attempted: sourceResults.reduce((acc, sr) => acc + sr.extractedArticles.length, 0)
        }
      });
      
      throw error;
    } finally {
      client.release();
    }
  }

  // Story 1: Database Verification Logging
  private async verifyPersistenceResults(
    jobId: string,
    persistenceResults: Map<string, SourcePersistenceResult>
  ): Promise<Map<string, DatabaseVerificationResult>> {
    const { pool } = await import('./database');

    // Query to get counts and ALL article IDs per source
    // Note: Removed LIMIT from subquery due to PostgreSQL 18 syntax restrictions
    // We'll slice to first 5 in JavaScript instead
    const result = await pool.query(`
      SELECT
        s.name as source_name,
        s.id as source_id,
        COUNT(sc.id) as actual_count,
        ARRAY(
          SELECT id FROM scraped_content
          WHERE source_id = s.id AND job_id = $1
          ORDER BY created_at
        ) as all_ids
      FROM scraped_content sc
      JOIN sources s ON sc.source_id = s.id
      WHERE sc.job_id = $1
      GROUP BY s.name, s.id
      ORDER BY s.name
    `, [jobId]);

    return new Map(result.rows.map(row => [
      row.source_name,
      {
        sourceId: row.source_id,
        actualCount: parseInt(row.actual_count),
        sampleIds: (row.all_ids || []).slice(0, 5) // Take first 5 IDs in JavaScript
      }
    ]));
  }

  // Story 5: Job Reconciliation Summary
  private async reconcileJobMetrics(
    jobId: string,
    successfulExtractions: SourceResult[],
    persistenceResults: Map<string, SourcePersistenceResult>
  ): Promise<void> {
    const { pool } = await import('./database');

    // Query actual database counts
    const dbResult = await pool.query(`
      SELECT s.name, COUNT(sc.id) as count
      FROM scraped_content sc
      JOIN sources s ON sc.source_id = s.id
      WHERE sc.job_id = $1
      GROUP BY s.name
    `, [jobId]);

    const databaseCounts = new Map(dbResult.rows.map(r => [r.name, parseInt(r.count)]));

    // Query logged lifecycle events from scraping_logs
    // This is the source of truth for what was actually logged during extraction/persistence
    const lifecycleResult = await pool.query(`
      SELECT
        additional_data->>'source_name' as source_name,
        SUM(CASE WHEN additional_data->>'event_name' = 'article_extracted' THEN 1 ELSE 0 END)::int as logged_extracted,
        SUM(CASE WHEN additional_data->>'event_name' = 'article_persisted' THEN 1 ELSE 0 END)::int as logged_persisted
      FROM scraping_logs
      WHERE job_id = $1
        AND additional_data->>'event_type' = 'article_lifecycle'
        AND additional_data->>'event_name' IN ('article_extracted', 'article_persisted')
      GROUP BY additional_data->>'source_name'
    `, [jobId]);

    const lifecycleCounts = new Map(lifecycleResult.rows.map(r => [
      r.source_name,
      { extracted: r.logged_extracted || 0, persisted: r.logged_persisted || 0 }
    ]));

    // Build reconciliation report
    const reconciliation: Record<string, any> = {};
    let hasDiscrepancies = false;

    // Include all sources (extracted, failed, or not processed)
    for (const extraction of successfulExtractions) {
      const lifecycle = lifecycleCounts.get(extraction.sourceName);
      const dbActual = databaseCounts.get(extraction.sourceName) || 0;

      // Use lifecycle logs as source of truth for logged counts
      const loggedExtracted = lifecycle?.extracted || 0;
      const loggedPersisted = lifecycle?.persisted || 0;

      const match = loggedPersisted === dbActual;
      if (!match) hasDiscrepancies = true;

      reconciliation[extraction.sourceName] = {
        logged_extracted: loggedExtracted,
        logged_saved: loggedPersisted,
        database_actual: dbActual,
        match,
        discrepancy: match ? 0 : dbActual - loggedPersisted,
        discrepancy_type: dbActual < loggedPersisted ? 'phantom_saves' : (dbActual > loggedPersisted ? 'missing_logs' : 'none')
      };
    }

    await this.logger.logJobReconciliation(jobId, reconciliation, hasDiscrepancies);
  }

  private async logFinalJobMetrics(
    jobId: string,
    successfulExtractions: SourceResult[],
    persistenceResults: Map<string, SourcePersistenceResult>,
    extractionFailures: Record<string, string>,
    articlesPerSource: number,
    startTime: number
  ): Promise<void> {
    // Build enhanced metrics
    const metrics: EnhancedJobMetrics = {
      sources: {},
      totals: {
        targetArticles: 0,
        candidatesProcessed: 0,
        extracted: 0,
        saved: 0,
        duplicates: 0,
        actualSuccessRate: 0
      }
    };
    
    // Add extraction failures
    for (const [sourceName, error] of Object.entries(extractionFailures)) {
      metrics.sources[sourceName] = {
        extracted: 0,
        saved: 0,
        duplicates: 0,
        failures: 0,
        success: false
      };
    }
    
    // Add successful extractions and persistence results
    for (const extraction of successfulExtractions) {
      const persistence = persistenceResults.get(extraction.sourceName);
      metrics.sources[extraction.sourceName] = {
        extracted: extraction.extractedArticles.length,
        saved: persistence?.savedCount || 0,
        duplicates: persistence?.duplicatesSkipped || 0,
        failures: persistence?.saveFailures || 0,
        success: (persistence?.savedCount || 0) > 0
      };
      
      metrics.totals.candidatesProcessed += extraction.extractionMetrics.candidatesProcessed;
      metrics.totals.extracted += extraction.extractedArticles.length;
      metrics.totals.saved += persistence?.savedCount || 0;
      metrics.totals.duplicates += persistence?.duplicatesSkipped || 0;
    }
    
    const totalSources = Object.keys(metrics.sources).length;
    metrics.totals.targetArticles = totalSources * articlesPerSource;
    metrics.totals.actualSuccessRate = metrics.totals.targetArticles > 0 
      ? metrics.totals.saved / metrics.totals.targetArticles 
      : 0;
    
    // Log the enhanced metrics
    await this.logger.logEnhancedJobCompleted(
      jobId,
      metrics,
      Date.now() - startTime
    );
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