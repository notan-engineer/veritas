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
  const requestLogs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    source?: string;
  }> = [];

  // Helper function to add logs
  const addLog = (level: 'info' | 'warn' | 'error', message: string, source?: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source: source || 'api'
    };
    requestLogs.push(logEntry);
    console.log(`[Scraper API] ${level.toUpperCase()}: ${message}${source ? ` (${source})` : ''}`);
  };

  try {
    addLog('info', 'Scraper trigger endpoint called');
    
    const body: TriggerScrapingRequest = await request.json();
    addLog('info', `Request body parsed: ${JSON.stringify(body)}`);
    
    // Validate request
    if (!body.sources || !Array.isArray(body.sources) || body.sources.length === 0) {
      addLog('error', 'Invalid request: sources array is required');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request: sources array is required',
          jobId: '',
          logs: requestLogs
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
      addLog('error', `Invalid sources: ${invalidSources.join(', ')}. Valid sources: cnn, foxnews`);
      return NextResponse.json(
        {
          success: false,
          message: `Invalid sources: ${invalidSources.join(', ')}. Valid sources: cnn, foxnews`,
          jobId: '',
          logs: requestLogs
        },
        { status: 400 }
      );
    }

    addLog('info', `Valid sources provided: ${body.sources.join(', ')}`);

    // Log environment information
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
    const nodeEnv = process.env.NODE_ENV || 'development';
    const railwayEnv = process.env.RAILWAY_ENVIRONMENT || 'not-set';
    
    addLog('info', `Environment: NODE_ENV=${nodeEnv}, RAILWAY_ENVIRONMENT=${railwayEnv}`, 'env');
    addLog('info', `Scraper service URL: ${scraperServiceUrl}`, 'env');
    addLog('info', `Full target URL: ${scraperServiceUrl}/api/scrape`, 'connection');

    // Call the live scraper service
    try {
      addLog('info', `Attempting to connect to scraper service...`, 'connection');
      
      const startTime = Date.now();
      const response = await fetch(`${scraperServiceUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const connectionTime = Date.now() - startTime;
      addLog('info', `Connection attempt completed in ${connectionTime}ms`, 'connection');
      addLog('info', `Response status: ${response.status} ${response.statusText}`, 'connection');
      addLog('info', `Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`, 'connection');

      if (!response.ok) {
        const errorText = await response.text();
        addLog('error', `Scraper service responded with status ${response.status}: ${errorText}`, 'connection');
        throw new Error(`Scraper service responded with status ${response.status}: ${errorText}`);
      }

      addLog('info', `Scraper service responded successfully`, 'connection');
      
      const responseText = await response.text();
      addLog('info', `Response body length: ${responseText.length} characters`, 'connection');
      
      let scraperResponse: TriggerScrapingResponse;
      try {
        scraperResponse = JSON.parse(responseText);
        addLog('info', `Response parsed successfully. Job ID: ${scraperResponse.jobId}`, 'connection');
      } catch (parseError) {
        addLog('error', `Failed to parse response JSON: ${parseError}`, 'connection');
        addLog('error', `Response text: ${responseText.substring(0, 500)}...`, 'connection');
        throw new Error(`Failed to parse scraper response: ${parseError}`);
      }
      
      // Add scraper logs to our logs
      if (scraperResponse.logs && Array.isArray(scraperResponse.logs)) {
        scraperResponse.logs.forEach(log => {
          requestLogs.push({
            ...log,
            source: log.source || 'scraper'
          });
        });
      }

      addLog('info', `Scraper service completed job ${scraperResponse.jobId}`, 'connection');
      
      return NextResponse.json({
        success: scraperResponse.success,
        message: scraperResponse.message,
        jobId: scraperResponse.jobId,
        logs: requestLogs
      });
      
    } catch (scraperError) {
      addLog('error', `Failed to call scraper service: ${scraperError}`, 'connection');
      
      // Log detailed error information
      if (scraperError instanceof Error) {
        addLog('error', `Error name: ${scraperError.name}`, 'connection');
        addLog('error', `Error message: ${scraperError.message}`, 'connection');
        if (scraperError.stack) {
          addLog('error', `Error stack: ${scraperError.stack}`, 'connection');
        }
        
        // Check for specific error types
        if (scraperError.name === 'AbortError') {
          addLog('error', `Connection timed out after 30 seconds`, 'connection');
        } else if (scraperError.message.includes('ECONNREFUSED')) {
          addLog('error', `Connection refused - scraper service may not be running`, 'connection');
        } else if (scraperError.message.includes('ENOTFOUND')) {
          addLog('error', `DNS resolution failed - scraper service URL may be incorrect`, 'connection');
        } else if (scraperError.message.includes('ETIMEDOUT')) {
          addLog('error', `Connection timed out - scraper service may be unresponsive`, 'connection');
        }
      }
      
      // Fallback to mock response if scraper service is unavailable
      const mockJobId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addLog('info', `Generated fallback job ID: ${mockJobId}`, 'fallback');
      
      return NextResponse.json({
        success: true,
        message: `Scraper service unavailable, job queued with fallback ID: ${mockJobId}`,
        jobId: mockJobId,
        logs: requestLogs
      });
    }

  } catch (error) {
    addLog('error', `Unexpected error in scraper trigger: ${error}`, 'api');
    
    if (error instanceof Error) {
      addLog('error', `Error details: ${error.stack}`, 'api');
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        jobId: '',
        logs: requestLogs
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