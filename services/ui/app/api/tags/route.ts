import { NextResponse } from 'next/server';
import { query } from '@/lib/railway-database';

/**
 * GET /api/tags - Get all active tags
 */
export async function GET(): Promise<NextResponse> {
  try {
    const result = await query(`
      SELECT * FROM tags 
      WHERE is_active = true 
      ORDER BY level ASC, name ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('API error - Get all tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 