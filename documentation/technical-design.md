# Veritas Technical Design Document

## System Architecture Overview

Veritas is built as a modern web application using a simplified, single-service architecture optimized for cost-effectiveness and maintainability. The system emphasizes simplicity while maintaining scalability for future growth.

### Architecture Philosophy
- **Simplicity First**: Single service architecture until multiple services are actually needed
- **Cost Optimization**: Minimal infrastructure with efficient scaling
- **Performance Focus**: Sub-2-second page loads with optimized database queries
- **Maintainability**: Clean, understandable code with comprehensive documentation
- **Provider Agnostic**: Flexible database provider switching for cost optimization

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.3.5 with App Router
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Turbopack (development)

### Backend & Data
- **Database**: Railway PostgreSQL (production)
- **Database Client**: PostgreSQL native client with connection pooling
- **ORM**: Direct SQL queries with prepared statements
- **Authentication**: To be implemented (future)
- **File Storage**: To be implemented (future)

### Infrastructure & Deployment
- **Platform**: Railway (cost-optimized cloud hosting)
- **CI/CD**: GitHub integration with automatic deployments
- **Domain**: Railway-provided domain with SSL
- **Monitoring**: Railway built-in observability
- **Environment**: Production/Development separation with provider switching

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Code Formatting**: Prettier (automatic)
- **Version Control**: Git with GitHub
- **Package Manager**: npm
- **Development Server**: Next.js development server with hot reload
- **Environment Validation**: Automated environment configuration validation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Firefox, Safari, Edge)                │
│  │                                                          │
│  ├── Responsive UI (Mobile/Desktop)                         │
│  ├── Progressive Web App Features                           │
│  └── RTL Support (Hebrew/Arabic)                           │
└─────────────────────────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────┤
│              Next.js Application (Railway)                  │
│  │                                                          │
│  ├── App Router (SSR/SSG)                                  │
│  ├── API Routes (Server-side logic)                        │
│  │   ├── /api/railway/* (Railway PostgreSQL endpoints)     │
│  │   └── Database Provider Switch                          │
│  ├── Component Library (shadcn/ui)                         │
│  ├── Data Service Layer (Provider Agnostic)                │
│  ├── Input Validation & Security Utilities                 │
│  ├── PostgreSQL Client (Connection Pooling)                │
│  └── RTL Utilities & Internationalization                  │
└─────────────────────────────────────────────────────────────┘
                             │ HTTPS/PostgreSQL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│            Railway PostgreSQL                               │
│  │                                                          │
│  ├── Factoids (Core content with full-text search)         │
│  ├── Sources (News source tracking)                        │
│  ├── Tags (Hierarchical categorization)                    │
│  ├── Users (Authentication ready)                          │
│  ├── Advanced Full-text Search (GIN indexes)               │
│  ├── Connection Pooling & Performance Optimization         │
│  └── Row-level Security (RLS)                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Architecture

### Railway PostgreSQL Database

The system uses Railway PostgreSQL as the primary database with the following features:

#### Database Features
- **Production Environment**: Single Railway PostgreSQL instance
- **Direct PostgreSQL Connection**: Native PostgreSQL client with connection pooling
- **Advanced Full-text Search**: GIN indexes for optimized search performance
- **Cost-Optimized**: $3-5/month for current usage requirements
- **High-Performance**: Optimized queries and proper indexing

#### Database Configuration

```typescript
// lib/railway-database.ts
interface RailwayConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMs: number;
}
```

#### Connection Management
- Environment variable-based configuration
- Connection pooling for performance
- SSL-enforced connections
- Environment validation and health checks

### API Routes Architecture

#### Database Endpoints
```
/api/factoids          # GET: All published factoids
/api/factoids/[id]     # GET: Factoid by ID with relations
/api/factoids/search   # GET: Full-text search with ranking
/api/tags              # GET: All active tags with hierarchy
```

#### Data Service Integration
- Type-safe interface in `lib/data-service.ts`
- Direct API route integration
- Consistent data models
- Error handling and retry logic

## Codebase Structure

### Project File System
```
veritas/
├── services/ui/                    # Next.js Application
│   ├── app/                       # App Router Pages
│   │   ├── page.tsx              # Homepage (factoid feed)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── not-found.tsx         # 404 page
│   │   ├── favicon.ico           # Site icon
│   │   ├── article/[id]/         # Dynamic factoid pages
│   │   │   └── page.tsx          # Factoid detail view
│   │   └── settings/             # Application settings
│   │       └── page.tsx          # Settings page
│   │
│   ├── components/               # React Components
│   │   └── ui/                   # shadcn/ui Components
│   │       ├── avatar.tsx        # User avatar
│   │       ├── badge.tsx         # Status/tag badges
│   │       ├── button.tsx        # Interactive buttons
│   │       ├── card.tsx          # Content containers
│   │       ├── input.tsx         # Form inputs
│   │       ├── label.tsx         # Form labels
│   │       ├── skeleton.tsx      # Loading states
│   │       ├── switch.tsx        # Toggle controls
│   │       └── theme-toggle.tsx  # Dark/light mode
│   │
│   ├── lib/                      # Utility Libraries
│   │   ├── data-service.ts       # Database operations
│   │   ├── railway-database.ts   # Railway PostgreSQL client with pooling
│   │   ├── input-validation.ts   # Security & validation utilities
│   │   ├── rtl-utils.ts          # Right-to-left support
│   │   ├── utils.ts              # General utilities
│   │   └── mock-data.ts          # Development data
│   │
│   ├── scripts/                  # Build and Development Scripts
│   │   └── validate-env.ts       # Environment validation utility
│   │
│   ├── public/                   # Static Assets
│   │   ├── favicon-16x16.png     # Small icon
│   │   ├── favicon-32x32.png     # Medium icon
│   │   └── *.svg                 # Vector icons
│   │
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.ts            # Next.js config
│   ├── postcss.config.mjs        # PostCSS config
│   ├── eslint.config.mjs         # ESLint config
│   ├── components.json           # shadcn/ui config
│   └── .env.example              # Environment template
│
├── database/                     # Database Management
│   ├── migrations/               # SQL Migration Files
│   │   └── veritas-migration.sql # Database schema migration
│   ├── railway-schema.sql        # Railway PostgreSQL schema
│   └── migrate-to-railway.js     # Migration script
│
├── infrastructure/               # Deployment Configuration
│   └── railway.toml              # Railway deployment config
│
├── documentation/                # Project Documentation
│   ├── product-requirements.md   # User requirements
│   ├── technical-design.md       # Technical architecture
│   ├── developer-guidelines.md   # Development standards
│   └── planning/                 # Project Planning Documents
│       ├── 08-07-25 - Railway Migration.md
│       └── 10-07-25 - Project Simplification - DONE.md
│
├── package.json                  # Root package config
├── README.md                     # Project overview
├── DEVELOPMENT.md                # Development guide
├── LICENSE                       # MIT license
├── .gitignore                   # Git exclusions
├── env.example                  # Environment template
└── vercel.json                  # Legacy config (Railway migration)
```

## Database Design

### Schema Architecture

The database follows a **factoid-centric design** optimized for news aggregation and multi-source verification.

#### Core Tables

**factoids** (Primary content entity)
```sql
- id: UUID (Primary Key)
- title: VARCHAR(500) - Factoid headline
- description: TEXT - Brief summary
- bullet_points: TEXT[] - Key facts array
- language: VARCHAR(10) - Language code ('en', 'he', 'ar', 'other')
- confidence_score: DECIMAL(3,2) - Reliability (0.00-1.00)
- status: VARCHAR(50) - Status ('draft', 'published', 'archived', 'flagged')
- search_vector: TSVECTOR - Full-text search (auto-maintained)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

**sources** (News source tracking)
```sql
- id: UUID (Primary Key)
- name: VARCHAR(200) - Source name
- domain: VARCHAR(100) - Website domain (unique)
- url: VARCHAR(500) - Source homepage
- description: TEXT - Source description
- icon_url: VARCHAR(500) - Source logo
- twitter_handle: VARCHAR(100) - Twitter account
- profile_photo_url: VARCHAR(500) - Profile image
- is_active: BOOLEAN - Source status
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

**scraped_content** (Raw content from sources)
```sql
- id: UUID (Primary Key)
- source_id: UUID (Foreign Key → sources.id)
- source_url: VARCHAR(500) - Original article URL
- title: TEXT - Article title
- content: TEXT - Article content
- author: VARCHAR(200) - Article author
- publication_date: TIMESTAMP WITH TIME ZONE
- content_type: VARCHAR(50) - Content type ('article', 'social_post', 'video', 'other')
- language: VARCHAR(10) - Language code
- processing_status: VARCHAR(50) - Processing status ('pending', 'processing', 'completed', 'failed')
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

**tags** (Hierarchical categorization)
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) - Tag name
- slug: VARCHAR(100) - URL-friendly name (unique)
- description: TEXT - Tag description
- parent_id: UUID (Foreign Key → tags.id) - Hierarchy support
- level: INTEGER - Hierarchy depth (0-10)
- is_active: BOOLEAN - Tag status
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

**factoid_tags** (Many-to-many relationships)
```sql
- id: UUID (Primary Key)
- factoid_id: UUID (Foreign Key → factoids.id)
- tag_id: UUID (Foreign Key → tags.id)
- confidence_score: DECIMAL(3,2) - Tag relevance (0.00-1.00)
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE(factoid_id, tag_id)
```

**factoid_sources** (Source attribution)
```sql
- id: UUID (Primary Key)
- factoid_id: UUID (Foreign Key → factoids.id)
- scraped_content_id: UUID (Foreign Key → scraped_content.id)
- relevance_score: DECIMAL(3,2) - Source relevance (0.00-1.00)
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE(factoid_id, scraped_content_id)
```

#### User Management Tables (Authentication Ready)

**users** (User accounts)
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) - User email (unique)
- username: VARCHAR(100) - Username (unique)
- full_name: VARCHAR(200) - Full name
- avatar_url: VARCHAR(500) - Profile image
- preferences: JSONB - User preferences
- is_active: BOOLEAN - Account status
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

**user_subscriptions** (User source subscriptions)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- source_id: UUID (Foreign Key → sources.id)
- is_active: BOOLEAN - Subscription status
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE(user_id, source_id)
```

**user_tag_preferences** (User tag preferences)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- tag_id: UUID (Foreign Key → tags.id)
- preference_type: VARCHAR(50) - Preference ('follow', 'block', 'mute')
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE(user_id, tag_id)
```

**user_actions** (Private user actions)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- factoid_id: UUID (Foreign Key → factoids.id)
- action_type: VARCHAR(50) - Action ('read', 'bookmark', 'hide', 'report')
- metadata: JSONB - Additional action data
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE(user_id, factoid_id, action_type)
```

**user_interactions** (Public user interactions)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- factoid_id: UUID (Foreign Key → factoids.id)
- interaction_type: VARCHAR(50) - Interaction ('like', 'dislike', 'comment')
- content: TEXT - Comment content (for comments)
- is_public: BOOLEAN - Visibility setting
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

#### Performance Optimizations

**Full-Text Search**
- Automated search vector generation with weighted fields:
  - Title: Weight 'A' (highest priority)
  - Description: Weight 'B' (medium priority)
  - Bullet points: Weight 'C' (lower priority)
- GIN index on search_vector for fast text search
- Trigger-based automatic search vector updates

**Primary Indexes**
- **Sources**: domain, is_active, created_at DESC
- **Scraped Content**: source_id, source_url, processing_status, created_at DESC
- **Tags**: slug, parent_id, level, is_active, name
- **Factoids**: status, language, confidence_score DESC, created_at DESC
- **User Tables**: email, username, is_active for users; user_id, factoid_id for actions

**Composite Indexes for Common Queries**
- **factoids_status_created_at**: Optimized for published content by date
- **factoids_status_language**: Optimized for language-specific queries
- **factoids_status_confidence**: Optimized for high-confidence content

**Relationship Indexes**
- **factoid_tags**: factoid_id, tag_id, confidence_score DESC
- **factoid_sources**: factoid_id, scraped_content_id, relevance_score DESC
- **user_subscriptions**: user_id, source_id for user preferences
- **user_actions**: user_id, factoid_id, created_at DESC for user history

**Database Functions and Triggers**
- **update_factoid_search_vector()**: Automatically maintains search vectors
- **update_updated_at_column()**: Automatically updates timestamp fields
- **check_tag_hierarchy()**: Prevents circular references in tag hierarchy

**Query Optimization**
- Batch fetching to prevent N+1 problems
- Efficient JOIN operations for related data
- Prepared statements for common queries
- Connection pooling for scalability
- Row-level security policies for future authentication

## Data Service Architecture

### Data Access Layer (`lib/data-service.ts`)

The data service provides a **type-safe, optimized interface** for all database operations.

#### Core Functions
```typescript
// Primary factoid operations
getAllFactoids(): Promise<Factoid[]>
getFactoidById(id: string): Promise<Factoid | null>
getFactoidsByTag(tagSlug: string): Promise<Factoid[]>
getFactoidsByLanguage(language: Language): Promise<Factoid[]>
searchFactoids(query: string): Promise<Factoid[]>

// Tag and categorization
getAllTags(): Promise<Tag[]>
getTagsByLevel(level: number): Promise<Tag[]>
getChildTags(parentId: string): Promise<Tag[]>

// Source management
getAllSources(): Promise<Source[]>
```

#### Performance Features
- **Batch Processing**: `getBatchTagsForFactoids()` and `getBatchSourcesForFactoids()`
- **Error Handling**: Graceful fallbacks for failed operations
- **Type Safety**: Comprehensive TypeScript interfaces
- **Search Optimization**: Full-text search with simple search fallback

### TypeScript Interfaces

**Primary Data Models**
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
  updated_at: string
  tags: Tag[]
  sources: Source[]
}

interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  level: number
  is_active: boolean
  confidence_score?: number
}

interface Source {
  id: string
  name: string
  domain: string
  url: string
  description?: string
  relevance_score?: number
  scraped_content?: ScrapedContent
}
```

## Frontend Architecture

### Component Architecture

**Design System**: shadcn/ui with Radix UI primitives
- **Consistent**: All components follow the same design patterns
- **Accessible**: Built-in ARIA support and keyboard navigation
- **Themeable**: Dark/light mode with CSS variables
- **Responsive**: Mobile-first design with breakpoint utilities

**Component Hierarchy**
```
App Layout (layout.tsx)
├── Header Navigation
├── Theme Toggle
├── Main Content Area
│   ├── Homepage (page.tsx)
│   │   ├── Topic Filter Buttons
│   │   ├── Factoid Cards
│   │   └── Loading Skeletons
│   │
│   ├── Factoid Detail (article/[id]/page.tsx)
│   │   ├── Factoid Header
│   │   ├── Bullet Points List
│   │   ├── Source Attribution
│   │   └── Interaction Controls
│   │
│   └── Settings (settings/page.tsx)
│       ├── Theme Controls
│       ├── Language Preferences
│       └── Development Status
│
└── Footer
```

### State Management

**Strategy**: React hooks with server-side data fetching
- **Local State**: `useState` for component-specific data
- **Server State**: Direct async calls to data service
- **Loading States**: Skeleton components during data fetching
- **Error Handling**: Try-catch blocks with user feedback

### Internationalization & RTL Support

**RTL Utilities** (`lib/rtl-utils.ts`)
```typescript
type Language = 'en' | 'he' | 'ar' | 'other'

// Core RTL functions
isRTL(language: Language): boolean
getRTLClasses(language: Language): string
getRTLContainerClasses(language: Language): string
getRTLFlexDirection(language: Language): string
```

**Implementation Features**
- Automatic text direction detection
- CSS class generation for RTL layouts
- Flex direction utilities for proper alignment
- Language-specific date and time formatting

## Performance & Optimization

### Frontend Performance
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Browser caching with proper cache headers

### Database Performance
- **Connection Pooling**: Railway PostgreSQL connection management
- **Query Optimization**: Batch operations and efficient JOINs
- **Indexing Strategy**: Full-text search and composite indexes
- **Data Fetching**: Server-side rendering for better initial load

### Cost Optimization
- **Railway Hosting**: $5-10/month for current usage
- **Railway PostgreSQL**: Cost-optimized database hosting
- **Efficient Scaling**: Horizontal scaling only when needed
- **Resource Monitoring**: Track usage to prevent cost surprises

## Security Architecture

### Application Security
- **Input Validation**: Comprehensive server-side validation with `lib/input-validation.ts`
  - Schema-based validation for all data types
  - SQL injection pattern detection
  - XSS prevention and sanitization
  - Rate limiting with configurable windows
- **SQL Injection Prevention**: Parameterized queries with PostgreSQL prepared statements
- **XSS Protection**: React's built-in XSS prevention + input sanitization
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Security Headers**: Standard security headers on all API responses

### Database Security
- **Row-Level Security (RLS)**: PostgreSQL RLS policies on all tables
- **Connection Security**: SSL-enforced connections with certificate validation
- **API Key Management**: Environment variable protection with validation
- **Access Control**: Least privilege principle with connection pooling limits
- **Regular Updates**: Dependency and security updates with vulnerability scanning

### Input Validation System
```typescript
// Comprehensive validation utilities
validateFactoidInput(data: unknown): ValidationResult
validateSearchQuery(query: unknown): ValidationResult
validateUUID(uuid: unknown): boolean
checkRateLimit(config: RateLimitConfig): { allowed: boolean }
```

**Validation Features**:
- Type-safe schema validation
- SQL injection pattern detection
- String sanitization and length limits
- Rate limiting with memory-based store
- UUID format validation
- Pagination parameter validation

### Infrastructure Security
- **HTTPS Enforcement**: All communications encrypted
- **Environment Isolation**: Separate development/production
- **Secure Headers**: Security headers via Next.js
- **Rate Limiting**: Protection against abuse

## Development Workflow

### Build Process
```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # Code quality check
npm run test:env         # Environment validation
npm run test:env:template # Generate environment template
```

### Deployment Pipeline
1. **Code Push**: Developer pushes to feature branch
2. **Automatic Build**: Railway triggers build process
3. **Testing**: Environment validation and smoke tests
4. **Deployment**: Automatic deployment to Railway
5. **Monitoring**: Performance and error monitoring

### Code Quality
- **TypeScript**: Strict mode with comprehensive typing
- **ESLint**: Code quality and consistency rules
- **Prettier**: Automatic code formatting
- **Git Hooks**: Pre-commit validation (future)

## Monitoring & Analytics

### Performance Monitoring
- **Railway Metrics**: Built-in application monitoring
- **Core Web Vitals**: User experience metrics
- **Database Performance**: Query performance tracking
- **Error Tracking**: Application error monitoring

### User Analytics
- **Usage Patterns**: Page views and user interactions
- **Content Performance**: Factoid engagement metrics
- **Device Analytics**: Mobile vs. desktop usage
- **Geographic Data**: User location insights

## Future Technical Considerations

### Scalability Planning
- **Horizontal Scaling**: Multiple Railway service instances
- **Database Scaling**: Read replicas and connection pooling
- **CDN Integration**: Static asset distribution
- **Caching Layer**: Redis for frequently accessed data

### Architecture Evolution
- **Microservices**: Split into services when needed
- **Event-Driven**: Message queues for async processing
- **API Gateway**: Centralized API management
- **Container Orchestration**: Docker containers for services

### Technology Upgrades
- **Next.js Updates**: Regular framework updates
- **Database Migration**: Potential move to Railway PostgreSQL
- **New Technologies**: Evaluate emerging technologies
- **Performance Optimization**: Continuous performance improvements

This technical design document should be updated whenever architectural decisions are made, new technologies are adopted, or significant structural changes occur. 