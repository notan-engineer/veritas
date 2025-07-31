import * as dotenv from 'dotenv';
dotenv.config();

import { LogQueryHelper, getEnhancedLogs, formatLogEntry } from './log-queries';

async function testLogQueries() {
  console.log('Testing Enhanced Log Queries\n');
  
  // You'll need to replace this with an actual job ID from your database
  const testJobId = process.argv[2];
  
  if (!testJobId) {
    console.error('Usage: npm run test:logs <jobId>');
    process.exit(1);
  }
  
  try {
    console.log(`Testing logs for job: ${testJobId}\n`);
    
    // Test 1: Get job timeline
    console.log('1. Job Timeline:');
    const timeline = await LogQueryHelper.getJobTimeline(testJobId);
    timeline.forEach(event => {
      console.log(`  ${event.timestamp} [${event.event_type}] ${event.message}`);
    });
    console.log();
    
    // Test 2: Get HTTP errors
    console.log('2. HTTP Errors:');
    const httpErrors = await LogQueryHelper.getHttpErrors(testJobId);
    console.log(`  Found ${httpErrors.length} HTTP errors`);
    httpErrors.slice(0, 5).forEach(error => {
      const httpData = error.additional_data?.http;
      console.log(`  - ${error.timestamp}: ${httpData?.url} (${httpData?.status})`);
    });
    console.log();
    
    // Test 3: Get performance metrics
    console.log('3. Performance Metrics:');
    const perfMetrics = await LogQueryHelper.getPerformanceMetrics(testJobId);
    console.log(`  Found ${perfMetrics.length} performance snapshots`);
    if (perfMetrics.length > 0) {
      const latest = perfMetrics[perfMetrics.length - 1];
      if (latest) {
        console.log(`  Latest: Memory ${latest.memoryMB}MB, CPU ${latest.cpuPercent}%, Active Requests: ${latest.activeRequests}`);
      }
    }
    console.log();
    
    // Test 4: Get extraction quality
    console.log('4. Extraction Quality:');
    const quality = await LogQueryHelper.getExtractionQuality(testJobId);
    console.log(`  Articles extracted: ${quality.count}`);
    console.log(`  Average quality: ${Math.round(quality.avg_quality || 0)}/100`);
    console.log(`  Quality range: ${quality.min_quality}-${quality.max_quality}`);
    console.log(`  High quality (≥80): ${quality.high_quality}`);
    console.log(`  Low quality (<50): ${quality.low_quality}`);
    console.log();
    
    // Test 5: Get source performance
    console.log('5. Source Performance:');
    const sourcePerf = await LogQueryHelper.getSourcePerformance(testJobId);
    sourcePerf.forEach(source => {
      console.log(`  ${source.source_name}:`);
      console.log(`    - Articles: ${source.articles_extracted}`);
      console.log(`    - Errors: ${source.error_count}`);
      console.log(`    - Avg Quality: ${Math.round(source.avg_quality_score || 0)}/100`);
    });
    console.log();
    
    // Test 6: Get response time stats
    console.log('6. HTTP Response Time Statistics:');
    const respStats = await LogQueryHelper.getResponseTimeStats(testJobId);
    if (respStats) {
      console.log(`  Average: ${Math.round(respStats.avg || 0)}ms`);
      console.log(`  Median (P50): ${Math.round(respStats.p50 || 0)}ms`);
      console.log(`  P90: ${Math.round(respStats.p90 || 0)}ms`);
      console.log(`  P95: ${Math.round(respStats.p95 || 0)}ms`);
      console.log(`  P99: ${Math.round(respStats.p99 || 0)}ms`);
      console.log(`  Range: ${respStats.min}ms - ${respStats.max}ms`);
    }
    console.log();
    
    // Test 7: Get error summary
    console.log('7. Error Summary:');
    const errorSummary = await LogQueryHelper.getErrorSummary(testJobId);
    errorSummary.forEach(error => {
      console.log(`  ${error.error_type || 'Unknown'} (${error.error_code || 'N/A'}): ${error.count} occurrences`);
      if (error.sample_urls && error.sample_urls.length > 0) {
        console.log(`    Sample URL: ${error.sample_urls[0]}`);
      }
    });
    console.log();
    
    // Test 8: Get filtered logs
    console.log('8. Sample Enhanced Logs (last 10):');
    const logs = await getEnhancedLogs(testJobId, { limit: 10 });
    logs.forEach(log => {
      console.log(`  ${formatLogEntry(log)}`);
    });
    
  } catch (error) {
    console.error('Error testing logs:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testLogQueries();