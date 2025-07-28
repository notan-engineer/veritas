# Documentation Procedure

## Context Selection (Dynamic)
```
Based on project scope, may include:
- Git history: PR details, commits, diffs
- Project files: Stories, requirements, plans
- Code changes: New files, modifications
- Existing docs: All potentially affected documentation
```

## Quick Procedure
- [ ] Gather project/feature information interactively
- [ ] Analyze all changes (code, database, architecture)
- [ ] Dynamically map changes to documentation needs
- [ ] Create comprehensive documentation plan
- [ ] Execute updates systematically
- [ ] Verify cross-references and completeness
- [ ] Create ADRs for significant decisions

## Interactive Information Gathering

### Phase 1: Project Context Collection

REQUEST: "Please provide the following project details:
- Project/Feature name: _______________
- Implementation dates: Start: _____ End: _____
- PR numbers: #___, #___, #___ (comma-separated)
- Related issues/tickets: _______________
- Key stories completed: _______________
- Project directory (if applicable): _______________"

If PR numbers not provided:
REQUEST: "Please provide either:
- Git commit range (e.g., abc123..def456)
- List of key files changed
- Description of main changes made"

### Phase 2: Change Type Analysis

REQUEST: "Analyzing the changes... Please confirm these change categories:
[AI will auto-detect and present, user confirms/modifies]

Detected changes:
- [ ] Database: [list tables/columns affected]
- [ ] APIs: [list new/modified endpoints]
- [ ] UI Components: [list components]
- [ ] Architecture: [list architectural changes]
- [ ] Features: [list user-facing features]
- [ ] Performance: [list optimizations]
- [ ] Other: _______________

Are there additional changes not detected above?"

### Phase 3: Dynamic Documentation Mapping

#### Intelligent Analysis Process

1. **Code Change Analysis**
   ```
   For each changed file:
   - Identify file type and purpose
   - Find existing documentation covering this area
   - Determine documentation impact
   ```

2. **Feature Impact Analysis**
   ```
   For each feature/story:
   - Map to user-facing documentation
   - Identify technical documentation needs
   - Find related features requiring updates
   ```

3. **Architecture Impact Analysis**
   ```
   For architectural changes:
   - Determine if ADR is needed
   - Map to architecture documentation
   - Identify affected procedures
   ```

#### Documentation Plan Generation

The AI will present:
"Based on analysis of [project name], here's the documentation plan:

**Database Documentation** (if applicable)
- `database/schema.sql` - Update with [specific changes]
- `database/README.md` - Add migration notes for [changes]
- NEW: `database/migrations/[date]-[description].sql` - Create migration file

**Feature Documentation**
- `documentation/features/[existing].md` - Update [sections] for [reasons]
- NEW: `documentation/features/[new-feature].md` - Document [feature name]

**API Documentation**
- `documentation/features/08-api-system.md` - Add endpoints: [list]
- Update response examples for [changes]

**Architecture Documentation**
- `documentation/software-architecture.md` - Update [components/services]
- NEW: `documentation/decisions/ADR-XXX-[title].md` - Document decision on [topic]

**Business Logic Updates**
- `documentation/business-logic-and-glossary.md` - Add terms: [list]
- Update workflows for [processes]

**Keystone Updates**
- `keystone/procedures/[relevant].md` - Update for new patterns
- `keystone/development-principles.md` - Add principles if needed

**Cross-Reference Updates**
- Update links in [files] to reference new documentation
- Add new feature to `documentation/features/README.md`
- Update `documentation/the-product.md` if user-facing

REQUEST: "Please review this plan. Are there any:
1. Missing documentation areas?
2. Additional context needed?
3. Specific sections you want emphasized?"

### Phase 4: Documentation Template Selection

Based on needs identified, provide appropriate templates:

#### New Feature Documentation Template
```markdown
# Feature: [Name]

## Overview
[1-2 sentence description]

## User Story
As a [user type], I want [capability] so that [benefit].

## Technical Implementation
- **Location**: `[code location]`
- **Components**: [list key components]
- **Database**: [any schema changes]
- **APIs**: [endpoints used/created]

## Key Features
1. **[Feature aspect]**
   - [Details]
   - [Technical notes]

## User Workflows
[Describe how users interact]

## Related Features
- [Links to related documentation]
```

#### ADR Template Reference
```markdown
# ADR-XXX: [Title]

## Status
[Proposed/Accepted/Deprecated] ([Date])

## Context
[What prompted this decision]

## Decision
[What was decided]

## Consequences
[Positive, negative, and neutral impacts]
```

### Phase 5: Execution Guidance

For each documentation update:

1. **Pre-Update Checklist**
   - [ ] Read current documentation
   - [ ] Understand existing structure
   - [ ] Identify insertion points

2. **Update Guidelines**
   - Maintain existing tone and style
   - Use consistent formatting
   - Include code examples where helpful
   - Add cross-references

3. **Quality Checks**
   - [ ] Technical accuracy
   - [ ] Completeness
   - [ ] Cross-references work
   - [ ] No broken links
   - [ ] Consistent terminology

### Phase 6: Verification

Final verification checklist:
- [ ] All identified changes documented
- [ ] Cross-references updated
- [ ] New features in feature index
- [ ] Architecture changes reflected
- [ ] Business terms added to glossary
- [ ] Procedures updated if needed
- [ ] No orphaned documentation
- [ ] Build still passes

REQUEST: "Documentation updates complete. Please verify:
1. Run any build commands to ensure no breaks
2. Review the updated documentation
3. Confirm all project changes are captured"

## Common Patterns

### Database Change Documentation
```
1. Update schema.sql with new structure
2. Add migration file with rollback
3. Update README with migration notes
4. Update affected feature docs
5. Add new terms to glossary
```

### New Component Documentation
```
1. Update architecture.md
2. Create/update feature doc
3. Update UI procedure if patterns added
4. Add to component inventory
5. Document props/interfaces
```

### API Change Documentation
```
1. Update API system doc
2. Modify affected feature docs
3. Update integration examples
4. Document breaking changes
5. Update response formats
```

## Troubleshooting

**Missing Information**
- Check git history
- Review PR descriptions
- Examine test files
- Look for related issues

**Unclear Documentation Needs**
- Start with obvious changes
- Follow code dependencies
- Check for user impact
- Consider maintenance needs

**Large Projects**
- Break into logical sections
- Document incrementally
- Maintain running checklist
- Review periodically

## Example Usage

### Small Feature Addition
```
1. Gather: "Added tooltip component to job dashboard"
2. Analyze: New UI component, updated dashboard
3. Map: UI procedure needs tooltip pattern, dashboard doc needs update
4. Plan: 2 files to update
5. Execute: Add patterns, update feature
6. Verify: Cross-references work
```

### Major Project
```
1. Gather: "Scraper Engine Refinement - PRs #48-56"
2. Analyze: Database changes, new UI components, API updates
3. Map: 17 documentation files identified
4. Plan: Detailed update list with reasons
5. Execute: Systematic updates with templates
6. Verify: All changes captured
```

## Integration Notes

- This procedure is referenced by all project documentation stories
- It should be followed for any significant code changes
- The dynamic mapping ensures comprehensive coverage
- Interactive prompts prevent missing information

## Related Procedures
- [Branching and Workflow](./branching-and-workflow.md)
- [UI Development](./ui-development.md)
- [Database Work](./database-work.md)
- [API Development](./api-development.md)