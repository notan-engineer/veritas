# Plan-First Development Procedure

For features requiring 3+ files or 30+ minutes of work.

## Planning Template

```markdown
## Implementation Plan: [Feature Name]

### Requirements
- Goal: [Specific objective]
- Scope: [What will/won't change]
- Files: [@file1, @file2, @file3]

### Steps
1. [Specific action with file]
2. [Specific action with file]
3. [Test and validate]

### Success Criteria
- [ ] Feature works as intended
- [ ] Build passes
- [ ] Tests pass
- [ ] Documentation updated

**Approve plan before proceeding**
```

## Multi-Phase Features

### Phase Structure
- **Phase 1**: Foundation (core files, data structures)
- **Phase 2**: Integration (connections, API endpoints)
- **Phase 3**: Polish (UI/UX, error handling)
- Each phase = separate plan and session

### Phase Template
```markdown
## Phase [X]: [Phase Name]

### Objective
[What this phase accomplishes]

### Dependencies
- Previous phases: [List completed phases]
- Required files: [@specific/files.ts]

### Implementation
1. [Step with specific file changes]
2. [Step with specific file changes]
3. [Validation step]

### Deliverables
- [ ] [Specific working feature]
- [ ] [Tests or validation]
- [ ] [Documentation update]
```

## User Story Format

When working on user stories:

```markdown
## User Story: [As a user, I want to...]

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Technical Approach
- Database: [Schema changes needed]
- API: [New endpoints required]
- UI: [Components to create/modify]

### Implementation Plan
1. Database migration (if needed)
2. API endpoint development
3. UI component creation
4. Integration and testing
5. Documentation update
```

## Approval Process

### Present Plan
1. Show complete plan to user
2. Wait for explicit approval
3. Handle requested modifications
4. Update plan as needed
5. Get final approval before starting

### Modification Handling
- User suggests changes → Update plan
- Scope increases → Break into phases
- Technical blockers → Present alternatives
- Timeline concerns → Simplify approach

## Execution Guidelines

### Systematic Execution
- Follow plan exactly as approved
- No deviation without consultation
- Complete each step before moving on
- Test at each milestone
- Document progress in plan

### Progress Tracking
```markdown
### Steps
1. ✅ [Completed step]
2. 🔄 [In progress step]
3. ⬜ [Pending step]
```

## Common Planning Scenarios

### New Feature
- Requires 3-5 files minimum
- Touches database, API, and UI
- Use phased approach
- Test each layer independently

### Major Refactor
- List all affected files upfront
- Plan rollback strategy
- Execute in small batches
- Maintain working state throughout

### Bug Fix with Side Effects
- Document all affected areas
- Plan regression testing
- Consider temporary workarounds
- Update related documentation 