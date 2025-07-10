import { NextRequest, NextResponse } from 'next/server';
import { postgresClient } from '@/lib/postgres-client';
import { getDatabaseProvider } from '@/lib/database-config';
import { validateFactoid } from '@/lib/railway-validators';
import { FACTOID_BY_ID_QUERY, QueryParams } from '@/lib/railway-queries';

/**
 * GET /api/railway/factoids/[id] - Get factoid by ID
 */
export async function GET(
  _request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    // Verify Railway provider
    if (getDatabaseProvider() !== 'railway') {
      return NextResponse.json(
        { error: 'Railway provider not configured' },
        { status: 503 }
      );
    }

    const params = await segmentData.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Factoid ID is required' },
        { status: 400 }
      );
    }

    // Use extracted query constant with type-safe parameters
    const queryParams = QueryParams.factoidById(id);
    const result = await postgresClient.query(FACTOID_BY_ID_QUERY, queryParams);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Factoid not found' },
        { status: 404 }
      );
    }

    // Use validation utility instead of unsafe type casting
    const factoid = validateFactoid(result.rows[0]);
    return NextResponse.json(factoid);
  } catch (error) {
    console.error('Railway API error - Get factoid by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch factoid' },
      { status: 500 }
    );
  }
} 