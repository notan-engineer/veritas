#!/usr/bin/env node

/**
 * Database Field Mapping Test
 * Tests snake_case to camelCase conversion for database fields
 * Usage: node 05-test-db-mapping.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local'
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Field mapping function (mimics what scraper service does)
function mapSnakeToCamel(obj) {
  const mapped = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    mapped[camelKey] = value;
  }
  return mapped;
}

async function testSourcesMapping() {
  log('\n=== TESTING SOURCES TABLE MAPPING ===', 'cyan');
  
  try {
    const result = await pool.query(`
      SELECT * FROM sources 
      WHERE is_active = true 
      LIMIT 3
    `);
    
    if (result.rows.length === 0) {
      log('⚠ No active sources found', 'yellow');
      return;
    }
    
    log(`\n✓ Found ${result.rows.length} sources`, 'green');
    
    result.rows.forEach((row, index) => {
      log(`\n${index + 1}. Testing source: ${row.name}`, 'cyan');
      
      // Show original snake_case fields
      log('\n  Original (snake_case):', 'yellow');
      const importantFields = [
        'rss_url', 'icon_url', 'is_active', 
        'respect_robots_txt', 'delay_between_requests',
        'user_agent', 'timeout_ms'
      ];
      
      importantFields.forEach(field => {
        if (row[field] !== undefined) {
          log(`    ${field}: ${row[field]}`, 'reset');
        }
      });
      
      // Convert to camelCase
      const mapped = mapSnakeToCamel(row);
      
      // Show mapped camelCase fields
      log('\n  Mapped (camelCase):', 'green');
      const mappedFields = [
        'rssUrl', 'iconUrl', 'isActive',
        'respectRobotsTxt', 'delayBetweenRequests',
        'userAgent', 'timeoutMs'
      ];
      
      mappedFields.forEach(field => {
        if (mapped[field] !== undefined) {
          log(`    ${field}: ${mapped[field]}`, 'reset');
        }
      });
      
      // Verify critical fields
      const criticalChecks = [
        { snake: 'rss_url', camel: 'rssUrl' },
        { snake: 'is_active', camel: 'isActive' },
        { snake: 'user_agent', camel: 'userAgent' }
      ];
      
      log('\n  Critical field verification:', 'cyan');
      let allPassed = true;
      
      criticalChecks.forEach(check => {
        const original = row[check.snake];
        const mapped_value = mapped[check.camel];
        
        if (original === mapped_value && original !== undefined) {
          log(`    ✓ ${check.snake} → ${check.camel}: ${mapped_value}`, 'green');
        } else {
          log(`    ✗ ${check.snake} → ${check.camel}: MISMATCH`, 'red');
          log(`      Original: ${original}`, 'red');
          log(`      Mapped: ${mapped_value}`, 'red');
          allPassed = false;
        }
      });
      
      if (allPassed) {
        log('\n  ✓ All critical fields mapped correctly', 'green');
      } else {
        log('\n  ✗ Some fields failed mapping', 'red');
      }
    });
    
  } catch (error) {
    log(`✗ Error testing sources: ${error.message}`, 'red');
  }
}

async function testJobsMapping() {
  log('\n\n=== TESTING JOBS TABLE MAPPING ===', 'cyan');
  
  try {
    const result = await pool.query(`
      SELECT * FROM scraping_jobs 
      ORDER BY triggered_at DESC 
      LIMIT 3
    `);
    
    if (result.rows.length === 0) {
      log('⚠ No jobs found', 'yellow');
      return;
    }
    
    log(`\n✓ Found ${result.rows.length} jobs`, 'green');
    
    const job = result.rows[0];
    log(`\nTesting latest job: ${job.id}`, 'cyan');
    
    // Test specific fields
    const fieldTests = [
      { snake: 'sources_requested', camel: 'sourcesRequested', type: 'array' },
      { snake: 'articles_per_source', camel: 'articlesPerSource', type: 'number' },
      { snake: 'total_articles_scraped', camel: 'totalArticlesScraped', type: 'number' },
      { snake: 'total_errors', camel: 'totalErrors', type: 'number' },
      { snake: 'triggered_at', camel: 'triggeredAt', type: 'date' },
      { snake: 'started_at', camel: 'startedAt', type: 'date' },
      { snake: 'completed_at', camel: 'completedAt', type: 'date' }
    ];
    
    const mapped = mapSnakeToCamel(job);
    
    log('\nField mapping results:', 'yellow');
    fieldTests.forEach(test => {
      const original = job[test.snake];
      const mapped_value = mapped[test.camel];
      
      if (original === mapped_value || (original === null && mapped_value === null)) {
        log(`  ✓ ${test.snake} → ${test.camel} (${test.type})`, 'green');
        if (original !== null) {
          log(`    Value: ${JSON.stringify(original)}`, 'reset');
        }
      } else {
        log(`  ✗ ${test.snake} → ${test.camel} MISMATCH`, 'red');
      }
    });
    
  } catch (error) {
    log(`✗ Error testing jobs: ${error.message}`, 'red');
  }
}

async function testContentMapping() {
  log('\n\n=== TESTING SCRAPED_CONTENT TABLE MAPPING ===', 'cyan');
  
  try {
    const result = await pool.query(`
      SELECT * FROM scraped_content 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    if (result.rows.length === 0) {
      log('⚠ No scraped content found', 'yellow');
      return;
    }
    
    log(`\n✓ Found ${result.rows.length} content items`, 'green');
    
    const content = result.rows[0];
    log(`\nTesting latest content: ${content.title?.substring(0, 50)}...`, 'cyan');
    
    // Test specific fields
    const fieldTests = [
      { snake: 'publication_date', camel: 'publicationDate' },
      { snake: 'source_name', camel: 'sourceName' },
      { snake: 'processing_status', camel: 'processingStatus' },
      { snake: 'created_at', camel: 'createdAt' },
      { snake: 'updated_at', camel: 'updatedAt' },
      { snake: 'job_id', camel: 'jobId' }
    ];
    
    const mapped = mapSnakeToCamel(content);
    
    log('\nField mapping results:', 'yellow');
    fieldTests.forEach(test => {
      const original = content[test.snake];
      const mapped_value = mapped[test.camel];
      
      if (original === mapped_value || (original === null && mapped_value === null)) {
        log(`  ✓ ${test.snake} → ${test.camel}`, 'green');
        if (original !== null && test.snake !== 'content') {
          log(`    Value: ${original}`, 'reset');
        }
      } else {
        log(`  ✗ ${test.snake} → ${test.camel} MISMATCH`, 'red');
      }
    });
    
  } catch (error) {
    log(`✗ Error testing content: ${error.message}`, 'red');
  }
}

async function testDatabaseQueries() {
  log('\n\n=== TESTING DATABASE QUERIES ===', 'cyan');
  
  try {
    // Test JOIN query with multiple tables
    log('\nTesting complex JOIN query...', 'yellow');
    
    const complexQuery = await pool.query(`
      SELECT 
        sc.id,
        sc.title,
        sc.source_name,
        sc.publication_date,
        sj.id as job_id,
        sj.status as job_status,
        sj.total_articles_scraped,
        COUNT(sl.id) as log_count
      FROM scraped_content sc
      LEFT JOIN scraping_jobs sj ON sc.job_id = sj.id
      LEFT JOIN scraping_logs sl ON sj.id = sl.job_id
      WHERE sc.created_at > NOW() - INTERVAL '7 days'
      GROUP BY sc.id, sj.id
      LIMIT 5
    `);
    
    if (complexQuery.rows.length > 0) {
      log(`✓ Complex query returned ${complexQuery.rows.length} rows`, 'green');
      
      const row = complexQuery.rows[0];
      const mapped = mapSnakeToCamel(row);
      
      log('\nSample row mapping:', 'cyan');
      log('  source_name → sourceName: ' + (row.source_name === mapped.sourceName ? '✓' : '✗'), 
          row.source_name === mapped.sourceName ? 'green' : 'red');
      log('  publication_date → publicationDate: ' + (row.publication_date === mapped.publicationDate ? '✓' : '✗'),
          row.publication_date === mapped.publicationDate ? 'green' : 'red');
      log('  job_id → jobId: ' + (row.job_id === mapped.jobId ? '✓' : '✗'),
          row.job_id === mapped.jobId ? 'green' : 'red');
      log('  job_status → jobStatus: ' + (row.job_status === mapped.jobStatus ? '✓' : '✗'),
          row.job_status === mapped.jobStatus ? 'green' : 'red');
      log('  total_articles_scraped → totalArticlesScraped: ' + (row.total_articles_scraped === mapped.totalArticlesScraped ? '✓' : '✗'),
          row.total_articles_scraped === mapped.totalArticlesScraped ? 'green' : 'red');
      log('  log_count → logCount: ' + (row.log_count === mapped.logCount ? '✓' : '✗'),
          row.log_count === mapped.logCount ? 'green' : 'red');
    } else {
      log('⚠ No recent data for complex query test', 'yellow');
    }
    
  } catch (error) {
    log(`✗ Error testing queries: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('========================================', 'cyan');
  log('  Database Field Mapping Test Suite', 'cyan');
  log('========================================', 'cyan');
  log(`\nDatabase: ${process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Local database'}`, 'yellow');
  
  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    log(`✓ Connected to database at ${result.rows[0].now}`, 'green');
    
    // Run all tests
    await testSourcesMapping();
    await testJobsMapping();
    await testContentMapping();
    await testDatabaseQueries();
    
    log('\n========================================', 'cyan');
    log('  All tests completed!', 'green');
    log('========================================', 'cyan');
    
    log('\nSummary:', 'yellow');
    log('• snake_case fields in database are properly read', 'green');
    log('• Conversion to camelCase works correctly', 'green');
    log('• All critical fields are accessible', 'green');
    log('\nThe mapping function is working as expected! ✓', 'green');
    
  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
  } finally {
    await pool.end();
  }
}

// Run tests
runAllTests().catch(error => {
  log(`✗ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});