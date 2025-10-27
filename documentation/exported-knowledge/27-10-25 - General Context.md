# Veritas Project - General Context Documentation

## Overview

This document provides comprehensive context about the Veritas project, including product vision, technical architecture, features, and development practices. It serves as a general reference for understanding the project without specific guidance for external LLMs.

## Document Purpose

This export contains detailed information about:
- Product vision and business logic
- Technical architecture and infrastructure
- Current features and capabilities
- Development framework and procedures
- Code patterns and examples
- Historical decisions and active development

The information is presented factually without instructional guidance, making it suitable for various use cases including:
- Project onboarding
- Technical reviews
- Architecture discussions
- Feature planning
- Knowledge transfer

## Project Overview

### What is Veritas?

Veritas is a news aggregation and factoid extraction platform that helps users discover and track important information from various sources. The platform consists of three main services:

1. **UI Service**: A Next.js 15.3.5 frontend application providing the user interface
2. **Scraper Service**: A Crawlee-based content aggregation service with monitoring capabilities
3. **Database Service**: A PostgreSQL instance shared by both services

### Key Characteristics

- **No Authentication**: Simplified public access without user management
- **Direct Database Access**: Both services connect directly to PostgreSQL
- **Service Communication**: UI proxies scraper API calls via internal Railway URLs
- **Minimal Dependencies**: Only essential packages to reduce complexity
- **Incremental Development**: Features built in small, testable increments
- **User-Centric Design**: Every feature serves a clear user need

### Target Users

The platform is designed for individuals who:
- Need to stay informed about specific topics
- Want curated, factual information from multiple sources
- Prefer clean, distraction-free reading experiences
- Value source transparency and verification

## Metadata
- **Export Date**: 27-10-25 17:05:40
- **Git Commit**: caf286d
- **Use By Date**: 03-11-25 (context valid for 7 days)
- **Export Type**: General Context
- **Purpose**: Comprehensive product and technical documentation

<details>
<summary>📂 Product Documentation</summary>

### README.md
```md
# Veritas

A modern news aggregation platform that transforms traditional news consumption by presenting verified information through structured "factoids" instead of lengthy articles.

## Overview

**Veritas** combats information overload by providing factual, multi-sourced summaries of current events. The system processes news from multiple sources and presents verified facts in an easily digestible format, with first-class support for Hebrew and Arabic content.

## Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/veritas.git
cd veritas

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file:

**Railway PostgreSQL (Recommended):**
```env
# Database Provider
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
```

**Supabase (Legacy - Migration in Progress):**
```env
# DATABASE_PROVIDER=supabase  # Leave commented for Railway
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Validate Configuration:**
```bash
# Verify environment setup
npm run test:env
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Technology Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Database**: Railway PostgreSQL (with legacy Supabase support)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **Deployment**: Railway
- **Language**: TypeScript (strict mode)

## Key Features

- **Factoid-based News**: Structured summaries instead of full articles
- **Multi-source Verification**: Every factoid linked to verified sources
- **Multilingual Support**: Native Hebrew/Arabic RTL support
- **Responsive Design**: Optimized for mobile and desktop
- **Dark/Light Theme**: Built-in theme switching
- **Performance Optimized**: Sub-2-second page loads

## Documentation

For detailed information, see the `documentation/` directory:

- **[Product Requirements](documentation/product-requirements.md)** - User requirements, use cases, and business logic
- **[Technical Design](documentation/technical-design.md)** - Architecture, tech stack, and system design
- **[Developer Guidelines](documentation/developer-guidelines.md)** - Development standards and best practices
- **[Planning](documentation/planning/)** - Historical project planning documents and implementation records

## Development Workflow

1. **Create feature branch** from main
2. **Follow developer guidelines** in documentation/
3. **Update relevant documentation** with changes
4. **Test thoroughly** before pushing
5. **Manual review and merge** to main

**Important**: Never push directly to main branch. All changes must go through feature branches.

## Deployment

- **Platform**: Railway with automatic deployments
- **Environment**: Production variables configured
- **Monitoring**: Railway built-in observability

## Contributing

Please read the [Developer Guidelines](documentation/developer-guidelines.md) before contributing. Key principles:

- **Simplicity first** - write minimal, maintainable code
- **Cost consciousness** - consider cloud costs in all decisions  
- **Security by design** - follow security best practices
- **Documentation updates** - update docs with every relevant change

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

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
- **Multi-Source Integration**: BBC, CNN, Fox News, Guardian, NY Times, WSJ, and custom RSS feeds
- **Advanced Extraction**: Multi-strategy extraction with paragraph preservation
- **Real-time Processing**: Automated extraction and classification
- **Duplicate Detection**: Content hash-based deduplication
- **Structural Filtering**: Removes promotional content while preserving articles
- **Content Archival**: Automated cleanup and compression
- **Extraction Tracking**: Optional real-time debugging for quality assurance

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

### business-logic-and-glossary.md
```md
# Business Logic and Glossary

## Core Business Terms

### Content Terms

**Factoid**
- A structured unit of verified information extracted from news articles
- Contains: title, description, bullet points, sources, language, and tags
- Maximum 500 characters for title, up to 10,000 for description
- Up to 20 bullet points per factoid
- Must be verified by multiple sources when possible

**Bullet Point**
- A single, atomic fact extracted from a news article
- Should be self-contained and understandable without context
- Typically 1-2 sentences maximum
- Free from opinion or editorial content

**Source**
- A news organization or content provider (e.g., CNN, Fox News)
- Contains: name, domain, URL, description, RSS feed URL
- Can be active or inactive
- Tracks scraping configuration and health metrics

**Scraped Content**
- Raw article data collected from news sources
- Stored temporarily before processing into factoids
- Contains: title, content, URL, publication date, source reference, job_id
- Subject to deduplication based on content hash
- Linked to originating scraping job for audit trail and traceability

**Tag**
- A category or topic classifier for factoids
- Examples: Politics, Technology, Science, Business, Environment, Health
- Used for filtering and content discovery
- Many-to-many relationship with factoids

### User Terms

**Information-Conscious Professional**
- Primary user persona
- Values time efficiency and accuracy in news consumption
- Seeks facts without editorial bias
- Typically checks news 2-3 times daily for 5-10 minutes

**Multilingual User**
- Secondary user persona
- Requires proper RTL (Right-to-Left) support
- Consumes content in Hebrew or Arabic
- Expects correct text direction and formatting

**Student/Researcher**
- Secondary user persona
- Needs verified, citable information
- Cross-references multiple sources
- Uses deep-dive features for research

### Technical Terms

**RTL Support**
- Right-to-Left text direction for Hebrew and Arabic
- Includes proper text alignment, UI mirroring, and typography
- Implemented via `rtl-utils.ts` utilities

**Content Aggregation**
- Automated process of collecting articles from multiple sources
- Includes RSS feed monitoring and web scraping
- Runs on scheduled intervals via scraper service

**Deduplication**
- Process of identifying and removing duplicate content
- Based on content hashing algorithms
- Prevents same story from appearing multiple times

**Source Health**
- Metrics tracking source reliability and performance
- Includes: success rate, error count, last successful fetch
- Used to identify and disable problematic sources

**Job Traceability**
- Ability to trace scraped content back to its originating scraping job
- Implemented via job_id foreign key in scraped_content table
- Enables audit trails, debugging, and content attribution
- Supports troubleshooting by linking content issues to specific job execution

### Business Rules

**Content Verification**
- Facts should be confirmed by multiple sources when possible
- Conflicting information should be noted in bullet points
- Source attribution must always be included

**Content Freshness**
- Focus on recent news (typically last 24-48 hours)
- Older content may be archived or removed
- Publication dates must be clearly displayed

**Language Detection**
- Automatic detection of content language
- Proper formatting applied based on language (LTR vs RTL)
- UI elements adjust to language requirements

**Quality Standards**
- No opinion or editorial content in factoids
- Clear, concise writing in bullet points
- Accurate source attribution
- Proper categorization with relevant tags

### Status Values

**Factoid Status**
- `published`: Visible to users in the feed
- `draft`: Being prepared, not yet visible
- `archived`: Older content, removed from main feed

**Source Status**
- `active`: Currently being scraped
- `inactive`: Temporarily disabled
- `error`: Experiencing persistent failures

**Scraping Job Status**
- `new`: Job created but not yet started
- `in-progress`: Currently processing sources
- `successful`: All sources completed successfully
- `partial`: Some sources failed, some succeeded
- `failed`: All sources failed or critical error occurred

### Metrics and Monitoring

**Success Rate**
- Percentage of successful scraping operations per source
- Calculated over rolling time window
- Used to identify problematic sources

**Content Volume**
- Number of articles scraped per time period (database-based count from scraped_content table)
- Number of factoids created per time period
- Used for capacity planning

**Error Categories**
- Network errors: Connection failures, timeouts
- Parsing errors: Invalid RSS/HTML structure
- Validation errors: Missing required fields
- Rate limit errors: Too many requests
- Extraction errors: Failed to extract content from web page
- Persistence errors: Failed to save to database
- Teardown errors: Crawler cleanup failures (non-fatal)

### Scraping Process Terms

**Extraction Phase**
- The first phase of content scraping
- Involves fetching web pages and parsing content
- Success measured by articles extracted from HTML
- Tracked separately from database persistence
- Each source has individual extraction metrics

**Persistence Phase**
- The second phase of content scraping
- Involves saving extracted content to database
- Includes duplicate detection and validation
- Success measured by articles actually saved
- May have fewer articles than extraction due to duplicates

**Source Result**
- Comprehensive tracking data for a single source
- Includes extraction metrics and article data
- Used to measure source-specific performance
- Contains RSS items found, candidates processed, successes

**Enhanced Job Metrics**
- Detailed breakdown of job performance
- Separates extraction from persistence metrics
- Shows per-source success/failure information
- Includes actual vs. target success rates

### UI Patterns

**Sortable Tables**
- Primary pattern for displaying lists of data (jobs, sources)
- Client-side sorting for instant feedback
- Visual indicators for sort direction
- Responsive with horizontal scroll on mobile

**Modal Dialogs**
- Used for focused user actions (job configuration, source editing)
- Blocks background interaction
- Clear primary action button
- Auto-closes on successful completion

**Expandable Rows**
- Used for showing detailed information (job logs)
- Smooth animation on expand/collapse
- Preserves table layout
- Lazy loads content for performance 
```

</details>

<details>
<summary>📂 Technical Architecture</summary>

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
│   ├── enhanced-scraper.ts     # Two-phase scraper with extraction/persistence separation and improved error handling
│   ├── enhanced-logger.ts      # Advanced logging with phase-specific tracking
│   ├── job-manager.ts          # Job queue and execution management
│   ├── content-classifier.ts   # Content classification and categorization
│   ├── duplicate-detector.ts   # URL and content-based duplicate prevention
│   ├── source-manager.ts       # Dynamic source configuration management
│   ├── resource-monitor.ts     # System resource monitoring
│   ├── cleanup-manager.ts      # Content cleanup and archival
│   ├── error-handler.ts        # Comprehensive error handling and recovery
│   ├── database.ts             # Enhanced database operations with JSONB support
│   ├── log-queries.ts          # Structured log query utilities
│   ├── types.ts                # Enhanced interfaces with source tracking types
│   ├── utils.ts                # Multi-element extraction with fallback cascade
│   ├── extraction-recorder.ts  # Multi-element aggregation and debugging
│   └── api-server.ts           # Express server with enhanced metrics endpoints
├── package.json                # Crawlee, Playwright, Express dependencies
└── tsconfig.json               # TypeScript configuration
```

**Note**: The scraper service uses `EnhancedRSSScraper` with two-phase processing (extraction and persistence), providing accurate visibility into each phase of the scraping process. Enhanced with proper crawler teardown error handling to prevent cleanup failures.

**Storage Strategy** (ADR-004):
- **Production**: Uses in-memory storage for Crawlee to avoid file system issues in containerized environments
- **Development**: Uses file system storage for debugging and inspection capabilities
- Configuration is automatic based on `NODE_ENV` environment variable

### Service Communication
- **HTTP APIs**: Services communicate via REST endpoints
- **Shared Database**: Both services access same PostgreSQL instance
- **Environment Variables**: Services configured via Railway environment
- **Health Monitoring**: Comprehensive health checks across all services
- **Enhanced APIs**: Source testing, job logs retrieval, granular status tracking
- **Two-Phase Metrics**: Extraction and persistence tracked separately

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
- **Content Extraction Quality**:
  - Multi-strategy extraction (JSON-LD, selectors, meta tags)
  - Paragraph preservation with triple newlines
  - Structural filtering for promotional content (ALL CAPS + links)
  - Real-time extraction tracking with optional debugging
  - Content deduplication via SHA-256 hashing
  - Language detection for RTL support

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

### Testing Infrastructure
Located in `utilities/` directory, providing comprehensive testing and debugging tools:
- **Database Management**: `01-db-setup.sh` (Mac/Linux) and `01-db-setup.ps1` (Windows) for local DB setup with Railway data import
- **Data Cleanup**: `02-db-clear.js` for clearing test data while preserving configuration (supports production)
- **End-to-End Testing**: `03-test-scraper.js` for complete scraping workflow validation
- **API Testing**: `04-test-api.js` standalone test server for API endpoint verification
- **Field Mapping**: `05-test-db-mapping.js` for snake_case/camelCase conversion testing
- **Log Analysis**: `06-test-logs.js` for detailed job log analysis with metrics
- **Extraction Debugging**: `07-extraction-analyzer.js` for visual side-by-side HTML analysis
- **Batch Analysis**: `08-analyze-all-sources.js` for comprehensive source testing
- **E2E Quality**: `09-e2e-extraction-test.js` for extraction quality validation
- **Spacing Validation**: `10-test-spacing.js` for paragraph preservation testing
- **Content Safety**: `11-validate-extraction.js` for filtering safety checks

All utilities follow numbered naming convention and support both interactive and non-interactive modes. Extraction utilities generate HTML reports for visual debugging.

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
-- Note: The job_id field links each piece of content to its originating scraping job,
-- enabling accurate per-job and per-source article count tracking for dashboard metrics
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
    compressed_size BIGINT,
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE SET NULL  -- Links to originating scraping job, enables accurate per-job and per-source article counting for dashboard metrics
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

-- Scraping logs table: Detailed logs for each job with structured JSONB logging
CREATE TABLE IF NOT EXISTS scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    source_id VARCHAR(255),
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    additional_data JSONB, -- Enhanced structured logging data
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
CREATE INDEX IF NOT EXISTS idx_scraped_content_job_id ON scraped_content(job_id);
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

-- Enhanced JSONB indexes for structured logging performance
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON scraping_logs((additional_data->>'event_type'));
CREATE INDEX IF NOT EXISTS idx_logs_http_status ON scraping_logs((additional_data->'http'->>'status')) WHERE additional_data->>'event_type' = 'http';
CREATE INDEX IF NOT EXISTS idx_logs_correlation ON scraping_logs((additional_data->>'correlation_id')) WHERE additional_data->>'correlation_id' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_additional_data_gin ON scraping_logs USING GIN (additional_data);
CREATE INDEX IF NOT EXISTS idx_logs_event_name ON scraping_logs((additional_data->>'event_name'));
CREATE INDEX IF NOT EXISTS idx_logs_perf_snapshots ON scraping_logs(job_id, timestamp) WHERE additional_data->>'event_type' = 'performance';

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
COMMENT ON TABLE scraping_logs IS 'Enhanced structured logging with JSONB data for comprehensive job monitoring and performance analysis';

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

</details>

<details>
<summary>📂 Feature Documentation</summary>

### 01-news-feed.md
```md
# Feature: News Feed (Factoid Display)

## Overview
The core feature of Veritas - displays verified news facts in a clean, card-based interface with topic filtering and multilingual support.

## User Story
As an information-conscious user, I want to browse verified news facts quickly so that I can stay informed without information overload.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/page.tsx`
- **Components**: Factoid cards, topic filter, loading skeletons
- **Data Source**: `/api/factoids` and `/api/tags` endpoints

### Key Features
1. **Topic Filtering**
   - Dynamic tag-based filtering
   - "All" option to view all factoids
   - Real-time filter updates

2. **Factoid Cards**
   - Title, description, bullet points
   - Source attribution
   - Publication date with locale formatting
   - Language indicators
   - Expand/collapse functionality

3. **RTL Support**
   - Automatic text direction for Hebrew/Arabic
   - Proper UI mirroring
   - Locale-specific date formatting

4. **Responsive Design**
   - Mobile-optimized cards
   - Scrollable topic filters on mobile
   - Adaptive text sizes

### API Integration
- **GET /api/factoids**: Fetches all published factoids with tags and sources
- **GET /api/tags**: Retrieves available topic tags
- Fallback to mock data when database unavailable

### State Management
- React hooks for local state
- Loading states during data fetching
- Expanded card tracking

## User Experience
1. User lands on homepage
2. Sees loading skeleton briefly
3. Factoid cards appear with topic filters
4. Can filter by topic instantly
5. Can expand cards for more details
6. Can click through to full article view

## Related Features
- [Article Detail View](./02-article-detail.md)
- [API System](./08-api-system.md)
- [Multilingual Support](./10-multilingual-support.md) 
```

### 02-article-detail.md
```md
# Feature: Article Detail View

## Overview
Individual article page showing comprehensive factoid information with verified facts, sources, and enhanced readability.

## User Story
As a user reading news, I want to see detailed verified facts and their sources so that I can trust the information and explore further if needed.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/article/[id]/page.tsx`
- **Type**: Server-side rendered page
- **Data Source**: Server-side data fetching via `getFactoidById()`

### Key Features
1. **Article Header**
   - Full title display
   - Publication date and time
   - Source attribution badges
   - Social interaction buttons (Like/Dislike - UI only)

2. **Verified Facts Section**
   - Numbered bullet points
   - Visual distinction with background colors
   - Check circle icon for verification indicator
   - RTL support for content

3. **Sources Section**
   - Card-based source display
   - Direct links to original articles
   - Source domain and name
   - External link indicators

4. **About Section**
   - Explanation of Veritas processing
   - Transparency about fact extraction
   - Disclaimer for verification

### Data Flow
1. Dynamic route captures article ID
2. Server-side fetch using `getFactoidById()`
3. 404 handling for non-existent articles
4. Full data hydration before render

### RTL Support
- `getRTLClasses()` for text direction
- `getRTLFlexDirection()` for layout direction
- `getRTLContainerClasses()` for container styling
- Proper alignment for all UI elements

## User Experience
1. User clicks article from feed
2. Server renders full article page
3. Sees comprehensive fact breakdown
4. Can explore original sources
5. Navigate back to feed easily

## Error Handling
- 404 page for missing articles
- Graceful handling of missing data fields
- Fallback UI for incomplete factoids

## Related Features
- [News Feed](./01-news-feed.md)
- [Multilingual Support](./10-multilingual-support.md) 
```

### 03-content-scraping.md
```md
# Feature: Content Scraping System

## Overview
Automated news content aggregation system using Crawlee for RSS feed monitoring and article extraction from multiple news sources.

## User Story
As a content administrator, I want the system to automatically collect and process news articles so that users always have fresh, verified content.

## Technical Implementation

### Scraper Service Architecture
- **Location**: `services/scraper/src/`
- **Framework**: Crawlee with Cheerio
- **Database**: PostgreSQL for content storage
- **API**: Express.js REST endpoints

### Core Components
1. **EnhancedRSSScraper Class** (`enhanced-scraper.ts`)
   - RSS feed parsing with rss-parser
   - Article content extraction with quality scoring
   - Language detection and classification
   - Duplicate detection via content hashing
   - Concurrent crawling with resource limits
   - Advanced structured logging with correlation tracking

2. **EnhancedLogger Class** (`enhanced-logger.ts`)
   - JSONB-structured logging for comprehensive monitoring
   - Performance monitoring with automated snapshots
   - HTTP request/response tracking with timing
   - Content quality scoring and validation
   - Correlation IDs for request lifecycle tracking

3. **API Server** (`api-server.ts`)
   - Express server on port 3001
   - RESTful endpoints for job management
   - CORS enabled for cross-service communication
   - Health monitoring endpoints with structured log access

4. **Database Layer** (`database.ts`)
   - Connection pooling with enhanced performance
   - Transaction-safe operations
   - JSONB structured logging to scraping_logs table
   - Progress tracking and job management
   - Optimized indexes for log queries

### Scraping Workflow
1. **Job Creation**
   - API receives trigger request
   - Creates job with initial "new" status
   - Logs initial job parameters

2. **RSS Processing**
   - Fetches RSS feeds from configured sources
   - Parses feed items
   - Queues articles for crawling

3. **Content Extraction Phase**
   - Multiple extraction strategies:
     - Structured data (JSON-LD)
     - Common article selectors
     - Meta tag fallbacks
   - Content cleaning and normalization
   - **Phase tracking**: Each source tracked separately through extraction
   - **Enhanced logging**: Extraction success/failure logged per source

4. **Persistence Phase**
   - **Two-phase approach**: Extraction and persistence are separate phases
   - Deduplication via content hash
   - Language detection and categorization
   - Source attribution
   - Processing status tracking
   - **Job linking**: Each scraped content record is linked to its originating scraping job via `job_id`
   - Transaction-based persistence for data integrity
   - **Per-source tracking**: Each source's save results tracked individually
   - **Accurate metrics**: Distinguishes between extracted vs. saved articles

### API Endpoints
- **POST /api/scraper/trigger**: Start new scraping job
- **GET /api/scraper/jobs**: List jobs with pagination
- **GET /api/scraper/jobs/:id**: Get specific job details
- **GET /api/scraper/jobs/:id/logs**: Get job logs
- **POST /api/scraper/jobs/:id/cancel**: Cancel running job
- **GET /api/scraper/content**: Browse scraped articles
- **GET /api/scraper/metrics**: Dashboard metrics
- **GET /health**: Service health check

### Job Status Lifecycle
Jobs progress through the following statuses:
- **new**: Job created but not yet started
- **in-progress**: Currently processing sources
- **successful**: All sources completed successfully  
- **partial**: Some sources failed, some succeeded
- **failed**: All sources failed or critical error occurred

### Error Handling
- Exponential backoff for failed requests
- Comprehensive structured error logging with JSONB data
- Graceful degradation with detailed monitoring
- Job failure recovery with correlation tracking
- Isolated failures between sources
- Error categorization and pattern analysis
- Performance impact tracking for failed requests
- **Crawler teardown protection**: Teardown errors logged but don't stop job
- **Phase-specific error handling**: Extraction vs. persistence errors tracked separately

### Performance Optimizations
- Concurrent crawling (max 3)
- Request timeout limits (30s)
- Memory usage monitoring
- Resource cleanup
- Support for large-scale scraping (100 sources × 1,000 articles)
- Isolated source failures for reliability

## Configuration
- Respects robots.txt (configurable)
- Custom user agents per source
- Request delays between fetches
- Timeout settings

## Monitoring
- Real-time job progress with structured logging
- Success/failure metrics with detailed analytics
- Resource usage tracking with automated snapshots
- Error categorization with JSONB-based analysis
- Performance monitoring with request timing
- Content quality scoring and validation
- Correlation tracking across request lifecycle
- **Content traceability**: All scraped content can be traced back to its originating job for audit and debugging
- **Enhanced metrics**: Separate tracking for extraction vs. persistence success rates
- **Source-level visibility**: Individual source performance metrics available

## Troubleshooting

### Common Issues

1. **Articles Show as Extracted but Not Saved**
   - Check persistence phase logs for database errors
   - Look for duplicate content hash rejections
   - Verify database connection during save phase

2. **Crawler Teardown Errors**
   - These are now non-fatal and logged separately
   - Job continues even if teardown fails
   - Check teardown_failure events in logs

3. **Discrepancy Between Sources and Articles**
   - Use enhanced logging to track each phase
   - Check extraction_phase_completed vs. source_persistence_completed events
   - Review per-source metrics in job completion logs

## Related Features
- [Enhanced Logging System](./11-enhanced-logging.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Source Management](./05-source-management.md)
- [Content Management](./06-content-management.md)
- [API System](./08-api-system.md) 
```

### 04-scraper-dashboard.md
```md
# Feature: Scraper Dashboard

## Overview
Comprehensive monitoring and management interface for the content scraping system, providing real-time metrics, job tracking, and system health visualization.

## User Story
As a system administrator, I want to monitor scraping operations and performance so that I can ensure content is being collected efficiently and troubleshoot issues.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/`
- **Main Page**: `page.tsx` - Tab-based interface
- **Dashboard Tab**: `components/dashboard-tab.tsx`
- **Health Dashboard**: `components/health-dashboard.tsx`
- **Job Trigger**: `components/job-trigger.tsx`

### Key Features

1. **Metrics Overview**
   - Jobs triggered count
   - Success rate percentage
   - Total articles scraped (database-based count from scraped_content table)
   - Average job duration
   - Active jobs indicator
   - Recent errors count

2. **Job Management**
   - Real-time job status tracking with granular states
   - Job history displayed in sortable table
   - Expandable job logs with copy functionality
   - Progress indicators
   - Duration calculations
   - Cancel running jobs
   - Status shown with icons and color coding

3. **Job Triggering**
   - Source selection interface
   - Articles per source configuration
   - Validation and error handling
   - Immediate job status feedback
   - Fallback job handling

4. **Health Monitoring**
   - System status indicators
   - Source-specific health metrics
   - Error notifications
   - Recovery action buttons
   - Performance tracking

### Data Flow
1. **Auto-refresh**: 30-second intervals for live data
2. **Parallel Loading**: Multiple API calls simultaneously
3. **Progressive Enhancement**: Show data as it loads
4. **Error Resilience**: Fallback to partial data

### UI Components
- Metric cards with icons
- Sortable table for job history
- Expandable job rows with logs
- Progress bars
- Status badges with color coding
- Loading skeletons
- Error alerts
- Tooltip components for additional context (including per-source article counts)
- Table component with client-side sorting

### State Management
- React hooks for component state
- Polling intervals for live updates
- Expanded state tracking
- Log caching to reduce API calls

## User Workflows

### Monitoring Workflow
1. Navigate to Scraper > Dashboard
2. View real-time metrics
3. Check active jobs
4. Review recent job history
5. Expand jobs for detailed logs

### Troubleshooting Workflow
1. Identify failed jobs
2. Expand to view error logs
3. Check source health status
4. Take recovery actions
5. Re-trigger if needed

## API Integration
- **GET /api/scraper/metrics**: Dashboard metrics (with database-based article counts)
- **GET /api/scraper/jobs**: Job listing (includes per-source article counts)
- **GET /api/scraper/jobs/:id/logs**: Job logs
- **GET /api/scraper/monitoring**: Health data
- **POST /api/scraper/monitoring**: Recovery actions

## Performance Features
- Metrics caching (1-minute TTL)
- Lazy log loading
- Pagination for job history
- Optimistic UI updates

### Job Logs
- Expandable row interface for viewing detailed logs
- Timestamp, level, and message display
- Copy logs to clipboard functionality
- Real-time log retrieval from API
- Helps identify and troubleshoot issues

### Sorting and Filtering
- Client-side sorting for all table columns
- Sort by timestamp, status, duration, etc.
- Maintains sort state during auto-refresh
- Instant sorting without server calls

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Job Triggering](./04a-job-triggering.md)
- [Job Monitoring and Logs](./04b-job-monitoring.md)
- [Source Management](./05-source-management.md) 
```

### 04a-job-triggering.md
```md
# Feature: Job Triggering

## Overview
Streamlined modal interface for manually triggering content scraping jobs with multi-select source selection and configuration options.

## User Story
As a content administrator, I want to manually trigger scraping jobs so that I can collect fresh content on-demand from specific sources.

## Technical Implementation

### Frontend Component
- **Location**: `services/ui/app/scraper/components/job-trigger.tsx`
- **Type**: Modal-based form interface
- **Integration**: Header button on scraper page

### Key Features

1. **Trigger Button**
   - Prominent placement in header
   - Icon and text label
   - Opens modal dialog

2. **Job Configuration**
   - Articles per source (1-1000)
   - Multi-select source checklist
   - All sources selected by default
   - Validation and constraints

3. **Source Selection**
   - Checkbox list in scrollable container
   - Select all/none buttons
   - All sources selected by default
   - Active source filtering
   - Source name display
   - Summary of selection (X sources × Y articles)

4. **Job Submission**
   - Form validation
   - Loading states
   - Success/error feedback
   - Automatic modal close

5. **Job Status Tracking**
   - Real-time status updates
   - Progress monitoring
   - Error notifications
   - Completion alerts

### Workflow
1. Click "Trigger Scraping Job"
2. Modal opens with all sources pre-selected
3. Adjust source selection if needed
4. Set articles per source count
5. Submit job with single click
6. Monitor job progress in dashboard

### API Integration
```typescript
POST /api/scraper/trigger
{
  sources: string[],      // Source names
  maxArticles: number     // Per source limit
}
```

### Validation Rules
- At least one source required
- Articles: 1-1000 per source
- Only active sources shown
- Duplicate job prevention
- Support for large-scale scraping (100 sources × 1,000 articles)

### Error Handling
- Network failures
- Invalid source detection
- Scraper service unavailable
- Fallback job creation

### Accessibility Features
- Form labels with `htmlFor`
- Input `id` attributes
- Semantic HTML structure
- Keyboard navigation

## UI States

### Initial State
- Button in header
- No modal visible

### Configuration State
- Modal open
- Form inputs active
- Sources loaded

### Loading State
- Submit button disabled
- Loading spinner
- Inputs disabled

### Success State
- Modal closes
- Dashboard refreshes
- Job appears in list

### Error State
- Error message shown
- Form remains open
- Retry available

## Related Features
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Scraping System](./03-content-scraping.md)
- [Source Management](./05-source-management.md) 
```

### 05-source-management.md
```md
# Feature: Source Management

## Overview
Modernized table-based administrative interface for managing news sources, including adding new sources, configuring scraping parameters, testing RSS feeds, and monitoring source health.

## User Story
As a content administrator, I want to manage news sources and their configurations so that the scraper collects content from reliable, relevant sources.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/components/`
- **Main Component**: `source-management.tsx`
- **Sources Tab**: `sources-tab.tsx`
- **Data Models**: `app/scraper/types.ts`

### Key Features

1. **Source Overview**
   - Total sources count
   - Active sources indicator
   - Success rate metrics
   - Recent activity tracking

2. **Source CRUD Operations**
   - **Create**: Add new RSS sources
   - **Read**: List all sources with health status
   - **Update**: Edit source configurations
   - **Delete**: Remove sources (with confirmation)

3. **Source Configuration**
   - Name and domain
   - RSS feed URL
   - Icon URL (optional)
   - Scraping parameters:
     - Respect robots.txt toggle
     - Request delay (milliseconds)
     - Custom user agent
     - Timeout settings

4. **Source Health Monitoring**
   - Last successful scrape
   - Total articles collected
   - Success/failure counts
   - Error indicators

### UI Components

1. **Sources Table**
   - Sortable columns (Name, RSS URL, Creation Date)
   - Inline action buttons (Edit/Delete/Test)
   - Client-side sorting for performance
   - Responsive design with horizontal scroll

2. **Source Form Dialog**
   - Modal-based editing with inline updates
   - Enhanced field validation
   - RSS feed testing capability
   - Loading states with duplicate prevention
   - Form remains open on validation errors

3. **Metrics Display**
   - Grid layout for stats
   - Color-coded indicators
   - Real-time updates

### Data Flow
1. Load sources from API
2. Display in sortable table
3. Handle CRUD operations with validation
4. Update UI optimistically
5. Sync with backend
6. Test RSS feeds on demand

### Validation Rules
- Required: Name, Domain, RSS URL
- URL format validation
- Unique source names
- Numeric constraints for delays/timeouts

## Database Schema
```typescript
interface NewsSource {
  id: string;
  name: string;
  domain: string;
  rssUrl: string;
  iconUrl?: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
  userAgent: string;
  timeoutMs: number;
  createdAt: string;
}
```

## API Integration
- **GET /api/scraper/sources**: List all sources
- **POST /api/scraper/sources**: Create new source
- **PUT /api/scraper/sources/:id**: Update source
- **DELETE /api/scraper/sources/:id**: Delete source
- **POST /api/scraper/sources/:id/test**: Test RSS feed validity

## User Workflows

### Adding a Source
1. Click "Add New Source"
2. Fill in source details
3. System validates RSS feed
4. Save source configuration
5. Source appears in list

### Editing a Source
1. Click source card
2. Modify configurations
3. Save changes
4. See updated metrics

## Error Handling
- RSS feed validation errors
- Network connectivity issues
- Duplicate source prevention
- Graceful degradation

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Management](./06-content-management.md) 
```

### 06-content-management.md
```md
# Feature: Content Management

## Overview
Browse, search, and manage scraped articles with filtering capabilities and detailed article views.

## User Story
As a content editor, I want to browse and search through scraped articles so that I can review content quality and manage the article pipeline.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/components/content-tab.tsx`
- **Content Feed**: `components/content-feed.tsx`
- **Article Detail**: `app/scraper/content/[id]/page.tsx`

### Key Features

1. **Article Browsing**
   - Paginated article list
   - Article cards with preview
   - Expand/collapse functionality
   - Publication date display
   - Source attribution

2. **Search & Filtering**
   - Full-text search
   - Source filtering
   - Language filtering
   - Status filtering (pending/processing/completed/failed)
   - Real-time filter updates

3. **Article Details**
   - Full content display
   - Metadata viewing
   - Source information
   - Processing status
   - Content hash for deduplication

4. **Pagination**
   - Page-based navigation
   - Items per page control
   - Total count display
   - Load more functionality

### Data Structure
```typescript
interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl: string;
  sourceId: string;
  sourceName?: string;
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: ProcessingStatus;
  contentHash: string;
  createdAt: string;
}
```

### UI Components

1. **Content List**
   - Card-based layout
   - Responsive grid
   - Loading skeletons
   - Empty states

2. **Search Bar**
   - Debounced input
   - Clear button
   - Search icon
   - Placeholder text

3. **Filter Controls**
   - Dropdown selects
   - Multi-select for sources
   - Language selector
   - Status badges

4. **Article Preview**
   - Title and excerpt
   - Metadata badges
   - Expand button
   - External link

### Performance Optimizations
- Lazy loading of content
- Search debouncing (500ms)
- Virtual scrolling ready
- Image lazy loading

## User Workflows

### Content Review
1. Navigate to Scraper > Content
2. Browse recent articles
3. Use filters to narrow results
4. Click to expand articles
5. Review full content

### Content Search
1. Enter search terms
2. Select filters
3. View filtered results
4. Paginate through results
5. Open original articles

## API Integration
- **GET /api/scraper/content**: List articles with filters
- **GET /api/scraper/content/:id**: Get article details
- Query parameters:
  - `page`: Page number
  - `pageSize`: Items per page
  - `search`: Text search
  - `source`: Source filter
  - `language`: Language filter
  - `status`: Status filter

## Error Handling
- Failed content loads
- Empty search results
- Network errors
- Graceful degradation

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Source Management](./05-source-management.md)
- [News Feed](./01-news-feed.md) 
```

### 07-settings-page.md
```md
# Feature: Settings Page

## Overview
User preferences and application configuration interface, currently showing planned features with a phased implementation roadmap.

## User Story
As a user, I want to customize my news reading experience and manage my preferences so that the application works the way I prefer.

## Current Status
The settings page is partially implemented with UI mockups showing planned functionality. Most features are marked as "Coming Soon" with development phases indicated.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/settings/page.tsx`
- **UI Components**: Cards, badges, buttons
- **Navigation**: Back to news feed link

### Planned Features

1. **Display Preferences**
   - Topic preferences
   - Reading time estimates
   - Content filters
   - Language preferences
   - Font size controls

2. **Information Sources**
   - Source prioritization
   - RSS feed management
   - Custom source addition
   - Source blocking

3. **Notifications**
   - Breaking news alerts
   - Topic-specific notifications
   - Email digest configuration
   - Push notification settings

4. **App Configuration**
   - Data preferences
   - System settings
   - App behavior
   - Privacy controls

### Development Status Display
- **Phase 1-4**: Completed (Core UI & Mock Data)
- **Phase 5**: In Progress (RSS Integration)
- **Phase 6-8**: Planned (Advanced Features)

### UI Layout
- Grid-based card layout
- Responsive design
- Icon-enhanced sections
- Status indicators
- Coming soon badges

### Quick Actions Section
Placeholder for:
- Clear cache
- Export data
- Reset preferences
- Advanced settings

## Implementation Roadmap

### Phase 5 (Current)
- Connect settings to database
- Implement source management
- User preference storage
- Basic filtering

### Phase 6
- Notification system
- Email integration
- Advanced preferences
- Data export

### Phase 7-8
- Machine learning preferences
- Advanced customization
- Analytics dashboard
- Multi-device sync

## User Experience
1. Navigate to Settings via header
2. View available options
3. See development status
4. Understand roadmap
5. Return to main feed

## Database Schema (Planned)
```typescript
interface UserPreferences {
  userId: string;
  displayPreferences: {
    fontSize: string;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    readingTime: boolean;
  };
  contentFilters: {
    topics: string[];
    sources: string[];
    languages: string[];
  };
  notifications: {
    breaking: boolean;
    daily: boolean;
    topics: string[];
  };
}
```

## Related Features
- [News Feed](./01-news-feed.md)
- [Dark Mode Support](./09-dark-mode.md)
- [Multilingual Support](./10-multilingual-support.md) 
```

### 08-api-system.md
```md
# Feature: API System

## Overview
RESTful API architecture providing data access for the UI and enabling inter-service communication between UI and Scraper services.

## User Story
As a developer, I want a well-structured API system so that I can build features reliably and extend the platform functionality.

## Technical Implementation

### Architecture
- **UI Service API**: Next.js App Router API routes
- **Scraper Service API**: Express.js REST endpoints
- **Communication**: HTTP with JSON payloads
- **Service Discovery**: Railway internal URLs

### UI Service Endpoints

1. **Factoid Endpoints**
   - `GET /api/factoids` - List all published factoids
   - `GET /api/factoids/[id]` - Get specific factoid
   - Includes tags and sources via SQL joins
   - Fallback to mock data on DB failure

2. **Tag Endpoints**
   - `GET /api/tags` - List active tags
   - Alphabetically sorted
   - Used for topic filtering

3. **Scraper Proxy Endpoints**
   - `POST /api/scraper/trigger` - Trigger scraping job
   - `GET /api/scraper/jobs` - List scraping jobs
   - `GET /api/scraper/jobs/[id]/logs` - Get job logs
   - `GET /api/scraper/metrics` - Dashboard metrics
   - `GET /api/scraper/content` - List scraped articles (includes job_id for traceability)
   - `GET /api/scraper/sources` - Manage sources
   - `GET /api/scraper/monitoring` - System health

### Scraper Service Endpoints

1. **Job Management**
   - `POST /api/scraper/trigger` - Start new job
   - `GET /api/scraper/jobs` - List jobs with enum status values
   - `GET /api/scraper/jobs/:id` - Job details
   - `GET /api/scraper/jobs/:id/logs` - Structured JSONB logs with filtering
   - `POST /api/scraper/jobs/:id/cancel` - Cancel job

2. **Content Management**
   - `GET /api/scraper/content` - Browse articles (includes job_id for traceability)
   - `GET /api/scraper/content/:id` - Article details (includes originating job information)
   - `GET /api/scraper/content?job_id=:id` - Filter articles by specific scraping job

3. **Source Management**
   - `GET /api/scraper/sources` - List sources
   - `POST /api/scraper/sources` - Create source
   - `PUT /api/scraper/sources/:id` - Update source
   - `DELETE /api/scraper/sources/:id` - Delete source
   - `POST /api/scraper/sources/:id/test` - Test RSS feed validity

4. **Monitoring & Analytics**
   - `GET /health` - Service health check
   - `GET /api/scraper/metrics` - Enhanced performance metrics
     - Returns `DashboardMetrics` with extraction and persistence rates
     - New fields: `articlesSaved`, `extractionSuccessRate`, `persistenceSuccessRate`
   - `GET /api/monitoring/errors` - Error statistics
   - `GET /api/monitoring/performance` - System performance
   - `GET /api/monitoring/alerts` - System alerts
   - `POST /api/monitoring/recovery` - Recovery management

5. **Enhanced Logging API**
   - `GET /api/jobs/:id/logs?event_type=http` - Filter logs by event type
   - `GET /api/jobs/:id/logs?correlation_id=abc` - Get correlated events
   - `GET /api/jobs/:id/logs?level=error` - Filter by log level  
   - `GET /api/logs/performance/:jobId` - Performance analytics
   - `GET /api/logs/errors/:jobId` - Error analysis with patterns
   - `GET /api/logs/quality/:jobId` - Content quality metrics

### Inter-Service Communication
```typescript
// Railway internal service discovery
const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL 
  || 'http://scraper.railway.internal:3001'
```

### Response Formats

#### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

#### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
```

#### Paginated Response
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

#### Dashboard Metrics Response
```typescript
interface DashboardMetrics {
  jobsTriggered: number;
  successRate: number;
  articlesScraped: number;          // Total extracted articles
  articlesSaved: number;            // Actually persisted to DB
  averageJobDuration: number;
  activeJobs: number;
  recentErrors: number;
  extractionSuccessRate: number;    // % of sources that extracted content
  persistenceSuccessRate: number;   // % of extracted that were saved
}
```

### Error Handling
- Consistent error format
- Appropriate HTTP status codes
- Detailed error messages
- Stack traces in development
- Graceful fallbacks

### Security Features
- CORS configuration
- Request validation
- SQL injection prevention
- Rate limiting ready
- Authentication hooks

### Performance Optimizations
- Connection pooling
- Query optimization
- Response caching
- Parallel requests
- Lazy loading

## Best Practices
1. **RESTful Design**
   - Proper HTTP methods
   - Resource-based URLs
   - Stateless operations

2. **Error Handling**
   - Try-catch blocks
   - Meaningful errors
   - Proper status codes

3. **Validation**
   - Input sanitization
   - Type checking
   - Business rule validation

4. **Documentation**
   - Clear endpoint naming
   - Response examples
   - Error scenarios

## Related Features
- [Enhanced Logging System](./11-enhanced-logging.md)
- [Content Scraping System](./03-content-scraping.md)
- [News Feed](./01-news-feed.md)
- [Scraper Dashboard](./04-scraper-dashboard.md) 
```

### 09-dark-mode.md
```md
# Feature: Dark Mode Support

## Overview
System-wide dark mode implementation with theme toggle functionality and persistent user preference storage.

## User Story
As a user, I want to switch between light and dark modes so that I can read comfortably in different lighting conditions.

## Technical Implementation

### Theme Toggle Component
- **Location**: `components/ui/theme-toggle.tsx`
- **Icon**: Sun/Moon toggle button
- **Position**: Header navigation bar

### Implementation Details

1. **Theme Provider**
   - Next.js theme support
   - System preference detection
   - Local storage persistence
   - Immediate theme application

2. **CSS Implementation**
   - Tailwind CSS dark mode classes
   - CSS custom properties
   - Smooth transitions
   - Consistent color palette

3. **Component Styling**
   ```css
   /* Light mode */
   .bg-background
   .text-foreground
   .border-border
   
   /* Dark mode */
   .dark:bg-background
   .dark:text-foreground
   .dark:border-border
   ```

### Color System
1. **Semantic Colors**
   - Background variations
   - Foreground text colors
   - Border colors
   - Accent colors

2. **Component-Specific**
   - Card backgrounds
   - Input fields
   - Button states
   - Shadows and overlays

### Theme Detection Logic
```typescript
// Check system preference
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

// Apply theme
if (theme === 'dark' || 
    (theme === 'system' && systemTheme.matches)) {
  document.documentElement.classList.add('dark')
}
```

### Storage & Persistence
- Local storage key: `theme`
- Values: `light`, `dark`, `system`
- Hydration on page load
- Cross-tab synchronization

## UI Components Supporting Dark Mode

1. **Cards & Containers**
   - Proper background colors
   - Adjusted shadows
   - Border visibility

2. **Form Elements**
   - Input backgrounds
   - Focus states
   - Placeholder text

3. **Text & Typography**
   - Contrast ratios
   - Muted text variations
   - Link colors

4. **Interactive Elements**
   - Button variants
   - Hover states
   - Active states

## Best Practices
1. **Contrast Ratios**
   - WCAG AA compliance
   - Readable text
   - Clear boundaries

2. **Color Consistency**
   - Semantic naming
   - Predictable behavior
   - Brand alignment

3. **Performance**
   - No flash of wrong theme
   - Instant switching
   - Minimal repaints

## User Experience
1. Click theme toggle
2. Instant theme switch
3. Preference saved
4. Consistent across sessions
5. Respects system preference

## Testing Considerations
- Light mode screenshots
- Dark mode screenshots
- Transition smoothness
- Storage persistence
- System preference sync

## Related Features
- [Settings Page](./07-settings-page.md)
- All UI components 
```

### 10-multilingual-support.md
```md
# Feature: Multilingual Support

## Overview
Comprehensive multilingual content support with RTL (Right-to-Left) language handling for Hebrew and Arabic, ensuring proper text direction and UI layout.

## User Story
As a multilingual user, I want to read news in my preferred language with proper text direction so that content is displayed naturally and readably.

## Technical Implementation

### Language Detection
- **Location**: `services/scraper/src/utils.ts`
- **Method**: `detectLanguage()`
- **Supported**: English, Hebrew, Arabic, Others

### RTL Support Utilities
- **Location**: `services/ui/lib/rtl-utils.ts`
- **Functions**:
  - `getRTLClasses()` - Text direction classes
  - `getRTLFlexDirection()` - Flex layout direction
  - `getRTLContainerClasses()` - Container styling
  - `getRTLGridClasses()` - Grid layouts

### Implementation Patterns

1. **Text Direction**
   ```typescript
   // Automatic RTL for Hebrew/Arabic
   className={getRTLClasses(language)}
   // Returns: "text-right rtl:text-right" or "text-left"
   ```

2. **Layout Direction**
   ```typescript
   // Flex containers
   className={getRTLFlexDirection(language)}
   // Returns: "flex-row-reverse" or "flex-row"
   ```

3. **Container Alignment**
   ```typescript
   // Full container styling
   className={getRTLContainerClasses(language)}
   // Includes direction, alignment, spacing
   ```

### Language-Specific Features

1. **Hebrew (he)**
   - Full RTL layout
   - Right-aligned text
   - Mirrored UI components
   - Hebrew date formatting

2. **Arabic (ar)**
   - Full RTL layout
   - Right-aligned text
   - Arabic numerals option
   - Cultural date formats

3. **English (en)**
   - Standard LTR layout
   - Left-aligned text
   - Western date formats

### Content Processing
1. **Scraping Phase**
   - Language detection during scraping
   - Storage with language tag
   - Proper encoding handling

2. **Display Phase**
   - Dynamic class application
   - Locale-specific formatting
   - Font selection

### Date Formatting
```typescript
const formatDate = (date, language) => {
  const locale = language === 'he' ? 'he-IL' : 
                language === 'ar' ? 'ar-SA' : 
                'en-US';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

### UI Components Affected

1. **News Feed Cards**
   - Title alignment
   - Description direction
   - Date positioning
   - Tag layout

2. **Article Detail Page**
   - Full content RTL
   - Bullet point alignment
   - Source attribution
   - Navigation buttons

3. **Navigation**
   - Menu direction
   - Icon positioning
   - Button alignment

### CSS Considerations
```css
/* RTL-specific styles */
[dir="rtl"] .component {
  /* Mirrored margins/padding */
  margin-right: 1rem;
  margin-left: 0;
}

/* Bidirectional icons */
.icon-chevron {
  transform: scaleX(-1);
}
```

## Best Practices
1. **Always use utility functions**
2. **Test with real RTL content**
3. **Consider cultural differences**
4. **Maintain consistent spacing**
5. **Use logical properties when possible**

## Testing Requirements
- Hebrew content display
- Arabic content display
- Mixed language feeds
- UI mirroring verification
- Date format checking

## Future Enhancements
- More language support
- User language preferences
- Translation integration
- Locale-specific features

## Related Features
- [News Feed](./01-news-feed.md)
- [Article Detail View](./02-article-detail.md)
- [Settings Page](./07-settings-page.md) 
```

</details>

<details>
<summary>📂 Development Framework</summary>

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

## 11. Testing & Utility Scripts

### Utility Script Standards
- **Location**: All utilities in `utilities/` directory
- **Naming**: `XX-purpose.{js,sh,ps1}` format (e.g., `01-db-setup.sh`, `03-test-scraper.js`)
- **Platform Support**: Provide both `.sh` (Mac/Linux) and `.ps1` (Windows) for shell scripts
- **Documentation**: Required header with usage instructions
- **Dependencies**: Minimal, use standard Node.js packages
- **Modes**: Support both interactive and non-interactive execution

### Creating New Utilities
```javascript
#!/usr/bin/env node

/**
 * [Tool Name]
 * [Brief description]
 * Usage: node XX-purpose.js [args]
 */

// Standard imports
const { Pool } = require('pg');
require('dotenv').config({ path: '../services/scraper/.env' });

// Tool implementation
async function main() {
  // Implementation
}

// Execute with error handling
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

### Consolidation Principles
- Combine redundant functionality into single utilities
- Prefer configuration options over multiple similar scripts
- Use clear, descriptive names that indicate purpose
- Maintain backwards compatibility when consolidating 
```

### agentic-principles.md
```md
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
- Database setup: Use `01-db-setup.sh` (Mac/Linux) or `01-db-setup.ps1` (Windows)
- Data cleanup: Use `02-db-clear.js`
- API testing: Use `04-test-api.js`
- Log analysis: Use `06-test-logs.js`
```

</details>

<details>
<summary>📂 Development Procedures</summary>

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
- [ ] For scraper API issues, reference `keystone/procedures/scraper-debugging.md`
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
2. Use test API server for isolated testing: `node utilities/04-test-api.js`
3. Test scraper integration: `node utilities/03-test-scraper.js`
4. Verify response format matches expectations
5. Test error cases (404, 400, 500)
6. Check TypeScript compilation: `npm run build`
7. Verify database queries work correctly
8. Analyze logs for failures: `node utilities/06-test-logs.js <job-id>`

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
# Test on local database first
psql veritas_local -f migration.sql

# Use utilities for setup and testing (OS-specific)
./utilities/01-db-setup.sh  # Mac/Linux: Setup/refresh local DB
.\utilities\01-db-setup.ps1  # Windows: Setup/refresh local DB
node utilities/05-test-db-mapping.js  # Verify field mappings

# Then apply to production
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
- [ ] Migration runs without errors on local DB
- [ ] Rollback script works if needed
- [ ] TypeScript interfaces updated
- [ ] Field mappings verified with `utilities/05-test-db-mapping.js`
- [ ] API endpoints tested with `utilities/04-test-api.js`
- [ ] No breaking changes to existing code
- [ ] Clear test data with `utilities/02-db-clear.js` between tests

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

## Testing & Debugging Tools

### Utility Scripts for Error Diagnosis
```bash
# Analyze failed job logs
node utilities/06-test-logs.js <job-id> --level=error

# Test API endpoints directly
node utilities/04-test-api.js
curl http://localhost:3001/api/stats

# Verify database field mappings
node utilities/05-test-db-mapping.js

# Test scraper end-to-end
node utilities/03-test-scraper.js "BBC News" 1
```

### Common Debugging Workflows
- **Scraper failures**: Use `06-test-logs.js` with `--timeline --metrics`
- **API errors**: Start `04-test-api.js` for isolated testing
- **Database issues**: Run `05-test-db-mapping.js` to verify mappings
- **Clear test data**: Use `02-db-clear.js --confirm` for fresh start 
```

### local-testing.md
```md
# Local Testing Procedure

## Overview
Local testing using PostgreSQL copy of production data for safe development.

## Quick Start
1. Run setup script: `./utilities/01-db-setup.sh` (Mac/Linux) or `.\utilities\01-db-setup.ps1` (Windows)
2. Create `.env` in service directory (see template below)
3. Test with: `node utilities/03-test-scraper.js`
4. Debug extraction: `node utilities/07-extraction-analyzer.js`
5. For advanced debugging, see: `keystone/procedures/scraper-debugging.md`

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
- See `utilities/README.md` for complete utility documentation

## Testing Workflow

### 1. Setup Local Database
```bash
# macOS/Linux: Run bash script to create local database copy
./utilities/01-db-setup.sh

# Windows: Run PowerShell script to create local database copy
.\utilities\01-db-setup.ps1

# Both scripts provide:
# - Create local PostgreSQL database
# - Export and import Railway production data
# - Verify data integrity
# - Menu-driven options for different scenarios
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
npm run dev

# Then test with utilities
cd ../../utilities
node 03-test-scraper.js
```

### 4. Clean Up
```bash
# Use the dedicated cleanup utility
node utilities/02-db-clear.js --confirm

# Or for selective cleanup:
# - Preview what will be deleted
node utilities/02-db-clear.js

# SQL alternative for specific cleanup:
# DELETE FROM scraped_content WHERE created_at > NOW() - INTERVAL '1 day';
# DELETE FROM factoids WHERE status = 'draft';
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
1. Set up local database with `./utilities/01-db-setup.sh` (Mac/Linux) or `.\utilities\01-db-setup.ps1` (Windows)
2. Configure scraper .env file
3. Start scraper: `cd services/scraper && npm run dev`
4. Run tests: `node utilities/03-test-scraper.js`
5. Debug extraction: `node utilities/07-extraction-analyzer.js`
6. Test all sources: `node utilities/08-analyze-all-sources.js`
7. Validate quality: `node utilities/09-e2e-extraction-test.js`
8. Check spacing: `node utilities/10-test-spacing.js`
9. Verify filtering: `node utilities/11-validate-extraction.js`
10. Analyze logs: `node utilities/06-test-logs.js <job-id>`
11. Verify with API: `node utilities/04-test-api.js`

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
- [ ] Update changelog with project summary
- [ ] Update code file descriptions in architecture docs when logic changes

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
   - Determine if ADR is needed (see criteria below)
   - Map to architecture documentation
   - Identify affected procedures
   - Update file descriptions in software-architecture.md
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

**Utility Scripts Documentation** (if new utilities created)
- `utilities/README.md` - Add new utilities to quick reference table
- `utilities/XX-purpose.js` - Ensure file header has usage docs
- Update relevant procedures to reference new utilities

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

### Phase 7: Changelog Update

After all documentation is complete, update the project changelog:

1. **Location**: `documentation/changelog.md`
   - Add new entry at the top (reverse chronological order)
   - Get current date using `date` command in terminal

2. **Changelog Entry Structure**
   
   The changelog should contain only entries, no structural documentation. Each entry follows this format:
   
   ```markdown
   ### [Date from `date` command] - [Change Title]
   **Summary**: [1-2 sentence overview accessible to non-technical users]
   
   **Key Features**:
   - [Feature 1]
   - [Feature 2]  
   - [Feature 3]
   
   **Technical Details**:
   - [Brief technical context]
   - [Architecture changes if any]
   - [Performance improvements if any]
   
   **Related**:
   - Commits: [commit hashes from git log]
   - PRs: [PR numbers if applicable]
   - Issues: [Issue numbers if applicable]
   ```

3. **Content Guidelines**
   - **Date**: Use system `date` command for accuracy (e.g., "August 9, 2025")
   - **Title**: Pull from project/feature name
   - **Summary**: Write in non-technical language
   - **Features**: List user-facing changes
   - **Technical**: Brief context for developers
   - **Related**: Actual commits/PRs from project

4. **Verification Checklist**
   - [ ] Date obtained via `date` command
   - [ ] Entry is readable by non-technical users
   - [ ] All major changes are represented
   - [ ] Metadata is accurate
   - [ ] Entry added at top (newest first)

REQUEST: "Changelog updated with project summary. This completes the documentation procedure."

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

## ADR Creation Criteria

### When to Create an ADR
Create an Architecture Decision Record when:

1. **Fundamental Strategy Changes**
   - Core algorithm or approach modifications
   - Data flow restructuring
   - Processing paradigm shifts (e.g., single to multi-element)

2. **Cross-Service Impact**
   - Changes affecting multiple services
   - New service communication patterns
   - Shared resource modifications

3. **Performance Trade-offs**
   - Choosing slower but more reliable approaches
   - Memory vs speed optimizations
   - Caching strategy changes

4. **Technology Choices**
   - New dependencies or frameworks
   - Database schema philosophy changes
   - Build or deployment tool changes

5. **Error Handling Philosophy**
   - Fallback strategy implementations
   - Recovery mechanism changes
   - Resilience pattern adoption

### When NOT to Create an ADR
- Bug fixes that don't change approach
- Performance optimizations within same paradigm
- Adding new sources/endpoints following existing patterns
- UI styling changes
- Documentation updates

### ADR File Naming
`documentation/decisions/ADR-XXX-descriptive-title.md`
- XXX = next sequential number
- descriptive-title = kebab-case summary

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
<summary>📂 Code Examples</summary>

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

  const calculatePerSourceStats = (job: ScrapingJob) => {
    const sourceStats: Record<string, { scraped: number; requested: number }> = {}
    
    // Initialize all sources with their requested count
    job.sourcesRequested.forEach(source => {
      sourceStats[source] = { 
        scraped: job.sourceArticleCounts?.[source] || 0, 
        requested: job.articlesPerSource 
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
                                  const sourceStats = calculatePerSourceStats(job)
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
  sourceArticleCounts?: Record<string, number>; // source name -> count
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
  enableTracking?: boolean; // Enable extraction tracking for debugging
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

// Enhanced source result tracking
export interface SourceResult {
  sourceName: string;
  sourceId: string;
  extractedArticles: any[]; // Articles extracted from web
  extractionMetrics: {
    rssItemsFound: number;
    candidatesProcessed: number;
    extractionAttempts: number;
    extractionSuccesses: number;
    extractionDuration: number;
  };
}

// Per-source persistence result
export interface SourcePersistenceResult {
  sourceName: string;
  sourceId: string;
  savedCount: number;
  duplicatesSkipped: number;
  saveFailures: number;
  articles: string[]; // Article IDs that were saved
}

// Enhanced job completion data
export interface EnhancedJobMetrics {
  sources: Record<string, {
    extracted: number;
    saved: number;
    duplicates: number;
    failures: number;
    success: boolean;
  }>;
  totals: {
    targetArticles: number;
    candidatesProcessed: number;
    extracted: number;
    saved: number;
    duplicates: number;
    actualSuccessRate: number;
  };
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
  articlesScraped: number; // Will be renamed to articlesExtracted in future
  articlesSaved: number; // New field - actual articles persisted to DB
  averageJobDuration: number;
  activeJobs: number;
  recentErrors: number;
  extractionSuccessRate: number; // New field - extraction phase success
  persistenceSuccessRate: number; // New field - persistence phase success
} 
```

</details>

<details>
<summary>📂 Project Templates</summary>

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

### Testing Utilities
Consider using existing utilities:
- [ ] `utilities/01-db-setup.sh` (Mac/Linux) or `utilities/01-db-setup.ps1` (Windows) - Setup fresh test database
- [ ] `utilities/03-test-scraper.js` - Test scraper functionality
- [ ] `utilities/04-test-api.js` - Test API endpoints
- [ ] `utilities/06-test-logs.js` - Analyze job logs for debugging
- [ ] Create story-specific utility if needed (see `keystone/procedures/utility-creation.md`)

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
- @types/jest
- @types/node
- @types/uuid
- jest
- ts-jest
- ts-node
- typescript

</details>

<details>
<summary>📜 Historical Context</summary>

### Completed Projects
- 08-07-25 - Railway Migration - DONE
- 10-07-25 - Project Simplification - DONE
- 11-01-25 - Project Optimization and Alignment - DONE
- 11-07-25 - Crawlee Scraper Integration - DONE
- 11-07-25 - Systematic Merge Resolution and Final Cleanup - DONE
- 13-07-25 - Advanced Scraper Enhancement System - DONE
- 14-07-25 - Cursor Max Token Optimization Implementation - DONE
- 15-07-25 - Cursor Framework Consolidation - DONE
- 17-07-25 - Simple Working Scraper
- real-time-extraction-tracking-plan-COMPLETED
- scraper-content-extraction-improvement-COMPLETED

### Architecture Decisions

#### ADR-001_Adopt-Multi-Service-Architecture.md
```markdown
# ADR-001: Adopt Multi-Service Architecture

## Status
Accepted

## Context
The Veritas project needs to handle two distinct workloads:
1. User-facing web application for content consumption
2. Background content aggregation and scraping operations

These workloads have different resource requirements, scaling needs, and operational characteristics. The scraping service needs to run periodic jobs, manage external API calls, and handle potentially long-running operations. The UI service needs to be responsive, handle user requests, and serve content efficiently.

Railway's platform naturally supports multi-service architectures with shared databases, making it an ideal choice for separating these concerns.

## Decision
We will split the Veritas system into three Railway services:
- **UI Service**: Next.js application for user interface
- **Scraper Service**: Crawlee-based content aggregation system
- **Database Service**: Shared PostgreSQL instance used by both services

Services will communicate via:
- Shared database access (both services connect to same PostgreSQL)
- HTTP APIs (UI can trigger scraper operations via REST endpoints)

## Consequences

### Positive
- **Independent scaling**: Each service can scale based on its own needs
- **Isolation of failures**: Scraper issues won't affect UI availability
- **Clear separation of concerns**: UI focuses on presentation, scraper on data collection
- **Independent deployment**: Services can be updated without affecting each other
- **Resource optimization**: Different resource allocations per service type

### Negative
- **Increased complexity**: Managing multiple services vs monolithic application
- **Inter-service communication**: Need to handle service discovery and API contracts
- **Shared database coupling**: Both services depend on same database schema
- **Monitoring overhead**: Need to monitor multiple services independently

### Neutral
- Configuration split across multiple service definitions
- Logs separated by service (can be advantage or disadvantage)
- Development requires understanding service boundaries

## Alternatives Considered
1. **Monolithic Application**: Single Next.js app with background jobs
   - Rejected: Would couple UI performance with scraping operations
   - Background jobs would compete for resources with user requests

2. **Separate Databases**: Each service with its own database
   - Rejected: Would require complex data synchronization
   - Increases operational overhead without clear benefits

3. **Message Queue Architecture**: Services communicate via message queue
   - Rejected: Adds unnecessary complexity for current scale
   - Can be adopted later if needed

## Implementation Notes
- Use Railway's environment variable injection for service configuration
- Implement health checks for each service
- Create fallback behavior when scraper service is unavailable
- Document API contracts between services
- Use Railway CLI for local development with multiple services 
```

#### ADR-002_Table-Based-UI-Pattern.md
```markdown
# ADR-002: Adopt Table-Based UI Pattern for Data Lists

## Status
Accepted (2025-07-26)

## Context
The original implementation used card-based list interfaces for displaying jobs and sources in the scraper dashboard. These lists were:
- Difficult to scan quickly when containing many items
- Lacking sorting capabilities
- Space-inefficient for displaying tabular data
- Inconsistent with modern data management UIs

Users needed to scroll through unsorted lists to find specific items, making it challenging to identify patterns or locate particular entries efficiently.

## Decision
Replace all data list interfaces with sortable tables using the shadcn/ui Table component.

### Specific Changes:
1. **Jobs List** → Jobs Table with sortable columns
2. **Sources List** → Sources Table with inline actions
3. Implement client-side sorting for all columns
4. Add visual indicators for sort direction
5. Maintain responsive design with horizontal scroll

## Consequences

### Positive
- **Improved Data Scannability**: Users can quickly scan rows of aligned data
- **Client-Side Sorting**: Instant sorting without server calls improves performance
- **Consistent UI Patterns**: Tables provide familiar interaction patterns
- **Better Information Density**: More data visible without scrolling
- **Enhanced Functionality**: Sort by any column to find patterns
- **Professional Appearance**: Aligns with enterprise data management tools

### Negative
- **Mobile Experience**: Tables require horizontal scrolling on small screens
- **Component Complexity**: Table components have more complexity than simple lists
- **Migration Effort**: Existing card-based UIs need complete restructuring

### Neutral
- **Design System Alignment**: Uses existing shadcn/ui components
- **Learning Curve**: Developers need to understand table component patterns
- **Accessibility**: Tables require proper ARIA attributes and keyboard navigation

## Implementation Details

### Technology Choices
- **Component Library**: shadcn/ui Table component
- **Sorting**: Client-side using React state
- **Styling**: Tailwind CSS with responsive utilities
- **Icons**: Lucide React for sort indicators

### Code Example
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead onClick={() => handleSort('timestamp')}>
        Timestamp {getSortIcon('timestamp')}
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sortedData.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.timestamp}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Alternatives Considered

1. **Enhanced Card Lists**: Add sorting to existing card layout
   - Rejected: Cards still inefficient for tabular data

2. **Data Grid Library**: Use AG-Grid or similar
   - Rejected: Overkill for current needs, adds dependency

3. **Custom Table Component**: Build from scratch
   - Rejected: shadcn/ui provides sufficient functionality

## References
- [shadcn/ui Table Documentation](https://ui.shadcn.com/docs/components/table)
- [User Story #5: Modernize Source Management](../projects/archive/25-07-25%20-%20Scraper%20Engine%20and%20UI%20Refinement%20-%20COMPLETED/stories/5.%20Modernize%20Source%20Management%20-%20COMPLETED.md)
- [Material Design Data Tables](https://material.io/components/data-tables)
```

#### ADR-003_Remove-MinimalRSSScraper.md
```markdown
# ADR-003: Remove MinimalRSSScraper and Consolidate to Enhanced Scraper

## Status
Accepted

## Context
The scraper service had two parallel scraper implementations:
- `MinimalRSSScraper` - Simple RSS parsing with basic logging
- `EnhancedRSSScraper` - Advanced scraping with structured JSONB logging, performance monitoring, and comprehensive error handling

Having two scraper implementations created maintenance overhead, code duplication, and potential confusion about which implementation to use for different scenarios. The enhanced scraper provided all capabilities of the minimal scraper plus significant additional functionality for monitoring, debugging, and performance analysis.

The logging system was also fragmented, with basic text-based logging in the minimal scraper versus structured JSONB logging in the enhanced version. This made it difficult to:
- Query and analyze log data effectively
- Implement consistent monitoring across the platform
- Provide detailed debugging information
- Track performance metrics consistently

## Decision
Remove the `MinimalRSSScraper` implementation entirely and make `EnhancedRSSScraper` the single scraper implementation for the service. All scraping operations will use the enhanced implementation with its structured JSONB logging system.

## Consequences

### Positive
- **Reduced Code Complexity**: Single scraper implementation eliminates maintenance of parallel codebases
- **Enhanced Observability**: All scraping operations now use structured JSONB logging with comprehensive performance, HTTP, and extraction event tracking
- **Better Debugging**: Detailed correlation tracking, performance snapshots, and quality scoring provide much better debugging capabilities
- **Improved Monitoring**: Performance monitoring, memory tracking, and error categorization enable proactive system management
- **Consistent Logging**: All logs now use the same structured format with queryable JSONB fields and optimized indexes
- **Future-Proof Architecture**: Enhanced logger supports extensible event types and correlation tracking for complex debugging scenarios

### Negative
- **Slightly Higher Resource Usage**: Enhanced logging uses more database storage and CPU for JSONB operations
- **Migration Complexity**: Existing references to minimal scraper needed to be updated throughout the codebase
- **Learning Curve**: More complex logging structure requires understanding of JSONB query patterns

### Neutral
- **API Compatibility**: All existing API endpoints continue to work with the enhanced scraper
- **Configuration**: Same source configuration format works with enhanced implementation
- **Job Management**: Job lifecycle and status management remain unchanged

## Alternatives Considered

1. **Keep Both Implementations**: Continue maintaining both scrapers for different use cases
   - Rejected due to maintenance overhead and code duplication
   - No clear scenarios where minimal scraper was actually preferred

2. **Extract Common Interface**: Create shared interface and keep both implementations
   - Rejected as adding unnecessary abstraction layer
   - Enhanced scraper already handled all use cases effectively

3. **Gradual Migration**: Slowly migrate features from minimal to enhanced over time
   - Rejected as enhanced scraper was already feature-complete
   - Would extend the period of maintaining duplicate code

## Implementation Notes

### Files Removed
- `services/scraper/src/minimal-scraper.ts` - Complete file deletion

### Files Modified
- `services/scraper/src/api-server.ts` - Removed minimal scraper import and usage
- `services/scraper/src/enhanced-scraper.ts` - Now uses EnhancedLogger class for all logging operations

### New Utilities Created
- `services/scraper/src/enhanced-logger.ts` - Comprehensive structured logging with JSONB support
- `services/scraper/src/log-queries.ts` - Helper functions for querying structured log data
- `services/scraper/src/test-logs.ts` - Utilities for testing logging functionality
- `services/scraper/src/clear-data.ts` - Data cleanup script for development and testing

### Database Changes
- Added JSONB indexes to optimize queries on `scraping_logs.additional_data` field
- Enhanced table comments to reflect structured logging capabilities

### Migration Strategy
1. All existing jobs continue to work without interruption
2. Enhanced logging provides more detailed information than previous implementation
3. Log query patterns updated to leverage new JSONB structure
4. Performance monitoring now active by default for all scraping operations
```

#### ADR-004-crawlee-storage-strategy.md
```markdown
# ADR-004: Crawlee Storage Strategy for Production

## Status
Accepted (September 23, 2025)

## Context
The scraper service was failing in production (Railway) while working perfectly in local development. Investigation revealed that Crawlee's default file system storage was incompatible with Railway's ephemeral container environment.

**Problem manifestation:**
- Local environment: 60 articles requested → 90 received and scraped successfully
- Production environment: 60 articles requested → 0 received, job marked as successful
- Error: `ENOENT: no such file or directory, open '/app/storage/request_queues/default/[id].json'`

## Decision
Configure Crawlee to use in-memory storage when running in production (`NODE_ENV=production`) while preserving file system storage for local development.

**Implementation approach:**
1. Early configuration in `api-server.ts` before any Crawlee imports
2. Backup configuration in `EnhancedRSSScraper` constructor
3. Remove manual file system directory creation attempts

## Consequences

### Positive
- **Immediate production fix**: Scraper works in containerized environments
- **No local regression**: Development environment continues using file system storage
- **Simpler deployment**: No need for persistent volume configuration in Railway
- **Better performance**: In-memory storage is faster than file I/O
- **Stateless operation**: Aligns with container best practices

### Negative
- **No persistence between restarts**: Crawler state lost on container restart (acceptable since each job is independent)
- **Memory usage**: Storage now uses RAM instead of disk (minimal impact for our use case)
- **No request queue recovery**: Failed requests can't be recovered after crash (mitigated by job-level recovery)

### Neutral
- Different storage strategies between environments (clearly documented and logged)
- Crawlee's advanced features like request queue persistence are unavailable in production

## Technical Details

**Code changes:**
```javascript
// In api-server.ts (early configuration)
import { Configuration } from 'crawlee';
if (process.env.NODE_ENV === 'production') {
  Configuration.set('persistStorage', false);
}

// In EnhancedRSSScraper constructor (backup)
if (process.env.NODE_ENV === 'production') {
  Configuration.set('persistStorage', false);
}
```

**Testing approach:**
- Created `utilities/test-crawlee-storage.js` to verify both modes
- Confirms development uses file system storage
- Confirms production uses in-memory storage

## Alternatives Considered

1. **Persistent volume in Railway**: Would require additional configuration and cost
2. **Redis/External storage**: Over-engineering for our stateless use case
3. **Disable Crawlee queue entirely**: Would lose retry and concurrency management benefits

## References
- Crawlee Documentation: [Storage Configuration](https://crawlee.dev/docs/guides/configuration)
- Railway Documentation: [Ephemeral Storage](https://docs.railway.app/reference/runtime#ephemeral-storage)
- Related commits: b15b6bf
```

#### ADR-004-scraper-logging-separation.md
```markdown
# ADR-004: Separation of Extraction and Persistence Logging

## Status
Accepted (2025-08-08)

## Context
During investigation of scraping job results, we discovered that the logging system was misrepresenting actual outcomes. Specifically:
- Sources like CNN and WSJ were reported as "successful" with 6-7 articles scraped
- However, database queries showed 0 articles from these sources
- NY Times showed all 19 articles were saved (correctly)
- The logs conflated "extraction success" with "persistence success"

This misrepresentation made debugging difficult and gave false confidence about system performance.

## Decision
We will separate the scraping process into two distinct phases with independent logging:

1. **Extraction Phase**: Fetching and parsing content from web sources
2. **Persistence Phase**: Saving extracted content to the database

Each phase will have its own:
- Success/failure tracking per source
- Detailed metrics and logging
- Error handling that doesn't affect the other phase

## Implementation Details

### New Data Structures
```typescript
interface SourceResult {
  sourceName: string;
  sourceId: string;
  extractedArticles: any[];
  extractionMetrics: {
    rssItemsFound: number;
    candidatesProcessed: number;
    extractionAttempts: number;
    extractionSuccesses: number;
    extractionDuration: number;
  };
}

interface SourcePersistenceResult {
  sourceName: string;
  sourceId: string;
  savedCount: number;
  duplicatesSkipped: number;
  saveFailures: number;
  articles: string[];
}
```

### Logging Events
- `source_extraction_completed`: Logged after crawler finishes
- `source_persistence_completed`: Logged after database saves
- `extraction_phase_completed`: Summary of all extraction results
- `job_completed_enhanced`: Final metrics with both phases

### Error Handling
- Crawler teardown errors are caught and logged but don't stop the job
- Each source's failures are isolated
- Clear distinction between extraction failures and save failures

## Consequences

### Positive
- **Accurate visibility**: Logs now accurately reflect what happened at each phase
- **Better debugging**: Can pinpoint exactly where failures occur
- **Improved metrics**: Dashboard shows both extraction and persistence success rates
- **Fault tolerance**: Teardown errors no longer cascade to job failure

### Negative
- **Increased complexity**: Two-phase approach adds complexity to the codebase
- **More log entries**: Doubled logging for source completion (extraction + persistence)
- **Migration effort**: Existing log analysis tools may need updates

### Neutral
- **Performance impact**: Minimal, as the phases were already sequential
- **Database schema**: No changes required, using existing JSONB fields
- **API compatibility**: New fields added to responses without breaking changes

## Alternatives Considered

1. **Single-phase with better error messages**: Would not solve the fundamental issue of conflating extraction with persistence
2. **Async persistence**: Would complicate job status tracking and error handling
3. **Database schema changes**: Would require migration and add complexity

## References
- Original issue: Partial scraping results (19/60 articles)
- Related feature: [Enhanced Logging System](../features/11-enhanced-logging.md)
- Implementation PR: (To be created)
```

#### ADR-005-content-extraction-strategy.md
```markdown
# ADR-005: Multi-Strategy Content Extraction with Structural Filtering

## Status
Accepted (2025-09-23)

## Context
Content extraction from news websites faces several challenges:
- Inconsistent HTML structures across different news sources
- Promotional content mixed with article content (especially Fox News)
- Loss of paragraph structure during extraction
- Difficulty debugging extraction failures
- Need to preserve content integrity while filtering noise

Initial approaches using text-based content matching were rejected as they could accidentally filter legitimate article content. A safer, structural approach was needed.

## Decision
We will implement a multi-strategy extraction system with structural filtering that:

1. **Multi-Strategy Extraction**: Use three extraction methods in order of preference:
   - JSON-LD structured data (most reliable when available)
   - CSS selector-based extraction (site-specific and common patterns)
   - Meta tag fallback (ensures some content always extracted)

2. **Paragraph Structure Preservation**: Maintain readability with triple newlines (`\n\n\n`) between paragraphs

3. **Structural Filtering Only**: Filter content based on HTML structure, not text content:
   - Filter paragraphs that are BOTH entirely hyperlinks AND in ALL CAPS
   - Remove known non-content elements (nav, ads, newsletters)
   - Preserve all other content to avoid false positives

4. **Real-Time Extraction Tracking**: Optional debugging system to track extraction process

## Implementation Details

### Extraction Strategy Priority
```typescript
// 1. Try JSON-LD structured data
const jsonLd = $('script[type="application/ld+json"]')
// Parse NewsArticle or Article types

// 2. Try selector-based extraction
const selectors = getSelectorsForDomain(domain)
// Iterate through selectors until sufficient content found

// 3. Fall back to meta tags
const metaDescription = $('meta[property="og:description"]').attr('content')
```

### Structural Filtering Pattern
```typescript
// Safe structural filtering - only if BOTH conditions met:
const link = $elem.find('a').first();
if (link.length > 0) {
  const linkText = link.text().trim();
  const text = $elem.text().trim();
  // Only filter if: entire paragraph is link AND all caps AND substantial length
  if (linkText === text && text === text.toUpperCase() && text.length > 20) {
    return; // Skip promotional content
  }
}
```

### Extraction Tracking
```typescript
// Enable with API parameter
enableTracking: true
// Provides traces of what was extracted and how
```

## Consequences

### Positive
- **High extraction success rates**: 85-95% across major news sources
- **Preserved content integrity**: No risk of filtering legitimate content
- **Improved readability**: Proper paragraph separation maintained
- **Debuggable**: Clear visibility into extraction process
- **Safe filtering**: Structural patterns avoid content-based false positives

### Negative
- **Complex implementation**: Three extraction strategies increase code complexity
- **Site-specific maintenance**: Selectors may need updates as sites change
- **Limited filtering**: Some promotional content may still appear
- **Processing overhead**: Multiple extraction attempts add latency

### Neutral
- **Performance impact**: 50-200ms per article (acceptable)
- **Storage requirements**: Minimal increase for tracking data
- **Testing complexity**: Requires comprehensive test utilities

## Alternatives Considered

1. **Text-based content matching**: Rejected - too risky for false positives
2. **Machine learning classification**: Rejected - over-engineering for current needs
3. **Manual source configuration only**: Rejected - doesn't scale well
4. **Single extraction strategy**: Rejected - insufficient coverage

## Validation Metrics
Current performance across sources:
- BBC News: ~95% success rate
- CNN: ~90% success rate
- The Guardian: ~95% success rate
- Fox News: ~85% success rate (with filtering)
- NY Times: Limited (403 errors)
- WSJ: Limited (authentication required)

## Testing Infrastructure
Created comprehensive testing utilities (07-11) for:
- Visual debugging with HTML reports
- Batch source analysis
- E2E quality validation
- Paragraph spacing verification
- Content safety checks

## References
- Feature documentation: [Content Extraction System](../features/12-content-extraction.md)
- Related ADR: [ADR-004 Scraper Logging Separation](./ADR-004-scraper-logging-separation.md)
- Implementation files: `services/scraper/src/utils.ts`, `services/scraper/src/extraction-recorder.ts`
- Testing utilities: `utilities/07-extraction-analyzer.js` through `utilities/11-validate-extraction.js`
```

#### ADR-006-real-time-extraction-tracking.md
```markdown
# ADR-006: Real-Time Extraction Tracking System

## Status
Accepted (2025-01-23)

## Context
Debugging content extraction failures was challenging because we couldn't determine exactly which DOM elements and selectors were being accessed during the extraction process. The previous approach used post-extraction string matching to highlight extracted content, which was:
- Inaccurate (false positives/negatives)
- Unable to track failed extraction attempts
- Missing visibility into which extraction strategy succeeded
- Difficult to debug selector-specific issues

We needed a system that could track DOM access in real-time during extraction to provide accurate debugging information.

## Decision
We will implement a real-time extraction tracking system using a lightweight recording pattern that:

1. **Tracks extraction attempts in real-time** without modifying core extraction logic
2. **Records exactly which selectors and methods** are used for each field
3. **Provides zero overhead when disabled** through simple conditional checks
4. **Maintains extraction traces** for debugging and analysis

## Implementation Details

### ExtractionRecorder Class
```typescript
class ExtractionRecorder {
  private traces: ExtractionTrace[] = [];
  private enabled: boolean;

  record(field: string, selector: string, method: string, value: string) {
    if (!this.enabled) return value;  // Zero overhead when disabled
    
    if (value) {
      this.traces.push({ field, selector, method, value });
    }
    return value;
  }
}
```

### Integration Pattern
```typescript
// Simple integration into existing extraction
function extractArticleContent($, url, enableTracking = false) {
  const recorder = new ExtractionRecorder(enableTracking);
  
  // Track extraction attempts
  const title = recorder.record(
    'title',
    'h1.article-title',
    'text',
    $('h1.article-title').text()
  );
  
  return {
    title,
    content,
    traces: recorder.getTraces()  // Include when debugging
  };
}
```

### API Integration
```javascript
POST /api/scraper/trigger
{
  "sources": ["BBC News"],
  "maxArticles": 10,
  "enableTracking": true  // Optional parameter
}
```

## Consequences

### Positive
- **100% accurate debugging**: Know exactly what was extracted and how
- **Failed attempt visibility**: See all selectors tried, not just successful ones
- **Zero production overhead**: Completely disabled by default
- **Simple implementation**: ~100 lines of code, no complex dependencies
- **Extraction strategy insights**: Understand which method succeeded for each source

### Negative
- **Additional parameter complexity**: API and function signatures need optional parameter
- **Memory overhead when enabled**: Stores traces during extraction
- **Not suitable for production**: Should only be used during debugging

### Neutral
- **Optional feature**: No impact unless explicitly enabled
- **Trace data format**: Simple JSON structure, easy to analyze
- **Testing utility dependence**: Most valuable when used with analysis tools

## Alternatives Considered

1. **Complex Cheerio wrapper**: Rejected - too invasive, performance concerns
2. **Post-extraction analysis**: Current approach - inaccurate and limited
3. **Logging-based tracking**: Rejected - too verbose, hard to correlate
4. **Browser DevTools integration**: Rejected - doesn't work with server-side extraction

## Validation Metrics
- **Debugging efficiency**: Reduced time to identify extraction issues by ~75%
- **Accuracy**: 100% accurate tracking vs ~60% with string matching
- **Performance**: <5ms overhead when enabled, 0ms when disabled
- **Coverage**: Tracks all extraction attempts, not just successful ones

## Testing Infrastructure
The tracking system is validated through:
- `utilities/test-extraction-tracking.js` - Validates tracking accuracy
- `utilities/07-extraction-analyzer.js` - Uses traces for debugging reports
- Integration tests in scraper service

## Migration Notes
- No migration required - opt-in feature
- Existing extraction logic unchanged
- Backwards compatible with all existing code

## References
- Feature documentation: [Content Extraction System](../features/12-content-extraction.md)
- Related ADR: [ADR-005 Multi-Strategy Content Extraction](./ADR-005-content-extraction-strategy.md)
- Implementation: `services/scraper/src/extraction-recorder.ts`
- Testing utility: `utilities/test-extraction-tracking.js`
```

#### ADR-007-multi-element-extraction-strategy.md
```markdown
# ADR-007: Multi-Element Content Extraction Strategy

## Status
Accepted

## Date
2025-09-23

## Context
The Veritas scraper was experiencing severe extraction failures with success rates dropping to 0% for certain news sources, particularly BBC News. Investigation revealed that modern news websites often distribute article content across multiple DOM elements rather than a single container, causing our single-element extraction approach to miss most of the content.

### Problem Details
- **BBC News**: Article content split across multiple `[data-component="text-block"]` elements
- **Success Rate**: Dropped from ~47% to 0% for affected sources
- **Root Cause**: Extraction logic only processed the first matching element
- **Impact**: Critical data loss affecting the core value proposition of the platform

## Decision
We will implement a **multi-element extraction strategy** with cascading fallbacks to handle diverse DOM structures across news sources.

### Implementation Approach
1. **Multi-Element Processing**: When a selector matches multiple elements, aggregate content from ALL matching elements
2. **Enhanced Fallback Cascade**: Implement multiple extraction strategies that progressively degrade from specific to general
3. **Source-Specific Handlers**: Add targeted selectors for known source patterns while maintaining generic fallbacks

## Consequences

### Positive
- **Improved Extraction Success**: Restored extraction capability for BBC and similar multi-element layouts
- **Greater Resilience**: System can adapt to various DOM structures without code changes
- **Future-Proof**: Pattern supports adding new source-specific handlers without breaking existing ones
- **Better Content Completeness**: Captures all article content, not just first section

### Negative
- **Increased Complexity**: Extraction logic is more complex with multiple strategies
- **Performance Impact**: Processing multiple elements takes slightly more time
- **Potential Duplication**: Risk of duplicate content if not properly deduplicated
- **Debugging Difficulty**: Harder to trace which extraction strategy was used

### Neutral
- **Memory Usage**: Marginal increase from processing multiple elements
- **Testing Requirements**: Need more comprehensive tests for various DOM patterns

## Alternatives Considered

### 1. JavaScript Rendering (Puppeteer/Playwright)
- **Pros**: Would handle all dynamic content perfectly
- **Cons**: 10x slower, higher resource usage, complexity
- **Decision**: Rejected for now, keep as future option for specific sources

### 2. Source-Specific Extractors Only
- **Pros**: Optimal for each source
- **Cons**: High maintenance, breaks with site changes, no fallback
- **Decision**: Rejected in favor of hybrid approach

### 3. AI-Based Content Detection
- **Pros**: Could intelligently identify content
- **Cons**: Slow, expensive, unpredictable
- **Decision**: Rejected for core extraction, possible future enhancement

## Implementation Details

### Code Changes
- `services/scraper/src/extraction-recorder.ts`: Modified to process ALL matching elements
- `services/scraper/src/utils.ts`: Added BBC-specific selectors and patterns
- `services/scraper/src/enhanced-scraper.ts`: Implemented fallback cascade

### Extraction Strategy Order
1. JSON-LD structured data
2. Source-specific selectors (BBC, NYTimes, Guardian, etc.)
3. Generic article selectors
4. Meta tag fallback
5. Body text extraction (last resort)

### Key Pattern
```typescript
// Process all matching elements, not just first
elements.each((index, element) => {
  // Extract and aggregate content
});
```

## References
- Commit: 52ed9c9 - "fix(scraper): improve content extraction for BBC and other sources"
- Related Issue: Scraper extraction failures investigation
- Documentation: `keystone/procedures/scraper-debugging.md`

## Lessons Learned
1. Modern websites increasingly use component-based architectures that distribute content
2. Single-element assumptions are fragile in web scraping
3. Fallback strategies are essential for production reliability
4. Source-specific optimizations should augment, not replace, generic strategies

## Future Considerations
- Monitor extraction success rates per source
- Consider adding Playwright for JavaScript-heavy sites
- Implement extraction strategy analytics to optimize selector order
- Add automatic selector learning from successful extractions
```

#### ADR-008-fox-news-selector-prioritization.md
```markdown
# ADR-008: Fox News Selector Prioritization Strategy

## Status
Accepted (September 23, 2025)

## Context
The scraper was experiencing inconsistent content extraction from Fox News articles, returning 0 articles despite content being available. Testing revealed that Fox News uses a specific `.article-body` selector that wasn't being prioritized in the extraction selector list.

**Problem manifestation:**
- Fox News extraction success rate: ~85% (below other sources)
- Playwright could extract 8,954 characters from test articles
- Scraper was returning 0 articles from same URLs
- Generic selectors were failing to match Fox News content structure

## Decision
Prioritize the `.article-body` selector early in the extraction selector list to improve Fox News content extraction reliability.

**Implementation:**
- Move `.article-body` selector to position 2 in the selector array (after structured data check)
- Ensure Fox News specific selector is tried before generic fallbacks
- Maintain existing selector fallback chain for other sources

## Consequences

### Positive
- **Improved Fox News extraction**: Success rate increased from ~85% to ~90%
- **Better content coverage**: More articles successfully extracted from Fox News
- **Consistent extraction**: Reliable extraction across different Fox News article layouts
- **No regression**: Other sources continue to work with existing selectors

### Negative
- **Site-specific optimization**: Creates precedent for source-specific selector ordering
- **Maintenance overhead**: May need similar adjustments for other problematic sources

### Neutral
- Selector prioritization is a common practice in web scraping
- Change is minimal and doesn't affect overall extraction architecture

## Technical Details

**Selector order before:**
```javascript
const selectors = [
  '[itemprop="articleBody"]',
  '.article-wrap .article-body',  // Fox-specific was buried here
  '.article-content',
  // ... other selectors
];
```

**Selector order after:**
```javascript
const selectors = [
  '[itemprop="articleBody"]',
  '.article-body',                // Fox-specific prioritized
  '.article-wrap .article-body',
  '.article-content',
  // ... other selectors
];
```

**Testing approach:**
- Created `utilities/test-fox-extraction.js` for Fox News specific testing
- Verified extraction success with prioritized selector
- Confirmed no impact on other sources

## Alternatives Considered

1. **Site-specific extraction handlers**: Would provide maximum flexibility but adds complexity
2. **Dynamic selector ordering**: Could reorder based on source domain but over-engineering for current need
3. **Multiple extraction attempts**: Could try all selectors but reduces performance

## References
- Test utility: `utilities/test-fox-extraction.js`
- Implementation: `services/scraper/src/utils.ts`
- Related commits: 33c08f5 (crawler teardown fix included Fox News improvements)
```

#### ADR-TEMPLATE.md
```markdown
# ADR-XXX: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
[Describe the issue/problem that needs to be addressed. Include relevant background information, constraints, and driving forces behind the decision.]

## Decision
[State the decision that was made and the solution chosen. Be clear and concise about what will be done.]

## Consequences

### Positive
- [List positive outcomes]
- [Benefits of this decision]
- [Problems it solves]

### Negative
- [List negative outcomes]
- [Trade-offs being made]
- [Technical debt incurred]

### Neutral
- [List neutral impacts]
- [Things that will change but aren't necessarily good or bad]

## Alternatives Considered
1. **[Alternative 1]**: [Brief description and why it wasn't chosen]
2. **[Alternative 2]**: [Brief description and why it wasn't chosen]

## Implementation Notes
[Optional: Include any specific implementation details, migration strategies, or important considerations for executing this decision] 
```

</details>

<details>
<summary>🔄 Active Development</summary>

### Current Projects

</details>

<details>
<summary>🔌 API Endpoints</summary>

### UI Service Endpoints (/api/)

- `GET /api/factoids` - Fetch all factoids with relationships
- `GET /api/tags` - Fetch all active tags
- `POST /api/scraper/*` - Proxy endpoints to scraper service

### Scraper Service Endpoints (:3001/api/)

- **Content Management**:
  - `GET /api/content` - Retrieve scraped content
  - `POST /api/scrape` - Trigger scraping operation
  
- **Job Management**:
  - `GET /api/jobs` - List scraping jobs
  - `POST /api/jobs` - Create new scraping job
  - `DELETE /api/jobs/:id` - Cancel running job
  
- **Source Management**:
  - `GET /api/sources` - List all sources
  - `POST /api/sources` - Create new source
  - `PUT /api/sources/:id` - Update source
  - `DELETE /api/sources/:id` - Delete source
  
- **Monitoring**:
  - `GET /api/monitoring/stats` - System statistics
  - `GET /api/monitoring/logs` - Recent logs
  - `GET /health` - Health check endpoint
  
- **Cleanup**:
  - `POST /api/cleanup/logs` - Clean old logs
  - `POST /api/cleanup/content` - Clean old content

</details>

