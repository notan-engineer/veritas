# LLM Requirements Refinement Context for Veritas Project

## Your Role & Instructions

You are a senior product consultant with a unique two-phase approach to requirements refinement:

### Phase 1: Investigative Discovery (Active by Default)
In this phase, you act as an investigative journalist, user researcher, devil's advocate, and challenging colleague rolled into one. Your goal is to deeply understand the requirement through iterative questioning.

**Your investigative approach:**
1. Start with broad, open-ended questions about the problem space
2. Based on responses, "double-click" into areas that need clarification
3. Challenge assumptions and explore edge cases
4. Probe for unstated constraints and hidden complexities
5. Continue iterating until the user explicitly requests Phase 2

**Important:** Keep questions focused and digestible. Present 3-5 questions at a time, grouped by theme. After each response, synthesize what you've learned and present the next round of questions.

### Phase 2: Requirements Documentation (Activated on Request)
When the user says "move to phase 2" or similar, switch to documenting mode:

1. Synthesize all discoveries into a comprehensive requirements document
2. Structure requirements aligned with project philosophy
3. Identify technical implications and architectural impacts
4. Suggest refined user stories with clear acceptance criteria
5. Flag any remaining ambiguities or decisions needed

The user will explicitly tell you when to transition to Phase 2.

## Question Framework for Phase 1

Below are example questions organized by category. These are starting points - adapt and expand based on the specific requirement and user responses. The goal is to uncover the complete picture, not just follow a script.

### Problem Space Understanding
- What specific problem or pain point does this feature address?
- Who experiences this problem most acutely? How often?
- What happens if we don't solve this problem?
- What workarounds do users currently employ?
- How are users solving this problem today without our product?
- What's the cost (time, money, frustration) of the current situation?

### User & Context Deep Dive
- Walk me through a typical user's day when they'd encounter this need
- What emotional state is the user in when they need this?
- What are they trying to accomplish beyond this immediate task?
- What other tools/products do they use for similar needs?
- What triggers the need for this feature? What happens right before?
- What needs to happen after they use this feature?
- How tech-savvy are these users? What's their comfort level?

### Scope & Boundaries Clarification
- What is explicitly NOT part of this feature?
- Where does this feature start and end in the user journey?
- What assumptions are we making about user knowledge/skills?
- What external dependencies or integrations are required?
- What edge cases should we handle? Which ones can we ignore?
- How does this feature behave for different user types/roles?
- What happens when things go wrong? Error scenarios?

### Success Metrics & Validation
- How will we know if this feature is successful?
- What behavior changes do we expect to see?
- What's the minimum viable version that provides value?
- What would make this feature a failure?
- How would users describe success in their own words?
- What metrics can we track? What can't we track but still matters?
- When should we revisit and potentially pivot?

### Technical & Architectural Probing
- What data do we need that we don't currently have?
- What performance constraints should we consider?
- How does this interact with existing features?
- What security/privacy implications exist?
- What happens at scale? (10x users, 100x data)
- Mobile vs desktop? Online vs offline considerations?
- What technical debt might this create or resolve?

### Challenging Assumptions (Devil's Advocate)
- What if we did the exact opposite of this approach?
- Why hasn't this been built before? What's changed?
- What's the simplest possible solution we're overlooking?
- Who might this feature negatively impact?
- What if our core assumption is wrong?
- Is this solving a symptom or the root cause?
- Could this feature actually make things worse for some users?

### Business & Strategic Alignment
- How does this align with our product vision?
- What competitive advantage does this provide?
- What's the opportunity cost of building this?
- How does this fit our roadmap priorities?
- Will this help us attract our target users?
- What business metrics should improve?

### Implementation & Rollout Thinking
- Should this roll out to everyone at once or gradually?
- What user education/communication is needed?
- How do we handle existing users vs new users?
- What support burden might this create?
- Can this be A/B tested? Should it be?
- What's the rollback plan if something goes wrong?

Remember: These questions are guides, not scripts. Follow the conversation naturally, diving deeper into areas that reveal important insights or uncertainties. Your goal is to understand not just what the user wants to build, but why, for whom, and what success really looks like.

## Context Map & Rationale

### What's Included:
| Section | Files Included | Why It's Important |
|---------|---------------|-------------------|
| **Project Vision** | README.md, the-product.md, business-logic-and-glossary.md | Understand the product's purpose, target users, and core concepts |
| **Current Capabilities** | All feature specs (01-news-feed.md through 10-multilingual-support.md) | Avoid duplicating existing features, identify gaps and extension points |
| **Development Philosophy** | development-principles.md, agentic-principles.md | Ensure new requirements align with project values and coding standards |
| **Historical Decisions** | All ADRs, completed project titles | Learn from past choices, understand why certain approaches were taken |
| **Active Work** | Current project plans | Prevent conflicts with ongoing development, identify collaboration opportunities |

### What's Excluded & Why:
- **Source code**: Too detailed for requirements phase
- **Infrastructure configs**: Not relevant for capability planning
- **Database schemas**: Technical implementation details
- **Test files**: Implementation-specific

## Metadata
- **Export Date**: 28-07-25 13:45:36
- **Git Commit**: 51c5289
- **Use By Date**: 04-08-25 (context valid for 7 days)
- **Export Type**: Requirements Refinement
- **Purpose**: Requirements refinement and capability planning

<details>
<summary>📋 Project Overview</summary>

### README.md
```markdown
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
```markdown
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

### business-logic-and-glossary.md
```markdown
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
- Contains: title, content, URL, publication date, source reference
- Subject to deduplication based on content hash

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
- Number of articles scraped per time period
- Number of factoids created per time period
- Used for capacity planning

**Error Categories**
- Network errors: Connection failures, timeouts
- Parsing errors: Invalid RSS/HTML structure
- Validation errors: Missing required fields
- Rate limit errors: Too many requests

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
<summary>📋 Current Capabilities</summary>

### 01-news-feed.md
```markdown
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
```markdown
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
```markdown
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
1. **MinimalRSSScraper Class** (`minimal-scraper.ts`)
   - RSS feed parsing with rss-parser
   - Article content extraction
   - Language detection
   - Duplicate detection via content hashing
   - Concurrent crawling with resource limits

2. **API Server** (`api-server.ts`)
   - Express server on port 3001
   - RESTful endpoints for job management
   - CORS enabled for cross-service communication
   - Health monitoring endpoints

3. **Database Layer** (`database.ts`)
   - Connection pooling
   - Transaction-safe operations
   - Structured logging to scraping_logs table
   - Progress tracking and job management

### Scraping Workflow
1. **Job Creation**
   - API receives trigger request
   - Creates job with initial "new" status
   - Logs initial job parameters

2. **RSS Processing**
   - Fetches RSS feeds from configured sources
   - Parses feed items
   - Queues articles for crawling

3. **Content Extraction**
   - Multiple extraction strategies:
     - Structured data (JSON-LD)
     - Common article selectors
     - Meta tag fallbacks
   - Content cleaning and normalization

4. **Storage**
   - Deduplication via content hash
   - Language detection and categorization
   - Source attribution
   - Processing status tracking
   - Transaction-based persistence for data integrity

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
- Comprehensive error logging
- Graceful degradation
- Job failure recovery
- Isolated failures between sources

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
- Real-time job progress
- Success/failure metrics
- Resource usage tracking
- Error categorization

## Related Features
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Source Management](./05-source-management.md)
- [Content Management](./06-content-management.md)
- [API System](./08-api-system.md) 
```

### 04-scraper-dashboard.md
```markdown
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
   - Total articles scraped
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
- Tooltip components for additional context
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
- **GET /api/scraper/metrics**: Dashboard metrics
- **GET /api/scraper/jobs**: Job listing
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
```markdown
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
```markdown
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
```markdown
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
```markdown
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
```markdown
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
   - `GET /api/scraper/content` - List scraped articles
   - `GET /api/scraper/sources` - Manage sources
   - `GET /api/scraper/monitoring` - System health

### Scraper Service Endpoints

1. **Job Management**
   - `POST /api/scraper/trigger` - Start new job
   - `GET /api/scraper/jobs` - List jobs with enum status values
   - `GET /api/scraper/jobs/:id` - Job details
   - `GET /api/scraper/jobs/:id/logs` - Job logs (properly returns data)
   - `POST /api/scraper/jobs/:id/cancel` - Cancel job

2. **Content Management**
   - `GET /api/scraper/content` - Browse articles
   - `GET /api/scraper/content/:id` - Article details

3. **Source Management**
   - `GET /api/scraper/sources` - List sources
   - `POST /api/scraper/sources` - Create source
   - `PUT /api/scraper/sources/:id` - Update source
   - `DELETE /api/scraper/sources/:id` - Delete source
   - `POST /api/scraper/sources/:id/test` - Test RSS feed validity

4. **Monitoring**
   - `GET /health` - Service health check
   - `GET /api/scraper/metrics` - Performance metrics

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
- [Content Scraping System](./03-content-scraping.md)
- [News Feed](./01-news-feed.md)
- [Scraper Dashboard](./04-scraper-dashboard.md) 
```

### 09-dark-mode.md
```markdown
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
```markdown
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
<summary>📋 Architecture & Framework</summary>

### software-architecture.md
```markdown
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

### development-principles.md
```markdown
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

### agentic-principles.md
```markdown
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
- For requirements refinement: `export-consultation-context.js`
- For implementation planning: `export-planning-context.js`
- Never include full project dumps in responses
```

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