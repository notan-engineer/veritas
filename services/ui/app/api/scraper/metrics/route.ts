import { NextRequest, NextResponse } from 'next/server';

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface HealthMetrics {
  jobsTriggered: number;
  successfulJobs: number;
  candidatesFound: number;
  articlesScraped: number;
  errorsPerJob: number;
  averageJobDuration: number;
  storageUsed: number;
  activeJobs: number;
  lastUpdateTime: string;
}

// Mock metrics data
const mockMetrics: HealthMetrics = {
  jobsTriggered: 15,
  successfulJobs: 12,
  candidatesFound: 245,
  articlesScraped: 189,
  errorsPerJob: 2.3,
  averageJobDuration: 45, // seconds
  storageUsed: 125.5, // MB
  activeJobs: 0,
  lastUpdateTime: new Date().toISOString()
};

/**
 * GET /api/scraper/metrics
 * Retrieve health metrics for the dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<HealthMetrics>>> {
  try {
    // Try to get data from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${scraperServiceUrl}/api/monitoring/performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const scraperData = await response.json();
        
        // Transform scraper service data to our metrics format
        const transformedMetrics: HealthMetrics = {
          jobsTriggered: scraperData.jobsTriggered || 0,
          successfulJobs: scraperData.successfulJobs || 0,
          candidatesFound: scraperData.candidatesFound || 0,
          articlesScraped: scraperData.articlesScraped || 0,
          errorsPerJob: scraperData.errorsPerJob || 0,
          averageJobDuration: scraperData.averageJobDuration || 0,
          storageUsed: scraperData.storageUsed || 0,
          activeJobs: scraperData.activeJobs || 0,
          lastUpdateTime: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: transformedMetrics,
          message: 'Metrics retrieved from scraper service'
        });
      }
    } catch (error) {
      console.log('Scraper service unavailable, calculating basic metrics from database');
    }

    // Try to calculate basic metrics from database
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      // Get basic metrics from scraped_content table
      const contentResult = await railwayDb.query(`
        SELECT 
          COUNT(*) as total_articles,
          COUNT(DISTINCT source_id) as active_sources,
          AVG(CASE WHEN LENGTH(content) > 0 THEN 1 ELSE 0 END) * 100 as success_rate
        FROM scraped_content 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);
      
      const sourcesResult = await railwayDb.query(`
        SELECT COUNT(*) as total_sources 
        FROM sources 
        WHERE is_active = true
      `);
      
      const row = contentResult.rows[0];
      const sourcesRow = sourcesResult.rows[0];
      
      const metrics: HealthMetrics = {
        jobsTriggered: 0, // No job tracking in current schema
        successfulJobs: 0, // No job tracking in current schema
        candidatesFound: parseInt(row.total_articles) || 0,
        articlesScraped: parseInt(row.total_articles) || 0,
        errorsPerJob: 0, // No job tracking in current schema
        averageJobDuration: 0, // No job tracking in current schema
        storageUsed: 0, // Would need database size query
        activeJobs: 0, // No job tracking in current schema
        lastUpdateTime: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: metrics,
        message: 'Basic metrics calculated from database'
      });
      
    } catch (dbError) {
      console.log('Database also unavailable:', dbError);
      
      // Return minimal metrics instead of mock data
      const emptyMetrics: HealthMetrics = {
        jobsTriggered: 0,
        successfulJobs: 0,
        candidatesFound: 0,
        articlesScraped: 0,
        errorsPerJob: 0,
        averageJobDuration: 0,
        storageUsed: 0,
        activeJobs: 0,
        lastUpdateTime: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: emptyMetrics,
        message: 'No metrics available - scraper service and database unavailable'
      });
    }

  } catch (error) {
    console.error('[Metrics API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve metrics'
    }, { status: 500 });
  }
}

/**
 * POST /api/scraper/metrics
 * Reset or update metrics (for testing purposes)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<HealthMetrics>>> {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      // Reset metrics to initial state
      const resetMetrics: HealthMetrics = {
        jobsTriggered: 0,
        successfulJobs: 0,
        candidatesFound: 0,
        articlesScraped: 0,
        errorsPerJob: 0,
        averageJobDuration: 0,
        storageUsed: 0,
        activeJobs: 0,
        lastUpdateTime: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: resetMetrics,
        message: 'Metrics reset successfully'
      });
    }

    if (action === 'refresh') {
      // Simulate updated metrics
      const refreshedMetrics: HealthMetrics = {
        jobsTriggered: mockMetrics.jobsTriggered + Math.floor(Math.random() * 3),
        successfulJobs: mockMetrics.successfulJobs + Math.floor(Math.random() * 2),
        candidatesFound: mockMetrics.candidatesFound + Math.floor(Math.random() * 20),
        articlesScraped: mockMetrics.articlesScraped + Math.floor(Math.random() * 15),
        errorsPerJob: Math.max(0, mockMetrics.errorsPerJob + (Math.random() - 0.5)),
        averageJobDuration: Math.max(10, mockMetrics.averageJobDuration + Math.floor(Math.random() * 20) - 10),
        storageUsed: mockMetrics.storageUsed + Math.random() * 5,
        activeJobs: Math.floor(Math.random() * 3),
        lastUpdateTime: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: refreshedMetrics,
        message: 'Metrics refreshed successfully'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "reset" or "refresh"'
    }, { status: 400 });

  } catch (error) {
    console.error('[Metrics API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update metrics'
    }, { status: 500 });
  }
} 