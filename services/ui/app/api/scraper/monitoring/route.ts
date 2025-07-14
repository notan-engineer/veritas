import { NextRequest, NextResponse } from 'next/server';

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    healthy: boolean;
    responseTime: number;
    connectionPool: {
      total: number;
      active: number;
      idle: number;
    };
  };
  system: {
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    nodeVersion: string;
    platform: string;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    criticalErrors: number;
    lastError?: string;
    recentErrors: Array<{
      timestamp: string;
      level: string;
      message: string;
      category: string;
    }>;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    slowQueries: number;
    jobsCompleted: number;
    articlesProcessed: number;
  };
}

interface ErrorReport {
  timestamp: string;
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    category: string;
    severity: string;
    source: string;
  }>;
  recoveryAttempts: {
    successful: number;
    failed: number;
    rate: number;
  };
}

interface PerformanceMetrics {
  timestamp: string;
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    articlesPerMinute: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  database: {
    queryTime: number;
    connectionCount: number;
    slowQueries: number;
  };
}

// Mock data for development
const mockSystemHealth: SystemHealth = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: 86400, // 24 hours in seconds
  database: {
    healthy: true,
    responseTime: 12,
    connectionPool: {
      total: 10,
      active: 3,
      idle: 7
    }
  },
  system: {
    memoryUsage: {
      heapUsed: 45.2,
      heapTotal: 67.8,
      external: 12.3,
      rss: 89.5
    },
    cpuUsage: {
      user: 0.15,
      system: 0.08
    },
    nodeVersion: process.version,
    platform: process.platform
  },
  errors: {
    totalErrors: 23,
    errorRate: 0.02,
    criticalErrors: 1,
    lastError: 'Connection timeout to source',
    recentErrors: [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'warning',
        message: 'Source response slow',
        category: 'network'
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        category: 'database'
      }
    ]
  },
  performance: {
    avgResponseTime: 245,
    requestsPerMinute: 12,
    slowQueries: 2,
    jobsCompleted: 156,
    articlesProcessed: 1247
  }
};

const mockErrorReport: ErrorReport = {
  timestamp: new Date().toISOString(),
  totalErrors: 23,
  errorsByCategory: {
    'network': 12,
    'database': 5,
    'parsing': 3,
    'validation': 2,
    'timeout': 1
  },
  errorsBySeverity: {
    'low': 15,
    'medium': 6,
    'high': 2,
    'critical': 0
  },
  recentErrors: [
    {
      id: 'err-001',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'warning',
      message: 'Source response time exceeded threshold',
      category: 'network',
      severity: 'medium',
      source: 'cnn'
    },
    {
      id: 'err-002',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'error',
      message: 'Failed to parse RSS feed',
      category: 'parsing',
      severity: 'high',
      source: 'bbc'
    }
  ],
  recoveryAttempts: {
    successful: 18,
    failed: 5,
    rate: 0.78
  }
};

const mockPerformanceMetrics: PerformanceMetrics = {
  timestamp: new Date().toISOString(),
  responseTime: {
    avg: 245,
    min: 89,
    max: 1250,
    p95: 567
  },
  throughput: {
    requestsPerSecond: 0.2,
    requestsPerMinute: 12,
    articlesPerMinute: 3.5
  },
  resources: {
    memoryUsage: 67.8,
    cpuUsage: 23.4,
    diskUsage: 156.7,
    networkLatency: 45
  },
  database: {
    queryTime: 12,
    connectionCount: 8,
    slowQueries: 2
  }
};

/**
 * GET /api/scraper/monitoring
 * Main monitoring endpoint - returns system health overview
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SystemHealth>>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'health';

    // Try to get data from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      
      let endpoint = '/health';
      if (type === 'errors') endpoint = '/api/monitoring/errors';
      else if (type === 'performance') endpoint = '/api/monitoring/performance';
      else if (type === 'services') endpoint = '/api/monitoring/services';
      
      const response = await fetch(`${scraperServiceUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const scraperData = await response.json();
        
        // Transform scraper service data to our format
        if (type === 'health') {
          return NextResponse.json({
            success: true,
            data: scraperData,
            message: 'System health retrieved from scraper service'
          });
        } else if (type === 'errors') {
          return NextResponse.json({
            success: true,
            data: scraperData,
            message: 'Error report retrieved from scraper service'
          });
        } else if (type === 'performance') {
          return NextResponse.json({
            success: true,
            data: scraperData,
            message: 'Performance metrics retrieved from scraper service'
          });
        }
      }
    } catch (error) {
      console.log('Scraper service unavailable, using mock data');
    }

    // Return mock data based on type
    let mockData: any = mockSystemHealth;
    if (type === 'errors') mockData = mockErrorReport;
    else if (type === 'performance') mockData = mockPerformanceMetrics;

    // Update timestamp for all mock data
    mockData.timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: mockData,
      message: `Mock ${type} data returned`
    });

  } catch (error) {
    console.error('[Monitoring API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve monitoring data'
    }, { status: 500 });
  }
}

/**
 * POST /api/scraper/monitoring
 * Monitoring actions (reset metrics, clear errors, etc.)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Try to perform action on scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${scraperServiceUrl}/api/monitoring/recovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          data: result,
          message: `Action ${action} completed via scraper service`
        });
      }
    } catch (error) {
      console.log('Scraper service unavailable, using mock response');
    }

    // Handle actions with mock responses
    switch (action) {
      case 'reset-metrics':
        return NextResponse.json({
          success: true,
          data: { reset: true },
          message: 'Metrics reset successfully (mock)'
        });

      case 'clear-errors':
        return NextResponse.json({
          success: true,
          data: { cleared: true },
          message: 'Errors cleared successfully (mock)'
        });

      case 'restart-service':
        return NextResponse.json({
          success: true,
          data: { restarted: true },
          message: 'Service restart initiated (mock)'
        });

      case 'health-check':
        return NextResponse.json({
          success: true,
          data: mockSystemHealth,
          message: 'Health check completed (mock)'
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[Monitoring API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform monitoring action'
    }, { status: 500 });
  }
} 