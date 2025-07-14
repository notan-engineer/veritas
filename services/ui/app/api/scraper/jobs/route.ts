import { NextRequest, NextResponse } from 'next/server';

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
      console.log('Scraper service unavailable, using mock data');
    }

    // Filter mock data
    let filteredJobs = mockJobHistory;
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    // Apply pagination
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedJobs,
      message: `Retrieved ${paginatedJobs.length} jobs (mock data)`
    });

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