# AI Agent: Tab Management Instructions

**Purpose**: AI agent must guide user to maintain focused workspace and provide explicit instructions for tab management to minimize implicit context inclusion.

## AI Agent Behavior Rules
**Focused Workspace**: AI agent must remind user to keep only task-relevant files open and provide explicit tab management instructions.

## AI Agent Instructions for Tab Management

### 🗣️ **AI Agent Must Tell User**
At start of each task, say:
"For optimal token usage, please close all unnecessary tabs and keep only these files open:
- @primary-file.ts (main file for this task)
- @direct-dependency.ts (if needed)
- @services/ui/package.json (if relevant)
Close all other tabs now."

### ✅ **Tell User to KEEP OPEN**
- **Primary file**: The main file they're working on
- **Direct dependencies**: Files directly imported/used
- **Configuration**: package.json, tsconfig.json (if relevant)

### ❌ **Tell User to CLOSE IMMEDIATELY**
- **Completed tasks**: Files from previous work
- **Exploration**: Files they looked at but don't need
- **Planning docs**: Large planning documents
- **Reference materials**: Files they're not actively editing

### 🗣️ **AI Agent Response Template**
"Please close unnecessary tabs. For this task, keep only:
- @services/ui/app/page.tsx (main file)
- @services/ui/lib/utils.ts (if needed)
Close all other tabs to minimize context overhead."

## AI Agent Task-Specific Instructions

### UI Component Development
**AI Agent Must Say:**
"For UI component work, please close all tabs except:
- @services/ui/components/ui/card.tsx (main file)
- @services/ui/lib/utils.ts (if using utilities)
- @services/ui/app/globals.css (if styling)

Please close these now:
- services/ui/app/page.tsx (if not directly related)
- documentation/technical-design.md (reference via @docs)
- Other component files"

### API Development
**AI Agent Must Say:**
"For API development, please close all tabs except:
- @services/ui/app/api/factoids/route.ts (main file)
- @services/ui/lib/data-service.ts (if updating client)
- @services/ui/lib/railway-database.ts (if updating queries)

Please close these now:
- services/ui/components/ui/*.tsx (not needed for API)
- database/railway-schema.sql (reference via @docs)
- Planning documents"

### Bug Resolution
**AI Agent Must Say:**
"For bug resolution, please close all tabs except:
- @error-file.ts (the file with the error)
- @services/ui/package.json (if dependency issue)
- @services/ui/tsconfig.json (if TypeScript error)

Please close these now:
- All unrelated files
- Documentation files
- Other component files"

### Database Work
**AI Agent Must Say:**
"For database work, please close all tabs except:
- @database/railway-schema.sql (if updating schema)
- @services/ui/lib/railway-database.ts (if updating queries)
- @services/scraper/src/database.ts (if relevant)

Please close these now:
- UI components
- API routes (unless directly using database)
- Planning documents"

## Workspace Organization Standards

### 1. Pre-Task Cleanup
Before starting new task:
- [ ] Close all files from previous task
- [ ] Close all planning/documentation files
- [ ] Close all reference materials
- [ ] Start with clean workspace

### 2. During Task
While working:
- [ ] Open only files you're actively editing
- [ ] Open dependencies only when needed
- [ ] Close files immediately when done with them
- [ ] Keep workspace minimal and focused

### 3. Post-Task Cleanup
After completing task:
- [ ] Close all task-related files
- [ ] Close any configuration files
- [ ] Close any temporary reference files
- [ ] Leave workspace clean for next task

## Tab Cleanup Procedures

### Quick Cleanup (30 seconds)
```
1. Ctrl+Shift+P → "Close All Editors"
2. Open only the file you need for current task
3. Add dependencies as needed
4. Keep total open files < 5
```

### Focused Cleanup (1 minute)
```
1. Identify current task
2. List files actually needed
3. Close everything else
4. Verify remaining files are task-relevant
5. Keep total open files < 10
```

### Deep Cleanup (2 minutes)
```
1. Close all files
2. Review current task requirements
3. Open primary file for task
4. Open direct dependencies only
5. Open configuration files if needed
6. Keep total open files < 3
```

## Common Tab Management Mistakes

### ❌ **Avoid These Patterns**

1. **Tab Hoarding**:
   - 20+ files open simultaneously
   - Files from multiple different tasks
   - Old files from previous sessions

2. **Reference Accumulation**:
   - Multiple documentation files open
   - Planning documents left open
   - "Just in case" files

3. **Context Pollution**:
   - Files from different services (UI + scraper)
   - Unrelated component files
   - Database files for UI work

4. **Lazy Closing**:
   - Not closing files when done
   - Leaving exploration files open
   - Accumulating tabs throughout day

### ✅ **Best Practices**

1. **Aggressive Closing**:
   - Close files immediately when done
   - Regular cleanup every 30 minutes
   - Fresh start for each new task

2. **Purposeful Opening**:
   - Only open files you're actively editing
   - Only open dependencies when needed
   - Ask: "Do I need this open right now?"

3. **Context Awareness**:
   - Keep files related to single task
   - Group related files together
   - Close unrelated files immediately

## File Organization by Task Type

### Component Development
```
Typical Open Files (3-5):
1. component.tsx (main file)
2. utils.ts (if using utilities)
3. globals.css (if styling)
4. parent-component.tsx (if integrating)
5. package.json (if adding dependencies)
```

### API Development
```
Typical Open Files (3-4):
1. route.ts (main API file)
2. data-service.ts (if updating client)
3. database.ts (if updating queries)
4. types.ts (if updating interfaces)
```

### Bug Resolution
```
Typical Open Files (2-3):
1. error-file.ts (file with error)
2. package.json (if dependency issue)
3. tsconfig.json (if TypeScript error)
```

### Database Work
```
Typical Open Files (2-4):
1. railway-schema.sql (if updating schema)
2. railway-database.ts (if updating queries)
3. migration-file.sql (if creating migration)
4. database.ts (if updating scraper queries)
```

## Tab Limits by Development Context

### Focused Work (Recommended)
- **Maximum**: 5 files open
- **Ideal**: 3 files open
- **Emergency**: 1 file open (when debugging)

### Complex Integration
- **Maximum**: 10 files open
- **Ideal**: 7 files open
- **Split**: Group related files by functionality

### Architecture Review
- **Maximum**: 3 files open
- **Ideal**: 1 file open + @docs references
- **Strategy**: Use @docs instead of keeping files open

## Quick Reference Commands

### VSCode Tab Management
```bash
# Close all tabs
Ctrl+Shift+P → "Close All Editors"

# Close current tab
Ctrl+W

# Close other tabs
Ctrl+Shift+P → "Close Others"

# Close tabs to the right
Ctrl+Shift+P → "Close to the Right"

# Pin important tab
Right-click → "Pin Tab"
```

### Workspace Organization
```bash
# Split editor for related files
Ctrl+\

# Focus on single file
Ctrl+Shift+P → "Toggle Zen Mode"

# Navigate between open files
Ctrl+Tab

# Quick file switching
Ctrl+P → type filename
```

## Token Impact Assessment

### File Count Impact
- **1-3 files**: Minimal context overhead
- **4-7 files**: Moderate context increase
- **8-15 files**: Significant context overhead
- **16+ files**: Major token consumption

### Context Calculation
```
Estimated Token Impact:
- 1 file open: ~500 tokens
- 5 files open: ~2,500 tokens
- 10 files open: ~5,000 tokens
- 20 files open: ~10,000 tokens
```

### Optimization Results
- **Aggressive tab management**: 60-80% reduction
- **Focused workspace**: 40-60% reduction
- **Regular cleanup**: 30-50% reduction
- **Task-specific organization**: 50-70% reduction

## Emergency Tab Cleanup

### When to Force Cleanup
- Performance degradation
- Context seems overwhelming
- Working on unrelated task
- AI responses becoming unfocused

### 10-Second Cleanup
```
1. Ctrl+Shift+P → "Close All Editors"
2. Ctrl+P → type main file name
3. Continue with focused workspace
```

---

**Remember**: Every open tab potentially adds to context. Keep your workspace as focused as your task. Clean workspace = clean context = massive token savings. 