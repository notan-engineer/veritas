# Utility Creation Procedure

## Overview
Guidelines for creating testing utilities, debugging tools, and automation scripts.

## Quick Checklist
- [ ] Check if utility already exists in `utilities/`
- [ ] Use numbered naming convention: `XX-purpose.js`
- [ ] Include comprehensive header documentation
- [ ] Support both interactive and non-interactive modes
- [ ] Update `utilities/README.md` with new tool
- [ ] Test on both Windows and Unix systems

## Utility Structure Template

### Standard JavaScript Utility
```javascript
#!/usr/bin/env node

/**
 * [Tool Name]
 * [Detailed description of what the tool does]
 * Usage: node XX-purpose.js [arguments] [options]
 * 
 * Arguments:
 *   arg1 - Description of first argument
 *   arg2 - Description of second argument (optional)
 * 
 * Options:
 *   --option1 - Description of option
 *   --option2=value - Description of option with value
 * 
 * Examples:
 *   node XX-purpose.js arg1
 *   node XX-purpose.js arg1 arg2 --option1
 */

// Dependencies (minimal)
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../services/scraper/.env') });

// Configuration
const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local',
  defaultValue: process.argv[2] || 'default'
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Parse command line arguments
function parseArgs() {
  const args = {
    // Parse arguments and options
  };
  return args;
}

// Main functionality
async function main() {
  const args = parseArgs();
  
  // Validate inputs
  if (!args.required) {
    log('Usage: node XX-purpose.js <required> [optional]', 'yellow');
    process.exit(1);
  }
  
  try {
    // Tool implementation
    log('Starting...', 'cyan');
    
    // Do work here
    
    log('✓ Complete!', 'green');
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Execute with error handling
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
```

### PowerShell Utility Template
```powershell
<#
.SYNOPSIS
    Brief description of what the script does
.DESCRIPTION
    Detailed description of functionality
.PARAMETER Parameter1
    Description of parameter
.EXAMPLE
    .\XX-purpose.ps1 -Parameter1 value
#>

param(
    [string]$Parameter1,
    [switch]$Option1
)

Write-Host "Script Name" -ForegroundColor Green
Write-Host "===========" -ForegroundColor Green

# Implementation
try {
    # Script logic
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
```

## Naming Convention

### Number Assignment Rules
- `01-09`: Core setup and configuration utilities
- `10-19`: Testing and validation tools  
- `20-29`: Data manipulation utilities
- `30-39`: Analysis and reporting tools
- `40-49`: Integration and deployment utilities
- `50+`: Project-specific utilities

### Current Utilities Reference
- `01-db-setup.ps1` - Database setup and import
- `02-db-clear.js` - Data cleanup utility
- `03-test-scraper.js` - Scraper testing
- `04-test-api.js` - API test server
- `05-test-db-mapping.js` - Field mapping verification
- `06-test-logs.js` - Log analysis tool

## Consolidation Guidelines

### When to Consolidate
- Multiple scripts with similar functionality exist
- Scripts share significant code
- User workflow requires running multiple scripts
- Maintenance burden of separate scripts is high

### How to Consolidate
1. Identify common functionality
2. Create unified interface with options/modes
3. Preserve backwards compatibility if possible
4. Document migration path for users
5. Update all references in documentation

### Example Consolidation
```javascript
// Before: test-server.js, simple-api.js, mock-api.js
// After: 04-test-api.js with configuration options

const mode = process.argv[2] || 'full';
switch(mode) {
  case 'simple': runSimpleServer(); break;
  case 'mock': runMockServer(); break;
  default: runFullServer();
}
```

## Documentation Requirements

### In-File Documentation
- Purpose and description
- Usage syntax with examples
- All arguments and options explained
- Environment variables used
- Dependencies required
- Error conditions and troubleshooting

### README Updates
Update `utilities/README.md` with:
- Entry in quick reference table
- Detailed section if complex utility
- Common workflows using the utility
- Integration with other tools

### Procedure Updates
Update relevant procedures in `keystone/procedures/`:
- Reference new utility where applicable
- Update testing workflows
- Add to troubleshooting sections

## Testing Requirements

### Cross-Platform Testing
- Test on Windows (PowerShell/CMD)
- Test on Unix/Linux (bash)
- Handle path separators correctly
- Use platform-agnostic approaches

### Error Handling
- Validate all inputs
- Provide helpful error messages
- Exit with appropriate codes (0=success, 1=error)
- Handle missing dependencies gracefully

### Interactive vs Non-Interactive
- Support command-line arguments for automation
- Provide interactive prompts for user-friendly mode
- Document both modes clearly

## Common Patterns

### Database Connection
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://...'
});

// Always close pool on exit
process.on('exit', () => pool.end());
```

### Configuration Options
```javascript
const config = {
  // Defaults
  port: 3001,
  limit: 50,
  
  // Override from environment
  ...process.env,
  
  // Override from arguments
  port: process.argv[2] || config.port
};
```

### Progress Indication
```javascript
// For long-running operations
process.stdout.write('Processing');
const interval = setInterval(() => {
  process.stdout.write('.');
}, 1000);

// When complete
clearInterval(interval);
console.log(' Done!');
```

## Security Considerations
- Never hardcode credentials
- Use environment variables for sensitive data
- Validate and sanitize all inputs
- Don't expose internal errors to users
- Add confirmation prompts for destructive operations

## Maintenance
- Keep utilities focused on single purpose
- Regularly review for consolidation opportunities
- Update when APIs or schemas change
- Remove obsolete utilities
- Keep documentation current