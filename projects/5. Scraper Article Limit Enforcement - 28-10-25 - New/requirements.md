# Requirements: Scraper Article Limit Enforcement

## Project Goal

Ensure the scraper never saves more articles than requested per source, implementing an exact cap on persisted content.

## Functional Requirements

### FR1: Article Limit Enforcement
**Requirement:** The system MUST NOT save more than `articlesPerSource` articles for each source in a scraping job.

**Current State:**
- User requests 10 articles per source
- Scraper queues 20 candidates (2x multiplier)
- All successful extractions are saved (can be 12, 15, or more)

**Desired State:**
- User requests 10 articles per source
- Scraper queues 20 candidates (2x multiplier - unchanged)
- Exactly 10 (or fewer if insufficient content) articles are saved

**Acceptance Criteria:**
- Given a job requesting N articles per source
- When extraction succeeds for > N articles
- Then exactly N articles are persisted to database
- And excess articles are discarded after extraction

### FR2: Deterministic Article Selection
**Requirement:** When capping occurs, the system MUST select articles using a consistent, logical method.

**Selection Strategy:**
- Use **first N successfully extracted** articles (preserves temporal order)
- Alternative considered: Random selection (rejected - non-deterministic)
- Alternative considered: Quality-based (rejected - adds complexity)

**Rationale:** First N articles likely represent most recent/relevant content from RSS feed.

### FR3: Capping Visibility
**Requirement:** The system MUST log when articles are capped for transparency and monitoring.

**Logging Requirements:**
- Event type: `persistence`
- Event name: `articles_capped`
- Required data: source_name, target, extracted, capped_count
- Log level: `info` (not warning - this is expected behavior)

**Example Log:**
```json
{
  "level": "info",
  "message": "Capped 2 excess articles for CNN",
  "additionalData": {
    "event_type": "persistence",
    "event_name": "articles_capped",
    "target": 10,
    "extracted": 12,
    "capped": 2
  }
}
```

### FR4: Metrics Tracking
**Requirement:** The system MUST track efficiency metrics to quantify resource usage.

**Metrics to Track:**
- `articles_extracted`: Total successfully extracted
- `articles_saved`: Total persisted to database
- `articles_capped`: Total discarded (extracted - saved)
- `efficiency_percentage`: (saved / extracted) * 100

**Purpose:** Enable future cost/benefit analysis for upstream optimizations.

## Non-Functional Requirements

### NFR1: Performance
**Requirement:** Truncation logic MUST NOT significantly impact job performance.

**Target:** < 1ms overhead per source (negligible vs. extraction time)

**Implementation:** Simple array slice operation - O(1) for slice, O(N) for iteration (already required)

### NFR2: Backward Compatibility
**Requirement:** Implementation MUST NOT break existing scraper functionality.

**Constraints:**
- No changes to public API contracts
- No database schema modifications
- No changes to request queueing logic
- Existing jobs continue to work identically (within new limits)

### NFR3: Code Simplicity
**Requirement:** Implementation MUST follow Keystone simplicity-first principle.

**Guidelines:**
- Minimal lines of code changed
- No new dependencies
- No new services or modules
- Single function modification preferred

### NFR4: Observability
**Requirement:** Implementation MUST be debuggable and monitorable.

**Observability Features:**
- Clear logging at each decision point
- Metrics visible in scraper dashboard
- Easy to validate correct behavior via logs

## Proposed Database Changes

**None required.** This is a code-only change.

Optional future enhancement: Add `capped_count` column to `scraping_jobs` table for aggregate metrics.

## Test Scenarios

### Test Scenario 1: Normal Over-Extraction
**Setup:**
- Source: CNN (historically high success rate)
- Request: 10 articles
- Expected extractions: 12-15 articles

**Steps:**
1. Trigger scraping job for CNN with `articlesPerSource = 10`
2. Monitor extraction phase completion
3. Check database after job completes

**Expected Results:**
- Extraction logs show 12+ successful extractions
- Persistence logs show "Capped X excess articles for CNN"
- Database contains exactly 10 articles for CNN from this job
- Job status shows success

**Validation Query:**
```sql
SELECT COUNT(*) FROM scraped_content
WHERE source_id = (SELECT id FROM sources WHERE name = 'CNN')
AND job_id = 'test_job_id';
-- Expected: 10
```

### Test Scenario 2: Under-Extraction (No Capping)
**Setup:**
- Source: BBC News (some extraction failures)
- Request: 10 articles
- Expected extractions: 6-8 articles

**Steps:**
1. Trigger scraping job for BBC News with `articlesPerSource = 10`
2. Monitor extraction phase
3. Check database after completion

**Expected Results:**
- Extraction logs show < 10 successful extractions
- No capping logs (capped_count = 0)
- Database contains all extracted articles (e.g., 8 articles)
- Job status shows partial success

### Test Scenario 3: Exact Match (Edge Case)
**Setup:**
- Source: Any reliable source
- Request: 10 articles
- Expected extractions: Exactly 10 articles

**Steps:**
1. Trigger scraping job
2. Monitor extraction

**Expected Results:**
- Extraction logs show exactly 10 successful extractions
- No capping logs (capped_count = 0)
- Database contains all 10 articles
- Job status shows success

### Test Scenario 4: Multi-Source Job
**Setup:**
- Sources: BBC News, CNN, Reuters
- Request: 10 articles per source
- Expected: Mixed results (some over, some under)

**Steps:**
1. Trigger job for all three sources
2. Monitor each source separately

**Expected Results:**
- CNN: Capped (12 extracted → 10 saved)
- BBC: Not capped (8 extracted → 8 saved)
- Reuters: Failed or partial
- Total saved ≤ 30 articles
- Each source independently capped
- Job completion logs show accurate per-source metrics

### Test Scenario 5: Edge Case - Single Article Request
**Setup:**
- Request: 1 article per source
- Expected extractions: 2+ articles

**Steps:**
1. Trigger job with `articlesPerSource = 1`

**Expected Results:**
- Multiple articles extracted
- Exactly 1 article saved per source
- Capping logs show N-1 articles discarded

## Success Criteria Summary

1. ✅ **Exact Limits:** No source ever exceeds `articlesPerSource` in database
2. ✅ **Transparent Logging:** All capping events are logged with metrics
3. ✅ **Zero Regressions:** All existing test scenarios still pass
4. ✅ **Performance:** No measurable performance degradation
5. ✅ **Code Quality:** Minimal, clean code changes
6. ✅ **Testability:** Can validate with existing utilities (`03-test-scraper.js`, `06-test-logs.js`)

## Out of Scope

The following are explicitly **not** part of this project:

- ❌ Optimizing queue sizes upstream (future enhancement)
- ❌ Reducing unnecessary HTTP requests (future enhancement)
- ❌ Dynamic learning from historical success rates (future project)
- ❌ UI changes beyond basic metrics display
- ❌ Database schema modifications
- ❌ Changes to extraction logic
- ❌ Retry or failure handling improvements

These can be addressed in future projects if resource optimization becomes a priority.

## Testing Utilities to Use

- `utilities/03-test-scraper.js` - End-to-end scraper testing
- `utilities/06-test-logs.js <job_id>` - Analyze job logs for validation
- `utilities/02-db-clear.js --confirm` - Clean test data between runs

## Acceptance Checklist

- [ ] Code changes reviewed and approved
- [ ] All 5 test scenarios pass
- [ ] Logging includes capping events
- [ ] No performance regression
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Validated with production scraping job
