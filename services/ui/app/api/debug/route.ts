import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/railway-database';

/**
 * GET /api/debug - System health check and debugging information
 * Provides comprehensive system status for troubleshooting
 */
export async function GET(): Promise<NextResponse> {
  try {
    const systemInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        provider: 'railway',
        url_configured: !!process.env.DATABASE_URL,
        url_preview: process.env.DATABASE_URL ? 
          `${process.env.DATABASE_URL.substring(0, 20)}...` : 'Not set'
      },
      deployment: {
        port: process.env.PORT || 'Not set',
        platform: process.platform,
        node_version: process.version,
        railway_env: !!process.env.RAILWAY_ENVIRONMENT,
        railway_project: process.env.RAILWAY_PROJECT_NAME || 'Not set'
      }
    };

    // Test database connection
    const dbHealth = await checkDatabaseHealth();
    systemInfo.database = { ...systemInfo.database, ...dbHealth };

    return NextResponse.json({
      status: 'healthy',
      message: 'Veritas API is running',
      system: systemInfo
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'System check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      system: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          provider: 'railway',
          url_configured: !!process.env.DATABASE_URL,
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { status: 500 });
  }
} 