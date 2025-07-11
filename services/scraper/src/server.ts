import express from 'express';
import cors from 'cors';
import { scraper } from './scraper';
import { TriggerScrapingRequest, TriggerScrapingResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'veritas-scraper',
    timestamp: new Date().toISOString()
  });
});

// Scraping trigger endpoint
app.post('/api/scrape', async (req, res): Promise<void> => {
  try {
    const request: TriggerScrapingRequest = req.body;
    
    // Validate request
    if (!request.sources || !Array.isArray(request.sources) || request.sources.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: sources array is required',
        jobId: '',
        logs: []
      });
      return;
    }

    console.log(`[Scraper Server] Scraping request received for sources: ${request.sources.join(', ')}`);
    
    // Trigger scraping
    const job = await scraper.scrapeContent(request);
    
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

    console.log(`[Scraper Server] Job ${job.id} completed with status: ${job.status}`);
    res.json(response);

  } catch (error) {
    console.error('[Scraper Server] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      jobId: '',
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }]
    });
  }
});

// Get scraper status endpoint
app.get('/api/status', (req, res) => {
  const currentJob = scraper.getCurrentJob();
  res.json({
    currentJob: currentJob ? {
      id: currentJob.id,
      status: currentJob.status,
      sources: currentJob.sources,
      results: currentJob.results
    } : null,
    service: 'veritas-scraper',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Veritas Scraper Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Scraping API: http://localhost:${PORT}/api/scrape`);
});

export default app; 