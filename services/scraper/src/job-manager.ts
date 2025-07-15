import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { scraperDb } from './database';
import { enhancedLogger } from './enhanced-logger';
import { 
  EnhancedScrapingJob, 
  ScrapingLogEntry, 
  TriggerScrapingRequest 
} from './types';

export interface JobQueueItem {
  jobId: string;
  request: TriggerScrapingRequest;
  priority: number;
  retryCount: number;
  createdAt: Date;
}

export interface JobExecutionContext {
  jobId: string;
  request: TriggerScrapingRequest;
  startTime: Date;
  currentSource?: string;
  articlesProcessed: number;
  errorsEncountered: number;
  isAborted: boolean;
}

/**
 * Job Management System for scraper service
 * Handles job queuing, execution tracking, and status management
 */
export class JobManager extends EventEmitter {
  private jobQueue: JobQueueItem[] = [];
  private activeJobs: Map<string, JobExecutionContext> = new Map();
  private isProcessing: boolean = false;
  private readonly maxConcurrentJobs: number = 2;
  private readonly maxRetryAttempts: number = 3;

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup internal event listeners
   */
  private setupEventListeners(): void {
    this.on('job-queued', this.processQueue.bind(this));
    this.on('job-completed', this.handleJobCompletion.bind(this));
    this.on('job-failed', this.handleJobFailure.bind(this));
  }

  /**
   * Queue a new scraping job
   */
  async queueJob(request: TriggerScrapingRequest): Promise<string> {
    const jobId = uuidv4();
    
    // Create job in database
    const job: Omit<EnhancedScrapingJob, 'id' | 'createdAt' | 'updatedAt'> = {
      triggeredAt: new Date(),
      status: 'running',
      sourcesRequested: request.sources,
      articlesPerSource: request.maxArticles || 3,
      totalArticlesScraped: 0,
      totalErrors: 0,
      jobLogs: `Job ${jobId} queued for processing`
    };

    const dbJobId = await scraperDb.createScrapingJob(job);
    
    // Enhanced logging for job start
    await enhancedLogger.logJobStart(dbJobId, request.sources, request.maxArticles || 3);
    
    // Add to queue
    const queueItem: JobQueueItem = {
      jobId: dbJobId,
      request,
      priority: 1,
      retryCount: 0,
      createdAt: new Date()
    };

    this.jobQueue.push(queueItem);
    this.jobQueue.sort((a, b) => b.priority - a.priority);

    await this.logJobActivity(dbJobId, 'info', `Job queued with ${request.sources.length} sources`);
    
    this.emit('job-queued', queueItem);
    
    // Start processing queue immediately
    setImmediate(() => this.processQueue());
    
    return dbJobId;
  }

  /**
   * Process job queue
   */
  private async processQueue(): Promise<void> {
    console.log(`[JobManager] Processing queue - isProcessing: ${this.isProcessing}, queueLength: ${this.jobQueue.length}, activeJobs: ${this.activeJobs.size}`);
    
    if (this.isProcessing || this.jobQueue.length === 0) {
      if (this.isProcessing) {
        console.log('[JobManager] Already processing, skipping queue processing');
      } else {
        console.log('[JobManager] Queue is empty, nothing to process');
      }
      return;
    }

    if (this.activeJobs.size >= this.maxConcurrentJobs) {
      console.log(`[JobManager] Max concurrent jobs reached (${this.activeJobs.size}/${this.maxConcurrentJobs})`);
      await this.logSystemActivity('warning', 'Job queue full - waiting for available slots');
      return;
    }

    this.isProcessing = true;
    const nextJob = this.jobQueue.shift();
    
    if (!nextJob) {
      console.log('[JobManager] No job found in queue after shift');
      this.isProcessing = false;
      return;
    }

    console.log(`[JobManager] Starting execution of job ${nextJob.jobId} with ${nextJob.request.sources.length} sources`);
    
    try {
      await this.executeJob(nextJob);
      console.log(`[JobManager] Job ${nextJob.jobId} execution completed successfully`);
    } catch (error) {
      console.error(`[JobManager] Job ${nextJob.jobId} execution failed:`, error);
      await this.handleJobExecutionError(nextJob, error);
    } finally {
      this.isProcessing = false;
      console.log(`[JobManager] Queue processing finished - remaining jobs: ${this.jobQueue.length}`);
      // Continue processing queue if more jobs available
      if (this.jobQueue.length > 0) {
        console.log('[JobManager] More jobs in queue, scheduling next processing');
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Execute a scraping job
   */
  async executeJob(queueItem: JobQueueItem): Promise<void> {
    const context: JobExecutionContext = {
      jobId: queueItem.jobId,
      request: queueItem.request,
      startTime: new Date(),
      articlesProcessed: 0,
      errorsEncountered: 0,
      isAborted: false
    };

    this.activeJobs.set(queueItem.jobId, context);

    try {
      await this.logJobActivity(queueItem.jobId, 'info', `Starting job execution for ${queueItem.request.sources.length} sources`);
      
      // Update job status to processing
      await scraperDb.updateScrapingJob(queueItem.jobId, {
        status: 'running'
      });

      // Process each source
      console.log(`[JobManager] Processing ${queueItem.request.sources.length} sources for job ${queueItem.jobId}`);
      for (const source of queueItem.request.sources) {
        if (context.isAborted) {
          console.log(`[JobManager] Job ${queueItem.jobId} aborted during source processing`);
          await this.logJobActivity(queueItem.jobId, 'warning', 'Job execution aborted');
          break;
        }

        context.currentSource = source;
        console.log(`[JobManager] Starting processing of source: ${source} for job ${queueItem.jobId}`);
        await this.logJobActivity(queueItem.jobId, 'info', `Processing source: ${source}`);

        try {
          // This will be called by the enhanced scraper
          console.log(`[JobManager] Emitting process-source event for ${source}`);
          this.emit('process-source', queueItem.jobId, source);
          
          // Wait for source processing to complete
          console.log(`[JobManager] Waiting for source processing to complete: ${source}`);
          await this.waitForSourceProcessing(queueItem.jobId, source);
          console.log(`[JobManager] Source processing completed for: ${source}`);
          
        } catch (error) {
          context.errorsEncountered++;
          console.error(`[JobManager] Source processing failed for ${source}:`, error);
          await this.logJobActivity(queueItem.jobId, 'error', `Source processing failed: ${source}`, error);
        }
      }
      
      console.log(`[JobManager] Finished processing all sources for job ${queueItem.jobId}`);

      // Complete job
      await this.completeJob(queueItem.jobId, context);
      
    } catch (error) {
      await this.failJob(queueItem.jobId, context, error);
    } finally {
      this.activeJobs.delete(queueItem.jobId);
    }
  }

  /**
   * Wait for source processing to complete
   */
  private async waitForSourceProcessing(jobId: string, source: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Source processing timeout: ${source}`));
      }, 60000); // 1 minute timeout

      const sourceCompleteHandler = (completedJobId: string, completedSource: string, error?: Error) => {
        if (completedJobId === jobId && completedSource === source) {
          clearTimeout(timeout);
          this.removeListener('source-completed', sourceCompleteHandler);
          
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      };

      this.on('source-completed', sourceCompleteHandler);
    });
  }

  /**
   * Complete a job successfully
   */
  private async completeJob(jobId: string, context: JobExecutionContext): Promise<void> {
    const completedAt = new Date();
    const duration = completedAt.getTime() - context.startTime.getTime();

    await scraperDb.updateScrapingJob(jobId, {
      status: 'completed',
      completedAt,
      totalArticlesScraped: context.articlesProcessed,
      totalErrors: context.errorsEncountered,
      jobLogs: `Job completed successfully in ${duration}ms`
    });

    // Enhanced logging for job completion
    await enhancedLogger.logJobComplete(
      jobId,
      true,
      duration,
      context.articlesProcessed,
      context.articlesProcessed, // Assuming all processed articles are stored
      context.errorsEncountered
    );

    await this.logJobActivity(jobId, 'info', `Job completed: ${context.articlesProcessed} articles, ${context.errorsEncountered} errors`);
    
    this.emit('job-completed', jobId, context);
  }

  /**
   * Fail a job
   */
  private async failJob(jobId: string, context: JobExecutionContext, error: unknown): Promise<void> {
    const completedAt = new Date();
    const duration = completedAt.getTime() - context.startTime.getTime();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await scraperDb.updateScrapingJob(jobId, {
      status: 'failed',
      completedAt,
      totalArticlesScraped: context.articlesProcessed,
      totalErrors: context.errorsEncountered + 1,
      jobLogs: `Job failed: ${errorMessage}`
    });

    // Enhanced logging for job failure
    await enhancedLogger.logJobComplete(
      jobId,
      false,
      duration,
      context.articlesProcessed,
      context.articlesProcessed,
      context.errorsEncountered + 1
    );

    await this.logJobActivity(jobId, 'error', `Job failed: ${errorMessage}`, error);
    
    this.emit('job-failed', jobId, context, error);
  }

  /**
   * Handle job completion
   */
  private async handleJobCompletion(jobId: string, context: JobExecutionContext): Promise<void> {
    await this.logSystemActivity('info', `Job ${jobId} completed successfully`);
    
    // Continue processing queue
    if (this.jobQueue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Handle job failure
   */
  private async handleJobFailure(jobId: string, context: JobExecutionContext, error: unknown): Promise<void> {
    await this.logSystemActivity('error', `Job ${jobId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Continue processing queue
    if (this.jobQueue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Handle job execution error
   */
  private async handleJobExecutionError(queueItem: JobQueueItem, error: unknown): Promise<void> {
    queueItem.retryCount++;
    
    if (queueItem.retryCount <= this.maxRetryAttempts) {
      await this.logJobActivity(queueItem.jobId, 'warning', `Job execution failed, retrying (${queueItem.retryCount}/${this.maxRetryAttempts})`);
      
      // Add back to queue with lower priority
      queueItem.priority = Math.max(1, queueItem.priority - 1);
      this.jobQueue.push(queueItem);
      this.jobQueue.sort((a, b) => b.priority - a.priority);
      
    } else {
      await this.logJobActivity(queueItem.jobId, 'error', `Job execution failed after ${this.maxRetryAttempts} attempts`, error);
      
      // Mark as failed in database
      await scraperDb.updateScrapingJob(queueItem.jobId, {
        status: 'failed',
        completedAt: new Date(),
        jobLogs: `Job failed after ${this.maxRetryAttempts} retry attempts`
      });
    }
  }

  /**
   * Abort a running job
   */
  async abortJob(jobId: string): Promise<boolean> {
    const context = this.activeJobs.get(jobId);
    if (!context) {
      return false;
    }

    context.isAborted = true;
    
    await scraperDb.updateScrapingJob(jobId, {
      status: 'cancelled',
      completedAt: new Date(),
      jobLogs: 'Job aborted by user request'
    });

    await this.logJobActivity(jobId, 'warning', 'Job aborted by user request');
    
    this.activeJobs.delete(jobId);
    return true;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): JobExecutionContext | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    activeJobs: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.jobQueue.length,
      activeJobs: this.activeJobs.size,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Update job progress
   */
  async updateJobProgress(jobId: string, articlesProcessed: number, errors: number = 0): Promise<void> {
    const context = this.activeJobs.get(jobId);
    if (context) {
      context.articlesProcessed = articlesProcessed;
      context.errorsEncountered += errors;
      
      // Update database
      await scraperDb.updateScrapingJob(jobId, {
        totalArticlesScraped: articlesProcessed,
        totalErrors: context.errorsEncountered
      });
    }
  }

  /**
   * Signal source processing completion
   */
  async signalSourceCompleted(jobId: string, source: string, error?: Error): Promise<void> {
    this.emit('source-completed', jobId, source, error);
    
    if (error) {
      await this.logJobActivity(jobId, 'error', `Source ${source} completed with error: ${error.message}`, error);
    } else {
      await this.logJobActivity(jobId, 'info', `Source ${source} completed successfully`);
    }
  }

  /**
   * Log job-specific activity
   */
  private async logJobActivity(jobId: string, level: 'info' | 'warning' | 'error', message: string, error?: unknown): Promise<void> {
    const logEntry: Omit<ScrapingLogEntry, 'id'> = {
      jobId,
      logLevel: level,
      message,
      timestamp: new Date(),
      additionalData: error ? { error: error instanceof Error ? error.message : String(error) } : undefined
    };

    try {
      await scraperDb.addScrapingLog(logEntry);
    } catch (dbError) {
      console.error('[JobManager] Failed to log job activity:', dbError);
    }

    console.log(`[JobManager ${level.toUpperCase()}] Job ${jobId}: ${message}`);
  }

  /**
   * Log system-level activity
   */
  private async logSystemActivity(level: 'info' | 'warning' | 'error', message: string): Promise<void> {
    console.log(`[JobManager ${level.toUpperCase()}] ${message}`);
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    // Abort all active jobs
    const activeJobIds = Array.from(this.activeJobs.keys());
    for (const jobId of activeJobIds) {
      await this.abortJob(jobId);
    }

    // Clear queue
    this.jobQueue = [];
    
    await this.logSystemActivity('info', 'Job manager shutdown complete');
  }
}

// Export singleton instance
export const jobManager = new JobManager(); 