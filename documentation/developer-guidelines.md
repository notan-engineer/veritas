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
```bash
# ✅ Use terminal command to get current date (never hardcode dates)
# For planning documents (DD-MM-YY format):
Get-Date -Format "dd-MM-yy"

# For display purposes:
Get-Date -Format "MMMM dd, yyyy"  # "July 13, 2025"

# For short format:
Get-Date -Format "yyyy-MM-dd"     # "2025-07-13"
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
# ⚠️ UI Service - MUST run from services/ui directory
cd services/ui   
npm run build    # Must pass
npm run lint     # Must pass

# ⚠️ Scraper Service - MUST run from services/scraper directory  
cd services/scraper
npm run build    # Must pass
```

**PowerShell**: 
- UI: `cd services/ui; npm run build; npm run lint`
- Scraper: `cd services/scraper; npm run build`

**⚠️ Commands WILL FAIL if run from project root**

### Scraper Service Development

#### Build & Development Commands
```bash
# Development
cd services/scraper
npm run dev      # Development server with ts-node
npm run build    # TypeScript compilation to dist/
npm run start    # Production server from dist/
npm run clean    # Remove dist/ directory
```

#### Scraper Testing Workflow
1. **Local Development**: Test scraper endpoints using `/health` and `/api/status`
2. **Content Scraping**: Verify RSS feed parsing and article extraction
3. **Database Integration**: Confirm content storage and retrieval
4. **Error Handling**: Test error recovery and monitoring systems
5. **Resource Monitoring**: Check memory usage and cleanup operations
6. **Service Communication**: Test UI ↔ Scraper API integration

#### Monitoring & Debugging
- **Health Dashboard**: Use `/scraper` UI for real-time monitoring
- **Logs**: Check Railway logs for both services during development
- **Error Tracking**: Monitor error rates and recovery statistics
- **Performance**: Track job execution times and resource usage
- **Database**: Verify content insertion and source management

#### Adding New Scraper Features
1. **Source Management**: Add new RSS feeds via source manager
2. **Content Classification**: Enhance classification algorithms
3. **Error Handling**: Add new error categories and recovery strategies
4. **Monitoring**: Extend health checks and performance metrics
5. **Cleanup Policies**: Configure automated content management

### Manual Testing Checklist

#### UI Service Testing
- [ ] Homepage loads and displays factoids
- [ ] Topic filtering works
- [ ] Article detail pages load
- [ ] Settings page theme toggle works
- [ ] RTL languages display correctly
- [ ] Mobile responsive design

#### Scraper Service Testing
- [ ] Health endpoint returns comprehensive metrics
- [ ] Scraping jobs can be triggered and monitored
- [ ] Content feed displays scraped articles
- [ ] Source management CRUD operations work
- [ ] Real-time monitoring updates correctly
- [ ] Error handling and recovery functions properly

#### Integration Testing
- [ ] UI ↔ Scraper service communication works
- [ ] Shared database access functions correctly
- [ ] Fallback modes activate when services unavailable
- [ ] Environment variables configured properly

## Railway Infrastructure

### Railway Services
The project uses three Railway services:
- **UI Service**: Next.js application (main user interface)
- **Scraper Service**: Advanced Crawlee-based content aggregation
- **Database Service**: Shared PostgreSQL instance

### Service Management
```bash
# Connect to Railway project
railway link -p 32900e57-b721-494d-8e68-d15ac01e5c03

# View all services
railway status

# Deploy specific service
railway up --service ui
railway up --service scraper

# View logs for specific service
railway logs --service ui
railway logs --service scraper

# Access database
railway connect --service postgres
```

### Environment Variables
Each service has its own environment configuration:
- **UI Service**: `DATABASE_URL`, `SCRAPER_SERVICE_URL`, `NODE_ENV`, `PORT`
- **Scraper Service**: `DATABASE_URL`, `NODE_ENV`, `PORT`
- **Database Service**: Automatically configured by Railway

### Development Workflow
1. **Local Development**: Both services can run independently
2. **Database Access**: Both services share the same PostgreSQL instance  
3. **Service Communication**: UI calls Scraper via HTTP APIs
4. **Deployment**: Services deploy independently on Railway

**Reference**: See `documentation/railway-interface.md` for complete Railway CLI commands, service management, and deployment procedures (git-ignored, contains sensitive information).

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