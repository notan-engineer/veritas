#!/usr/bin/env node

const pg = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/veritas_local'
});

async function checkJobs() {
  try {
    const jobsResult = await pool.query(`
      SELECT
        id,
        status,
        created_at,
        triggered_at,
        completed_at,
        total_articles_scraped,
        total_errors,
        articles_per_source,
        sources_requested
      FROM scraping_jobs
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n=== Recent Scraping Jobs ===\n');
    jobsResult.rows.forEach(job => {
      console.log(`Job ID: ${job.id}`);
      console.log(`Status: ${job.status}`);
      console.log(`Created: ${new Date(job.created_at).toLocaleString()}`);
      console.log(`Scraped: ${job.total_articles_scraped || 0}`);
      console.log(`Errors: ${job.total_errors || 0}`);
      console.log(`Articles per source: ${job.articles_per_source || 'N/A'}`);
      console.log(`Sources requested: ${job.sources_requested || 'N/A'}`);
      if (job.completed_at) {
        const duration = new Date(job.completed_at) - new Date(job.triggered_at || job.created_at);
        console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
      }
      console.log('---');
    });

    // Get detailed stats for the last 3 jobs
    const last3Jobs = jobsResult.rows.slice(0, 3).map(j => j.id);

    if (last3Jobs.length > 0) {
      console.log('\n=== Detailed Analysis of Last 3 Jobs ===\n');

      for (const jobId of last3Jobs) {
        const logsResult = await pool.query(`
          SELECT
            level,
            message,
            source_name,
            additional_data,
            timestamp
          FROM scraping_logs
          WHERE job_id = $1
          ORDER BY timestamp DESC
          LIMIT 100
        `, [jobId]);

        // Count by level
        const levelCounts = {};
        const errorMessages = [];
        let extractionStats = { success: 0, failed: 0, total_requested: 0 };

        logsResult.rows.forEach(log => {
          levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;

          if (log.level === 'error') {
            errorMessages.push({
              message: log.message,
              source: log.source_name,
              data: log.additional_data
            });
          }

          // Check for extraction stats
          if (log.additional_data) {
            if (log.additional_data.event_name === 'extraction_completed') {
              extractionStats.success++;
            } else if (log.additional_data.event_name === 'extraction_failed') {
              extractionStats.failed++;
            } else if (log.additional_data.event_name === 'job_started') {
              extractionStats.total_requested = log.additional_data.total_expected || 0;
            }
          }
        });

        console.log(`\nJob ${jobId}:`);
        console.log(`Log levels:`, levelCounts);
        console.log(`Extraction: ${extractionStats.success} success, ${extractionStats.failed} failed out of ${extractionStats.total_requested} requested`);

        if (errorMessages.length > 0) {
          console.log(`\nFirst 3 errors:`);
          errorMessages.slice(0, 3).forEach((err, i) => {
            console.log(`${i + 1}. ${err.message} (Source: ${err.source || 'N/A'})`);
            if (err.data && err.data.error) {
              console.log(`   Details: ${JSON.stringify(err.data.error).substring(0, 200)}`);
            }
          });
        }
      }
    }

    // Check content saved
    const contentResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT source_id) as unique_sources,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM scraped_content
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);

    console.log('\n=== Content Saved (Last Hour) ===');
    console.log(`Total articles: ${contentResult.rows[0].total}`);
    console.log(`Unique sources: ${contentResult.rows[0].unique_sources}`);
    console.log(`Oldest: ${contentResult.rows[0].oldest ? new Date(contentResult.rows[0].oldest).toLocaleString() : 'N/A'}`);
    console.log(`Newest: ${contentResult.rows[0].newest ? new Date(contentResult.rows[0].newest).toLocaleString() : 'N/A'}`);

    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
  }
}

checkJobs();