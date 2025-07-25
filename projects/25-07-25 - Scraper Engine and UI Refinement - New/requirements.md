# Requirements: Scraper Engine and UI Refinement

## Verification Protocol

### ⚠️ MANDATORY PRE-IMPLEMENTATION CHECKLIST ⚠️

Before implementing ANY part of this project, verify:

- [ ] **Current State Verification**
  - [ ] All referenced files exist at specified paths
  - [ ] Database schema matches expected structure
  - [ ] API endpoints follow current patterns
  - [ ] UI components use existing patterns

- [ ] **Assumption Validation**  
  - [ ] Scraper service structure matches described layout
  - [ ] Job lifecycle follows expected flow
  - [ ] Database tables have expected columns
  - [ ] UI uses shadcn/ui components

- [ ] **Consistency Check**
  - [ ] No conflicting migrations exist
  - [ ] API contracts remain backward compatible
  - [ ] UI patterns match existing implementation
  - [ ] No duplicate functionality

- [ ] **Alignment Confirmation**
  - [ ] Aligns with software-architecture.md
  - [ ] Follows Keystone Framework principles
  - [ ] Respects existing database schema
  - [ ] Maintains service boundaries

**STOP if any verification fails. Seek clarification before proceeding.**

## Functional Requirements

### 1. Multi-Source Scraping Reliability

**Current State**: Jobs with multiple sources fail to persist all content
**Desired State**: All requested content from all sources is reliably saved

**Acceptance Criteria**:
- Given a job with 3 sources requesting 5 articles each
- When the job completes
- Then exactly 15 articles are saved in scraped_content table
- And all articles have correct source attribution
- And job status reflects actual completion state

### 2. Granular Job Status System

**Current State**: Basic statuses (pending, running, completed, failed)
**Desired State**: Granular statuses (new, in-progress, successful, partial, failed)

**Acceptance Criteria**:
- Given a new job is created
- When viewing the jobs list
- Then status shows as "new" initially
- And changes to "in-progress" when processing starts
- And shows "successful" when all sources complete
- And shows "partial" when some sources fail
- And shows "failed" when all sources fail

### 3. Job Log Accessibility

**Current State**: Logs API returns database error
**Desired State**: Logs are viewable from UI

**Acceptance Criteria**:
- Given a completed job with logs
- When clicking the expand button
- Then job logs are displayed
- And logs show timestamp, level, and message
- And logs help identify issues

### 4. Sortable Table Interfaces

**Current State**: List-based UI with no sorting
**Desired State**: Table-based UI with client-side sorting

**Jobs Table Requirements**:
- Columns: Timestamp, # of Sources, Requested Articles, Scraped, Duration, Status, Expand
- All columns sortable
- Status shown with icons/colors
- Expand button reveals logs

**Sources Table Requirements**:
- Columns: Name, RSS URL, Creation Date, Actions
- All columns sortable
- Actions include Edit and Delete
- Maintains existing CRUD functionality

### 5. Streamlined Job Configuration

**Current State**: Multi-step form process
**Desired State**: Single modal interface

**Acceptance Criteria**:
- Given user clicks "Trigger Scraping Job"
- When modal opens
- Then all sources shown in multi-select checklist
- And all sources selected by default
- And single input for articles per source
- And job triggers with one click

### 6. Large-Scale Scraping Support

**Current State**: Hardcoded limits on sources/articles
**Desired State**: Support 100 sources × 1,000 articles

**Acceptance Criteria**:
- Given 100 sources configured
- When triggering job for 1,000 articles each
- Then job processes without errors
- And system remains responsive
- And all content is saved

## Non-Functional Requirements

### Performance
- Tables must sort instantly (client-side)
- Job status updates within 2 seconds
- Log retrieval under 1 second
- Large jobs don't block UI

### Reliability
- Multi-source failures isolated
- Database transactions ensure consistency
- Job status always reflects reality
- No data loss on failures

### Usability
- Tables scannable at a glance
- Status meanings obvious
- One-click common actions
- Clear error messages

### Maintainability
- Follow existing code patterns
- Preserve all current functionality
- Document new components
- Include rollback strategies

## Technical Constraints

### Database
- PostgreSQL enum for status field
- Preserve historical data during migration
- Maintain referential integrity
- Use existing connection patterns

### Backend
- TypeScript with existing types
- Crawlee for scraping engine
- Express for API server
- Follow existing error patterns

### Frontend
- Next.js App Router
- shadcn/ui components only
- Dark mode compatible
- RTL support maintained

## Test Scenarios

### Scenario 1: Basic Multi-Source Job
1. Configure 3 sources
2. Trigger job for 5 articles each
3. Verify 15 articles saved
4. Check job status is "successful"
5. View logs for debugging info

### Scenario 2: Partial Failure Handling
1. Configure 3 sources (1 with bad URL)
2. Trigger job for 10 articles each
3. Verify 20 articles saved (from 2 good sources)
4. Check job status is "partial"
5. View logs to see failure reason

### Scenario 3: Large-Scale Test
1. Configure 10 sources
2. Trigger job for 100 articles each
3. Monitor system performance
4. Verify 1,000 articles saved
5. Check no timeouts or errors

### Scenario 4: UI Sorting Verification
1. Generate 20+ jobs over time
2. Sort by each column ascending
3. Sort by each column descending
4. Verify sort order is correct
5. Check performance is instant

## Migration and Rollback Plan

### Database Migration
1. Create new enum type
2. Add temporary column
3. Migrate data with mapping
4. Drop old column
5. Rename new column

### Rollback Strategy
1. Keep backup before migration
2. Reverse migration script ready
3. Test rollback in staging
4. Document rollback procedure
5. Monitor after deployment

## Success Metrics

- Zero multi-source data loss bugs
- 100% job status accuracy
- < 1 second log retrieval time
- 90% reduction in troubleshooting time
- Support for 100,000 articles/job