import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/railway-database';

/**
 * GET /api/debug - Database connection and environment diagnostics
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_HOST: !!process.env.DATABASE_HOST,
      DATABASE_PORT: !!process.env.DATABASE_PORT,
      DATABASE_NAME: !!process.env.DATABASE_NAME,
      DATABASE_USER: !!process.env.DATABASE_USER,
      DATABASE_PASSWORD: !!process.env.DATABASE_PASSWORD,
      NODE_ENV: process.env.NODE_ENV
    };

    // Check database health
    const dbHealth = await checkDatabaseHealth();

    // Simple table count test
    let tableStats = {};
    try {
      const { query } = await import('@/lib/railway-database');
      const factoidsCount = await query('SELECT COUNT(*) as count FROM factoids');
      const tagsCount = await query('SELECT COUNT(*) as count FROM tags');
      const sourcesCount = await query('SELECT COUNT(*) as count FROM sources');
      
      tableStats = {
        factoids: factoidsCount.rows[0]?.count || 0,
        tags: tagsCount.rows[0]?.count || 0,
        sources: sourcesCount.rows[0]?.count || 0
      };
    } catch (error) {
      tableStats = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbHealth,
      tableStats
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Debug API failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 