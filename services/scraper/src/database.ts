import { Pool } from 'pg';
import * as crypto from 'crypto';
import { 
  ScrapingJob, 
  ScrapedArticle, 
  NewsSource, 
  JobStatus, 
  PaginatedResponse,
  LogJobActivityParams,
  ArticleFilters,
  ProgressState
} from './types';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Logging helper with correct schema
export async function logJobActivity({
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
  
  await pool.query(`
    INSERT INTO scraping_logs (
      job_id, source_id, log_level, message, additional_data
    ) VALUES ($1, $2, $3, $4, $5)
  `, [jobId, sourceId, level, message, JSON.stringify(additionalData)]);
}

// Transaction-safe job creation
export async function createJobWithInitialLog(
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

// Update job status
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
  const updateFields: any = { status };
  
  // Remove started_at logic - use triggered_at as the start time
  // Job starts when created, not when status changes to 'running'
  
  if (['completed', 'failed', 'cancelled'].includes(status)) {
    updateFields.completed_at = 'NOW()';
  }
  
  const setClause = Object.entries(updateFields)
    .map(([key, value], index) => 
      value === 'NOW()' ? `${key} = NOW()` : `${key} = $${index + 2}`
    )
    .join(', ');
  
  const values = [jobId, ...Object.values(updateFields).filter(v => v !== 'NOW()')];
  
  await pool.query(`
    UPDATE scraping_jobs 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1
  `, values);
}

// Save article with duplicate check
export async function saveArticle(article: Partial<ScrapedArticle>): Promise<void> {
  const contentHash = article.contentHash || crypto.createHash('sha256')
    .update(`${article.title}:${article.content?.substring(0, 1000)}`)
    .digest('hex');
  
  await pool.query(`
    INSERT INTO scraped_content (
      title, content, source_url, source_name, 
      content_hash, language, processing_status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'completed', NOW())
    ON CONFLICT (content_hash) DO NOTHING
  `, [
    article.title,
    article.content,
    article.sourceUrl,
    article.sourceName,
    contentHash,
    article.language || 'en'
  ]);
}

// Update job progress (store in logs instead of non-existent columns)
export async function updateJobProgress(jobId: string, state: ProgressState): Promise<void> {
  const progress = Math.round(
    (state.processedSources / state.totalSources * 30) + // 30% for sources
    (state.articlesProcessed / state.totalArticlesExpected * 70) // 70% for articles
  );
  
  // Only update the fields that actually exist
  await pool.query(`
    UPDATE scraping_jobs 
    SET 
      total_articles_scraped = $2,
      total_errors = $3,
      updated_at = NOW()
    WHERE id = $1
  `, [jobId, state.articlesProcessed, state.articlesErrored]);
  
  // Log progress details including current source and percentage
  await logJobActivity({
    jobId,
    level: 'info',
    message: `Progress: ${progress}% - Processing ${state.currentSource || 'sources'}`,
    additionalData: {
      ...state,
      progress_percentage: progress,
      milestone: progress % 25 === 0 ? `${progress}%` : undefined
    }
  });
}

// Get job by ID with calculated fields
export async function getJob(jobId: string): Promise<ScrapingJob | null> {
  const jobResult = await pool.query(`
    SELECT 
      id,
      status,
      sources_requested as "sourcesRequested",
      articles_per_source as "articlesPerSource",
      total_articles_scraped as "totalArticlesScraped",
      total_errors as "totalErrors",
      triggered_at as "triggeredAt",
      completed_at as "completedAt",
      job_logs as "jobLogs",
      created_at as "createdAt",
      updated_at as "updatedAt",
      CASE 
        WHEN completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - triggered_at))
        ELSE NULL
      END as duration
    FROM scraping_jobs 
    WHERE id = $1
  `, [jobId]);
  
  if (jobResult.rows.length === 0) return null;
  
  const job = jobResult.rows[0];
  
  // Get latest progress from logs
  const progressResult = await pool.query(`
    SELECT additional_data->>'progress_percentage' as progress,
           additional_data->>'currentSource' as "currentSource"
    FROM scraping_logs
    WHERE job_id = $1 
      AND additional_data->>'progress_percentage' IS NOT NULL
    ORDER BY timestamp DESC
    LIMIT 1
  `, [jobId]);
  
  if (progressResult.rows.length > 0) {
    job.progress = parseInt(progressResult.rows[0].progress) || 0;
    job.currentSource = progressResult.rows[0].currentSource;
  }
  
  return job;
}

// Get jobs with pagination and calculated fields
export async function getJobs(limit: number = 20, offset: number = 0, status?: JobStatus): Promise<PaginatedResponse<ScrapingJob>> {
  let whereClause = '';
  const params: any[] = [limit, offset];
  
  if (status) {
    whereClause = 'WHERE status = $3';
    params.push(status);
  }
  
  const [jobs, count] = await Promise.all([
    pool.query(`
      SELECT 
        id,
        status,
        sources_requested as "sourcesRequested",
        articles_per_source as "articlesPerSource",
        total_articles_scraped as "totalArticlesScraped",
        total_errors as "totalErrors",
        triggered_at as "triggeredAt",
        completed_at as "completedAt",
        job_logs as "jobLogs",
        created_at as "createdAt",
        updated_at as "updatedAt",
        CASE 
          WHEN completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (completed_at - triggered_at))
          ELSE NULL
        END as duration
      FROM scraping_jobs 
      ${whereClause}
      ORDER BY triggered_at DESC
      LIMIT $1 OFFSET $2
    `, params),
    
    pool.query(`
      SELECT COUNT(*) as total FROM scraping_jobs ${whereClause}
    `, status ? [status] : [])
  ]);
  
  const total = parseInt(count.rows[0].total);
  
  return {
    data: jobs.rows,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    hasMore: offset + limit < total
  };
}

// Get job logs with pagination
export async function getJobLogs(jobId: string, page = 1, pageSize = 100): Promise<PaginatedResponse<any>> {
  const offset = (page - 1) * pageSize;
  
  const [logs, count] = await Promise.all([
    pool.query(`
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
    
    pool.query(`
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

// Get articles with filters
export async function getArticles(filters: ArticleFilters): Promise<PaginatedResponse<ScrapedArticle>> {
  const { page = 1, pageSize = 20, search, source, language, status } = filters;
  const offset = (page - 1) * pageSize;
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  if (search) {
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  if (source) {
    conditions.push(`source_name = $${paramIndex}`);
    params.push(source);
    paramIndex++;
  }
  
  if (language) {
    conditions.push(`language = $${paramIndex}`);
    params.push(language);
    paramIndex++;
  }
  
  if (status) {
    conditions.push(`processing_status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const [articles, count] = await Promise.all([
    pool.query(`
      SELECT * FROM scraped_content 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, pageSize, offset]),
    
    pool.query(`
      SELECT COUNT(*) as total FROM scraped_content ${whereClause}
    `, params)
  ]);
  
  return {
    data: articles.rows,
    total: parseInt(count.rows[0].total),
    page,
    pageSize,
    hasMore: offset + pageSize < parseInt(count.rows[0].total)
  };
}

// Get article by ID
export async function getArticleById(id: string): Promise<ScrapedArticle | null> {
  const result = await pool.query(`
    SELECT * FROM scraped_content WHERE id = $1
  `, [id]);
  
  return result.rows[0] || null;
}

// Source management functions
export async function getSources(): Promise<NewsSource[]> {
  const result = await pool.query(`
    SELECT 
      id, name, domain, rss_url, icon_url,
      respect_robots_txt, delay_between_requests,
      user_agent, timeout_ms, created_at
    FROM sources
    ORDER BY name
  `);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    domain: row.domain,
    rssUrl: row.rss_url,
    iconUrl: row.icon_url,
    respectRobotsTxt: row.respect_robots_txt,
    delayBetweenRequests: row.delay_between_requests,
    userAgent: row.user_agent,
    timeoutMs: row.timeout_ms,
    createdAt: row.created_at.toISOString()
  }));
}

export async function getSourceByName(name: string): Promise<NewsSource> {
  const result = await pool.query(`
    SELECT * FROM sources WHERE name = $1
  `, [name]);
  
  if (!result.rows[0]) {
    throw new Error(`Source not found: ${name}`);
  }
  
  return result.rows[0];
}

export async function createSource(source: Omit<NewsSource, 'id' | 'createdAt'>): Promise<NewsSource> {
  const result = await pool.query(`
    INSERT INTO sources (
      name, domain, rss_url, icon_url,
      respect_robots_txt, delay_between_requests,
      user_agent, timeout_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    source.name,
    source.domain,
    source.rssUrl,
    source.iconUrl || null,
    source.respectRobotsTxt !== false, // defaults to true
    source.delayBetweenRequests || 1000,
    source.userAgent || 'Veritas-Scraper/1.0',
    source.timeoutMs || 30000
  ]);
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    rssUrl: row.rss_url,
    iconUrl: row.icon_url,
    respectRobotsTxt: row.respect_robots_txt,
    delayBetweenRequests: row.delay_between_requests,
    userAgent: row.user_agent,
    timeoutMs: row.timeout_ms,
    createdAt: row.created_at.toISOString()
  };
}

export async function updateSource(id: string, updates: Partial<NewsSource>): Promise<void> {
  const updateFields: Record<string, any> = {};
  if ('name' in updates) updateFields.name = updates.name;
  if ('domain' in updates) updateFields.domain = updates.domain;
  if ('rssUrl' in updates) updateFields.rss_url = updates.rssUrl;
  if ('iconUrl' in updates) updateFields.icon_url = updates.iconUrl;
  if ('respectRobotsTxt' in updates) updateFields.respect_robots_txt = updates.respectRobotsTxt;
  if ('delayBetweenRequests' in updates) updateFields.delay_between_requests = updates.delayBetweenRequests;
  if ('userAgent' in updates) updateFields.user_agent = updates.userAgent;
  if ('timeoutMs' in updates) updateFields.timeout_ms = updates.timeoutMs;
  
  if (Object.keys(updateFields).length === 0) return;
  
  const setClause = Object.keys(updateFields)
    .map((key, idx) => `${key} = $${idx + 2}`)
    .join(', ');
  
  await pool.query(
    `UPDATE sources SET ${setClause} WHERE id = $1`,
    [id, ...Object.values(updateFields)]
  );
}

export async function deleteSource(id: string): Promise<void> {
  await pool.query(`DELETE FROM sources WHERE id = $1`, [id]);
}

// Error recovery on startup
export async function recoverStuckJobs(): Promise<void> {
  const result = await pool.query(`
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

// Export pool for direct queries if needed
export { pool }; 