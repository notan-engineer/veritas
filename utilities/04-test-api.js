#!/usr/bin/env node

/**
 * Simple API Test Server
 * Creates a minimal Express server for testing API endpoints
 * Usage: node 04-test-api.js [port]
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

// Configuration
const PORT = process.env.PORT || process.argv[2] || 3001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local';

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
});

// Startup tasks
async function initializeServer() {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0].now);
    
    // Recover stuck jobs
    const recovered = await pool.query(`
      UPDATE scraping_jobs 
      SET status = 'failed', completed_at = NOW()
      WHERE status IN ('running', 'pending')
        AND triggered_at < NOW() - INTERVAL '1 hour'
      RETURNING id
    `);
    
    if (recovered.rowCount > 0) {
      console.log(`✓ Recovered ${recovered.rowCount} stuck jobs`);
    }
    
    // Count data
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM sources) as sources,
        (SELECT COUNT(*) FROM scraping_jobs) as jobs,
        (SELECT COUNT(*) FROM scraped_content) as content
    `);
    
    console.log('✓ Database status:');
    console.log(`  - Sources: ${counts.rows[0].sources}`);
    console.log(`  - Jobs: ${counts.rows[0].jobs}`);
    console.log(`  - Content: ${counts.rows[0].content}`);
    
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    console.log('  Make sure PostgreSQL is running and database exists');
  }
}

// ===== API ENDPOINTS =====

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Get all sources
app.get('/api/sources', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, domain, rss_url, icon_url, is_active,
        respect_robots_txt, delay_between_requests,
        user_agent, timeout_ms, created_at, updated_at
      FROM sources
      ORDER BY name
    `);
    
    const sources = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      domain: row.domain,
      rssUrl: row.rss_url,
      iconUrl: row.icon_url,
      isActive: row.is_active,
      respectRobotsTxt: row.respect_robots_txt,
      delayBetweenRequests: row.delay_between_requests,
      userAgent: row.user_agent,
      timeoutMs: row.timeout_ms,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json({ sources, total: sources.length });
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources', details: error.message });
  }
});

// Get single source
app.get('/api/sources/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sources WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.json({ source: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source', details: error.message });
  }
});

// Create test job
app.post('/api/test/create-job', async (req, res) => {
  const { sources = ['BBC News'], maxArticles = 5 } = req.body;
  const client = await pool.connect();
  const jobId = crypto.randomUUID();
  
  try {
    await client.query('BEGIN');
    
    // Create job
    await client.query(`
      INSERT INTO scraping_jobs (
        id, status, sources_requested, articles_per_source,
        triggered_at, total_articles_scraped, total_errors
      ) VALUES ($1, 'pending', $2, $3, NOW(), 0, 0)
    `, [jobId, sources, maxArticles]);
    
    // Create initial log
    await client.query(`
      INSERT INTO scraping_logs (
        job_id, log_level, message, additional_data, timestamp
      ) VALUES ($1, 'info', 'Test job created', $2, NOW())
    `, [jobId, JSON.stringify({ test: true, sources, maxArticles })]);
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      jobId,
      message: `Test job ${jobId} created for ${sources.join(', ')}`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  } finally {
    client.release();
  }
});

// Get jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        id, status, sources_requested, articles_per_source,
        total_articles_scraped, total_errors,
        triggered_at, started_at, completed_at,
        EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - triggered_at)) as duration
      FROM scraping_jobs
      ORDER BY triggered_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM scraping_jobs');
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

// Get job details
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobResult = await pool.query(
      'SELECT * FROM scraping_jobs WHERE id = $1',
      [req.params.id]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const logsResult = await pool.query(
      'SELECT * FROM scraping_logs WHERE job_id = $1 ORDER BY timestamp DESC LIMIT 50',
      [req.params.id]
    );
    
    res.json({
      job: jobResult.rows[0],
      logs: logsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

// Get scraped content
app.get('/api/content', async (req, res) => {
  try {
    const { source, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        id, url, title, content, author, 
        publication_date, source_name, language,
        processing_status, created_at
      FROM scraped_content
    `;
    
    const params = [];
    if (source) {
      query += ' WHERE source_name = $1';
      params.push(source);
    }
    
    query += ' ORDER BY created_at DESC';
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    const result = await pool.query(query, params);
    
    let countQuery = 'SELECT COUNT(*) FROM scraped_content';
    if (source) {
      countQuery += ' WHERE source_name = $1';
    }
    
    const countResult = await pool.query(countQuery, params);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content', details: error.message });
  }
});

// Database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM sources) as total_sources,
        (SELECT COUNT(*) FROM sources WHERE is_active = true) as active_sources,
        (SELECT COUNT(*) FROM scraping_jobs) as total_jobs,
        (SELECT COUNT(*) FROM scraping_jobs WHERE status = 'completed') as completed_jobs,
        (SELECT COUNT(*) FROM scraping_jobs WHERE status = 'failed') as failed_jobs,
        (SELECT COUNT(*) FROM scraped_content) as total_content,
        (SELECT COUNT(DISTINCT source_name) FROM scraped_content) as unique_sources,
        (SELECT MAX(created_at) FROM scraped_content) as last_scrape
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// Clear test data
app.delete('/api/test/clear', async (req, res) => {
  const { confirm } = req.body;
  
  if (confirm !== 'DELETE_ALL_TEST_DATA') {
    return res.status(400).json({ 
      error: 'Confirmation required',
      message: 'Send { "confirm": "DELETE_ALL_TEST_DATA" } to proceed'
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = {
      logs: (await client.query('DELETE FROM scraping_logs')).rowCount,
      jobs: (await client.query('DELETE FROM scraping_jobs')).rowCount,
      content: (await client.query('DELETE FROM scraped_content')).rowCount
    };
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      deleted: results
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to clear data', details: error.message });
  } finally {
    client.release();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/sources',
      'GET /api/sources/:id',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      'GET /api/content',
      'GET /api/stats',
      'POST /api/test/create-job',
      'DELETE /api/test/clear'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
async function startServer() {
  await initializeServer();
  
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log(`✓ Test API server running on port ${PORT}`);
    console.log('========================================');
    console.log('\nAvailable endpoints:');
    console.log(`  http://localhost:${PORT}/health`);
    console.log(`  http://localhost:${PORT}/api/sources`);
    console.log(`  http://localhost:${PORT}/api/jobs`);
    console.log(`  http://localhost:${PORT}/api/content`);
    console.log(`  http://localhost:${PORT}/api/stats`);
    console.log('\nPress Ctrl+C to stop the server');
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});