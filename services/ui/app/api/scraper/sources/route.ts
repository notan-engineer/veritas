import { NextRequest, NextResponse } from 'next/server';

// Note: This is a mock API that demonstrates the source management structure
// In a production environment, this would make HTTP requests to the scraper service

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SourceListResponse {
  sources: any[];
  total: number;
  page: number;
  pageSize: number;
}

// Mock data for development
const mockSources = [
  {
    id: '1',
    name: 'CNN',
    domain: 'cnn.com',
    url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
    rssUrl: 'http://rss.cnn.com/rss/cnn_topstories.rss',
    description: 'CNN Top Stories RSS Feed',
    isActive: true,
    isEnabled: true,
    successRate: 95.2,
    createdAt: new Date('2024-01-01'),
    lastScrapedAt: new Date()
  },
  {
    id: '2',
    name: 'BBC News',
    domain: 'bbc.com',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
    description: 'BBC News RSS Feed',
    isActive: true,
    isEnabled: true,
    successRate: 98.1,
    createdAt: new Date('2024-01-01'),
    lastScrapedAt: new Date()
  }
];

/**
 * GET /api/scraper/sources
 * Retrieve all sources with optional filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SourceListResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const activeOnly = searchParams.get('active') === 'true';
    const enabledOnly = searchParams.get('enabled') === 'true';
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const includeHealth = searchParams.get('includeHealth') === 'true';

    // Get sources from database
    let sources;
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      let query = 'SELECT * FROM sources';
      const conditions: string[] = [];
      const params: any[] = [];
      
      // Note: activeOnly and enabledOnly filters removed as we no longer track active/enabled status
      // All sources in the database are considered active
      
      if (category) {
        conditions.push('name ILIKE $' + (params.length + 1));
        params.push(`%${category}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await railwayDb.query(query, params);
      
      // Transform database results to match expected interface using simplified schema
      sources = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        domain: row.domain,
        rssUrl: row.rss_url,
        respectRobotsTxt: row.respect_robots_txt || true,
        delayBetweenRequests: row.delay_between_requests || 1000,
        userAgent: row.user_agent || 'Veritas-Scraper/1.0',
        timeoutMs: row.timeout_ms || 30000,
        isActive: true, // All sources in DB are considered active in simplified schema
        isEnabled: true, // All sources in DB are considered enabled in simplified schema
        successRate: 95.0, // Default success rate (no longer tracked)
        lastScrapedAt: undefined, // No longer tracked in simplified schema
        createdAt: row.created_at
      }));
    } catch (dbError) {
      console.log('Database unavailable, using mock data:', dbError);
      sources = mockSources;
      
      if (activeOnly) {
        sources = sources.filter(s => s.isActive);
      }
      
      if (enabledOnly) {
        sources = sources.filter(s => s.isEnabled);
      }
      
      if (category) {
        sources = sources.filter(s => s.name.toLowerCase().includes(category.toLowerCase()));
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSources = sources.slice(startIndex, endIndex);

    // Include health data if requested (mock implementation)
    const enrichedSources = paginatedSources.map(source => {
      if (includeHealth) {
        return {
          ...source,
          health: {
            sourceId: source.id,
            isHealthy: true,
            successRate: source.successRate,
            averageResponseTime: 1200,
            errorCount: 1,
            totalScrapes: 50,
            lastHealthCheck: new Date()
          },
          performance: {
            sourceId: source.id,
            sourceName: source.name,
            totalArticles: 150,
            successfulArticles: 142,
            failedArticles: 8,
            duplicateArticles: 25,
            averageProcessingTime: 3500,
            lastScrapedAt: source.lastScrapedAt,
            createdAt: source.createdAt
          }
        };
      }
      return source;
    });

    const response: SourceListResponse = {
      sources: enrichedSources,
      total: sources.length,
      page,
      pageSize
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: `Retrieved ${enrichedSources.length} sources`
    });

  } catch (error) {
    console.error('[Sources API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve sources'
    }, { status: 500 });
  }
}

/**
 * POST /api/scraper/sources
 * Create a new source
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ sourceId: string }>>> {
  try {
    const body = await request.json();
    
    // Validate required fields for simplified schema
    const requiredFields = ['name', 'domain', 'rssUrl'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create source in database using simplified schema
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      const result = await railwayDb.query(
        `INSERT INTO sources (name, domain, rss_url, respect_robots_txt, delay_between_requests, user_agent, timeout_ms) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [
          body.name, 
          body.domain, 
          body.rssUrl, 
          body.respectRobotsTxt !== false, // Default to true
          body.delayBetweenRequests || 1000, // Default to 1000ms
          body.userAgent || 'Veritas-Scraper/1.0', // Default user agent
          body.timeoutMs || 30000 // Default to 30 seconds
        ]
      );
      
      const sourceId = result.rows[0].id;
      
      return NextResponse.json({
        success: true,
        data: { sourceId },
        message: `Source created successfully with ID: ${sourceId}`
      });
      
    } catch (dbError) {
      console.error('Database error creating source:', dbError);
      
      // Fallback to mock behavior
      const sourceId = Math.random().toString(36).substring(2, 15);
      console.log('Fallback: Creating source with data:', body);

      return NextResponse.json({
        success: true,
        data: { sourceId },
        message: `Source created successfully (fallback mode) with ID: ${sourceId}`
      });
    }

  } catch (error) {
    console.error('[Sources API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create source'
    }, { status: 500 });
  }
}

/**
 * PUT /api/scraper/sources
 * Update an existing source
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<{ sourceId: string }>>> {
  try {
    const body = await request.json();
    
    // Validate source ID
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Source ID is required for updates'
      }, { status: 400 });
    }

    // Update source in database using simplified schema
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      const result = await railwayDb.query(
        `UPDATE sources 
         SET name = $1, domain = $2, rss_url = $3, respect_robots_txt = $4, 
             delay_between_requests = $5, user_agent = $6, timeout_ms = $7
         WHERE id = $8
         RETURNING id`,
        [
          body.name, 
          body.domain, 
          body.rssUrl, 
          body.respectRobotsTxt !== false, // Default to true
          body.delayBetweenRequests || 1000, // Default to 1000ms
          body.userAgent || 'Veritas-Scraper/1.0', // Default user agent
          body.timeoutMs || 30000, // Default to 30 seconds
          body.id
        ]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Source not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: { sourceId: body.id },
        message: `Source updated successfully`
      });
      
    } catch (dbError) {
      console.error('Database error updating source:', dbError);
      
      // Fallback to mock behavior
      console.log('Fallback: Updating source with data:', body);

      return NextResponse.json({
        success: true,
        data: { sourceId: body.id },
        message: `Source updated successfully (fallback mode)`
      });
    }

  } catch (error) {
    console.error('[Sources API] PUT error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update source'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/scraper/sources
 * Delete a source
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse<{ sourceId: string }>>> {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('id');
    
    if (!sourceId) {
      return NextResponse.json({
        success: false,
        error: 'Source ID is required for deletion'
      }, { status: 400 });
    }

    // Delete source from database
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      const result = await railwayDb.query(
        'DELETE FROM sources WHERE id = $1 RETURNING id',
        [sourceId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Source not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: { sourceId },
        message: `Source deleted successfully`
      });
      
    } catch (dbError) {
      console.error('Database error deleting source:', dbError);
      
      // Fallback to mock behavior
      console.log('Fallback: Deleting source:', sourceId);

      return NextResponse.json({
        success: true,
        data: { sourceId },
        message: `Source deleted successfully (fallback mode)`
      });
    }

  } catch (error) {
    console.error('[Sources API] DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete source'
    }, { status: 500 });
  }
}

/**
 * PATCH /api/scraper/sources
 * Batch operations and special actions
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const body = await request.json();
    const { action, sourceId, sourceIds } = body;

    switch (action) {
      case 'test':
        if (!sourceId) {
          return NextResponse.json({
            success: false,
            error: 'Source ID is required for testing'
          }, { status: 400 });
        }

        // Mock test result
        const testResult = {
          isValid: true,
          errors: [],
          warnings: ['Mock warning: RSS feed validation not implemented'],
          rssItemCount: 25,
          responseTime: 1200,
          contentType: 'application/rss+xml',
          lastChecked: new Date()
        };

        return NextResponse.json({
          success: true,
          data: testResult,
          message: `Source test ${testResult.isValid ? 'passed' : 'failed'}`
        });

      case 'health':
        if (!sourceId) {
          return NextResponse.json({
            success: false,
            error: 'Source ID is required for health check'
          }, { status: 400 });
        }

        // Mock health response
        const healthResponse = {
          sourceId,
          health: {
            sourceId,
            isHealthy: true,
            successRate: 96.5,
            averageResponseTime: 1100,
            errorCount: 2,
            totalScrapes: 55,
            lastHealthCheck: new Date()
          },
          performance: {
            sourceId,
            sourceName: 'Mock Source',
            totalArticles: 175,
            successfulArticles: 168,
            failedArticles: 7,
            duplicateArticles: 30,
            averageProcessingTime: 3200,
            lastScrapedAt: new Date(),
            createdAt: new Date('2024-01-01')
          },
          lastUpdated: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: healthResponse,
          message: 'Health metrics retrieved successfully'
        });

      case 'validate':
        if (!body.sourceData) {
          return NextResponse.json({
            success: false,
            error: 'Source data is required for validation'
          }, { status: 400 });
        }

        // Mock validation
        const validation = {
          isValid: true,
          errors: [],
          warnings: [],
          lastChecked: new Date()
        };

        return NextResponse.json({
          success: true,
          data: validation,
          message: `Validation ${validation.isValid ? 'passed' : 'failed'}`
        });

      case 'bulk-enable':
      case 'bulk-disable':
        if (!sourceIds || !Array.isArray(sourceIds)) {
          return NextResponse.json({
            success: false,
            error: 'Source IDs array is required for bulk operations'
          }, { status: 400 });
        }

        // Mock bulk operation
        const successCount = sourceIds.length;
        
        return NextResponse.json({
          success: true,
          data: { 
            total: sourceIds.length, 
            successful: successCount, 
            failed: 0
          },
          message: `Bulk ${action} completed: ${successCount}/${sourceIds.length} sources processed`
        });

      case 'health-all':
        // Mock all health metrics
        const allHealth = mockSources.map(source => ({
          sourceId: source.id,
          isHealthy: true,
          successRate: source.successRate,
          averageResponseTime: 1200,
          errorCount: 1,
          totalScrapes: 50,
          lastHealthCheck: new Date()
        }));

        return NextResponse.json({
          success: true,
          data: allHealth,
          message: `Retrieved health metrics for ${allHealth.length} sources`
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[Sources API] PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform action'
    }, { status: 500 });
  }
} 