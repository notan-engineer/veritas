import { EventEmitter } from 'events';

/**
 * Error categories for comprehensive error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  PARSING = 'parsing',
  VALIDATION = 'validation',
  RESOURCE = 'resource',
  CONFIGURATION = 'configuration',
  EXTERNAL_SERVICE = 'external_service',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  RETRY_WITH_BACKOFF = 'retry_with_backoff',
  FALLBACK = 'fallback',
  SKIP = 'skip',
  ABORT = 'abort',
  ESCALATE = 'escalate'
}

/**
 * Comprehensive error information
 */
export interface CategorizedError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  originalError: Error;
  context: Record<string, any>;
  timestamp: Date;
  recoveryStrategy: RecoveryStrategy;
  retryCount: number;
  maxRetries: number;
  source: string;
  stackTrace: string;
  metadata: Record<string, any>;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlerConfig {
  maxRetryAttempts: number;
  baseRetryDelay: number;
  maxRetryDelay: number;
  exponentialBackoffMultiplier: number;
  criticalErrorThreshold: number;
  errorRateThreshold: number;
  monitoringWindow: number; // in milliseconds
  alertingEnabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Error statistics for monitoring
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorRate: number;
  lastError: Date | null;
  averageRecoveryTime: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  criticalErrors: number;
}

/**
 * Retry configuration for different error types
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableCategories: ErrorCategory[];
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  channels: string[];
  thresholds: {
    errorRate: number;
    criticalErrors: number;
    consecutiveFailures: number;
  };
  cooldownPeriod: number; // in milliseconds
}

/**
 * Enhanced Error Handler for Scraper Service
 * Provides comprehensive error categorization, recovery strategies, and monitoring
 */
export class ErrorHandler extends EventEmitter {
  private config: ErrorHandlerConfig;
  private retryConfig: RetryConfig;
  private alertConfig: AlertConfig;
  private errorHistory: CategorizedError[] = [];
  private errorStats: ErrorStats;
  private lastAlertTime: Map<string, Date> = new Map();
  private activeRetries: Map<string, number> = new Map();
  private recoveryTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<ErrorHandlerConfig>) {
    super();
    
    this.config = {
      maxRetryAttempts: 3,
      baseRetryDelay: 1000,
      maxRetryDelay: 30000,
      exponentialBackoffMultiplier: 2,
      criticalErrorThreshold: 5,
      errorRateThreshold: 0.1,
      monitoringWindow: 300000, // 5 minutes
      alertingEnabled: true,
      logLevel: 'error',
      ...config
    };

    this.retryConfig = {
      maxAttempts: this.config.maxRetryAttempts,
      baseDelay: this.config.baseRetryDelay,
      maxDelay: this.config.maxRetryDelay,
      backoffMultiplier: this.config.exponentialBackoffMultiplier,
      retryableCategories: [
        ErrorCategory.NETWORK,
        ErrorCategory.DATABASE,
        ErrorCategory.TIMEOUT,
        ErrorCategory.EXTERNAL_SERVICE
      ]
    };

    this.alertConfig = {
      enabled: this.config.alertingEnabled,
      channels: ['console', 'log'],
      thresholds: {
        errorRate: this.config.errorRateThreshold,
        criticalErrors: this.config.criticalErrorThreshold,
        consecutiveFailures: 5
      },
      cooldownPeriod: 300000 // 5 minutes
    };

    this.errorStats = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorRate: 0,
      lastError: null,
      averageRecoveryTime: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      criticalErrors: 0
    };

    this.initializeErrorStats();
    this.setupEventListeners();
    this.startMonitoring();
  }

  /**
   * Initialize error statistics
   */
  private initializeErrorStats(): void {
    Object.values(ErrorCategory).forEach(category => {
      this.errorStats.errorsByCategory[category] = 0;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      this.errorStats.errorsBySeverity[severity] = 0;
    });
  }

  /**
   * Setup event listeners for error handling
   */
  private setupEventListeners(): void {
    this.on('error-categorized', this.handleCategorizedError.bind(this));
    this.on('recovery-attempted', this.handleRecoveryAttempt.bind(this));
    this.on('recovery-successful', this.handleRecoverySuccess.bind(this));
    this.on('recovery-failed', this.handleRecoveryFailure.bind(this));
    this.on('alert-triggered', this.handleAlert.bind(this));
  }

  /**
   * Start monitoring for error patterns and statistics
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.calculateErrorRate();
      this.checkAlertThresholds();
      this.cleanupOldErrors();
    }, 60000); // Check every minute
  }

  /**
   * Main error handling entry point
   */
  async handleError(
    error: Error,
    context: Record<string, any> = {},
    source: string = 'unknown'
  ): Promise<CategorizedError> {
    const categorizedError = this.categorizeError(error, context, source);
    
    // Update statistics
    this.updateErrorStats(categorizedError);
    
    // Add to history
    this.errorHistory.push(categorizedError);
    
    // Emit event for further processing
    this.emit('error-categorized', categorizedError);
    
    // Log error
    this.logError(categorizedError);
    
    return categorizedError;
  }

  /**
   * Categorize error based on type and context
   */
  private categorizeError(
    error: Error,
    context: Record<string, any>,
    source: string
  ): CategorizedError {
    const category = this.determineErrorCategory(error, context);
    const severity = this.determineSeverity(error, category, context);
    const recoveryStrategy = this.determineRecoveryStrategy(category, severity);
    
    return {
      id: this.generateErrorId(),
      category,
      severity,
      message: error.message,
      originalError: error,
      context,
      timestamp: new Date(),
      recoveryStrategy,
      retryCount: 0,
      maxRetries: this.getMaxRetries(category, severity),
      source,
      stackTrace: error.stack || '',
      metadata: {
        errorName: error.name,
        errorCode: (error as any).code,
        httpStatus: (error as any).status,
        ...context
      }
    };
  }

  /**
   * Determine error category based on error type and context
   */
  private determineErrorCategory(error: Error, context: Record<string, any>): ErrorCategory {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();
    
    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('connection') ||
        errorName.includes('networkerror') ||
        (error as any).code === 'ECONNREFUSED' ||
        (error as any).code === 'ENOTFOUND' ||
        (error as any).code === 'ETIMEDOUT') {
      return ErrorCategory.NETWORK;
    }

    // Database errors
    if (errorMessage.includes('database') || 
        errorMessage.includes('postgresql') || 
        errorMessage.includes('sql') ||
        errorName.includes('databaseerror') ||
        (error as any).code === 'ECONNRESET' ||
        context.source === 'database') {
      return ErrorCategory.DATABASE;
    }

    // Parsing errors
    if (errorMessage.includes('parse') || 
        errorMessage.includes('json') || 
        errorMessage.includes('xml') ||
        errorMessage.includes('rss') ||
        errorName.includes('syntaxerror') ||
        context.source === 'rss-parser') {
      return ErrorCategory.PARSING;
    }

    // Validation errors
    if (errorMessage.includes('validation') || 
        errorMessage.includes('invalid') || 
        errorMessage.includes('required') ||
        errorName.includes('validationerror') ||
        context.source === 'validation') {
      return ErrorCategory.VALIDATION;
    }

    // Resource errors
    if (errorMessage.includes('memory') || 
        errorMessage.includes('disk') || 
        errorMessage.includes('cpu') ||
        errorMessage.includes('resource') ||
        (error as any).code === 'EMFILE' ||
        (error as any).code === 'ENOMEM') {
      return ErrorCategory.RESOURCE;
    }

    // Configuration errors
    if (errorMessage.includes('config') || 
        errorMessage.includes('environment') || 
        errorMessage.includes('missing') ||
        context.source === 'configuration') {
      return ErrorCategory.CONFIGURATION;
    }

    // External service errors
    if (errorMessage.includes('service') || 
        errorMessage.includes('api') || 
        errorMessage.includes('external') ||
        context.source === 'external-service') {
      return ErrorCategory.EXTERNAL_SERVICE;
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('deadline') ||
        (error as any).code === 'TIMEOUT') {
      return ErrorCategory.TIMEOUT;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: Error,
    category: ErrorCategory,
    context: Record<string, any>
  ): ErrorSeverity {
    // Critical errors
    if (category === ErrorCategory.DATABASE || 
        category === ErrorCategory.RESOURCE ||
        category === ErrorCategory.CONFIGURATION ||
        error.message.includes('critical') ||
        context.critical === true) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (category === ErrorCategory.NETWORK || 
        category === ErrorCategory.EXTERNAL_SERVICE ||
        error.message.includes('failed') ||
        context.important === true) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (category === ErrorCategory.PARSING || 
        category === ErrorCategory.TIMEOUT ||
        error.message.includes('warning')) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors
    return ErrorSeverity.LOW;
  }

  /**
   * Determine recovery strategy
   */
  private determineRecoveryStrategy(
    category: ErrorCategory,
    severity: ErrorSeverity
  ): RecoveryStrategy {
    if (severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.ESCALATE;
    }

    if (this.retryConfig.retryableCategories.includes(category)) {
      return RecoveryStrategy.RETRY_WITH_BACKOFF;
    }

    if (category === ErrorCategory.PARSING || 
        category === ErrorCategory.VALIDATION) {
      return RecoveryStrategy.SKIP;
    }

    if (category === ErrorCategory.RESOURCE) {
      return RecoveryStrategy.FALLBACK;
    }

    return RecoveryStrategy.RETRY;
  }

  /**
   * Execute recovery strategy
   */
  async executeRecovery(
    categorizedError: CategorizedError,
    recoveryFunction: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.emit('recovery-attempted', categorizedError);
      
      let result;
      
      switch (categorizedError.recoveryStrategy) {
        case RecoveryStrategy.RETRY:
          result = await this.executeRetry(categorizedError, recoveryFunction);
          break;
          
        case RecoveryStrategy.RETRY_WITH_BACKOFF:
          result = await this.executeRetryWithBackoff(categorizedError, recoveryFunction);
          break;
          
        case RecoveryStrategy.FALLBACK:
          result = await this.executeFallback(categorizedError, recoveryFunction);
          break;
          
        case RecoveryStrategy.SKIP:
          result = await this.executeSkip(categorizedError);
          break;
          
        case RecoveryStrategy.ABORT:
          throw new Error(`Recovery aborted for ${categorizedError.id}`);
          
        case RecoveryStrategy.ESCALATE:
          await this.executeEscalation(categorizedError);
          throw new Error(`Error escalated for ${categorizedError.id}`);
          
        default:
          throw new Error(`Unknown recovery strategy: ${categorizedError.recoveryStrategy}`);
      }
      
      const recoveryTime = Date.now() - startTime;
      this.emit('recovery-successful', categorizedError, recoveryTime);
      
      return result;
      
    } catch (error) {
      const recoveryTime = Date.now() - startTime;
      this.emit('recovery-failed', categorizedError, error, recoveryTime);
      throw error;
    }
  }

  /**
   * Execute simple retry
   */
  private async executeRetry(
    categorizedError: CategorizedError,
    recoveryFunction: () => Promise<any>
  ): Promise<any> {
    const currentRetries = this.activeRetries.get(categorizedError.id) || 0;
    
    if (currentRetries >= categorizedError.maxRetries) {
      throw new Error(`Max retries exceeded for ${categorizedError.id}`);
    }
    
    this.activeRetries.set(categorizedError.id, currentRetries + 1);
    categorizedError.retryCount = currentRetries + 1;
    
    try {
      const result = await recoveryFunction();
      this.activeRetries.delete(categorizedError.id);
      return result;
    } catch (error) {
      if (currentRetries + 1 >= categorizedError.maxRetries) {
        this.activeRetries.delete(categorizedError.id);
        throw error;
      }
      
      // Retry immediately
      return this.executeRetry(categorizedError, recoveryFunction);
    }
  }

  /**
   * Execute retry with exponential backoff
   */
  private async executeRetryWithBackoff(
    categorizedError: CategorizedError,
    recoveryFunction: () => Promise<any>
  ): Promise<any> {
    const currentRetries = this.activeRetries.get(categorizedError.id) || 0;
    
    if (currentRetries >= categorizedError.maxRetries) {
      throw new Error(`Max retries exceeded for ${categorizedError.id}`);
    }
    
    this.activeRetries.set(categorizedError.id, currentRetries + 1);
    categorizedError.retryCount = currentRetries + 1;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, currentRetries),
      this.retryConfig.maxDelay
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const result = await recoveryFunction();
      this.activeRetries.delete(categorizedError.id);
      return result;
    } catch (error) {
      if (currentRetries + 1 >= categorizedError.maxRetries) {
        this.activeRetries.delete(categorizedError.id);
        throw error;
      }
      
      // Retry with next backoff
      return this.executeRetryWithBackoff(categorizedError, recoveryFunction);
    }
  }

  /**
   * Execute fallback strategy
   */
  private async executeFallback(
    categorizedError: CategorizedError,
    recoveryFunction: () => Promise<any>
  ): Promise<any> {
    try {
      return await recoveryFunction();
    } catch (error) {
      // Return default fallback value
      return this.getFallbackValue(categorizedError);
    }
  }

  /**
   * Execute skip strategy
   */
  private async executeSkip(categorizedError: CategorizedError): Promise<any> {
    console.warn(`[ErrorHandler] Skipping error: ${categorizedError.message}`);
    return null;
  }

  /**
   * Execute escalation strategy
   */
  private async executeEscalation(categorizedError: CategorizedError): Promise<void> {
    console.error(`[ErrorHandler] CRITICAL ERROR ESCALATED: ${categorizedError.message}`);
    
    // Trigger critical alert
    this.emit('alert-triggered', {
      type: 'critical',
      error: categorizedError,
      message: `Critical error requires immediate attention: ${categorizedError.message}`
    });
  }

  /**
   * Get fallback value for error
   */
  private getFallbackValue(categorizedError: CategorizedError): any {
    switch (categorizedError.category) {
      case ErrorCategory.PARSING:
        return { items: [] };
      case ErrorCategory.DATABASE:
        return null;
      case ErrorCategory.NETWORK:
        return { success: false, data: null };
      default:
        return null;
    }
  }

  /**
   * Get max retries for error category and severity
   */
  private getMaxRetries(category: ErrorCategory, severity: ErrorSeverity): number {
    if (severity === ErrorSeverity.CRITICAL) {
      return 0; // No retries for critical errors
    }
    
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.TIMEOUT) {
      return 5;
    }
    
    if (category === ErrorCategory.DATABASE) {
      return 3;
    }
    
    return this.retryConfig.maxAttempts;
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(error: CategorizedError): void {
    this.errorStats.totalErrors++;
    this.errorStats.errorsByCategory[error.category]++;
    this.errorStats.errorsBySeverity[error.severity]++;
    this.errorStats.lastError = error.timestamp;
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.errorStats.criticalErrors++;
    }
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): void {
    const now = Date.now();
    const windowStart = now - this.config.monitoringWindow;
    
    const recentErrors = this.errorHistory.filter(
      error => error.timestamp.getTime() >= windowStart
    );
    
    this.errorStats.errorRate = recentErrors.length / (this.config.monitoringWindow / 60000); // per minute
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(): void {
    if (!this.alertConfig.enabled) {
      return;
    }
    
    // Check error rate threshold
    if (this.errorStats.errorRate > this.alertConfig.thresholds.errorRate) {
      this.triggerAlert('error-rate', `Error rate exceeded threshold: ${this.errorStats.errorRate}/min`);
    }
    
    // Check critical errors threshold
    if (this.errorStats.criticalErrors > this.alertConfig.thresholds.criticalErrors) {
      this.triggerAlert('critical-errors', `Critical errors exceeded threshold: ${this.errorStats.criticalErrors}`);
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(type: string, message: string): void {
    const lastAlert = this.lastAlertTime.get(type);
    const now = new Date();
    
    if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.alertConfig.cooldownPeriod) {
      return; // Still in cooldown period
    }
    
    this.lastAlertTime.set(type, now);
    
    this.emit('alert-triggered', {
      type,
      message,
      timestamp: now,
      stats: this.errorStats
    });
  }

  /**
   * Clean up old errors from history
   */
  private cleanupOldErrors(): void {
    const cutoff = Date.now() - (this.config.monitoringWindow * 2);
    this.errorHistory = this.errorHistory.filter(
      error => error.timestamp.getTime() >= cutoff
    );
  }

  /**
   * Handle categorized error
   */
  private handleCategorizedError(error: CategorizedError): void {
    console.log(`[ErrorHandler] Categorized error: ${error.category}:${error.severity} - ${error.message}`);
  }

  /**
   * Handle recovery attempt
   */
  private handleRecoveryAttempt(error: CategorizedError): void {
    console.log(`[ErrorHandler] Recovery attempt ${error.retryCount}/${error.maxRetries} for ${error.id}`);
  }

  /**
   * Handle recovery success
   */
  private handleRecoverySuccess(error: CategorizedError, recoveryTime: number): void {
    this.errorStats.successfulRecoveries++;
    this.updateAverageRecoveryTime(recoveryTime);
    console.log(`[ErrorHandler] Recovery successful for ${error.id} in ${recoveryTime}ms`);
  }

  /**
   * Handle recovery failure
   */
  private handleRecoveryFailure(error: CategorizedError, recoveryError: Error, recoveryTime: number): void {
    this.errorStats.failedRecoveries++;
    console.error(`[ErrorHandler] Recovery failed for ${error.id} in ${recoveryTime}ms:`, recoveryError.message);
  }

  /**
   * Handle alert
   */
  private handleAlert(alert: any): void {
    console.error(`[ErrorHandler] ALERT: ${alert.type} - ${alert.message}`);
    
    // Here you could integrate with external alerting services
    // like Slack, PagerDuty, email, etc.
  }

  /**
   * Update average recovery time
   */
  private updateAverageRecoveryTime(recoveryTime: number): void {
    const totalRecoveries = this.errorStats.successfulRecoveries + this.errorStats.failedRecoveries;
    const currentAverage = this.errorStats.averageRecoveryTime;
    
    this.errorStats.averageRecoveryTime = 
      (currentAverage * (totalRecoveries - 1) + recoveryTime) / totalRecoveries;
  }

  /**
   * Log error
   */
  private logError(error: CategorizedError): void {
    const logLevel = this.config.logLevel;
    const message = `[${error.category}:${error.severity}] ${error.message}`;
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(message, error.originalError);
        break;
      case ErrorSeverity.HIGH:
        console.error(message);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(message);
        break;
      case ErrorSeverity.LOW:
        if (logLevel === 'debug' || logLevel === 'info') {
          console.log(message);
        }
        break;
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): CategorizedError[] {
    return this.errorHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): CategorizedError[] {
    return this.errorHistory.filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): CategorizedError[] {
    return this.errorHistory.filter(error => error.severity === severity);
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.initializeErrorStats();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Check if error is recoverable
   */
  isErrorRecoverable(error: CategorizedError): boolean {
    return error.recoveryStrategy !== RecoveryStrategy.ABORT && 
           error.recoveryStrategy !== RecoveryStrategy.ESCALATE &&
           error.retryCount < error.maxRetries;
  }

  /**
   * Force recovery for specific error
   */
  async forceRecovery(
    errorId: string,
    recoveryFunction: () => Promise<any>
  ): Promise<any> {
    const error = this.errorHistory.find(e => e.id === errorId);
    if (!error) {
      throw new Error(`Error not found: ${errorId}`);
    }
    
    return this.executeRecovery(error, recoveryFunction);
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler(); 