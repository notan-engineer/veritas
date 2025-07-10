import { NextRequest, NextResponse } from 'next/server';
import { postgresClient } from '@/lib/postgres-client';
import { getDatabaseProvider } from '@/lib/database-config';
import { validateFactoids } from '@/lib/railway-validators';
import { SEARCH_FACTOIDS_QUERY, QueryParams } from '@/lib/railway-queries';
import { validateSearchQuery, checkSearchRateLimit } from '@/lib/input-validation';

/**
 * GET /api/railway/factoids/search?q=query - Search factoids with full-text search
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify Railway provider
    if (getDatabaseProvider() !== 'railway') {
      return NextResponse.json(
        { error: 'Railway provider not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');

    // Enhanced search query validation
    const validation = validateSearchQuery(searchQuery);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Optional: Rate limiting (use client IP or user ID in production)
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkSearchRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many search requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Use the sanitized query for the search
    const sanitizedQuery = validation.sanitizedQuery!;
    
    // Use extracted query constant with type-safe parameters
    const queryParams = QueryParams.searchPublished(sanitizedQuery);
    const result = await postgresClient.query(SEARCH_FACTOIDS_QUERY, queryParams);
    
    // Use validation utility instead of unsafe type casting
    const factoids = validateFactoids(result.rows);

    return NextResponse.json(factoids);
  } catch (error) {
    console.error('Railway API error - Search factoids:', error);
    return NextResponse.json(
      { error: 'Failed to search factoids' },
      { status: 500 }
    );
  }
} 