import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/railway-database';

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface JobHistoryItem {
  id: string;
  triggeredAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  sourcesRequested: string[];
  articlesPerSource: number;
  totalArticlesScraped: number;
  totalErrors: number;
  duration?: number;
}

// Mock job history data
const mockJobHistory: JobHistoryItem[] = [
  {
    id: 'job-001',
    triggeredAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3300000).toISOString(),
    status: 'completed',
    sourcesRequested: ['cnn', 'bbc'],
    articlesPerSource: 5,
    totalArticlesScraped: 8,
    totalErrors: 2,
    duration: 35
  },
  {
    id: 'job-002',
    triggeredAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 6900000).toISOString(),
    status: 'completed',
    sourcesRequested: ['cnn'],
    articlesPerSource: 3,
    totalArticlesScraped: 3,
    totalErrors: 0,
    duration: 25
  },
  {
    id: 'job-003',
    triggeredAt: new Date(Date.now() - 10800000).toISOString(),
    completedAt: new Date(Date.now() - 10500000).toISOString(),
    status: 'failed',
    sourcesRequested: ['reuters'],
    articlesPerSource: 5,
    totalArticlesScraped: 0,
    totalErrors: 5,
    duration: 20
  },
  {
    id: 'job-004',
    triggeredAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: new Date(Date.now() - 14100000).toISOString(),
    status: 'completed',
    sourcesRequested: ['bbc', 'reuters'],
    articlesPerSource: 4,
    totalArticlesScraped: 7,
    totalErrors: 1,
    duration: 42
  }
];

/**
 * GET /api/scraper/jobs
 * Retrieve job history with optional pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<JobHistoryItem[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Try to get data from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${scraperServiceUrl}/api/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const scraperData = await response.json();
        return NextResponse.json({
          success: true,
          data: scraperData.jobs || [],
          message: 'Job history retrieved from scraper service'
        });
      }
    } catch (error) {
      console.log('Scraper service unavailable, falling back to database query');
    }

    // Fallback: Query database directly if scraper service is unavailable
    try {
      let dbQuery = `
        SELECT 
          id, triggered_at, completed_at, status, sources_requested, 
          articles_per_source, total_articles_scraped, total_errors, job_logs,
          EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - triggered_at)) as duration
        FROM scraping_jobs 
      `;
      
      const params: any[] = [];
      if (status) {
        dbQuery += ' WHERE status = $1';
        params.push(status);
      }
      
      dbQuery += ' ORDER BY triggered_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);
      
      if (offset > 0) {
        dbQuery += ' OFFSET $' + (params.length + 1);
        params.push(offset);
      }
      
      const result = await query(dbQuery, params);
      
      const jobs = result.rows.map(row => ({
        id: row.id,
        triggeredAt: row.triggered_at,
        completedAt: row.completed_at,
        status: row.status,
        sourcesRequested: row.sources_requested || [],
        articlesPerSource: row.articles_per_source || 0,
        totalArticlesScraped: row.total_articles_scraped || 0,
        totalErrors: row.total_errors || 0,
        duration: Math.floor(row.duration || 0)
      }));

      return NextResponse.json({
        success: true,
        data: jobs,
        message: 'Job history retrieved from database (scraper service unavailable)'
      });
      
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No job history available - both scraper service and database unavailable'
      });
    }

  } catch (error) {
    console.error('[Jobs API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve jobs'
    }, { status: 500 });
  }
}

/**
 * POST /api/scraper/jobs
 * Cancel a running job
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ jobId: string }>>> {
  try {
    const body = await request.json();
    const { action, jobId } = body;

    if (action === 'cancel' && jobId) {
      // Try to cancel job on scraper service
      try {
        const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
        const response = await fetch(`${scraperServiceUrl}/api/jobs/${jobId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json({
            success: true,
            data: { jobId },
            message: 'Job cancelled successfully'
          });
        }
      } catch (error) {
        console.log('Scraper service unavailable for job cancellation');
      }

      // Mock cancellation
      return NextResponse.json({
        success: true,
        data: { jobId },
        message: 'Job cancellation requested (mock)'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing jobId'
    }, { status: 400 });

  } catch (error) {
    console.error('[Jobs API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process job action'
    }, { status: 500 });
  }
} 