import { NextResponse } from 'next/server';
import { query } from '@/lib/railway-database';
import { mockTags } from '@/lib/mock-data';

/**
 * GET /api/tags - Get all active tags
 * Falls back to mock data if database is unavailable
 */
export async function GET(): Promise<NextResponse> {
  try {
    const result = await query(`
      SELECT * FROM tags 
      WHERE is_active = true 
      ORDER BY name ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error - falling back to mock data:', error);
    
    // Return mock data as fallback
    console.log('⚠️ [API] Database unavailable, returning mock tags');
    return NextResponse.json(mockTags);
  }
} 