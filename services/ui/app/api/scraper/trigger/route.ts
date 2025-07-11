import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to trigger content scraping
 * POST /api/scraper/trigger
 */

interface TriggerScrapingRequest {
  sources: string[];
  maxArticles?: number;
}

interface TriggerScrapingResponse {
  success: boolean;
  message: string;
  jobId: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    source?: string;
  }>;
}

export async function POST(request: NextRequest): Promise<NextResponse<TriggerScrapingResponse>> {
  try {
    const body: TriggerScrapingRequest = await request.json();
    
    // Validate request
    if (!body.sources || !Array.isArray(body.sources) || body.sources.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request: sources array is required',
          jobId: '',
          logs: []
        },
        { status: 400 }
      );
    }

    // Validate source names
    const validSources = ['cnn', 'foxnews', 'fox'];
    const invalidSources = body.sources.filter(source => 
      !validSources.some(valid => source.toLowerCase().includes(valid.toLowerCase()))
    );

    if (invalidSources.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid sources: ${invalidSources.join(', ')}. Valid sources: cnn, foxnews`,
          jobId: '',
          logs: []
        },
        { status: 400 }
      );
    }

    // For now, simulate scraping trigger (will be replaced with actual scraper service call)
    const mockJobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: 'Scraping job initiated',
        source: 'api'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: `Processing ${body.sources.length} source(s): ${body.sources.join(', ')}`
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: `Max articles per source: ${body.maxArticles || 3}`
      }
    ];

    // TODO: Replace with actual scraper service integration
    // This is a proof of concept response
    console.log(`[Scraper API] Mock scraping triggered for sources: ${body.sources.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: 'Scraping initiated successfully (mock mode)',
      jobId: mockJobId,
      logs: mockLogs
    });

  } catch (error) {
    console.error('[Scraper API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        jobId: '',
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }]
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger scraping.' },
    { status: 405 }
  );
} 