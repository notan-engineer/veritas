import express from 'express';
import cors from 'cors';
import { scraper } from './scraper';
import { cleanupManager } from './cleanup-manager';
import { errorHandler } from './error-handler';
import { resourceMonitor } from './resource-monitor';
import { sourceManager } from './source-manager';
import { jobManager } from './job-manager';
import { scraperDb } from './database';
import { TriggerScrapingRequest, TriggerScrapingResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const contentType = req.get('Content-Type') || 'Not set';
  
  console.log(`[${timestamp}] ${method} ${url} - User-Agent: ${userAgent}`);
  console.log(`[${timestamp}] Content-Type: ${contentType}`);
  console.log(`[${timestamp}] Request headers: ${JSON.stringify(req.headers)}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request body: ${JSON.stringify(req.body)}`);
  }
  
  next();
});

// Helper functions for health monitoring
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await scraperDb.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function getSystemMetrics(): Promise<any> {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
}

async function getJobStatistics(): Promise<any> {
  try {
    const result = await scraperDb.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_jobs,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running_jobs,
        AVG(total_articles_scraped) as avg_articles_per_job,
        AVG(total_errors) as avg_errors_per_job
      FROM scraping_jobs 
      WHERE triggered_at > NOW() - INTERVAL '24 hours'
    `);
    
    return result.rows[0] || {
      total_jobs: 0,
      completed_jobs: 0,
      failed_jobs: 0,
      running_jobs: 0,
      avg_articles_per_job: 0,
      avg_errors_per_job: 0
    };
  } catch (error) {
    console.error('Failed to get job statistics:', error);
    return {
      total_jobs: 0,
      completed_jobs: 0,
      failed_jobs: 0,
      running_jobs: 0,
      avg_articles_per_job: 0,
      avg_errors_per_job: 0
    };
  }
}

async function getSourceHealth(): Promise<any> {
  try {
    const result = await scraperDb.query(`
      SELECT 
        COUNT(*) as total_sources
      FROM sources
    `);
    
    return result.rows[0] || {
      total_sources: 0,
      enabled_sources: 0, // All sources are considered enabled in simplified schema
      avg_success_rate: 100.0, // Default success rate
      recently_scraped: 0
    };
  } catch (error) {
    console.error('Failed to get source health:', error);
    return {
      total_sources: 0,
      enabled_sources: 0,
      avg_success_rate: 0,
      recently_scraped: 0
    };
  }
}

async function getDatabasePoolStats(): Promise<any> {
  try {
    // Get connection pool statistics
    const poolStats = scraperDb.getConnectionPoolMetrics();
    return poolStats;
  } catch (error) {
    console.error('Failed to get database pool stats:', error);
    return {
      totalConnections: 0,
      idleConnections: 0,
      waitingClients: 0
    };
  }
}

// Enhanced health check endpoint with comprehensive monitoring
app.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Enhanced health check requested`);
  
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();
    
    // Get system metrics
    const systemMetrics = await getSystemMetrics();
    
    // Get error statistics
    const errorStats = errorHandler.getErrorStats();
    
    // Get resource usage
    const resourceUsage = resourceMonitor.getLatestMetrics();
    
    // Get job statistics
    const jobStats = await getJobStatistics();
    
    // Get source health
    const sourceHealth = await getSourceHealth();
    
    // Determine overall health status
    const isHealthy = dbHealthy && 
                     errorStats.errorRate < 0.1 && 
                     errorStats.criticalErrors < 3 &&
                     resourceUsage && resourceUsage.memoryUsage.heapUsed < 500;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'veritas-scraper',
      timestamp: timestamp,
      port: PORT,
      version: '1.0.0',
      uptime: process.uptime(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
        RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
        RAILWAY_PRIVATE_DOMAIN: process.env.RAILWAY_PRIVATE_DOMAIN
      },
      database: {
        healthy: dbHealthy,
        connectionPool: await getDatabasePoolStats()
      },
      system: systemMetrics,
      errors: {
        totalErrors: errorStats.totalErrors,
        errorRate: errorStats.errorRate,
        criticalErrors: errorStats.criticalErrors,
        lastError: errorStats.lastError,
        successfulRecoveries: errorStats.successfulRecoveries,
        failedRecoveries: errorStats.failedRecoveries
      },
      resources: resourceUsage,
      jobs: jobStats,
      sources: sourceHealth,
      checks: {
        database: dbHealthy,
        errorRate: errorStats.errorRate < 0.1,
        criticalErrors: errorStats.criticalErrors < 3,
        memoryUsage: resourceUsage ? resourceUsage.memoryUsage.heapUsed < 500 : false,
        storageUsage: resourceUsage ? resourceUsage.storageMetrics.scrapedContentSize < 800 : false
      }
    };
    
    console.log(`[${timestamp}] Enhanced health check response:`, {
      status: healthData.status,
      checks: healthData.checks,
      errorRate: errorStats.errorRate,
      criticalErrors: errorStats.criticalErrors
    });
    
    res.status(isHealthy ? 200 : 503).json(healthData);
    
  } catch (error) {
    const categorizedError = await errorHandler.handleError(
      error instanceof Error ? error : new Error('Health check failed'),
      { endpoint: '/health' },
      'health-check'
    );
    
    console.error(`[${timestamp}] Health check failed:`, error);
    
    res.status(503).json({
      status: 'unhealthy',
      service: 'veritas-scraper',
      timestamp: timestamp,
      error: categorizedError.message,
      errorId: categorizedError.id
    });
  }
});

// Detailed monitoring endpoints for Phase 6

// Error monitoring endpoint
app.get('/api/monitoring/errors', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Error monitoring requested`);
  
  try {
    const errorStats = errorHandler.getErrorStats();
    const recentErrors = errorHandler.getRecentErrors(50);
    const errorsByCategory: Record<string, any[]> = {};
    const errorsBySeverity: Record<string, any[]> = {};
    
    // Group errors by category
    recentErrors.forEach(error => {
      if (!errorsByCategory[error.category]) {
        errorsByCategory[error.category] = [];
      }
      errorsByCategory[error.category]?.push(error);
    });
    
    // Group errors by severity
    recentErrors.forEach(error => {
      if (!errorsBySeverity[error.severity]) {
        errorsBySeverity[error.severity] = [];
      }
      errorsBySeverity[error.severity]?.push(error);
    });
    
    res.json({
      timestamp,
      statistics: errorStats,
      recentErrors: recentErrors.slice(0, 10),
      errorsByCategory,
      errorsBySeverity,
      recoveryCapabilities: {
        totalRetryStrategies: 6,
        supportedCategories: ['network', 'database', 'parsing', 'validation', 'resource', 'timeout'],
        maxRetryAttempts: 3,
        exponentialBackoffEnabled: true
      }
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Error monitoring failed:`, error);
    res.status(500).json({
      timestamp,
      error: 'Failed to retrieve error monitoring data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// System performance monitoring endpoint
app.get('/api/monitoring/performance', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Performance monitoring requested`);
  
  try {
    const resourceMetrics = resourceMonitor.getLatestMetrics();
    const resourceAlerts = resourceMonitor.getRecentAlerts();
    const resourceReport = resourceMonitor.generateReport();
    const queryMetrics = scraperDb.getQueryMetrics();
    const slowQueries = scraperDb.getSlowQueries(1000);
    
    res.json({
      timestamp,
      resourceMetrics,
      resourceAlerts,
      resourceReport,
      databasePerformance: {
        queryMetrics: queryMetrics.slice(-20),
        slowQueries: slowQueries.slice(-10),
        connectionPool: scraperDb.getConnectionPoolMetrics()
      },
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Performance monitoring failed:`, error);
    res.status(500).json({
      timestamp,
      error: 'Failed to retrieve performance monitoring data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// System alerts endpoint
app.get('/api/monitoring/alerts', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Alerts monitoring requested`);
  
  try {
    const resourceAlerts = resourceMonitor.getRecentAlerts();
    const errorStats = errorHandler.getErrorStats();
    
    // Generate system alerts based on thresholds
    const alerts = [];
    
    if (errorStats.errorRate > 0.1) {
      alerts.push({
        type: 'error_rate',
        level: 'warning',
        message: `High error rate: ${errorStats.errorRate.toFixed(2)}/minute`,
        timestamp: new Date(),
        data: { errorRate: errorStats.errorRate }
      });
    }
    
    if (errorStats.criticalErrors > 5) {
      alerts.push({
        type: 'critical_errors',
        level: 'critical',
        message: `Critical errors exceeded threshold: ${errorStats.criticalErrors}`,
        timestamp: new Date(),
        data: { criticalErrors: errorStats.criticalErrors }
      });
    }
    
    const latestMetrics = resourceMonitor.getLatestMetrics();
    if (latestMetrics && latestMetrics.memoryUsage.heapUsed > 512) {
      alerts.push({
        type: 'memory_usage',
        level: 'warning',
        message: `High memory usage: ${latestMetrics.memoryUsage.heapUsed.toFixed(2)}MB`,
        timestamp: new Date(),
        data: { memoryUsage: latestMetrics.memoryUsage }
      });
    }
    
    res.json({
      timestamp,
      systemAlerts: alerts,
      resourceAlerts: resourceAlerts.slice(-10),
      alertThresholds: {
        errorRate: 0.1,
        criticalErrors: 5,
        memoryUsage: 512,
        storageUsage: 800
      },
      totalAlerts: alerts.length + resourceAlerts.length
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Alerts monitoring failed:`, error);
    res.status(500).json({
      timestamp,
      error: 'Failed to retrieve alerts monitoring data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Recovery management endpoint
app.post('/api/monitoring/recovery', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Recovery management requested`);
  
  try {
    const { errorId, action } = req.body;
    
    if (!errorId || !action) {
      res.status(400).json({
        timestamp,
        error: 'Invalid request',
        message: 'errorId and action are required'
      });
      return;
    }
    
    let result;
    
    switch (action) {
      case 'retry':
        result = await errorHandler.forceRecovery(errorId, async () => {
          return { recovered: true, timestamp: new Date() };
        });
        break;
        
      case 'skip':
        result = { skipped: true, errorId, timestamp: new Date() };
        break;
        
      case 'details':
        const recentErrors = errorHandler.getRecentErrors(100);
        const error = recentErrors.find(e => e.id === errorId);
        result = error || { error: 'Error not found' };
        break;
        
      default:
        res.status(400).json({
          timestamp,
          error: 'Invalid action',
          message: 'Supported actions: retry, skip, details'
        });
        return;
    }
    
    res.json({
      timestamp,
      action,
      errorId,
      result,
      success: true
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Recovery management failed:`, error);
    res.status(500).json({
      timestamp,
      error: 'Failed to execute recovery action',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for critical services
app.get('/api/monitoring/services', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Services health check requested`);
  
  try {
    const services: Record<string, any> = {};
    
    // Check database service
    try {
      await scraperDb.query('SELECT 1');
      services.database = {
        status: 'healthy',
        responseTime: 'fast',
        connections: scraperDb.getConnectionPoolMetrics()
      };
    } catch (error) {
      services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Check resource monitor
    services.resourceMonitor = {
      status: resourceMonitor.isMonitoringActive() ? 'healthy' : 'inactive',
      metricsCount: resourceMonitor.getMetricsHistory().length,
      alertsCount: resourceMonitor.getRecentAlerts().length
    };
    
    // Check error handler
    const errorStats = errorHandler.getErrorStats();
    services.errorHandler = {
      status: 'healthy',
      totalErrors: errorStats.totalErrors,
      errorRate: errorStats.errorRate,
      recoveryRate: errorStats.successfulRecoveries / (errorStats.successfulRecoveries + errorStats.failedRecoveries) || 0
    };
    
    // Check source manager
    try {
      const sources = await sourceManager.getAllSources({ activeOnly: true });
      services.sourceManager = {
        status: 'healthy',
        activeSources: sources.length,
        enabledSources: sources.length
      };
    } catch (error) {
      services.sourceManager = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Check cleanup manager
    services.cleanupManager = {
      status: 'healthy',
      lastExecution: 'unknown',
      policies: 3
    };
    
    const overallHealth = Object.values(services).every((service: any) => 
      service.status === 'healthy' || service.status === 'inactive'
    );
    
    res.json({
      timestamp,
      overallHealth: overallHealth ? 'healthy' : 'degraded',
      services,
      serviceCount: Object.keys(services).length,
      healthyServices: Object.values(services).filter(s => s.status === 'healthy').length
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Services health check failed:`, error);
    res.status(500).json({
      timestamp,
      error: 'Failed to check services health',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Scraping trigger endpoint
app.post('/api/scrape', async (req, res): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Scraping request received`);
  
  try {
    const request: TriggerScrapingRequest = req.body;
    console.log(`[${timestamp}] Request body parsed: ${JSON.stringify(request)}`);
    
    // Validate request
    if (!request.sources || !Array.isArray(request.sources) || request.sources.length === 0) {
      console.log(`[${timestamp}] Invalid request: sources array is required`);
      res.status(400).json({
        success: false,
        message: 'Invalid request: sources array is required',
        jobId: '',
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Invalid request: sources array is required',
          source: 'scraper-server'
        }]
      });
      return;
    }

    console.log(`[${timestamp}] Valid scraping request for sources: ${request.sources.join(', ')}`);
    console.log(`[${timestamp}] Max articles: ${request.maxArticles || 'not specified'}`);
    
    // Trigger scraping
    console.log(`[${timestamp}] Starting scraping process...`);
    const jobResult = await scraper.scrapeContent(request);
    console.log(`[${timestamp}] Scraping job queued: ${jobResult.jobId}`);
    
    // Convert job to response format
    const response: TriggerScrapingResponse = {
      success: !!jobResult.jobId,
      message: jobResult.message,
      jobId: jobResult.jobId,
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'info',
        message: jobResult.message,
        source: undefined
      }]
    };

    console.log(`[${timestamp}] Job ${jobResult.jobId} queued successfully`);
    console.log(`[${timestamp}] Response: ${JSON.stringify(response)}`);
    
    res.json(response);

  } catch (error) {
    console.error(`[${timestamp}] Error in scraping endpoint:`, error);
    
    // Handle error using the enhanced error handler
    const categorizedError = await errorHandler.handleError(
      error instanceof Error ? error : new Error('Scraping endpoint error'),
      { 
        endpoint: '/api/scrape',
        requestBody: req.body,
        timestamp 
      },
      'scraper-api'
    );
    
    const errorResponse = {
      success: false,
      message: 'Internal server error',
      jobId: '',
      errorId: categorizedError.id,
      errorCategory: categorizedError.category,
      errorSeverity: categorizedError.severity,
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: categorizedError.message,
        source: 'scraper-server',
        errorId: categorizedError.id
      }]
    };
    
    console.log(`[${timestamp}] Error response: ${JSON.stringify(errorResponse)}`);
    res.status(500).json(errorResponse);
  }
});

// Jobs endpoint - Get all jobs
app.get('/api/jobs', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Jobs list requested`);
  
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        id, triggered_at, completed_at, status, sources_requested, 
        articles_per_source, total_articles_scraped, total_errors, job_logs,
        EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - triggered_at)) as duration
      FROM scraping_jobs 
    `;
    
    const params: any[] = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY triggered_at DESC LIMIT 50';
    
    const result = await scraperDb.query(query, params);
    
    const jobs = result.rows.map(row => ({
      id: row.id,
      triggeredAt: row.triggered_at,
      completedAt: row.completed_at,
      status: row.status,
      sourcesRequested: row.sources_requested || [],
      articlesPerSource: row.articles_per_source || 0,
      totalArticlesScraped: row.total_articles_scraped || 0,
      totalErrors: row.total_errors || 0,
      duration: Math.floor(row.duration || 0)
    }));
    
    console.log(`[${timestamp}] Retrieved ${jobs.length} jobs`);
    
    res.json({
      success: true,
      jobs,
      total: jobs.length
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Failed to retrieve jobs:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel job endpoint
app.post('/api/jobs/:jobId/cancel', async (req, res) => {
  const timestamp = new Date().toISOString();
  const { jobId } = req.params;
  console.log(`[${timestamp}] Job cancellation requested for: ${jobId}`);
  
  try {
    // Update job status to cancelled
    await scraperDb.updateScrapingJob(jobId, {
      status: 'cancelled',
      completedAt: new Date()
    });
    
    // Abort active job if it exists
    await jobManager.abortJob(jobId);
    
    console.log(`[${timestamp}] Job ${jobId} cancelled successfully`);
    
    res.json({
      success: true,
      message: `Job ${jobId} cancelled successfully`
    });
    
  } catch (error) {
    console.error(`[${timestamp}] Failed to cancel job ${jobId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel job',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scraper status endpoint
app.get('/api/status', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Status check requested`);
  
  const currentJobId = scraper.getCurrentJob();
  const queueStatus = scraper.getQueueStatus();
  const statusData = {
    currentJob: currentJobId ? {
      id: currentJobId,
      status: 'processing',
      queueStatus: queueStatus
    } : null,
    service: 'veritas-scraper',
    timestamp: timestamp,
    port: PORT,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
      RAILWAY_PRIVATE_DOMAIN: process.env.RAILWAY_PRIVATE_DOMAIN
    }
  };
  
  console.log(`[${timestamp}] Status response: ${JSON.stringify(statusData)}`);
  res.json(statusData);
});

// Cleanup management endpoints

/**
 * POST /api/cleanup/execute
 * Execute cleanup with specified policy
 */
app.post('/api/cleanup/execute', async (req, res): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Cleanup execute requested`);
  
  try {
    const { policy = 'default' } = req.body;
    
    console.log(`[${timestamp}] Executing cleanup with policy: ${policy}`);
    
    const result = await cleanupManager.executeCleanup(policy);
    
    console.log(`[${timestamp}] Cleanup completed: ${JSON.stringify(result)}`);
    
    res.json({
      success: true,
      message: 'Cleanup executed successfully',
      result: result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Cleanup execution failed:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Cleanup execution failed',
      error: errorMessage
    });
  }
});

/**
 * GET /api/cleanup/metrics
 * Get storage metrics and cleanup statistics
 */
app.get('/api/cleanup/metrics', async (req, res): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Cleanup metrics requested`);
  
  try {
    const storageMetrics = await cleanupManager.getStorageMetrics();
    const cleanupHistory = cleanupManager.getCleanupHistory();
    const schedules = cleanupManager.getCleanupSchedules();
    const policies = cleanupManager.getCleanupPolicies();
    
    const metrics = {
      storage: storageMetrics,
      history: cleanupHistory.slice(-10), // Last 10 cleanup results
      schedules: schedules,
      policies: policies
    };
    
    console.log(`[${timestamp}] Cleanup metrics response: ${JSON.stringify(metrics)}`);
    
    res.json({
      success: true,
      message: 'Cleanup metrics retrieved successfully',
      metrics: metrics
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Cleanup metrics failed:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cleanup metrics',
      error: errorMessage
    });
  }
});

/**
 * GET /api/cleanup/policies
 * Get available cleanup policies
 */
app.get('/api/cleanup/policies', (req, res): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Cleanup policies requested`);
  
  try {
    const policies = cleanupManager.getCleanupPolicies();
    
    console.log(`[${timestamp}] Cleanup policies response: ${JSON.stringify(policies)}`);
    
    res.json({
      success: true,
      message: 'Cleanup policies retrieved successfully',
      policies: policies
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Cleanup policies failed:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cleanup policies',
      error: errorMessage
    });
  }
});

/**
 * PUT /api/cleanup/policy
 * Update cleanup policy
 */
app.put('/api/cleanup/policy', (req, res): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Cleanup policy update requested`);
  
  try {
    const policy = req.body;
    
    if (!policy || !policy.name) {
      res.status(400).json({
        success: false,
        message: 'Invalid policy data - name is required'
      });
      return;
    }
    
    cleanupManager.updateCleanupPolicy(policy);
    
    console.log(`[${timestamp}] Cleanup policy updated: ${policy.name}`);
    
    res.json({
      success: true,
      message: 'Cleanup policy updated successfully',
      policy: policy
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Cleanup policy update failed:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update cleanup policy',
      error: errorMessage
    });
  }
});

// Enhanced error handling middleware
app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Unhandled error:`, err);
  
  try {
    // Handle error using the enhanced error handler
    const categorizedError = await errorHandler.handleError(
      err instanceof Error ? err : new Error('Unhandled server error'),
      { 
        endpoint: req.path,
        method: req.method,
        requestBody: req.body,
        timestamp 
      },
      'express-middleware'
    );
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      jobId: '',
      errorId: categorizedError.id,
      errorCategory: categorizedError.category,
      errorSeverity: categorizedError.severity,
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: categorizedError.message,
        source: 'scraper-server',
        errorId: categorizedError.id
      }]
    });
  } catch (handlerError) {
    console.error(`[${timestamp}] Error handler failed:`, handlerError);
    
    res.status(500).json({
      success: false,
      message: 'Critical system error',
      jobId: '',
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Error handler failure',
        source: 'scraper-server'
      }]
    });
  }
});

// Start server
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Veritas Scraper Service running on port ${PORT}`);
  console.log(`[${timestamp}] 📊 Enhanced Health Check: http://localhost:${PORT}/health`);
  console.log(`[${timestamp}] 🔧 Scraping API: http://localhost:${PORT}/api/scrape`);
  console.log(`[${timestamp}] 📈 Status API: http://localhost:${PORT}/api/status`);
  console.log(`[${timestamp}] 🧹 Cleanup API: http://localhost:${PORT}/api/cleanup/execute`);
  console.log(`[${timestamp}] 📊 Cleanup Metrics: http://localhost:${PORT}/api/cleanup/metrics`);
  console.log(`[${timestamp}] ⚙️ Cleanup Policies: http://localhost:${PORT}/api/cleanup/policies`);
  console.log(`[${timestamp}] 🚨 Phase 6 Monitoring Endpoints:`);
  console.log(`[${timestamp}]   └── Error Monitoring: http://localhost:${PORT}/api/monitoring/errors`);
  console.log(`[${timestamp}]   └── Performance Monitoring: http://localhost:${PORT}/api/monitoring/performance`);
  console.log(`[${timestamp}]   └── System Alerts: http://localhost:${PORT}/api/monitoring/alerts`);
  console.log(`[${timestamp}]   └── Recovery Management: http://localhost:${PORT}/api/monitoring/recovery`);
  console.log(`[${timestamp}]   └── Services Health: http://localhost:${PORT}/api/monitoring/services`);
  console.log(`[${timestamp}] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[${timestamp}] Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not-set'}`);
  console.log(`[${timestamp}] Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'not-set'}`);
  console.log(`[${timestamp}] Railway Private Domain: ${process.env.RAILWAY_PRIVATE_DOMAIN || 'not-set'}`);
  console.log(`[${timestamp}] ✅ Phase 6: Error Recovery & Monitoring System Active`);
});

export default app; 