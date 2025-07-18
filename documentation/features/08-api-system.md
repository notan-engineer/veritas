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
   - `GET /api/scraper/jobs` - List jobs (paginated)
   - `GET /api/scraper/jobs/:id` - Job details
   - `POST /api/scraper/jobs/:id/cancel` - Cancel job

2. **Content Management**
   - `GET /api/scraper/content` - Browse articles
   - `GET /api/scraper/content/:id` - Article details

3. **Source Management**
   - `GET /api/scraper/sources` - List sources
   - `POST /api/scraper/sources` - Create source
   - `PUT /api/scraper/sources/:id` - Update source
   - `DELETE /api/scraper/sources/:id` - Delete source

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