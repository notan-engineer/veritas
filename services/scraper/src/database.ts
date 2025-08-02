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

// Debug: Log DATABASE_URL (remove password for security)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

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
      ) VALUES ($1, 'new', $2, $3, NOW(), 0, 0)
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
  
  if (['successful', 'partial', 'failed'].includes(status)) {
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
export async function saveArticle(article: Partial<ScrapedArticle>, jobId?: string): Promise<void> {
  const contentHash = article.contentHash || crypto.createHash('sha256')
    .update(`${article.title}:${article.content?.substring(0, 1000)}`)
    .digest('hex');
  
  await pool.query(`
    INSERT INTO scraped_content (
      source_id, source_url, title, content, author,
      publication_date, content_hash, language, processing_status, job_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, NOW())
    ON CONFLICT (source_url) DO NOTHING
  `, [
    article.sourceId,
    article.sourceUrl,
    article.title,
    article.content,
    article.author || null,
    article.publicationDate ? new Date(article.publicationDate) : null,
    contentHash,
    article.language || 'en',
    jobId || null
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
      sj.id,
      sj.status,
      sj.sources_requested as "sourcesRequested",
      sj.articles_per_source as "articlesPerSource",
      COALESCE(sc.actual_scraped_count, 0)::integer as "totalArticlesScraped",
      sj.total_errors as "totalErrors",
      sj.triggered_at as "triggeredAt",
      sj.completed_at as "completedAt",
      sj.created_at as "createdAt",
      sj.updated_at as "updatedAt",
      CASE 
        WHEN sj.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (sj.completed_at - sj.triggered_at))
        ELSE NULL
      END as duration
    FROM scraping_jobs sj
    LEFT JOIN (
      SELECT job_id, COUNT(*) as actual_scraped_count
      FROM scraped_content
      WHERE job_id = $1
      GROUP BY job_id
    ) sc ON sj.id = sc.job_id
    WHERE sj.id = $1
  `, [jobId]);
  
  if (jobResult.rows.length === 0) return null;
  
  const job = jobResult.rows[0];
  
  // Get latest progress from logs
  const progressResult = await pool.query(`
    SELECT additional_data->>'progress_percentage' as progress,
           additional_data->>'currentSource' as "currentSource"
    FROM scraping_logs
    WHERE job_id = $1::uuid
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
    whereClause = 'WHERE sj.status = $3';
    params.push(status);
  }
  
  const [jobs, count] = await Promise.all([
    pool.query(`
      SELECT 
        sj.id,
        sj.status,
        sj.sources_requested as "sourcesRequested",
        sj.articles_per_source as "articlesPerSource",
        COALESCE(sc.actual_scraped_count, 0)::integer as "totalArticlesScraped",
        sj.total_errors as "totalErrors",
        sj.triggered_at as "triggeredAt",
        sj.completed_at as "completedAt",
        sj.created_at as "createdAt",
        sj.updated_at as "updatedAt",
        CASE 
          WHEN sj.completed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (sj.completed_at - sj.triggered_at))
          ELSE NULL
        END as duration
      FROM scraping_jobs sj
      LEFT JOIN (
        SELECT job_id, COUNT(*) as actual_scraped_count
        FROM scraped_content
        GROUP BY job_id
      ) sc ON sj.id = sc.job_id
      ${whereClause}
      ORDER BY sj.triggered_at DESC
      LIMIT $1 OFFSET $2
    `, params),
    
    pool.query(`
      SELECT COUNT(*) as total FROM scraping_jobs sj ${whereClause}
    `, status ? [status] : [])
  ]);
  
  const total = parseInt(count.rows[0].total);
  
  // Get per-source article counts for all jobs
  const jobIds = jobs.rows.map(job => job.id);
  let sourceCountsResult: { rows: any[] } = { rows: [] };
  
  if (jobIds.length > 0) {
    sourceCountsResult = await pool.query(`
      SELECT 
        sc.job_id,
        s.name as source_name,
        COUNT(*) as count
      FROM scraped_content sc
      JOIN sources s ON sc.source_id = s.id
      WHERE sc.job_id = ANY($1::uuid[])
      GROUP BY sc.job_id, s.name
    `, [jobIds]);
  }
  
  // Create a map of job_id -> source -> count
  const sourceCountsMap: Record<string, Record<string, number>> = {};
  
  
  sourceCountsResult.rows.forEach((row: any) => {
    const jobId = row.job_id;
    const sourceName = row.source_name;
    if (!sourceCountsMap[jobId]) {
      sourceCountsMap[jobId] = {};
    }
    sourceCountsMap[jobId][sourceName] = parseInt(row.count);
  });
  
  // Add source counts to each job
  const jobsWithSourceCounts = jobs.rows.map(job => ({
    ...job,
    sourceArticleCounts: sourceCountsMap[job.id] || {}
  }));
  
  return {
    data: jobsWithSourceCounts,
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
      LEFT JOIN sources s ON sl.source_id = s.id::varchar
      WHERE sl.job_id = $1::uuid
      ORDER BY sl.timestamp ASC
      LIMIT $2 OFFSET $3
    `, [jobId, pageSize, offset]),
    
    pool.query(`
      SELECT COUNT(*) as total 
      FROM scraping_logs 
      WHERE job_id = $1::uuid
    `, [jobId])
  ]);
  
  return {
    data: logs.rows.map(row => ({
      id: row.id,
      jobId: jobId,
      sourceId: row.source_id,
      sourceName: row.source_name,
      timestamp: row.timestamp.toISOString(),
      logLevel: row.log_level,  // Note: log_level in DB, logLevel in interface
      message: row.message,
      additionalData: row.additional_data
    })),
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
    conditions.push(`(sc.title ILIKE $${paramIndex} OR sc.content ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  if (source) {
    conditions.push(`s.name = $${paramIndex}`);
    params.push(source);
    paramIndex++;
  }
  
  if (language) {
    conditions.push(`sc.language = $${paramIndex}`);
    params.push(language);
    paramIndex++;
  }
  
  if (status) {
    conditions.push(`sc.processing_status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const [articles, count] = await Promise.all([
    pool.query(`
      SELECT 
        sc.id,
        sc.title,
        sc.content,
        sc.author,
        sc.source_url,
        sc.source_id,
        sc.publication_date,
        sc.language,
        sc.category,
        sc.tags,
        sc.content_type,
        sc.processing_status,
        sc.content_hash,
        sc.full_html,
        sc.created_at,
        s.name as source_name
      FROM scraped_content sc
      LEFT JOIN sources s ON sc.source_id = s.id
      ${whereClause}
      ORDER BY sc.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, pageSize, offset]),
    
    pool.query(`
      SELECT COUNT(*) as total 
      FROM scraped_content sc
      LEFT JOIN sources s ON sc.source_id = s.id
      ${whereClause}
    `, params)
  ]);
  
  return {
    data: articles.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      author: row.author,
      sourceUrl: row.source_url,
      sourceId: row.source_id,
      sourceName: row.source_name,
      publicationDate: row.publication_date?.toISOString(),
      language: row.language,
      category: row.category,
      tags: row.tags,
      contentType: row.content_type,
      processingStatus: row.processing_status,
      contentHash: row.content_hash,
      fullHtml: row.full_html,
      createdAt: row.created_at.toISOString()
    })),
    total: parseInt(count.rows[0].total),
    page,
    pageSize,
    hasMore: offset + pageSize < parseInt(count.rows[0].total)
  };
}

// Get article by ID
export async function getArticleById(id: string): Promise<ScrapedArticle | null> {
  const result = await pool.query(`
    SELECT 
      sc.id,
      sc.title,
      sc.content,
      sc.author,
      sc.source_url,
      sc.source_id,
      sc.publication_date,
      sc.language,
      sc.category,
      sc.tags,
      sc.content_type,
      sc.processing_status,
      sc.content_hash,
      sc.full_html,
      sc.created_at,
      s.name as source_name
    FROM scraped_content sc
    LEFT JOIN sources s ON sc.source_id = s.id
    WHERE sc.id = $1
  `, [id]);
  
  if (!result.rows[0]) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    sourceUrl: row.source_url,
    sourceId: row.source_id,
    sourceName: row.source_name,
    publicationDate: row.publication_date?.toISOString(),
    language: row.language,
    category: row.category,
    tags: row.tags,
    contentType: row.content_type,
    processingStatus: row.processing_status,
    contentHash: row.content_hash,
    fullHtml: row.full_html,
    createdAt: row.created_at.toISOString()
  };
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
  
  return result.rows.map(row => {
    return {
      id: row.id,
      name: row.name,
      domain: row.domain,
      rssUrl: row.rss_url,
      iconUrl: row.icon_url,
      respectRobotsTxt: row.respect_robots_txt ?? true,
      delayBetweenRequests: row.delay_between_requests ?? 1000,
      userAgent: row.user_agent ?? 'Veritas-Scraper/1.0',
      timeoutMs: row.timeout_ms ?? 30000,
      createdAt: row.created_at.toISOString()
    };
  });
}

export async function getSourceByName(name: string): Promise<NewsSource> {
  const result = await pool.query(`
    SELECT 
      id, name, domain, rss_url, icon_url,
      respect_robots_txt, delay_between_requests,
      user_agent, timeout_ms, created_at
    FROM sources 
    WHERE name = $1
  `, [name]);
  
  if (!result.rows[0]) {
    throw new Error(`Source not found: ${name}`);
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    rssUrl: row.rss_url,
    iconUrl: row.icon_url,
    respectRobotsTxt: row.respect_robots_txt ?? true,
    delayBetweenRequests: row.delay_between_requests ?? 1000,
    userAgent: row.user_agent ?? 'Veritas-Scraper/1.0',
    timeoutMs: row.timeout_ms ?? 30000,
    createdAt: row.created_at.toISOString()
  };
}

export async function createSource(source: Omit<NewsSource, 'id' | 'createdAt'>): Promise<NewsSource> {
  const result = await pool.query(`
    INSERT INTO sources (
      name, domain, rss_url, icon_url, respect_robots_txt, 
      delay_between_requests, user_agent, timeout_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, domain, rss_url, icon_url, respect_robots_txt,
              delay_between_requests, user_agent, timeout_ms, created_at
  `, [
    source.name,
    source.domain,
    source.rssUrl,
    source.iconUrl || null,
    source.respectRobotsTxt ?? true,
    source.delayBetweenRequests ?? 1000,
    source.userAgent ?? 'Veritas-Scraper/1.0',
    source.timeoutMs ?? 30000
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
  
  // Handle all fields directly
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
    WHERE status IN ('in-progress', 'new')
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