# Veritas System Architecture

## Overview

Veritas is a multi-service application built with a services-oriented architecture, designed for scalability and maintainability. The system is currently deployed on Railway and uses Supabase for database services.

## Architecture Components

### Services Layer

#### UI Service (`services/ui/`)
- **Technology**: Next.js 15.3.5 with React 19
- **Purpose**: Frontend application and user interface
- **Features**: 
  - Article viewing and management
  - User settings
  - Responsive design with Tailwind CSS
  - Server-side rendering (SSR) and static generation

#### Scraping Service (`services/scraping/`) - *Future Implementation*
- **Technology**: Python/Node.js (TBD)
- **Purpose**: RSS feed scraping and web content extraction
- **Features**:
  - Automated content scraping
  - Data processing and cleaning
  - Scheduled execution via Railway Cron Jobs

#### LLM Service (`services/llm/`) - *Future Implementation*
- **Technology**: Python with Docker containers
- **Purpose**: Open-source LLM integration for content processing
- **Features**:
  - Factoid extraction from scraped content
  - Content analysis and quality scoring
  - Integration with Llama 2/3, Mistral, or similar models

### Shared Layer (`shared/`)
- **Types**: Common TypeScript definitions
- **Utils**: Shared utility functions
- **Config**: Cross-service configuration

### Infrastructure Layer (`infrastructure/`)
- **Railway Configuration**: Service deployment configurations
- **Docker**: Container definitions for services
- **Scripts**: Deployment and maintenance scripts

### Data Layer (`database/`)
- **Current**: Supabase PostgreSQL
- **Future**: Railway PostgreSQL (Phase 2 migration)
- **Structure**: 
  - Migrations: SQL schema changes
  - Seeds: Initial data setup
  - Schemas: Database structure definitions

## Deployment Architecture

### Current State (Phase 1)
- **Frontend**: Railway (services/ui/)
- **Database**: Supabase PostgreSQL
- **Domain**: https://veritas-production-e04f.up.railway.app

### Future State (Phase 2)
- **Frontend**: Railway (services/ui/)
- **Backend Services**: Railway (scraping/, llm/)
- **Database**: Railway PostgreSQL
- **Orchestration**: Railway service interconnection

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.5
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Build**: Turbopack (development)

### Backend (Future)
- **Scraping**: Python (Beautiful Soup/Scrapy) or Node.js
- **LLM**: Python with Docker containers
- **API**: RESTful endpoints

### Database
- **Current**: Supabase PostgreSQL
- **Future**: Railway PostgreSQL
- **ORM**: Direct SQL / Supabase client

### Infrastructure
- **Platform**: Railway
- **CI/CD**: GitHub integration
- **Monitoring**: Railway built-in observability
- **Environment**: Production/Development separation

## Security Considerations

- Environment variable management via Railway
- Secure database connections
- API key protection
- HTTPS enforcement
- Input validation and sanitization

## Scalability Design

- Service-oriented architecture for independent scaling
- Database separation for performance optimization
- CDN integration for static assets
- Horizontal scaling capabilities via Railway

## Development Workflow

1. **Local Development**: Individual service development
2. **Version Control**: Git with feature branches
3. **Testing**: Service-level testing and integration tests
4. **Deployment**: Automated via Railway GitHub integration
5. **Monitoring**: Railway observability and custom metrics 