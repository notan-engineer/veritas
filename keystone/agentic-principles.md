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

## 9. Utility Script Creation
When creating testing tools or utilities:
- **Location**: Always place in `utilities/` directory
- **Naming**: Use `XX-purpose.js` format (numbered by typical use order)
- **Consolidation**: Check for existing utilities before creating new ones
- **Documentation**: Include usage instructions in file header
- **README**: Update `utilities/README.md` with new tools

### When to Create New Utilities
- Repetitive testing tasks that could be automated
- Complex debugging workflows needing simplification
- Data manipulation or analysis tools
- Integration testing between services

### When to Use Existing Utilities
- Database setup: Use `01-db-setup.ps1`
- Data cleanup: Use `02-db-clear.js`
- API testing: Use `04-test-api.js`
- Log analysis: Use `06-test-logs.js`