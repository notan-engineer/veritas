# Keystone Framework - Development Principles

## 1. Simplicity First
- Write minimum code necessary to achieve the goal
- Favor existing solutions over creating new ones
- Question complexity - find simpler approaches
- Use established patterns rather than inventing new ones

## 2. Incremental Development
- Add features only when actually needed
- Start with minimal viable implementation
- Test thoroughly before expanding functionality
- Document changes immediately

## 3. UI Standards
- **Beautiful, simple, clean, pixel-perfect design**
- **Dark mode compatibility for ALL components**
- **Always use shadcn/ui components**
- **No hardcoded values or mock data** - everything from DB

### UI Component Pattern
```typescript
// ✅ Use shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ✅ Standard component pattern
interface ComponentProps {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  return (
    <Card className="dark:border-gray-800">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

## 4. Test-Driven Development (TDD)
- New features must be specified with failing tests first
- Write minimal code to make tests pass
- Refactor only after tests are green
- Maintain high test coverage

## 5. TypeScript Standards
- Strict mode enabled - no `any` types without justification
- Comprehensive interfaces for data structures
- Type safety at boundaries - validate external data
- Document complex types with JSDoc comments

## 6. Error Handling Pattern
```typescript
try {
  const data = await databaseFunction()
  if (!data) {
    throw new Error(`Data not found: ${id}`)
  }
  return data
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error(`Database error: ${error.message}`)
}
```

## 7. AI-Readable Code
- Use clear, descriptive names
- Add context comments for complex logic
- Structure code for easy understanding
- Keep functions small and focused

## 8. Data Display Patterns
- Use tables for lists of similar items (jobs, sources, etc.)
- Implement client-side sorting for better performance
- Add visual feedback for all user interactions
- Keep data dense but scannable
- Use tooltips for additional context without clutter

### Table UI Pattern
```typescript
// ✅ Sortable table with clear visual hierarchy
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="cursor-pointer" onClick={() => sort('column')}>
        Column {sortDirection === 'asc' ? '↑' : '↓'}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 9. Modal Interaction Pattern
- Use modals for focused user tasks
- Pre-select sensible defaults
- Validate input before submission
- Show clear feedback on success/error
- Close automatically on successful completion

## 10. Code Quality Checklist
- [ ] No hardcoded values or mock data
- [ ] All UI components support dark mode
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling throughout
- [ ] Tests written before implementation
- [ ] Tables used for data lists
- [ ] Client-side sorting implemented
- [ ] Modals for focused interactions

## 11. Testing & Utility Scripts

### Utility Script Standards
- **Location**: All utilities in `utilities/` directory
- **Naming**: `XX-purpose.{js,sh,ps1}` format (e.g., `01-db-setup.sh`, `03-test-scraper.js`)
- **Platform Support**: Provide both `.sh` (Mac/Linux) and `.ps1` (Windows) for shell scripts
- **Documentation**: Required header with usage instructions
- **Dependencies**: Minimal, use standard Node.js packages
- **⚠️ MANDATORY: Claude Code Automation Compatibility** - Every utility MUST support automated execution

### Claude Code Automation Requirements (MANDATORY)

**Every utility script MUST satisfy these requirements.** See [Claude Code Automation Compatibility](claude-code-compatibility.md) for comprehensive guide.

#### ✅ Required Features
1. **Dual-Mode Support**: Must work in both interactive (human) and automated (Claude Code) modes
2. **CLI Arguments**: Must accept flags/arguments for automated operation
3. **No Blocking Operations**: No `read` prompts, password prompts, or interactive sessions
4. **Credential Management**: Use `.pgpass` and `.env` files instead of prompts
5. **Help Flag**: Must implement `--help` flag showing usage

#### ❌ Anti-Patterns (FORBIDDEN)
```javascript
// ❌ FORBIDDEN: Interactive prompts in automated mode
const readline = require('readline');
rl.question('Enter value: ', callback);  // BLOCKS Claude Code

// ❌ FORBIDDEN: Password prompts
createdb -U postgres dbname  // BLOCKS waiting for password

// ❌ FORBIDDEN: Interactive CLI sessions
railway connect  // BLOCKS in interactive session
```

#### ✅ Correct Patterns (REQUIRED)
```javascript
// ✅ REQUIRED: Dual-mode support
const INTERACTIVE_MODE = process.argv.length <= 2;

if (INTERACTIVE_MODE) {
  // Interactive prompts allowed here
  const answer = await question('Enter value: ');
} else {
  // Automated mode - parse CLI arguments
  const value = parseArgs().value;
}
```

```bash
# ✅ REQUIRED: Credential files eliminate prompts
# One-time setup: ~/.pgpass
echo "localhost:5432:*:postgres:localdbpass" > ~/.pgpass
chmod 600 ~/.pgpass

# ✅ REQUIRED: Direct connections, no interactive sessions
pg_dump "$RAILWAY_DATABASE_URL" > dump.sql  # Direct connection
psql "$RAILWAY_DATABASE_URL" -c "SELECT NOW();"  # No interactive session
```

#### 📋 Pre-Commit Checklist
Before committing any utility script:
- [ ] Accepts CLI arguments for automated mode (`--operation`, `--confirm`, etc.)
- [ ] Shows interactive menu when run without arguments
- [ ] Has `--help` flag with usage examples
- [ ] Uses `.pgpass` for PostgreSQL operations (no password prompts)
- [ ] Uses `.env` file for Railway/external credentials
- [ ] Tested in non-interactive subprocess: `echo "" | ./script.sh --flag`
- [ ] No blocking operations (`read`, password prompts, interactive sessions)
- [ ] Error messages suggest credential setup if files missing

### Creating New Utilities
```javascript
#!/usr/bin/env node

/**
 * [Tool Name]
 * [Brief description]
 * Usage: node XX-purpose.js [args]
 */

// Standard imports
const { Pool } = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

// Tool implementation
async function main() {
  // Implementation
}

// Execute with error handling
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

### Consolidation Principles
- Combine redundant functionality into single utilities
- Prefer configuration options over multiple similar scripts
- Use clear, descriptive names that indicate purpose
- Maintain backwards compatibility when consolidating 