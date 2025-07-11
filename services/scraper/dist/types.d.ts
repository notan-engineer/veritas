export interface RSSItem {
    title: string;
    link: string;
    description?: string;
    pubDate?: string;
    author?: string;
    category?: string[];
    content?: string;
}
export interface RSSFeed {
    title: string;
    description?: string;
    link: string;
    items: RSSItem[];
}
export interface ScrapedArticle {
    sourceUrl: string;
    title: string;
    content: string;
    author?: string;
    publicationDate?: Date;
    language: string;
}
export interface NewsSource {
    id?: number;
    name: string;
    domain: string;
    url: string;
    description: string;
    isActive: boolean;
}
export interface ScrapedContent {
    id?: number;
    sourceId: number;
    sourceUrl: string;
    title: string;
    content: string;
    author?: string;
    publicationDate?: Date;
    contentType: 'article' | 'rss-item';
    language: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ScrapingJob {
    id: string;
    sources: string[];
    maxArticles: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    logs: ScrapingLog[];
    results: {
        articlesScraped: number;
        articlesStored: number;
        errors: number;
    };
}
export interface ScrapingLog {
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    source?: string;
    error?: string;
}
export interface ScrapingConfig {
    maxConcurrentRequests: number;
    requestDelay: number;
    timeout: number;
    userAgent: string;
    retryAttempts: number;
    respectRobotsTxt: boolean;
}
export interface TriggerScrapingRequest {
    sources: string[];
    maxArticles?: number;
}
export interface TriggerScrapingResponse {
    success: boolean;
    message: string;
    jobId: string;
    logs: ScrapingLog[];
}
