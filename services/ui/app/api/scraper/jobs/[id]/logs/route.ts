import { NextRequest, NextResponse } from 'next/server';

interface JobLogEntry {
  timestamp: string;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: Record<string, any>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * GET /api/scraper/jobs/[id]/logs
 * Retrieve logs for a specific job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<JobLogEntry[]>>> {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    // Try to get logs from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${scraperServiceUrl}/api/jobs/${jobId}/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const scraperData = await response.json();
        return NextResponse.json({
          success: true,
          data: scraperData.logs || [],
          message: 'Job logs retrieved from scraper service'
        });
      }
    } catch (error) {
      console.log('Scraper service unavailable, falling back to database query');
    }

    // Fallback: Query database directly if scraper service is unavailable
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      const result = await railwayDb.query(
        'SELECT job_logs FROM scraping_jobs WHERE id = $1',
        [jobId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Job not found'
        }, { status: 404 });
      }

      const logs = result.rows[0].job_logs || [];

      return NextResponse.json({
        success: true,
        data: logs,
        message: 'Job logs retrieved from database'
      });

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve job logs from database'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error retrieving job logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 