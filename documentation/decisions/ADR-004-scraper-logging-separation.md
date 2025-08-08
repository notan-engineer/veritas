# ADR-004: Separation of Extraction and Persistence Logging

## Status
Accepted (2025-08-08)

## Context
During investigation of scraping job results, we discovered that the logging system was misrepresenting actual outcomes. Specifically:
- Sources like CNN and WSJ were reported as "successful" with 6-7 articles scraped
- However, database queries showed 0 articles from these sources
- NY Times showed all 19 articles were saved (correctly)
- The logs conflated "extraction success" with "persistence success"

This misrepresentation made debugging difficult and gave false confidence about system performance.

## Decision
We will separate the scraping process into two distinct phases with independent logging:

1. **Extraction Phase**: Fetching and parsing content from web sources
2. **Persistence Phase**: Saving extracted content to the database

Each phase will have its own:
- Success/failure tracking per source
- Detailed metrics and logging
- Error handling that doesn't affect the other phase

## Implementation Details

### New Data Structures
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

interface SourcePersistenceResult {
  sourceName: string;
  sourceId: string;
  savedCount: number;
  duplicatesSkipped: number;
  saveFailures: number;
  articles: string[];
}
```

### Logging Events
- `source_extraction_completed`: Logged after crawler finishes
- `source_persistence_completed`: Logged after database saves
- `extraction_phase_completed`: Summary of all extraction results
- `job_completed_enhanced`: Final metrics with both phases

### Error Handling
- Crawler teardown errors are caught and logged but don't stop the job
- Each source's failures are isolated
- Clear distinction between extraction failures and save failures

## Consequences

### Positive
- **Accurate visibility**: Logs now accurately reflect what happened at each phase
- **Better debugging**: Can pinpoint exactly where failures occur
- **Improved metrics**: Dashboard shows both extraction and persistence success rates
- **Fault tolerance**: Teardown errors no longer cascade to job failure

### Negative
- **Increased complexity**: Two-phase approach adds complexity to the codebase
- **More log entries**: Doubled logging for source completion (extraction + persistence)
- **Migration effort**: Existing log analysis tools may need updates

### Neutral
- **Performance impact**: Minimal, as the phases were already sequential
- **Database schema**: No changes required, using existing JSONB fields
- **API compatibility**: New fields added to responses without breaking changes

## Alternatives Considered

1. **Single-phase with better error messages**: Would not solve the fundamental issue of conflating extraction with persistence
2. **Async persistence**: Would complicate job status tracking and error handling
3. **Database schema changes**: Would require migration and add complexity

## References
- Original issue: Partial scraping results (19/60 articles)
- Related feature: [Enhanced Logging System](../features/11-enhanced-logging.md)
- Implementation PR: (To be created)