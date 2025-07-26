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
  articlesScraped: number;
  averageJobDuration: number;
  activeJobs: number;
  recentErrors: number;
} 