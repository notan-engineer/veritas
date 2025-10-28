# High-Level Implementation Plan

## Overview

This project enhances the logging system through six incremental phases, each building on the previous to create a comprehensive, accurate logging infrastructure.

## Phase 1: Database Verification Logging

**Goal**: Add post-persistence verification to confirm what was actually saved to database.

**Files Modified**:
- `services/scraper/src/enhanced-scraper.ts`
- `services/scraper/src/enhanced-logger.ts`
- `services/scraper/src/types.ts`

**Implementation Steps**:

1. **Add verification query method to enhanced-scraper.ts**:
```typescript
private async verifyPersistenceResults(
  jobId: string,
  persistenceResults: Map<string, SourcePersistenceResult>
): Promise<Map<string, number>> {
  const { pool } = await import('./database');

  const result = await pool.query(`
    SELECT
      s.name as source_name,
      s.id as source_id,
      COUNT(sc.id) as actual_count,
      array_agg(sc.id ORDER BY sc.created_at LIMIT 5) as sample_ids
    FROM scraped_content sc
    JOIN sources s ON sc.source_id = s.id
    WHERE sc.job_id = $1
    GROUP BY s.name, s.id
    ORDER BY s.name
  `, [jobId]);

  return new Map(result.rows.map(row => [row.source_name, row.actual_count]));
}
```

2. **Add logger method for verification results**:
```typescript
async logDatabaseVerification(
  jobId: string,
  persistenceResults: Map<string, SourcePersistenceResult>,
  databaseCounts: Map<string, number>
): Promise<void> {
  const verificationResults: Record<string, any> = {};
  let hasDiscrepancies = false;
  let totalClaimed = 0;
  let totalActual = 0;

  for (const [sourceName, persistence] of persistenceResults) {
    const claimed = persistence.savedCount;
    const actual = databaseCounts.get(sourceName) || 0;
    const discrepancy = claimed !== actual;

    if (discrepancy) hasDiscrepancies = true;
    totalClaimed += claimed;
    totalActual += actual;

    verificationResults[sourceName] = {
      source_id: persistence.sourceId,
      persistence_claimed: claimed,
      database_actual: actual,
      discrepancy,
      discrepancy_amount: actual - claimed
    };
  }

  await logJobActivity({
    jobId,
    level: hasDiscrepancies ? 'warning' : 'info',
    message: `Database verification: ${totalActual}/${totalClaimed} articles confirmed in database`,
    additionalData: {
      event_type: 'verification',
      event_name: 'database_verification_completed',
      verification_results: verificationResults,
      total_claimed: totalClaimed,
      total_actual: totalActual,
      has_discrepancies: hasDiscrepancies
    }
  });
}
```

3. **Integrate into scrapeJob method**:
```typescript
// After saveArticlesTransactionally completes
const databaseCounts = await this.verifyPersistenceResults(jobId, persistenceResults);
await this.logger.logDatabaseVerification(jobId, persistenceResults, databaseCounts);
```

**Testing**:
- Run test scrape with multiple sources
- Verify verification logs appear with correct counts
- Manually confirm database counts match logged counts

---

## Phase 2: Article-Level Lifecycle Tracking

**Goal**: Track each article's journey with unique ID from extraction to persistence.

**Files Modified**:
- `services/scraper/src/enhanced-scraper.ts`
- `services/scraper/src/enhanced-logger.ts`
- `services/scraper/src/types.ts`

**Implementation Steps**:

1. **Add tracking ID generation to article requests**:
```typescript
// In scrapeSourceEnhanced, when creating articleRequests
const articleRequests = candidateItems.slice(0, targetCandidates).map(item => {
  const articleTrackingId = crypto.randomUUID();
  return {
    url: item.link!,
    userData: {
      jobId,
      sourceId: source.id,
      sourceName: source.name,
      articleTitle: item.title,
      articleTrackingId,
      correlationId: this.logger.createCorrelationId()
    }
  };
});
```

2. **Add lifecycle logging methods to enhanced-logger.ts**:
```typescript
async logArticleLifecycle(
  jobId: string,
  sourceId: string,
  articleTrackingId: string,
  stage: 'queued' | 'extracted' | 'validated' | 'persisted' | 'skipped' | 'failed',
  details: {
    sourceName: string;
    sourceUrl: string;
    error?: string;
    databaseArticleId?: string;
    reason?: string;
  }
): Promise<void> {
  await logJobActivity({
    jobId,
    sourceId,
    level: stage === 'failed' ? 'error' : 'info',
    message: `Article ${stage}: ${details.sourceUrl}`,
    additionalData: {
      event_type: 'article_lifecycle',
      event_name: `article_${stage}`,
      article_tracking_id: articleTrackingId,
      source_name: details.sourceName,
      source_id: sourceId,
      source_url: details.sourceUrl,
      stage,
      ...details
    }
  });
}
```

3. **Integrate lifecycle logging in request handler**:
```typescript
// After successful extraction
await this.logger.logArticleLifecycle(
  jobId, sourceId, articleTrackingId, 'extracted',
  { sourceName, sourceUrl: request.url }
);
```

4. **Integrate lifecycle logging in persistence**:
```typescript
// After successful INSERT
await this.logger.logArticleLifecycle(
  jobId, sourceId, articleTrackingId, 'persisted',
  {
    sourceName,
    sourceUrl: article.sourceUrl,
    databaseArticleId: result.rows[0].id
  }
);

// When duplicate skipped
await this.logger.logArticleLifecycle(
  jobId, sourceId, articleTrackingId, 'skipped',
  {
    sourceName,
    sourceUrl: article.sourceUrl,
    reason: 'duplicate_detected'
  }
);
```

**Testing**:
- Verify tracking IDs appear in all related logs
- Test can trace article from queue to database using tracking ID
- Verify all lifecycle stages logged correctly

---

## Phase 3: Clarify Extraction vs Persistence Logs

**Goal**: Eliminate ambiguity in log messages about which phase is being reported.

**Files Modified**:
- `services/scraper/src/enhanced-logger.ts`

**Implementation Steps**:

1. **Update logSourceExtractionCompleted message**:
```typescript
async logSourceExtractionCompleted(
  jobId: string,
  sourceId: string,
  sourceName: string,
  articlesExtracted: number,
  targetArticles: number,
  durationMs: number
): Promise<void> {
  const successRate = targetArticles > 0 ? articlesExtracted / targetArticles : 0;

  await logJobActivity({
    jobId,
    sourceId,
    level: 'info',
    message: `Source ${sourceName} extraction completed: ${articlesExtracted} articles extracted (pending persistence) - target was ${targetArticles}`,
    additionalData: {
      event_type: 'source',
      event_name: 'source_extraction_completed',
      phase: 'extraction',
      source_name: sourceName,
      articles_extracted: articlesExtracted,
      target_articles: targetArticles,
      extraction_rate: successRate,
      duration_ms: durationMs,
      note: 'These articles have not yet been persisted to database'
    }
  });
}
```

2. **Add phase transition markers**:
```typescript
async logPhaseTransition(
  jobId: string,
  phaseFrom: string,
  phaseTo: string
): Promise<void> {
  await logJobActivity({
    jobId,
    level: 'info',
    message: `=== ${phaseTo.toUpperCase()} PHASE STARTED ===`,
    additionalData: {
      event_type: 'lifecycle',
      event_name: 'phase_transition',
      phase_from: phaseFrom,
      phase_to: phaseTo
    }
  });
}
```

3. **Insert phase transitions in scrapeJob**:
```typescript
await this.logger.logPhaseTransition(jobId, 'initialization', 'extraction');
// ... extraction happens ...
await this.logger.logPhaseTransition(jobId, 'extraction', 'persistence');
// ... persistence happens ...
await this.logger.logPhaseTransition(jobId, 'persistence', 'verification');
// ... verification happens ...
await this.logger.logPhaseTransition(jobId, 'verification', 'completion');
```

**Testing**:
- Verify log messages clearly state extraction vs persistence
- Check phase markers appear in correct sequence
- Confirm no ambiguous "completed" messages without context

---

## Phase 4: Source Attribution Debug Logging

**Goal**: Log source attribution before and after INSERT to debug misattribution bugs.

**Files Modified**:
- `services/scraper/src/enhanced-scraper.ts`
- `services/scraper/src/enhanced-logger.ts`

**Implementation Steps**:

1. **Add attribution logging method**:
```typescript
async logInsertAttribution(
  jobId: string,
  articleTrackingId: string,
  attribution: {
    sourceName: string;
    sourceId: string;
    sourceUrl: string;
    sourceUrlDomain: string;
  },
  insertSuccess: boolean,
  databaseArticleId?: string,
  error?: string
): Promise<void> {
  await logJobActivity({
    jobId,
    level: insertSuccess ? 'info' : 'error',
    message: insertSuccess
      ? `Article inserted with source attribution: ${attribution.sourceName}`
      : `Article INSERT failed: ${error}`,
    additionalData: {
      event_type: 'persistence',
      event_name: insertSuccess ? 'article_insert_success' : 'article_insert_failure',
      article_tracking_id: articleTrackingId,
      source_attribution: attribution,
      insert_success: insertSuccess,
      database_article_id: databaseArticleId,
      error
    }
  });
}
```

2. **Integrate in saveArticlesTransactionally before INSERT**:
```typescript
const sourceUrlDomain = new URL(article.sourceUrl).hostname;

// Log attribution before INSERT
const attribution = {
  sourceName: sourceResult.sourceName,
  sourceId: article.sourceId,
  sourceUrl: article.sourceUrl,
  sourceUrlDomain
};

try {
  const result = await client.query(/* INSERT query */);

  // Log success with database ID
  await this.logger.logInsertAttribution(
    jobId,
    article.articleTrackingId,
    attribution,
    true,
    result.rows[0].id
  );
} catch (error) {
  await this.logger.logInsertAttribution(
    jobId,
    article.articleTrackingId,
    attribution,
    false,
    undefined,
    error.message
  );
}
```

**Testing**:
- Verify source attribution logged before each INSERT
- Check database article ID appears in success logs
- Confirm can identify source_id used in INSERT from logs

---

## Phase 5: Add Reconciliation Summary

**Goal**: Compare logged metrics with database reality at job completion.

**Files Modified**:
- `services/scraper/src/enhanced-scraper.ts`
- `services/scraper/src/enhanced-logger.ts`

**Implementation Steps**:

1. **Add reconciliation method**:
```typescript
private async reconcileJobMetrics(
  jobId: string,
  successfulExtractions: SourceResult[],
  persistenceResults: Map<string, SourcePersistenceResult>
): Promise<void> {
  const { pool } = await import('./database');

  // Query actual database counts
  const dbResult = await pool.query(`
    SELECT s.name, COUNT(sc.id) as count
    FROM scraped_content sc
    JOIN sources s ON sc.source_id = s.id
    WHERE sc.job_id = $1
    GROUP BY s.name
  `, [jobId]);

  const databaseCounts = new Map(dbResult.rows.map(r => [r.name, parseInt(r.count)]));

  // Build reconciliation report
  const reconciliation: Record<string, any> = {};
  let hasDiscrepancies = false;

  for (const extraction of successfulExtractions) {
    const persistence = persistenceResults.get(extraction.sourceName);
    const dbActual = databaseCounts.get(extraction.sourceName) || 0;

    const match = (persistence?.savedCount || 0) === dbActual;
    if (!match) hasDiscrepancies = true;

    reconciliation[extraction.sourceName] = {
      logged_extracted: extraction.extractedArticles.length,
      logged_saved: persistence?.savedCount || 0,
      database_actual: dbActual,
      match,
      discrepancy: match ? 0 : dbActual - (persistence?.savedCount || 0)
    };
  }

  await this.logger.logJobReconciliation(jobId, reconciliation, hasDiscrepancies);
}
```

2. **Add logger method**:
```typescript
async logJobReconciliation(
  jobId: string,
  reconciliation: Record<string, any>,
  hasDiscrepancies: boolean
): Promise<void> {
  const totalLogged = Object.values(reconciliation).reduce((sum: number, s: any) => sum + s.logged_saved, 0);
  const totalActual = Object.values(reconciliation).reduce((sum: number, s: any) => sum + s.database_actual, 0);

  await logJobActivity({
    jobId,
    level: hasDiscrepancies ? 'warning' : 'info',
    message: hasDiscrepancies
      ? `Job reconciliation FAILED: Discrepancies found between logs and database`
      : `Job reconciliation passed: All counts match database`,
    additionalData: {
      event_type: 'lifecycle',
      event_name: 'job_reconciliation',
      reconciliation: {
        by_source: reconciliation,
        totals: {
          total_logged_saved: totalLogged,
          total_database_actual: totalActual,
          overall_discrepancy: totalActual - totalLogged
        }
      },
      has_discrepancies: hasDiscrepancies,
      discrepancy_severity: hasDiscrepancies ? 'critical' : 'none'
    }
  });
}
```

3. **Integrate in scrapeJob**:
```typescript
// After verification, before final logging
await this.reconcileJobMetrics(jobId, successfulExtractions, persistenceResults);
```

**Testing**:
- Create scenario with known discrepancy (mock bug)
- Verify reconciliation detects and logs discrepancy
- Verify reconciliation passes when logs match database

---

## Phase 6: Preserve UI Compatibility

**Goal**: Ensure all changes maintain backward compatibility with UI.

**Implementation Steps**:

1. **Verify log table structure unchanged**:
- Check `scraping_logs` table columns not modified
- Confirm `message` field remains human-readable
- Ensure `additional_data` JSONB stores new fields

2. **Test UI queries**:
```sql
-- Existing UI query should still work
SELECT
  sl.id,
  sl.log_level,
  sl.message,
  sl.timestamp,
  sl.additional_data,
  s.name as source_name
FROM scraping_logs sl
LEFT JOIN sources s ON sl.source_id = s.id
WHERE sl.job_id = $1
ORDER BY sl.timestamp ASC
```

3. **Manual UI testing**:
- Load scraper dashboard
- View job logs in UI
- Verify new log messages display correctly
- Check additional_data JSON renders properly
- Confirm filtering and sorting still work

**Testing**:
- Run UI locally with enhanced logging
- Trigger test scraping job
- View logs in dashboard
- Verify no UI errors or display issues

---

## Integration Strategy

### Order of Implementation
1. Phase 1 (DB Verification) - Foundation for truth
2. Phase 3 (Phase Clarification) - Improve existing logs
3. Phase 2 (Article Tracking) - Detailed audit trail
4. Phase 4 (Attribution Logging) - Debug specific issue
5. Phase 5 (Reconciliation) - Final validation
6. Phase 6 (UI Compatibility) - Verification only

### Testing Approach
- Unit tests for new logger methods
- Integration tests for verification queries
- End-to-end test with known discrepancy scenario
- Manual UI testing after each phase
- Performance testing for query overhead

### Rollout Plan
1. Deploy to staging with verbose logging enabled
2. Run multiple test jobs with varying scenarios
3. Analyze logs for accuracy and completeness
4. Monitor performance impact
5. Deploy to production with monitoring
6. Document logging patterns for future developers

## Success Metrics

- ✅ 100% of database saves are verified and logged
- ✅ Zero untrackable articles (all have lifecycle logs)
- ✅ Reconciliation catches all discrepancies
- ✅ No UI breaking changes
- ✅ <5% performance overhead
- ✅ Logs enable root cause analysis within 2 minutes

## Rollback Plan

If critical issues found:
1. All changes are in logging layer only
2. Can disable enhanced logging via feature flag
3. Revert to previous version of enhanced-scraper.ts
4. No database schema changes to rollback
5. UI continues working with basic logs
