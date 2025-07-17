// Simple API server for scraper testing
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use DATABASE_PUBLIC_URL from environment
const databaseUrl = process.env.DATABASE_PUBLIC_URL || 'postgresql://postgres:ALFeIUozYsAHAFdIJNiExDzCZkjDYrvT@mainline.proxy.rlwy.net:24886/railway';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

// Error recovery on startup
async function recoverStuckJobs() {
  try {
    const result = await pool.query(`
      UPDATE scraping_jobs 
      SET status = 'failed',
          completed_at = NOW()
      WHERE status IN ('running', 'pending')
        AND triggered_at < NOW() - INTERVAL '1 hour'
      RETURNING id
    `);
    
    console.log(`Recovered ${result.rowCount} stuck jobs`);
  } catch (error) {
    console.error('Failed to recover stuck jobs:', error);
  }
}

// Initialize on startup
recoverStuckJobs();

// API endpoints
app.get('/api/sources', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, domain, rss_url, icon_url,
        respect_robots_txt, delay_between_requests,
        user_agent, timeout_ms, created_at
      FROM sources
      ORDER BY name
    `);
    
    const sources = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      domain: row.domain,
      rssUrl: row.rss_url,
      iconUrl: row.icon_url,
      respectRobotsTxt: row.respect_robots_txt,
      delayBetweenRequests: row.delay_between_requests,
      userAgent: row.user_agent,
      timeoutMs: row.timeout_ms,
      createdAt: row.created_at
    }));
    
    res.json({ sources });
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple trigger endpoint for testing
app.post('/api/scraper/trigger', async (req, res) => {
  const { sources, maxArticles } = req.body;
  const crypto = require('crypto');
  const jobId = crypto.randomUUID();
  
  console.log('Trigger job:', { jobId, sources, maxArticles });
  
  res.json({
    jobId,
    status: 'started',
    message: `Job ${jobId} started for sources: ${sources.join(', ')}`
  });
});

// Get jobs (mock data for now)
app.get('/api/scraper/jobs', async (req, res) => {
  res.json({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
  });
});

// Get metrics (mock data for now)
app.get('/api/scraper/metrics', async (req, res) => {
  res.json({
    jobsTriggered: 0,
    successRate: 0,
    articlesScraped: 0,
    averageJobDuration: 0,
    activeJobs: 0,
    recentErrors: 0
  });
});

// Get content (empty for now)
app.get('/api/scraper/content', async (req, res) => {
  res.json({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false
  });
});

// Get sources (matches /api/scraper/sources)
app.get('/api/scraper/sources', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, domain, rss_url, icon_url,
        respect_robots_txt, delay_between_requests,
        user_agent, timeout_ms, created_at
      FROM sources
      ORDER BY name
    `);
    
    const sources = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      domain: row.domain,
      rssUrl: row.rss_url,
      iconUrl: row.icon_url,
      respectRobotsTxt: row.respect_robots_txt,
      delayBetweenRequests: row.delay_between_requests,
      userAgent: row.user_agent,
      timeoutMs: row.timeout_ms,
      createdAt: row.created_at
    }));
    
    res.json({ sources });
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Simple API server running on port ${port}`);
}); 