# Keystone Framework - Agentic Principles

## 1. Surgical Context Selection
**ALWAYS use @file, NEVER use @folder**
```
✅ CORRECT: @services/ui/app/page.tsx
✅ CORRECT: @services/ui/lib/utils.ts:20-40
❌ WRONG: @services/ui/app/
❌ WRONG: @services/
```

### Context Guidelines
- Simple tasks: 2-3 files maximum
- Medium tasks: 4-5 files maximum
- Complex tasks: 5-7 files maximum
- 8+ files = Break into smaller tasks

### MCP-Enhanced Context Management
- **Leverage memory MCP** for retaining context across sessions
- **Use filesystem MCP** for scoped file access within project boundaries
- **Apply sequential-thinking MCP** for complex multi-step reasoning tasks
- **Employ git MCP** for sophisticated version control operations

## 2. Session Boundaries
**One Task = One Session**

### Mandatory Reset Triggers
- ✅ Task completed
- 🔄 Context switch (UI→API)
- ✅ Error resolved
- 📋 Planning complete → Implementation

### Session Handoff Template
```
New session context:
- Task: [Brief description]
- Files: @specific/file.ts
- Previous: [What was completed]
```

## 3. Tab Management
**Keep 3-5 files maximum open**

### Organization by Task Type
- UI work: component + utils + page
- API work: route + database + client  
- Debug work: error file + config only

### Cleanup Commands
```
Close all: Ctrl+Shift+P → "Close All Editors"
Close current: Ctrl+W
```

## 4. Documentation References
**Reference @docs, never include full content**

### Reference Patterns
```
Architecture: @documentation/technical-design.md (section)
Guidelines: @documentation/developer-guidelines.md (topic)
Never: Full document inclusion
```

### Quick Info Template
```
Topic: [Brief answer]
Details: See @documentation/[file].md
Section: [Specific section name]
```

## 5. Decision-Making Priorities
When choosing between options, prefer:
1. **Simpler solution** over complex solution
2. **Existing library** over custom implementation
3. **Configuration change** over code change
4. **Proven pattern** over experimental approach

## 6. Incremental Development
- Work in small iterations
- Test current state before changes
- Validate each step before proceeding
- Keep backup of original when making significant changes

## 7. AI-Readable Commenting
Use special comments for future AI understanding:
```typescript
// AI-PROMPT: "This handles authentication flow"
// AI-CONTEXT: "Called after user submits login form"
``` 

## 8. External Collaboration Support
When users need to work with external LLMs or get help outside this environment:
- Suggest using knowledge export scripts in `keystone/knowledge-export/`
- For requirements refinement: `export-requirements-refinement-context.js`
- For implementation planning: `export-planning-context.js`
- For general context: `export-general-context.js`
- Never include full project dumps in responses

## 9. Claude Code Shell Limitations & Automation Awareness

### Understanding the Bash Tool

Claude Code's Bash tool runs commands in a **non-interactive subprocess**. This has critical implications for automation.

#### ✅ What Works (Use These)
```bash
# CLI arguments work perfectly
./script.sh --full-setup
node utility.js --confirm

# Heredocs work perfectly
psql -U postgres dbname <<EOF
SELECT * FROM table;
EOF

# Environment variables work perfectly
DATABASE_URL="postgresql://..." ./script.sh

# Direct connections work perfectly
psql "$RAILWAY_DATABASE_URL" -c "SELECT NOW();"
```

#### ❌ What Doesn't Work (Avoid These)
```bash
# ❌ Interactive prompts BLOCK forever
read -p "Enter value: " VAR

# ❌ Password prompts BLOCK forever
createdb -U postgres dbname  # Prompts for password

# ❌ Interactive sessions BLOCK forever
railway connect  # Opens interactive psql session
psql               # Opens interactive prompt
```

### How to Request Tasks Effectively

**When asking Claude Code to run utilities:**

✅ **Good Requests:**
```
"Run the database setup with the full-setup flag"
"Execute the scraper test in automated mode"
"Clear the database using the confirm flag"
```

❌ **Bad Requests:**
```
"Run the database setup script" (might trigger interactive mode)
"Connect to Railway and export the data" (interactive session won't work)
"Create a database called test" (might prompt for password)
```

### Solution Patterns to Suggest

**If a script blocks:**
1. Check if it has CLI argument support: `./script.sh --help`
2. Look for automation mode flags: `--confirm`, `--operation`, etc.
3. Verify credential files exist: `~/.pgpass`, `utilities/.env`
4. Suggest direct connections instead of interactive sessions

**If credentials are needed:**
- Remind about one-time `.pgpass` setup for PostgreSQL
- Remind about `utilities/.env` for Railway/external services
- Point to [Claude Code Automation Compatibility](claude-code-compatibility.md)

### Best Practices for Claude Code

1. **Always use automated mode** when utilities support it
2. **Check `--help` first** to see available flags
3. **Prefer direct connections** over interactive sessions
4. **Use credential files** to eliminate prompts
5. **Test with `echo "" |`** to verify non-interactive compatibility

### Example Workflow

```bash
# ❌ Won't work: Interactive mode
./01-db-setup.sh
# < blocks waiting for menu selection >

# ✅ Works: Automated mode
./01-db-setup.sh --full-setup
# Completes entire workflow with zero prompts

# ❌ Won't work: Interactive session
railway connect
# < blocks in interactive psql >

# ✅ Works: Direct connection
source utilities/.env
pg_dump "$RAILWAY_DATABASE_URL" > railway-backup.sql
```

## 10. Utility Script Creation
When creating testing tools or utilities:
- **Location**: Always place in `utilities/` directory
- **Naming**: Use `XX-purpose.js` format (numbered by typical use order)
- **Consolidation**: Check for existing utilities before creating new ones
- **Documentation**: Include usage instructions in file header
- **README**: Update `utilities/README.md` with new tools
- **⚠️ MANDATORY: Claude Code Compatibility** - See [Claude Code Automation Compatibility](claude-code-compatibility.md)

### When to Create New Utilities
- Repetitive testing tasks that could be automated
- Complex debugging workflows needing simplification
- Data manipulation or analysis tools
- Integration testing between services

### When to Use Existing Utilities
- Database setup: Use `01-db-setup.sh --full-setup` (Mac/Linux) or `.\01-db-setup.ps1` (Windows)
- Data cleanup: Use `02-db-clear.js --confirm`
- API testing: Use `04-test-api.js`
- Log analysis: Use `06-test-logs.js <job-id>`

### Automation Requirements for All Utilities
**Every utility MUST support:**
1. CLI arguments for automated execution
2. Interactive mode when run without arguments
3. `--help` flag showing usage
4. No blocking operations (prompts, password requests, interactive sessions)
5. Credential file usage (.pgpass, .env)