# Logging System Enhancement - Requirements

## Functional Requirements

### FR1: Database Verification Logging
**Requirement**: After persistence completes, system must query database to verify actual saved counts and log comparison with claimed persistence results.

**Acceptance Criteria**:
- Query `scraped_content` table grouped by `source_id` for specific `job_id`
- Compare database counts with persistence log counts
- Log discrepancies at WARNING level
- Include sample article IDs from database for verification

**Query Specification**:
```sql
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
```

**Log Event Specification**:
```json
{
  "event_type": "verification",
  "event_name": "database_verification_completed",
  "job_id": "uuid",
  "verification_results": {
    "BBC News": {
      "source_id": "uuid",
      "persistence_claimed": 8,
      "database_actual": 8,
      "discrepancy": false,
      "sample_article_ids": ["id1", "id2", "id3"]
    },
    "CNN": {
      "source_id": "uuid",
      "persistence_claimed": 12,
      "database_actual": 0,
      "discrepancy": true,
      "discrepancy_amount": -12,
      "sample_article_ids": []
    }
  },
  "total_claimed": 20,
  "total_actual": 8,
  "has_discrepancies": true
}
```

### FR2: Article-Level Lifecycle Tracking
**Requirement**: System must track each article's journey through extraction, validation, and persistence phases with unique tracking IDs.

**Acceptance Criteria**:
- Generate UUID tracking ID for each article when extraction starts
- Log lifecycle events at each stage
- Include source attribution (name, ID, URL) in all logs
- Enable correlation of article across all log entries

**Lifecycle Stages**:
1. **Extraction Queued**: Article URL added to crawler queue
2. **Extraction Success**: Content extracted and validated
3. **Extraction Failed**: Extraction error occurred
4. **Persistence Attempted**: Article sent to database INSERT
5. **Persistence Success**: Database returned article ID
6. **Persistence Skipped**: Duplicate detected
7. **Persistence Failed**: INSERT error occurred

**Log Event Specification**:
```json
{
  "event_type": "article_lifecycle",
  "event_name": "extraction_success",
  "job_id": "uuid",
  "article_tracking_id": "uuid-123",
  "source_name": "CNN",
  "source_id": "uuid-cnn",
  "source_url": "https://cnn.com/article",
  "stage": "extracted",
  "timestamp_ms": 1698765432000,
  "content_length": 4521,
  "quality_score": 90
}
```

### FR3: Clear Phase Separation in Logs
**Requirement**: Log messages must explicitly distinguish between extraction phase (in-memory counts) and persistence phase (database saves).

**Acceptance Criteria**:
- Extraction completion logs clearly state "not yet saved"
- Phase marker logs delineate major phases
- No ambiguous language about "completion" or "success"
- Logs use consistent terminology

**Message Changes**:
- OLD: "Source CNN completed: 12/10 articles"
- NEW: "Source CNN extraction completed: 12 articles extracted (pending persistence)"

**Phase Markers**:
```json
{
  "event_type": "lifecycle",
  "event_name": "phase_transition",
  "phase_from": "extraction",
  "phase_to": "persistence",
  "message": "=== PERSISTENCE PHASE STARTED ==="
}
```

### FR4: Source Attribution Debug Logging
**Requirement**: System must log source attribution details before and after each database INSERT to enable debugging of source_id misattribution bugs.

**Acceptance Criteria**:
- Log source_id, source_name, and source_url before INSERT
- Log returned database article_id after successful INSERT
- Include article tracking ID for correlation
- Log INSERT statement parameters (sanitized)

**Log Event Specification**:
```json
{
  "event_type": "persistence",
  "event_name": "article_insert_attempt",
  "job_id": "uuid",
  "article_tracking_id": "uuid-123",
  "source_attribution": {
    "source_name": "CNN",
    "source_id": "uuid-cnn",
    "source_url": "https://cnn.com/article",
    "source_url_domain": "cnn.com"
  },
  "insert_parameters": {
    "source_id": "uuid-cnn",
    "source_url": "https://cnn.com/article",
    "title": "Article Title",
    "content_length": 4521
  }
}
```

### FR5: Job Reconciliation Summary
**Requirement**: System must compare logged metrics with database reality and produce reconciliation report at job completion.

**Acceptance Criteria**:
- Query database for actual saved articles per source
- Compare with claimed persistence metrics
- Calculate discrepancies (positive or negative)
- Log reconciliation table as final job summary
- Set job status to WARNING if discrepancies found

**Reconciliation Log Specification**:
```json
{
  "event_type": "lifecycle",
  "event_name": "job_reconciliation",
  "job_id": "uuid",
  "reconciliation": {
    "by_source": {
      "BBC News": {
        "logged_extracted": 8,
        "logged_saved": 8,
        "database_actual": 8,
        "match": true
      },
      "CNN": {
        "logged_extracted": 12,
        "logged_saved": 12,
        "database_actual": 0,
        "match": false,
        "discrepancy": -12,
        "discrepancy_type": "phantom_saves"
      },
      "Reuters": {
        "logged_extracted": 0,
        "logged_saved": 0,
        "database_actual": 0,
        "match": true
      }
    },
    "totals": {
      "total_logged_extracted": 20,
      "total_logged_saved": 20,
      "total_database_actual": 8,
      "overall_discrepancy": -12
    }
  },
  "has_discrepancies": true,
  "discrepancy_severity": "critical"
}
```

### FR6: UI Compatibility
**Requirement**: All logging enhancements must preserve existing UI functionality.

**Acceptance Criteria**:
- Logs continue to use `scraping_logs` table
- `log_level`, `message`, and `timestamp` columns unchanged
- New data stored in `additional_data` JSONB column
- Existing UI queries continue to work without modification
- Log messages remain human-readable in UI

## Non-Functional Requirements

### NFR1: Performance
**Requirement**: Logging enhancements must not significantly impact job execution time.

**Acceptance Criteria**:
- Database verification query completes in <200ms
- Article-level logging adds <10ms per article
- Total overhead <5% of job duration
- No blocking operations during extraction phase

### NFR2: Storage
**Requirement**: Additional logging must not cause excessive database growth.

**Acceptance Criteria**:
- Article-level logs compressed in JSONB format
- Log retention policy can be applied (30 days default)
- Individual log entries <5KB average
- Support for log archival/cleanup

### NFR3: Debuggability
**Requirement**: Logs must enable rapid root cause analysis of discrepancies.

**Acceptance Criteria**:
- Can trace article from URL to database ID in <2 minutes
- Can identify source attribution bugs from logs alone
- Can verify extraction vs persistence counts without DB access
- Correlation IDs enable following article journey

## Test Scenarios

### TS1: Normal Job with All Sources Successful
**Setup**:
- Request 10 articles from BBC, CNN, Reuters
- All RSS feeds available
- No extraction failures

**Expected Results**:
- Extraction logs show actual extracted counts
- Persistence logs show actual saved counts
- Verification query confirms persistence claims
- Reconciliation shows zero discrepancies
- All articles have correct source_id in database

### TS2: Job with Extraction Failures
**Setup**:
- Request 10 articles from BBC
- Half of extraction attempts fail

**Expected Results**:
- Article-level logs show extraction failures
- Persistence logs show only successful articles saved
- Verification confirms reduced count
- Reconciliation shows no discrepancies (logs match DB)

### TS3: Job with Duplicate Detection
**Setup**:
- Request 10 articles from CNN
- 5 articles already exist in database

**Expected Results**:
- Extraction logs show 10 articles extracted
- Persistence logs show 5 saved, 5 duplicates skipped
- Verification confirms 5 new articles in DB
- Reconciliation shows no discrepancies

### TS4: Job with Source Attribution Bug (Current Issue)
**Setup**:
- Request 10 articles from BBC and CNN
- Bug causes CNN articles to get BBC source_id

**Expected Results**:
- Article-level logs show CNN articles with CNN tracking info
- Attribution logs show CNN source_id in INSERT attempts
- Verification query reveals BBC has extra articles
- Reconciliation flags critical discrepancy
- Logs enable identifying attribution bug location

### TS5: Job with RSS Feed Failure
**Setup**:
- Request 10 articles from Reuters
- Reuters RSS returns 404

**Expected Results**:
- RSS fetch failure logged
- No extraction attempts for Reuters
- Persistence shows 0 Reuters articles
- Verification confirms 0 in database
- Reconciliation shows no discrepancy (logs match DB)

## Data Model Changes

**No schema changes required**. All enhancements use existing `scraping_logs` table:
- `additional_data` JSONB column stores new event structures
- Backward compatible with existing queries
- No migrations needed

## Dependencies

- PostgreSQL 12+ (JSONB support)
- Existing `scraping_logs` table structure
- Existing `scraped_content` and `sources` tables
- Node.js UUID library (already in use)

## Future Considerations

- Real-time log streaming for live debugging
- Log aggregation dashboard showing discrepancy trends
- Automated alerts on critical discrepancies
- Machine learning on log patterns to predict failures
