# Simple Working Scraper - Veritas Project

**Creation Date**: 17-07-25  
**Last Updated**: 17-07-25  
**Implementation Status**: 🚧 In Progress (Testing Phase)  
**Project**: Drastically simplified scraper that actually works with full UI

## Project Overview

This is a complete rewrite/simplification of the Veritas scraper system. The current complex implementation with 8+ interdependent modules and 2,000+ lines of code **doesn't work**. This project maintains Crawlee as the foundation but uses it minimally, focusing only on essential features that enable basic functionality.

**Goal**: Click button → scrape content → see results in full UI with all existing features

### Why This Project is Needed

The current "Advanced Scraper Enhancement System" is a failure because:
- **Over-engineered**: 8 specialized modules with complex interdependencies
- **Event-driven complexity**: Complex EventEmitters, job queues, retry mechanisms
- **Broken functionality**: Despite 2,000+ lines, basic scraping doesn't work
- **Maintenance nightmare**: Too complex to debug or modify

### Core Requirements

1. **Full UI recreation with complete existing functionality**
2. **Trigger scraping jobs that actually scrape content**
3. **Save logs comprehensively to database** 
4. **Keep existing Railway services and database schema**
5. **Use Crawlee minimally for core scraping infrastructure**
6. **Simple, understandable, working code**

## Technical Architecture

### Database Schema (Keep Existing)
```sql
-- These tables work fine, keep them:
scraping_jobs      -- Track job execution
scraping_logs      -- Detailed logging per job (separate table with additional_data JSONB)
scraped_content    -- Store scraped articles  
sources            -- News sources with RSS URLs
```

### Minimal Crawlee-Based Scraper Service
```
services/scraper/src/
├── minimal-scraper.ts    # Crawlee CheerioCrawler for article content
├── database.ts          # Database operations with transactions
├── api-server.ts        # Express API endpoints
├── types.ts             # TypeScript interfaces
├── utils.ts             # Language detection, content extraction
└── package.json         # Dependencies including Crawlee
```

### Full UI Structure (Complete Recreation)
```
services/ui/app/scraper/
├── page.tsx                           # Main 3-tab interface
├── content/[id]/page.tsx             # Individual article viewer
└── components/
    ├── job-trigger.tsx               # Global job trigger dropdown
    ├── dashboard-tab.tsx             # Dashboard with metrics + job table
    ├── content-tab.tsx               # Content feed with filters
    ├── sources-tab.tsx               # Source management CRUD
    └── shared/
        ├── metrics-cards.tsx         # 4 metric cards grid
        ├── job-history-table.tsx     # Expandable job logs table
        ├── article-cards.tsx         # Article display cards
        ├── source-form.tsx           # Add/edit source modal
        └── filter-controls.tsx       # Search and filter bar
```

## Implementation Plan

### Phase 1: Minimal Crawlee Scraper Service
**Goal**: Get basic scraping working with Crawlee  
**Dependencies**: None  

#### Step 1.1: Clean Slate
- **Backup current scraper service** to `/services/scraper-backup/`
- **Delete complex implementation** (8 modules, 2000+ lines)
- **Create fresh scraper service** with minimal Crawlee usage

#### Step 1.2: Crawlee Integration (Minimal Usage)

**Actively Used Crawlee Features:**
```typescript
import { CheerioCrawler, Configuration } from 'crawlee';
import Parser from 'rss-parser';

// Configure Crawlee for minimal usage
Configuration.set({
  persistStateIntervalSecs: 0,  // Disable state persistence
  systemInfoIntervalSecs: 0,    // Disable system monitoring
});

// Store active crawlers for cancellation
const activeCrawlers = new Map<string, CheerioCrawler>();

class MinimalRSSScraper {
  private rssParser: Parser;
  
  constructor() {
    this.rssParser = new Parser();
  }
  
  async scrapeJob(jobId: string, sources: string[], articlesPerSource: number) {
    // Create crawler for this job
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: 100,
      maxConcurrency: 3,
      requestHandlerTimeoutSecs: 30,
      
      requestHandler: async ({ request, $ }) => {
        const { jobId, sourceId, sourceName } = request.userData;
        
        try {
          // Extract article content using robust strategies
          const article = extractArticleContent($, request.url);
          
          // Detect language
          const language = detectLanguage(article.content);
          
          // Save article
          await this.saveArticle({
            ...article,
            sourceUrl: request.url,
            sourceName,
            language,
            contentHash: generateContentHash(article.title, article.content),
          });
          
          // Log success
          await logJobActivity({
            jobId,
            sourceId,
            level: 'info',
            message: 'Article processed successfully',
            additionalData: {
              url: request.url,
              title: article.title,
              language,
              content_length: article.content.length
            }
          });
        } catch (error) {
          await logJobActivity({
            jobId,
            sourceId,
            level: 'error',
            message: `Failed to extract content from ${request.url}`,
            additionalData: {
              error_type: error.constructor.name,
              error_message: error.message,
              error_stack: error.stack
            }
          });
        }
      },
      
      failedRequestHandler: async ({ request, error }) => {
        const { jobId, sourceId } = request.userData;
        await logJobActivity({
          jobId,
          sourceId,
          level: 'error',
          message: `Failed to process ${request.url}`,
          additionalData: {
            error_type: error.constructor.name,
            error_message: error.message,
            status_code: error.statusCode,
            will_retry: request.retryCount < 3,
            retry_count: request.retryCount
          }
        });
      }
    });
    
    // Store for cancellation
    activeCrawlers.set(jobId, crawler);
    
    try {
      // Process each source
      for (const sourceName of sources) {
        const source = await this.getSourceByName(sourceName);
        
        // Update progress
        await this.updateJobProgress(jobId, { currentSource: source.name });
        
        // Fetch and parse RSS feed (outside Crawlee)
        try {
          const rssResponse = await fetch(source.rssUrl, {
            headers: { 'User-Agent': source.userAgent || 'Veritas/1.0' }
          });
          const rssText = await rssResponse.text();
          const feed = await this.rssParser.parseString(rssText);
          
          // Log RSS success
          await logJobActivity({
            jobId,
            sourceId: source.id,
            level: 'info',
            message: 'RSS feed parsed successfully',
            additionalData: {
              feed_title: feed.title,
              total_items: feed.items.length,
              items_to_process: Math.min(feed.items.length, articlesPerSource)
            }
          });
          
          // Queue article URLs
          const articleRequests = feed.items
            .slice(0, articlesPerSource)
            .map(item => ({
              url: item.link,
              userData: {
                jobId,
                sourceId: source.id,
                sourceName: source.name,
                articleTitle: item.title
              }
            }));
          
          await crawler.addRequests(articleRequests);
        } catch (error) {
          await logJobActivity({
            jobId,
            sourceId: source.id,
            level: 'error',
            message: `Failed to fetch RSS feed: ${source.rssUrl}`,
            additionalData: {
              error_type: error.constructor.name,
              error_message: error.message
            }
          });
        }
      }
      
      // Run crawler
      await crawler.run();
    } finally {
      // Cleanup
      activeCrawlers.delete(jobId);
    }
  }
  
  async cancelJob(jobId: string): Promise<void> {
    const crawler = activeCrawlers.get(jobId);
    if (crawler) {
      await crawler.teardown();
      activeCrawlers.delete(jobId);
    }
  }
}
```

**Available but Unused Crawlee Features:**
- PlaywrightCrawler / PuppeteerCrawler (browser automation)
- Dataset API for data persistence
- Proxy rotation and session pools
- Advanced routing (RouterHandler)
- Request transformations
- Webhook integrations
- State persistence between runs
- System monitoring and autoscaling

#### Step 1.3: Database Integration with Transactions
```typescript
// Database operations with proper transaction handling
interface DatabaseOperations {
  createJobWithInitialLog(sources: string[], articlesPerSource: number): Promise<string>;
  updateJobStatus(jobId: string, status: JobStatus): Promise<void>;
  saveArticle(article: ScrapedArticle): Promise<void>;
  logJobActivity(params: LogJobActivityParams): Promise<void>;
  getJob(jobId: string): Promise<ScrapingJob>;
  getJobs(limit: number, offset: number): Promise<PaginatedResponse<ScrapingJob>>;
  getArticles(filters: ArticleFilters): Promise<PaginatedResponse<ScrapedArticle>>;
  getSources(): Promise<NewsSource[]>;
  createSource(source: Omit<NewsSource, 'id'>): Promise<NewsSource>;
  updateSource(id: string, updates: Partial<NewsSource>): Promise<void>;
  deleteSource(id: string): Promise<void>;
  recoverStuckJobs(): Promise<void>;
}

// Logging helper with correct schema
interface LogJobActivityParams {
  jobId: string;
  sourceId?: string | null;
  level: 'info' | 'warning' | 'error';
  message: string;
  additionalData?: Record<string, any>;
}

async function logJobActivity({
  jobId,
  sourceId,
  level,
  message,
  additionalData = {}
}: LogJobActivityParams): Promise<void> {
  // For development debugging, add debug flag
  if (process.env.NODE_ENV === 'development') {
    additionalData.debug = true;
    additionalData.timestamp_ms = Date.now();
    additionalData.memory_usage_mb = process.memoryUsage().heapUsed / 1024 / 1024;
  }
  
  await db.query(`
    INSERT INTO scraping_logs (
      job_id, source_id, log_level, message, additional_data
    ) VALUES ($1, $2, $3, $4, $5)
  `, [jobId, sourceId, level, message, JSON.stringify(additionalData)]);
}

// Transaction-safe job creation
async function createJobWithInitialLog(
  sources: string[], 
  articlesPerSource: number
): Promise<string> {
  const client = await pool.connect();
  const jobId = crypto.randomUUID();
  
  try {
    await client.query('BEGIN');
    
    // Create job
    await client.query(`
      INSERT INTO scraping_jobs (
        id, status, sources_requested, articles_per_source,
        triggered_at, total_articles_scraped, total_errors
      ) VALUES ($1, 'pending', $2, $3, NOW(), 0, 0)
    `, [jobId, sources, articlesPerSource]);
    
    // Create initial log
    await client.query(`
      INSERT INTO scraping_logs (
        job_id, log_level, message, additional_data
      ) VALUES ($1, 'info', 'Job created', $2)
    `, [jobId, JSON.stringify({ 
      sources, 
      articles_per_source: articlesPerSource,
      triggered_by: 'user'
    })]);
    
    await client.query('COMMIT');
    return jobId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Error recovery on startup
async function recoverStuckJobs() {
  const result = await db.query(`
    UPDATE scraping_jobs 
    SET status = 'failed',
        completed_at = NOW()
    WHERE status IN ('running', 'pending')
      AND triggered_at < NOW() - INTERVAL '1 hour'
    RETURNING id
  `);
  
  // Log recovery for each job
  for (const job of result.rows) {
    await logJobActivity({
      jobId: job.id,
      level: 'error',
      message: 'Job marked as failed due to scraper restart',
      additionalData: { recovery_reason: 'stuck_job', recovered_at: new Date().toISOString() }
    });
  }
}
```

#### Step 1.4: Complete API Endpoints

**Job Management Endpoints:**
```typescript
// POST /api/scrape - Trigger new scraping job
interface TriggerScrapingRequest {
  sources: string[];      // Source names from database
  maxArticles: number;    // Articles per source
}

interface TriggerScrapingResponse {
  jobId: string;
  status: 'started';
  message: string;
}

// GET /api/jobs - List jobs with pagination
interface GetJobsRequest {
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20
  status?: JobStatus;     // Filter by status
}

// All list endpoints use PaginatedResponse
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// GET /api/jobs/:id - Get specific job
interface GetJobResponse {
  job: ScrapingJob;
}

// GET /api/jobs/:id/logs - Get job logs with pagination
interface GetJobLogsRequest {
  page?: number;
  pageSize?: number;
}

// DELETE /api/jobs/:id - Cancel running job
interface CancelJobResponse {
  success: boolean;
  message: string;
}

// Error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorResponse: ErrorResponse = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(errorResponse.statusCode).json(errorResponse);
};
```

**Content Management Endpoints:**
```typescript
// GET /api/content - List scraped articles
interface GetContentRequest {
  page?: number;
  pageSize?: number;
  search?: string;          // Text search
  source?: string;          // Filter by source
  language?: string;        // Filter by language  
  status?: ProcessingStatus; // Filter by status
}

// GET /api/content/:id - Get specific article
interface GetArticleResponse {
  article: ScrapedArticle;
}
```

**Source Management Endpoints:**
```typescript
// GET /api/sources - List all sources
interface GetSourcesResponse {
  sources: NewsSource[];
}

// POST /api/sources - Create new source with validation
app.post('/api/sources', async (req, res, next) => {
  try {
    const { rssUrl, ...sourceData } = req.body;
    
    // Validate RSS feed before saving
    const validation = await validateRSSFeed(rssUrl);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'InvalidRSSFeed',
        message: validation.error,
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    const newSource = await db.createSource({ ...sourceData, rssUrl });
    res.json(newSource);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sources/:id/test - Test RSS feed
async function validateRSSFeed(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Veritas/1.0' }
    });
    
    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}` };
    }
    
    const text = await response.text();
    const parser = new Parser();
    await parser.parseString(text);
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

**Metrics Endpoints with Caching:**
```typescript
// GET /api/metrics - Dashboard metrics with caching
let metricsCache: { data: DashboardMetrics | null; timestamp: number } = { 
  data: null, 
  timestamp: 0 
};
const CACHE_TTL = 60000; // 1 minute

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (metricsCache.data && Date.now() - metricsCache.timestamp < CACHE_TTL) {
    return metricsCache.data;
  }
  
  const result = await db.query(`
    SELECT 
      COUNT(DISTINCT id) as jobs_triggered,
      AVG(CASE WHEN status = 'completed' THEN 100 ELSE 0 END) as success_rate,
      SUM(total_articles_scraped) as articles_scraped,
      AVG(EXTRACT(EPOCH FROM (completed_at - triggered_at))) as avg_duration,
      COUNT(CASE WHEN status = 'running' THEN 1 END) as active_jobs,
      COUNT(CASE WHEN status = 'failed' AND triggered_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_errors
    FROM scraping_jobs
    WHERE triggered_at > NOW() - INTERVAL '7 days'
  `);
  
  const metrics = {
    jobsTriggered: parseInt(result.rows[0].jobs_triggered) || 0,
    successRate: Math.round(parseFloat(result.rows[0].success_rate) || 0),
    articlesScraped: parseInt(result.rows[0].articles_scraped) || 0,
    averageJobDuration: Math.round(parseFloat(result.rows[0].avg_duration) || 0),
    activeJobs: parseInt(result.rows[0].active_jobs) || 0,
    recentErrors: parseInt(result.rows[0].recent_errors) || 0
  };
  
  metricsCache = { data: metrics, timestamp: Date.now() };
  return metrics;
}
```

### Phase 2: Full UI Recreation
**Goal**: Recreate complete 3-tab interface with all existing functionality  
**Dependencies**: Phase 1 API endpoints must be complete

#### Step 2.1: Main Interface Structure
```typescript
// Main page with 3-tab navigation
interface ScraperPageProps {
  searchParams: { tab?: 'dashboard' | 'content' | 'sources' };
}

// Tab navigation with icons and active state
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'sources', label: 'Sources', icon: Database }
];

// Global job trigger (always visible)
interface JobTriggerProps {
  sources: NewsSource[];
  onJobStart: (jobId: string) => void;
}
```

#### Step 2.2: Dashboard Tab Components

**Metrics Cards Grid:**
```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

// 4 cards: Jobs Triggered, Success Rate, Articles Scraped, Avg Duration
const metricsCards = [
  { title: 'Jobs Triggered', value: metrics.jobsTriggered, icon: Play },
  { title: 'Success Rate', value: `${metrics.successRate}%`, icon: CheckCircle },
  { title: 'Articles Scraped', value: metrics.articlesScraped, icon: FileText },
  { title: 'Avg Duration', value: formatDuration(metrics.averageJobDuration), icon: Clock }
];
```

**Job History Table:**
```typescript
interface JobTableProps {
  jobs: ScrapingJob[];
  onRefresh: () => void;
  onViewLogs: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

// Expandable rows with inline logs
interface JobRowProps {
  job: ScrapingJob;
  expanded: boolean;
  logs?: JobLog[];
}

// Efficient log querying
async function getJobLogs(jobId: string, page = 1, pageSize = 100): Promise<PaginatedResponse<JobLog>> {
  const offset = (page - 1) * pageSize;
  
  const [logs, count] = await Promise.all([
    db.query(`
      SELECT 
        sl.id,
        sl.source_id,
        sl.log_level,
        sl.message,
        sl.timestamp,
        sl.additional_data,
        s.name as source_name
      FROM scraping_logs sl
      LEFT JOIN sources s ON sl.source_id = s.id
      WHERE sl.job_id = $1
      ORDER BY sl.timestamp DESC
      LIMIT $2 OFFSET $3
    `, [jobId, pageSize, offset]),
    
    db.query(`
      SELECT COUNT(*) as total 
      FROM scraping_logs 
      WHERE job_id = $1
    `, [jobId])
  ]);
  
  return {
    data: logs.rows,
    total: parseInt(count.rows[0].total),
    page,
    pageSize,
    hasMore: offset + pageSize < parseInt(count.rows[0].total)
  };
}
```

#### Step 2.3: Content Tab Components

**Filter Controls:**
```typescript
interface FilterControlsProps {
  onSearch: (query: string) => void;
  onSourceFilter: (source: string | null) => void;
  onLanguageFilter: (language: string | null) => void;
  onStatusFilter: (status: ProcessingStatus | null) => void;
  sources: NewsSource[];
}
```

**Article Cards:**
```typescript
interface ArticleCardProps {
  article: ScrapedArticle;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewFull: () => void;
}

// Card displays: title, source, date, preview
// Expanded: full content, metadata, actions
```

#### Step 2.4: Sources Tab Components

**Sources Table:**
```typescript
interface SourcesTableProps {
  sources: NewsSource[];
  onEdit: (source: NewsSource) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onTest: (id: string) => void;
}
```

**Source Form Modal:**
```typescript
interface SourceFormProps {
  source?: NewsSource;  // Edit mode if provided
  onSubmit: (data: SourceFormData) => void;
  onCancel: () => void;
}

// Form validation
const sourceSchema = z.object({
  name: z.string().min(1, 'Name required'),
  domain: z.string().url('Valid URL required'),
  rssUrl: z.string().url('Valid RSS URL required'),
  delayBetweenRequests: z.number().min(1000).max(30000),
  timeoutMs: z.number().min(5000).max(60000),
});
```

### Phase 3: Integration & Testing
**Goal**: End-to-end working system with all features integrated  
**Dependencies**: Phase 1 and Phase 2 must be complete

#### Step 3.1: UI-Backend Integration Patterns

**API Client Setup:**
```typescript
// Centralized API client with error handling
class ScraperAPIClient {
  private baseUrl = '/api/scraper';
  
  async triggerJob(sources: string[], maxArticles: number): Promise<string> {
    const response = await fetch(`${this.baseUrl}/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources, maxArticles })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to trigger job');
    }
    
    const data = await response.json();
    return data.jobId;
  }
  
  // Similar methods for all endpoints...
}
```

**Polling Implementation:**
```typescript
// Dashboard polling for metrics and jobs
useEffect(() => {
  const pollInterval = setInterval(async () => {
    await Promise.all([
      fetchMetrics(),
      fetchRecentJobs()
    ]);
  }, 30000); // 30 second intervals
  
  return () => clearInterval(pollInterval);
}, []);

// Job progress monitoring with state tracking
interface ProgressState {
  totalSources: number;
  processedSources: number;
  currentSource?: string;
  articlesPerSource: number;
  totalArticlesExpected: number;
  articlesProcessed: number;
  articlesErrored: number;
}

async function updateJobProgress(jobId: string, state: ProgressState) {
  const progress = Math.round(
    (state.processedSources / state.totalSources * 30) + // 30% for sources
    (state.articlesProcessed / state.totalArticlesExpected * 70) // 70% for articles
  );
  
  await db.query(`
    UPDATE scraping_jobs 
    SET 
      progress = $2,
      current_source = $3,
      total_articles_scraped = $4,
      total_errors = $5,
      updated_at = NOW()
    WHERE id = $1
  `, [jobId, progress, state.currentSource, state.articlesProcessed, state.articlesErrored]);
  
  // Log progress milestone
  if (progress % 25 === 0) { // Log at 25%, 50%, 75%, 100%
    await logJobActivity({
      jobId,
      level: 'info',
      message: `Job progress: ${progress}%`,
      additionalData: state
    });
  }
}
```

#### Step 3.2: Utility Functions

**Content Extraction:**
```typescript
function extractArticleContent($: CheerioAPI, url: string): ArticleContent {
  const strategies = [
    // 1. Structured data (JSON-LD)
    () => {
      const scripts = $('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse($(script).text());
          if (data['@type'] === 'NewsArticle' || data['@type'] === 'Article') {
            return {
              title: data.headline,
              content: data.articleBody,
              author: data.author?.name,
              date: data.datePublished
            };
          }
        } catch (e) {
          // Continue to next script
        }
      }
    },
    
    // 2. Common article selectors
    () => ({
      title: $('h1').first().text() || $('meta[property="og:title"]').attr('content'),
      content: $('article').text() || $('.article-content').text() || $('.story-body').text(),
      author: $('.author').text() || $('meta[name="author"]').attr('content'),
      date: $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content')
    }),
    
    // 3. Fallback to meta tags
    () => ({
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      content: $('meta[property="og:description"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content'),
      date: $('meta[property="article:published_time"]').attr('content')
    })
  ];
  
  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result?.content && result.content.length > 100) {
        return result;
      }
    } catch (e) {
      // Try next strategy
    }
  }
  
  // Last resort - get raw text
  return {
    title: $('title').text(),
    content: $('body').text().substring(0, 5000),
    author: null,
    date: null
  };
}

// Language detection
function detectLanguage(text: string): string {
  // Check for RTL characters
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/;
  if (rtlRegex.test(text)) {
    // Further distinguish Hebrew vs Arabic
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text) ? 'he' : 'ar';
  }
  
  // Default to English
  return 'en';
}

// Content hashing for duplicate detection
function generateContentHash(title: string, content: string): string {
  const combined = `${title}:${content.substring(0, 1000)}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}
```

#### Step 3.3: Testing Specifications

**End-to-End Test Scenarios:**
```typescript
// Test: Complete scraping workflow
describe('Scraping Workflow', () => {
  test('Dashboard → Trigger → Content appears', async () => {
    // 1. Navigate to dashboard
    // 2. Click job trigger
    // 3. Select BBC News
    // 4. Set 5 articles limit
    // 5. Click "Start Scraping"
    // 6. Verify job appears in table
    // 7. Wait for completion
    // 8. Navigate to Content tab
    // 9. Verify 5 BBC articles appear
  });
});

// Test: Source management
describe('Source Management', () => {
  test('Add source → Available in trigger', async () => {
    // 1. Navigate to Sources tab
    // 2. Click "Add Source"
    // 3. Fill form with test RSS feed
    // 4. Submit and verify success
    // 5. Navigate to Dashboard
    // 6. Open job trigger
    // 7. Verify new source appears
  });
});

// Test: Error handling
describe('Error Scenarios', () => {
  test('Invalid RSS URL shows error', async () => {
    // 1. Add source with invalid RSS
    // 2. Click "Test Feed"
    // 3. Verify error message
  });
  
  test('Job failure updates UI', async () => {
    // 1. Trigger job with failing source
    // 2. Verify status shows "failed"
    // 3. Expand logs
    // 4. Verify error details visible
  });
  
  test('Job cancellation works', async () => {
    // 1. Trigger long-running job
    // 2. Click cancel button
    // 3. Verify job stops and status updates
    // 4. Check logs for cancellation entry
  });
});
```

## Technical Specifications

### Core Type Definitions
```typescript
// Job types
interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  sourcesRequested: string[];
  articlesPerSource: number;
  totalArticlesScraped: number;
  totalErrors: number;
  triggeredAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;      // seconds
  progress?: number;      // 0-100
  currentSource?: string; // Currently processing
}

interface JobLog {
  id: string;
  jobId: string;
  sourceId?: string;
  sourceName?: string;
  timestamp: string;
  log_level: 'info' | 'warning' | 'error'; // Note: matches DB column name
  message: string;
  additional_data?: Record<string, any>; // From JSONB
}

// Content types
interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl: string;
  sourceName: string;
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  contentHash: string;     // For duplicate detection
  fullHtml?: string;       // Original HTML
  createdAt: string;
  processedAt?: string;
}

// Source types
interface NewsSource {
  id: string;
  name: string;
  domain: string;
  rssUrl: string;
  description?: string;
  isActive: boolean;       // In database
  isEnabled: boolean;      // User toggle
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;  // milliseconds
  userAgent: string;
  timeoutMs: number;
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Calculated metrics (not health)
  totalArticles?: number;
  lastJobStatus?: JobStatus;
  successfulJobs?: number;
  failedJobs?: number;
}

// API types
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: any;
}
```

### SQL Queries & Database Operations
```sql
-- Create scraping job with initial state
INSERT INTO scraping_jobs (
  id, status, sources_requested, articles_per_source, 
  triggered_at, total_articles_scraped, total_errors
) VALUES ($1, 'pending', $2, $3, NOW(), 0, 0) 
RETURNING *;

-- Update job progress with current state
UPDATE scraping_jobs 
SET 
  status = $2,
  progress = $3,
  current_source = $4,
  total_articles_scraped = $5,
  total_errors = $6,
  started_at = CASE WHEN started_at IS NULL AND $2 = 'running' THEN NOW() ELSE started_at END,
  completed_at = CASE WHEN $2 IN ('completed', 'failed', 'cancelled') THEN NOW() ELSE NULL END,
  updated_at = NOW()
WHERE id = $1;

-- Save article with duplicate check
INSERT INTO scraped_content (
  title, content, source_url, source_name, 
  content_hash, language, processing_status, created_at
) VALUES ($1, $2, $3, $4, $5, $6, 'completed', NOW())
ON CONFLICT (content_hash) DO NOTHING
RETURNING id;

-- Log job activity with correct column names
INSERT INTO scraping_logs (
  job_id, source_id, log_level, message, additional_data
) VALUES ($1, $2, $3, $4, $5);

-- Get dashboard metrics with performance optimization
SELECT 
  COUNT(DISTINCT id) as jobs_triggered,
  AVG(CASE WHEN status = 'completed' THEN 100 ELSE 0 END) as success_rate,
  SUM(total_articles_scraped) as articles_scraped,
  AVG(EXTRACT(EPOCH FROM (completed_at - triggered_at))) as avg_duration
FROM scraping_jobs
WHERE triggered_at > NOW() - INTERVAL '7 days';

-- Create partial index for performance
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_recent 
ON scraping_jobs(triggered_at) 
WHERE triggered_at > NOW() - INTERVAL '7 days';
```

## Success Criteria

### Phase 1 Success (Scraper Service)
- ✅ `POST /api/scrape` triggers Crawlee-based scraping
- ✅ RSS feeds parsed correctly (fetched separately from Crawlee)
- ✅ Articles extracted with robust content extraction
- ✅ Job tracking with transaction safety
- ✅ Comprehensive logs in `scraping_logs` with correct schema
- ✅ All API endpoints return data in standardized format
- ✅ Job cancellation works properly
- ✅ Error recovery on startup

### Phase 2 Success (Full UI)
**Dashboard Tab:**
- ✅ Metrics cards show cached real-time data
- ✅ Job history table with paginated logs
- ✅ Job trigger with source validation
- ✅ Progress tracking with granular updates
- ✅ Cancel button for running jobs

**Content Tab:**
- ✅ Article feed with language detection
- ✅ Search and filters work correctly
- ✅ Pagination prevents performance issues
- ✅ Individual article viewer works

**Sources Tab:**
- ✅ CRUD operations with transactions
- ✅ RSS validation before saving
- ✅ Test feed functionality
- ✅ Form validation works

### Phase 3 Success (Integration)
**End-to-End Workflows:**
- ✅ Complete scraping workflow works
- ✅ Error handling shows user-friendly messages
- ✅ Progress updates in real-time
- ✅ Logs provide debugging information

**Performance:**
- ✅ Dashboard metrics cached appropriately
- ✅ Large jobs don't freeze UI
- ✅ Database queries optimized with indexes
- ✅ Memory usage stays reasonable

### Overall Success
- ✅ **Simple codebase**: Clean separation of concerns
- ✅ **Full functionality**: All UI features working
- ✅ **Minimal Crawlee usage**: Only for article scraping
- ✅ **Comprehensive logging**: Every operation logged
- ✅ **Error resilience**: Handles all failure modes
- ✅ **Production ready**: Scales to reasonable load

## What We're NOT Building

### Complex Features (Removed)
- ❌ Event-driven architecture with EventEmitters
- ❌ Complex job queuing beyond Crawlee's basic queue
- ❌ Advanced error categorization and recovery
- ❌ Resource monitoring and optimization
- ❌ Cleanup managers and retention policies
- ❌ Source health monitoring (removed from UI)
- ❌ Content classification systems

### Unused Crawlee Features
- ❌ PlaywrightCrawler / PuppeteerCrawler
- ❌ Dataset persistence
- ❌ Proxy rotation
- ❌ Session pools
- ❌ Advanced routing
- ❌ Webhook integrations
- ❌ State persistence between runs

## Risk Mitigation

### Technical Risks & Solutions
1. **RSS parsing outside Crawlee**: Separate fetch ensures proper RSS handling
2. **Job cancellation**: Active crawler map enables proper teardown
3. **Database failures**: Transactions ensure data consistency
4. **Memory issues**: Limited concurrent requests and monitoring
5. **Stuck jobs**: Recovery mechanism on startup
6. **Poor content extraction**: Multiple strategies with fallbacks

### Implementation Strategy
- **Start with single source**: Get BBC News working end-to-end
- **Add features incrementally**: One endpoint at a time
- **Test continuously**: Verify each component before moving on
- **Monitor logs**: Use comprehensive logging for debugging

---

## Plan Status

### Implementation Progress
- ✅ **Phase 1**: Minimal Crawlee Scraper Service (Prerequisites: None)
  - ✅ Step 1.1: Clean slate - Removed complex implementation
  - ✅ Step 1.2: Created minimal Crawlee integration 
  - ✅ Step 1.3: Implemented database operations with transactions
  - ✅ Step 1.4: Created all API endpoints
  - ✅ TypeScript types updated to match actual database schema
  - ✅ simple-api.js created for immediate testing
- ✅ **Phase 2**: Full UI Recreation (Prerequisites: Complete Phase 1)
  - ✅ Created 3-tab interface with Dashboard, Content, and Sources tabs
  - ✅ Job trigger dropdown with source selection
  - ✅ Dashboard with metrics cards and job history table  
  - ✅ Content tab with filtering and pagination
  - ✅ Sources tab with CRUD operations
  - ✅ All UI components build successfully
- 🚧 **Phase 3**: Integration & Testing (Prerequisites: Complete Phase 1 & 2)
  - ✅ Database schema mismatches identified and corrected
  - ✅ All TypeScript types updated to match actual database
  - ✅ API endpoints properly configured for both UI and scraper
  - 📝 **Testing Status**:
    - ✅ UI Server running successfully on port 3000
    - ✅ Simple API server running on port 3001
    - 🚧 **Need to test**: Actual scraping functionality with BBC News
    - 🚧 **Need to test**: End-to-end workflow (Trigger → Scrape → View results)
    - 🚧 **Need to test**: Error handling and job cancellation
    - 🚧 **Need to verify**: Logs properly saved to database

### Key Technical Decisions
- **RSS Handling**: Fetch RSS separately, use Crawlee only for article content
- **Logging**: Use existing `scraping_logs` table with correct column names
- **Error Handling**: Comprehensive logging with structured additional_data
- **Performance**: Caching for metrics, pagination for large datasets
- **Cancellation**: Active crawler tracking for proper cleanup
- **UI Architecture**: Full 3-tab interface with real-time updates
- **API Proxy**: Next.js API routes proxy to scraper service for CORS handling
- **Component Library**: shadcn/ui for consistent, accessible UI components

### Next Actions (Testing Phase)
1. **Test Basic Scraping**:
   - Navigate to http://localhost:3000/scraper
   - Click job trigger dropdown
   - Select BBC News
   - Set 3-5 articles limit
   - Click "Start Scraping"
   - Monitor job progress in dashboard

2. **Verify Database Integration**:
   - Check if job appears in jobs table
   - Expand job to see logs
   - Navigate to Content tab
   - Verify scraped articles appear

3. **Test Error Scenarios**:
   - Try invalid source
   - Test job cancellation
   - Verify error handling

**Success Metrics**:
- ✅ Job completes with "completed" status
- ✅ Logs show RSS parsing and article extraction
- ✅ Articles appear in Content tab
- ✅ No TypeScript compilation errors
- ✅ Database contains job records and logs

---

**Note**: This plan addresses all identified issues while maintaining simplicity. The separation of RSS fetching from Crawlee ensures proper handling of feeds, while comprehensive logging enables debugging during development and production operation. 