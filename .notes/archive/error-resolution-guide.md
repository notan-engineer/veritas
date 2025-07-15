# AI Agent: Error Resolution Guidelines

**Purpose**: AI agent must handle errors with minimal context pollution, using focused debugging procedures that avoid irrelevant information.

## Error Resolution Principles

### 🎯 **Error-First Approach**
When user reports an error, AI agent must:
1. **Start new session** if not already error-focused
2. **Request minimal context** - only error-related files
3. **Isolate the problem** before expanding context
4. **Avoid feature context** - focus only on the error

### ❌ **Never Include During Error Resolution**
- Planning documents
- Unrelated components
- Previous implementation context
- Entire directories
- Feature development files (unless they caused the error)

## 🚨 **Build Error Resolution**

### Step 1: Immediate Context
**AI Agent Must Request:**
```
Essential Files Only:
- @services/ui/package.json
- @services/ui/tsconfig.json

STOP - Do not request more files until build command is run.
```

### Step 2: Error Identification
**AI Agent Must Say:**
```
"Please run the build command from the correct directory:
cd services/ui && npm run build

Share the exact error message output."
```

### Step 3: Error-Specific Context
**Based on error type, AI agent requests:**

#### TypeScript Errors
```
Additional Files:
- @[error-file].ts (specific file mentioned in error)
- @services/ui/lib/[imported-file].ts (if import error)

Do not include unrelated files.
```

#### Module Resolution Errors
```
Additional Files:
- @services/ui/[missing-file].ts (file that cannot be found)
- @services/ui/package.json (if dependency issue)

Check imports in the error file only.
```

#### Configuration Errors
```
Additional Files:
- @services/ui/next.config.ts (if Next.js error)
- @services/ui/postcss.config.mjs (if CSS error)

Focus only on configuration causing the error.
```

### ❌ **Never Request for Build Errors:**
- @services/ui/ (entire directory)
- @documentation/ (any documentation)
- @database/ (database files)
- Multiple component files

## 🔄 **Runtime Error Resolution**

### Step 1: Error Isolation
**AI Agent Must Request:**
```
Error Context Only:
- @[component-with-error].tsx (specific component failing)

STOP - Identify the exact error first.
```

### Step 2: Error Analysis
**AI Agent Must Say:**
```
"Please share:
1. Exact error message from browser console
2. Which page/component is failing
3. What action triggers the error

Do not include additional files yet."
```

### Step 3: Targeted Context Expansion
**Based on error type:**

#### Component State Errors
```
Additional Files:
- @services/ui/lib/[utility].ts (if component uses utility)
- @services/ui/lib/data-service.ts (if data-related error)

Only files directly used by the failing component.
```

#### Data Fetching Errors
```
Additional Files:
- @services/ui/lib/data-service.ts (client data functions)
- @services/ui/app/api/[endpoint]/route.ts (if API error)

Focus on data flow only.
```

#### Styling/UI Errors
```
Additional Files:
- @services/ui/app/globals.css (if styling issue)
- @services/ui/lib/utils.ts (if utility function issue)

Only styling-related files.
```

### ❌ **Never Request for Runtime Errors:**
- All components (unless directly related)
- Database schema (unless data error)
- API routes (unless API error)
- Configuration files (unless config error)

## 🚧 **Deployment Error Resolution**

### Step 1: Deployment Context
**AI Agent Must Request:**
```
Deployment Files Only:
- @railway.toml
- @services/ui/package.json

Check deployment configuration first.
```

### Step 2: Build Verification
**AI Agent Must Say:**
```
"Please verify local build works:
cd services/ui && npm run build

If local build fails, we need to fix build errors first.
If local build succeeds, share Railway deployment error logs."
```

### Step 3: Environment-Specific Issues
**Based on deployment error:**

#### Build Command Errors
```
Additional Files:
- @services/ui/next.config.ts (if Next.js build error)
- @services/ui/tsconfig.json (if TypeScript build error)

Focus on build configuration only.
```

#### Runtime Deployment Errors
```
Additional Files:
- @services/ui/lib/railway-database.ts (if database connection error)
- @services/ui/app/api/[failing-endpoint]/route.ts (if API error)

Only files related to the specific runtime error.
```

### ❌ **Never Request for Deployment Errors:**
- UI components (unless specific component failing)
- Documentation files
- Planning documents
- Database migrations (unless schema error)

## 🔍 **TypeScript Error Resolution**

### Step 1: TypeScript Context
**AI Agent Must Request:**
```
TypeScript Essentials:
- @[error-file].ts (file with TypeScript error)
- @services/ui/tsconfig.json

Start with just these two files.
```

### Step 2: Error-Specific Analysis
**Based on TypeScript error type:**

#### Type Errors
```
Additional Files (only if needed):
- @services/ui/lib/[type-definitions].ts (if custom types)
- @[imported-file].ts (if imported type error)

Only files containing the problematic types.
```

#### Import Errors
```
Additional Files:
- @[imported-file].ts (file being imported)
- @services/ui/package.json (if package import error)

Focus on import resolution only.
```

#### Interface Errors
```
Additional Files:
- @services/ui/lib/[interface-file].ts (if shared interfaces)

Only files defining the problematic interfaces.
```

### ❌ **Never Request for TypeScript Errors:**
- All TypeScript files
- Entire lib/ directory
- Unrelated components
- Database files

## ⚡ **Emergency Error Resolution**

### Critical System Down
**AI Agent Must Request:**
```
Absolute Minimum:
- @[critical-error-file].ts

One file only until problem is identified.
```

**AI Agent Must Say:**
```
"System appears down. Provide only the file with the critical error.
Do not include any other files until we identify the exact problem."
```

### Production Issues
**AI Agent Must Request:**
```
Production Essentials:
- @railway.toml (deployment config)
- @services/ui/package.json (dependencies)

Minimal context for immediate diagnosis.
```

## 🔄 **Error Resolution Session Management**

### Start Error Resolution Session
**AI Agent Must Say:**
```
"Starting error resolution session.

Please close all non-error-related files and provide only:
- [Specific error files based on error type]

We'll focus exclusively on resolving this error."
```

### Error Resolution Complete
**AI Agent Must Say:**
```
"Error resolved successfully.

This error resolution session is complete. Please start a new chat session for your next development task.

For the new session, include:
- Task: [Next development goal]
- Files: [Relevant files for new task]
- Previous: Error fixed in [file]"
```

### Mid-Resolution Context Expansion
**AI Agent Must Say:**
```
"Need to expand context for this error.

Please also provide:
- @[additional-specific-file].ts

Keep other files closed - still focusing on error resolution only."
```

## 📊 **Error Context Templates**

### Template 1: Build Error
```
"Build error detected. Please provide:
- @services/ui/package.json
- @services/ui/tsconfig.json

Run: cd services/ui && npm run build
Share exact error output."
```

### Template 2: Runtime Error
```
"Runtime error detected. Please provide:
- @[failing-component].tsx

Share exact error from browser console.
No other files until error is identified."
```

### Template 3: TypeScript Error
```
"TypeScript error detected. Please provide:
- @[error-file].ts
- @services/ui/tsconfig.json

Share exact TypeScript error message.
Focus only on this type error."
```

### Template 4: Deployment Error
```
"Deployment error detected. Please provide:
- @railway.toml
- @services/ui/package.json

Share Railway deployment error logs.
Check if local build works first."
```

## 🎯 **Error Resolution Success Metrics**

### Context Efficiency
```
Build Errors: 2-3 files maximum
Runtime Errors: 1-3 files maximum  
TypeScript Errors: 2-4 files maximum
Deployment Errors: 2-3 files maximum
```

### Resolution Speed
```
Immediate context: Error-specific files only
Quick diagnosis: Minimal expansion
Focused solution: No irrelevant context
Clean handoff: Session reset after resolution
```

## ❌ **Common Error Resolution Mistakes**

### Avoid These Patterns
```
❌ Including entire directories during error resolution
❌ Loading unrelated components "just in case"
❌ Including planning documents during debugging
❌ Keeping feature development context during error fixing
❌ Loading multiple files before understanding the error
```

### Use These Patterns Instead
```
✅ Start with minimal error-specific context
✅ Expand context only when needed
✅ Focus on one error at a time
✅ Reset session after error resolution
✅ Keep error context separate from feature context
```

## 🚨 **Critical Error Guidelines**

### Production Down
1. **One file only** - the critical failing file
2. **No planning context** - focus on immediate fix
3. **Minimal expansion** - only add files as absolutely needed
4. **Quick resolution** - fix first, improve later

### Build Broken
1. **Configuration first** - package.json, tsconfig.json
2. **Error file only** - the specific failing file
3. **No feature files** - ignore unrelated development
4. **Test immediately** - verify fix works

### Data Loss Risk
1. **Database files only** - schema, migration, connection
2. **No UI context** - focus on data integrity
3. **Backup first** - ensure data safety
4. **Minimal changes** - surgical fixes only

---

**Remember**: Error resolution requires laser focus. Every additional file in context dilutes the debugging effectiveness and wastes tokens on irrelevant information. 