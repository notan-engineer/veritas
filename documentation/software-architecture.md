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
- **Deployment**: Railway (three-service architecture)

### Service Architecture
```
veritas/
├── services/ui/              # Next.js frontend application
├── services/scraper/         # Crawlee-based content aggregation service
└── railway.toml              # Multi-service deployment config
```

**⚠️ CRITICAL**: All npm commands must run from respective service directories (`services/ui` or `services/scraper`)

### Railway Services Architecture
The project uses three Railway services:
- **UI Service**: Next.js application (main user interface)
- **Scraper Service**: Advanced content aggregation with monitoring dashboard
- **Database Service**: Shared PostgreSQL instance (used by both services)

**Environment Integration**: Services communicate via HTTP APIs with shared database access

### File Structure (Ultra-Simplified)
```
veritas/
├── railway.toml              # Deployment config (7 lines only)
├── services/ui/              # Next.js frontend service
│   ├── app/                 # App Router (2 API routes, 3 pages)
│   ├── components/ui/       # 9 essential components (includes Table, Tooltip, ScrollbarManager)
│   ├── lib/                 # 5 core utilities (data, dates, RTL)
│   └── public/              # Static assets only
├── services/scraper/         # Crawlee-based content aggregation service
│   ├── src/                 # TypeScript source files
│   └── package.json         # Crawlee, Playwright, Express dependencies
├── database/                # Schema file + migrations (includes enum types)
└── documentation/           # 4 core docs + planning/
```

**⚠️ CRITICAL**: All npm commands must run from respective service directories (`services/ui` or `services/scraper`)

## Database Architecture (Complete)

### Core Tables (8 tables total)
```sql
-- Content tables
factoids                -- Core content (title, description, bullet_points, language, status)
sources                 -- News sources (name, domain, rss_url, icons, scraping config)
scraped_content         -- Raw content from sources with compression, metadata, and job linking
scraped_content_archive -- Archive of old scraped content for storage management
tags                    -- Simple categorization (name, slug, description)

-- Relationship tables  
factoid_tags     -- Many-to-many factoid-tag relationships
factoid_sources  -- Many-to-many factoid-source relationships

-- Job-Content relationships
-- scraped_content.job_id -> scraping_jobs.id (foreign key for content traceability)

-- Scraper service tables
scraping_jobs    -- Job tracking with enum status (new, in-progress, successful, partial, failed)
scraping_logs    -- Enhanced structured logging with JSONB data for comprehensive monitoring
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

## API Architecture (Comprehensive)

### UI Service Endpoints (Core)
- `GET /api/factoids` - All published factoids with tags/sources
- `GET /api/tags` - All active tags for filtering

### Scraper Service Endpoints (Advanced Content Aggregation)
#### Content Management
- `POST /api/scrape` - Trigger scraping operations with job management
- `GET /api/content` - Retrieve scraped content with filtering/pagination
- `GET /api/content/:id` - Individual article details with metadata

#### Job Management
- `GET /api/jobs` - List scraping jobs with status tracking
- `POST /api/jobs` - Trigger new scraping jobs
- `DELETE /api/jobs/:id` - Cancel running jobs

#### Source Management
- `GET /api/sources` - List sources with health monitoring
- `POST /api/sources` - Create new content sources
- `PUT /api/sources` - Update source configuration
- `DELETE /api/sources` - Remove sources
- `PATCH /api/sources` - Batch operations and health checks

#### Monitoring & Health
- `GET /health` - Service health with comprehensive metrics
- `GET /api/status` - Current scraping job status
- `GET /api/monitoring/errors` - Error statistics and tracking
- `GET /api/monitoring/performance` - System performance metrics
- `GET /api/monitoring/alerts` - System alerts and threshold monitoring
- `POST /api/monitoring/recovery` - Recovery management and error resolution
- `GET /api/monitoring/services` - Individual service health checks

#### Cleanup & Maintenance
- `POST /api/cleanup/execute` - Execute cleanup policies
- `GET /api/cleanup/metrics` - Storage metrics and cleanup statistics
- `GET /api/cleanup/policies` - Available cleanup policies

### UI Service Proxy Endpoints (Scraper Integration)
- `POST /api/scraper/trigger` - Proxy to scraper service with fallback
- `GET /api/scraper/jobs` - Job management interface
- `GET /api/scraper/content` - Content feed interface
- `GET /api/scraper/sources` - Source management interface
- `GET /api/scraper/monitoring` - Monitoring dashboard interface
- `GET /api/scraper/metrics` - Health metrics for dashboard (database-based article counts)

## Frontend Architecture

### Pages
- **Homepage** (`/`) - Factoid cards with topic filtering
- **Article Detail** (`/article/[id]`) - Individual factoid display
- **Settings** (`/settings`) - Theme toggle only
- **Scraper Dashboard** (`/scraper`) - **NEW**: Comprehensive 3-tab monitoring interface
  - **Health Dashboard Tab**: Metrics cards, job history, source monitoring
  - **Content Feed Tab**: Scraped articles feed, individual article viewer
  - **Source Management Tab**: CRUD operations, health monitoring, RSS validation

### Core Components (Essential only)
- `Card` - Primary content container
- `Button` - Actions and navigation
- `Badge` - Tags and categories
- `Skeleton` - Loading states
- `Switch` - Settings toggles
- `ThemeToggle` - Dark/light mode

### Scraper Dashboard Components (Advanced UI)
- `HealthDashboard` - Real-time metrics, job history, source health monitoring
- `ContentFeed` - Article feed with filtering, search, and individual viewer
- `SourceManagement` - Source CRUD with validation, testing, and health checks
- `JobTrigger` - Job creation interface with source selection and configuration

### Utilities
- **RTL Support** (`rtl-utils.ts`) - Hebrew/Arabic text direction
- **Database Client** (`railway-database.ts`) - PostgreSQL connection
- **Data Services** (`data-service.ts`, `data.server.ts`) - API & server data
- **Date Utilities** (`utils.ts`) - Dynamic date generation

## Railway Infrastructure

### Railway Services Architecture
The project uses three Railway services:
- **UI Service**: Next.js application (main service)
- **Scraper Service**: Advanced Crawlee-based content aggregation service
- **Database Service**: PostgreSQL instance (shared by all services)

### Scraper Service Architecture
```
services/scraper/
├── src/
│   ├── enhanced-scraper.ts     # Single scraper implementation with comprehensive features
│   ├── enhanced-logger.ts      # Advanced JSONB logging with correlation tracking
│   ├── job-manager.ts          # Job queue and execution management
│   ├── content-classifier.ts   # Content classification and categorization
│   ├── duplicate-detector.ts   # URL and content-based duplicate prevention
│   ├── source-manager.ts       # Dynamic source configuration management
│   ├── resource-monitor.ts     # System resource monitoring
│   ├── cleanup-manager.ts      # Content cleanup and archival
│   ├── error-handler.ts        # Comprehensive error handling and recovery
│   ├── database.ts             # Enhanced database operations with JSONB support
│   ├── log-queries.ts          # Structured log query utilities
│   ├── test-logs.ts            # Log testing and validation utilities
│   ├── clear-data.ts           # Data cleanup and maintenance scripts
│   ├── types.ts                # Comprehensive TypeScript interfaces
│   └── api-server.ts           # Express HTTP server with monitoring endpoints
├── package.json                # Crawlee, Playwright, Express dependencies
└── tsconfig.json               # TypeScript configuration
```

**Note**: The scraper service now uses a single, unified `EnhancedRSSScraper` implementation following ADR-003, which consolidated all scraping functionality into one comprehensive solution with advanced monitoring capabilities.

### Service Communication
- **HTTP APIs**: Services communicate via REST endpoints
- **Shared Database**: Both services access same PostgreSQL instance
- **Environment Variables**: Services configured via Railway environment
- **Health Monitoring**: Comprehensive health checks across all services
- **Enhanced APIs**: Source testing, job logs retrieval, granular status tracking

**Reference**: See `documentation/railway-interface.md` for complete Railway CLI commands, service management, deployment procedures, environment variables, and troubleshooting. This file is git-ignored and contains sensitive project information.

## Deployment (Multi-Service Architecture)

### Railway Configuration (`railway.toml`)
```toml
[[services]]
name = "ui"
source = "services/ui"

[services.ui.build]
buildCommand = "npm install && npm run build"

[services.ui.deploy]
startCommand = "npm start"

[[services]]
name = "scraper"
source = "services/scraper"

[services.scraper.build]
buildCommand = "npm install && npm run build"

[services.scraper.deploy]
startCommand = "npm start"
```

### Environment Variables
```bash
# UI Service
DATABASE_URL=postgresql://... # Automatically provided by Railway
NODE_ENV=production          # Automatically set by Railway
PORT=${{PORT}}              # Automatically set by Railway
SCRAPER_SERVICE_URL=...     # URL of scraper service for API calls (Railway internal URL)

# Scraper Service
DATABASE_URL=postgresql://... # Shared with UI service
NODE_ENV=production          # Automatically set by Railway
PORT=${{PORT}}              # Automatically set by Railway
```

**Service Communication**: UI service connects to scraper service using Railway's internal service discovery via `SCRAPER_SERVICE_URL` environment variable. Railway automatically provides service URLs in the format `http://service-name.railway.internal:PORT`.

## Development Guidelines

### Core Principles
1. **Simplicity First** - Implement only what's needed
2. **Incremental Growth** - Add features when actually required
3. **Build Validation** - ⚠️ CRITICAL: Test from respective service directories
   - **UI Service**: `cd services/ui && npm run build && npm run lint`
   - **Scraper Service**: `cd services/scraper && npm run build`
4. **Documentation Sync** - Update docs with code changes

### Multi-Service Development
- **UI Service**: Standard Next.js development in `services/ui`
- **Scraper Service**: Node.js/Express development in `services/scraper`
- **Database Changes**: Update both services when schema changes
- **API Integration**: Test service-to-service communication

### Adding New Features
1. Check `documentation/removed-code-and-features.md` for guidance
2. Start with minimal implementation
3. Test thoroughly before expanding
4. Update documentation immediately

### Database Changes
1. Create migration script in `database/migrations/`
2. Update TypeScript interfaces in both services
3. Test with both mock and real data
4. Update technical design documentation

## Monitoring & Maintenance

### Advanced Health Monitoring
- **Scraper Service Health**: Comprehensive health checks with system metrics
- **Database Connectivity**: Connection pool monitoring and performance tracking
- **Error Tracking**: Real-time error statistics with categorization and recovery
- **Resource Monitoring**: Memory, storage, and performance metrics with automated snapshots
- **Job Monitoring**: Scraping job success rates and execution tracking with correlation IDs; metrics use database-based article counts from scraped_content table for accuracy
- **Source Health**: RSS feed validation and content source monitoring
- **Enhanced Structured Logging**: JSONB-first logging architecture with:
  - Event-driven logging (lifecycle, source, http, extraction, performance)
  - Correlation tracking for related events across request lifecycle
  - Performance monitoring with 30-second automated snapshots
  - Content quality scoring (0-100 scale) for extracted articles
  - Optimized GIN indexes for complex JSONB queries
  - Comprehensive error categorization and pattern analysis
- **Performance Analytics**: Detailed HTTP request/response timing with waterfall analysis

### Automated Systems
- **Content Cleanup**: Automated archival and compression policies
- **Duplicate Detection**: Content hash-based deduplication
- **Error Recovery**: Automatic retry mechanisms with exponential backoff
- **Resource Management**: Storage usage monitoring and cleanup triggers

### Developer Tools
- **Real-time Dashboard**: 3-tab monitoring interface for operations
- **API Health Checks**: Comprehensive endpoint monitoring
- **Enhanced UI Components**: Sortable tables, tooltips, modal dialogs
- **Job Monitoring**: Granular status tracking with expandable logs
- **Job Management**: Visual job tracking and cancellation capabilities
- **Source Testing**: RSS feed validation and source health checks

### Build Validation
- **UI Service**: TypeScript compiler, ESLint, and build verification
- **Scraper Service**: TypeScript compiler and build verification
- **Integration Testing**: Service-to-service communication validation
- **Manual Testing**: Core functionality verification across services

### Deployment Process
1. `git push` to development branch
2. Manual merge to main (never direct push)
3. Railway auto-deploys both services from main
4. Verify functionality across all services post-deployment

## Security & Performance

### Current Security
- **Input validation** at API boundaries (both services)
- **Environment variables** for secrets
- **Server-side rendering** for performance
- **TypeScript strict mode** for type safety
- **CORS configuration** for service communication
- **Error sanitization** to prevent information leakage

### Performance Optimizations
- **Minimal bundle size** (essential components only)
- **Static page generation** where possible
- **Database connection pooling** across services
- **Optimized queries** (no N+1 problems)
- **Content compression** and archival systems
- **Concurrent scraping** with resource management
- **Rate limiting** for external API calls

## Project Status Summary

**Completed**: Advanced content aggregation platform with comprehensive monitoring  
**Current**: Production-ready with automated content collection and management  
**Next**: Ready for additional source integration and LLM-based factoid extraction

**Key Achievement**: Evolved from basic proof-of-concept to enterprise-grade content aggregation platform with advanced monitoring, error handling, and automated management capabilities. 