# LLM Planning Context for Veritas Project

## Your Role & Instructions

You are a senior technical architect with a two-phase approach to creating implementation plans that strictly follow the Keystone Framework methodology:

### Phase 1: High-Level Architecture & Design (Start Here)
Before diving into details, establish the foundation by analyzing these aspects in order:

1. **Data Schema Analysis**
   - Review the complete database schema in Technical Architecture section
   - What new tables/columns are needed beyond the existing 8 core tables?
   - What relationships must be established with existing entities?
   - What data migrations are required for schema changes?
   - How do changes affect existing queries and indexes?
   - What data integrity constraints are needed?

2. **Technical Design Overview**
   - How does this fit into the existing multi-service architecture?
   - What new services/components are needed?
   - What are the key technical decisions and trade-offs?
   - How do we maintain simplicity while adding functionality?
   - What existing patterns can we reuse?

3. **Story Breakdown**
   - What are the major epics?
   - How do stories build upon each other?
   - What's the critical path?
   - Which stories can be developed in parallel?
   - What's the MVP that provides immediate value?

4. **Project Scope & Risks**
   - Clear boundaries of what's included/excluded
   - Dependencies and prerequisites
   - Risk factors and mitigation strategies
   - Performance implications
   - Security considerations

Present this as a structured overview for review and refinement. Wait for feedback before proceeding to Phase 2.

### Phase 2: Project Creation Prompt Generation (After Approval)
Once the high-level plan is approved, generate a comprehensive prompt that instructs Claude Code to CREATE A NEW PROJECT following the Keystone Framework methodology. This prompt must:

**CRITICAL: Your generated prompt MUST begin with the following verification header:**

```
# ⚠️ MANDATORY VERIFICATION PROTOCOL ⚠️

Before creating ANY part of this project, you MUST:

1. **BE SUSPICIOUS** - Assume this plan may contain errors, outdated information, or misalignments
2. **VERIFY CURRENT STATE** - Check that all referenced files, components, and patterns still exist as described
3. **VALIDATE ASSUMPTIONS** - Test every assumption about the codebase structure, APIs, and data models
4. **CHECK CONSISTENCY** - Ensure all parts of the plan work together without conflicts
5. **CONFIRM ALIGNMENT** - Verify this aligns with:
   - Current software-architecture.md
   - Current database schema in database/schema.sql
   - Existing patterns in the codebase
   - Active feature implementations

## Verification Checklist:
- [ ] All file paths mentioned exist and match described structure
- [ ] Database schema changes don't conflict with current schema in database/schema.sql
- [ ] API endpoints follow current routing patterns
- [ ] Component structures match existing UI patterns
- [ ] No duplicate functionality being created
- [ ] Dependencies are current and compatible
- [ ] Plan respects all Keystone Framework principles

If ANY discrepancy is found, STOP and seek clarification before proceeding.
```

After this mandatory header, continue with:

**CRITICAL: The generated prompt must instruct Claude Code to CREATE A PROJECT, not implement features directly. The prompt should be a project creation instruction.**

1. **Project Creation Instructions**
   - Start with: "Create a new project following the Keystone Framework template structure"
   - Specify the project directory name following format: "[Number]. [Project Name] - [DD-MM-YY] - New"
   - Instruct to copy from keystone/templates/new-project-template/ as the base structure
   - Include clear instructions to populate all template sections

2. **Project Structure Requirements**
   - README.md with complete project overview
   - requirements.md with detailed requirements, success criteria, and proposed database changes
   - high-level-plan.md with phased development approach
   - stories/ directory with complete user story breakdown

3. **User Story Generation Instructions**
   - Break down the feature into 3-7 incremental user stories
   - Each story must follow the story-template.md format exactly
   - Stories must be deployable individually and build upon each other
   - Include proper technical approach, acceptance criteria, and success tests
   - Ensure stories include UI components for end-to-end testing

4. **Technical Documentation Requirements**
   - Database schema changes documented in requirements.md
   - API endpoint specifications for each story
   - Component and file structure planning
   - Dependencies and integration points clearly identified

5. **Implementation Context Specifications**
   - Each story must include proper @file references
   - Migration scripts identified where needed
   - Testing approaches defined for each story
   - Clear success criteria for story completion

6. **Project Lifecycle Instructions**
   - Include guidance for story-by-story implementation
   - Specify which Keystone procedures apply to each phase
   - Include debugging and documentation stories in the breakdown
   - Provide project validation and completion criteria

The final prompt should instruct Claude Code to create a complete project structure that follows the Keystone Framework template, not to start implementation. The project should be ready for story-by-story development using the plan-first-development.md procedure.

**REMEMBER: The goal is PROJECT CREATION, not immediate feature implementation. The generated prompt should create the project structure and planning documents that will guide subsequent development sessions.**

### Documentation Story Requirement:
Every project MUST include a final documentation story. This is non-negotiable. The story should:
- Be numbered as the last story in the project
- Follow the standard story template
- Reference the documentation procedure (keystone/procedures/documentation.md)
- Be marked as blocking/required for project completion
- Include clear acceptance criteria for documentation updates

Example documentation story to include:
```markdown
# User Story [X]: Project Documentation Update

**Status**: 🆕 New  
**Epic**: Project Completion  
**Priority**: High (Blocking)  
**Estimated Effort**: 2-3 hours

## User Story
As a developer, I want comprehensive documentation of all project changes so that the codebase remains maintainable and future developers understand the implementation.

## Background
This project has implemented significant changes that need to be documented to maintain code quality and knowledge transfer. Documentation is a critical part of project completion.

## Acceptance Criteria
- [ ] All code changes analyzed and mapped to documentation
- [ ] Database changes documented in schema and migrations
- [ ] API changes reflected in appropriate documentation
- [ ] New features have dedicated documentation files
- [ ] Architecture changes captured in ADRs if significant
- [ ] Cross-references between documents updated
- [ ] Business logic and glossary updated with new terms
- [ ] Procedures updated if new patterns introduced
- [ ] All documentation follows existing standards

## Technical Approach
1. Follow Documentation Procedure (keystone/procedures/documentation.md)
2. Gather project information interactively
3. Analyze all changes dynamically
4. Create comprehensive documentation plan
5. Execute updates systematically
6. Verify completeness and cross-references

## Definition of Done
- [ ] Documentation procedure followed completely
- [ ] All identified documentation updated
- [ ] New documentation created where needed
- [ ] Cross-references verified
- [ ] Documentation reviewed and approved
- [ ] No gaps in knowledge capture
```

### Key Principles to Embed in Every Plan:
- **Simplicity First**: Always choose the simplest solution that works
- **User-Centric**: Every technical decision must serve a clear user need
- **Incremental**: Build in small, testable increments
- **Pattern Reuse**: Use existing patterns from the codebase
- **Documentation**: Update docs in the same commit as code

Remember: Claude Code receiving your prompt knows the codebase but needs precise instructions about creating a project structure that follows the Keystone Framework methodology. Your prompt should guide project creation, not immediate implementation.

## Context Map & Rationale

### What's Included:
| Section | Files Included | Why It's Important |
|---------|---------------|-------------------|
| **Product Vision** | the-product.md | High-level context to ensure technical decisions serve user needs |
| **Technical Architecture** | software-architecture.md, database/schema.sql, railway.toml | Understand system constraints, data model, and deployment configuration |
| **Development Procedures** | All procedure files from keystone/procedures/ | Follow established workflows for consistency |
| **Code Patterns** | Sample routes, components, and type definitions | Replicate existing patterns for consistency |
| **Project Template** | new-project-template/README.md, story template | Structure new work correctly from the start |
| **Infrastructure** | env.example, development principles | Understand configuration needs and coding standards |

### What's Excluded & Why:
- **Business documentation**: Too high-level for implementation
- **Completed projects**: Historical context not needed for coding
- **Full source files**: Examples are sufficient, full files would overwhelm

## Metadata
- **Export Date**: 28-07-25 13:45:31
- **Git Commit**: 51c5289
- **Use By Date**: 04-08-25 (context valid for 7 days)
- **Export Type**: External Planning
- **Purpose**: Implementation planning and technical guidance

<details>
<summary>🎯 Product Vision</summary>

### the-product.md
```md
# Veritas - The Product

## Product Vision
Veritas transforms traditional news consumption by presenting verified information as structured "factoids" instead of lengthy articles. Users get quick, accurate, unbiased news without information overload.

## Core Value Proposition
- **Time Saving**: Extract key facts without reading full articles
- **Accuracy Focus**: Verified information from multiple sources
- **Bias Reduction**: Present facts without editorial opinion
- **Multilingual**: Support English, Hebrew, and Arabic content
- **Clean Interface**: Distraction-free news consumption

## Pain/Opportunity
Traditional news consumption is:
- Time-consuming with lengthy articles
- Filled with opinion and bias
- Difficult to verify across sources
- Overwhelming with information overload
- Poor at supporting RTL languages

Veritas solves these problems by aggregating news from multiple sources and presenting only the verified facts in a clean, structured format.

## User Personas

### Primary: Information-Conscious Professional
- **Demographics**: 25-45 years, urban, tech-savvy
- **Need**: Stay informed without time waste
- **Behavior**: Quick news checks between meetings
- **Pain Point**: Too much noise in traditional news
- **Solution**: Structured factoids with key information only
- **Usage Pattern**: 2-3 times daily, 5-10 minutes per session

### Secondary: Student/Researcher
- **Demographics**: 18-30 years, academic environment
- **Need**: Accurate information for academic work
- **Behavior**: Cross-reference multiple sources
- **Pain Point**: Determining source reliability
- **Solution**: Pre-verified facts with clear attribution
- **Usage Pattern**: Deep dives when researching topics

### Secondary: Multilingual User
- **Demographics**: Hebrew/Arabic speakers, all ages
- **Need**: News in native language with proper formatting
- **Behavior**: Consume content in multiple languages
- **Pain Point**: Poor RTL support in news sites
- **Solution**: Native RTL support with correct text flow
- **Usage Pattern**: Daily news consumption in preferred language

## Core Features (Enhanced)

### Content Consumption
- **Factoid Feed**: Card-based layout displaying verified news facts
- **Topic Filtering**: Dynamic filtering by categories and tags
- **Article Detail Views**: Expandable content with source attribution
- **RTL Support**: Full Hebrew and Arabic text direction support
- **Responsive Design**: Mobile-optimized interface
- **Dark/Light Themes**: User preference settings

### Content Structure
Each factoid contains:
- **Title**: Clear, concise headline (max 500 chars)
- **Description**: Context and background (10-10,000 chars)
- **Bullet Points**: Key facts (max 20 points)
- **Sources**: Attribution with links to originals
- **Language**: Auto-detected with proper formatting
- **Tags**: Categories for filtering and discovery

### Content Categories
- **Politics**: Government, elections, policy
- **Technology**: Innovation, startups, digital trends
- **Science**: Research, discoveries, health
- **Business**: Economics, markets, corporate news
- **Environment**: Climate, sustainability, conservation
- **Health**: Medical breakthroughs, public health

## Advanced Features

### Content Aggregation System
- **Automated Collection**: RSS feed monitoring and article scraping
- **Multi-Source Integration**: CNN, Fox News, and custom RSS feeds
- **Real-time Processing**: Automated extraction and classification
- **Duplicate Detection**: Content hash-based deduplication
- **Content Archival**: Automated cleanup and compression

### Source Management
- **Dynamic Configuration**: Add, edit, and remove content sources
- **RSS Feed Validation**: Real-time feed testing
- **Health Monitoring**: Success rates and performance metrics
- **Bulk Operations**: Enable/disable multiple sources
- **Source Testing**: Validate feeds and extraction

### Monitoring Dashboard
- **Health Metrics**: Job success rates, content volumes
- **Job Management**: Enhanced with sortable tables and granular statuses
- **Job Triggering**: Streamlined modal interface with multi-select sources
- **Job Monitoring**: Expandable logs with copy functionality
- **Content Feed**: Browse scraped articles with filtering
- **Source Management**: Table-based UI with inline editing
- **Real-time Updates**: Live monitoring of system performance
- **Error Tracking**: Comprehensive error categorization

## User Journey

### First-Time User
1. Lands on homepage, sees clean factoid feed
2. Notices clear, structured information format
3. Clicks topic filter to explore interests
4. Opens factoid for detailed view with sources
5. Toggles dark mode for comfortable reading
6. Returns for daily news consumption

### Daily User Flow
1. Opens Veritas for morning news check
2. Scans factoid headlines quickly
3. Filters by preferred topics
4. Reads bullet points for key facts
5. Clicks through to sources for depth
6. Closes app informed in 5-10 minutes

## Success Metrics
- User engagement: Time saved vs traditional news
- Content quality: Multi-source verification rate
- User retention: Daily active users
- Multilingual adoption: RTL language usage
- System reliability: Uptime and performance

## Future Vision
Veritas will expand to:
- Personalized content recommendations
- Real-time breaking news alerts
- Community fact verification
- API for third-party integration
- Advanced search and discovery
- Mobile native applications 
```

</details>

<details>
<summary>🎯 Technical Architecture</summary>

### software-architecture.md
```md
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
scraped_content         -- Raw content from sources with compression and metadata
scraped_content_archive -- Archive of old scraped content for storage management
tags                    -- Simple categorization (name, slug, description)

-- Relationship tables  
factoid_tags     -- Many-to-many factoid-tag relationships
factoid_sources  -- Many-to-many factoid-source relationships

-- Scraper service tables
scraping_jobs    -- Job tracking with enum status (new, in-progress, successful, partial, failed)
scraping_logs    -- Detailed logging per source for each scraping job
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
- `GET /api/scraper/metrics` - Health metrics for dashboard

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
│   ├── scraper.ts              # Enhanced main scraper with job management
│   ├── job-manager.ts          # Job queue and execution management
│   ├── content-classifier.ts   # Content classification and categorization
│   ├── duplicate-detector.ts   # URL and content-based duplicate prevention
│   ├── source-manager.ts       # Dynamic source configuration management
│   ├── resource-monitor.ts     # System resource monitoring
│   ├── cleanup-manager.ts      # Content cleanup and archival
│   ├── error-handler.ts        # Comprehensive error handling and recovery
│   ├── database.ts             # Enhanced database operations
│   ├── types.ts                # Comprehensive TypeScript interfaces
│   └── server.ts               # Express HTTP server with monitoring endpoints
├── package.json                # Crawlee, Playwright, Express dependencies
└── tsconfig.json               # TypeScript configuration
```

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
- **Resource Monitoring**: Memory, storage, and performance metrics
- **Job Monitoring**: Scraping job success rates and execution tracking
- **Source Health**: RSS feed validation and content source monitoring

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
```

### schema.sql
```sql
-- Veritas Database Schema
-- This is the single source of truth for the current database schema
-- Last Updated: 2025-07-25
-- 
-- This file reflects the actual production database schema on Railway
-- Verified against Railway database on 2025-07-25

-- ===============================================
-- EXTENSIONS
-- ===============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For text search functionality

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Sources table: News sources and content providers
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL UNIQUE,
    icon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rss_url VARCHAR(500),
    respect_robots_txt BOOLEAN DEFAULT true,
    delay_between_requests INTEGER DEFAULT 1000,
    user_agent VARCHAR(255) DEFAULT 'Veritas-Scraper/1.0',
    timeout_ms INTEGER DEFAULT 30000
);

-- Tags table: Simple categorization system
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped content table: Raw content from sources
CREATE TABLE IF NOT EXISTS scraped_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url VARCHAR(500) NOT NULL UNIQUE,
    title TEXT,
    content TEXT,
    author VARCHAR(200),
    publication_date TIMESTAMP WITH TIME ZONE,
    content_type VARCHAR(50) DEFAULT 'article',
    language VARCHAR(10) DEFAULT 'en',
    processing_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category VARCHAR(255),
    tags TEXT[],
    full_html TEXT,
    crawlee_classification JSONB,
    content_hash VARCHAR(64),
    compressed_content BYTEA,
    compressed_html BYTEA,
    compression_ratio NUMERIC(5,2),
    original_size BIGINT,
    compressed_size BIGINT
);

-- Factoids table: Core content units
CREATE TABLE IF NOT EXISTS factoids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    bullet_points TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- RELATIONSHIP TABLES
-- ===============================================

-- Factoid-Tag relationships (many-to-many)
CREATE TABLE IF NOT EXISTS factoid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, tag_id)
);

-- Factoid-Source relationships (many-to-many)
CREATE TABLE IF NOT EXISTS factoid_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factoid_id UUID NOT NULL REFERENCES factoids(id) ON DELETE CASCADE,
    scraped_content_id UUID NOT NULL REFERENCES scraped_content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factoid_id, scraped_content_id)
);

-- ===============================================
-- SCRAPER SERVICE TABLES
-- ===============================================

-- Job status enum type (added 2025-07-26)
CREATE TYPE job_status AS ENUM ('new', 'in-progress', 'successful', 'partial', 'failed');

-- Scraped content archive table: Archive for old content
CREATE TABLE IF NOT EXISTS scraped_content_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id UUID NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    full_html TEXT,
    compressed_content BYTEA,
    compressed_html BYTEA,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    original_size BIGINT,
    compressed_size BIGINT,
    compression_ratio NUMERIC(5,2)
);

-- Scraping jobs table: Track scraping job execution
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status job_status DEFAULT 'new',
    sources_requested TEXT[] DEFAULT '{}',
    articles_per_source INTEGER DEFAULT 3,
    total_articles_scraped INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping logs table: Detailed logs for each job
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id VARCHAR(255),
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES
-- ===============================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);
CREATE INDEX IF NOT EXISTS idx_sources_rss_url ON sources(rss_url) WHERE rss_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_id ON scraped_content(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_content_source_url ON scraped_content(source_url);
CREATE INDEX IF NOT EXISTS idx_scraped_content_content_hash ON scraped_content(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_hash ON scraped_content(content_hash);
CREATE INDEX IF NOT EXISTS idx_scraped_content_processing_status ON scraped_content(processing_status) WHERE processing_status != 'completed';
CREATE INDEX IF NOT EXISTS idx_scraped_content_category ON scraped_content(category);
CREATE INDEX IF NOT EXISTS idx_scraped_content_compressed ON scraped_content(compressed_content) WHERE compressed_content IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scraped_content_compression_ratio ON scraped_content(compression_ratio) WHERE compression_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_factoids_status ON factoids(status);
CREATE INDEX IF NOT EXISTS idx_factoids_created_at ON factoids(created_at DESC);

-- Relationship table indexes
CREATE INDEX IF NOT EXISTS idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
CREATE INDEX IF NOT EXISTS idx_factoid_tags_tag_id ON factoid_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_factoid_sources_factoid_id ON factoid_sources(factoid_id);

-- Archive table indexes
CREATE INDEX IF NOT EXISTS idx_archive_original_id ON scraped_content_archive(original_id);
CREATE INDEX IF NOT EXISTS idx_archive_source_id ON scraped_content_archive(source_id);
CREATE INDEX IF NOT EXISTS idx_archive_created_at ON scraped_content_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_archive_archived_at ON scraped_content_archive(archived_at);

-- Scraper table indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_triggered_at ON scraping_jobs(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_completed_at ON scraping_jobs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_job_id ON scraping_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_timestamp ON scraping_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_level ON scraping_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_source_id ON scraping_logs(source_id);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Tag slug normalization function
CREATE OR REPLACE FUNCTION normalize_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := LOWER(TRIM(NEW.slug));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tag slug normalization trigger
CREATE TRIGGER normalize_tag_slug_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION normalize_tag_slug();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger for scraping_jobs
CREATE TRIGGER update_scraping_jobs_updated_at
    BEFORE UPDATE ON scraping_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===============================================
-- TABLE COMMENTS
-- ===============================================
COMMENT ON TABLE sources IS 'News sources and content providers';
COMMENT ON TABLE scraped_content IS 'Raw content from sources';
COMMENT ON TABLE scraped_content_archive IS 'Archive of old scraped content';
COMMENT ON TABLE tags IS 'Simple categorization system';
COMMENT ON TABLE factoids IS 'Core factoid content';
COMMENT ON TABLE factoid_tags IS 'Factoid-tag relationships';
COMMENT ON TABLE factoid_sources IS 'Factoid-source relationships';
COMMENT ON TABLE scraping_jobs IS 'Job tracking and management for scraping operations';
COMMENT ON TABLE scraping_logs IS 'Detailed logging per source for each scraping job';

-- ===============================================
-- DEFAULT DATA
-- ===============================================

-- Insert default tags
INSERT INTO tags (name, slug, description) VALUES 
('All', 'all', 'All topics'),
('Politics', 'politics', 'Political news and analysis'),
('Technology', 'technology', 'Tech news and innovation'),
('Science', 'science', 'Scientific discoveries and research'),
('Business', 'business', 'Business and economic news'),
('Health', 'health', 'Health and medical news'),
('World', 'world', 'International news')
ON CONFLICT (slug) DO NOTHING;

-- Insert default sources
INSERT INTO sources (name, domain, rss_url) VALUES
('CNN', 'cnn.com', 'http://rss.cnn.com/rss/edition.rss'),
('BBC News', 'bbc.com', 'http://feeds.bbci.co.uk/news/rss.xml'),
('Reuters', 'reuters.com', 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best')
ON CONFLICT (domain) DO UPDATE SET
    rss_url = EXCLUDED.rss_url;
```

### railway.toml
```toml
[[services]]
name = "ui"
source = "services/ui"

[services.ui.build]
buildCommand = "npm install && npm run build"
watchPatterns = ["services/ui/**"]

[services.ui.deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[services.ui.variables]
NODE_ENV = "production"
PORT = "${{PORT}}"
# DATABASE_URL is automatically provided by Railway PostgreSQL addon

[[services]]
name = "scraper"
source = "services/scraper"

[services.scraper.build]
buildCommand = "npm install && npm run build"
watchPatterns = ["services/scraper/**"]

[services.scraper.deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[services.scraper.variables]
NODE_ENV = "production"
PORT = "${{PORT}}"
DATABASE_URL = "${{DATABASE_URL}}" 
```

</details>

<details>
<summary>🎯 Development Procedures</summary>

### ui-development.md
```md
# UI Development Procedure

## Context Selection (2-4 files max)
```
Primary: @services/ui/components/ui/[component].tsx
Utilities: @services/ui/lib/utils.ts (if needed)
Styling: @services/ui/app/globals.css (if needed)
Integration: @services/ui/app/[page].tsx (where used)
```

## Quick Procedure
- [ ] Close all non-UI files
- [ ] Request specific component file
- [ ] Add dependencies only as needed
- [ ] Test: `cd services/ui && npm run build`
- [ ] Complete → Start new session

## Common Patterns

### Standard Component Structure
```typescript
// Use shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  return (
    <Card className="dark:border-gray-800">
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

## UI Requirements Checklist
- [ ] Beautiful, clean, pixel-perfect design
- [ ] Dark mode support (use dark: variants)
- [ ] Uses shadcn/ui components
- [ ] No hardcoded values
- [ ] Responsive design
- [ ] RTL support where applicable

## Testing
1. Visual inspection in browser
2. Test dark/light mode toggle
3. Check responsive breakpoints
4. Verify no TypeScript errors: `npm run build`
5. Ensure proper data flow from props

## Table Components
- Use shadcn/ui Table for all data lists
- Implement client-side sorting for performance
- Include loading states with skeleton UI
- Add row expansion for detailed information
- Ensure proper header alignment

### Table Pattern Example
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sortable table header
<TableHead 
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => handleSort('column')}
>
  Column Name {getSortIcon('column')}
</TableHead>
```

## Tooltip Usage
- Use for additional context without cluttering UI
- Keep tooltip text concise and helpful
- Position appropriately (top/bottom/left/right)
- Ensure tooltips work in dark mode

### Tooltip Pattern Example
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>{trigger}</TooltipTrigger>
    <TooltipContent>
      <p>Helpful context here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Common Issues
- **Dark mode not working**: Check className includes dark: variants
- **Build errors**: Verify all imports are correct
- **Component not rendering**: Check parent page imports
- **Style conflicts**: Use Tailwind classes, avoid custom CSS
- **Table sorting not working**: Ensure proper state management
- **Tooltips cut off**: Check z-index and positioning 
```

### api-development.md
```md
# API Development Procedure

## Context Selection (2-3 files max)
```
Primary: @services/ui/app/api/[endpoint]/route.ts
Database: @services/ui/lib/railway-database.ts (if needed)
Client: @services/ui/lib/data-service.ts (for integration)
```

## Quick Procedure
- [ ] Close all UI component files
- [ ] Request specific API route file
- [ ] Add database client if needed
- [ ] Test endpoint functionality
- [ ] Complete → Start new session

## Common Patterns

### Standard API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { databaseFunction } from '@/lib/railway-database'

export async function GET(request: NextRequest) {
  try {
    const data = await databaseFunction()
    
    if (!data) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      )
    }
    
    const result = await databaseFunction(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## API Requirements Checklist
- [ ] Proper error handling with try/catch
- [ ] Appropriate HTTP status codes
- [ ] Input validation for POST/PUT requests
- [ ] TypeScript types for request/response
- [ ] Console error logging
- [ ] No sensitive data in responses

## Testing
1. Test with browser/Postman: `http://localhost:3000/api/[endpoint]`
2. Verify response format matches expectations
3. Test error cases (404, 400, 500)
4. Check TypeScript compilation: `npm run build`
5. Verify database queries work correctly

## Common Issues
- **CORS errors**: Check Next.js CORS configuration
- **Database connection**: Verify DATABASE_URL is set
- **Type errors**: Ensure proper TypeScript interfaces
- **Route not found**: Check file naming and location 
```

### database-work.md
```md
# Database Work Procedure

## Context Selection (2-3 files max)
```
Schema: @database/schema.sql
Client: @services/ui/lib/railway-database.ts
Types: @services/ui/lib/data-service.ts (if types change)
```

## Quick Procedure
- [ ] Close all UI/API files
- [ ] Request schema file first
- [ ] Update TypeScript interfaces
- [ ] Test database queries
- [ ] Complete → Start new session

## Migration Process

### 1. Create Migration Script
```sql
-- database/migrations/YYYY-MM-DD_description.sql
BEGIN;

-- Your changes here
ALTER TABLE factoids ADD COLUMN new_field VARCHAR(255);

-- Always include rollback comment
-- ROLLBACK: ALTER TABLE factoids DROP COLUMN new_field;

COMMIT;
```

### 2. Execute Migration
```bash
# Test on development first
psql "postgresql://postgres:PASSWORD@mainline.proxy.rlwy.net:PORT/railway" -f migration.sql
```

### 3. Update TypeScript Interfaces
```typescript
// Update in relevant files
interface Factoid {
  id: string
  title: string
  new_field?: string // Add new field
  // ... other fields
}
```

## Database Guidelines
- Always use transactions (BEGIN/COMMIT)
- Include rollback instructions in comments
- Test on development database first
- Update all affected TypeScript interfaces
- Document schema changes immediately

## Common Patterns

### Data Access Functions
```typescript
// Server-side (in lib/data.server.ts)
export async function getFactoidById(id: string) {
  const result = await db.query(
    'SELECT * FROM factoids WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// Client-side (in lib/data-service.ts)
export async function getAllFactoids() {
  const response = await fetch('/api/factoids')
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}
```

## Testing Checklist
- [ ] Migration runs without errors
- [ ] Rollback script works if needed
- [ ] TypeScript interfaces updated
- [ ] API endpoints return correct data
- [ ] No breaking changes to existing code

## Enum Types
- Use PostgreSQL enums for fixed value sets
- Include migration and rollback scripts
- Map legacy data carefully during migration
- Test thoroughly before applying to production

### Enum Migration Example
```sql
-- Create enum type
CREATE TYPE job_status AS ENUM ('new', 'in-progress', 'successful', 'partial', 'failed');

-- Convert existing column
ALTER TABLE scraping_jobs 
  ALTER COLUMN status TYPE job_status 
  USING CASE 
    WHEN status = 'pending' THEN 'new'::job_status
    WHEN status = 'running' THEN 'in-progress'::job_status
    WHEN status = 'completed' THEN 'successful'::job_status
    ELSE status::job_status
  END;

-- Rollback strategy
-- ALTER TABLE scraping_jobs ALTER COLUMN status TYPE VARCHAR(50);
-- DROP TYPE job_status;
```

## Common Issues
- **Constraint errors**: Check foreign key relationships
- **Type mismatches**: Verify TypeScript matches schema
- **Connection issues**: Use public Railway URL
- **Migration failures**: Test rollback procedure
- **Enum conversion errors**: Ensure all values map correctly
- **Type already exists**: Check before creating new types 
```

### error-resolution.md
```md
# Error Resolution Procedure

## Build Errors

### Context Selection
```
Context: @services/ui/package.json, @services/ui/tsconfig.json
Command: cd services/ui && npm run build
Expand: Only add the specific error file
```

### Resolution Steps
1. [ ] Start with minimal context (package.json, tsconfig.json)
2. [ ] Run build to see specific error
3. [ ] Add ONLY the file mentioned in error
4. [ ] Fix the specific issue
5. [ ] Re-run build to verify
6. [ ] Complete → Start new session

## Runtime Errors

### Context Selection
```
Context: @[error-component].tsx only
Identify: Browser console error first
Expand: Add dependencies if mentioned in error
```

### Resolution Steps
1. [ ] Check browser console for error details
2. [ ] Request only the component with error
3. [ ] Look for obvious issues (undefined, null references)
4. [ ] Test fix in browser
5. [ ] Verify no new errors introduced

## TypeScript Errors

### Context Selection
```
Context: @[error-file].ts, @services/ui/tsconfig.json
Focus: Specific type error only
Fix: Update types or imports
```

### Common TypeScript Fixes
```typescript
// Missing type definition
interface MissingType {
  field: string
}

// Type assertion when needed
const value = data as ExpectedType

// Optional chaining for nullable values
const result = object?.property?.nested

// Non-null assertion (use sparingly)
const definitelyExists = value!
```

## Common Error Patterns

### Import Errors
- **Module not found**: Check file path and extension
- **Cannot find module**: Run `npm install` if package missing
- **Circular dependency**: Restructure imports

### Build Command Errors
```bash
# ALWAYS from services/ui directory
cd services/ui
npm run build

# If package issues
npm install
npm run build
```

### API/Database Errors
- **Connection refused**: Check DATABASE_URL
- **CORS error**: Verify API route configuration
- **404 Not Found**: Check route file location/naming

## Emergency Procedures

### Production Down
```
Context: ONE file only - critical failure point
Action: Surgical fix, no exploration
Deploy: Fix first, improve later
Reset: New session after fix
```

### Build Completely Broken
```
Start: cd services/ui && npm run build
Context: @package.json, @tsconfig.json only
Expand: Add specific error file only
Fix: Resolve immediate issue
```

## Resolution Checklist
- [ ] Identify specific error message
- [ ] Start with minimal context
- [ ] Fix only the immediate issue
- [ ] Test the fix works
- [ ] Don't expand scope during debugging
- [ ] Complete → New session 
```

### local-testing.md
```md
# Local Testing Procedure

## Overview
Local testing using PostgreSQL copy of production data for safe development.

## Quick Start
1. Run setup script: `local/testing/setup-local-db.ps1`
2. Create `.env` in service directory (see template below)
3. Test with: `node test-local-scraping.js`

## Environment Setup

### Environment Template
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/veritas_local
NODE_ENV=development
PORT=3001
```

### File Locations
- UI Service: `services/ui/.env`
- Scraper Service: `services/scraper/.env`

## Key Points
- **NEVER commit .env files**
- Use local DB for all testing
- Clear test data between sessions
- See `local/testing/LOCAL-TESTING-GUIDE.md` for full details

## Testing Workflow

### 1. Setup Local Database
```powershell
# Run PowerShell script to create local database copy
.\local\testing\setup-local-db.ps1

# This will:
# - Create local PostgreSQL database
# - Import production schema
# - Set up test data
```

### 2. Configure Environment
```bash
# Create .env file in service directory
# Copy template above
# Update with your local PostgreSQL password
```

### 3. Run Tests
```bash
# For UI service
cd services/ui
npm run dev

# For scraper service
cd services/scraper
node test-local-scraping.js
```

### 4. Clean Up
```sql
-- Remove test data after testing
DELETE FROM scraped_content WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM factoids WHERE status = 'draft';
```

## Security Checklist
- [ ] .env files are in .gitignore
- [ ] No passwords in code
- [ ] SQL dumps are ignored
- [ ] Test scripts use local DB only
- [ ] No production URLs in test files

## Common Testing Scenarios

### UI Development
1. Set up local database
2. Create .env with local DATABASE_URL
3. Run `npm run dev` from services/ui
4. Test features against local data
5. No risk to production

### Scraper Testing
1. Set up local database
2. Configure scraper .env file
3. Run test-local-scraping.js
4. Verify content insertion
5. Check error handling

### Database Changes
1. Test migration on local DB first
2. Verify schema changes work
3. Test rollback procedure
4. Apply to production only after success

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running locally
- Check password in .env file
- Ensure database exists: `veritas_local`
- Check port 5432 is available

### Environment Variable Issues
- Confirm .env file in correct directory
- Check for typos in variable names
- Ensure no spaces around = in .env
- Restart dev server after .env changes

### Data Issues
- Run setup script to refresh schema
- Clear old test data regularly
- Use meaningful test data
- Don't rely on production data

## Best Practices

### Local Development
- Always use local database for development
- Create realistic test data
- Test edge cases locally
- Verify changes before pushing

### Data Management
- Keep test data minimal
- Use clear naming for test records
- Clean up after testing sessions
- Document any special test cases

### Security
- Never expose production credentials
- Use different passwords locally
- Keep .env files out of version control
- Review code for hardcoded values 
```

### plan-first-development.md
```md
# Plan-First Development Procedure

For features requiring 3+ files or 30+ minutes of work.

## Planning Template

```markdown
## Implementation Plan: [Feature Name]

### Requirements
- Goal: [Specific objective]
- Scope: [What will/won't change]
- Files: [@file1, @file2, @file3]

### Steps
1. [Specific action with file]
2. [Specific action with file]
3. [Test and validate]

### Success Criteria
- [ ] Feature works as intended
- [ ] Build passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Documentation story planned (for projects)

**Approve plan before proceeding**
```

## Multi-Phase Features

### Phase Structure
- **Phase 1**: Foundation (core files, data structures)
- **Phase 2**: Integration (connections, API endpoints)
- **Phase 3**: Polish (UI/UX, error handling)
- **Final Phase**: Documentation (follow documentation procedure)
- Each phase = separate plan and session

### Phase Template
```markdown
## Phase [X]: [Phase Name]

### Objective
[What this phase accomplishes]

### Dependencies
- Previous phases: [List completed phases]
- Required files: [@specific/files.ts]

### Implementation
1. [Step with specific file changes]
2. [Step with specific file changes]
3. [Validation step]

### Deliverables
- [ ] [Specific working feature]
- [ ] [Tests or validation]
- [ ] [Documentation update]
```

## User Story Format

When working on user stories:

```markdown
## User Story: [As a user, I want to...]

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Technical Approach
- Database: [Schema changes needed]
- API: [New endpoints required]
- UI: [Components to create/modify]

### Implementation Plan
1. Database migration (if needed)
2. API endpoint development
3. UI component creation
4. Integration and testing
5. Documentation update
```

## Approval Process

### Present Plan
1. Show complete plan to user
2. Wait for explicit approval
3. Handle requested modifications
4. Update plan as needed
5. Get final approval before starting

### Modification Handling
- User suggests changes → Update plan
- Scope increases → Break into phases
- Technical blockers → Present alternatives
- Timeline concerns → Simplify approach

## Execution Guidelines

### Systematic Execution
- Follow plan exactly as approved
- No deviation without consultation
- Complete each step before moving on
- Test at each milestone
- Document progress in plan

### Progress Tracking
```markdown
### Steps
1. ✅ [Completed step]
2. 🔄 [In progress step]
3. ⬜ [Pending step]
```

## Common Planning Scenarios

### New Feature
- Requires 3-5 files minimum
- Touches database, API, and UI
- Use phased approach
- Test each layer independently

### Major Refactor
- List all affected files upfront
- Plan rollback strategy
- Execute in small batches
- Maintain working state throughout

### Bug Fix with Side Effects
- Document all affected areas
- Plan regression testing
- Consider temporary workarounds
- Update related documentation 
```

### branching-and-workflow.md
```md
# Branching and Workflow Procedure

## Absolute Rules
- **NEVER push directly to main branch**
- **Always create feature branches**
- **Test thoroughly before requesting merge**
- **Update documentation in same branch as code**
- **Manual merge only by project maintainer**

## Branch Naming Convention

```bash
feature/short-description     # New features
fix/bug-description          # Bug fixes
refactor/area-description    # Code refactoring
docs/section-update          # Documentation updates
```

### Examples
```bash
feature/add-search
fix/api-error-handling
refactor/database-queries
docs/update-setup-guide
```

## Workflow Steps

### 1. Create Feature Branch
```bash
# Ensure you're on latest main
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b feature/your-feature-name
```

### 2. Development Process
- [ ] Write code following development principles
- [ ] Test locally: `cd services/ui && npm run build && npm run lint`
- [ ] Update relevant documentation files
- [ ] Commit with clear messages

### 3. Commit Guidelines
```bash
# Good commit messages
git commit -m "feat: add search functionality to factoid feed"
git commit -m "fix: resolve API timeout on large queries"
git commit -m "docs: update database schema documentation"

# Use conventional commits format
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
```

### 4. Push and Review Request
```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request via GitHub
# Include:
# - Clear description of changes
# - Link to related issues
# - Testing performed
# - Documentation updates
```

## Documentation Requirements

### CRITICAL: Update these files with every relevant commit
1. **`software-architecture.md`** - When architecture/database changes
2. **`developer-guidelines.md`** - When development practices change
3. **`product-requirements.md`** - When features/UX changes

### Documentation Checklist
- [ ] Is the change user-facing? → Update product docs
- [ ] Does it change architecture? → Update technical docs
- [ ] New development pattern? → Update guidelines
- [ ] API changes? → Update API documentation
- [ ] Project completion? → Follow documentation procedure

## Testing Before Merge

### Required Checks
```bash
# From services/ui directory
cd services/ui
npm run build    # Must pass
npm run lint     # Must pass

# For scraper changes
cd services/scraper
npm run build    # Must pass
```

### Manual Testing
- [ ] Feature works as intended
- [ ] No regressions in existing features
- [ ] UI components support dark mode
- [ ] Responsive design maintained
- [ ] Error handling works properly

## Merge Process

### Pre-Merge Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Documentation story assigned (for projects)
- [ ] Code reviewed (if team environment)
- [ ] No merge conflicts with main
- [ ] Deployment considerations documented

### Post-Merge
- [ ] Verify deployment successful
- [ ] Test in production environment
- [ ] Monitor for any issues
- [ ] Update project status if needed

## Handling Conflicts

### Merge Conflict Resolution
```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/your-feature
git merge main

# Resolve conflicts in editor
# Test thoroughly after resolution
# Commit the merge
git add .
git commit -m "merge: resolve conflicts with main"
```

## Emergency Procedures

### Reverting Changes
```bash
# If issues found after merge
git revert <commit-hash>
git push origin main

# Document what went wrong
# Plan fix in new feature branch
``` 
```

### documentation.md
```md
# Documentation Procedure

## Context Selection (Dynamic)
```
Based on project scope, may include:
- Git history: PR details, commits, diffs
- Project files: Stories, requirements, plans
- Code changes: New files, modifications
- Existing docs: All potentially affected documentation
```

## Quick Procedure
- [ ] Gather project/feature information interactively
- [ ] Analyze all changes (code, database, architecture)
- [ ] Dynamically map changes to documentation needs
- [ ] Create comprehensive documentation plan
- [ ] Execute updates systematically
- [ ] Verify cross-references and completeness
- [ ] Create ADRs for significant decisions

## Interactive Information Gathering

### Phase 1: Project Context Collection

REQUEST: "Please provide the following project details:
- Project/Feature name: _______________
- Implementation dates: Start: _____ End: _____
- PR numbers: #___, #___, #___ (comma-separated)
- Related issues/tickets: _______________
- Key stories completed: _______________
- Project directory (if applicable): _______________"

If PR numbers not provided:
REQUEST: "Please provide either:
- Git commit range (e.g., abc123..def456)
- List of key files changed
- Description of main changes made"

### Phase 2: Change Type Analysis

REQUEST: "Analyzing the changes... Please confirm these change categories:
[AI will auto-detect and present, user confirms/modifies]

Detected changes:
- [ ] Database: [list tables/columns affected]
- [ ] APIs: [list new/modified endpoints]
- [ ] UI Components: [list components]
- [ ] Architecture: [list architectural changes]
- [ ] Features: [list user-facing features]
- [ ] Performance: [list optimizations]
- [ ] Other: _______________

Are there additional changes not detected above?"

### Phase 3: Dynamic Documentation Mapping

#### Intelligent Analysis Process

1. **Code Change Analysis**
   ```
   For each changed file:
   - Identify file type and purpose
   - Find existing documentation covering this area
   - Determine documentation impact
   ```

2. **Feature Impact Analysis**
   ```
   For each feature/story:
   - Map to user-facing documentation
   - Identify technical documentation needs
   - Find related features requiring updates
   ```

3. **Architecture Impact Analysis**
   ```
   For architectural changes:
   - Determine if ADR is needed
   - Map to architecture documentation
   - Identify affected procedures
   ```

#### Documentation Plan Generation

The AI will present:
"Based on analysis of [project name], here's the documentation plan:

**Database Documentation** (if applicable)
- `database/schema.sql` - Update with [specific changes]
- `database/README.md` - Add migration notes for [changes]
- NEW: `database/migrations/[date]-[description].sql` - Create migration file

**Feature Documentation**
- `documentation/features/[existing].md` - Update [sections] for [reasons]
- NEW: `documentation/features/[new-feature].md` - Document [feature name]

**API Documentation**
- `documentation/features/08-api-system.md` - Add endpoints: [list]
- Update response examples for [changes]

**Architecture Documentation**
- `documentation/software-architecture.md` - Update [components/services]
- NEW: `documentation/decisions/ADR-XXX-[title].md` - Document decision on [topic]

**Business Logic Updates**
- `documentation/business-logic-and-glossary.md` - Add terms: [list]
- Update workflows for [processes]

**Keystone Updates**
- `keystone/procedures/[relevant].md` - Update for new patterns
- `keystone/development-principles.md` - Add principles if needed

**Cross-Reference Updates**
- Update links in [files] to reference new documentation
- Add new feature to `documentation/features/README.md`
- Update `documentation/the-product.md` if user-facing

REQUEST: "Please review this plan. Are there any:
1. Missing documentation areas?
2. Additional context needed?
3. Specific sections you want emphasized?"

### Phase 4: Documentation Template Selection

Based on needs identified, provide appropriate templates:

#### New Feature Documentation Template
```markdown
# Feature: [Name]

## Overview
[1-2 sentence description]

## User Story
As a [user type], I want [capability] so that [benefit].

## Technical Implementation
- **Location**: `[code location]`
- **Components**: [list key components]
- **Database**: [any schema changes]
- **APIs**: [endpoints used/created]

## Key Features
1. **[Feature aspect]**
   - [Details]
   - [Technical notes]

## User Workflows
[Describe how users interact]

## Related Features
- [Links to related documentation]
```

#### ADR Template Reference
```markdown
# ADR-XXX: [Title]

## Status
[Proposed/Accepted/Deprecated] ([Date])

## Context
[What prompted this decision]

## Decision
[What was decided]

## Consequences
[Positive, negative, and neutral impacts]
```

### Phase 5: Execution Guidance

For each documentation update:

1. **Pre-Update Checklist**
   - [ ] Read current documentation
   - [ ] Understand existing structure
   - [ ] Identify insertion points

2. **Update Guidelines**
   - Maintain existing tone and style
   - Use consistent formatting
   - Include code examples where helpful
   - Add cross-references

3. **Quality Checks**
   - [ ] Technical accuracy
   - [ ] Completeness
   - [ ] Cross-references work
   - [ ] No broken links
   - [ ] Consistent terminology

### Phase 6: Verification

Final verification checklist:
- [ ] All identified changes documented
- [ ] Cross-references updated
- [ ] New features in feature index
- [ ] Architecture changes reflected
- [ ] Business terms added to glossary
- [ ] Procedures updated if needed
- [ ] No orphaned documentation
- [ ] Build still passes

REQUEST: "Documentation updates complete. Please verify:
1. Run any build commands to ensure no breaks
2. Review the updated documentation
3. Confirm all project changes are captured"

## Common Patterns

### Database Change Documentation
```
1. Update schema.sql with new structure
2. Add migration file with rollback
3. Update README with migration notes
4. Update affected feature docs
5. Add new terms to glossary
```

### New Component Documentation
```
1. Update architecture.md
2. Create/update feature doc
3. Update UI procedure if patterns added
4. Add to component inventory
5. Document props/interfaces
```

### API Change Documentation
```
1. Update API system doc
2. Modify affected feature docs
3. Update integration examples
4. Document breaking changes
5. Update response formats
```

## Troubleshooting

**Missing Information**
- Check git history
- Review PR descriptions
- Examine test files
- Look for related issues

**Unclear Documentation Needs**
- Start with obvious changes
- Follow code dependencies
- Check for user impact
- Consider maintenance needs

**Large Projects**
- Break into logical sections
- Document incrementally
- Maintain running checklist
- Review periodically

## Example Usage

### Small Feature Addition
```
1. Gather: "Added tooltip component to job dashboard"
2. Analyze: New UI component, updated dashboard
3. Map: UI procedure needs tooltip pattern, dashboard doc needs update
4. Plan: 2 files to update
5. Execute: Add patterns, update feature
6. Verify: Cross-references work
```

### Major Project
```
1. Gather: "Scraper Engine Refinement - PRs #48-56"
2. Analyze: Database changes, new UI components, API updates
3. Map: 17 documentation files identified
4. Plan: Detailed update list with reasons
5. Execute: Systematic updates with templates
6. Verify: All changes captured
```

## Integration Notes

- This procedure is referenced by all project documentation stories
- It should be followed for any significant code changes
- The dynamic mapping ensures comprehensive coverage
- Interactive prompts prevent missing information

## Related Procedures
- [Branching and Workflow](./branching-and-workflow.md)
- [UI Development](./ui-development.md)
- [Database Work](./database-work.md)
- [API Development](./api-development.md)
```

</details>

<details>
<summary>🎯 Code Patterns</summary>

### route.ts
*Note: Showing relevant excerpts only*
```ts
export async function GET(): Promise<NextResponse> {
  try {
    const result = await query(`
      SELECT f.*, 
             COALESCE(tags_agg.tags, '[]'::json) as tags,
             COALESCE(sources_agg.sources, '[]'::json) as sources
      FROM factoids f
      LEFT JOIN (
        SELECT ft.factoid_id,
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'slug', t.slug,
                   'description', t.description,
                   'is_active', t.is_active
                 )
               ) as tags
        FROM factoid_tags ft
        JOIN tags t ON ft.tag_id = t.id
        WHERE t.is_active = true
        GROUP BY ft.factoid_id
      ) tags_agg ON f.id = tags_agg.factoid_id
      LEFT JOIN (
        SELECT fs.factoid_id,
               json_agg(
                 json_build_object(
                   'id', s.id,
                   'name', s.name,
                   'domain', s.domain,
                   'url', s.rss_url,
                   'icon_url', s.icon_url,
                   'scraped_content', json_build_object(
                     'id', sc.id,
                     'source_url', sc.source_url,
                     'title', sc.title,
                     'content', sc.content,
                     'author', sc.author,
                     'publication_date', sc.publication_date,
                     'content_type', sc.content_type,
                     'language', sc.language
                   )
                 )
               ) as sources
        FROM factoid_sources fs
        JOIN scraped_content sc ON fs.scraped_content_id = sc.id
        JOIN sources s ON sc.source_id = s.id
        GROUP BY fs.factoid_id
      ) sources_agg ON f.id = sources_agg.factoid_id
      WHERE f.status = 'published'
      ORDER BY f.created_at DESC
    `);

    const factoids = result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));

    return NextResponse.json(factoids);
  } catch (error) {
    console.error('Database error - falling back to mock data:', error);
    
    // Return mock data as fallback
    console.log('⚠️ [API] Database unavailable, returning mock data');
    return NextResponse.json(mockFactoids);
  }

```

### dashboard-tab.tsx
*Note: Showing relevant excerpts only*
```tsx
"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Play, 
  CheckCircle, 
  FileText, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  CircleCheck,
  CircleX,
  CircleDot,
  Copy,
  Check
} from 'lucide-react'
import { DashboardMetrics, ScrapingJob, JobLog, PaginatedResponse } from '../types'

interface DashboardTabProps {
  refreshTrigger: number
}

export function DashboardTab({ refreshTrigger }: DashboardTabProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [jobLogs, setJobLogs] = useState<Record<string, JobLog[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortField, setSortField] = useState<'triggeredAt' | 'sourcesRequested' | 'totalArticlesScraped' | 'duration' | 'status'>('triggeredAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      const [metricsRes, jobsRes] = await Promise.all([
        fetch('/api/scraper/metrics'),
        fetch('/api/scraper/jobs')
      ])
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }
      
      if (jobsRes.ok) {
        const jobsData: PaginatedResponse<ScrapingJob> = await jobsRes.json()
        console.log('Dashboard jobs data:', jobsData.data) // Debug log
        setJobs(jobsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchJobLogs = async (jobId: string) => {
    try {
      console.log('Fetching logs for job:', jobId); // Debug log
      const response = await fetch(`/api/scraper/jobs/${jobId}/logs`)
      console.log('Logs response status:', response.status); // Debug log
      
      if (response.ok) {
        const data: PaginatedResponse<JobLog> = await response.json()
        console.log('Logs data:', data); // Debug log
        setJobLogs(prev => ({ ...prev, [jobId]: data.data }))
      } else {
        console.error('Logs API returned error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch job logs:', error)
    }
  }

  const toggleJobExpanded = async (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
      if (!jobLogs[jobId]) {
        await fetchJobLogs(jobId)
      }
    }
    setExpandedJobs(newExpanded)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'successful':
        return <CircleCheck className="h-4 w-4 text-green-500" />
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <CircleX className="h-4 w-4 text-red-500" />
      case 'new':
        return <CircleDot className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeColor = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'new':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const calculatePerSourceStats = (jobId: string, sourcesRequested: string[], articlesPerSource: number) => {
    const logs = jobLogs[jobId] || []
    const sourceStats: Record<string, { scraped: number; requested: number }> = {}
    
    // Initialize all sources with their requested count
    sourcesRequested.forEach(source => {
      sourceStats[source] = { scraped: 0, requested: articlesPerSource }
    })
    
    // Find completion logs for each source to get actual scraped count
    logs.forEach(log => {
      if (log.sourceName && log.message.includes('Source scraping completed') && log.additionalData) {
        const sourceName = log.sourceName
        const scrapedCount = log.additionalData.articles_scraped || 0
        if (sourceStats[sourceName]) {
          sourceStats[sourceName].scraped = scrapedCount
        }
      }
    })
    
    return sourceStats
  }

  const copyJobLogs = async (jobId: string) => {
    const logs = jobLogs[jobId] || []
    const logText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString()
      const fullLogData = {
        timestamp,
        level: log.logLevel,
        message: log.message,
        sourceName: log.sourceName,
        additionalData: log.additionalData
      }
      return `[${timestamp}] ${JSON.stringify(fullLogData, null, 2)}`
    }).join('\n\n')
    
    try {
      await navigator.clipboard.writeText(logText)
      setCopiedJobId(jobId)
      setTimeout(() => setCopiedJobId(null), 2000)
    } catch (error) {
      console.error('Failed to copy logs:', error)
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aVal: any, bVal: any
    
    switch (sortField) {
      case 'triggeredAt':
        aVal = new Date(a.triggeredAt).getTime()
        bVal = new Date(b.triggeredAt).getTime()
        break
      case 'sourcesRequested':
        aVal = Array.isArray(a.sourcesRequested) ? a.sourcesRequested.length : 0
        bVal = Array.isArray(b.sourcesRequested) ? b.sourcesRequested.length : 0
        break
      case 'totalArticlesScraped':
        aVal = a.totalArticlesScraped || 0
        bVal = b.totalArticlesScraped || 0
        break
      case 'duration':
        aVal = a.duration || 0
        bVal = b.duration || 0
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      default:
        aVal = 0
        bVal = 0
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Triggered</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.jobsTriggered || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Completed jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Scraped</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.articlesScraped || 0}</div>
            <p className="text-xs text-muted-foreground">Total content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics?.averageJobDuration)}</div>
            <p className="text-xs text-muted-foreground">Per job</p>
          </CardContent>
        </Card>
      </div>

      {/* Job History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found. Start a new scraping job to see it here.
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('triggeredAt')}
                  >
                    <div className="flex items-center gap-2">
                      Timestamp
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sourcesRequested')}
                  >
                    <div className="flex items-center gap-2">
                      Sources
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Requested Articles</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalArticlesScraped')}
                  >
                    <div className="flex items-center gap-2">
                      Scraped
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-2">
                      Duration
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Expand</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map(job => (
                  <React.Fragment key={job.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {new Date(job.triggeredAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span 
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onMouseEnter={() => {
                                if (!jobLogs[job.id]) {
                                  fetchJobLogs(job.id)
                                }
                              }}
                            >
                              {Array.isArray(job.sourcesRequested) ? job.sourcesRequested.length : 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3">
                            {Array.isArray(job.sourcesRequested) && job.sourcesRequested.length > 0 ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm mb-2">Sources:</div>
                                {(() => {
                                  const sourceStats = calculatePerSourceStats(job.id, job.sourcesRequested, job.articlesPerSource)
                                  return job.sourcesRequested.map((source, index) => {
                                    const stats = sourceStats[source]
                                    return (
                                      <div key={index} className="text-xs flex justify-between items-center">
                                        <span>• {source}</span>
                                        <span className="ml-2 text-muted-foreground">
                                          ({stats.scraped}/{stats.requested})
                                        </span>
                                      </div>
                                    )
                                  })
                                })()}
                              </div>
                            ) : (
                              <div className="text-xs">No sources</div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(job.sourcesRequested) ? job.sourcesRequested.length * job.articlesPerSource : 0}
                      </TableCell>
                      <TableCell>
                        {job.totalArticlesScraped || 0}
                      </TableCell>
                      <TableCell>
                        {formatDuration(job.duration)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleJobExpanded(job.id)}
                        >
                          {expandedJobs.has(job.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedJobs.has(job.id) && jobLogs[job.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium">Job Logs</div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyJobLogs(job.id)}
                                className="flex items-center gap-2 h-8"
                              >
                                {copiedJobId === job.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy All
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="border rounded-lg bg-background">
                              <div className="bg-muted/50 px-3 py-2 border-b text-xs font-mono text-muted-foreground">
                                Job Log Viewer - {(jobLogs[job.id] || []).length} entries
                              </div>
                              <div className="max-h-96 overflow-y-auto font-mono text-xs">
                                {(jobLogs[job.id] || []).map((log, index) => {
                                  const timestamp = new Date(log.timestamp).toISOString()
                                  const fullLogData = {
                                    timestamp,
                                    level: log.logLevel,
                                    message: log.message,
                                    sourceName: log.sourceName,
                                    additionalData: log.additionalData
                                  }
                                  
                                  return (
                                    <div 
                                      key={log.id}
                                      className="flex border-b border-muted/30 hover:bg-muted/20"
                                    >
                                      <div className="flex-shrink-0 w-24 px-3 py-2 bg-muted/30 text-muted-foreground border-r border-muted/30 text-right">
                                        {String(index + 1).padStart(3, '0')}
                                      </div>
                                      <div className="flex-1 px-3 py-2">
                                        <div className="flex items-start gap-2">
                                          <span className="text-muted-foreground">
                                            [{timestamp}]
                                          </span>
                                          <div className="flex-1">
                                            <pre className="whitespace-pre-wrap text-foreground break-words">
                                              {JSON.stringify(fullLogData, null, 2)}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
```

### types.ts
```ts
// Job types
export interface ScrapingJob {
  id: string;
  status: 'new' | 'in-progress' | 'successful' | 'partial' | 'failed';
  sourcesRequested: string[];
  articlesPerSource: number;
  totalArticlesScraped: number;
  totalErrors: number;
  triggeredAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Calculated fields (not in database)
  duration?: number;      // calculated from completedAt - triggeredAt
}

export type JobStatus = ScrapingJob['status'];

export interface JobLog {
  id: string;
  jobId: string;
  sourceId?: string;
  sourceName?: string;
  timestamp: string;
  logLevel: 'info' | 'warning' | 'error'; // Camel case for consistency with API response
  message: string;
  additionalData?: Record<string, any>; // From JSONB
}

// Content types
export interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl: string;
  sourceId: string;        // UUID foreign key to sources table
  sourceName?: string;     // Calculated field from JOIN with sources table
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  contentHash: string;     // For duplicate detection
  fullHtml?: string;       // Original HTML
  createdAt: string;
  // Note: processedAt column doesn't exist in database schema
}

export type ProcessingStatus = ScrapedArticle['processingStatus'];

// Source types
export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  rssUrl: string;
  iconUrl?: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;  // milliseconds
  userAgent: string;
  timeoutMs: number;
  createdAt: string;
  // Calculated metrics (not in DB)
  totalArticles?: number;
  lastJobStatus?: JobStatus;
  successfulJobs?: number;
  failedJobs?: number;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: any;
}

// Request/Response types
export interface TriggerScrapingRequest {
  sources: string[];      // Source names from database
  maxArticles: number;    // Articles per source
}

export interface TriggerScrapingResponse {
  jobId: string;
  status: 'started';
  message: string;
}

export interface GetJobsRequest {
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20
  status?: JobStatus;     // Filter by status
}

export interface GetJobResponse {
  job: ScrapingJob;
}

export interface GetJobLogsRequest {
  page?: number;
  pageSize?: number;
}

export interface CancelJobResponse {
  success: boolean;
  message: string;
}

export interface GetContentRequest {
  page?: number;
  pageSize?: number;
  search?: string;          // Text search
  source?: string;          // Filter by source
  language?: string;        // Filter by language  
  status?: ProcessingStatus; // Filter by status
}

export interface GetArticleResponse {
  article: ScrapedArticle;
}

export interface GetSourcesResponse {
  sources: NewsSource[];
}

// Helper types
export interface LogJobActivityParams {
  jobId: string;
  sourceId?: string | null;
  level: 'info' | 'warning' | 'error';
  message: string;
  additionalData?: Record<string, any>;
}

export interface ArticleFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: string;
  language?: string;
  status?: ProcessingStatus;
}

export interface ProgressState {
  totalSources: number;
  processedSources: number;
  currentSource?: string;
  articlesPerSource: number;
  totalArticlesExpected: number;
  articlesProcessed: number;
  articlesErrored: number;
}

export interface ArticleContent {
  title: string;
  content: string;
  author?: string | null;
  date?: string | null;
}

export interface DashboardMetrics {
  jobsTriggered: number;
  successRate: number;
  articlesScraped: number;
  averageJobDuration: number;
  activeJobs: number;
  recentErrors: number;
} 
```

</details>

<details>
<summary>🎯 Project Structure</summary>

### README.md
```md
# New Project Template

This template provides the structure for new development projects following the Keystone framework.

## Project Structure

```
[Project Number]. [Project Name] - [DD/MM/YY] - [Status]
├── README.md                 # This file - project overview
├── requirements.md           # High-level requirements
├── high-level-plan.md       # Overall project plan
└── stories/                 # Individual user stories
    ├── 1. [Story Name] - [Status].md
    ├── 2. [Story Name] - [Status].md
    └── ...
```

## Status Values
- `New`: Not yet started
- `In-Progress`: Currently being worked on
- `Done`: Completed and deployed

## Creating a New Project

1. Copy this template directory
2. Rename following convention: `1. First Project - 19/07/25 - New`
3. Update README.md with project details
4. Create requirements.md with:
   - Project overview
   - Success criteria
   - Proposed database changes
   - Test scenarios
5. Create high-level-plan.md with phased approach
6. Break down into user stories in stories/ directory

## User Story Guidelines

Each story should be:
- Self-contained and deployable
- Written from user perspective
- Testable end-to-end
- Incremental (builds on previous stories)

## Story Template

See `stories/story-template.md` for the standard format.

## Important Notes

- Stories should be very incremental
- Each story must include UI aspects for testing
- Infrastructure work should be minimal
- Always include debugging and documentation stories
- During debugging, never change DB schema unless in a story 
```

### story-template.md
```md
# [Story Number]. [Story Name] - [Status]

## User Story
As a [type of user], I want to [action/feature] so that [benefit/value].

## Acceptance Criteria
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

## Technical Approach

### Database Changes
- [List any schema modifications needed]
- [Migration scripts required]

### API Changes
- [New endpoints to create]
- [Existing endpoints to modify]

### UI Changes
- [Components to create/modify]
- [Pages affected]
- [User flow changes]

## Implementation Context
```
Required files:
- @services/ui/app/[relevant-file].tsx
- @services/ui/lib/[relevant-file].ts
- @database/migrations/[if-needed].sql
```

## Success Test
Describe how to test this story is complete:
1. [Step to perform]
2. [Expected result]
3. [Validation criteria]

## Dependencies
- Previous stories: [List any prerequisite stories]
- External dependencies: [APIs, libraries, etc.]

## Implementation Notes
[Any specific technical details, gotchas, or important context for the developer implementing this story]

## Progress Tracking
- [ ] Development started
- [ ] Implementation complete
- [ ] Testing passed
- [ ] Documentation updated
- [ ] Deployed to production 
```

</details>

<details>
<summary>🎯 Infrastructure</summary>

### env.example
```example
# Railway PostgreSQL Configuration (Recommended)
DATABASE_PROVIDER=railway

# Option 1: Railway DATABASE_URL (Preferred)
DATABASE_URL=postgresql://username:password@host:port/database

# Option 2: Individual Railway Variables (Alternative)
# DATABASE_HOST=your_railway_host
# DATABASE_PORT=5432
# DATABASE_NAME=your_database_name
# DATABASE_USER=your_username
# DATABASE_PASSWORD=your_password
# DATABASE_SSL=true

# Connection Pool Configuration (Optional - Railway Only)
# DATABASE_POOL_MAX=20           # Maximum connections in pool (default: 20)
# DATABASE_POOL_MIN=2            # Minimum connections in pool (default: 2)
# DATABASE_IDLE_TIMEOUT=30000    # Idle connection timeout in ms (default: 30000)
# DATABASE_CONNECTION_TIMEOUT=2000  # Connection timeout in ms (default: 2000)

# Additional Environment Variables
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### development-principles.md
```md
# Keystone Framework - Development Principles

## 1. Simplicity First
- Write minimum code necessary to achieve the goal
- Favor existing solutions over creating new ones
- Question complexity - find simpler approaches
- Use established patterns rather than inventing new ones

## 2. Incremental Development
- Add features only when actually needed
- Start with minimal viable implementation
- Test thoroughly before expanding functionality
- Document changes immediately

## 3. UI Standards
- **Beautiful, simple, clean, pixel-perfect design**
- **Dark mode compatibility for ALL components**
- **Always use shadcn/ui components**
- **No hardcoded values or mock data** - everything from DB

### UI Component Pattern
```typescript
// ✅ Use shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ✅ Standard component pattern
interface ComponentProps {
  data: DataType
  onAction?: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  return (
    <Card className="dark:border-gray-800">
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

## 4. Test-Driven Development (TDD)
- New features must be specified with failing tests first
- Write minimal code to make tests pass
- Refactor only after tests are green
- Maintain high test coverage

## 5. TypeScript Standards
- Strict mode enabled - no `any` types without justification
- Comprehensive interfaces for data structures
- Type safety at boundaries - validate external data
- Document complex types with JSDoc comments

## 6. Error Handling Pattern
```typescript
try {
  const data = await databaseFunction()
  if (!data) {
    throw new Error(`Data not found: ${id}`)
  }
  return data
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error(`Database error: ${error.message}`)
}
```

## 7. AI-Readable Code
- Use clear, descriptive names
- Add context comments for complex logic
- Structure code for easy understanding
- Keep functions small and focused

## 8. Data Display Patterns
- Use tables for lists of similar items (jobs, sources, etc.)
- Implement client-side sorting for better performance
- Add visual feedback for all user interactions
- Keep data dense but scannable
- Use tooltips for additional context without clutter

### Table UI Pattern
```typescript
// ✅ Sortable table with clear visual hierarchy
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="cursor-pointer" onClick={() => sort('column')}>
        Column {sortDirection === 'asc' ? '↑' : '↓'}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 9. Modal Interaction Pattern
- Use modals for focused user tasks
- Pre-select sensible defaults
- Validate input before submission
- Show clear feedback on success/error
- Close automatically on successful completion

## 10. Code Quality Checklist
- [ ] No hardcoded values or mock data
- [ ] All UI components support dark mode
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling throughout
- [ ] Tests written before implementation
- [ ] Tables used for data lists
- [ ] Client-side sorting implemented
- [ ] Modals for focused interactions 
```

</details>

<details>
<summary>📦 Service Dependencies</summary>

### UI Service
**Dependencies:**
- @radix-ui/react-checkbox
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-select
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-tooltip
- class-variance-authority
- clsx
- lucide-react
- next
- pg
- react
- react-dom
- tailwind-merge
- tailwindcss-animate

**Dev Dependencies:**
- @types/node
- @types/pg
- @types/react
- @types/react-dom
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- autoprefixer
- eslint
- eslint-config-next
- tailwindcss
- tsx
- typescript

### Scraper Service
**Dependencies:**
- @types/pg
- cors
- crawlee
- dotenv
- express
- node-fetch
- pg
- playwright
- rss-parser
- uuid

**Dev Dependencies:**
- @types/cors
- @types/express
- @types/node
- @types/uuid
- ts-node
- typescript

</details>

