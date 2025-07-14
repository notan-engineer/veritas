import { EventEmitter } from 'events';
import { getDatabaseClient } from './database';

export interface ResourceMetrics {
  timestamp: Date;
  databaseSize: number;
  databaseConnections: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  storageMetrics: {
    scrapedContentSize: number;
    totalRecords: number;
    htmlContentSize: number;
    averageArticleSize: number;
  };
  performanceMetrics: {
    avgQueryTime: number;
    slowQueries: number;
    jobsPerMinute: number;
    articlesPerMinute: number;
  };
}

export interface ResourceAlert {
  type: 'storage' | 'memory' | 'cpu' | 'database' | 'performance';
  level: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: Partial<ResourceMetrics>;
}

export interface ResourceThresholds {
  storage: {
    warning: number; // MB
    critical: number; // MB
  };
  memory: {
    warning: number; // MB
    critical: number; // MB
  };
  database: {
    connectionWarning: number;
    connectionCritical: number;
    slowQueryThreshold: number; // ms
  };
  performance: {
    minJobsPerMinute: number;
    maxErrorRate: number; // percentage
  };
}

export class ResourceMonitor extends EventEmitter {
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metrics: ResourceMetrics[] = [];
  private maxMetricsHistory = 100;
  private alerts: ResourceAlert[] = [];
  private maxAlertsHistory = 50;
  
  private thresholds: ResourceThresholds = {
    storage: {
      warning: 500, // 500MB
      critical: 800, // 800MB
    },
    memory: {
      warning: 256, // 256MB
      critical: 512, // 512MB
    },
    database: {
      connectionWarning: 8,
      connectionCritical: 15,
      slowQueryThreshold: 1000, // 1 second
    },
    performance: {
      minJobsPerMinute: 1,
      maxErrorRate: 10, // 10%
    },
  };

  private queryTimes: number[] = [];
  private jobCounts: { timestamp: Date; count: number }[] = [];
  private articleCounts: { timestamp: Date; count: number }[] = [];
  private errorCounts: { timestamp: Date; count: number }[] = [];

  constructor() {
    super();
    this.setupProcessMonitoring();
  }

  private setupProcessMonitoring(): void {
    // Monitor uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      this.emit('alert', {
        type: 'performance',
        level: 'critical',
        message: `Uncaught exception: ${error.message}`,
        timestamp: new Date(),
        metrics: {},
      });
    });

    process.on('unhandledRejection', (reason) => {
      this.emit('alert', {
        type: 'performance',
        level: 'critical',
        message: `Unhandled rejection: ${reason}`,
        timestamp: new Date(),
        metrics: {},
      });
    });

    // Monitor process warnings
    process.on('warning', (warning) => {
      this.emit('alert', {
        type: 'performance',
        level: 'warning',
        message: `Process warning: ${warning.message}`,
        timestamp: new Date(),
        metrics: {},
      });
    });
  }

  public startMonitoring(intervalMs: number = 60000): void {
    if (this.isRunning) {
      console.log('Resource monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting resource monitoring with ${intervalMs}ms interval`);

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.metrics.push(metrics);
        
        // Keep only recent metrics
        if (this.metrics.length > this.maxMetricsHistory) {
          this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }

        this.checkThresholds(metrics);
        this.emit('metrics', metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
        this.emit('alert', {
          type: 'performance',
          level: 'critical',
          message: `Metrics collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          metrics: {},
        });
      }
    }, intervalMs);

    this.emit('started');
  }

  public stopMonitoring(): void {
    if (!this.isRunning) {
      console.log('Resource monitoring not running');
      return;
    }

    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Resource monitoring stopped');
    this.emit('stopped');
  }

  private async collectMetrics(): Promise<ResourceMetrics> {
    const [
      databaseMetrics,
      memoryMetrics,
      cpuMetrics,
      storageMetrics,
      performanceMetrics,
    ] = await Promise.all([
      this.getDatabaseMetrics(),
      this.getMemoryMetrics(),
      this.getCPUMetrics(),
      this.getStorageMetrics(),
      this.getPerformanceMetrics(),
    ]);

    return {
      timestamp: new Date(),
      databaseSize: databaseMetrics.size,
      databaseConnections: databaseMetrics.connections,
      memoryUsage: memoryMetrics,
      cpuUsage: cpuMetrics,
      storageMetrics,
      performanceMetrics,
    };
  }

  private async getDatabaseMetrics(): Promise<{ size: number; connections: number }> {
    const client = getDatabaseClient();
    
    try {
      // Get database size
      const sizeResult = await client.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty,
               pg_database_size(current_database()) as size_bytes
      `);
      
      // Get connection count
      const connectionResult = await client.query(`
        SELECT count(*) as connection_count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return {
        size: parseInt(sizeResult.rows[0].size_bytes) / (1024 * 1024), // Convert to MB
        connections: parseInt(connectionResult.rows[0].connection_count),
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      return { size: 0, connections: 0 };
    }
  }

  private getMemoryMetrics(): { heapUsed: number; heapTotal: number; external: number; rss: number } {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed / (1024 * 1024), // Convert to MB
      heapTotal: memUsage.heapTotal / (1024 * 1024),
      external: memUsage.external / (1024 * 1024),
      rss: memUsage.rss / (1024 * 1024),
    };
  }

  private getCPUMetrics(): { user: number; system: number } {
    const cpuUsage = process.cpuUsage();
    return {
      user: cpuUsage.user / 1000000, // Convert to seconds
      system: cpuUsage.system / 1000000,
    };
  }

  private async getStorageMetrics(): Promise<{
    scrapedContentSize: number;
    totalRecords: number;
    htmlContentSize: number;
    averageArticleSize: number;
  }> {
    const client = getDatabaseClient();
    
    try {
      // Get scraped content metrics
      const contentResult = await client.query(`
        SELECT 
          COUNT(*) as total_records,
          AVG(LENGTH(content)) as avg_content_length,
          AVG(LENGTH(full_html)) as avg_html_length,
          SUM(LENGTH(content)) as total_content_size,
          SUM(LENGTH(full_html)) as total_html_size
        FROM scraped_content
      `);

      const row = contentResult.rows[0];
      const totalContentSize = parseInt(row.total_content_size || '0');
      const totalHtmlSize = parseInt(row.total_html_size || '0');
      const totalRecords = parseInt(row.total_records || '0');
      
      return {
        scrapedContentSize: (totalContentSize + totalHtmlSize) / (1024 * 1024), // Convert to MB
        totalRecords,
        htmlContentSize: totalHtmlSize / (1024 * 1024),
        averageArticleSize: totalRecords > 0 ? (totalContentSize + totalHtmlSize) / totalRecords / 1024 : 0, // KB
      };
    } catch (error) {
      console.error('Error getting storage metrics:', error);
      return {
        scrapedContentSize: 0,
        totalRecords: 0,
        htmlContentSize: 0,
        averageArticleSize: 0,
      };
    }
  }

  private getPerformanceMetrics(): {
    avgQueryTime: number;
    slowQueries: number;
    jobsPerMinute: number;
    articlesPerMinute: number;
  } {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Calculate average query time
    const avgQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length 
      : 0;

    // Count slow queries
    const slowQueries = this.queryTimes.filter(time => time > this.thresholds.database.slowQueryThreshold).length;

    // Calculate jobs per minute
    const recentJobs = this.jobCounts.filter(job => job.timestamp > oneMinuteAgo);
    const jobsPerMinute = recentJobs.reduce((sum, job) => sum + job.count, 0);

    // Calculate articles per minute
    const recentArticles = this.articleCounts.filter(article => article.timestamp > oneMinuteAgo);
    const articlesPerMinute = recentArticles.reduce((sum, article) => sum + article.count, 0);

    return {
      avgQueryTime,
      slowQueries,
      jobsPerMinute,
      articlesPerMinute,
    };
  }

  private checkThresholds(metrics: ResourceMetrics): void {
    const alerts: ResourceAlert[] = [];

    // Check storage thresholds
    if (metrics.storageMetrics.scrapedContentSize > this.thresholds.storage.critical) {
      alerts.push({
        type: 'storage',
        level: 'critical',
        message: `Critical storage usage: ${metrics.storageMetrics.scrapedContentSize.toFixed(2)}MB`,
        timestamp: new Date(),
        metrics: { storageMetrics: metrics.storageMetrics },
      });
    } else if (metrics.storageMetrics.scrapedContentSize > this.thresholds.storage.warning) {
      alerts.push({
        type: 'storage',
        level: 'warning',
        message: `High storage usage: ${metrics.storageMetrics.scrapedContentSize.toFixed(2)}MB`,
        timestamp: new Date(),
        metrics: { storageMetrics: metrics.storageMetrics },
      });
    }

    // Check memory thresholds
    if (metrics.memoryUsage.heapUsed > this.thresholds.memory.critical) {
      alerts.push({
        type: 'memory',
        level: 'critical',
        message: `Critical memory usage: ${metrics.memoryUsage.heapUsed.toFixed(2)}MB`,
        timestamp: new Date(),
        metrics: { memoryUsage: metrics.memoryUsage },
      });
    } else if (metrics.memoryUsage.heapUsed > this.thresholds.memory.warning) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `High memory usage: ${metrics.memoryUsage.heapUsed.toFixed(2)}MB`,
        timestamp: new Date(),
        metrics: { memoryUsage: metrics.memoryUsage },
      });
    }

    // Check database thresholds
    if (metrics.databaseConnections > this.thresholds.database.connectionCritical) {
      alerts.push({
        type: 'database',
        level: 'critical',
        message: `Critical database connections: ${metrics.databaseConnections}`,
        timestamp: new Date(),
        metrics: { databaseConnections: metrics.databaseConnections },
      });
    } else if (metrics.databaseConnections > this.thresholds.database.connectionWarning) {
      alerts.push({
        type: 'database',
        level: 'warning',
        message: `High database connections: ${metrics.databaseConnections}`,
        timestamp: new Date(),
        metrics: { databaseConnections: metrics.databaseConnections },
      });
    }

    // Check performance thresholds
    if (metrics.performanceMetrics.jobsPerMinute < this.thresholds.performance.minJobsPerMinute) {
      alerts.push({
        type: 'performance',
        level: 'warning',
        message: `Low job throughput: ${metrics.performanceMetrics.jobsPerMinute} jobs/minute`,
        timestamp: new Date(),
        metrics: { performanceMetrics: metrics.performanceMetrics },
      });
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.emit('alert', alert);
    });

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory);
    }
  }

  // Public methods for external tracking
  public recordQueryTime(timeMs: number): void {
    this.queryTimes.push(timeMs);
    
    // Keep only recent query times (last 100)
    if (this.queryTimes.length > 100) {
      this.queryTimes = this.queryTimes.slice(-100);
    }
  }

  public recordJobCount(count: number): void {
    this.jobCounts.push({ timestamp: new Date(), count });
    
    // Keep only recent job counts (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.jobCounts = this.jobCounts.filter(job => job.timestamp > oneHourAgo);
  }

  public recordArticleCount(count: number): void {
    this.articleCounts.push({ timestamp: new Date(), count });
    
    // Keep only recent article counts (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.articleCounts = this.articleCounts.filter(article => article.timestamp > oneHourAgo);
  }

  public recordErrorCount(count: number): void {
    this.errorCounts.push({ timestamp: new Date(), count });
    
    // Keep only recent error counts (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.errorCounts = this.errorCounts.filter(error => error.timestamp > oneHourAgo);
  }

  // Getters
  public getLatestMetrics(): ResourceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1]! : null;
  }

  public getMetricsHistory(): ResourceMetrics[] {
    return [...this.metrics];
  }

  public getRecentAlerts(): ResourceAlert[] {
    return [...this.alerts];
  }

  public getThresholds(): ResourceThresholds {
    return { ...this.thresholds };
  }

  public updateThresholds(newThresholds: Partial<ResourceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.emit('thresholdsUpdated', this.thresholds);
  }

  public isMonitoringActive(): boolean {
    return this.isRunning;
  }

  // Generate resource report
  public generateReport(): {
    summary: string;
    metrics: ResourceMetrics | null;
    alerts: ResourceAlert[];
    recommendations: string[];
  } {
    const latestMetrics = this.getLatestMetrics();
    const recentAlerts = this.getRecentAlerts();
    const recommendations: string[] = [];

    if (latestMetrics) {
      if (latestMetrics.storageMetrics.scrapedContentSize > this.thresholds.storage.warning) {
        recommendations.push('Consider implementing automated cleanup for old scraped content');
      }
      
      if (latestMetrics.memoryUsage.heapUsed > this.thresholds.memory.warning) {
        recommendations.push('Monitor memory usage and consider optimizing HTML storage');
      }
      
      if (latestMetrics.performanceMetrics.avgQueryTime > this.thresholds.database.slowQueryThreshold) {
        recommendations.push('Optimize slow database queries and consider adding indexes');
      }
      
      if (latestMetrics.databaseConnections > this.thresholds.database.connectionWarning) {
        recommendations.push('Consider implementing connection pooling optimization');
      }
    }

    return {
      summary: `Resource monitoring report - ${recentAlerts.length} alerts, ${recommendations.length} recommendations`,
      metrics: latestMetrics,
      alerts: recentAlerts,
      recommendations,
    };
  }
}

// Export singleton instance
export const resourceMonitor = new ResourceMonitor(); 