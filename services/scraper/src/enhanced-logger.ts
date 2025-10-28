import { logJobActivity } from './database';
import * as crypto from 'crypto';
import { SourceResult, SourcePersistenceResult, EnhancedJobMetrics, DatabaseVerificationResult } from './types';

interface HttpRequestData {
  url: string;
  method: string;
  id: string;
}

interface HttpResponseData {
  status: number;
  statusText: string;
  headers: Headers;
}

interface ExtractedArticle {
  title?: string;
  content?: string;
  author?: string | null;
  publicationDate?: string | null;
  language?: string;
}

export class EnhancedLogger {
  private correlations = new Map<string, string>(); // Track correlation IDs
  private performanceInterval?: NodeJS.Timeout;
  private activeRequests = new Set<string>();
  private requestTimings = new Map<string, number>();
  private completedRequests: number[] = [];
  
  // Format bytes for human-readable display
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  
  // Format duration for human-readable display
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
  
  // Start performance monitoring for a job
  startPerformanceMonitoring(jobId: string): void {
    this.performanceInterval = setInterval(() => {
      this.logPerformanceSnapshot(jobId);
    }, 30000); // Every 30 seconds
  }
  
  // Stop performance monitoring
  stopPerformanceMonitoring(): void {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = undefined;
    }
  }
  
  // Create a correlation ID for related events
  createCorrelationId(): string {
    return crypto.randomUUID();
  }
  
  // Log job lifecycle events
  async logJobStarted(
    jobId: string, 
    sources: string[], 
    articlesPerSource: number,
    triggerMethod: 'manual' | 'scheduled' | 'api' = 'manual'
  ): Promise<void> {
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Job started with ${sources.length} sources targeting ${sources.length * articlesPerSource} total articles`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'job_started',
        sources,
        articles_per_source: articlesPerSource,
        total_expected: sources.length * articlesPerSource,
        trigger_method: triggerMethod,
        max_concurrency: 4,
        memory_limit_mb: 512
      }
    });
    
    // Start performance monitoring
    this.startPerformanceMonitoring(jobId);
  }
  
  async logJobCompleted(
    jobId: string,
    totalScraped: number,
    totalExpected: number,
    durationMs: number,
    totalErrors: number
  ): Promise<void> {
    const successRate = totalExpected > 0 ? totalScraped / totalExpected : 0;
    
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Job completed: ${totalScraped}/${totalExpected} articles scraped in ${this.formatDuration(durationMs)} (${(successRate * 100).toFixed(0)}% success rate)`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'job_completed',
        total_scraped: totalScraped,
        total_expected: totalExpected,
        success_rate: successRate,
        duration_seconds: Math.round(durationMs / 1000),
        peak_memory_mb: process.memoryUsage().heapUsed / 1024 / 1024,
        total_requests: this.activeRequests.size + this.completedRequests.length,
        failed_requests: totalErrors
      }
    });
    
    // Stop performance monitoring
    this.stopPerformanceMonitoring();
  }
  
  // Log source processing events
  async logSourceStarted(
    jobId: string,
    sourceId: string,
    sourceName: string,
    rssUrl: string,
    targetArticles: number
  ): Promise<void> {
    await logJobActivity({
      jobId,
      sourceId,
      level: 'info',
      message: `Starting scrape for ${sourceName} (targeting ${targetArticles} articles)`,
      additionalData: {
        event_type: 'source',
        event_name: 'source_started',
        source_name: sourceName,
        rss_url: rssUrl,
        target_articles: targetArticles,
        source_health_score: 100 // Will be calculated based on recent performance
      }
    });
  }
  
  // Story 3: Renamed for clarity - logs extraction phase completion
  async logSourceExtractionCompleted(
    jobId: string,
    sourceId: string,
    sourceName: string,
    articlesScraped: number,
    targetArticles: number,
    durationMs: number
  ): Promise<void> {
    const successRate = targetArticles > 0 ? articlesScraped / targetArticles : 0;

    await logJobActivity({
      jobId,
      sourceId,
      level: 'info',
      message: `Source ${sourceName} extraction completed: ${articlesScraped} articles extracted (pending persistence) - target was ${targetArticles}`,
      additionalData: {
        event_type: 'source',
        event_name: 'source_extraction_completed',
        phase: 'extraction',
        source_name: sourceName,
        articles_extracted: articlesScraped,
        target_articles: targetArticles,
        extraction_rate: successRate,
        duration_ms: durationMs,
        note: 'These articles have not yet been persisted to database'
      }
    });
  }
  
  // Log HTTP request/response events
  async logHttpRequest(
    jobId: string,
    sourceId: string,
    request: HttpRequestData,
    correlationId?: string
  ): Promise<string> {
    const requestId = request.id || crypto.randomUUID();
    this.activeRequests.add(requestId);
    this.requestTimings.set(requestId, Date.now());
    
    await logJobActivity({
      jobId,
      sourceId,
      level: 'info' as const,
      message: `HTTP ${request.method} ${request.url}`,
      additionalData: {
        event_type: 'http',
        event_name: 'http_request',
        correlation_id: correlationId,
        http: {
          request_id: requestId,
          url: request.url,
          method: request.method,
          timeout_ms: 30000
        }
      }
    });
    
    return requestId;
  }
  
  async logHttpResponse(
    jobId: string,
    sourceId: string,
    request: HttpRequestData,
    response: HttpResponseData,
    correlationId?: string
  ): Promise<void> {
    const startTime = this.requestTimings.get(request.id);
    const duration = startTime ? Date.now() - startTime : 0;
    const size = parseInt(response.headers.get('content-length') || '0');
    
    this.activeRequests.delete(request.id);
    this.requestTimings.delete(request.id);
    this.completedRequests.push(duration);
    
    // Keep only last 100 request times for average calculation
    if (this.completedRequests.length > 100) {
      this.completedRequests.shift();
    }
    
    await logJobActivity({
      jobId,
      sourceId,
      level: response.status < 400 ? 'info' : 'error',
      message: `HTTP ${response.status} ${response.statusText} from ${request.url} (${this.formatDuration(duration)}, ${this.formatBytes(size)})`,
      additionalData: {
        event_type: 'http',
        event_name: response.status < 400 ? 'http_response_success' : 'http_response_error',
        correlation_id: correlationId,
        http: {
          request_id: request.id,
          url: request.url,
          method: request.method,
          status: response.status,
          response_ms: duration,
          size_bytes: size
        }
      }
    });
  }
  
  async logHttpError(
    jobId: string,
    sourceId: string,
    request: HttpRequestData,
    error: Error,
    retryCount: number,
    maxRetries: number,
    correlationId?: string
  ): Promise<void> {
    const startTime = this.requestTimings.get(request.id);
    const duration = startTime ? Date.now() - startTime : 0;
    
    this.activeRequests.delete(request.id);
    this.requestTimings.delete(request.id);
    
    await logJobActivity({
      jobId,
      sourceId,
      level: 'error',
      message: `HTTP request failed: ${request.url} - ${error.message}`,
      additionalData: {
        event_type: 'http',
        event_name: 'http_error',
        correlation_id: correlationId,
        http: {
          request_id: request.id,
          url: request.url,
          method: request.method,
          error_code: (error as any).code || 'UNKNOWN',
          retry_count: retryCount,
          max_retries: maxRetries,
          response_ms: duration
        },
        error: {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
          recoverable: retryCount < maxRetries
        }
      }
    });
  }
  
  // Log content extraction events
  async logExtractionResult(
    jobId: string,
    sourceId: string,
    url: string,
    article: ExtractedArticle,
    extractionTime: number,
    method: 'primary' | 'fallback' = 'primary',
    correlationId?: string
  ): Promise<void> {
    const qualityScore = this.calculateQualityScore(article);
    
    await logJobActivity({
      jobId,
      sourceId,
      level: qualityScore > 50 ? 'info' : 'warning',
      message: `Content extracted successfully from ${url} (Quality: ${qualityScore}/100)`,
      additionalData: {
        event_type: 'extraction',
        event_name: 'extraction_completed',
        correlation_id: correlationId,
        extraction: {
          url,
          method,
          quality_score: qualityScore,
          content_length: article.content?.length || 0,
          has_title: !!article.title,
          has_author: !!article.author,
          has_date: !!article.publicationDate,
          extraction_ms: extractionTime
        }
      }
    });
  }
  
  async logExtractionError(
    jobId: string,
    sourceId: string,
    url: string,
    error: Error,
    method: 'primary' | 'fallback' = 'primary',
    correlationId?: string
  ): Promise<void> {
    await logJobActivity({
      jobId,
      sourceId,
      level: 'error',
      message: `Extraction failed for ${url}: ${error.message}`,
      additionalData: {
        event_type: 'extraction',
        event_name: 'extraction_failed',
        correlation_id: correlationId,
        extraction: {
          url,
          method,
          error_message: error.message
        },
        error: {
          type: error.constructor.name,
          message: error.message,
          recoverable: method === 'primary' // Can try fallback
        }
      }
    });
  }
  
  // Log performance snapshots
  async logPerformanceSnapshot(jobId: string): Promise<void> {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    await logJobActivity({
      jobId,
      level: 'info' as const,
      message: `Performance: Memory ${memMB}MB, Active requests: ${this.getActiveRequests()}`,
      additionalData: {
        event_type: 'performance',
        event_name: 'performance_snapshot',
        perf: {
          mem_mb: memMB,
          cpu_pct: await this.getCpuUsage(),
          active_reqs: this.getActiveRequests(),
          queue_size: this.getQueueSize(),
          avg_resp_ms: this.getAvgResponseTime()
        }
      }
    });
  }
  
  // Calculate quality score for extracted content
  private calculateQualityScore(article: ExtractedArticle): number {
    let score = 0;
    
    // Title quality (30 points)
    if (article.title) {
      score += 10;
      if (article.title.length > 20) score += 10;
      if (article.title.length < 200) score += 10;
    }
    
    // Content quality (40 points)
    if (article.content) {
      score += 10;
      if (article.content.length > 100) score += 10;
      if (article.content.length > 500) score += 10;
      if (article.content.length < 10000) score += 10;
    }
    
    // Metadata (30 points)
    if (article.author) score += 10;
    if (article.publicationDate) score += 10;
    if (article.language && article.language !== 'unknown') score += 10;
    
    return score;
  }
  
  // Helper methods
  private getActiveRequests(): number {
    return this.activeRequests.size;
  }
  
  private getQueueSize(): number {
    // This would be implemented based on your crawler's queue
    return 0;
  }
  
  private getAvgResponseTime(): number {
    if (this.completedRequests.length === 0) return 0;
    const sum = this.completedRequests.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.completedRequests.length);
  }
  
  private async getCpuUsage(): Promise<number> {
    // Simple CPU usage approximation
    // In production, you might want to use a more sophisticated method
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = (endUsage.user + endUsage.system) / 1000; // microseconds to milliseconds
    return Math.min(Math.round(totalUsage), 100);
  }
  
  // New methods for enhanced logging
  
  async logSourceExtraction(
    jobId: string,
    sourceId: string,
    sourceName: string,
    metrics: SourceResult['extractionMetrics']
  ): Promise<void> {
    await logJobActivity({
      jobId,
      sourceId,
      level: 'info',
      message: `Source extraction completed for ${sourceName}: ${metrics.extractionSuccesses}/${metrics.extractionAttempts} articles extracted`,
      additionalData: {
        event_type: 'extraction',
        event_name: 'source_extraction_completed',
        source_name: sourceName,
        extraction_metrics: metrics
      }
    });
  }
  
  async logSourcePersisted(
    jobId: string,
    sourceId: string,
    sourceName: string,
    persistence: SourcePersistenceResult
  ): Promise<void> {
    await logJobActivity({
      jobId,
      sourceId,
      level: persistence.savedCount > 0 ? 'info' : 'warning',
      message: `Source persistence completed for ${sourceName}: ${persistence.savedCount} saved, ${persistence.duplicatesSkipped} duplicates, ${persistence.saveFailures} failures`,
      additionalData: {
        event_type: 'persistence',
        event_name: 'source_persistence_completed',
        source_name: sourceName,
        persistence_metrics: {
          saved: persistence.savedCount,
          duplicates: persistence.duplicatesSkipped,
          failures: persistence.saveFailures,
          success: persistence.savedCount > 0
        }
      }
    });
  }
  
  async logExtractionPhaseCompleted(
    jobId: string,
    successfulExtractions: SourceResult[],
    extractionFailures: Record<string, string>
  ): Promise<void> {
    const totalExtracted = successfulExtractions.reduce((acc, sr) => acc + sr.extractedArticles.length, 0);
    const totalSources = successfulExtractions.length + Object.keys(extractionFailures).length;
    
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Extraction phase completed: ${totalExtracted} articles extracted from ${successfulExtractions.length}/${totalSources} sources`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'extraction_phase_completed',
        phase: 'extraction',
        successful_sources: successfulExtractions.length,
        failed_sources: Object.keys(extractionFailures).length,
        total_extracted: totalExtracted,
        extraction_failures: extractionFailures
      }
    });
  }
  
  async logSourceExtractionFailed(
    jobId: string,
    sourceName: string,
    error: any
  ): Promise<void> {
    await logJobActivity({
      jobId,
      level: 'error',
      message: `Source extraction failed for ${sourceName}: ${error?.message || 'Unknown error'}`,
      additionalData: {
        event_type: 'extraction',
        event_name: 'source_extraction_failed',
        source_name: sourceName,
        error: {
          type: error?.constructor?.name || 'Unknown',
          message: error?.message || String(error),
          stack: error?.stack
        }
      }
    });
  }
  
  async logEnhancedJobCompleted(
    jobId: string,
    metrics: EnhancedJobMetrics,
    durationMs: number
  ): Promise<void> {
    const successRate = metrics.totals.actualSuccessRate;

    await logJobActivity({
      jobId,
      level: 'info',
      message: `Job completed: ${metrics.totals.saved}/${metrics.totals.targetArticles} articles saved in ${this.formatDuration(durationMs)} (${(successRate * 100).toFixed(0)}% success rate)`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'job_completed_enhanced',
        duration_seconds: Math.round(durationMs / 1000),
        enhanced_metrics: metrics,
        extraction_rate: metrics.totals.candidatesProcessed > 0
          ? metrics.totals.extracted / metrics.totals.candidatesProcessed
          : 0,
        persistence_rate: metrics.totals.extracted > 0
          ? metrics.totals.saved / metrics.totals.extracted
          : 0,
        peak_memory_mb: process.memoryUsage().heapUsed / 1024 / 1024
      }
    });
  }

  // Story 2: Article-Level Lifecycle Tracking
  async logArticleLifecycle(
    jobId: string,
    sourceId: string,
    articleTrackingId: string,
    stage: 'queued' | 'extracted' | 'validated' | 'persisted' | 'skipped' | 'failed',
    details: {
      sourceName: string;
      sourceUrl: string;
      error?: string;
      databaseArticleId?: string;
      reason?: string;
      contentLength?: number;
      qualityScore?: number;
    }
  ): Promise<void> {
    await logJobActivity({
      jobId,
      sourceId,
      level: stage === 'failed' ? 'error' : 'info',
      message: `Article ${stage}: ${details.sourceUrl}`,
      additionalData: {
        event_type: 'article_lifecycle',
        event_name: `article_${stage}`,
        article_tracking_id: articleTrackingId,
        source_name: details.sourceName,
        source_id: sourceId,
        source_url: details.sourceUrl,
        stage,
        timestamp_ms: Date.now(),
        ...details
      }
    });
  }

  // Story 4: Source Attribution Debug Logging
  async logInsertAttribution(
    jobId: string,
    articleTrackingId: string,
    attribution: {
      sourceName: string;
      sourceId: string;
      sourceUrl: string;
      sourceUrlDomain: string;
    },
    insertSuccess: boolean,
    databaseArticleId?: string,
    error?: string
  ): Promise<void> {
    await logJobActivity({
      jobId,
      level: insertSuccess ? 'info' : 'error',
      message: insertSuccess
        ? `Article inserted with source attribution: ${attribution.sourceName}`
        : `Article INSERT failed: ${error}`,
      additionalData: {
        event_type: 'persistence',
        event_name: insertSuccess ? 'article_insert_success' : 'article_insert_failure',
        article_tracking_id: articleTrackingId,
        source_attribution: attribution,
        insert_success: insertSuccess,
        database_article_id: databaseArticleId,
        error
      }
    });
  }

  // Story 3: Phase Transition Logging
  async logPhaseTransition(
    jobId: string,
    phaseFrom: string,
    phaseTo: string
  ): Promise<void> {
    await logJobActivity({
      jobId,
      level: 'info',
      message: `=== ${phaseTo.toUpperCase()} PHASE STARTED ===`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'phase_transition',
        phase_from: phaseFrom,
        phase_to: phaseTo
      }
    });
  }

  // Story 5: Job Reconciliation Summary
  async logJobReconciliation(
    jobId: string,
    reconciliation: Record<string, any>,
    hasDiscrepancies: boolean
  ): Promise<void> {
    const totalLoggedExtracted = Object.values(reconciliation).reduce((sum: number, s: any) => sum + (s.logged_extracted || 0), 0);
    const totalLoggedSaved = Object.values(reconciliation).reduce((sum: number, s: any) => sum + (s.logged_saved || 0), 0);
    const totalActual = Object.values(reconciliation).reduce((sum: number, s: any) => sum + (s.database_actual || 0), 0);

    await logJobActivity({
      jobId,
      level: hasDiscrepancies ? 'warning' : 'info',
      message: hasDiscrepancies
        ? `Job reconciliation FAILED: Discrepancies found between logs and database (logged: ${totalLoggedSaved}, actual: ${totalActual})`
        : `Job reconciliation passed: All counts match database (${totalActual} articles confirmed)`,
      additionalData: {
        event_type: 'lifecycle',
        event_name: 'job_reconciliation',
        reconciliation: {
          by_source: reconciliation,
          totals: {
            total_logged_extracted: totalLoggedExtracted,
            total_logged_saved: totalLoggedSaved,
            total_database_actual: totalActual,
            overall_discrepancy: totalActual - totalLoggedSaved
          }
        },
        has_discrepancies: hasDiscrepancies,
        discrepancy_severity: hasDiscrepancies ? 'critical' : 'none'
      }
    });
  }

  // Story 1: Database Verification Logging
  // Updated to use lifecycle logs as source of truth for "claimed" counts
  async logDatabaseVerification(
    jobId: string,
    databaseCounts: Map<string, DatabaseVerificationResult>
  ): Promise<void> {
    // Query actual logged persistence counts from scraping_logs (source of truth)
    const { pool } = await import('./database');
    const persistedResult = await pool.query(`
      SELECT
        additional_data->>'source_name' as source_name,
        additional_data->>'source_id' as source_id,
        COUNT(*)::int as logged_persisted
      FROM scraping_logs
      WHERE job_id = $1
        AND additional_data->>'event_name' = 'article_persisted'
      GROUP BY additional_data->>'source_name', additional_data->>'source_id'
    `, [jobId]);

    // Build map of source_name → {sourceId, logged count}
    const persistedCounts = new Map(persistedResult.rows.map(r => [
      r.source_name,
      { sourceId: r.source_id, loggedPersisted: r.logged_persisted || 0 }
    ]));

    const verificationResults: Record<string, any> = {};
    let hasDiscrepancies = false;
    let totalClaimed = 0;
    let totalActual = 0;

    // Build verification results for each source that has database records
    for (const [sourceName, dbResult] of databaseCounts) {
      const persisted = persistedCounts.get(sourceName);
      const claimed = persisted?.loggedPersisted || 0;
      const actual = dbResult.actualCount;
      const discrepancy = claimed !== actual;

      if (discrepancy) hasDiscrepancies = true;
      totalClaimed += claimed;
      totalActual += actual;

      verificationResults[sourceName] = {
        source_id: persisted?.sourceId || dbResult.sourceId,
        persistence_claimed: claimed,
        database_actual: actual,
        discrepancy,
        discrepancy_amount: actual - claimed,
        sample_article_ids: dbResult.sampleIds || []
      };
    }

    await logJobActivity({
      jobId,
      level: hasDiscrepancies ? 'warning' : 'info',
      message: hasDiscrepancies
        ? `Database verification FAILED: ${totalActual}/${totalClaimed} articles confirmed in database (discrepancy detected)`
        : `Database verification passed: ${totalActual}/${totalClaimed} articles confirmed in database`,
      additionalData: {
        event_type: 'verification',
        event_name: 'database_verification_completed',
        verification_results: verificationResults,
        total_claimed: totalClaimed,
        total_actual: totalActual,
        has_discrepancies: hasDiscrepancies
      }
    });
  }
}