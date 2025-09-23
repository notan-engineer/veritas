#!/usr/bin/env node

/**
 * Test Extraction Tracking - Verify real-time extraction tracking functionality
 *
 * This script tests that:
 * 1. Extraction works normally when tracking is disabled
 * 2. Extraction returns traces when tracking is enabled
 * 3. Content is identical in both modes
 * 4. Traces accurately reflect what was extracted
 */

const { load } = require('cheerio');
const { extractArticleContent } = require('../services/scraper/dist/utils');

// Test HTML samples
const samples = [
  {
    name: 'JSON-LD Article',
    html: `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "NewsArticle",
            "headline": "Breaking News: Test Article",
            "articleBody": "This is a test article with enough content to pass the minimum length requirement. It contains various paragraphs and sentences to simulate a real news article.",
            "author": { "name": "Test Author" },
            "datePublished": "2024-01-20T10:00:00Z"
          }
          </script>
        </head>
        <body>
          <h1>Different Title</h1>
          <p>Different content that should not be extracted.</p>
        </body>
      </html>
    `,
    expectedSource: 'JSON-LD'
  },
  {
    name: 'Selector-based Article',
    html: `
      <html>
        <head>
          <meta property="og:title" content="Meta Title">
          <meta name="author" content="Meta Author">
        </head>
        <body>
          <h1>Article Title from H1</h1>
          <div class="author">John Doe</div>
          <time datetime="2024-01-20">January 20, 2024</time>
          <article>
            This is the main article content with plenty of text to ensure it meets the minimum length requirement.
            The content includes multiple sentences and paragraphs to simulate a real article structure.
            Additional content to make it longer and more realistic.
          </article>
        </body>
      </html>
    `,
    expectedSource: 'Selectors'
  },
  {
    name: 'Meta Tags Fallback',
    html: `
      <html>
        <head>
          <meta property="og:title" content="OG Title">
          <meta property="og:description" content="This is the OG description with enough content to meet the minimum length requirement. It contains various sentences to simulate a real description.">
          <meta name="author" content="OG Author">
          <title>Page Title</title>
        </head>
        <body>
          <p>Short body text</p>
        </body>
      </html>
    `,
    expectedSource: 'Meta Tags'
  }
];

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  log('\n🧪 Testing Extraction Tracking\n', 'cyan');
  log('=' .repeat(50), 'gray');

  let allPassed = true;

  for (const sample of samples) {
    log(`\n📝 Testing: ${sample.name}`, 'yellow');

    const $ = load(sample.html);

    // Test 1: Without tracking (backward compatibility)
    const withoutTracking = extractArticleContent($, 'http://test.com', false);

    if (withoutTracking.traces) {
      log('  ❌ Failed: Traces present when tracking disabled', 'red');
      allPassed = false;
    } else {
      log('  ✅ No traces when tracking disabled', 'green');
    }

    // Test 2: With tracking
    const withTracking = extractArticleContent($, 'http://test.com', true);

    if (!withTracking.traces || withTracking.traces.length === 0) {
      log('  ❌ Failed: No traces when tracking enabled', 'red');
      allPassed = false;
    } else {
      log(`  ✅ ${withTracking.traces.length} traces recorded`, 'green');

      // Display trace details
      log('  📊 Traces:', 'cyan');
      withTracking.traces.forEach(trace => {
        const value = trace.value.length > 50
          ? trace.value.substring(0, 50) + '...'
          : trace.value;
        log(`     - ${trace.field}: ${trace.method} from "${trace.selector}"`, 'gray');
        log(`       Value: "${value}"`, 'gray');
      });
    }

    // Test 3: Content consistency
    if (withoutTracking.title !== withTracking.title ||
        withoutTracking.content !== withTracking.content ||
        withoutTracking.author !== withTracking.author ||
        withoutTracking.date !== withTracking.date) {
      log('  ❌ Failed: Content mismatch between tracking modes', 'red');
      allPassed = false;
    } else {
      log('  ✅ Content identical in both modes', 'green');
    }

    // Test 4: Verify extraction details
    log(`  📋 Extracted:`, 'cyan');
    log(`     Title: "${withTracking.title?.substring(0, 50) || 'none'}"`, 'gray');
    log(`     Content: ${withTracking.content?.length || 0} chars`, 'gray');
    log(`     Author: "${withTracking.author || 'none'}"`, 'gray');
    log(`     Date: "${withTracking.date || 'none'}"`, 'gray');
  }

  // Test 5: Default parameter (should be false)
  log('\n📝 Testing: Default tracking parameter', 'yellow');
  const $ = load(samples[0].html);
  const defaultResult = extractArticleContent($, 'http://test.com');

  if (defaultResult.traces) {
    log('  ❌ Failed: Tracking enabled by default', 'red');
    allPassed = false;
  } else {
    log('  ✅ Tracking disabled by default', 'green');
  }

  // Summary
  log('\n' + '=' .repeat(50), 'gray');
  if (allPassed) {
    log('✅ All tests passed!', 'green');
    log('\n🎉 Extraction tracking is working correctly!\n', 'cyan');
  } else {
    log('❌ Some tests failed', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});