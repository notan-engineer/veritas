import { logJobActivity } from './database';
import * as crypto from 'crypto';

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
  
  async logSourceCompleted(
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
      message: `Source ${sourceName} completed: ${articlesScraped}/${targetArticles} articles in ${this.formatDuration(durationMs)} (${(successRate * 100).toFixed(0)}% success)`,
      additionalData: {
        event_type: 'source',
        event_name: 'source_completed',
        source_name: sourceName,
        articles_scraped: articlesScraped,
        target_articles: targetArticles,
        success_rate: successRate,
        duration_ms: durationMs
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
}