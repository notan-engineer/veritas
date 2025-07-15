# Cursor Framework Master Guide
**Version**: 1.0.0  
**Last Updated**: 15-07-25  
**Purpose**: Complete, self-contained procedures for 100% of development scenarios with [BASIC] and [ADVANCED] sections

---

## 🎯 CORE PRINCIPLES (Always Active)

### 1. Surgical Context Selection
**ALWAYS use @file, NEVER use @folder**
```
✅ CORRECT: @services/ui/app/page.tsx
❌ WRONG: @services/ui/app/
```

### 2. Build Commands from UI Directory
**⚠️ CRITICAL: ALL builds MUST run from services/ui**
```bash
cd services/ui && npm run build && npm run lint
# PowerShell: cd services/ui; npm run build; npm run lint
```

### 3. Session Boundaries
**One Task = One Session**
- Task complete → New session
- Context switch → New session
- Error fixed → New session

### 4. Tab Management
**Keep 3-5 files maximum**
- Close completed work
- Focus on current task
- Regular cleanup every 30 min

### 5. Documentation References
**Reference @docs, never include full content**
```
✅ See @documentation/technical-design.md (Database section)
❌ [Including entire document in response]
```

---

## 📋 [BASIC] TASK-ORIENTED PROCEDURES

### UI Development Checklist
**When building UI components:**

1. **Context Selection** (2-4 files max)
   ```
   Primary: @services/ui/components/ui/[component].tsx
   Utilities: @services/ui/lib/utils.ts (if needed)
   Styling: @services/ui/app/globals.css (if needed)
   Integration: @services/ui/app/[page].tsx (where used)
   ```

2. **Quick Procedure**
   - [ ] Close all non-UI files
   - [ ] Request specific component file
   - [ ] Add dependencies only as needed
   - [ ] Test: `cd services/ui && npm run build`
   - [ ] Complete → Start new session

3. **Common Patterns**
   ```typescript
   // Standard component structure
   import { Card, CardContent } from "@/components/ui/card"
   
   interface Props {
     data: DataType
   }
   
   export function Component({ data }: Props) {
     return <Card>...</Card>
   }
   ```

### API Development Checklist
**When building API endpoints:**

1. **Context Selection** (2-3 files max)
   ```
   Primary: @services/ui/app/api/[endpoint]/route.ts
   Database: @services/ui/lib/railway-database.ts (if needed)
   Client: @services/ui/lib/data-service.ts (for integration)
   ```

2. **Quick Procedure**
   - [ ] Close all UI component files
   - [ ] Request specific API route file
   - [ ] Add database client if needed
   - [ ] Test endpoint functionality
   - [ ] Complete → Start new session

3. **Common Patterns**
   ```typescript
   // Standard API route
   export async function GET() {
     try {
       const data = await databaseFunction()
       return Response.json(data)
     } catch (error) {
       return Response.json({ error }, { status: 500 })
     }
   }
   ```

### Database Work Checklist
**When modifying database:**

1. **Context Selection** (2-3 files max)
   ```
   Schema: @database/railway-schema.sql
   Client: @services/ui/lib/railway-database.ts
   Types: @services/ui/lib/data-service.ts (if types change)
   ```

2. **Quick Procedure**
   - [ ] Close all UI/API files
   - [ ] Request schema file first
   - [ ] Update TypeScript interfaces
   - [ ] Test database queries
   - [ ] Complete → Start new session

3. **Migration Command**
   ```bash
   psql "postgresql://postgres:PASSWORD@mainline.proxy.rlwy.net:PORT/railway" -f migration.sql
   ```

### Error Resolution Checklist
**When fixing errors:**

1. **Build Errors**
   ```
   Context: @services/ui/package.json, @services/ui/tsconfig.json
   Command: cd services/ui && npm run build
   Expand: Only add the specific error file
   ```

2. **Runtime Errors**
   ```
   Context: @[error-component].tsx only
   Identify: Browser console error first
   Expand: Add dependencies if mentioned in error
   ```

3. **TypeScript Errors**
   ```
   Context: @[error-file].ts, @services/ui/tsconfig.json
   Focus: Specific type error only
   Fix: Update types or imports
   ```

4. **Quick Resolution**
   - [ ] Start with minimal context
   - [ ] Run build to see error
   - [ ] Fix specific issue only
   - [ ] Verify fix works
   - [ ] Complete → Start new session

---

## 🔄 [BASIC] TOOL-ORIENTED PROCEDURES

### Context Selection Guide
**Optimal file selection for any task:**

1. **File Count Guidelines**
   - Simple tasks: 2-3 files
   - Medium tasks: 4-5 files
   - Complex tasks: 5-7 files max
   - 8+ files = Break into smaller tasks

2. **Selection Patterns**
   ```
   Specific file: @services/ui/app/page.tsx
   Specific lines: @services/ui/lib/utils.ts:20-40
   Never folder: NOT @services/ui/app/
   Never broad: NOT @services/
   ```

3. **Quick Decision Tree**
   ```
   Working on component? → @specific-component.tsx
   Need utility? → @lib/utils.ts:specific-function
   API work? → @api/endpoint/route.ts
   Database? → @railway-schema.sql + @railway-database.ts
   ```

### Session Management Guide
**When and how to reset sessions:**

1. **Mandatory Reset Triggers**
   - ✅ Task completed
   - 🔄 Switching context (UI→API)
   - ✅ Error resolved
   - 📋 Planning complete → Implementation

2. **Session Handoff Template**
   ```
   New session context:
   - Task: [Brief description]
   - Files: @specific/file.ts
   - Previous: [What was completed]
   ```

3. **Performance Indicators**
   - 10+ exchanges = Consider reset
   - Slow responses = Reset recommended
   - Context confusion = Reset immediately

### Tab Management Guide
**Workspace organization:**

1. **Tab Limits**
   - Maximum: 5 files open
   - Ideal: 3 files open
   - Emergency: 1 file (debugging)

2. **Cleanup Commands**
   ```
   Close all: Ctrl+Shift+P → "Close All Editors"
   Close current: Ctrl+W
   Quick switch: Ctrl+P → filename
   ```

3. **Organization by Task**
   - UI work: component + utils + page
   - API work: route + database + client
   - Debug work: error file + config only

### Documentation Strategy
**Reference without bloat:**

1. **Reference Patterns**
   ```
   Architecture: @documentation/technical-design.md (section)
   Guidelines: @documentation/developer-guidelines.md (topic)
   Never: Full document inclusion
   ```

2. **Quick Info Template**
   ```
   Topic: [Brief answer]
   Details: See @documentation/[file].md
   Section: [Specific section name]
   ```

---

## 🚀 [ADVANCED] COMPLEX SCENARIOS

### Plan-First Development
**For features requiring 3+ files or 30+ minutes:**

1. **Planning Template**
   ```
   ## Implementation Plan: [Feature]
   
   ### Requirements
   - Goal: [Specific objective]
   - Scope: [What will/won't change]
   - Files: [@file1, @file2, @file3]
   
   ### Steps
   1. [Specific action with file]
   2. [Specific action with file]
   3. [Test and validate]
   
   ### Success Criteria
   - [ ] Feature works
   - [ ] Build passes
   - [ ] Tests pass
   
   **Approve plan before proceeding**
   ```

2. **Multi-Phase Features**
   - Phase 1: Foundation (core files)
   - Phase 2: Integration (connections)
   - Phase 3: Polish (UI/UX)
   - Each phase = separate plan

3. **Approval Process**
   - Present plan → Wait for approval
   - Handle modifications → Update plan
   - Execute systematically → No deviation

### Emergency Procedures
**When things go critically wrong:**

1. **Production Down**
   ```
   Context: ONE file only - critical failure point
   Action: Surgical fix, no exploration
   Deploy: Fix first, improve later
   Reset: New session after fix
   ```

2. **Build Completely Broken**
   ```
   Start: cd services/ui && npm run build
   Context: @package.json, @tsconfig.json only
   Expand: Add specific error file only
   Fix: Resolve immediate issue
   ```

3. **Data Loss Risk**
   ```
   Context: @railway-schema.sql, @database.ts only
   Action: Backup first, minimal changes
   Test: Verify data integrity
   Document: Record what happened
   ```

### Token Impact Analysis
**Understanding optimization effectiveness:**

1. **Context Size Impact**
   ```
   @file vs @folder: 60-80% reduction
   Line-specific: 70-90% reduction
   Doc reference: 95% reduction
   Session reset: 50-70% reduction
   ```

2. **Cumulative Savings**
   - Phase 1 (exclusions): 40-60% base reduction
   - Phase 2 (procedures): 20-30% additional
   - Phase 3 (framework): 10-15% additional
   - Total: 70-85% token reduction

3. **Monitoring Success**
   - Faster AI responses
   - Clearer conversations
   - Focused development
   - Higher productivity

### Framework Maintenance
**Keeping the framework effective:**

1. **Weekly Review**
   - [ ] Are procedures being followed?
   - [ ] Any new patterns discovered?
   - [ ] Any procedures need updates?

2. **Monthly Updates**
   - [ ] Review and update procedures
   - [ ] Add new patterns discovered
   - [ ] Remove outdated procedures

3. **Self-Update Process**
   ```
   1. Identify needed change
   2. Update this master file
   3. Increment version number
   4. Document change reason
   ```

---

## 📊 OPTIMIZATION METRICS

### Success Indicators
You know optimization is working when:
- ✅ AI responses are fast and focused
- ✅ Context requests are specific (@file)
- ✅ Sessions reset at natural boundaries
- ✅ Workspace has 3-5 files max
- ✅ Documentation is referenced, not included
- ✅ Development feels more productive

### Common Mistakes to Avoid
- ❌ Including @folder instead of @file
- ❌ Marathon sessions without resets
- ❌ 20+ tabs open simultaneously
- ❌ Full documentation in responses
- ❌ Mixing tasks in one session

### Quick Health Check
1. How many files open? (Should be ≤5)
2. How long is session? (Should be <10 exchanges)
3. Using @file or @folder? (Always @file)
4. Building from UI directory? (Always required)
5. Tasks focused? (One task per session)

---

## 🔧 QUICK COMMAND REFERENCE

### Essential Commands
```bash
# Build (ALWAYS from services/ui)
cd services/ui && npm run build && npm run lint

# Close all tabs
Ctrl+Shift+P → "Close All Editors"

# Quick file open
Ctrl+P → filename

# Session reset
Start new chat → Include context
```

### File Patterns
```
✅ Good:
@services/ui/app/page.tsx
@services/ui/lib/utils.ts:20-40
@documentation/technical-design.md (reference)

❌ Bad:
@services/ui/app/
@services/
@entire-project
```

---

**Remember**: This single guide contains 100% of procedures needed. Start with [BASIC] sections for daily work. Escalate to [ADVANCED] only for complex scenarios. Every procedure is self-contained - no external file dependencies needed for core development work. 