import express from 'express';
import cors from 'cors';
import { scraper } from './scraper';
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

// Health check endpoint
app.get('/health', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Health check requested`);
  
  const healthData = { 
    status: 'healthy', 
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
  
  console.log(`[${timestamp}] Health check response: ${JSON.stringify(healthData)}`);
  res.json(healthData);
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
    const job = await scraper.scrapeContent(request);
    console.log(`[${timestamp}] Scraping process completed with status: ${job.status}`);
    
    // Convert job to response format
    const response: TriggerScrapingResponse = {
      success: job.status === 'completed',
      message: job.status === 'completed' 
        ? `Scraping completed successfully. ${job.results.articlesStored} articles stored.`
        : `Scraping failed. ${job.results.errors} errors occurred.`,
      jobId: job.id,
      logs: job.logs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        message: log.message,
        source: log.source
      }))
    };

    console.log(`[${timestamp}] Job ${job.id} completed with status: ${job.status}`);
    console.log(`[${timestamp}] Response: ${JSON.stringify(response)}`);
    
    res.json(response);

  } catch (error) {
    console.error(`[${timestamp}] Error in scraping endpoint:`, error);
    
    if (error instanceof Error) {
      console.error(`[${timestamp}] Error name: ${error.name}`);
      console.error(`[${timestamp}] Error message: ${error.message}`);
      console.error(`[${timestamp}] Error stack: ${error.stack}`);
    }
    
    const errorResponse = {
      success: false,
      message: 'Internal server error',
      jobId: '',
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'scraper-server'
      }]
    };
    
    console.log(`[${timestamp}] Error response: ${JSON.stringify(errorResponse)}`);
    res.status(500).json(errorResponse);
  }
});

// Get scraper status endpoint
app.get('/api/status', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Status check requested`);
  
  const currentJob = scraper.getCurrentJob();
  const statusData = {
    currentJob: currentJob ? {
      id: currentJob.id,
      status: currentJob.status,
      sources: currentJob.sources,
      results: currentJob.results
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Unhandled error:`, err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    jobId: '',
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Unhandled server error',
      source: 'scraper-server'
    }]
  });
});

// Start server
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Veritas Scraper Service running on port ${PORT}`);
  console.log(`[${timestamp}] 📊 Health check: http://localhost:${PORT}/health`);
  console.log(`[${timestamp}] 🔧 Scraping API: http://localhost:${PORT}/api/scrape`);
  console.log(`[${timestamp}] 📈 Status API: http://localhost:${PORT}/api/status`);
  console.log(`[${timestamp}] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[${timestamp}] Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not-set'}`);
  console.log(`[${timestamp}] Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'not-set'}`);
  console.log(`[${timestamp}] Railway Private Domain: ${process.env.RAILWAY_PRIVATE_DOMAIN || 'not-set'}`);
});

export default app; 