# Feature: Advanced Content Extraction System

## Overview
Enhanced content extraction system with multi-strategy extraction, paragraph preservation, structural filtering, and real-time tracking capabilities for debugging and optimization.

## User Story
As a content administrator, I want the scraper to extract clean, well-structured article content with proper paragraph separation and minimal promotional content so that users receive high-quality, readable articles.

## Technical Implementation

### Core Extraction System (`services/scraper/src/utils.ts`)

#### Multi-Strategy Extraction
The `extractArticleContent` function implements a three-tier extraction strategy:

1. **Structured Data (JSON-LD)**
   - Primary strategy for sites with structured data
   - Parses `application/ld+json` scripts
   - Extracts NewsArticle or Article types
   - Most reliable when available

2. **Selector-Based Extraction**
   - Secondary strategy using CSS selectors
   - Site-specific selectors (BBC, NYTimes, Guardian, etc.)
   - Common article selectors (article-body, story-content)
   - Iterates through selectors until sufficient content found

3. **Meta Tag Fallback**
   - Last resort extraction
   - Uses Open Graph and Twitter Card meta tags
   - Ensures some content is always extracted

#### Paragraph Structure Preservation
The `preserveContentStructure` function maintains article readability:

```typescript
function preserveContentStructure(html: string, $: CheerioAPI): string {
  // Process paragraphs with proper spacing
  // Triple newlines (\n\n\n) between paragraphs
  // Filters out non-content elements
  // Preserves semantic structure
}
```

**Key Features**:
- Triple newline separation (`\n\n\n`) between paragraphs
- Removes navigation, ads, social buttons, newsletters
- Filters video captions and figure elements
- Detects natural paragraph boundaries
- Maintains clean, readable structure

#### Structural Content Filtering

**ALL CAPS + Link Pattern Detection**:
- Identifies paragraphs that are BOTH entirely a hyperlink AND in ALL CAPS
- Safely filters promotional content without text matching
- Prevents removal of legitimate bold or linked content
- Fox News specific optimization

**Boilerplate Detection** (`isBoilerplate` function):
- Filters timestamps (e.g., "5 minutes ago")
- Removes copyright notices
- Excludes square bracket annotations
- Minimal pattern matching to avoid false positives

### Extraction Tracking System (`services/scraper/src/extraction-recorder.ts`)

#### Real-Time Extraction Tracking
The `ExtractionRecorder` class provides debugging capabilities:

```typescript
class ExtractionRecorder {
  // Records what's being extracted in real-time
  // Tracks selector matches and extraction methods
  // Provides traces for debugging extraction issues
}
```

**Features**:
- Tracks which extraction method succeeded
- Records all selector attempts
- Provides extraction traces when enabled
- Helps identify why extraction fails
- Zero overhead when disabled

#### Extraction Traces
When `enableTracking: true`:
```javascript
{
  field: "title",
  selector: "h1",
  method: "text",
  value: "Article Title"
}
```

### Content Processing Features

#### Language Detection (`detectLanguage`)
- Detects article language from content
- Supports RTL languages (Hebrew, Arabic)
- Pattern-based detection for major languages
- Defaults to English for uncertain cases

#### Content Deduplication (`generateContentHash`)
- SHA-256 hash of title + content sample
- Prevents duplicate article storage
- Normalized for better matching
- Uses first 2000 characters for efficiency

#### URL Normalization
- Converts relative URLs to absolute
- Maintains link integrity in extracted content
- Preserves source attribution

### Integration Points

#### API Integration
The extraction system integrates with the API server:

**Enable Tracking Parameter**:
```javascript
POST /api/scraper/trigger
{
  "sources": ["BBC News"],
  "maxArticles": 10,
  "enableTracking": true  // Optional debugging
}
```

#### Database Storage
Extracted content is stored with metadata:
- Original HTML preserved for re-extraction
- Extraction method recorded
- Language detected and stored
- Content hash for deduplication
- Paragraph structure maintained

### Quality Metrics

#### Extraction Success Rates
Current performance across sources:
- **BBC News**: ~95% success rate
- **CNN**: ~90% success rate
- **The Guardian**: ~95% success rate
- **Fox News**: ~85% success rate (with filtering)
- **NY Times**: Limited (403 errors)
- **WSJ**: Limited (authentication required)

#### Content Quality Indicators
- Minimum content length: 100 characters
- Paragraph count tracked
- Clean text vs HTML ratio
- Boilerplate content percentage

### Testing Utilities

#### Extraction Analysis Tools
Located in `utilities/`:

1. **07-extraction-analyzer.js**
   - Generates HTML reports for extraction debugging
   - Side-by-side comparison of source and extracted
   - Shows extraction method used
   - Identifies extraction failures

2. **08-analyze-all-sources.js**
   - Batch analysis across all sources
   - Generates reports for regression testing
   - Identifies sources with issues

3. **09-e2e-extraction-test.js**
   - End-to-end extraction validation
   - Tests content completeness
   - Validates paragraph preservation

4. **10-test-spacing.js**
   - Validates paragraph spacing
   - Ensures triple newlines preserved
   - Quick validation after changes

5. **11-validate-extraction.js**
   - Ensures filtering doesn't remove legitimate content
   - Validates safety of structural filtering
   - Cross-source validation

### Performance Characteristics

#### Processing Speed
- Average extraction time: 50-200ms per article
- Cheerio parsing: ~20ms
- Content cleaning: ~10-30ms
- Language detection: ~5ms

#### Memory Usage
- Cheerio DOM: ~500KB per article
- Extraction traces: ~2KB when enabled
- Content storage: ~5-10KB per article

### Configuration Options

#### Extraction Parameters
```typescript
extractArticleContent(
  $: CheerioAPI,          // Parsed HTML
  url: string,            // Article URL
  enableTracking: boolean // Debug mode
)
```

#### Customization Points
- Selector priority can be adjusted
- Boilerplate patterns configurable
- Minimum content length tunable
- Language detection patterns expandable

## Troubleshooting

### Common Issues

1. **Content Collapsed into Single Paragraph**
   - Check if source HTML has paragraph tags
   - Verify preserveContentStructure is working
   - Look for sites using div-based layouts

2. **Promotional Content in Articles**
   - Check if content matches ALL CAPS + link pattern
   - May need site-specific filtering
   - Balance between filtering and content preservation

3. **Missing Article Content**
   - Enable extraction tracking for debugging
   - Check extraction analyzer reports
   - May need new selectors for site

4. **Language Detection Errors**
   - Short content may default to English
   - Mixed language content challenges
   - Can be overridden if needed

### Debug Workflow

1. **Enable Tracking**:
   ```javascript
   extractArticleContent($, url, true)
   ```

2. **Generate Analysis Report**:
   ```bash
   node utilities/07-extraction-analyzer.js "Source Name"
   ```

3. **Review Extraction Traces**:
   - Check which selectors were tried
   - Identify where extraction failed
   - Add new selectors if needed

## Future Enhancements

### Potential Improvements
1. **Machine Learning Content Detection**
   - Train model on article vs non-article content
   - Better promotional content detection

2. **Site-Specific Handlers**
   - Custom extraction for problem sites
   - Handle JavaScript-rendered content

3. **Content Structure Analysis**
   - Detect article sections (intro, body, conclusion)
   - Preserve heading hierarchy

4. **Advanced Deduplication**
   - Fuzzy matching for similar content
   - Cross-language duplicate detection

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Enhanced Logging](./11-enhanced-logging.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [API System](./08-api-system.md)

## Related ADRs
- [ADR-005: Multi-Strategy Content Extraction](../decisions/ADR-005-content-extraction-strategy.md)
- [ADR-004: Scraper Logging Separation](../decisions/ADR-004-scraper-logging-separation.md)

## Implementation Files
- `services/scraper/src/utils.ts` - Core extraction logic
- `services/scraper/src/extraction-recorder.ts` - Tracking system
- `services/scraper/src/enhanced-scraper.ts` - Integration
- `utilities/07-extraction-analyzer.js` - Debug tools
- `utilities/08-11-*.js` - Testing utilities