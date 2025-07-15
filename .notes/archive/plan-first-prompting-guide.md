# AI Agent: Plan-First Prompting Instructions

**Purpose**: AI agent must establish clear implementation plans before starting work to reduce iterative token usage and prevent scope creep.

## AI Agent Behavior Rules

### 🎯 **ALWAYS Plan Before Implementation**
When user requests any non-trivial task, AI agent must:
1. **Create implementation plan** before writing any code
2. **Get user approval** for the plan 
3. **Execute plan systematically** without deviation
4. **Avoid iterative discovery** that wastes tokens

### ❌ **NEVER Start Coding Immediately**
For any task requiring >1 file change, AI agent must not:
- Start writing code without a plan
- Discover requirements during implementation  
- Change scope mid-implementation
- Make iterative adjustments without re-planning

## Planning Templates

### 🗣️ **AI Agent Planning Response Template**

```
## Implementation Plan for: [Task Description]

### 📋 **Requirements Analysis**
- **Goal**: [Specific objective]
- **Scope**: [What will/won't be changed]
- **Files Affected**: [@file1.ts, @file2.ts]
- **Dependencies**: [Any prerequisites]

### 🔧 **Implementation Steps**
1. [Specific action with specific file]
2. [Specific action with specific file]  
3. [Specific action with specific file]
4. [Testing/validation step]

### 🎯 **Success Criteria**
- [ ] [Measurable outcome]
- [ ] [Build passes]
- [ ] [Feature works as expected]

### ⚠️ **Risks/Considerations**
- [Potential issue and mitigation]

**Please approve this plan before I proceed with implementation.**
```

## Task-Specific Planning Patterns

### UI Component Development
**AI Agent Must Present This Plan:**
```
## Plan: Create [Component Name] Component

### Requirements Analysis
- **Goal**: Create reusable [component] with [specific features]
- **Scope**: New component + integration point  
- **Files**: @services/ui/components/ui/[component].tsx, @services/ui/app/[page].tsx
- **Dependencies**: @services/ui/lib/utils.ts (if needed)

### Implementation Steps
1. Create component interface and props
2. Implement component logic and styling
3. Add component to target page
4. Test component functionality
5. Verify build passes

### Success Criteria
- [ ] Component renders correctly
- [ ] Props work as expected
- [ ] Integration successful
- [ ] Build and lint pass

**Approve to proceed?**
```

### API Development
**AI Agent Must Present This Plan:**
```
## Plan: Implement [API Endpoint Name]

### Requirements Analysis
- **Goal**: Add [HTTP method] [endpoint] that returns [data type]
- **Scope**: New API route + client integration
- **Files**: @services/ui/app/api/[endpoint]/route.ts, @services/ui/lib/data-service.ts
- **Dependencies**: Database schema changes (if needed)

### Implementation Steps
1. Create API route with proper error handling
2. Add TypeScript interfaces for request/response
3. Update client data service
4. Test API endpoint functionality
5. Verify integration works

### Success Criteria
- [ ] API returns correct data format
- [ ] Error handling works
- [ ] Client integration successful
- [ ] Build and lint pass

**Approve to proceed?**
```

### Bug Resolution
**AI Agent Must Present This Plan:**
```
## Plan: Fix [Bug Description]

### Requirements Analysis
- **Goal**: Resolve [specific error/issue]
- **Scope**: Fix in [specific area]
- **Files**: @error-file.ts, @related-files.ts
- **Dependencies**: None (isolated fix)

### Implementation Steps
1. Identify root cause in [specific location]
2. Implement fix with minimal changes
3. Test fix resolves issue
4. Verify no side effects
5. Confirm build passes

### Success Criteria
- [ ] Error no longer occurs
- [ ] Functionality works correctly
- [ ] No regressions introduced
- [ ] Build and lint pass

**Approve to proceed?**
```

### Database Work
**AI Agent Must Present This Plan:**
```
## Plan: [Database Change Description]

### Requirements Analysis
- **Goal**: [Schema change/query update/migration]
- **Scope**: Database + affected application code
- **Files**: @database/[file].sql, @services/ui/lib/railway-database.ts
- **Dependencies**: Database backup, migration safety

### Implementation Steps
1. Create/update database schema
2. Update TypeScript interfaces
3. Modify queries in application code
4. Test with development data
5. Verify production safety

### Success Criteria
- [ ] Schema changes work correctly
- [ ] Application code updated
- [ ] No data loss or corruption
- [ ] Build and lint pass

**Approve to proceed?**
```

## Complex Task Planning

### 🔄 **Multi-Step Feature Development**
For features requiring >3 files or >1 hour work:

```
## Plan: [Feature Name] Implementation

### Phase 1: Foundation
- Files: [core files]
- Duration: [time estimate]
- Outcome: [basic functionality]

### Phase 2: Integration  
- Files: [integration files]
- Duration: [time estimate]
- Outcome: [working feature]

### Phase 3: Polish
- Files: [styling/testing files]
- Duration: [time estimate] 
- Outcome: [production-ready]

**Note**: Each phase will have its own detailed plan and approval.
**Approve Phase 1 plan first?**
```

### 🔧 **Refactoring Projects**
For code reorganization:

```
## Plan: [Refactoring Description]

### Current State
- Problem: [what's wrong with current code]
- Files: [files that need refactoring]
- Complexity: [current pain points]

### Target State
- Solution: [how refactoring solves the problem]
- New structure: [file organization]
- Benefits: [improvements gained]

### Migration Strategy
1. [Step 1 - safe change]
2. [Step 2 - safe change]
3. [Step 3 - safe change]
4. [Validation and cleanup]

### Risk Mitigation
- Backup: [backup strategy]
- Testing: [how to verify nothing breaks]
- Rollback: [rollback plan if needed]

**Approve this refactoring approach?**
```

## Planning Quality Criteria

### ✅ **Good Plans Include**
- **Specific files**: Exact @file references, not directories
- **Clear steps**: Actionable items with specific outcomes
- **Success criteria**: Measurable validation points
- **Risk assessment**: Potential issues and mitigations
- **Scope boundaries**: What is/isn't included

### ❌ **Bad Plans Avoid**
- **Vague descriptions**: "Update the UI" → "Add Card component to homepage"
- **Open-ended scope**: "Improve performance" → "Optimize specific function"
- **Missing validation**: No testing or success criteria
- **Directory references**: @services/ui/ → @services/ui/app/page.tsx

## AI Agent Approval Process

### 🗣️ **Getting User Approval**
AI agent must always end planning response with:

```
**Please review this plan and respond with:**
- ✅ "Approved - proceed with implementation"
- 🔄 "Modify: [specific changes needed]"  
- ❌ "Cancel: [reason for cancellation]"

I will not start implementation until you approve the plan.
```

### 🔄 **Plan Modifications**
When user requests changes:

```
## Updated Plan: [Task Description]

### 🔄 **Changes Made**
- [Change 1]: [Modification based on feedback]
- [Change 2]: [Modification based on feedback]

### 📋 **Revised Implementation**
[Updated plan incorporating feedback]

**Please approve the revised plan to proceed.**
```

### ❌ **Plan Rejection**
When user cancels:

```
**Plan cancelled as requested.**

For future reference:
- Reason: [User's cancellation reason]
- Alternative: [If user suggested different approach]

Ready for new task when you are.
```

## Token Savings Impact

### 🎯 **Planning Benefits**
- **Upfront clarity**: Prevents scope creep and rework
- **Focused implementation**: No exploratory coding
- **Reduced iterations**: Get it right the first time
- **Clear boundaries**: Avoid feature creep

### 📊 **Expected Savings**
- **Eliminates rework**: 40-60% reduction in iterative coding
- **Prevents scope creep**: 30-50% reduction in feature expansion
- **Reduces discovery**: 50-70% reduction in "let's try this" cycles
- **Overall**: 30-50% reduction in implementation token usage

## Common Planning Scenarios

### 🎯 **Simple Tasks (Plan Optional)**
- Single file changes <20 lines
- Bug fixes with clear solution
- Documentation updates
- Configuration changes

### 🎯 **Medium Tasks (Plan Required)**  
- New components or features
- API endpoint additions
- Multi-file changes
- Integration work

### 🎯 **Complex Tasks (Detailed Planning Required)**
- Architecture changes
- Database migrations
- Cross-service integration
- Major refactoring

## Emergency Planning

### ⚡ **Quick Planning for Urgent Tasks**
For urgent fixes, AI agent can use abbreviated planning:

```
## Quick Fix Plan: [Issue]

**Problem**: [Specific issue]
**Solution**: [Specific fix in @file.ts]
**Risk**: [Minimal/None - isolated change]

**Proceed immediately? (Y/N)**
```

### 🔄 **Mid-Implementation Replanning**
If scope changes during implementation:

```
**STOP: Scope change detected**

Original plan: [brief summary]
New requirement: [what changed]

**Options:**
1. Complete current plan, then create new plan for addition
2. Stop and replan entire task with new requirements

**Which approach do you prefer?**
```

---

**Remember**: Good planning prevents 90% of implementation problems. Every minute spent planning saves 10 minutes of implementation and debugging tokens. 