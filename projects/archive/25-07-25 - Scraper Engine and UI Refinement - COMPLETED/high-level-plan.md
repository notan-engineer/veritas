# High-Level Plan: Scraper Engine and UI Refinement

## Overview

This project fixes critical scraper reliability issues and modernizes the management UI through four implementation phases. Each phase is designed to be independently deployable while building toward the complete solution.

## Pre-Implementation Verification

**CRITICAL**: Before starting ANY implementation:

1. **Verify File Structure**
   ```
   services/scraper/src/
   ├── types.ts          # Contains ScrapingJob interface
   ├── job-manager.ts    # OR equivalent job lifecycle file
   ├── scraper.ts        # OR equivalent core processing file
   ├── server.ts         # Contains API endpoints
   └── database.ts       # Database operations
   ```

2. **Verify Database Schema**
   - scraping_jobs table with status column (VARCHAR)
   - scraping_logs table with job_id foreign key
   - scraped_content table for article storage
   - sources table with RSS URLs

3. **Verify UI Structure**
   ```
   services/ui/app/scraper/
   ├── components/
   │   ├── dashboard-tab.tsx    # Jobs list component
   │   ├── sources-tab.tsx      # Sources list component
   │   └── job-trigger.tsx      # Job configuration form
   └── types.ts                 # Frontend types
   ```

## Implementation Phases

### Phase 1: Database and Backend Foundation (Day 1)
**Goal**: Establish new job status system and fix log retrieval

**Tasks**:
1. Create database migration for status enum
   - File: `database/migrations/2025-07-25_update_scraping_jobs_status.sql`
   - Map old statuses to new granular ones
   - Preserve all historical data

2. Update backend types and lifecycle
   - Update `ScrapingJob` type with new statuses
   - Modify job lifecycle to set correct statuses
   - Ensure backward compatibility

3. Fix job logs API endpoint
   - Debug database query in log retrieval
   - Verify job_id parameter handling
   - Test with existing job data

**Deliverables**:
- [ ] Migration script tested and ready
- [ ] Backend using new status types
- [ ] Logs API returning data correctly

### Phase 2: UI Table Modernization (Day 2)
**Goal**: Replace lists with sortable tables

**Tasks**:
1. Convert jobs list to table
   - Use shadcn/ui Table component
   - Implement client-side sorting
   - Add status icons and colors
   - Include expand button for logs

2. Convert sources list to table
   - Maintain CRUD functionality
   - Add sortable columns
   - Preserve existing features

3. Integrate log viewing
   - Connect expand button to logs API
   - Display logs in expandable row
   - Format for readability

**Deliverables**:
- [ ] Jobs displayed in sortable table
- [ ] Sources displayed in sortable table
- [ ] Logs viewable from UI

### Phase 3: Core Scraping Reliability (Day 3)
**Goal**: Fix multi-source content persistence

**Tasks**:
1. Refactor scraping aggregation logic
   - Fix concurrent task result collection
   - Ensure all sources processed
   - Isolate failures between sources

2. Implement transactional persistence
   - Wrap content insertion in transaction
   - Only update job status after commit
   - Ensure data consistency

3. Add comprehensive error handling
   - Log failures with context
   - Continue processing other sources
   - Report partial success accurately

**Deliverables**:
- [ ] Multi-source jobs save all content
- [ ] Failures isolated per source
- [ ] Job status reflects reality

### Phase 4: Scale and Polish (Day 4)
**Goal**: Enable large-scale scraping with improved UX

**Tasks**:
1. Remove scraping limits
   - Find and remove hardcoded limits
   - Test with 100 sources
   - Ensure performance at scale

2. Implement modal job trigger
   - Replace form with modal dialog
   - Add multi-select source checklist
   - Single input for articles per source

3. Final testing and validation
   - Run all test scenarios
   - Verify performance metrics
   - Document any limitations

**Deliverables**:
- [ ] Support for 100×1,000 scraping
- [ ] Streamlined job configuration
- [ ] All features working together

## Critical Path Items

1. **Database Migration** - Must be first, affects all other work
2. **Type Updates** - Required before UI changes
3. **Log Fix** - Blocks log viewing feature
4. **Aggregation Fix** - Core functionality blocker

## Risk Management

### Technical Risks
- **Migration Failure**: Test thoroughly, prepare rollback
- **Performance Issues**: Monitor large job impact
- **UI Complexity**: Keep tables simple, sort client-side

### Process Risks
- **Scope Creep**: Stick to defined requirements
- **Breaking Changes**: Maintain API compatibility
- **Testing Gaps**: Follow test scenarios exactly

## Success Validation

After each phase:
1. Run relevant test scenarios
2. Verify no regressions
3. Check performance metrics
4. Update documentation

Final validation:
- [ ] All test scenarios pass
- [ ] No functionality lost
- [ ] Performance acceptable
- [ ] Code follows patterns

## Post-Implementation

1. Monitor error logs for issues
2. Gather user feedback
3. Document lessons learned
4. Plan future enhancements