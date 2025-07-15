import { scraperDb } from './database';
import { ScrapingLogEntry } from './types';

export interface LogContext {
  jobId?: string;
  sourceId?: string;
  sourceName?: string;
  operation?: string;
  phase?: string;
  stepNumber?: number;
  totalSteps?: number;
  articleUrl?: string;
  articleTitle?: string;
}

export interface LogMetadata {
  duration?: number;
  memoryUsage?: number;
  itemsProcessed?: number;
  errorDetails?: any;
  httpStatus?: number;
  userAgent?: string;
  responseSize?: number;
  retryAttempt?: number;
  duplicateDetected?: boolean;
  contentHash?: string;
}

export class EnhancedLogger {
  private logBuffer: Omit<ScrapingLogEntry, 'id'>[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicFlush();
  }

  /**
   * Log with full context and metadata
   */
  async logDetailed(
    level: 'info' | 'warning' | 'error',
    message: string,
    context: LogContext = {},
    metadata: LogMetadata = {}
  ): Promise<void> {
    const timestamp = new Date();
    
    // Create structured log entry
    const logEntry: Omit<ScrapingLogEntry, 'id'> = {
      jobId: context.jobId || 'unknown',
      sourceId: context.sourceId,
      logLevel: level,
      message: this.formatMessage(message, context),
      timestamp,
      additionalData: {
        context,
        metadata,
        timestamp: timestamp.toISOString()
      }
    };

    // Console log for immediate visibility
    const formattedMessage = this.formatConsoleMessage(level, message, context, metadata);
    console.log(formattedMessage);

    // Add to buffer for batch processing
    this.logBuffer.push(logEntry);

    // Flush immediately for errors or when buffer is full
    if (level === 'error' || this.logBuffer.length >= this.BATCH_SIZE) {
      await this.flushLogs();
    }
  }

  /**
   * Log job start with full context
   */
  async logJobStart(jobId: string, sources: string[], maxArticles: number): Promise<void> {
    await this.logDetailed(
      'info',
      'Job execution started',
      {
        jobId,
        operation: 'job_start',
        phase: 'initialization'
      },
      {
        itemsProcessed: sources.length,
        userAgent: 'Veritas-Scraper/1.0'
      }
    );

    // Log each source that will be processed
    for (let i = 0; i < sources.length; i++) {
      await this.logDetailed(
        'info',
        `Source queued for processing`,
        {
          jobId,
          sourceName: sources[i],
          operation: 'source_queue',
          phase: 'initialization',
          stepNumber: i + 1,
          totalSteps: sources.length
        },
        {
          itemsProcessed: maxArticles
        }
      );
    }
  }

  /**
   * Log source processing start
   */
  async logSourceStart(jobId: string, sourceId: string, sourceName: string, rssUrl: string): Promise<void> {
    await this.logDetailed(
      'info',
      `Starting RSS feed processing`,
      {
        jobId,
        sourceId,
        sourceName,
        operation: 'rss_parse_start',
        phase: 'rss_parsing'
      },
      {
        userAgent: 'Veritas-Scraper/1.0'
      }
    );
  }

  /**
   * Log RSS feed parse results
   */
  async logRSSParseResult(
    jobId: string, 
    sourceId: string, 
    sourceName: string, 
    itemCount: number, 
    duration: number,
    error?: Error
  ): Promise<void> {
    if (error) {
      await this.logDetailed(
        'error',
        `RSS feed parsing failed`,
        {
          jobId,
          sourceId,
          sourceName,
          operation: 'rss_parse_error',
          phase: 'rss_parsing'
        },
        {
          duration,
          errorDetails: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        }
      );
    } else {
      await this.logDetailed(
        'info',
        `RSS feed parsed successfully`,
        {
          jobId,
          sourceId,
          sourceName,
          operation: 'rss_parse_success',
          phase: 'rss_parsing'
        },
        {
          duration,
          itemsProcessed: itemCount
        }
      );
    }
  }

  /**
   * Log article processing
   */
  async logArticleProcessing(
    jobId: string,
    sourceId: string,
    sourceName: string,
    articleUrl: string,
    articleTitle: string,
    stepNumber: number,
    totalSteps: number
  ): Promise<void> {
    await this.logDetailed(
      'info',
      `Processing article`,
      {
        jobId,
        sourceId,
        sourceName,
        articleUrl,
        articleTitle,
        operation: 'article_process',
        phase: 'content_extraction',
        stepNumber,
        totalSteps
      }
    );
  }

  /**
   * Log article processing result
   */
  async logArticleResult(
    jobId: string,
    sourceId: string,
    sourceName: string,
    articleUrl: string,
    articleTitle: string,
    success: boolean,
    duration: number,
    isDuplicate: boolean = false,
    contentHash?: string,
    error?: Error
  ): Promise<void> {
    const level = success ? 'info' : 'error';
    const operation = success ? 'article_success' : 'article_error';
    
    await this.logDetailed(
      level,
      success ? 'Article processed successfully' : 'Article processing failed',
      {
        jobId,
        sourceId,
        sourceName,
        articleUrl,
        articleTitle,
        operation,
        phase: 'content_extraction'
      },
      {
        duration,
        duplicateDetected: isDuplicate,
        contentHash,
        errorDetails: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      }
    );
  }

  /**
   * Log job completion
   */
  async logJobComplete(
    jobId: string,
    success: boolean,
    totalDuration: number,
    articlesProcessed: number,
    articlesStored: number,
    errorsCount: number
  ): Promise<void> {
    await this.logDetailed(
      success ? 'info' : 'error',
      success ? 'Job completed successfully' : 'Job completed with errors',
      {
        jobId,
        operation: success ? 'job_complete' : 'job_error',
        phase: 'completion'
      },
      {
        duration: totalDuration,
        itemsProcessed: articlesProcessed
      }
    );

    // Force flush all remaining logs for job completion
    await this.flushLogs();
  }

  /**
   * Format message with context
   */
  private formatMessage(message: string, context: LogContext): string {
    let formatted = message;
    
    if (context.sourceName) {
      formatted += ` [Source: ${context.sourceName}]`;
    }
    
    if (context.operation) {
      formatted += ` [Op: ${context.operation}]`;
    }
    
    if (context.phase) {
      formatted += ` [Phase: ${context.phase}]`;
    }
    
    if (context.stepNumber && context.totalSteps) {
      formatted += ` [Step: ${context.stepNumber}/${context.totalSteps}]`;
    }
    
    if (context.articleTitle) {
      formatted += ` [Article: ${context.articleTitle.substring(0, 50)}...]`;
    }
    
    return formatted;
  }

  /**
   * Format console message for immediate visibility
   */
  private formatConsoleMessage(
    level: string,
    message: string,
    context: LogContext,
    metadata: LogMetadata
  ): string {
    const timestamp = new Date().toISOString();
    const jobId = context.jobId ? context.jobId.substring(0, 8) : 'unknown';
    
    let formatted = `[${timestamp}] [${level.toUpperCase()}] [Job:${jobId}] ${message}`;
    
    if (context.sourceName) {
      formatted += ` [${context.sourceName}]`;
    }
    
    if (metadata.duration) {
      formatted += ` (${metadata.duration}ms)`;
    }
    
    if (metadata.itemsProcessed) {
      formatted += ` [Items: ${metadata.itemsProcessed}]`;
    }
    
    return formatted;
  }

  /**
   * Flush logs to database
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;
    
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      await scraperDb.addScrapingLogs(logsToFlush);
    } catch (error) {
      console.error('[EnhancedLogger] Failed to flush logs to database:', error);
      // Re-add failed logs to buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * Start periodic log flushing
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(async () => {
      await this.flushLogs();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Stop periodic flushing and flush remaining logs
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    await this.flushLogs();
  }
}

// Export singleton instance
export const enhancedLogger = new EnhancedLogger(); 