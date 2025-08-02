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
  progress?: number;      // derived from logs
  currentSource?: string; // derived from latest log
  sourceArticleCounts?: Record<string, number>; // source name -> count
}

export type JobStatus = ScrapingJob['status'];

export interface JobLog {
  id: string;
  jobId: string;
  sourceId?: string;
  sourceName?: string;
  timestamp: string;
  logLevel: 'info' | 'warning' | 'error';
  message: string;
  additionalData?: Record<string, any>;
}

// Content types
export interface ScrapedArticle {
  id: string;
  title: string;
  content?: string;  // Make optional
  author?: string;
  sourceUrl: string;
  sourceName: string;
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  contentHash: string;
  fullHtml?: string;
  createdAt: string;
  processedAt?: string;
}

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

export interface DashboardMetrics {
  jobsTriggered: number;
  successRate: number;
  articlesScraped: number;
  averageJobDuration: number;
  activeJobs: number;
  recentErrors: number;
} 