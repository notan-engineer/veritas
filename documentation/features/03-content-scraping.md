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
   - **Job linking**: Each scraped content record is linked to its originating scraping job via `job_id`
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
- Comprehensive structured error logging with JSONB data
- Graceful degradation with detailed monitoring
- Job failure recovery with correlation tracking
- Isolated failures between sources
- Error categorization and pattern analysis
- Performance impact tracking for failed requests

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

## Related Features
- [Enhanced Logging System](./11-enhanced-logging.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Source Management](./05-source-management.md)
- [Content Management](./06-content-management.md)
- [API System](./08-api-system.md) 