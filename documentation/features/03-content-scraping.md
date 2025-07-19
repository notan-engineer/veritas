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
   - Creates job with initial "pending" status
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

### API Endpoints
- **POST /api/scraper/trigger**: Start new scraping job
- **GET /api/scraper/jobs**: List jobs with pagination
- **GET /api/scraper/jobs/:id**: Get specific job details
- **GET /api/scraper/jobs/:id/logs**: Get job logs
- **POST /api/scraper/jobs/:id/cancel**: Cancel running job
- **GET /api/scraper/content**: Browse scraped articles
- **GET /api/scraper/metrics**: Dashboard metrics
- **GET /health**: Service health check

### Error Handling
- Exponential backoff for failed requests
- Comprehensive error logging
- Graceful degradation
- Job failure recovery

### Performance Optimizations
- Concurrent crawling (max 3)
- Request timeout limits (30s)
- Memory usage monitoring
- Resource cleanup

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