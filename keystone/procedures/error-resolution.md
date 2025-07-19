# Error Resolution Procedure

## Build Errors

### Context Selection
```
Context: @services/ui/package.json, @services/ui/tsconfig.json
Command: cd services/ui && npm run build
Expand: Only add the specific error file
```

### Resolution Steps
1. [ ] Start with minimal context (package.json, tsconfig.json)
2. [ ] Run build to see specific error
3. [ ] Add ONLY the file mentioned in error
4. [ ] Fix the specific issue
5. [ ] Re-run build to verify
6. [ ] Complete → Start new session

## Runtime Errors

### Context Selection
```
Context: @[error-component].tsx only
Identify: Browser console error first
Expand: Add dependencies if mentioned in error
```

### Resolution Steps
1. [ ] Check browser console for error details
2. [ ] Request only the component with error
3. [ ] Look for obvious issues (undefined, null references)
4. [ ] Test fix in browser
5. [ ] Verify no new errors introduced

## TypeScript Errors

### Context Selection
```
Context: @[error-file].ts, @services/ui/tsconfig.json
Focus: Specific type error only
Fix: Update types or imports
```

### Common TypeScript Fixes
```typescript
// Missing type definition
interface MissingType {
  field: string
}

// Type assertion when needed
const value = data as ExpectedType

// Optional chaining for nullable values
const result = object?.property?.nested

// Non-null assertion (use sparingly)
const definitelyExists = value!
```

## Common Error Patterns

### Import Errors
- **Module not found**: Check file path and extension
- **Cannot find module**: Run `npm install` if package missing
- **Circular dependency**: Restructure imports

### Build Command Errors
```bash
# ALWAYS from services/ui directory
cd services/ui
npm run build

# If package issues
npm install
npm run build
```

### API/Database Errors
- **Connection refused**: Check DATABASE_URL
- **CORS error**: Verify API route configuration
- **404 Not Found**: Check route file location/naming

## Emergency Procedures

### Production Down
```
Context: ONE file only - critical failure point
Action: Surgical fix, no exploration
Deploy: Fix first, improve later
Reset: New session after fix
```

### Build Completely Broken
```
Start: cd services/ui && npm run build
Context: @package.json, @tsconfig.json only
Expand: Add specific error file only
Fix: Resolve immediate issue
```

## Resolution Checklist
- [ ] Identify specific error message
- [ ] Start with minimal context
- [ ] Fix only the immediate issue
- [ ] Test the fix works
- [ ] Don't expand scope during debugging
- [ ] Complete → New session 