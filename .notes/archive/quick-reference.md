# Quick Reference Guide

**Purpose**: Essential information for immediate AI agent reference without loading full documentation.

## 🔧 **Critical Build Commands**

### ⚠️ **ALWAYS from services/ui directory**
```bash
# Correct (ALWAYS use this)
cd services/ui && npm run build && npm run lint

# PowerShell
cd services/ui; npm run build; npm run lint

# ❌ NEVER from project root (will fail)
npm run build  # WRONG - causes errors
```

## 📁 **File Structure (Essential)**

```
veritas/
├── services/ui/           # Main Next.js app (ALWAYS cd here for builds)
│   ├── app/
│   │   ├── api/factoids/  # GET factoids endpoint
│   │   ├── api/tags/      # GET tags endpoint
│   │   ├── article/[id]/  # Article detail pages
│   │   └── page.tsx       # Homepage
│   ├── components/ui/     # Essential components only
│   └── lib/
│       ├── data-service.ts    # Client data functions
│       ├── data.server.ts     # Server data functions
│       └── railway-database.ts # DB connection
├── database/              # Schema & migrations
└── .notes/               # Token optimization guides
```

## 🗄️ **Database Quick Facts**

- **Tables**: 6 total (factoids, sources, scraped_content, tags, factoid_tags, factoid_sources)
- **Database**: Railway PostgreSQL
- **No Authentication**: Removed for simplicity
- **Schema**: @database/railway-schema.sql

## 🌐 **API Endpoints**

- `GET /api/factoids` - All published factoids with relationships
- `GET /api/tags` - All active tags for filtering

## 📱 **Pages**

- `/` - Homepage (factoid cards with filtering)
- `/article/[id]` - Article detail view
- `/settings` - Theme toggle only

## 🎨 **Components (Essential Only)**

- **UI**: Card, Button, Badge, Skeleton, Switch, ThemeToggle
- **Location**: @services/ui/components/ui/
- **Pattern**: shadcn/ui (Radix UI primitives)

## 📖 **Documentation References**

### Quick Links
- **Architecture**: @documentation/technical-design.md
- **Development**: @documentation/developer-guidelines.md  
- **Requirements**: @documentation/product-requirements.md
- **Optimization**: @.notes/ (all guides)

### Reference Pattern
```
✅ GOOD: "See @documentation/technical-design.md (Database section)"
❌ BAD: [Including entire document content]
```

## 🔄 **Git Workflow**

```bash
# ✅ Correct workflow
git checkout -b feature/description
# ... make changes ...
cd services/ui && npm run build && npm run lint  # CRITICAL
git add .
git commit -m "feat: description"
# Manual merge to main (never direct push)
```

## 🚨 **Common Errors & Solutions**

### Build Fails
```
Error: "Cannot find module..."
Solution: cd services/ui (build must run from UI directory)
```

### TypeScript Errors
```
Files to check: 
- @services/ui/tsconfig.json
- @services/ui/package.json
- @error-file.ts (specific error location)
```

### Context Issues
```
Too much context: Use @file.ts not @folder/
Session too long: Start new chat session
Too many tabs: Close unnecessary files
```

## ⚡ **Emergency Procedures**

### Quick Build Test
```bash
cd services/ui
npm run build
# If fails, check error file specifically
```

### Quick Context Reset
```bash
# In Cursor: Ctrl+Shift+P → "Close All Editors"
# Open only needed file: Ctrl+P → filename
```

### Quick Session Reset
```
New chat session with:
- Task: [Brief description]
- Files: @specific/file.ts
- Context: [Previous outcome]
```

## 💡 **Development Patterns**

### Component Pattern
```typescript
// ✅ Standard pattern
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>{data.title}</CardTitle></CardHeader>
      <CardContent>{/* content */}</CardContent>
    </Card>
  )
}
```

### Data Access Pattern
```typescript
// ✅ Server-side (pages/API routes)
import { getFactoidById } from '@/lib/data.server'

// ✅ Client-side (components)
import { getAllFactoids } from '@/lib/data-service'
```

### RTL Support Pattern
```typescript
import { getRTLClasses, getRTLContainerClasses } from "@/lib/rtl-utils"

<div className={getRTLContainerClasses(language)}>
  <h1 className={getRTLClasses(language)}>{title}</h1>
</div>
```

## 🎯 **Token Optimization Quick Reminders**

### Context Selection
```
✅ DO: @services/ui/app/page.tsx
❌ DON'T: @services/ui/app/
```

### Tab Management
```
✅ DO: Keep 3-5 relevant files open
❌ DON'T: 20+ files from multiple tasks
```

### Session Management
```
✅ DO: New session per task
❌ DON'T: Marathon sessions with context buildup
```

### Documentation Usage
```
✅ DO: Reference @docs, provide summary
❌ DON'T: Include entire documentation files
```

## 🔍 **Troubleshooting Quick Checks**

1. **Build Issues**: Are you in `services/ui` directory?
2. **Context Issues**: Are you using @file not @folder?
3. **Performance Issues**: Too many tabs open?
4. **Session Issues**: Is conversation too long?

---

**Remember**: This guide provides instant answers. For detailed information, reference the full documentation files. 