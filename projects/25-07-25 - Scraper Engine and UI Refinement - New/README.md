# Scraper Engine and UI Refinement

**Creation Date**: 25-07-25  
**Last Updated**: 25-07-25  
**Implementation Status**: 🆕 New  
**Project Type**: Enhancement/Bug Fix

## Project Overview

This project overhauls the Veritas scraper engine and its management UI to address critical reliability issues and improve administrative usability. The focus is on fixing multi-source scraping bugs, implementing granular job status tracking, and modernizing the UI with sortable tables and streamlined workflows.

## Key Problems Being Solved

1. **Critical Scraping Bug**: Multi-source jobs fail to persist all scraped content
2. **Poor Job Visibility**: Current job statuses lack granularity and logs are inaccessible
3. **Inefficient UI**: List-based interfaces are hard to scan and lack sorting capabilities
4. **Limited Scale**: Hardcoded limits prevent large-scale content ingestion

## Project Goals

1. **Fix multi-source scraping reliability** - Ensure all requested content is saved
2. **Implement granular job statuses** - Provide clear visibility into job lifecycle
3. **Modernize UI with sortable tables** - Replace lists with efficient, scannable tables
4. **Enable large-scale scraping** - Support up to 100 sources with 1,000 articles each
5. **Streamline job configuration** - Simplify trigger workflow with modal interface

## Success Criteria

- [ ] Multi-source scraping jobs reliably save all requested content
- [ ] Job statuses show granular states: new, in-progress, successful, partial, failed
- [ ] Job logs are accessible from the UI for troubleshooting
- [ ] Jobs and sources are displayed in sortable tables
- [ ] Job trigger modal allows multi-select sources and configurable article limits
- [ ] System can handle 100 sources × 1,000 articles in a single job
- [ ] All existing functionality remains intact

## Technical Scope

### Database Changes
- New migration for scraping_jobs status enum type
- Transaction wrapping for data persistence integrity

### Backend Changes (Scraper Service)
- Fix concurrent task result aggregation
- Implement new job status lifecycle
- Fix job logs retrieval API
- Remove hardcoded scraping limits

### Frontend Changes (UI Service)
- Convert jobs list to sortable table with status indicators
- Convert sources list to sortable table with actions
- Refactor job trigger to modal with multi-select
- Add job log viewing capability

## Epics and User Stories

### Epic 1: Overhaul Job Lifecycle & History
1. Implement and Display Granular Job Statuses in a Table
2. Troubleshoot Jobs by Viewing Logs

### Epic 2: Streamline Core Scraping Functionality & Management
1. Reliably Scrape and Persist Content from Multiple Sources
2. Configure and Trigger Large-Scale Scraping Jobs Intuitively
3. Modernize the News Source Management List

## Risk Mitigation

- **Database Migration**: Include rollback strategy and data preservation
- **Concurrent Processing**: Ensure failure isolation between sources
- **UI Performance**: Implement client-side sorting to avoid server load
- **Backward Compatibility**: Maintain all existing API contracts

## Implementation Phases

**Phase 1**: Database and Backend Foundation (Epic 1)
- Database migration for new statuses
- Backend type updates and lifecycle logic
- Fix job logs API

**Phase 2**: UI Modernization (Epic 1 & 2.3)
- Convert jobs and sources lists to tables
- Add sorting and log viewing capabilities

**Phase 3**: Core Scraping Fixes (Epic 2.1)
- Fix multi-source aggregation bug
- Implement transactional persistence

**Phase 4**: Scale and Polish (Epic 2.2)
- Remove scraping limits
- Implement modal job trigger
- Final testing and validation

## Testing Strategy

1. **Unit Tests**: New status lifecycle, sorting logic
2. **Integration Tests**: Multi-source scraping, transaction handling
3. **End-to-End Tests**: Complete job workflow from trigger to log viewing
4. **Performance Tests**: 100 sources × 1,000 articles stress test

## Documentation Updates

- Update API documentation for new status values
- Document new UI components and patterns
- Add troubleshooting guide for job logs
- Update scraper dashboard user guide