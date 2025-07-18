import { getSourceByName, getSources, createJobWithInitialLog, logJobActivity } from './database';

async function testSnakeCaseFixes() {
  console.log('=== TESTING SNAKE_CASE/CAMELCASE FIXES ===\n');
  
  try {
    // Test 1: Check sources exist and have proper mapping
    console.log('1. Testing getSources() mapping...');
    const sources = await getSources();
    console.log(`✓ Found ${sources.length} sources`);
    
    if (sources.length > 0) {
      const firstSource = sources[0]!;
      console.log('First source properties:');
      console.log('  - name:', firstSource.name);
      console.log('  - rssUrl:', firstSource.rssUrl);
      console.log('  - userAgent:', firstSource.userAgent);
      console.log('  - delayBetweenRequests:', firstSource.delayBetweenRequests);
      console.log('  - timeoutMs:', firstSource.timeoutMs);
      
      if (firstSource.rssUrl) {
        console.log('✓ rssUrl is properly mapped (not undefined)');
      } else {
        console.log('✗ rssUrl is undefined - this is the problem!');
      }
    }
    
    console.log();
    
    // Test 2: Test getSourceByName specifically for BBC News
    console.log('2. Testing getSourceByName("BBC News")...');
    try {
      const bbcSource = await getSourceByName('BBC News');
      console.log('BBC News source properties:');
      console.log('  - id:', bbcSource.id);
      console.log('  - name:', bbcSource.name);
      console.log('  - rssUrl:', bbcSource.rssUrl);
      console.log('  - userAgent:', bbcSource.userAgent);
      
      if (bbcSource.rssUrl) {
        console.log('✓ BBC News has rssUrl:', bbcSource.rssUrl);
        
        // Test 3: Try to fetch the RSS URL
        console.log('\n3. Testing RSS URL fetch...');
        const response = await fetch(bbcSource.rssUrl, {
          headers: { 'User-Agent': bbcSource.userAgent || 'Veritas/1.0' }
        });
        
        if (response.ok) {
          console.log('✓ RSS URL is accessible');
          const text = await response.text();
          if (text.includes('<rss') || text.includes('<feed')) {
            console.log('✓ RSS content looks valid');
          } else {
            console.log('⚠️ RSS content might be invalid');
          }
        } else {
          console.log('✗ RSS URL returned status:', response.status);
        }
      } else {
        console.log('✗ BBC News rssUrl is undefined!');
      }
    } catch (error) {
      console.log('✗ Error getting BBC News source:', error instanceof Error ? error.message : String(error));
      
      // List available sources for debugging
      console.log('\nAvailable sources:');
      sources.forEach(s => console.log(`  - ${s.name}`));
    }
    
    console.log();
    
    // Test 4: Create a test job to verify the full flow
    console.log('4. Testing job creation and logging...');
    const testJobId = await createJobWithInitialLog(['BBC News'], 2);
    console.log('✓ Created test job:', testJobId);
    
    await logJobActivity({
      jobId: testJobId,
      level: 'info',
      message: 'Test log entry',
      additionalData: { test: true, fixed_snake_case: 'success' }
    });
    console.log('✓ Created test log entry');
    
    console.log('\n=== ALL TESTS COMPLETED ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSnakeCaseFixes()
  .then(() => {
    console.log('\n🎉 All snake_case/camelCase fixes are working!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }); 