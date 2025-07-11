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

    // Call the live scraper service
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
    
    try {
      console.log(`[Scraper API] Calling scraper service at ${scraperServiceUrl}`);
      
      const response = await fetch(`${scraperServiceUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Scraper service responded with status ${response.status}`);
      }

      const scraperResponse: TriggerScrapingResponse = await response.json();
      
      console.log(`[Scraper API] Scraper service completed job ${scraperResponse.jobId}`);
      
      return NextResponse.json(scraperResponse);
      
    } catch (scraperError) {
      console.error('[Scraper API] Failed to call scraper service:', scraperError);
      
      // Fallback to mock response if scraper service is unavailable
      const mockJobId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        success: false,
        message: `Scraper service unavailable: ${scraperError instanceof Error ? scraperError.message : 'Unknown error'}. Using fallback mode.`,
        jobId: mockJobId,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Failed to connect to scraper service',
            source: 'api'
          },
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Requested sources: ${body.sources.join(', ')}`,
            source: 'fallback'
          }
        ]
      });
    }

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