#!/usr/bin/env node

/**
 * Test script to verify Crawlee storage configuration
 * Tests both development and production modes
 */

const { spawn } = require('child_process');
const path = require('path');

async function testStorageMode(mode) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${mode.toUpperCase()} mode`);
  console.log('='.repeat(60));

  return new Promise((resolve) => {
    const env = { ...process.env };

    if (mode === 'production') {
      env.NODE_ENV = 'production';
    } else {
      delete env.NODE_ENV;
    }

    const scraperPath = path.join(__dirname, '..', 'services', 'scraper');
    const child = spawn('node', ['dist/api-server.js'], {
      cwd: scraperPath,
      env,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);

      // Check for the expected log message
      if (text.includes('in-memory storage') || text.includes('file system storage')) {
        setTimeout(() => {
          child.kill();
        }, 1000);
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data.toString());
    });

    child.on('close', (code) => {
      console.log(`\n${mode} mode test completed (exit code: ${code || 0})`);

      // Verify correct storage mode was used
      if (mode === 'production' && output.includes('in-memory storage')) {
        console.log('✅ Production mode correctly uses in-memory storage');
      } else if (mode === 'development' && output.includes('file system storage')) {
        console.log('✅ Development mode correctly uses file system storage');
      } else {
        console.log('❌ Storage mode verification failed');
        console.log('Output:', output);
      }

      resolve();
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      child.kill();
    }, 5000);
  });
}

async function main() {
  console.log('Testing Crawlee Storage Configuration');
  console.log('=====================================');

  try {
    // Test development mode
    await testStorageMode('development');

    // Test production mode
    await testStorageMode('production');

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ All storage mode tests completed');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();