# Veritas Developer Guidelines

**Last Updated**: 11-07-25  
**Project Status**: Maximally simplified, production-ready  
**For**: Human developers and AI coding agents

## Project Context

**Veritas** is a lean news aggregation platform presenting verified information as structured "factoids". Current system is **maximally simplified** (85% complexity reduction completed) while maintaining 100% functionality.

## Core Development Principles

### 1. Simplicity First
- Write minimum code necessary to achieve the goal
- Favor existing solutions over creating new ones
- Question complexity - if something seems complex, find a simpler approach
- Use established patterns rather than inventing new ones

### 2. Incremental Development
- Add features only when actually needed
- Start with minimal viable implementation
- Test thoroughly before expanding functionality
- Document changes immediately

### 3. Build Validation ⚠️ CRITICAL
- **ALWAYS run from `services/ui` directory - builds FAIL from project root**
- Required: `cd services/ui && npm run build && npm run lint` must pass
- Test after every significant change
- Manual testing of changed functionality  
- No commits without successful builds

## Current System Architecture

### Technology Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui components
- **Database**: Railway PostgreSQL
- **Deployment**: Railway (minimal config)

### File Structure
```
veritas/
├── railway.toml              # Deployment config (7 lines)
├── services/ui/              # Main application
│   ├── app/                 # Pages & API routes
│   │   ├── api/factoids/    # GET factoids endpoint
│   │   ├── api/tags/        # GET tags endpoint
│   │   ├── article/[id]/    # Article detail pages
│   │   ├── settings/        # Settings page
│   │   ├── page.tsx         # Homepage
│   │   └── layout.tsx       # Root layout
│   ├── components/ui/       # Essential components only
│   │   ├── card.tsx         # Content containers
│   │   ├── button.tsx       # Actions
│   │   ├── badge.tsx        # Tags
│   │   ├── skeleton.tsx     # Loading states
│   │   ├── switch.tsx       # Toggles
│   │   └── theme-toggle.tsx # Dark/light mode
│   └── lib/                 # Core utilities
│       ├── data-service.ts  # Client data functions
│       ├── data.server.ts   # Server data functions
│       ├── railway-database.ts # DB connection
│       ├── rtl-utils.ts     # Hebrew/Arabic support
│       ├── mock-data.ts     # Development data
│       └── utils.ts         # Date utilities, CSS helpers
└── documentation/           # All project docs
```

## Database Guidelines

### Current Schema (6 tables)
```sql
factoids         -- Core content
sources          -- News sources  
scraped_content  -- Raw content (future scraper)
tags             -- Simple categorization
factoid_tags     -- Factoid-tag relationships
factoid_sources  -- Factoid-source relationships
```

### Database Changes
1. **Create migration script** in `database/migrations/`
2. **Update TypeScript interfaces** in affected files
3. **Test with development data** before production
4. **Update documentation** immediately

### Data Access Patterns
```typescript
// ✅ Server-side (in pages/API routes)
import { getFactoidById } from '@/lib/data.server'
const factoid = await getFactoidById(id)

// ✅ Client-side (in components)
import { getAllFactoids } from '@/lib/data-service'
const factoids = await getAllFactoids()

// ❌ Avoid: Direct database access in components
```

## API Development

### Current Endpoints (2 only)
- `GET /api/factoids` - All published factoids with relationships
- `GET /api/tags` - All active tags

### Adding New Endpoints
1. **Validate necessity** - Can existing endpoints serve the need?
2. **Start minimal** - Basic functionality first
3. **Follow pattern**:
```typescript
export async function GET() {
  try {
    const data = await databaseFunction()
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Frontend Development

### Component Guidelines
```typescript
// ✅ Use existing shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ✅ Standard component pattern
interface ComponentProps {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  return (
    <Card>
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

### RTL Support (Required)
```typescript
import { getRTLClasses, getRTLContainerClasses } from "@/lib/rtl-utils"

<div className={getRTLContainerClasses(language)}>
  <h1 className={getRTLClasses(language)}>{title}</h1>
</div>
```

### Date Handling
```typescript
import { getFormattedDate } from "@/lib/utils"

// ✅ Use dynamic dates
const date = getFormattedDate('display') // "July 11, 2025"
const shortDate = getFormattedDate('short') // "2025-07-11"
```

## Branching & Workflow

### Absolute Rules
- **NEVER push directly to main**
- **Always create feature branches**: `git checkout -b feature/description`
- **Test thoroughly** before requesting merge
- **Update documentation** in same branch as code changes
- **Manual merge only** by project maintainer

### Branch Naming
```
feature/short-description     # New features
fix/bug-description          # Bug fixes
refactor/area-description    # Code refactoring
docs/section-update          # Documentation updates
```

## Documentation Requirements

### CRITICAL: Update these files with every relevant commit
1. **`technical-design.md`** - When architecture/database changes
2. **`developer-guidelines.md`** - When development practices change
3. **`product-requirements.md`** - When features/UX changes

### Documentation Standards
- **Keep concise** - Remove outdated content immediately
- **LLM-optimized** - Clear, structured for AI comprehension
- **Self-updating** - Include current status and next steps
- **Date accuracy** - Use dynamic dates from `utils.ts`

## Testing & Quality

### Required Validation ⚠️ CRITICAL
```bash
# ⚠️ MUST run from services/ui directory - NEVER from project root
cd services/ui   
npm run build    # Must pass
npm run lint     # Must pass
```

**PowerShell**: `cd services/ui; npm run build; npm run lint`
**⚠️ Commands WILL FAIL if run from project root**

### Manual Testing Checklist
- [ ] Homepage loads and displays factoids
- [ ] Topic filtering works
- [ ] Article detail pages load
- [ ] Settings page theme toggle works
- [ ] RTL languages display correctly
- [ ] Mobile responsive design

## Railway Infrastructure

### Railway Services
The project uses three Railway services:
- **UI Service**: Next.js application
- **Scraper Service**: Crawlee-based content scraping  
- **Database Service**: PostgreSQL instance

**Reference**: See `documentation/railway-interface.md` for complete Railway CLI commands, service management, deployment procedures, and troubleshooting. This file is git-ignored and contains sensitive project information.

## Deployment

### Process
1. **Development**: Work on feature branch
2. **Testing**: Validate builds and functionality (`cd services/ui && npm run build && npm run lint`)
3. **Merge**: Manual merge to main branch
4. **Deploy**: Railway auto-deploys from main
5. **Verify**: Check production functionality

### Configuration
- **Railway.toml**: 7 lines only (ultra-minimal)
- **Environment**: Automatically managed by Railway
- **Database**: Railway PostgreSQL (no manual setup)

## Adding Removed Features

### Reference Guide
See `documentation/removed-code-and-features.md` for:
- **Authentication system** - JWT-based when needed
- **Search functionality** - Start simple, upgrade gradually
- **User interactions** - Like/dislike/comment system
- **Advanced validation** - Per-form as needed
- **Development tools** - Specific scripts when team grows

### Implementation Approach
1. **Check removed features doc** for lessons learned
2. **Start with minimal version** 
3. **Test thoroughly** at each step
4. **Document new additions** immediately

## AI Agent Guidelines

### For LLM Developers
- **Read current docs first** - System is maximally simplified
- **Follow incremental approach** - Small, testable changes
- **Validate builds constantly** - Test after each change
- **Update docs immediately** - Keep documentation current
- **Use existing patterns** - Don't reinvent solutions

### Common Tasks
- **Adding new factoids**: Use mock data patterns in `lib/mock-data.ts`
- **New UI components**: Follow shadcn/ui patterns
- **Database changes**: Create migration scripts first
- **API endpoints**: Follow existing minimal patterns

## Project Status

**Current State**: Core functionality operational, ready for growth  
**Complexity**: Reduced by 85% (2,235+ lines removed)  
**Next Phase**: Incremental feature additions based on user needs

**Key Insight**: Start minimal, add incrementally, test thoroughly, document everything. 