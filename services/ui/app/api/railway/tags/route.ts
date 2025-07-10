import { NextResponse } from 'next/server';
import { postgresClient } from '@/lib/postgres-client';
import { getDatabaseProvider } from '@/lib/database-config';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
  confidence_score?: number;
}

/**
 * GET /api/railway/tags - Get all active tags
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

    const query = `
      SELECT * FROM tags 
      WHERE is_active = true 
      ORDER BY name
    `;
    
    const result = await postgresClient.query(query);
    const tags = result.rows as unknown as Tag[];

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Railway API error - Get all tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 