# [Story Number]. [Story Name] - [Status]

## User Story
As a [type of user], I want to [action/feature] so that [benefit/value].

## Acceptance Criteria
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

## Technical Approach

### Database Changes
- [List any schema modifications needed]
- [Migration scripts required]

### API Changes
- [New endpoints to create]
- [Existing endpoints to modify]

### UI Changes
- [Components to create/modify]
- [Pages affected]
- [User flow changes]

## Implementation Context
```
Required files:
- @services/ui/app/[relevant-file].tsx
- @services/ui/lib/[relevant-file].ts
- @database/migrations/[if-needed].sql
```

## Success Test
Describe how to test this story is complete:
1. [Step to perform]
2. [Expected result]
3. [Validation criteria]

### Testing Utilities
Consider using existing utilities:
- [ ] `utilities/01-db-setup.sh` (Mac/Linux) or `utilities/01-db-setup.ps1` (Windows) - Setup fresh test database
- [ ] `utilities/03-test-scraper.js` - Test scraper functionality
- [ ] `utilities/04-test-api.js` - Test API endpoints
- [ ] `utilities/06-test-logs.js` - Analyze job logs for debugging
- [ ] Create story-specific utility if needed (see `keystone/procedures/utility-creation.md`)

## Dependencies
- Previous stories: [List any prerequisite stories]
- External dependencies: [APIs, libraries, etc.]

## Implementation Notes
[Any specific technical details, gotchas, or important context for the developer implementing this story]

## Progress Tracking
- [ ] Development started
- [ ] Implementation complete
- [ ] Testing passed
- [ ] Documentation updated
- [ ] Deployed to production 