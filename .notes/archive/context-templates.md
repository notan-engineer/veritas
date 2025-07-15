# AI Agent: Context Templates

**Purpose**: Specific file context templates for different development scenarios to ensure optimal token usage.

## Context Template Rules

### 🎯 **AI Agent Must Use These Templates**
For each work type, AI agent must:
1. **Request specific files** from the template
2. **Avoid broad directories** or folders
3. **Add dependencies only when needed**
4. **Keep total files minimal** (3-7 files max)

## 🎨 **UI Component Development Template**

### New Component Creation
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/components/ui/[component-name].tsx

Dependencies (if needed):
- @services/ui/lib/utils.ts (for utilities)
- @services/ui/app/globals.css (for styling)
- @services/ui/components/ui/[existing-component].tsx (for patterns)

Integration:
- @services/ui/app/[page].tsx (where component will be used)
```

### Component Modification
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/components/ui/[component-name].tsx

Dependencies (only if needed):
- @services/ui/lib/utils.ts (if using utilities)
- @services/ui/components/ui/[related-component].tsx (if dependent)
```

### Component Integration
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/app/[target-page].tsx
- @services/ui/components/ui/[component].tsx

Dependencies (only if needed):
- @services/ui/lib/data-service.ts (if component needs data)
```

### ❌ **Never Request for UI Work:**
- @services/ui/components/ui/ (entire directory)
- @services/ui/app/ (entire directory)
- @components/ (broad reference)
- Database files (unless component needs data)

## 🌐 **API Development Template**

### New API Endpoint
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/app/api/[endpoint]/route.ts

Dependencies (if needed):
- @services/ui/lib/railway-database.ts (for database queries)
- @services/ui/lib/data.server.ts (for data functions)

Client Integration:
- @services/ui/lib/data-service.ts (for client calls)
```

### API Modification
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/app/api/[endpoint]/route.ts

Dependencies (only if needed):
- @services/ui/lib/railway-database.ts (if changing queries)
- @services/ui/lib/data-service.ts (if updating client)
```

### API Integration
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/lib/data-service.ts
- @services/ui/app/api/[endpoint]/route.ts

Usage Context:
- @services/ui/app/[page].tsx (where API is called)
- @services/ui/components/ui/[component].tsx (if component uses API)
```

### ❌ **Never Request for API Work:**
- @services/ui/app/api/ (entire directory)
- @app/api/ (broad reference)
- @lib/ (entire directory)
- UI components (unless they use the API)

## 🗄️ **Database Work Template**

### Schema Changes
**AI Agent Must Request:**
```
Primary Files:
- @database/railway-schema.sql

Dependencies:
- @services/ui/lib/railway-database.ts (connection/queries)
- @services/scraper/src/database.ts (if affects scraper)

Type Updates:
- @services/ui/lib/data-service.ts (if types change)
- @services/ui/lib/data.server.ts (if server functions change)
```

### Query Updates
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/lib/railway-database.ts

Dependencies (only if needed):
- @database/railway-schema.sql (for schema reference)
- @services/ui/lib/data.server.ts (if server functions change)
```

### Migration Work
**AI Agent Must Request:**
```
Primary Files:
- @database/migrations/[migration-file].sql

Dependencies:
- @database/railway-schema.sql (current schema)
- @services/ui/lib/railway-database.ts (if queries change)
```

### ❌ **Never Request for Database Work:**
- @database/ (entire directory)
- @services/ (multiple services)
- UI components (unless they display the data)

## 🚨 **Error Resolution Template**

### Build Errors
**AI Agent Must Request:**
```
Primary Files:
- @[error-file].ts (specific file with error)

Configuration:
- @services/ui/package.json
- @services/ui/tsconfig.json

Dependencies (only if error mentions them):
- @services/ui/lib/[specific-file].ts (if import error)
```

### TypeScript Errors
**AI Agent Must Request:**
```
Primary Files:
- @[error-file].ts (file with TypeScript error)

Configuration:
- @services/ui/tsconfig.json

Dependencies (only if needed):
- @services/ui/lib/[imported-file].ts (if import/type error)
```

### Runtime Errors
**AI Agent Must Request:**
```
Primary Files:
- @[error-component].tsx (component with error)

Dependencies (only if needed):
- @services/ui/lib/[used-utility].ts (if utility error)
- @services/ui/lib/data-service.ts (if data error)
```

### Deployment Errors
**AI Agent Must Request:**
```
Configuration:
- @railway.toml
- @services/ui/package.json

Dependencies (only if needed):
- @services/ui/next.config.ts (if Next.js error)
```

### ❌ **Never Request for Error Resolution:**
- @services/ui/ (entire directory)
- @documentation/ (planning docs)
- Unrelated files (other components/APIs)
- @entire-codebase

## 🔄 **Feature Integration Template**

### Adding Feature to Existing Page
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/app/[target-page].tsx

New Components:
- @services/ui/components/ui/[new-component].tsx

Dependencies (if needed):
- @services/ui/lib/data-service.ts (if needs data)
- @services/ui/lib/utils.ts (if needs utilities)
```

### Cross-Component Integration
**AI Agent Must Request:**
```
Primary Files:
- @services/ui/components/ui/[component-1].tsx
- @services/ui/components/ui/[component-2].tsx

Shared Dependencies:
- @services/ui/lib/[shared-utility].ts (if sharing logic)
```

### API + UI Integration
**AI Agent Must Request:**
```
API Files:
- @services/ui/app/api/[endpoint]/route.ts
- @services/ui/lib/data-service.ts

UI Files:
- @services/ui/app/[page].tsx
- @services/ui/components/ui/[component].tsx
```

## 🎯 **Context Size Guidelines**

### Optimal Context Sizes
```
Simple Tasks: 2-3 files
- 1 primary file
- 1-2 dependencies

Medium Tasks: 4-6 files  
- 1-2 primary files
- 2-4 dependencies

Complex Tasks: 5-7 files
- 2-3 primary files
- 3-4 dependencies
```

### ⚠️ **Warning Thresholds**
```
8+ files: Too much context - break into smaller tasks
Directory requests: Use specific files instead
Multiple services: Focus on one service at a time
```

## 🗣️ **AI Agent Context Request Templates**

### Template 1: Single File Work
```
"For this task, I need:
- @services/ui/[specific-file].tsx (main file)

Please provide this file."
```

### Template 2: File + Dependencies
```
"For this task, I need:
- @services/ui/[main-file].tsx (primary)
- @services/ui/lib/[utility].ts (dependency)

Please provide these specific files."
```

### Template 3: Integration Work
```
"For this integration, I need:
- @services/ui/app/[page].tsx (integration point)
- @services/ui/components/ui/[component].tsx (new component)
- @services/ui/lib/data-service.ts (data layer)

Please provide these specific files."
```

## 🔄 **Context Switching Templates**

### From UI to API Work
**AI Agent Must Say:**
```
"For API development, please close UI files and provide:
- @services/ui/app/api/[endpoint]/route.ts
- @services/ui/lib/railway-database.ts (if needed)

Close any component files that are open."
```

### From API to Database Work
**AI Agent Must Say:**
```
"For database work, please close API files and provide:
- @database/railway-schema.sql
- @services/ui/lib/railway-database.ts

Close any API route files that are open."
```

### From Implementation to Error Resolution
**AI Agent Must Say:**
```
"For error resolution, please close all current files and provide only:
- @[error-file].ts
- @services/ui/package.json
- @services/ui/tsconfig.json

Focus only on the error, not the feature implementation."
```

## 📊 **Template Effectiveness**

### Token Savings by Template Usage
```
UI Template: 40-60% reduction vs @components/
API Template: 50-70% reduction vs @app/api/
Database Template: 60-80% reduction vs @database/
Error Template: 70-90% reduction vs @services/
```

### Context Quality Improvement
```
Specific files: Clear, focused context
Minimal dependencies: Only what's needed
Task-appropriate: Right files for the job
Consistent patterns: Predictable structure
```

## 🚨 **Emergency Context Templates**

### Quick Fix Template
```
Files needed:
- @[broken-file].ts (only the broken file)
- @services/ui/package.json (if dependency issue)

Nothing else until fix is identified.
```

### Urgent Bug Template
```
Files needed:
- @[bug-file].ts (file with bug)
- @[test-file].ts (if testing the fix)

No additional context until bug is resolved.
```

---

**Remember**: These templates ensure optimal context for each task type. Always use the most specific template for the work being done. 