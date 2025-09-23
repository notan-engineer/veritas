# Feature: Scraper Debugging and Monitoring

## Overview
Comprehensive debugging and monitoring tools for the scraper service, providing real-time insight into extraction performance, job status, and source-specific issues.

## User Story
As a developer, I want detailed debugging tools to quickly identify and resolve scraper extraction issues so that I can maintain high-quality content collection and troubleshoot problems efficiently.

## Technical Implementation

### Core Debugging Infrastructure

#### Job Monitoring (`utilities/check-recent-jobs.js`)
Real-time monitoring of scraping job performance and status:

**Features:**
- Monitor last 5 scraping jobs with detailed metrics
- Analyze extraction success/failure patterns for last 3 jobs
- Track content saved in the last hour
- Display error messages and job timeline
- Performance metrics and duration tracking

**Usage:**
```bash
node check-recent-jobs.js
```

**Output includes:**
- Job status (success, failed, running)
- Articles scraped vs requested
- Error counts and messages
- Extraction statistics (success/failed/total)
- Content persistence metrics

#### Source-Specific Testing (`utilities/test-fox-extraction.js`)
Dedicated testing utility for problematic sources:

**Features:**
- Tests multiple Fox News selector strategies
- Validates `.article-body` prioritization
- Reports extraction success and content length
- Compares selector effectiveness
- Identifies extraction bottlenecks

**Selectors tested:**
1. `.article-wrap .article-body`
2. `.article-body:has(p)`
3. `.article-body` (prioritized)
4. `.article-content`
5. `article`
6. `[class*="article-body"]`

### Enhanced Error Handling

#### Crawler Teardown Protection (`services/scraper/src/enhanced-scraper.ts`)
Robust cleanup handling to prevent scraper crashes:

**Problem addressed:**
- "Cannot read properties of undefined (reading teardown)" errors
- Scraper failures when no articles are queued
- Variable scope issues in error conditions

**Solution implementation:**
```typescript
let crawler: any = null; // Declare at method scope

try {
  crawler = new CheerioCrawler({...});
  await crawler.run(queue);
} finally {
  // Protected teardown
  if (crawler) {
    try {
      await crawler.teardown();
    } catch (teardownError) {
      // Log but don't re-throw to allow job continuation
    }
  }
}
```

**Benefits:**
- Prevents scraper crashes from cleanup failures
- Maintains job execution even with teardown errors
- Proper error logging for troubleshooting
- Consistent behavior across all sources

### Debug Logging Enhancements

#### Structured Debug Information
Enhanced logging throughout the scraper pipeline:

**Extraction Phase Logging:**
- Selector attempt tracking
- Content length validation
- Language detection results
- Extraction method used (structured data, selector, meta)

**Job Management Logging:**
- RSS fetch retry attempts with exponential backoff
- Article processing timeline
- Error categorization and context
- Performance metrics per source

**Storage Phase Logging:**
- Database persistence results
- Duplicate detection outcomes
- Content hash generation
- Final article counts

### Integration with Existing Tools

#### Works with Extraction Analysis System
The debugging tools integrate with the existing extraction analysis infrastructure:

- **07-extraction-analyzer.js**: Generate HTML reports for visual debugging
- **08-analyze-all-sources.js**: Batch analysis across all sources
- **09-e2e-extraction-test.js**: End-to-end validation
- **check-recent-jobs.js**: Real-time job monitoring (new)
- **test-fox-extraction.js**: Source-specific testing (new)

#### API Integration
Debug features accessible through scraper API:

```javascript
// Enable extraction tracking for debugging
POST /api/scraper/trigger
{
  "sources": ["Fox News"],
  "maxArticles": 5,
  "enableTracking": true  // Enables detailed debug traces
}
```

### Performance Monitoring

#### Real-Time Metrics
The debugging system provides performance insights:

**Extraction Metrics:**
- Average extraction time per article
- Success rates by source
- Content quality indicators
- Error distribution patterns

**Job Performance:**
- Total job duration
- Articles per minute rate
- Memory usage patterns
- Network request efficiency

### Troubleshooting Workflows

#### Common Debugging Scenarios

**1. Scraper Returning 0 Articles:**
```bash
# Check recent job status
node check-recent-jobs.js

# Test specific source
node test-fox-extraction.js

# Generate detailed extraction report
node 07-extraction-analyzer.js "Source Name"
```

**2. High Error Rates:**
```bash
# Monitor job patterns
node check-recent-jobs.js

# Check specific job logs
node 06-test-logs.js <job-id> --level=error

# Validate extraction quality
node 09-e2e-extraction-test.js
```

**3. Source-Specific Issues:**
```bash
# Test Fox News specifically
node test-fox-extraction.js

# Batch analyze all sources
node 08-analyze-all-sources.js

# Compare extraction strategies
node 07-extraction-analyzer.js "Problematic Source"
```

### Configuration and Customization

#### Debug Level Configuration
Different levels of debugging detail:

- **Basic**: Standard job completion logs
- **Enhanced**: Extraction attempt tracking
- **Detailed**: Full selector testing and content analysis
- **Trace**: Complete extraction traces with timing

#### Source-Specific Debugging
Configurable debugging for individual sources:

```typescript
// Enable debug logging for specific sources
const debugSources = ['Fox News', 'BBC News'];
const enableDebug = debugSources.includes(sourceName);
```

## Testing and Validation

### Automated Testing
The debugging system includes automated validation:

- **Unit tests**: Individual function validation
- **Integration tests**: End-to-end scraper testing
- **Performance tests**: Extraction speed benchmarks
- **Regression tests**: Ensure fixes don't break existing functionality

### Manual Testing Procedures
Step-by-step debugging workflows:

1. **Initial Assessment**: Run `check-recent-jobs.js`
2. **Source Testing**: Use `test-fox-extraction.js` for specific sources
3. **Deep Analysis**: Generate extraction reports with HTML output
4. **Validation**: Confirm fixes with end-to-end testing

## Future Enhancements

### Potential Improvements
1. **Real-time Dashboard**: Web interface for monitoring scraper health
2. **Automated Alerting**: Notifications for extraction failures
3. **Performance Baselines**: Track and compare extraction rates over time
4. **Source Health Scoring**: Automatic scoring of source extraction quality

## Related Features
- [Content Extraction System](./12-content-extraction.md)
- [Enhanced Logging](./11-enhanced-logging.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Scraping System](./03-content-scraping.md)

## Related ADRs
- [ADR-008: Fox News Selector Prioritization Strategy](../decisions/ADR-008-fox-news-selector-prioritization.md)
- [ADR-005: Multi-Strategy Content Extraction](../decisions/ADR-005-content-extraction-strategy.md)
- [ADR-004: Crawlee Storage Strategy for Production](../decisions/ADR-004-crawlee-storage-strategy.md)

## Implementation Files
- `utilities/check-recent-jobs.js` - Job monitoring utility
- `utilities/test-fox-extraction.js` - Fox News testing utility
- `services/scraper/src/enhanced-scraper.ts` - Core scraper with error handling
- `services/scraper/src/enhanced-logger.ts` - Debug logging system
- `utilities/07-extraction-analyzer.js` - Visual extraction debugging
- `utilities/06-test-logs.js` - Job log analysis