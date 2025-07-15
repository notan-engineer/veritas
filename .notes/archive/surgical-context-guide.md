# AI Agent: Surgical Context Management Instructions

**Purpose**: AI agent must minimize token usage by requesting precise context selection and guiding user toward optimal file selection.

## AI Agent Behavior Rules

### ✅ **ALWAYS REQUEST: Surgical Context**
- **@file**: Request `@services/ui/app/page.tsx` (specific file)
- **@code**: Request `@services/ui/lib/utils.ts:10-25` (specific lines)
- **@docs**: Reference `@documentation/technical-design.md` (link only)

### ❌ **NEVER REQUEST: Broad Context**
- **@folder**: Never request `@services/ui/app/` (entire directory)
- **@codebase**: Never request `@services/` (multiple directories)
- **Full content**: Never ask for entire planning docs in chat

### 🗣️ **EXPLICIT USER GUIDANCE**
When user provides broad context, immediately respond:
"For optimal token usage, please use @services/ui/app/page.tsx instead of @services/ui/app/"

## AI Agent Context Request Patterns

### UI Component Work
**AI Agent Should Request:**
```
✅ ALWAYS REQUEST:
@services/ui/components/ui/card.tsx
@services/ui/lib/utils.ts:15-30
@services/ui/app/globals.css (if styling)

❌ NEVER REQUEST:
@services/ui/components/ui/
@components/
@services/ui/app/
```

**When User Provides Broad Context, Say:**
"I need the specific component file. Please use @services/ui/components/ui/card.tsx instead of @services/ui/components/ui/"

### API Development
**AI Agent Should Request:**
```
✅ ALWAYS REQUEST:
@services/ui/app/api/factoids/route.ts
@services/ui/lib/data-service.ts
@services/ui/lib/railway-database.ts:25-50

❌ NEVER REQUEST:
@services/ui/app/api/
@app/api/
@lib/
```

**When User Provides Broad Context, Say:**
"I need the specific API route. Please use @services/ui/app/api/factoids/route.ts instead of @services/ui/app/api/"

### Database Work
**AI Agent Should Request:**
```
✅ ALWAYS REQUEST:
@database/railway-schema.sql
@services/ui/lib/railway-database.ts
@services/scraper/src/database.ts (if relevant)

❌ NEVER REQUEST:
@database/
@services/scraper/
@migrations/
```

**When User Provides Broad Context, Say:**
"I need the specific database files. Please use @database/railway-schema.sql instead of @database/"

### Error Resolution
**AI Agent Should Request:**
```
✅ ALWAYS REQUEST:
@services/ui/package.json
@services/ui/tsconfig.json
@specific-error-file.ts

❌ NEVER REQUEST:
@services/ui/
@documentation/planning/
@entire-codebase
```

**When User Provides Broad Context, Say:**
"For error resolution, I need only the specific error file. Please use @specific-error-file.ts instead of @services/ui/"

## Line-Specific Reference Examples

### Specific Functions
```
✅ PRECISE:
@services/ui/lib/utils.ts:15-30  # getFormattedDate function
@services/ui/lib/data-service.ts:45-75  # getAllFactoids function

❌ WASTEFUL:
@services/ui/lib/utils.ts  # entire file
@services/ui/lib/  # entire directory
```

### Component Sections
```
✅ PRECISE:
@services/ui/app/page.tsx:20-50  # homepage component logic
@services/ui/components/ui/card.tsx:10-25  # card component interface

❌ WASTEFUL:
@services/ui/app/page.tsx  # entire page
@services/ui/components/ui/  # all components
```

## Workflow Guidelines

### 1. Before Each Session
- [ ] Close unnecessary tabs
- [ ] Identify specific files needed for current task
- [ ] Use @docs for documentation reference, not full inclusion

### 2. During Development
- [ ] Start with specific file: `@services/ui/app/page.tsx`
- [ ] Add specific dependencies: `@services/ui/lib/utils.ts:20-35`
- [ ] Reference docs: `@documentation/technical-design.md` (link only)

### 3. Context Selection Decision Tree
```
Need to understand overall architecture?
  → Use @documentation/technical-design.md (reference)
  → DON'T include entire codebase

Working on specific component?
  → Use @services/ui/components/ui/[component].tsx
  → DON'T include @components/ui/

Fixing specific error?
  → Use @error-file.ts + @package.json + @tsconfig.json
  → DON'T include planning docs or entire directories

Adding new feature?
  → Use specific files for the feature
  → DON'T include @services/ui/app/
```

## Quick Reference Commands

### File Selection
```bash
# ✅ Good patterns
@services/ui/app/page.tsx
@services/ui/components/ui/card.tsx
@services/ui/lib/data-service.ts

# ❌ Avoid patterns
@services/ui/app/
@components/
@lib/
```

### Line Selection
```bash
# ✅ Specific functions
@services/ui/lib/utils.ts:15-30
@services/ui/lib/data-service.ts:45-75

# ❌ Entire files
@services/ui/lib/utils.ts
@services/ui/lib/data-service.ts
```

## Common Mistakes to Avoid

1. **@folder usage**: Never use `@services/ui/app/` when you need `@services/ui/app/page.tsx`
2. **Planning doc inclusion**: Reference via @docs, don't include 20KB+ planning files
3. **Entire codebase**: Never use `@services/` or `@.` unless reviewing architecture
4. **Historical context**: Don't include previous chat history or resolved issues

## Token Savings Impact

- **@file vs @folder**: 60-80% reduction in context size
- **Line-specific**: 70-90% reduction for large files
- **Doc reference**: 95% reduction (link vs full content)
- **Overall**: 40-60% immediate token savings

## Emergency Context Patterns

### Build Errors
```
✅ MINIMAL:
@services/ui/package.json
@services/ui/tsconfig.json
@error-file.ts

❌ EXCESSIVE:
@services/ui/
@documentation/
@entire-project
```

### Runtime Errors
```
✅ MINIMAL:
@error-component.tsx
@services/ui/lib/utils.ts:specific-function
@services/ui/package.json (if dependency issue)

❌ EXCESSIVE:
@services/ui/components/
@services/ui/app/
@planning-docs
```

---

**Remember**: Every broad context inclusion (@folder, @codebase) costs hundreds of tokens. Every surgical context selection (@file, @code:lines) saves massive tokens while providing exactly what's needed. 