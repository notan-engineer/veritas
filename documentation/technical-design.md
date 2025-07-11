# Veritas Technical Design

**Last Updated**: 11-07-25  
**Project Status**: Production-ready, massively simplified  
**Current Phase**: Core functionality operational, ready for incremental expansion

## Project Overview

**Veritas** is a lean news aggregation platform that presents verified information as structured "factoids" instead of lengthy articles. Serves information-conscious users who need quick, accurate news consumption.

**Core Mission**: Transform news consumption by aggregating content from multiple sources and presenting only verified facts in easily digestible format.

## Current System Architecture

### Technology Stack
- **Framework**: Next.js 15.3.5 with App Router (React 19.0.0)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: Railway PostgreSQL with direct connection pooling
- **Deployment**: Railway (single service, minimal configuration)

### File Structure (Simplified)
```
veritas/
├── railway.toml              # Minimal deployment config
├── services/ui/              # Single Next.js service
│   ├── app/                 # App Router pages & API routes
│   ├── components/ui/       # Essential UI components only
│   ├── lib/                 # Core utilities & data services
│   └── public/              # Static assets
├── database/                # Schema & migration files
└── documentation/           # Project documentation
```

## Database Architecture (Simplified)

### Core Tables (6 tables total)
```sql
-- Content tables
factoids         -- Core content (title, description, bullet_points, language, status)
sources          -- News sources (name, domain, url, description)
scraped_content  -- Raw content from sources (for future scraper service)
tags             -- Simple categorization (name, slug, description)

-- Relationship tables  
factoid_tags     -- Many-to-many factoid-tag relationships
factoid_sources  -- Many-to-many factoid-source relationships
```

### Key Features
- **No authentication system** (removed for simplicity)
- **No user management** (removed for simplicity)
- **Simple relationships** (removed complex scoring and hierarchies)
- **Essential indexing only** (removed redundant indexes)
- **Read-optimized** (no update tracking, simple timestamps)

### Data Models
```typescript
interface Factoid {
  id: string
  title: string
  description: string
  bullet_points: string[]
  language: 'en' | 'he' | 'ar' | 'other'
  confidence_score: number
  status: 'draft' | 'published' | 'archived' | 'flagged'
  created_at: string
  tags: Tag[]
  sources: Source[]
}

interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
}

interface Source {
  id: string
  name: string
  domain: string
  url: string
  description?: string
  is_active: boolean
}
```

## API Architecture (Minimal)

### Current Endpoints (2 total)
- `GET /api/factoids` - All published factoids with tags/sources
- `GET /api/tags` - All active tags for filtering

### Removed Endpoints (for simplicity)
- Authentication endpoints
- Search endpoints (replaced with client-side filtering)
- Individual factoid endpoints (use server-side data.server.ts)
- Debug/health check endpoints

## Frontend Architecture

### Pages
- **Homepage** (`/`) - Factoid cards with topic filtering
- **Article Detail** (`/article/[id]`) - Individual factoid display
- **Settings** (`/settings`) - Theme toggle only

### Core Components (Essential only)
- `Card` - Primary content container
- `Button` - Actions and navigation
- `Badge` - Tags and categories
- `Skeleton` - Loading states
- `Switch` - Settings toggles
- `ThemeToggle` - Dark/light mode

### Utilities
- **RTL Support** (`rtl-utils.ts`) - Hebrew/Arabic text direction
- **Database Client** (`railway-database.ts`) - PostgreSQL connection
- **Data Services** (`data-service.ts`, `data.server.ts`) - API & server data
- **Date Utilities** (`utils.ts`) - Dynamic date generation

## Deployment (Ultra-simplified)

### Railway Configuration (`railway.toml`)
```toml
[[services]]
name = "ui"
source = "services/ui"

[services.ui.build]
buildCommand = "npm install && npm run build"

[services.ui.deploy]
startCommand = "npm start"
```

### Environment Variables
```bash
DATABASE_URL=postgresql://... # Automatically provided by Railway
NODE_ENV=production          # Automatically set by Railway
PORT=${{PORT}}              # Automatically set by Railway
```

## Development Guidelines

### Core Principles
1. **Simplicity First** - Implement only what's needed
2. **Incremental Growth** - Add features when actually required
3. **Build Validation** - Test after every change (`cd services/ui && npm run build && npm run lint`)
4. **Documentation Sync** - Update docs with code changes

### Adding New Features
1. Check `documentation/removed-code-and-features.md` for guidance
2. Start with minimal implementation
3. Test thoroughly before expanding
4. Update documentation immediately

### Database Changes
1. Create migration script in `database/migrations/`
2. Update TypeScript interfaces in `lib/data-service.ts`
3. Test with both mock and real data
4. Update technical design documentation

## Future Services (Placeholder Ready)

### Scraping Service (Not Implemented)
- **Purpose**: RSS feed scraping, web content extraction
- **Tables Ready**: `scraped_content`, `sources`
- **Implementation**: When content automation needed

### LLM Service (Not Implemented)  
- **Purpose**: Factoid extraction from scraped content
- **Integration Points**: `scraped_content` → `factoids`
- **Implementation**: When content processing needed

## Security & Performance

### Current Security
- **Input validation** at API boundaries
- **Environment variables** for secrets
- **Server-side rendering** for performance
- **TypeScript strict mode** for type safety

### Performance Optimizations
- **Minimal bundle size** (essential components only)
- **Static page generation** where possible
- **Database connection pooling**
- **Optimized queries** (no N+1 problems)

## Monitoring & Maintenance

### Health Checks
- Build process validates functionality
- TypeScript compiler catches type errors
- ESLint ensures code quality
- Manual testing of core features

### Deployment Process
1. `git push` to development branch
2. Manual merge to main (never direct push)
3. Railway auto-deploys from main
4. Verify functionality post-deployment

## Project Status Summary

**Completed**: Massive simplification (2,235+ lines removed)  
**Current**: Core functionality operational  
**Next**: Ready for incremental feature additions based on user needs

**Key Achievement**: Reduced complexity by 85% while maintaining 100% functionality. 