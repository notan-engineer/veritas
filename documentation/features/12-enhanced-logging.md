# Feature: Enhanced Logging System

## Overview
Two-phase logging system that accurately tracks content scraping through extraction and persistence phases, providing clear visibility into what was actually saved versus what was attempted.

## User Story
As a developer, I want accurate logging that distinguishes between extraction success and database persistence success so that I can effectively debug scraping issues.

## Technical Implementation

### Architecture
- **Location**: `services/scraper/src/enhanced-logger.ts`
- **Integration**: Used throughout `enhanced-scraper.ts`
- **Storage**: JSONB structured logs in `scraping_logs` table
- **Phases**: Extraction (web scraping) and Persistence (database saves)

### Key Components

1. **EnhancedLogger Class**
   - Phase-specific logging methods
   - Correlation ID tracking
   - Performance monitoring
   - Quality scoring
   - Resource tracking

2. **Two-Phase Processing**
   - **Extraction Phase**: Web content fetching and parsing
   - **Persistence Phase**: Database storage and deduplication
   - Independent success/failure tracking per phase

3. **Source-Level Tracking**
   ```typescript
   interface SourceResult {
     sourceName: string;
     sourceId: string;
     extractedArticles: any[];
     extractionMetrics: {
       rssItemsFound: number;
       candidatesProcessed: number;
       extractionAttempts: number;
       extractionSuccesses: number;
       extractionDuration: number;
     };
   }
   ```

4. **Persistence Tracking**
   ```typescript
   interface SourcePersistenceResult {
     sourceName: string;
     sourceId: string;
     savedCount: number;
     duplicatesSkipped: number;
     saveFailures: number;
     articles: string[];
   }
   ```

### Log Event Types

1. **Lifecycle Events**
   - `job_started`: Job initiation with parameters
   - `extraction_phase_completed`: All extraction attempts finished
   - `job_completed_enhanced`: Final metrics with both phases

2. **Extraction Events**
   - `source_extraction_completed`: Source finished extraction
   - `source_extraction_failed`: Extraction failure with error
   - `extraction_completed`: Individual article extracted

3. **Persistence Events**
   - `source_persistence_completed`: Database saves completed
   - `persistence_failure`: Individual save failure

4. **Error Events**
   - `teardown_failure`: Non-fatal crawler cleanup error
   - `http_error`: Network request failure
   - `extraction_failed`: Content parsing failure

### Enhanced Metrics

The system now provides:
- **Extraction Success Rate**: % of sources that extracted content
- **Persistence Success Rate**: % of extracted content that was saved
- **Per-Source Breakdown**: Individual source performance
- **Duplicate Detection**: Count of content already in database
- **Error Categorization**: Extraction vs. persistence failures

### API Integration

Dashboard metrics endpoint returns:
```json
{
  "articlesScraped": 100,      // Extracted from web
  "articlesSaved": 85,         // Actually persisted
  "extractionSuccessRate": 90, // % of sources successful
  "persistenceSuccessRate": 85 // % of extracted that saved
}
```

### Common Log Queries

1. **Check Extraction vs. Persistence**
   ```sql
   SELECT 
     additional_data->>'source_name' as source,
     COUNT(CASE WHEN additional_data->>'event_name' = 'extraction_completed' THEN 1 END) as extracted,
     COUNT(CASE WHEN additional_data->>'event_name' = 'source_persistence_completed' THEN 1 END) as persisted
   FROM scraping_logs
   WHERE job_id = ?
   GROUP BY source;
   ```

2. **Find Teardown Errors**
   ```sql
   SELECT * FROM scraping_logs
   WHERE additional_data->>'error_type' = 'teardown_failure'
   ORDER BY created_at DESC;
   ```

## Benefits

1. **Accurate Reporting**: No more false "success" for failed saves
2. **Better Debugging**: Pinpoint exact failure phase
3. **Performance Insights**: Separate metrics for each phase
4. **Error Isolation**: Teardown errors don't cascade

## Usage

The enhanced logging is automatic. To view:
1. Check job logs in scraper dashboard
2. Look for phase-specific events
3. Compare extraction vs. persistence counts
4. Use correlation IDs to track request lifecycle

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [API System](./08-api-system.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)