#!/usr/bin/env node

/**
 * Scraper End-to-End Testing Utility
 * Tests the complete scraping workflow from job creation to content retrieval
 * Usage: node 03-test-scraper.js [source-name] [max-articles]
 */

const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:3001';
const DEFAULT_SOURCE = 'BBC News';
const DEFAULT_MAX_ARTICLES = 3;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testScraperHealth() {
  log('\n1. Testing scraper health...', 'cyan');
  try {
    const response = await fetch(`${SCRAPER_URL}/health`);
    const data = await response.json();
    log(`✓ Health check passed: ${JSON.stringify(data)}`, 'green');
    return true;
  } catch (error) {
    log(`✗ Health check failed: ${error.message}`, 'red');
    log('Make sure the scraper is running: cd services/scraper && npm run dev', 'yellow');
    return false;
  }
}

async function getSources() {
  log('\n2. Fetching available sources...', 'cyan');
  try {
    const response = await fetch(`${SCRAPER_URL}/api/scraper/sources`);
    const data = await response.json();
    log(`✓ Found ${data.sources.length} sources`, 'green');
    
    // Display all sources
    log('\nAvailable sources:', 'cyan');
    data.sources.forEach(s => {
      const status = s.isActive ? '✓' : '✗';
      log(`  ${status} ${s.name} - ${s.domain}`, s.isActive ? 'green' : 'gray');
    });
    
    return data.sources;
  } catch (error) {
    log(`✗ Failed to fetch sources: ${error.message}`, 'red');
    return [];
  }
}

async function findSource(sources, targetName) {
  const source = sources.find(s => 
    s.name.toLowerCase().includes(targetName.toLowerCase())
  );
  
  if (source) {
    log(`\n✓ Found source: ${source.name}`, 'green');
    log(`  ID: ${source.id}`, 'gray');
    log(`  RSS URL: ${source.rssUrl}`, 'gray');
    log(`  Active: ${source.isActive}`, 'gray');
    return source;
  } else {
    log(`\n✗ Source "${targetName}" not found`, 'red');
    return null;
  }
}

async function triggerScraping(sourceName, maxArticles) {
  log(`\n3. Triggering scraping job for ${sourceName} (${maxArticles} articles)...`, 'cyan');
  try {
    const response = await fetch(`${SCRAPER_URL}/api/scraper/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sources: [sourceName],
        maxArticles: maxArticles
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      log(`✗ Failed to trigger job: ${JSON.stringify(error)}`, 'red');
      return null;
    }
    
    const data = await response.json();
    log('✓ Job triggered successfully!', 'green');
    log(`  Job ID: ${data.jobId}`, 'gray');
    log(`  Status: ${data.status}`, 'gray');
    return data.jobId;
  } catch (error) {
    log(`✗ Failed to trigger scraping: ${error.message}`, 'red');
    return null;
  }
}

async function monitorJob(jobId) {
  log(`\n4. Monitoring job ${jobId}...`, 'cyan');
  
  const startTime = Date.now();
  let lastStatus = '';
  let dotCount = 0;
  
  while (true) {
    try {
      const response = await fetch(`${SCRAPER_URL}/api/scraper/jobs/${jobId}`);
      const data = await response.json();
      const job = data.job;
      
      if (!job) {
        log('✗ Job not found', 'red');
        break;
      }
      
      if (job.status !== lastStatus) {
        lastStatus = job.status;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        
        // Clear the dots line
        if (dotCount > 0) {
          process.stdout.write('\r\x1b[K');
        }
        
        log(`\n[${elapsed}s] Status: ${job.status}`, 'yellow');
        
        if (job.currentSource) {
          log(`  Current source: ${job.currentSource}`, 'gray');
        }
        if (job.progress !== undefined) {
          log(`  Progress: ${job.progress}%`, 'gray');
        }
        if (job.totalArticlesScraped > 0) {
          log(`  Articles scraped: ${job.totalArticlesScraped}`, 'gray');
        }
        if (job.totalErrors > 0) {
          log(`  Errors: ${job.totalErrors}`, 'red');
        }
        
        dotCount = 0;
      } else {
        // Show progress dots
        process.stdout.write('.');
        dotCount++;
        if (dotCount > 50) {
          process.stdout.write('\r\x1b[K');
          dotCount = 0;
        }
      }
      
      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        if (dotCount > 0) {
          process.stdout.write('\r\x1b[K');
        }
        
        log('\n=== Job Complete ===', 'cyan');
        log(`  Final status: ${job.status}`, job.status === 'completed' ? 'green' : 'red');
        log(`  Total articles: ${job.totalArticlesScraped}`, 'gray');
        log(`  Total errors: ${job.totalErrors}`, 'gray');
        log(`  Duration: ${job.duration}s`, 'gray');
        
        return job;
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      log(`\nError monitoring job: ${error.message}`, 'red');
      break;
    }
  }
}

async function getJobLogs(jobId, limit = 10) {
  log(`\n5. Fetching recent logs (last ${limit})...`, 'cyan');
  try {
    const response = await fetch(
      `${SCRAPER_URL}/api/scraper/jobs/${jobId}/logs?pageSize=${limit}`
    );
    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      log('No logs found', 'yellow');
      return;
    }
    
    log(`Found ${data.total || 0} total logs. Showing last ${Math.min(limit, data.data.length)}:`, 'gray');
    data.data.forEach((log_entry) => {
      const timestamp = new Date(log_entry.timestamp).toLocaleTimeString();
      const level = (log_entry.logLevel || log_entry.log_level || '').toUpperCase();
      const levelColor = level === 'ERROR' ? 'red' : level === 'WARNING' ? 'yellow' : 'gray';
      const source = log_entry.sourceName ? `[${log_entry.sourceName}]` : '';
      
      log(`${timestamp} ${level} ${source} ${log_entry.message}`, levelColor);
    });
  } catch (error) {
    log(`Failed to fetch logs: ${error.message}`, 'red');
  }
}

async function checkScrapedContent(sourceName) {
  log(`\n6. Checking scraped content for ${sourceName}...`, 'cyan');
  try {
    const response = await fetch(
      `${SCRAPER_URL}/api/scraper/content?source=${encodeURIComponent(sourceName)}&pageSize=5`
    );
    const data = await response.json();
    
    log(`Found ${data.total} articles from ${sourceName}. Showing first 5:`, 'green');
    data.data.forEach((article, index) => {
      log(`\n${index + 1}. ${article.title}`, 'cyan');
      log(`   Published: ${new Date(article.publicationDate).toLocaleString()}`, 'gray');
      log(`   Language: ${article.language}`, 'gray');
      log(`   Status: ${article.processingStatus}`, 'gray');
      const preview = article.content.substring(0, 150).replace(/\n/g, ' ');
      log(`   Preview: ${preview}...`, 'gray');
    });
    
    return data.total > 0;
  } catch (error) {
    log(`Failed to check content: ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runTest() {
  const sourceName = process.argv[2] || DEFAULT_SOURCE;
  const maxArticles = parseInt(process.argv[3]) || DEFAULT_MAX_ARTICLES;
  
  log('===========================================', 'cyan');
  log('    Veritas Scraper Test Suite', 'cyan');
  log('===========================================', 'cyan');
  log(`Target: ${sourceName}`, 'yellow');
  log(`Articles: ${maxArticles}`, 'yellow');
  log(`Scraper URL: ${SCRAPER_URL}`, 'yellow');
  
  // Check health
  const healthy = await testScraperHealth();
  if (!healthy) {
    log('\n❌ Scraper is not running. Please start it first.', 'red');
    process.exit(1);
  }
  
  // Get sources
  const sources = await getSources();
  if (sources.length === 0) {
    log('\n❌ No sources found in database.', 'red');
    process.exit(1);
  }
  
  // Find target source
  const source = await findSource(sources, sourceName);
  if (!source) {
    log(`\nAvailable source names: ${sources.map(s => s.name).join(', ')}`, 'yellow');
    process.exit(1);
  }
  
  // Trigger scraping
  const jobId = await triggerScraping(source.name, maxArticles);
  if (!jobId) {
    log('\n❌ Failed to start scraping job.', 'red');
    process.exit(1);
  }
  
  // Monitor job
  const job = await monitorJob(jobId);
  
  // Get logs
  if (job) {
    await getJobLogs(jobId);
  }
  
  // Check scraped content
  if (job && job.status === 'completed') {
    await checkScrapedContent(source.name);
    log('\n✅ Test completed successfully!', 'green');
  } else {
    log('\n⚠️ Test completed with issues.', 'yellow');
  }
  
  log('\n===========================================', 'cyan');
}

// Run the test
runTest().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});