# Project: Scraper Article Limit Enforcement

**Project Number:** 5
**Start Date:** 28/10/25
**Status:** New
**Type:** Bug Fix / Enhancement

## Overview

This project implements a simple post-processing limit to prevent the scraper from saving more articles than requested. Currently, the scraper can exceed the requested `articlesPerSource` limit (e.g., requesting 10 articles but getting 12 from CNN).

## Problem Statement

**Current Behavior:**
- Scraper queues 2x target articles to account for extraction failures
- All queued requests are processed concurrently via Crawlee
- All successfully extracted articles are saved to database
- Result: Can exceed requested limit (observed: 12/10 articles from CNN)

**Root Cause:**
Optimistic queueing (2x multiplier) without a cap on final persistence.

## Solution Approach

Implement a **post-processing truncation** in `saveArticlesTransactionally()` that limits saved articles to exactly the requested amount per source.

### Why This Approach?

**Pros:**
- Simplest possible fix (minimal code change)
- No database schema changes required
- No new services or architectural complexity
- Immediately effective
- Zero risk to existing functionality
- Aligns with Keystone "simplicity first" principle

**Trade-offs:**
- Still extracts excess content (wasted HTTP requests)
- Doesn't optimize resource usage upstream
- Can be enhanced with smarter queueing in future if needed

## Success Criteria

1. ✅ **Exact Limit:** Saved articles ≤ requested `articlesPerSource`
2. ✅ **Visibility:** Clear logging when articles are capped
3. ✅ **Backward Compatible:** No impact on existing jobs
4. ✅ **Testable:** Can validate with existing test utilities

## Project Structure

```
5. Scraper Article Limit Enforcement - 28-10-25 - New/
├── README.md                          # This file
├── requirements.md                    # Detailed requirements and test scenarios
├── high-level-plan.md                # Implementation phases
└── stories/
    ├── 1. Implement Post-Processing Article Limit - New.md
    ├── 2. Enhanced Logging & Monitoring - New.md
    └── 3. Documentation - New.md
```

## Key Deliverables

1. Modified `enhanced-scraper.ts` with truncation logic
2. Enhanced logging for capping events
3. Updated UI to show efficiency metrics
4. Technical documentation

## Timeline Estimate

- Story 1: 2-3 hours (core implementation)
- Story 2: 2 hours (logging and UI)
- Story 3: 1 hour (documentation)
- **Total:** ~1 day of focused work

## Dependencies

**Project Dependencies:**
- **Project #4 (Logging System Enhancement)** - Recommended to complete first
  - Provides accurate logging foundation for testing article limits
  - Ensures verification and reconciliation catch any limit enforcement bugs
  - No hard blocker, but significantly improves debugging during implementation

**Technical Dependencies:**
- No external dependencies
- No database migrations
- No new packages required

## Future Enhancements

If resource optimization becomes important:
- Dynamic queue sizing based on historical success rates (Option 4 from analysis)
- Early termination in request handler (Option 1 from analysis)
- Smarter queue management with batching (Option 2 from analysis)

This simple solution can serve as foundation for more sophisticated approaches if needed.

## References

- Original issue investigation: See conversation logs from 28/10/25
- Code location: `services/scraper/src/enhanced-scraper.ts`
- Related: Project 3 (Scraper Refactor) - FREEZED
