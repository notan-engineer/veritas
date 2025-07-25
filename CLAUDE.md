# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Keystone Framework?
A mandatory development methodology for all work in this project. Keystone provides structured guidelines, procedures, and templates to ensure consistent, maintainable code. **The framework MUST be consulted and followed in every interaction, task, and response.**

## Framework Navigation Guide
**When to consult which framework file:**
- **Always (every interaction)** → Follow `keystone/agentic-principles.md` for agent behavior guidelines
- **Starting any task** → Check `keystone/procedures/` for the relevant procedure
- **Writing code** → Follow `keystone/development-principles.md` for coding standards
- **Making architectural changes** → Review:
  - `documentation/software-architecture.md` for system design
  - `documentation/the-product.md` for product vision
  - `documentation/decisions/` for past ADRs (Architecture Decision Records)
- **Creating new projects** → Use `keystone/templates/new-project-template/`
- **Planning features** → Create in `projects/` with user stories
- **Local development** → Use `local/` for testing (git-ignored)
- **Understanding features** → See `documentation/features/` for specifications

## Commands

### UI Service (Main Next.js Application)
```bash
# CRITICAL: Always run from services/ui directory
cd services/ui

# Development
npm run dev                # Start development server (http://localhost:3000)

# Build & Validation
npm run build             # Build for production
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run type-check        # TypeScript type checking
npm run test:all          # Run all checks (lint, type-check, build)

# Production
npm start                 # Start production server
```

### Scraper Service (Content Aggregation)
```bash
# CRITICAL: Always run from services/scraper directory
cd services/scraper

# Development
npm run dev               # Start development server with ts-node

# Build & Production
npm run build             # Compile TypeScript to dist/
npm start                 # Run production server
npm run clean             # Clean build artifacts
```

### Database
```bash
# Run migrations from database directory
cd database
# Apply migrations manually as needed
```

## High-Level Architecture

### Service Architecture
The project uses a **three-service Railway deployment**:
1. **UI Service** (`services/ui/`) - Next.js 15.3.5 frontend with App Router
2. **Scraper Service** (`services/scraper/`) - Crawlee-based content aggregation with monitoring dashboard
3. **Database Service** - Shared PostgreSQL instance accessed by both services

Services communicate via HTTP REST APIs and share the PostgreSQL database.

### Core Data Flow
1. **Scraper Service** collects content from RSS feeds and web sources
2. Content is stored in `scraped_content` table with metadata
3. **UI Service** fetches factoids (processed content) from database
4. Factoids are displayed with tags and source attribution

### Key Technical Decisions
- **No Authentication**: Simplified public access, no user management
- **Direct Database Access**: Both services connect directly to PostgreSQL
- **Service Communication**: UI proxies scraper API calls via internal Railway URLs
- **Minimal Dependencies**: Only essential packages, no unnecessary complexity

### Database Schema Overview
```
factoids         → Core content units (title, description, bullet_points)
sources          → News sources (domain, url, metadata)
tags             → Content categorization
scraped_content  → Raw content from scraper service
factoid_tags     → Many-to-many relationships
factoid_sources  → Many-to-many relationships
```

### Critical Non-Negotiable Rules
1. **NEVER push directly to main** - Use feature branches only
2. **Builds MUST run from service directory**: `cd services/[service] && npm run build`
   - UI Service: `cd services/ui && npm run build`
   - Scraper Service: `cd services/scraper && npm run build`
   - Future services follow same pattern
3. **Context Selection**: ALWAYS use @file, NEVER use @folder
4. **Follow Keystone Framework** - Check `keystone/` for procedures and principles
5. **Simplicity First** - Write minimal code, avoid over-engineering
6. **User-Centric Development**: Every feature must serve clear user need
7. **Test Before Commit** - Run lint, type-check, and build

### Keystone Framework Navigation
- **Development Standards**: `keystone/development-principles.md`
- **Procedures**: `keystone/procedures/` (feature development, bug fixes, etc.)
- **Agent Behavior**: `keystone/agentic-principles.md`
- **Architecture Details**: `documentation/software-architecture.md`
- **Product Vision**: `documentation/the-product.md`

### Core Development Principles
- **Simplicity First**: Minimum viable code, no over-engineering
- **User-Centric**: Features driven by actual user needs, not assumptions
- **Incremental**: Start minimal, expand only when proven necessary
- **Test Always**: No commits without successful builds
- **Document Immediately**: Keep docs current with code
- **Beautiful Simplicity**: Every UI element must be clean, pixel-perfect, and serve a clear purpose. No clutter, no complexity - just elegant interfaces that delight users

### UI Development Guidelines
- Use **shadcn/ui components** exclusively
- Ensure **dark mode compatibility** for all components
- Follow **RTL support** patterns for Hebrew/Arabic content
- Keep components **simple and focused**
- No hardcoded values - everything from database

### API Endpoints Overview

**UI Service** (`/api/`):
- `GET /api/factoids` - Fetch all factoids with relationships
- `GET /api/tags` - Fetch all active tags
- `POST /api/scraper/*` - Proxy endpoints to scraper service

**Scraper Service** (`:3001/api/`):
- Content: `/api/content`, `/api/scrape`
- Jobs: `/api/jobs` (list, create, cancel)
- Sources: `/api/sources` (CRUD operations)
- Monitoring: `/api/monitoring/*`, `/health`
- Cleanup: `/api/cleanup/*`

### Common Development Tasks

**Adding a New Feature**:
1. Create feature branch: `git checkout -b feature/description`
2. Check relevant procedure in `keystone/procedures/`
3. Implement with minimal code
4. Test: `cd services/[service] && npm run test:all`
5. Update documentation
6. Create PR for manual merge

**Debugging Database Issues**:
1. Check connection: Verify `DATABASE_URL` in environment
2. Review schema: `database/schema.sql`
3. Test queries: Use `lib/railway-database.ts` patterns
4. Check logs: Railway dashboard for service logs

**Working with Scraper Dashboard**:
- Navigate to `/scraper` in UI
- Three tabs: Health, Content Feed, Source Management
- All operations proxy through UI to scraper service
- Check browser console for API errors

### Environment Variables
Both services use `DATABASE_URL` (provided by Railway). Additional service-specific:
- UI: `SCRAPER_SERVICE_URL` (internal Railway URL)
- Scraper: Auto-configured by Railway

### Performance Considerations
- Database queries use connection pooling
- Static generation where possible
- Minimal bundle size (only essential components)
- Content deduplication in scraper service
- Resource monitoring and cleanup automation

### Quick Reference
- Reference docs: @documentation/file.md (section)
- Never include full document content in responses
- Use line-specific references when needed: @file.ts:20-40
- Session Management: One Task = One Session
- Tab Management: Keep 3-5 files maximum open at once