# Claude Code Automation Compatibility Guide

## Overview
This document establishes **mandatory requirements** for ensuring all scripts, utilities, and development workflows in the Veritas project are compatible with Claude Code's automation capabilities. Following these principles ensures Claude Code can execute tasks autonomously without hitting technical limitations.

**Core Principle**: Every utility script MUST support both interactive (human-friendly) and automated (Claude Code compatible) modes.

## Understanding Claude Code's Bash Tool

### Technical Architecture
Claude Code's Bash tool runs commands in a **non-interactive subprocess**. This architecture has specific capabilities and limitations that fundamentally shape how we design automation-friendly scripts.

### What Works ✅

**1. Heredocs and Pipes**
```bash
# Heredocs work perfectly
psql -U postgres veritas_local <<EOF
SELECT * FROM factoids LIMIT 5;
EOF

# Pipes work perfectly
echo "SELECT COUNT(*) FROM factoids;" | psql -U postgres veritas_local
```

**2. CLI Arguments and Flags**
```bash
# Command-line arguments work perfectly
./01-db-setup.sh --full-setup
./01-db-setup.sh -c  # Short flags also work
node utilities/02-db-clear.js --confirm
```

**3. Environment Variables**
```bash
# Environment variables work perfectly
DATABASE_URL="postgresql://..." ./import-data.sh
export RAILWAY_DATABASE_URL="postgresql://..."
node utilities/03-test-scraper.js
```

**4. Direct Database Connections**
```bash
# Direct connection strings work perfectly
psql "postgresql://user:pass@host:port/db" -c "SELECT NOW();"
pg_dump "postgresql://user:pass@host:port/db" > dump.sql
```

**5. Credential Files**
```bash
# ~/.pgpass file eliminates password prompts
# Format: hostname:port:database:username:password
localhost:5432:*:postgres:localdbpass

# Works with all PostgreSQL tools
createdb -U postgres veritas_local  # No password prompt!
psql -U postgres veritas_local      # No password prompt!
```

### What Doesn't Work ❌

**1. Interactive Prompts (read commands)**
```bash
# ❌ This will BLOCK forever in Claude Code
read -p "Enter database name: " DB_NAME
echo "You entered: $DB_NAME"
```

**2. Password Prompts**
```bash
# ❌ This will BLOCK forever in Claude Code
createdb -U postgres veritas_local  # Prompts for password
psql -U postgres                     # Prompts for password
sudo some-command                    # Prompts for password
```

**3. Interactive CLI Sessions**
```bash
# ❌ These will BLOCK in Claude Code
railway connect  # Opens interactive database session
psql            # Opens interactive prompt
mysql           # Opens interactive prompt
npm init        # Asks questions interactively
```

**4. Menu-Based Selection**
```bash
# ❌ This will BLOCK in Claude Code
echo "Select option:"
echo "1. Full setup"
echo "2. Create DB only"
read -p "Enter choice: " CHOICE
```

## Design Pattern: Dual-Mode Scripts

### The Golden Pattern
Every utility script MUST support both modes:

```bash
#!/bin/bash

# Check if arguments provided (automated mode) or no arguments (interactive mode)
if [ $# -eq 0 ]; then
    INTERACTIVE_MODE=true
else
    INTERACTIVE_MODE=false
fi

# Automated mode: Parse CLI arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full-setup) MODE="full"; shift ;;
            -c|--create-db) MODE="create"; shift ;;
            -h|--help) show_usage; exit 0 ;;
            *) echo "Unknown option: $1"; show_usage; exit 1 ;;
        esac
    done
}

# Interactive mode: Show menu and get user input
interactive_menu() {
    echo "=== Database Setup Tool ==="
    echo "1. Full setup"
    echo "2. Create database only"
    read -p "Select option: " choice
    # ... handle choice
}

# Main execution
if [ "$INTERACTIVE_MODE" = true ]; then
    interactive_menu
else
    parse_arguments "$@"
    # Execute based on parsed MODE
fi
```

### Real-World Example: 01-db-setup.sh

**Automated Mode (Claude Code Compatible):**
```bash
./01-db-setup.sh --full-setup      # Runs complete setup without prompts
./01-db-setup.sh -c                # Creates database only
./01-db-setup.sh --help            # Shows usage information
```

**Interactive Mode (Human-Friendly):**
```bash
./01-db-setup.sh                   # Shows menu, accepts user input

=== Veritas Database Setup & Import Tool ===
1. Full setup (create DB + import Railway data)
2. Create local database only
3. Export Railway data only
4. Import data from existing dump file
Select option (1-4):
```

## Credential Management

### PostgreSQL: ~/.pgpass File

**Purpose**: Eliminates password prompts for all PostgreSQL commands.

**Setup (One-Time):**
```bash
# Create file
cat > ~/.pgpass <<EOF
# PostgreSQL password file
# Format: hostname:port:database:username:password
localhost:5432:*:postgres:localdbpass
EOF

# Set permissions (CRITICAL - PostgreSQL will ignore file without this)
chmod 600 ~/.pgpass

# Test - should connect with NO password prompt
psql -U postgres -d postgres -c "SELECT version();"
```

**How It Works:**
- PostgreSQL automatically checks `~/.pgpass` before prompting
- Wildcards supported: `*` matches any database
- Multiple entries allowed for different hosts/databases
- **Security**: Only owner can read (600 permissions required)

**Veritas Configuration:**
```
localhost:5432:*:postgres:localdbpass
```

This single line eliminates prompts for:
- `createdb -U postgres veritas_local`
- `psql -U postgres veritas_local`
- `pg_dump -U postgres veritas_local`
- Any other local PostgreSQL operation

### Environment Variables: .env Files

**Purpose**: Store Railway credentials and configuration for automation.

**Setup (One-Time):**
```bash
# Create utilities/.env (NEVER commit this file!)
cat > utilities/.env <<EOF
# Railway Production Database URL
RAILWAY_DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:1234/railway

# Local PostgreSQL Configuration
LOCAL_DB_NAME=veritas_local
LOCAL_DB_USER=postgres
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
EOF
```

**Loading in Scripts:**
```bash
# Bash scripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Node.js scripts
require('dotenv').config({ path: path.join(__dirname, '.env') });
```

**Using in Automation:**
```bash
# Direct Railway connection (no interactive session needed)
pg_dump "$RAILWAY_DATABASE_URL" > railway-backup.sql

# Access individual variables
psql -h $LOCAL_DB_HOST -U $LOCAL_DB_USER -d $LOCAL_DB_NAME
```

## Direct Connections Instead of Interactive Sessions

### Problem: Interactive Railway Sessions
```bash
# ❌ This opens interactive session - BLOCKS in Claude Code
railway connect
# Now in psql prompt - Claude Code cannot send commands here
```

### Solution: Direct Connection Strings
```bash
# ✅ Direct connection with full URL - works in Claude Code
pg_dump "$RAILWAY_DATABASE_URL" > railway-backup.sql
psql "$RAILWAY_DATABASE_URL" -c "SELECT COUNT(*) FROM factoids;"
```

**Key Insight**: Replace `railway connect` + interactive commands with direct DATABASE_URL usage.

### Before (Interactive - Doesn't Work):
```bash
railway connect
# < blocked waiting for interactive psql >
\dt
SELECT * FROM factoids;
\q
```

### After (Direct - Works Perfectly):
```bash
# Load Railway URL from .env
source utilities/.env

# Direct export
pg_dump "$RAILWAY_DATABASE_URL" > dump.sql

# Direct query
psql "$RAILWAY_DATABASE_URL" -c "\dt"
psql "$RAILWAY_DATABASE_URL" -c "SELECT * FROM factoids LIMIT 5;"
```

## Mandatory Requirements Checklist

Every new utility script MUST satisfy these requirements:

### ✅ Dual-Mode Support
- [ ] Accepts CLI arguments for automated mode
- [ ] Shows interactive menu when no arguments provided
- [ ] Has `--help` flag showing all options
- [ ] Supports both long (`--option`) and short (`-o`) flags

### ✅ No Blocking Operations
- [ ] No `read` commands in automated mode
- [ ] No password prompts (uses .pgpass or .env)
- [ ] No interactive CLI sessions (uses direct connections)
- [ ] No menu selections in automated mode

### ✅ Credential Management
- [ ] Uses ~/.pgpass for PostgreSQL operations
- [ ] Uses .env file for Railway/external credentials
- [ ] Never hardcodes passwords
- [ ] Documents one-time credential setup

### ✅ Error Handling
- [ ] Validates required environment variables
- [ ] Checks for credential files existence
- [ ] Provides clear error messages
- [ ] Suggests fixes when credentials missing

### ✅ Documentation
- [ ] README shows both automated and interactive usage
- [ ] One-time setup steps documented
- [ ] Example commands for Claude Code included
- [ ] Troubleshooting section included

## Migration Guide: Making Existing Scripts Compatible

### Step 1: Identify Blocking Operations
```bash
# Search for blocking patterns
grep -r "read -p" utilities/
grep -r "railway connect" utilities/
grep -r "sudo" utilities/
```

### Step 2: Add CLI Argument Support
```bash
# Add argument parsing function
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --operation) OPERATION="$2"; shift 2 ;;
            --help) show_usage; exit 0 ;;
            *) echo "Unknown option: $1"; exit 1 ;;
        esac
    done
}
```

### Step 3: Set Up Credentials
```bash
# One-time: Create .pgpass
echo "localhost:5432:*:postgres:localdbpass" > ~/.pgpass
chmod 600 ~/.pgpass

# One-time: Create .env
cp utilities/.env.example utilities/.env
# Edit utilities/.env with real Railway URL
```

### Step 4: Replace Interactive Sessions
```bash
# Before (interactive)
railway connect
\dt
SELECT * FROM factoids;

# After (direct)
source utilities/.env
psql "$RAILWAY_DATABASE_URL" -c "\dt"
psql "$RAILWAY_DATABASE_URL" -c "SELECT * FROM factoids LIMIT 10;"
```

### Step 5: Add Dual-Mode Logic
```bash
# Main execution
if [ $# -eq 0 ]; then
    # Interactive mode
    show_menu
    read -p "Select option: " choice
    execute_choice "$choice"
else
    # Automated mode
    parse_arguments "$@"
    execute_automated "$OPERATION"
fi
```

## Testing Checklist

Before considering a script "automation-compatible", verify:

### Automated Mode Tests
```bash
# Test with flags
./script.sh --operation=test
./script.sh -o test

# Test help
./script.sh --help
./script.sh -h

# Test in non-interactive subprocess (simulates Claude Code)
echo "" | ./script.sh --operation=test  # Should complete without hanging
```

### Interactive Mode Tests
```bash
# Test menu display
./script.sh  # Should show menu

# Test user input
./script.sh  # Enter options manually, verify functionality
```

### Credential Tests
```bash
# Test without credentials
rm ~/.pgpass
./script.sh --operation=test  # Should show clear error message

# Test with credentials
./script.sh --operation=test  # Should run without password prompts
```

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Interactive-Only Scripts
```bash
#!/bin/bash
# This script ONLY works interactively
echo "Enter database name:"
read DB_NAME
createdb "$DB_NAME"  # Will prompt for password
```

**Why it fails**: No CLI arguments, password prompts, cannot be automated.

### ✅ Correct Pattern
```bash
#!/bin/bash
DB_NAME="${1:-}"  # Accept as argument

if [ -z "$DB_NAME" ]; then
    read -p "Enter database name: " DB_NAME
fi

createdb -U postgres "$DB_NAME"  # Uses .pgpass, no prompt
```

### ❌ Anti-Pattern 2: Hardcoded Credentials
```bash
#!/bin/bash
PASSWORD="secret123"
psql -U postgres -h localhost <<EOF
-- dangerous!
EOF
```

**Why it fails**: Security risk, not portable, credentials in code.

### ✅ Correct Pattern
```bash
#!/bin/bash
# Load from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Use .pgpass for local, DATABASE_URL for remote
psql "$DATABASE_URL" -c "SELECT NOW();"
```

### ❌ Anti-Pattern 3: Assuming Interactive Environment
```bash
#!/bin/bash
railway connect  # Opens interactive session
# Script continues assuming we're in psql
```

**Why it fails**: `railway connect` blocks in automation, subsequent commands never execute.

### ✅ Correct Pattern
```bash
#!/bin/bash
# Direct connection instead
pg_dump "$RAILWAY_DATABASE_URL" > backup.sql
psql "$RAILWAY_DATABASE_URL" -c "SELECT version();"
```

## Real-World Success Stories

### Case Study: 01-db-setup.sh

**Challenge**: Original PowerShell script was interactive-only, couldn't be automated by Claude Code.

**Solution Implemented**:
1. Added CLI argument parsing (`--full-setup`, `--create-db`, etc.)
2. Created `~/.pgpass` to eliminate password prompts
3. Created `utilities/.env` for Railway credentials
4. Replaced `railway connect` with direct `$RAILWAY_DATABASE_URL` usage
5. Maintained backward compatibility with interactive menu

**Results**:
- ✅ Claude Code can run: `./01-db-setup.sh --full-setup`
- ✅ Humans can still run: `./01-db-setup.sh` (shows menu)
- ✅ Zero password prompts in either mode
- ✅ Complete Railway export with single command

**Before (Interactive Only)**:
```bash
./01-db-setup.sh
# Shows menu
# User selects option 1
# Prompts for password
# Opens railway connect session
# User manually runs pg_dump in session
```

**After (Dual-Mode)**:
```bash
# Automated mode
./01-db-setup.sh --full-setup
# Completes entire workflow with zero prompts

# Interactive mode still works
./01-db-setup.sh
# Shows same menu as before
# All functionality preserved
```

## Quick Reference for Common Scenarios

### Database Operations
```bash
# Local PostgreSQL (uses ~/.pgpass)
createdb -U postgres veritas_local
psql -U postgres veritas_local -c "SELECT COUNT(*) FROM factoids;"
pg_dump -U postgres veritas_local > backup.sql

# Railway PostgreSQL (uses .env)
source utilities/.env
psql "$RAILWAY_DATABASE_URL" -c "SELECT NOW();"
pg_dump "$RAILWAY_DATABASE_URL" > railway-backup.sql
```

### Script Invocation
```bash
# Automated mode (Claude Code compatible)
./script.sh --operation=value
node script.js --confirm

# Interactive mode (human-friendly)
./script.sh
node script.js
```

### Testing Automation Compatibility
```bash
# Simulate non-interactive subprocess
echo "" | ./script.sh --operation=test

# Should complete without hanging
# Should not prompt for input
# Should use credential files automatically
```

## Additional Resources

- **Script Template**: [keystone/templates/automation-script-template.sh](templates/automation-script-template.sh)
- **Utility Creation**: [keystone/procedures/utility-creation.md](procedures/utility-creation.md)
- **Development Principles**: [keystone/development-principles.md](development-principles.md)
- **Local Testing**: [keystone/procedures/local-testing.md](procedures/local-testing.md)

## Summary

**Core Takeaways**:
1. **Dual-mode is mandatory** - Every script supports both automated and interactive usage
2. **Eliminate prompts** - Use .pgpass, .env files, and CLI arguments
3. **Direct connections** - Replace interactive sessions with direct DATABASE_URL usage
4. **Test thoroughly** - Verify scripts work in non-interactive subprocess
5. **Document clearly** - Show both usage modes in README files

By following these principles, we ensure Claude Code can execute any utility autonomously while maintaining human-friendly interactive modes for manual usage.
