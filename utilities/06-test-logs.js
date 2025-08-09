#!/usr/bin/env node

/**
 * Enhanced Log Analysis Tool
 * Analyzes scraping job logs with detailed metrics and insights
 * Usage: node 06-test-logs.js <jobId> [options]
 * Options: --limit=50, --level=error, --timeline, --metrics
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local'
});

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Parse command line arguments
function parseArgs() {
  const args = {
    jobId: process.argv[2],
    limit: 50,
    level: null,
    timeline: false,
    metrics: false
  };
  
  process.argv.slice(3).forEach(arg => {
    if (arg.startsWith('--limit=')) {
      args.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--level=')) {
      args.level = arg.split('=')[1];
    } else if (arg === '--timeline') {
      args.timeline = true;
    } else if (arg === '--metrics') {
      args.metrics = true;
    }
  });
  
  return args;
}

// Format log entry for display
function formatLogEntry(log_entry) {
  const timestamp = new Date(log_entry.timestamp || log_entry.created_at).toLocaleTimeString();
  const level = (log_entry.log_level || 'info').toUpperCase().padEnd(7);
  const levelColor = {
    'ERROR': 'red',
    'WARNING': 'yellow',
    'INFO': 'cyan',
    'DEBUG': 'gray'
  }[level.trim()] || 'reset';
  
  let message = `${timestamp} [${level}] ${log_entry.message}`;
  
  // Add source name if present
  if (log_entry.source_name) {
    message = `${timestamp} [${level}] [${log_entry.source_name}] ${log_entry.message}`;
  }
  
  return { message, color: levelColor };
}

async function getJobTimeline(jobId) {
  log('\n=== JOB TIMELINE ===', 'cyan');
  
  const result = await pool.query(`
    SELECT 
      timestamp,
      log_level,
      message,
      additional_data->>'event_type' as event_type,
      additional_data->>'source_name' as source_name
    FROM scraping_logs
    WHERE job_id = $1
      AND (
        message LIKE 'Job%' OR 
        message LIKE 'Starting%' OR 
        message LIKE 'Completed%' OR
        message LIKE 'Failed%' OR
        additional_data->>'event_type' = 'lifecycle'
      )
    ORDER BY timestamp ASC
  `, [jobId]);
  
  if (result.rows.length === 0) {
    log('No timeline events found', 'yellow');
    return;
  }
  
  result.rows.forEach(event => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const eventType = event.event_type || 'general';
    const color = event.log_level === 'error' ? 'red' : 
                   event.log_level === 'warning' ? 'yellow' : 'green';
    
    log(`  ${time} [${eventType}] ${event.message}`, color);
  });
}

async function getPerformanceMetrics(jobId) {
  log('\n=== PERFORMANCE METRICS ===', 'cyan');
  
  const result = await pool.query(`
    SELECT 
      timestamp,
      additional_data->>'performance' as perf_data,
      additional_data->>'http' as http_data,
      additional_data->>'extraction' as extraction_data
    FROM scraping_logs
    WHERE job_id = $1
      AND (
        additional_data->>'performance' IS NOT NULL OR
        additional_data->>'http' IS NOT NULL OR
        additional_data->>'extraction' IS NOT NULL
      )
    ORDER BY timestamp ASC
  `, [jobId]);
  
  if (result.rows.length === 0) {
    log('No performance data found', 'yellow');
    return;
  }
  
  // Aggregate metrics
  const httpMetrics = [];
  const extractionMetrics = [];
  const performanceSnapshots = [];
  
  result.rows.forEach(row => {
    if (row.http_data) {
      const http = JSON.parse(row.http_data);
      if (http.responseTime) httpMetrics.push(http.responseTime);
    }
    
    if (row.extraction_data) {
      const extraction = JSON.parse(row.extraction_data);
      if (extraction.quality) extractionMetrics.push(extraction.quality);
    }
    
    if (row.perf_data) {
      const perf = JSON.parse(row.perf_data);
      performanceSnapshots.push({
        time: new Date(row.timestamp),
        memory: perf.memoryMB,
        cpu: perf.cpuPercent
      });
    }
  });
  
  // Display HTTP metrics
  if (httpMetrics.length > 0) {
    const avg = httpMetrics.reduce((a, b) => a + b, 0) / httpMetrics.length;
    const max = Math.max(...httpMetrics);
    const min = Math.min(...httpMetrics);
    
    log('\nHTTP Response Times:', 'yellow');
    log(`  Average: ${Math.round(avg)}ms`, 'reset');
    log(`  Min: ${min}ms`, 'green');
    log(`  Max: ${max}ms`, 'red');
  }
  
  // Display extraction quality
  if (extractionMetrics.length > 0) {
    const avg = extractionMetrics.reduce((a, b) => a + b, 0) / extractionMetrics.length;
    const high = extractionMetrics.filter(q => q >= 80).length;
    const low = extractionMetrics.filter(q => q < 50).length;
    
    log('\nExtraction Quality:', 'yellow');
    log(`  Average: ${Math.round(avg)}/100`, 'reset');
    log(`  High quality (≥80): ${high} articles`, 'green');
    log(`  Low quality (<50): ${low} articles`, 'red');
  }
  
  // Display performance snapshots
  if (performanceSnapshots.length > 0) {
    const lastSnapshot = performanceSnapshots[performanceSnapshots.length - 1];
    const maxMemory = Math.max(...performanceSnapshots.map(s => s.memory || 0));
    const maxCpu = Math.max(...performanceSnapshots.map(s => s.cpu || 0));
    
    log('\nResource Usage:', 'yellow');
    log(`  Peak Memory: ${maxMemory}MB`, 'reset');
    log(`  Peak CPU: ${maxCpu}%`, 'reset');
    log(`  Final Memory: ${lastSnapshot.memory}MB`, 'reset');
  }
}

async function getErrorSummary(jobId) {
  log('\n=== ERROR SUMMARY ===', 'cyan');
  
  const result = await pool.query(`
    SELECT 
      message,
      additional_data->>'error_type' as error_type,
      additional_data->>'error_code' as error_code,
      additional_data->>'url' as url,
      COUNT(*) as count
    FROM scraping_logs
    WHERE job_id = $1 AND log_level = 'error'
    GROUP BY message, error_type, error_code, url
    ORDER BY count DESC
    LIMIT 10
  `, [jobId]);
  
  if (result.rows.length === 0) {
    log('✓ No errors found!', 'green');
    return;
  }
  
  log(`\nFound ${result.rows.length} unique error types:`, 'red');
  
  result.rows.forEach((error, index) => {
    log(`\n${index + 1}. ${error.message} (${error.count} occurrences)`, 'red');
    if (error.error_type) log(`   Type: ${error.error_type}`, 'gray');
    if (error.error_code) log(`   Code: ${error.error_code}`, 'gray');
    if (error.url) log(`   URL: ${error.url}`, 'gray');
  });
}

async function getSourcePerformance(jobId) {
  log('\n=== SOURCE PERFORMANCE ===', 'cyan');
  
  const result = await pool.query(`
    SELECT 
      additional_data->>'source_name' as source_name,
      COUNT(CASE WHEN log_level = 'error' THEN 1 END) as error_count,
      COUNT(CASE WHEN message LIKE '%Article extracted%' THEN 1 END) as articles_extracted,
      AVG(CASE 
        WHEN additional_data->>'extraction' IS NOT NULL 
        THEN (additional_data->'extraction'->>'quality')::NUMERIC 
      END) as avg_quality
    FROM scraping_logs
    WHERE job_id = $1 
      AND additional_data->>'source_name' IS NOT NULL
    GROUP BY source_name
    ORDER BY source_name
  `, [jobId]);
  
  if (result.rows.length === 0) {
    log('No source-specific data found', 'yellow');
    return;
  }
  
  result.rows.forEach(source => {
    if (!source.source_name) return;
    
    const errorColor = source.error_count > 0 ? 'red' : 'green';
    const qualityColor = source.avg_quality >= 80 ? 'green' : 
                          source.avg_quality >= 50 ? 'yellow' : 'red';
    
    log(`\n${source.source_name}:`, 'cyan');
    log(`  Articles extracted: ${source.articles_extracted}`, 'reset');
    log(`  Errors: ${source.error_count}`, errorColor);
    if (source.avg_quality) {
      log(`  Average quality: ${Math.round(source.avg_quality)}/100`, qualityColor);
    }
  });
}

async function getFilteredLogs(jobId, options) {
  log(`\n=== DETAILED LOGS (last ${options.limit}) ===`, 'cyan');
  
  let query = `
    SELECT 
      timestamp,
      log_level,
      message,
      additional_data
    FROM scraping_logs
    WHERE job_id = $1
  `;
  
  const params = [jobId];
  
  if (options.level) {
    query += ` AND log_level = $2`;
    params.push(options.level);
  }
  
  query += ` ORDER BY timestamp DESC LIMIT ${options.limit}`;
  
  const result = await pool.query(query, params);
  
  if (result.rows.length === 0) {
    log('No logs found matching criteria', 'yellow');
    return;
  }
  
  // Display logs in reverse order (oldest first)
  result.rows.reverse().forEach(log_entry => {
    const { message, color } = formatLogEntry(log_entry);
    log(message, color);
    
    // Show additional data if present and interesting
    if (log_entry.additional_data && Object.keys(log_entry.additional_data).length > 0) {
      const data = log_entry.additional_data;
      
      // Only show non-empty, interesting fields
      const interestingFields = ['url', 'error', 'extraction', 'http', 'performance'];
      const hasInterestingData = interestingFields.some(field => data[field]);
      
      if (hasInterestingData) {
        log('  Additional data:', 'gray');
        interestingFields.forEach(field => {
          if (data[field]) {
            const value = typeof data[field] === 'object' ? 
                          JSON.stringify(data[field], null, 2) : 
                          data[field];
            log(`    ${field}: ${value}`, 'gray');
          }
        });
      }
    }
  });
  
  log(`\nShowing ${result.rows.length} of total logs`, 'gray');
}

async function getJobSummary(jobId) {
  const result = await pool.query(`
    SELECT 
      id,
      status,
      sources_requested,
      articles_per_source,
      total_articles_scraped,
      total_errors,
      triggered_at,
      started_at,
      completed_at,
      EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - triggered_at)) as duration
    FROM scraping_jobs
    WHERE id = $1
  `, [jobId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

async function main() {
  const args = parseArgs();
  
  if (!args.jobId) {
    log('Usage: node 06-test-logs.js <jobId> [options]', 'yellow');
    log('\nOptions:', 'cyan');
    log('  --limit=N     Number of logs to show (default: 50)', 'reset');
    log('  --level=LEVEL Filter by log level (error, warning, info, debug)', 'reset');
    log('  --timeline    Show job timeline', 'reset');
    log('  --metrics     Show performance metrics', 'reset');
    log('\nExample:', 'cyan');
    log('  node 06-test-logs.js abc-123 --limit=100 --level=error', 'reset');
    process.exit(1);
  }
  
  try {
    log('========================================', 'cyan');
    log('  Enhanced Log Analysis Tool', 'cyan');
    log('========================================', 'cyan');
    
    // Get job summary
    const job = await getJobSummary(args.jobId);
    
    if (!job) {
      log(`\n✗ Job ${args.jobId} not found`, 'red');
      await pool.end();
      process.exit(1);
    }
    
    // Display job summary
    log(`\nJob ID: ${job.id}`, 'yellow');
    log(`Status: ${job.status}`, job.status === 'completed' ? 'green' : 
                                 job.status === 'failed' ? 'red' : 'yellow');
    log(`Sources: ${job.sources_requested.join(', ')}`, 'reset');
    log(`Articles scraped: ${job.total_articles_scraped}`, 'reset');
    log(`Errors: ${job.total_errors}`, job.total_errors > 0 ? 'red' : 'green');
    log(`Duration: ${Math.round(job.duration)}s`, 'reset');
    
    // Show requested analyses
    if (args.timeline) {
      await getJobTimeline(args.jobId);
    }
    
    if (args.metrics) {
      await getPerformanceMetrics(args.jobId);
    }
    
    // Always show error summary if there were errors
    if (job.total_errors > 0) {
      await getErrorSummary(args.jobId);
    }
    
    // Always show source performance
    await getSourcePerformance(args.jobId);
    
    // Show detailed logs
    await getFilteredLogs(args.jobId, args);
    
    log('\n========================================', 'cyan');
    log('  Analysis Complete', 'green');
    log('========================================', 'cyan');
    
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  log(`✗ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});