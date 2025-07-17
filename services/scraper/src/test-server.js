// Simple test server to verify scraper functionality
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint to check database connection
app.get('/api/test/sources', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sources WHERE is_active = true');
    res.json({ sources: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test creating a job
app.post('/api/test/create-job', async (req, res) => {
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
    `, [jobId, ['BBC News'], 5]);
    
    // Create initial log
    await client.query(`
      INSERT INTO scraping_logs (
        job_id, log_level, message, additional_data
      ) VALUES ($1, 'info', 'Test job created', $2)
    `, [jobId, JSON.stringify({ test: true })]);
    
    await client.query('COMMIT');
    res.json({ success: true, jobId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Start server
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
}); 