# High-Level Implementation Plan

## Project Phases

This project follows a three-phase approach, with each phase corresponding to an independently deployable user story.

---

## Phase 1: Core Implementation (Story 1)
**Duration:** 2-3 hours
**Status:** New
**Story:** Implement Post-Processing Article Limit

### Objectives
- Add truncation logic to `saveArticlesTransactionally()`
- Ensure exact article limits per source
- Add basic logging for capping events
- Maintain backward compatibility

### Key Deliverables
1. Modified `services/scraper/src/enhanced-scraper.ts`
   - Update `saveArticlesTransactionally()` method
   - Add array truncation: `slice(0, articlesPerSource)`
   - Log capping events with metrics

2. Type updates in `services/scraper/src/types.ts`
   - Add `cappedCount?: number` to `SourcePersistenceResult`

3. Basic testing
   - Validate with `utilities/03-test-scraper.js`
   - Verify logs with `utilities/06-test-logs.js`

### Success Criteria
- ✅ Saved articles ≤ requested limit
- ✅ Capping events logged
- ✅ All existing tests pass
- ✅ No performance regression

### Dependencies
- None

### Risks
- Low risk: Minimal code change
- Mitigation: Thorough testing before commit

---

## Phase 2: Enhanced Visibility (Story 2)
**Duration:** 2 hours
**Status:** New
**Story:** Enhanced Logging & Monitoring

### Objectives
- Improve logging clarity and completeness
- Add efficiency metrics to job completion logs
- Update scraper dashboard UI to show capping metrics
- Provide actionable insights

### Key Deliverables
1. Enhanced logging in `services/scraper/src/enhanced-logger.ts`
   - Add `logArticlesCapped()` method
   - Include efficiency calculations

2. UI updates in `services/ui/app/scraper/`
   - Display capped articles in job details
   - Show efficiency percentage badge
   - Add visual indicator when capping occurs

3. Metrics calculation
   - Track waste percentage: `(capped / extracted) * 100`
   - Aggregate across all sources in job
   - Display in job completion summary

### Success Criteria
- ✅ Job logs clearly show capping details
- ✅ UI displays efficiency metrics
- ✅ Visual indicators for capped jobs
- ✅ Metrics help identify resource waste

### Dependencies
- Phase 1 must be complete (provides `cappedCount` data)

### Risks
- UI changes might need shadcn/ui component updates
- Mitigation: Use existing components where possible

---

## Phase 3: Documentation (Story 3)
**Duration:** 1 hour
**Status:** New
**Story:** Documentation

### Objectives
- Document technical implementation
- Capture architectural decisions
- Provide user guide for metrics interpretation
- Enable future developers to understand the solution

### Key Deliverables
1. Technical documentation
   - `documentation/features/article-limit-enforcement.md`
   - Explain implementation approach
   - Document truncation logic
   - Include code examples

2. Architecture Decision Record
   - `documentation/decisions/004-post-processing-article-limit.md`
   - Document why this approach was chosen
   - List alternatives considered
   - Explain trade-offs

3. User guide
   - How to interpret efficiency metrics
   - When capping is expected vs. problematic
   - Guidance for future optimization

### Success Criteria
- ✅ Technical docs complete and accurate
- ✅ ADR captures decision rationale
- ✅ Future developers can understand system
- ✅ All documentation follows Keystone standards

### Dependencies
- Phases 1 and 2 must be complete

### Risks
- Low risk: Documentation only
- Mitigation: Review against actual implementation

---

## Deployment Strategy

### Incremental Deployment
Each phase can be deployed independently:

**Phase 1 Deployment:**
- Deploy to production after testing
- Monitor first few scraping jobs closely
- Validate exact article counts
- Rollback plan: Revert single commit

**Phase 2 Deployment:**
- Deploy UI and logging updates
- No risk to core functionality
- Enhances observability

**Phase 3 Deployment:**
- Merge documentation to main
- No runtime impact

### Testing Approach

**Local Testing (Phases 1-2):**
```bash
# Clean database
node utilities/02-db-clear.js --confirm

# Run scraper test
node utilities/03-test-scraper.js

# Analyze logs
node utilities/06-test-logs.js <job_id>

# Verify article counts
psql -d veritas_local -c "
  SELECT s.name, COUNT(*)
  FROM scraped_content sc
  JOIN sources s ON sc.source_id = s.id
  WHERE sc.job_id = '<job_id>'
  GROUP BY s.name;
"
```

**Production Validation:**
1. Trigger scraping job via UI
2. Monitor logs in real-time
3. Check job completion metrics
4. Verify database counts match request

### Rollback Plan

**If Issues Detected:**
1. Identify problematic commit
2. Create revert PR
3. Deploy revert to production
4. Investigate root cause offline
5. Fix and redeploy

**Rollback Triggers:**
- Saved articles > requested limit (failure of primary objective)
- Database errors or transaction failures
- Significant performance degradation (> 10% slower)
- Logging errors causing job failures

---

## Success Metrics

### Quantitative Metrics
- **Article Limit Compliance:** 100% of jobs respect `articlesPerSource` limit
- **Zero Regressions:** All existing tests continue to pass
- **Performance:** < 1ms overhead per source
- **Logging Coverage:** 100% of capping events logged

### Qualitative Metrics
- **Code Simplicity:** Minimal lines changed (target: < 50 lines total)
- **Maintainability:** Clear, self-documenting code
- **Observability:** Easy to debug and monitor
- **Documentation Quality:** Complete and accurate

---

## Timeline

| Phase | Story | Duration | Dependencies |
|-------|-------|----------|--------------|
| 1 | Implement Post-Processing Limit | 2-3 hours | None |
| 2 | Enhanced Logging & Monitoring | 2 hours | Phase 1 |
| 3 | Documentation | 1 hour | Phases 1-2 |
| **Total** | | **~1 day** | |

**Start Date:** 28/10/25
**Target Completion:** 29/10/25

---

## Future Enhancements

This project solves the immediate problem with minimal complexity. Future projects could add:

### Option 1: Early Termination (Recommended Next Step)
- Add check in request handler to skip extraction when target reached
- Reduces wasted HTTP requests
- Estimated effort: 1 day

### Option 2: Dynamic Queue Sizing
- Track historical success rates per source
- Calculate optimal queue sizes
- Estimated effort: 1 week

### Option 3: Smarter Queue Management
- Batch request processing
- Adaptive concurrency
- Estimated effort: 1 week

**Decision Point:** Monitor efficiency metrics from Phase 2. If waste percentage consistently > 30%, consider upstream optimizations.

---

## Risk Assessment

### Low Risk Items ✅
- Core implementation (simple array operation)
- Logging additions
- Documentation updates

### Medium Risk Items ⚠️
- UI changes (may need component adjustments)
- Type system updates (TypeScript strict mode)

### Mitigation Strategies
- Thorough local testing before deployment
- Feature can be easily reverted if needed
- No database migrations = low risk deployment
- Backward compatible = safe for production

### Success Probability
**High (95%+)** - Simple, well-defined change with clear test criteria
