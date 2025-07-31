# Feature: Enhanced Structured Logging System

## Overview
Advanced logging system for the scraper service that uses JSONB-structured data to provide comprehensive monitoring, debugging, and performance analysis capabilities. Replaces simple text-based logging with queryable, correlated, and analytically-rich log data.

## User Story
As a system administrator and developer, I want detailed, structured logging with performance monitoring so that I can effectively debug issues, monitor system health, and optimize scraping operations through rich, queryable log data.

## Technical Implementation

### Core Components

#### 1. EnhancedLogger Class (`enhanced-logger.ts`)
- **Structured Logging**: All log entries use JSONB format with standardized event types
- **Correlation Tracking**: Links related events across HTTP requests, extractions, and processing
- **Performance Monitoring**: Automated snapshots of memory usage, CPU, and request metrics
- **Quality Scoring**: Content extraction quality assessment with detailed metrics
- **Resource Tracking**: Active request monitoring with timing and size metrics

#### 2. JSONB Database Structure
Enhanced `scraping_logs.additional_data` field with structured event data:
```typescript
interface LogData {
  event_type: 'lifecycle' | 'source' | 'http' | 'extraction' | 'performance'
  event_name: string
  correlation_id?: string
  // Event-specific structured data
}
```

#### 3. Optimized Database Indexes
- **Event Type Index**: Fast filtering by event category
- **HTTP Status Index**: Query HTTP responses by status code
- **Correlation Index**: Link related events across requests
- **GIN Index**: Complex JSONB queries and full-text search
- **Performance Index**: Optimized time-series queries for monitoring

### Event Types and Structure

#### Lifecycle Events
Track job start/completion with comprehensive metadata:
```json
{
  "event_type": "lifecycle",
  "event_name": "job_started",
  "sources": ["cnn.com", "bbc.com"],
  "articles_per_source": 5,
  "total_expected": 10,
  "trigger_method": "manual",
  "max_concurrency": 4,
  "memory_limit_mb": 512
}
```

#### Source Processing Events
Monitor individual source processing:
```json
{
  "event_type": "source",
  "event_name": "source_completed",
  "source_name": "CNN",
  "articles_scraped": 4,
  "target_articles": 5,
  "success_rate": 0.8,
  "duration_ms": 15000
}
```

#### HTTP Events
Detailed request/response monitoring with timing:
```json
{
  "event_type": "http",
  "event_name": "http_response_success",
  "correlation_id": "req-123-abc",
  "http": {
    "request_id": "uuid-456",
    "url": "https://cnn.com/article",
    "method": "GET",
    "status": 200,
    "response_ms": 1250,
    "size_bytes": 45000
  }
}
```

#### Content Extraction Events
Track extraction success with quality metrics:
```json
{
  "event_type": "extraction",
  "event_name": "extraction_completed",
  "correlation_id": "req-123-abc",
  "extraction": {
    "url": "https://cnn.com/article",
    "method": "primary",
    "quality_score": 85,
    "content_length": 2500,
    "has_title": true,
    "has_author": true,
    "has_date": true,
    "extraction_ms": 300
  }
}
```

#### Performance Monitoring Events
Automated system health snapshots:
```json
{
  "event_type": "performance",
  "event_name": "performance_snapshot",
  "perf": {
    "mem_mb": 128,
    "cpu_pct": 15,
    "active_reqs": 3,
    "queue_size": 0,
    "avg_resp_ms": 1100
  }
}
```

### Query Utilities (`log-queries.ts`)

#### Performance Analytics
```typescript
// Get job performance summary
async function getJobPerformance(jobId: string): Promise<JobPerformance>

// Get HTTP request statistics
async function getHttpStats(jobId: string): Promise<HttpStats>

// Get content quality metrics
async function getQualityMetrics(jobId: string): Promise<QualityMetrics>
```

#### Error Analysis
```typescript
// Get error patterns by type
async function getErrorsByType(jobId: string): Promise<ErrorSummary[]>

// Get failing URLs with context
async function getFailingUrls(jobId: string): Promise<FailedUrl[]>
```

#### Correlation Tracking
```typescript
// Follow request lifecycle from HTTP to extraction
async function getCorrelatedEvents(correlationId: string): Promise<LogEntry[]>

// Get all events for specific URL processing
async function getUrlProcessingChain(url: string): Promise<LogEntry[]>
```

### Testing and Validation (`test-logs.ts`)

#### Log Entry Validation
- **Schema Validation**: Ensures all log entries match required structure
- **Event Type Verification**: Validates event types and required fields
- **Correlation Integrity**: Verifies correlation IDs link related events correctly

#### Performance Testing
- **Load Testing**: Validates logging performance under high throughput
- **Query Performance**: Tests index effectiveness for common query patterns
- **Storage Efficiency**: Monitors JSONB storage overhead and compression

### Data Management (`clear-data.ts`)

#### Development Utilities
- **Selective Cleanup**: Remove logs by job, date range, or event type
- **Test Data Generation**: Create realistic log data for testing
- **Performance Benchmarking**: Generate load test scenarios

#### Production Maintenance
- **Archive Old Logs**: Move historical data to archive tables
- **Compress Log Data**: Optimize storage for long-term retention
- **Index Maintenance**: Update statistics and optimize query performance

## API Integration

### Enhanced Endpoints
All existing scraper endpoints now provide detailed logging:
- **POST /api/scraper/trigger**: Logs job lifecycle with performance tracking
- **GET /api/scraper/jobs/:id/logs**: Returns structured JSONB log data
- **GET /api/scraper/monitoring**: Includes log-based performance metrics

### Query Parameters
- `event_type`: Filter logs by event category
- `correlation_id`: Get related events across requests
- `level`: Filter by log level (info, warning, error)
- `since`: Time-based filtering for recent events

## Performance Optimizations

### Database Performance
- **Specialized Indexes**: Optimized for common query patterns
- **Partial Indexes**: Reduce index size for conditional queries
- **GIN Indexing**: Full-text search and complex JSONB queries
- **Query Optimization**: Pre-computed aggregations for dashboard metrics

### Memory Management
- **Request Batching**: Group related log entries for efficient insertion
- **Connection Pooling**: Optimized database connections for logging workload
- **Async Logging**: Non-blocking log operations to prevent scraping delays
- **Buffer Management**: Smart buffering to balance performance and data safety

### Storage Efficiency
- **JSONB Compression**: PostgreSQL native compression for structured data
- **Selective Indexing**: Index only frequently queried fields
- **Log Rotation**: Automated cleanup of old performance snapshots
- **Archive Strategy**: Long-term storage optimization

## Monitoring and Alerting

### Real-time Metrics
- **Error Rate Monitoring**: Track error patterns across sources
- **Performance Degradation**: Detect slow responses and timeouts
- **Resource Usage**: Monitor memory and CPU trends
- **Quality Decline**: Alert on content extraction quality drops

### Dashboard Integration
- **Performance Charts**: Visual representation of system metrics
- **Error Analysis**: Categorized error summaries with drill-down
- **Source Health**: Individual source performance tracking
- **Correlation Analysis**: Request flow visualization

## Migration and Compatibility

### Backward Compatibility
- **Existing APIs**: All current endpoints continue to work unchanged
- **Log Format**: New structured data supplements existing message field
- **Query Patterns**: Old text-based searches still supported alongside JSONB queries

### Migration Benefits
- **Richer Data**: More detailed information than previous text-based logs
- **Better Performance**: Optimized indexes improve query speed
- **Enhanced Debugging**: Correlation tracking provides complete request context
- **Operational Insights**: Performance monitoring enables proactive optimization

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Job Monitoring](./04b-job-monitoring.md)
- [API System](./08-api-system.md)