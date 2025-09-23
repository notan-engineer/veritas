# Real-Time Extraction Tracking Implementation Plan

## Executive Summary
Implementation plan for tracking exactly which DOM nodes are accessed during extraction, replacing the current post-extraction string matching with 100% accurate highlighting.

## Objectives
1. Track DOM node access during extraction in real-time
2. Record exact selectors and methods used to extract each field
3. Provide accurate highlighting without false positives/negatives
4. Maintain consistency between scraper service and debugging utility

## Core Design

### Simple Tracking Interface
```typescript
// Simple trace structure - only what we need
interface ExtractionTrace {
  field: string;      // "title", "content", "author", "date"
  selector: string;   // The selector that was used
  method: string;     // "text", "attr", "html"
  value: string;      // What was extracted
}
```

### Minimal Wrapper Approach
Instead of complex Cheerio wrapping, use a simple recording pattern:

```typescript
// Simple tracking helper
class ExtractionRecorder {
  private traces: ExtractionTrace[] = [];
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  // Record what we're extracting
  record(field: string, selector: string, method: string, value: string) {
    if (!this.enabled) return value;

    if (value) {
      this.traces.push({ field, selector, method, value });
    }
    return value;
  }

  getTraces(): ExtractionTrace[] {
    return this.traces;
  }
}
```

## Implementation Steps

### Step 1: Create Tracking Module

**File**: `services/scraper/src/extraction-recorder.ts`

```typescript
export interface ExtractionTrace {
  field: string;
  selector: string;
  method: string;
  value: string;
}

export class ExtractionRecorder {
  private traces: ExtractionTrace[] = [];
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  // Wrap text extraction
  text($: CheerioAPI, selector: string, field: string): string {
    const value = $(selector).text().trim();
    return this.record(field, selector, 'text', value);
  }

  // Wrap attribute extraction
  attr($: CheerioAPI, selector: string, attribute: string, field: string): string {
    const value = $(selector).attr(attribute) || '';
    return this.record(field, `${selector}[${attribute}]`, 'attr', value);
  }

  // Wrap HTML extraction
  html($: CheerioAPI, selector: string, field: string): string {
    const value = $(selector).html() || '';
    return this.record(field, selector, 'html', value);
  }

  private record(field: string, selector: string, method: string, value: string): string {
    if (this.enabled && value) {
      this.traces.push({ field, selector, method, value });
    }
    return value;
  }

  getTraces(): ExtractionTrace[] {
    return this.traces;
  }
}
```

### Step 2: Modify Extraction Function

**File**: `services/scraper/src/utils.ts`

Update the extraction to optionally use the recorder:

```typescript
import { ExtractionRecorder } from './extraction-recorder';

export function extractArticleContent(
  $: CheerioAPI,
  url: string,
  enableTracking: boolean = false
): ArticleContent & { traces?: ExtractionTrace[] } {

  const recorder = new ExtractionRecorder(enableTracking);

  const strategies = [
    // Strategy 1: JSON-LD (unchanged logic, just record if tracking)
    () => {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts.eq(i);
        try {
          const data = JSON.parse(script.text());
          if (data['@type'] === 'NewsArticle' || data['@type'] === 'Article') {
            // Record what we found if tracking is enabled
            if (enableTracking) {
              recorder.record('json-ld', 'script[type="application/ld+json"]', 'text', script.text());
            }
            return {
              title: data.headline || '',
              content: data.articleBody || '',
              author: data.author?.name || null,
              date: data.datePublished || null
            };
          }
        } catch (e) {
          // Continue to next script
        }
      }
      return null;
    },

    // Strategy 2: Common selectors with recording
    () => {
      const title = recorder.text($, 'h1', 'title') ||
                   recorder.attr($, 'meta[property="og:title"]', 'content', 'title') ||
                   '';

      // Try each content selector and record what works
      let content = '';
      const contentSelectors = [
        'article', '.article-content', '.story-body',
        '.entry-content', '.post-content', 'main'
      ];

      for (const selector of contentSelectors) {
        const value = recorder.text($, selector, 'content');
        if (value && value.length > 100) {
          content = value;
          break;
        }
      }

      const author = recorder.text($, '.author', 'author') ||
                    recorder.text($, '.by-author', 'author') ||
                    recorder.text($, '.article-author', 'author') ||
                    recorder.attr($, 'meta[name="author"]', 'content', 'author') ||
                    null;

      const date = recorder.attr($, 'time', 'datetime', 'date') ||
                  recorder.text($, '.date', 'date') ||
                  recorder.text($, '.published', 'date') ||
                  recorder.attr($, 'meta[property="article:published_time"]', 'content', 'date') ||
                  null;

      return { title, content, author, date };
    },

    // Strategy 3: Meta fallback (similar pattern)
    () => ({
      title: recorder.attr($, 'meta[property="og:title"]', 'content', 'title') ||
             recorder.attr($, 'meta[name="twitter:title"]', 'content', 'title') ||
             recorder.text($, 'title', 'title') ||
             '',
      content: recorder.attr($, 'meta[property="og:description"]', 'content', 'content') ||
              recorder.attr($, 'meta[name="description"]', 'content', 'content') ||
              '',
      author: recorder.attr($, 'meta[name="author"]', 'content', 'author') || null,
      date: recorder.attr($, 'meta[property="article:published_time"]', 'content', 'date') || null
    })
  ];

  // Execute strategies (existing logic)
  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result && result.content && result.content.length > 100) {
        // Clean up content
        result.content = result.content
          .replace(/\s+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        // Add traces if tracking
        if (enableTracking) {
          return { ...result, traces: recorder.getTraces() };
        }
        return result;
      }
    } catch (e) {
      // Try next strategy
    }
  }

  // Fallback
  const fallbackResult = {
    title: $('title').text().trim() || 'Untitled',
    content: $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000),
    author: null,
    date: null
  };

  if (enableTracking) {
    return { ...fallbackResult, traces: recorder.getTraces() };
  }
  return fallbackResult;
}
```

### Step 3: Update Debugging Utility

**File**: `utilities/07-extraction-analyzer.js`

Update the utility to use the same extraction logic with tracking:

```javascript
// Import the compiled TypeScript module
const { extractArticleContent } = require('../services/scraper/dist/utils');

function extractWithDebug($, url, rawHtml) {
  // Use the same extraction function with tracking enabled
  const result = extractArticleContent($, url, true);

  // Build line mapping for accurate highlighting
  const lineMapping = buildLineMapping(rawHtml, result.traces || []);

  return {
    title: result.title,
    content: result.content,
    author: result.author,
    date: result.date,
    traces: result.traces || [],
    lineMapping
  };
}

function buildLineMapping(html, traces) {
  const mapping = new Map();
  const lines = html.split('\n');

  // For each trace, find where it appears in the HTML
  traces.forEach(trace => {
    // Find lines containing the selector or the extracted value
    lines.forEach((line, index) => {
      // Check if this line contains the selector
      if (line.includes(trace.selector.split('[')[0])) {
        // Check if the value is also present (for accuracy)
        if (trace.value && line.includes(trace.value.substring(0, 50))) {
          mapping.set(index + 1, {
            field: trace.field,
            method: trace.method,
            selector: trace.selector
          });
        }
      }
    });
  });

  return mapping;
}

function formatHtmlWithAccurateHighlighting(html, traces) {
  const lines = html.split('\n');
  const lineMapping = buildLineMapping(html, traces);

  return lines.map((line, index) => {
    const lineNum = index + 1;
    const traceInfo = lineMapping.get(lineNum);

    if (traceInfo) {
      return `
        <div class="code-line highlight-extraction highlight-${traceInfo.field}"
             data-field="${traceInfo.field}"
             data-method="${traceInfo.method}">
          <span class="line-number">${lineNum}</span>
          <span class="code">${escapeHtml(line)}</span>
        </div>
      `;
    }

    return `
      <div class="code-line">
        <span class="line-number">${lineNum}</span>
        <span class="code">${escapeHtml(line)}</span>
      </div>
    `;
  }).join('\n');
}
```

### Step 4: Testing Strategy

Create simple tests to verify tracking works:

**File**: `services/scraper/src/__tests__/extraction-recorder.test.ts`

```typescript
import { ExtractionRecorder } from '../extraction-recorder';
import * as cheerio from 'cheerio';

describe('ExtractionRecorder', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta property="og:title" content="OG Title">
      </head>
      <body>
        <h1>Article Title</h1>
        <div class="author">John Doe</div>
        <article>Article content here</article>
      </body>
    </html>
  `;

  test('records text extraction', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    const title = recorder.text($, 'h1', 'title');

    expect(title).toBe('Article Title');
    expect(recorder.getTraces()).toHaveLength(1);
    expect(recorder.getTraces()[0]).toEqual({
      field: 'title',
      selector: 'h1',
      method: 'text',
      value: 'Article Title'
    });
  });

  test('records attribute extraction', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    const ogTitle = recorder.attr($, 'meta[property="og:title"]', 'content', 'title');

    expect(ogTitle).toBe('OG Title');
    expect(recorder.getTraces()[0].method).toBe('attr');
  });

  test('disabled recorder returns values without tracking', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(false);

    const title = recorder.text($, 'h1', 'title');

    expect(title).toBe('Article Title');
    expect(recorder.getTraces()).toHaveLength(0);
  });
});
```

### Step 5: End-to-End Validation

**File**: `utilities/test-extraction-consistency.js`

Simple script to verify scraper and utility produce identical results:

```javascript
const cheerio = require('cheerio');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function testConsistency() {
  const testUrls = [
    'https://www.bbc.com/news/articles/c930dlxnee4o',
    'https://www.cnn.com/2023/04/17/media/dominion-fox-news-allegations/index.html'
  ];

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);

    // Fetch HTML
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract without tracking
    const withoutTracking = extractArticleContent($, url, false);

    // Extract with tracking
    const withTracking = extractArticleContent($, url, true);

    // Verify content is identical
    if (withoutTracking.title !== withTracking.title ||
        withoutTracking.content !== withTracking.content) {
      console.error('❌ Content mismatch!');
      process.exit(1);
    }

    // Verify we got traces
    if (!withTracking.traces || withTracking.traces.length === 0) {
      console.error('❌ No traces recorded!');
      process.exit(1);
    }

    console.log(`✅ Passed - ${withTracking.traces.length} traces recorded`);
  }

  console.log('\n✅ All consistency tests passed!');
}

testConsistency().catch(console.error);
```

### Step 6: Local Testing with Playwright

**File**: `utilities/test-with-playwright.js`

```javascript
const { chromium } = require('playwright');

async function testWithPlaywright() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test 1: Verify Veritas scraper works
  console.log('Testing Veritas scraper...');
  await page.goto('http://localhost:3000');

  // Trigger a scrape with tracking
  const response = await page.request.post('http://localhost:3001/api/scrape', {
    data: {
      sources: ['BBC News'],
      articlesPerSource: 1,
      enableTracking: true
    }
  });

  const result = await response.json();
  console.log('Scraper result:', result);

  // Test 2: Verify utility works
  console.log('\nTesting extraction utility...');
  const { execSync } = require('child_process');

  execSync('node utilities/07-extraction-analyzer.js "BBC News"', {
    stdio: 'inherit'
  });

  // Test 3: Load generated HTML and verify highlighting
  const htmlFiles = require('fs').readdirSync('./utility-output')
    .filter(f => f.endsWith('.html'));

  for (const file of htmlFiles) {
    await page.goto(`file://${process.cwd()}/utility-output/${file}`);

    // Check for highlighted elements
    const highlighted = await page.$$('.highlight-extraction');
    console.log(`${file}: ${highlighted.length} highlighted elements`);

    // Verify each has data attributes
    for (const element of highlighted) {
      const field = await element.getAttribute('data-field');
      const method = await element.getAttribute('data-method');

      if (!field || !method) {
        console.error('❌ Missing data attributes!');
        process.exit(1);
      }
    }
  }

  await browser.close();
  console.log('\n✅ All Playwright tests passed!');
}

testWithPlaywright().catch(console.error);
```

## Environment Setup

### Configuration
Add single environment variable for tracking:

```bash
# .env
ENABLE_EXTRACTION_TRACKING=true  # Enable tracking in scraper
```

### Build Steps
```bash
# Compile TypeScript
cd services/scraper
npm run build

# The utility will use the compiled JavaScript
cd ../../utilities
node 07-extraction-analyzer.js "BBC News"
```

## Validation Checklist

Before considering the implementation complete:

1. ✅ Extraction recorder captures all accessed selectors
2. ✅ Scraper works normally when tracking is disabled
3. ✅ Utility produces same extraction results as scraper
4. ✅ HTML highlighting shows only actually-used elements
5. ✅ Tests pass for both enabled and disabled tracking
6. ✅ Playwright E2E tests confirm visual accuracy

## Rollback Plan

If issues arise, rollback is simple:

1. Set `ENABLE_EXTRACTION_TRACKING=false`
2. The recorder will return values without tracking
3. Utility falls back to string matching (existing code)

## Summary

This simplified approach:
- Uses a lightweight recorder instead of complex Cheerio wrapping
- Requires minimal changes to existing extraction logic
- Maintains backward compatibility when disabled
- Focuses on the core requirement: accurate tracking of what was extracted

The implementation can be completed in a single session by following these steps sequentially.