# Scraper Content Extraction Improvement Plan

## Project Overview
Improve the article content extraction mechanism in the scraper service to produce clean, well-structured text that matches human-readable formatting, with proper paragraph separation and no extraneous elements.

## Problem Statement
Current extraction produces:
- Single-block text with no paragraph breaks (all whitespace collapsed)
- Includes non-content elements (navigation, ads, social buttons)
- No structure preservation from original HTML
- Content artifacts mixed with article text

## Success Criteria
- Extracted articles have clear paragraph separation matching manual exports
- Zero navigation/advertisement artifacts in content
- Maintains article readability and flow
- All existing tests pass without modification
- No performance degradation

## Technical Execution Plan

### Phase 1: Core Structure Preservation

#### Step 1.1: Create Test Baseline
**File**: `services/scraper/src/__tests__/extraction-improvement.test.ts`

```typescript
import { extractArticleContent } from '../utils';
import { load } from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

describe('Content Extraction Improvements', () => {
  // Load test cases from manually exported articles
  const testCases = [
    {
      name: 'BBC News Article',
      htmlFile: 'bbc-sample.html',
      expectedFile: 'bbcnews_article1_1758561532431.txt',
      url: 'https://www.bbc.com/news/test'
    },
    {
      name: 'NYTimes Article',
      htmlFile: 'nytimes-sample.html',
      expectedFile: 'nytimes_article1_1758561549035.txt',
      url: 'https://www.nytimes.com/test'
    }
  ];

  test.each(testCases)('should extract $name with proper formatting', async ({ htmlFile, expectedFile, url }) => {
    // Load sample HTML
    const html = await fs.promises.readFile(
      path.join(__dirname, 'samples', htmlFile),
      'utf-8'
    );
    const expected = await fs.promises.readFile(
      path.join(__dirname, '../../../../utilities/utility-output/actual-body', expectedFile),
      'utf-8'
    );

    const $ = load(html);
    const result = extractArticleContent($, url, false);

    // Check paragraph preservation
    expect(result.content.split('\n\n').length).toBeGreaterThan(1);

    // Check no artifacts
    expect(result.content).not.toContain('Share');
    expect(result.content).not.toContain('Newsletter');

    // Content should be similar to expected (allowing for minor differences)
    const resultParagraphs = result.content.split('\n\n').map(p => p.trim());
    const expectedParagraphs = expected.split('\n\n').map(p => p.trim());

    // At least 70% of paragraphs should match
    const matches = resultParagraphs.filter(p =>
      expectedParagraphs.some(ep => ep.includes(p.substring(0, 50)))
    );
    expect(matches.length / resultParagraphs.length).toBeGreaterThan(0.7);
  });
});
```

**Action**:
1. Create test file with above structure
2. Copy sample HTML from actual news sites into `services/scraper/src/__tests__/samples/`
3. Run test to establish baseline (will fail initially)

#### Step 1.2: Implement Structure Preservation Helper
**File**: `services/scraper/src/utils.ts`

Add after line 210 (after generateContentHash function):

```typescript
/**
 * Preserves paragraph structure while cleaning content
 * Maintains readability without aggressive whitespace collapse
 */
function preserveContentStructure(html: string, $: CheerioAPI): string {
  // If already plain text, detect natural breaks
  if (!html.includes('<')) {
    return html
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')       // Max 2 newlines
      .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2')  // Detect sentence->paragraph boundaries
      .trim();
  }

  // Load HTML content for processing
  const $content = $.load(`<div id="wrapper">${html}</div>`);

  // First, remove non-content elements
  $content('#wrapper').find(`
    nav, .navigation, .nav-menu,
    .social-share, .share-buttons, .sharing,
    .newsletter-signup, .newsletter, .subscribe,
    .advertisement, .ad-container, .ads,
    .related-articles, .recommended, .more-on,
    aside:not(.article-aside), footer,
    .comments, .comment-section,
    [class*="promo"], [class*="banner"]
  `).remove();

  // Convert block elements to text with proper spacing
  const paragraphs: string[] = [];

  // Process paragraph tags first
  $content('#wrapper p').each((i, elem) => {
    const text = $content(elem).text().trim();
    if (text.length > 30 && !isBoilerplate(text)) {
      paragraphs.push(text);
    }
  });

  // If no paragraphs found, try div-based content
  if (paragraphs.length === 0) {
    $content('#wrapper > div, #wrapper article > div').each((i, elem) => {
      const text = $content(elem).text().trim();
      if (text.length > 50 && !isBoilerplate(text)) {
        // Split on natural breaks
        const parts = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
        paragraphs.push(...parts.filter(p => p.length > 30));
      }
    });
  }

  return paragraphs.join('\n\n').trim();
}

/**
 * Detects common boilerplate text patterns
 */
function isBoilerplate(text: string): boolean {
  const patterns = [
    /^(share|save|comment|subscribe|follow|newsletter)/i,
    /^(advertisement|sponsored|promoted)/i,
    /^\d+\s+(minute|hour|day)s?\s+ago$/i,
    /^(read more|related|you may like|more from)/i,
    /^(image caption|image source|getty images)/i,
    /^(cookie policy|privacy policy|terms)/i
  ];

  return patterns.some(pattern => pattern.test(text));
}
```

#### Step 1.3: Update Main Extraction Function
**File**: `services/scraper/src/utils.ts`

Modify lines 100-103 in the extractArticleContent function:

```typescript
// REPLACE existing lines 100-103
// result.content = result.content
//   .replace(/\s+/g, ' ')
//   .replace(/\n{3,}/g, '\n\n')
//   .trim();

// WITH structure-preserving cleaning
if (result.content && result.content.length > 100) {
  // Check if we got HTML or plain text
  const isHtml = result.content.includes('<') || result.content.includes('&');

  if (isHtml) {
    // Load content as HTML and extract structured text
    const $temp = $.load(result.content);
    result.content = preserveContentStructure($temp.html() || result.content, $);
  } else {
    // For plain text, just clean up spacing
    result.content = preserveContentStructure(result.content, $);
  }
}
```

### Phase 2: Enhanced Content Selection

#### Step 2.1: Improve Selector Strategy
**File**: `services/scraper/src/utils.ts`

Modify lines 50-61 (content selectors section):

```typescript
// REPLACE existing contentSelectors array
const contentSelectors = [
  // More specific selectors first
  '[itemprop="articleBody"]',
  'article [class*="body"]:not([class*="meta"])',
  'article [class*="content"]:not([class*="header"])',
  'main [class*="story-body"]',
  '.article-text',
  '.story-content',
  // BBC specific
  '[data-component="text-block"]',
  // NYTimes specific
  'section[name="articleBody"]',
  // Guardian specific
  '.article-body-viewer-selector',
  // Generic fallbacks
  'article > div > p',
  'main article p'
];

// Enhanced extraction with structure preservation
let content = '';
for (const selector of contentSelectors) {
  try {
    const $element = $(selector);

    if ($element.length > 0) {
      // Clone to avoid modifying original
      const $clone = $element.clone();

      // Remove known non-content before extraction
      $clone.find('.social-share, .newsletter, nav, aside').remove();

      // Get HTML to preserve structure
      const html = $clone.html();

      if (html && html.length > 100) {
        content = preserveContentStructure(html, $);

        // Validate we got real content
        if (content.length > 100 && content.split('\n\n').length > 0) {
          recorder.record('content', selector, 'html-structured', content.substring(0, 100));
          break;
        }
      }
    }
  } catch (e) {
    // Continue with next selector
  }
}
```

### Phase 3: Testing Implementation

#### Step 3.1: Unit Test Suite
**File**: `services/scraper/src/__tests__/utils.test.ts`

Add new test cases:

```typescript
describe('Structure Preservation', () => {
  test('preserves paragraph breaks in HTML content', () => {
    const html = `
      <div>
        <p>First paragraph with some content.</p>
        <p>Second paragraph with different content.</p>
        <p>Third paragraph here.</p>
      </div>
    `;

    const $ = load(html);
    const result = extractArticleContent($, 'http://test.com', false);

    expect(result.content.split('\n\n')).toHaveLength(3);
  });

  test('removes boilerplate content', () => {
    const html = `
      <article>
        <p>Real article content here.</p>
        <div class="social-share">Share this article</div>
        <p>More real content.</p>
        <div class="newsletter">Subscribe to newsletter</div>
      </article>
    `;

    const $ = load(html);
    const result = extractArticleContent($, 'http://test.com', false);

    expect(result.content).not.toContain('Share');
    expect(result.content).not.toContain('Subscribe');
    expect(result.content).toContain('Real article content');
    expect(result.content).toContain('More real content');
  });

  test('handles sites without paragraph tags', () => {
    const html = `
      <article>
        <div>First sentence here. Second sentence here.</div>
        <div>Another block of text. With multiple sentences.</div>
      </article>
    `;

    const $ = load(html);
    const result = extractArticleContent($, 'http://test.com', false);

    expect(result.content).toContain('First sentence');
    expect(result.content).toContain('Another block');
  });
});
```

#### Step 3.2: Integration Testing with Utilities
**Script**: Test with existing utilities

```bash
# From utilities directory
cd utilities

# Test with extraction analyzer
node 07-extraction-analyzer.js "BBC News"
node 07-extraction-analyzer.js "NY Times"
node 07-extraction-analyzer.js "The Guardian"
node 07-extraction-analyzer.js "Fox News"

# Verify extraction tracking still works
node test-extraction-tracking.js

# Test backward compatibility
node test-backward-compatibility.js
```

#### Step 3.3: End-to-End Testing with Playwright
**File**: `utilities/test-e2e-extraction.js`

```javascript
#!/usr/bin/env node

/**
 * E2E test for extraction improvements using Playwright MCP
 */

const { spawn } = require('child_process');
const path = require('path');

async function runE2ETest() {
  console.log('Starting E2E extraction test...');

  // Start services in parallel
  const scraperProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../services/scraper'),
    shell: true
  });

  const uiProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../services/ui'),
    shell: true
  });

  // Wait for services to start
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('Services started, running Playwright tests...');

  // Playwright test will be run via Claude Code MCP
  console.log(`
    Playwright test steps:
    1. Initialize browser at http://localhost:3000
    2. Navigate to /scraper
    3. Click on "Content Feed" tab
    4. Verify content displays with proper formatting
    5. Check that articles have multiple paragraphs
    6. Verify no artifacts in displayed content
  `);

  // Cleanup
  process.on('SIGINT', () => {
    scraperProcess.kill();
    uiProcess.kill();
    process.exit();
  });
}

runE2ETest();
```

### Phase 4: Validation & Rollout

#### Step 4.1: Run Complete Test Suite
```bash
# From services/scraper directory
cd services/scraper

# Build the TypeScript code
npm run build

# Run unit tests
npm test

# Run specific extraction tests
npm test extraction-improvement

# Check type safety
npm run type-check

# Lint check
npm run lint
```

#### Step 4.2: Manual Validation
1. Start scraper service: `cd services/scraper && npm run dev`
2. Use extraction analyzer utility on live sites
3. Compare output with manually exported articles
4. Verify paragraph structure is preserved
5. Confirm no content is lost

#### Step 4.3: Deployment Checklist
- [ ] All unit tests pass
- [ ] Integration tests with utilities pass
- [ ] E2E test with Playwright succeeds
- [ ] No TypeScript errors
- [ ] Lint checks pass
- [ ] Manual validation complete
- [ ] Backward compatibility confirmed
- [ ] Performance impact measured (should be minimal)

## Rollback Plan
If issues are detected:
1. Revert changes in `services/scraper/src/utils.ts`
2. Keep test improvements for future iteration
3. Document specific failure cases for investigation

## Implementation Notes

### Key Principles Followed
1. **Simplicity**: Single-purpose functions, clear logic
2. **Incremental**: Can be rolled out in phases
3. **Testable**: Comprehensive test coverage
4. **Compatible**: Maintains existing API contract
5. **Keystone Compliant**: Follows all framework guidelines

### What We're NOT Doing
- Not adding AI/ML content detection
- Not implementing complex NLP
- Not adding configuration files
- Not changing database schema
- Not modifying API responses
- Not adding external dependencies

### Expected Outcome
Clean, readable article extraction that matches human expectations while maintaining the simplicity and reliability of the existing system.