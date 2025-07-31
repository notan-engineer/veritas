import { pool } from './database';

/**
 * Helper class for querying enhanced JSONB logs
 */
export class LogQueryHelper {
  /**
   * Get all HTTP errors for a job
   */
  static async getHttpErrors(jobId: string) {
    const result = await pool.query(`
      SELECT 
        id,
        timestamp,
        message,
        source_id,
        additional_data
      FROM scraping_logs
      WHERE job_id = $1
      AND additional_data->>'event_type' = 'http'
      AND (additional_data->'http'->>'status')::int >= 400
      ORDER BY timestamp DESC
    `, [jobId]);
    
    return result.rows;
  }
  
  /**
   * Get performance metrics over time
   */
  static async getPerformanceMetrics(jobId: string) {
    const result = await pool.query(`
      SELECT 
        timestamp,
        additional_data->'perf'->>'mem_mb' as memory_mb,
        additional_data->'perf'->>'cpu_pct' as cpu_percent,
        additional_data->'perf'->>'active_reqs' as active_requests,
        additional_data->'perf'->>'avg_resp_ms' as avg_response_ms
      FROM scraping_logs
      WHERE job_id = $1
      AND additional_data->>'event_type' = 'performance'
      ORDER BY timestamp
    `, [jobId]);
    
    return result.rows.map(row => ({
      timestamp: row.timestamp,
      memoryMB: parseFloat(row.memory_mb || '0'),
      cpuPercent: parseFloat(row.cpu_percent || '0'),
      activeRequests: parseInt(row.active_requests || '0'),
      avgResponseMs: parseFloat(row.avg_response_ms || '0')
    }));
  }
  
  /**
   * Get extraction quality distribution
   */
  static async getExtractionQuality(jobId: string) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as count,
        AVG((additional_data->'extraction'->>'quality_score')::int) as avg_quality,
        MIN((additional_data->'extraction'->>'quality_score')::int) as min_quality,
        MAX((additional_data->'extraction'->>'quality_score')::int) as max_quality,
        COUNT(*) FILTER (WHERE (additional_data->'extraction'->>'quality_score')::int >= 80) as high_quality,
        COUNT(*) FILTER (WHERE (additional_data->'extraction'->>'quality_score')::int < 50) as low_quality
      FROM scraping_logs
      WHERE job_id = $1
      AND additional_data->>'event_type' = 'extraction'
    `, [jobId]);
    
    return result.rows[0];
  }
  
  /**
   * Get correlated events for an article
   */
  static async getCorrelatedEvents(correlationId: string) {
    const result = await pool.query(`
      SELECT 
        id,
        timestamp,
        log_level,
        message,
        additional_data
      FROM scraping_logs
      WHERE additional_data->>'correlation_id' = $1
      ORDER BY timestamp
    `, [correlationId]);
    
    return result.rows;
  }
  
  /**
   * Get source performance summary
   */
  static async getSourcePerformance(jobId: string) {
    const result = await pool.query(`
      SELECT 
        s.name as source_name,
        COUNT(DISTINCT l.id) as total_events,
        COUNT(*) FILTER (WHERE l.log_level = 'error') as error_count,
        COUNT(*) FILTER (WHERE l.additional_data->>'event_name' = 'extraction_completed') as articles_extracted,
        AVG((l.additional_data->'extraction'->>'quality_score')::int) as avg_quality_score
      FROM scraping_logs l
      JOIN sources s ON s.id = l.source_id::uuid
      WHERE l.job_id = $1
      GROUP BY s.name
      ORDER BY s.name
    `, [jobId]);
    
    return result.rows;
  }
  
  /**
   * Get HTTP response time statistics
   */
  static async getResponseTimeStats(jobId: string) {
    const result = await pool.query(`
      SELECT 
        percentile_cont(0.50) WITHIN GROUP (ORDER BY (additional_data->'http'->>'response_ms')::int) as p50,
        percentile_cont(0.90) WITHIN GROUP (ORDER BY (additional_data->'http'->>'response_ms')::int) as p90,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY (additional_data->'http'->>'response_ms')::int) as p95,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY (additional_data->'http'->>'response_ms')::int) as p99,
        AVG((additional_data->'http'->>'response_ms')::int) as avg,
        MIN((additional_data->'http'->>'response_ms')::int) as min,
        MAX((additional_data->'http'->>'response_ms')::int) as max
      FROM scraping_logs
      WHERE job_id = $1
      AND additional_data->>'event_type' = 'http'
      AND additional_data->'http'->>'response_ms' IS NOT NULL
    `, [jobId]);
    
    return result.rows[0];
  }
  
  /**
   * Get job timeline with key events
   */
  static async getJobTimeline(jobId: string) {
    const result = await pool.query(`
      SELECT 
        timestamp,
        log_level,
        message,
        additional_data->>'event_type' as event_type,
        additional_data->>'event_name' as event_name,
        source_id
      FROM scraping_logs
      WHERE job_id = $1
      AND additional_data->>'event_type' IN ('lifecycle', 'source', 'error')
      ORDER BY timestamp
    `, [jobId]);
    
    return result.rows;
  }
  
  /**
   * Get error summary by type
   */
  static async getErrorSummary(jobId: string) {
    const result = await pool.query(`
      SELECT 
        additional_data->'error'->>'type' as error_type,
        additional_data->'error'->>'code' as error_code,
        COUNT(*) as count,
        array_agg(DISTINCT additional_data->'http'->>'url') as sample_urls
      FROM scraping_logs
      WHERE job_id = $1
      AND log_level = 'error'
      AND additional_data->'error' IS NOT NULL
      GROUP BY error_type, error_code
      ORDER BY count DESC
    `, [jobId]);
    
    return result.rows;
  }
}

/**
 * Format log entries for display
 */
export function formatLogEntry(log: any): string {
  const eventType = log.additional_data?.event_type;
  const eventName = log.additional_data?.event_name;
  
  let badges = '';
  
  if (eventType) {
    badges += `[${eventType.toUpperCase()}] `;
  }
  
  if (eventName) {
    badges += `[${eventName}] `;
  }
  
  if (log.additional_data?.http?.status) {
    badges += `[${log.additional_data.http.status}] `;
  }
  
  return `${log.timestamp} [${log.log_level.toUpperCase()}] ${badges}${log.message}`;
}

/**
 * Get enhanced logs with structured data
 */
export async function getEnhancedLogs(jobId: string, filters?: {
  eventType?: string;
  level?: string;
  sourceId?: string;
  limit?: number;
}) {
  let query = `
    SELECT 
      id,
      timestamp,
      log_level,
      message,
      source_id,
      additional_data
    FROM scraping_logs
    WHERE job_id = $1
  `;
  
  const params: any[] = [jobId];
  let paramIndex = 2;
  
  if (filters?.eventType) {
    query += ` AND additional_data->>'event_type' = $${paramIndex}`;
    params.push(filters.eventType);
    paramIndex++;
  }
  
  if (filters?.level) {
    query += ` AND log_level = $${paramIndex}`;
    params.push(filters.level);
    paramIndex++;
  }
  
  if (filters?.sourceId) {
    query += ` AND source_id = $${paramIndex}`;
    params.push(filters.sourceId);
    paramIndex++;
  }
  
  query += ' ORDER BY timestamp DESC';
  
  if (filters?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}