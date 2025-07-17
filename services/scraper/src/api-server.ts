import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MinimalRSSScraper } from './minimal-scraper';
import * as db from './database';
import { 
  NewsSource, 
  DashboardMetrics, 
  TriggerScrapingRequest,
  TriggerScrapingResponse,
  GetJobsRequest,
  GetJobResponse,
  GetJobLogsRequest,
  CancelJobResponse,
  GetContentRequest,
  GetArticleResponse,
  GetSourcesResponse,
  ErrorResponse,
  PaginatedResponse,
  JobStatus,
  ProcessingStatus
} from './types';
import { validateRSSFeed, formatDuration } from './utils';

const app = express();
const port = process.env.PORT || 3001;
const scraper = new MinimalRSSScraper();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics cache
let metricsCache: { data: DashboardMetrics | null; timestamp: number } = { 
  data: null, 
  timestamp: 0 
};
const CACHE_TTL = 60000; // 1 minute

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (metricsCache.data && Date.now() - metricsCache.timestamp < CACHE_TTL) {
    return metricsCache.data;
  }
  
  const result = await db.pool.query(`
    SELECT 
      COUNT(DISTINCT id) as jobs_triggered,
      AVG(CASE WHEN status = 'completed' THEN 100 ELSE 0 END) as success_rate,
      SUM(total_articles_scraped) as articles_scraped,
      AVG(EXTRACT(EPOCH FROM (completed_at - triggered_at))) as avg_duration,
      COUNT(CASE WHEN status = 'running' THEN 1 END) as active_jobs,
      COUNT(CASE WHEN status = 'failed' AND triggered_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_errors
    FROM scraping_jobs
    WHERE triggered_at > NOW() - INTERVAL '7 days'
  `);
  
  const metrics = {
    jobsTriggered: parseInt(result.rows[0].jobs_triggered) || 0,
    successRate: Math.round(parseFloat(result.rows[0].success_rate) || 0),
    articlesScraped: parseInt(result.rows[0].articles_scraped) || 0,
    averageJobDuration: Math.round(parseFloat(result.rows[0].avg_duration) || 0),
    activeJobs: parseInt(result.rows[0].active_jobs) || 0,
    recentErrors: parseInt(result.rows[0].recent_errors) || 0
  };
  
  metricsCache = { data: metrics, timestamp: Date.now() };
  return metrics;
}

// Job Management Endpoints

// POST /api/scraper/trigger - Trigger new scraping job
app.post('/api/scraper/trigger', async (req: Request<{}, {}, TriggerScrapingRequest>, res: Response<TriggerScrapingResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const { sources, maxArticles } = req.body;
    
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: 'Sources array is required and must not be empty',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    if (!maxArticles || maxArticles < 1 || maxArticles > 100) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: 'maxArticles must be between 1 and 100',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    // Create job with initial log
    const jobId = await db.createJobWithInitialLog(sources, maxArticles);
    
    // Start scraping in background
    (async () => {
      try {
        await db.updateJobStatus(jobId, 'running');
        await scraper.scrapeJob(jobId, sources, maxArticles);
        await db.updateJobStatus(jobId, 'completed');
      } catch (error: any) {
        console.error('Scraping job failed:', error);
        await db.updateJobStatus(jobId, 'failed');
        await db.logJobActivity({
          jobId,
          level: 'error',
          message: 'Job failed with error',
          additionalData: {
            error_type: error.constructor.name,
            error_message: error.message,
            error_stack: error.stack
          }
        });
      }
    })();
    
    return res.json({
      jobId,
      status: 'started',
      message: `Job ${jobId} started successfully`
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/scraper/jobs - List jobs with pagination
app.get('/api/scraper/jobs', async (req: Request<{}, {}, {}, GetJobsRequest>, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page || '1')) || 1;
    const pageSize = parseInt(String(req.query.pageSize || '20')) || 20;
    const status = req.query.status as JobStatus | undefined;
    
    const jobs = await db.getJobs(pageSize, (page - 1) * pageSize, status);
    return res.json(jobs);
  } catch (error) {
    return next(error);
  }
});

// GET /api/scraper/jobs/:id - Get specific job
app.get('/api/scraper/jobs/:id', async (req: Request<{ id: string }>, res: Response<GetJobResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const job = await db.getJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Job ${req.params.id} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

// GET /api/scraper/jobs/:id/logs - Get job logs with pagination
app.get('/api/scraper/jobs/:id/logs', async (req: Request<{ id: string }, {}, {}, GetJobLogsRequest>, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page || '1')) || 1;
    const pageSize = parseInt(String(req.query.pageSize || '100')) || 100;
    
    const logs = await db.getJobLogs(req.params.id, page, pageSize);
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/scraper/jobs/:id - Cancel running job
app.delete('/api/scraper/jobs/:id', async (req: Request<{ id: string }>, res: Response<CancelJobResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const job = await db.getJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Job ${req.params.id} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    if (job.status !== 'running') {
      return res.status(400).json({
        error: 'InvalidOperation',
        message: `Cannot cancel job in ${job.status} state`,
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    await scraper.cancelJob(req.params.id);
    await db.updateJobStatus(req.params.id, 'cancelled');
    await db.logJobActivity({
      jobId: req.params.id,
      level: 'info',
      message: 'Job cancelled by user',
      additionalData: { cancelled_at: new Date().toISOString() }
    });
    
    return res.json({
      success: true,
      message: `Job ${req.params.id} cancelled successfully`
    });
  } catch (error) {
    return next(error);
  }
});

// Content Management Endpoints

// GET /api/scraper/content - List scraped articles
app.get('/api/scraper/content', async (req: Request<{}, {}, {}, GetContentRequest>, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page || '1')) || 1;
    const pageSize = parseInt(String(req.query.pageSize || '20')) || 20;
    const search = req.query.search as string | undefined;
    const source = req.query.source as string | undefined;
    const language = req.query.language as string | undefined;
    const status = req.query.status as ProcessingStatus | undefined;
    
    const articles = await db.getArticles({
      page,
      pageSize,
      search,
      source,
      language,
      status
    });
    
    return res.json(articles);
  } catch (error) {
    return next(error);
  }
});

// GET /api/scraper/content/:id - Get specific article
app.get('/api/scraper/content/:id', async (req: Request<{ id: string }>, res: Response<GetArticleResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const article = await db.getArticleById(id);
    
    if (!article) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Article with ID ${id} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({ article });
  } catch (error) {
    return next(error);
  }
});

// Source Management Endpoints

// GET /api/scraper/sources - List all sources
app.get('/api/scraper/sources', async (req: Request, res: Response<GetSourcesResponse>, next: NextFunction) => {
  try {
    const sources = await db.getSources();
    return res.json({ sources });
  } catch (error) {
    return next(error);
  }
});

// POST /api/scraper/sources - Create new source
app.post('/api/scraper/sources', async (req: Request<{}, {}, Partial<NewsSource>>, res: Response, next: NextFunction) => {
  try {
    const { rssUrl, ...sourceData } = req.body;
    
    if (!rssUrl) {
      return res.status(400).json({
        error: 'InvalidRequest',
        message: 'RSS URL is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate RSS feed
    const validation = await validateRSSFeed(rssUrl);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'InvalidRSSFeed',
        message: validation.error,
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    const newSource = await db.createSource({ ...sourceData, rssUrl } as Omit<NewsSource, 'id' | 'createdAt'>);
    return res.json(newSource);
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/scraper/sources/:id - Update source
app.patch('/api/scraper/sources/:id', async (req: Request<{ id: string }, {}, Partial<NewsSource>>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If updating RSS URL, validate it first
    if (updates.rssUrl) {
      const validation = await validateRSSFeed(updates.rssUrl);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'InvalidRSSFeed',
          message: validation.error,
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    await db.updateSource(id, updates);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/scraper/sources/:id - Delete source
app.delete('/api/scraper/sources/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.deleteSource(id);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/scraper/sources/:id/test - Test RSS feed
app.patch('/api/scraper/sources/:id/test', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const sources = await db.getSources();
    const source = sources.find(s => s.id === id);
    
    if (!source) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Source with ID ${id} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    const validation = await validateRSSFeed(source.rssUrl);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'TestFailed',
        message: validation.error,
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({ success: true, message: 'RSS feed is valid' });
  } catch (error) {
    return next(error);
  }
});

// GET /api/scraper/metrics - Dashboard metrics
app.get('/api/scraper/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getDashboardMetrics();
    return res.json(metrics);
  } catch (error) {
    return next(error);
  }
});

// Error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  
  const errorResponse: ErrorResponse = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(errorResponse.statusCode).json(errorResponse);
};

app.use(errorHandler);

// Start server and recover stuck jobs
async function startServer() {
  try {
    // Recover any stuck jobs on startup
    await db.recoverStuckJobs();
    console.log('Recovered stuck jobs');
    
    app.listen(port, () => {
      console.log(`Scraper API server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 