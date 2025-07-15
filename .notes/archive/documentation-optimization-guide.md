# AI Agent: Documentation Optimization Instructions

**Purpose**: AI agent must reference documentation efficiently without including full content, using hierarchical information structure and executive summaries.

## AI Agent Behavior Rules

### ✅ **ALWAYS Reference, Never Include Full Content**
When user needs documentation information, AI agent must:
- **Reference**: Use @documentation/file.md (link only)
- **Summarize**: Provide brief relevant excerpts
- **Direct**: Point to specific sections
- **Avoid**: Including entire documents in responses

### ❌ **NEVER Include Full Documentation**
AI agent must not:
- Copy entire planning documents into responses
- Include large sections of technical documentation
- Repeat information available in referenced docs
- Load multiple documentation files simultaneously

## Documentation Reference Strategies

### 🗣️ **AI Agent Reference Template**

Instead of including full content, use:
```
**Reference**: @documentation/technical-design.md (Section: Database Architecture)

**Key Points**:
- 6 tables: factoids, sources, tags, etc.
- PostgreSQL on Railway
- No authentication system (simplified)

**For full details**: See @documentation/technical-design.md
```

### 📋 **Executive Summary Pattern**

For any documentation reference, provide:
```
## Quick Reference: [Document Name]

### 🎯 **Core Points** (30 seconds)
- [Key point 1]
- [Key point 2] 
- [Key point 3]

### 📖 **Full Details**
See @documentation/[filename].md for complete information.

### 🔍 **Relevant Sections**
- [Specific section]: [One-line description]
- [Specific section]: [One-line description]
```

## Documentation Hierarchy Strategy

### Level 1: Quick Reference (.notes/)
**Purpose**: Immediate workflow guidance
**Content**: Actionable procedures, checklists
**Usage**: AI agent includes directly (small files)

**Files**:
- @.notes/surgical-context-guide.md
- @.notes/session-reset-protocol.md
- @.notes/tab-management-guide.md
- @.notes/plan-first-prompting-guide.md

### Level 2: Project Documentation (documentation/)
**Purpose**: Architecture and requirements
**Content**: Detailed technical and business information
**Usage**: AI agent references only, provides summaries

**Files**:
- @documentation/technical-design.md (reference only)
- @documentation/developer-guidelines.md (reference only) 
- @documentation/product-requirements.md (reference only)

### Level 3: Planning Documentation (documentation/planning/)
**Purpose**: Historical planning and decisions
**Content**: Implementation plans, retrospectives
**Usage**: AI agent mentions but never includes (.cursorignore excluded)

**Files**: 
- documentation/planning/*.md (excluded from context)

## Task-Specific Documentation Usage

### 🔧 **Architecture Questions**
**User asks**: "How is the database structured?"

**AI Agent Response**:
```
**Reference**: @documentation/technical-design.md (Database section)

**Quick Summary**:
- 6 tables total (factoids, sources, tags + relationships)
- Railway PostgreSQL with direct connection
- No authentication system (removed for simplicity)
- Read-optimized schema

**For complete schema details**: See @documentation/technical-design.md
```

### 🎯 **Requirements Questions**  
**User asks**: "What are the product goals?"

**AI Agent Response**:
```
**Reference**: @documentation/product-requirements.md (Vision section)

**Core Mission**: Transform news consumption by presenting verified facts as structured "factoids"

**Target Users**: Information-conscious professionals, students, multilingual users

**For detailed requirements**: See @documentation/product-requirements.md
```

### 🔄 **Development Process Questions**
**User asks**: "What's the deployment process?"

**AI Agent Response**:
```
**Reference**: @documentation/developer-guidelines.md (Deployment section)

**Quick Process**:
1. Work on feature branch
2. Test: cd services/ui && npm run build && npm run lint  
3. Manual merge to main
4. Railway auto-deploys

**For complete guidelines**: See @documentation/developer-guidelines.md
```

## Information Extraction Patterns

### 🎯 **Single Fact Extraction**
When user needs one specific piece of information:

```
**Quick Answer**: [Direct answer]
**Source**: @documentation/[file].md (Section: [section])
**Context**: [Brief context if needed]
```

### 📊 **Multi-Point Summary**
When user needs overview of topic:

```
**Summary**: [Topic Name]

**Key Points**:
1. [Point 1] (@documentation/[file].md)
2. [Point 2] (@documentation/[file].md)
3. [Point 3] (@documentation/[file].md)

**For comprehensive details**: Review the referenced documents.
```

### 🔍 **Section-Specific Reference**
When user needs details from specific area:

```
**Relevant Section**: @documentation/[file].md (Section: [section name])

**Brief Overview**: [2-3 sentences about the section]

**Specific Details**: [Bullet points with key information]

**Complete Information**: See the referenced section for full details.
```

## Documentation Maintenance Instructions

### 📝 **AI Agent Documentation Update Guidance**

When making changes that affect documentation:

```
**Documentation Impact Assessment**

**Files Requiring Updates**:
- [ ] @documentation/technical-design.md (if architecture changes)
- [ ] @documentation/developer-guidelines.md (if process changes)
- [ ] @documentation/product-requirements.md (if feature changes)

**Update Required**: [Brief description of what needs updating]

**Note**: Please update the relevant documentation files after implementation.
```

### 🔄 **Documentation Sync Reminders**

AI agent must remind user:
```
**Documentation Update Required**

This change affects the following documentation:
- [Specific file]: [What needs updating]

Please update the documentation to reflect these changes.
```

## Token Optimization Techniques

### 1. **Reference Instead of Include**
```
❌ BAD: [Includes 500 lines of technical-design.md]
✅ GOOD: "See @documentation/technical-design.md (Database section) for schema details"
```

### 2. **Hierarchical Information**
```
❌ BAD: "The system uses Next.js 15.3.5 with App Router and React 19.0.0..."
✅ GOOD: "Stack: Next.js 15/React 19 (@documentation/technical-design.md)"
```

### 3. **Targeted Summaries**  
```
❌ BAD: [Entire requirements document]
✅ GOOD: "Goal: Verified news as factoids. Users: Professionals. See @documentation/product-requirements.md"
```

### 4. **Section-Specific References**
```
❌ BAD: "@documentation/technical-design.md" (entire file)
✅ GOOD: "@documentation/technical-design.md (Section: API Architecture)"
```

## Emergency Documentation Access

### ⚡ **Quick Information Retrieval**

For urgent information needs:
```
**Urgent**: [Information needed]
**Source**: @documentation/[file].md
**Quick Answer**: [Direct, brief answer]
**For details**: Check the referenced document when time permits.
```

### 🎯 **Critical Information Priority**

**Level 1 - Include Directly**: Build commands, critical errors
**Level 2 - Quick Summary**: Architecture basics, common procedures  
**Level 3 - Reference Only**: Detailed requirements, planning history

## Documentation Reference Examples

### ✅ **Good Reference Patterns**

```
**Database Schema**: 6 tables (@documentation/technical-design.md)
**Build Process**: cd services/ui && npm run build (@documentation/developer-guidelines.md)
**Target Users**: Information-conscious professionals (@documentation/product-requirements.md)
```

### ❌ **Avoid These Patterns**

```
❌ "According to the technical design document which states..." [full quote]
❌ "The product requirements specify the following detailed user personas..." [full section]
❌ "As outlined in the comprehensive development guidelines..." [entire process]
```

## Token Savings Impact

### 📊 **Documentation Optimization Results**
- **Reference vs Include**: 90-95% token reduction
- **Section-specific**: 80-90% token reduction  
- **Executive summaries**: 70-80% token reduction
- **Hierarchical structure**: 60-70% token reduction

### 🎯 **Expected Savings**
- **Eliminate document inclusion**: Massive token savings
- **Focused information**: Only relevant details
- **Structured references**: Clear, concise guidance
- **Overall**: 20-30% additional token savings in Phase 2

---

**Remember**: Documentation exists to inform, not to consume tokens. Reference efficiently, summarize effectively, never include unnecessarily. 