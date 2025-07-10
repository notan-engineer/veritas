import { NextResponse } from 'next/server';
import { postgresClient } from '@/lib/postgres-client';
import { getDatabaseProvider } from '@/lib/database-config';
import { validateFactoids } from '@/lib/railway-validators';
import { ALL_FACTOIDS_QUERY, QueryParams } from '@/lib/railway-queries';

/**
 * GET /api/railway/factoids - Get all published factoids
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Verify Railway provider
    if (getDatabaseProvider() !== 'railway') {
      return NextResponse.json(
        { error: 'Railway provider not configured' },
        { status: 503 }
      );
    }

    // Use extracted query constant with type-safe parameters
    const queryParams = QueryParams.allPublished();
    const result = await postgresClient.query(ALL_FACTOIDS_QUERY, queryParams);
    
    // Use validation utility instead of unsafe type casting
    const factoids = validateFactoids(result.rows);

    return NextResponse.json(factoids);
  } catch (error) {
    console.error('Railway API error - Get all factoids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch factoids' },
      { status: 500 }
    );
  }
} 