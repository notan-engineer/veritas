// TypeScript interfaces for Veritas scraper service

export interface RSSItem {
  title: string
  link: string
  description?: string
  pubDate?: string
  author?: string
  category?: string[]
  content?: string
}

export interface RSSFeed {
  title: string
  description?: string
  link: string
  items: RSSItem[]
}

export interface ScrapedArticle {
  sourceUrl: string
  title: string
  content: string
  author?: string
  publicationDate?: Date
  language: string
  // Enhanced fields
  category?: string
  tags?: string[]
  fullHtml?: string
  crawleeClassification?: CrawleeClassification
  contentHash?: string
}

export interface NewsSource {
  id?: string
  name: string
  domain: string
  iconUrl?: string
  rssUrl?: string
  // Flattened scraping config fields
  respectRobotsTxt?: boolean
  delayBetweenRequests?: number
  userAgent?: string
  timeoutMs?: number
  createdAt?: Date
}

export interface ScrapedContent {
  id?: string
  sourceId: string
  sourceUrl: string
  title: string
  content: string
  author?: string
  publicationDate?: Date
  contentType: 'article' | 'rss-item'
  language: string
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  // Enhanced content fields
  category?: string
  tags?: string[]
  fullHtml?: string
  crawleeClassification?: CrawleeClassification
  contentHash?: string
  createdAt?: Date
}

export interface ScrapingJob {
  id: string
  sources: string[]
  maxArticles: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  logs: ScrapingLog[]
  results: {
    articlesScraped: number
    articlesStored: number
    errors: number
  }
}

export interface ScrapingLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  source?: string
  error?: string
}

export interface ScrapingConfig {
  maxConcurrentRequests: number
  requestDelay: number
  timeout: number
  userAgent: string
  retryAttempts: number
  respectRobotsTxt: boolean
}

// Scraping configuration is now flattened into NewsSource interface
// maxArticles is now dynamic based on user input, not stored in database

export interface CrawleeClassification {
  contentType: string
  confidence: number
  metadata: Record<string, any>
  extractedAt: Date
}

// Enhanced job tracking interfaces
export interface EnhancedScrapingJob {
  id: string
  triggeredAt: Date
  completedAt?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  sourcesRequested: string[]
  articlesPerSource: number
  totalArticlesScraped: number
  totalErrors: number
  jobLogs?: string
  createdAt: Date
  updatedAt: Date
}

export interface ScrapingLogEntry {
  id: string
  jobId: string
  sourceId?: string
  logLevel: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  additionalData?: Record<string, any>
}

export interface TriggerScrapingRequest {
  sources: string[]
  maxArticles?: number
}

export interface TriggerScrapingResponse {
  success: boolean
  message: string
  jobId: string
  logs: Array<{
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    source?: string
  }>
} 