// Test script for local BBC News scraping
const fetch = require('node-fetch');

const SCRAPER_URL = 'http://localhost:3001';

async function testScraperHealth() {
  console.log('1. Testing scraper health...');
  try {
    const response = await fetch(`${SCRAPER_URL}/health`);
    const data = await response.json();
    console.log('✓ Health check:', data);
    return true;
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    console.log('Make sure the scraper is running: cd services/scraper && npm run dev');
    return false;
  }
}

async function getSources() {
  console.log('\n2. Fetching available sources...');
  try {
    const response = await fetch(`${SCRAPER_URL}/api/scraper/sources`);
    const data = await response.json();
    console.log(`✓ Found ${data.sources.length} sources`);
    
    // Find BBC News
    const bbcSource = data.sources.find(s => 
      s.name.toLowerCase().includes('bbc')
    );
    
    if (bbcSource) {
      console.log('\n✓ BBC News source found:');
      console.log(`  ID: ${bbcSource.id}`);
      console.log(`  Name: ${bbcSource.name}`);
      console.log(`  RSS URL: ${bbcSource.rssUrl}`);
      console.log(`  Active: ${bbcSource.isActive}`);
      return bbcSource;
    } else {
      console.error('✗ BBC News source not found in database');
      console.log('Available sources:', data.sources.map(s => s.name));
      return null;
    }
  } catch (error) {
    console.error('✗ Failed to fetch sources:', error.message);
    return null;
  }
}

async function triggerScraping(sourceName, maxArticles = 5) {
  console.log(`\n3. Triggering scraping job for ${sourceName} (${maxArticles} articles)...`);
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
      console.error('✗ Failed to trigger job:', error);
      return null;
    }
    
    const data = await response.json();
    console.log('✓ Job triggered successfully!');
    console.log(`  Job ID: ${data.jobId}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Message: ${data.message}`);
    return data.jobId;
  } catch (error) {
    console.error('✗ Failed to trigger scraping:', error.message);
    return null;
  }
}

async function monitorJob(jobId) {
  console.log(`\n4. Monitoring job ${jobId}...`);
  
  const startTime = Date.now();
  let lastStatus = '';
  
  while (true) {
    try {
      const response = await fetch(`${SCRAPER_URL}/api/scraper/jobs/${jobId}`);
      const data = await response.json();
      const job = data.job;
      
      if (job.status !== lastStatus) {
        lastStatus = job.status;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`\n[${elapsed}s] Status: ${job.status}`);
        
        if (job.currentSource) {
          console.log(`  Current source: ${job.currentSource}`);
        }
        if (job.progress !== undefined) {
          console.log(`  Progress: ${job.progress}%`);
        }
        if (job.totalArticlesScraped > 0) {
          console.log(`  Articles scraped: ${job.totalArticlesScraped}`);
        }
        if (job.totalErrors > 0) {
          console.log(`  Errors: ${job.totalErrors}`);
        }
      }
      
      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        console.log('\nJob finished!');
        console.log(`  Final status: ${job.status}`);
        console.log(`  Total articles: ${job.totalArticlesScraped}`);
        console.log(`  Total errors: ${job.totalErrors}`);
        console.log(`  Duration: ${job.duration}s`);
        
        // Get some logs
        await getJobLogs(jobId, 5);
        
        return job;
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error monitoring job:', error.message);
      break;
    }
  }
}

async function getJobLogs(jobId, limit = 10) {
  console.log(`\n5. Fetching recent logs (last ${limit})...`);
  try {
    const response = await fetch(
      `${SCRAPER_URL}/api/scraper/jobs/${jobId}/logs?pageSize=${limit}`
    );
    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.log('Error: Invalid log response format');
      return;
    }
    
    console.log(`\nFound ${data.total || 0} total logs. Showing last ${Math.min(limit, data.data.length)}:`);
    data.data.forEach((log, index) => {
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      const level = (log.logLevel || log.log_level || '').toUpperCase().padEnd(7);
      const source = log.sourceName ? `[${log.sourceName}]` : '';
      console.log(`${timestamp} ${level} ${source} ${log.message}`);
      
      if ((log.additionalData || log.additional_data) && Object.keys(log.additionalData || log.additional_data).length > 0) {
        const details = JSON.stringify(log.additionalData || log.additional_data, null, 2);
        // Limit details output to first 200 chars for readability
        if (details.length > 200) {
          console.log('  Details:', details.substring(0, 200) + '...');
        } else {
          console.log('  Details:', details);
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch logs:', error.message);
  }
}

async function checkScrapedContent(sourceName) {
  console.log(`\n6. Checking scraped content for ${sourceName}...`);
  try {
    const response = await fetch(
      `${SCRAPER_URL}/api/scraper/content?source=${encodeURIComponent(sourceName)}&pageSize=5`
    );
    const data = await response.json();
    
    console.log(`\nFound ${data.total} articles from ${sourceName}. Showing first 5:`);
    data.data.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Published: ${new Date(article.publicationDate).toLocaleString()}`);
      console.log(`   Language: ${article.language}`);
      console.log(`   Status: ${article.processingStatus}`);
      console.log(`   Content preview: ${article.content.substring(0, 150)}...`);
    });
    
    return data.total > 0;
  } catch (error) {
    console.error('Failed to check content:', error.message);
    return false;
  }
}

// Main test function
async function runTest() {
  console.log('=== Veritas Scraper Local Test ===\n');
  
  // Check health
  const healthy = await testScraperHealth();
  if (!healthy) {
    return;
  }
  
  // Get BBC source
  const bbcSource = await getSources();
  if (!bbcSource) {
    return;
  }
  
  // Trigger scraping
  const jobId = await triggerScraping(bbcSource.name, 3);
  if (!jobId) {
    return;
  }
  
  // Monitor job
  const job = await monitorJob(jobId);
  
  // Check scraped content
  if (job && job.status === 'completed') {
    await checkScrapedContent(bbcSource.name);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
runTest().catch(console.error); 