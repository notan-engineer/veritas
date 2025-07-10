import { NextRequest, NextResponse } from 'next/server';
import { postgresClient } from '@/lib/postgres-client';
import { getDatabaseProvider } from '@/lib/database-config';

interface Factoid {
  id: string;
  title: string;
  description: string;
  bullet_points: string[];
  language: 'en' | 'he' | 'ar' | 'other';
  confidence_score: number;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  created_at: string;
  updated_at: string;
  tags: unknown[];
  sources: unknown[];
}

/**
 * Process factoid row from Railway PostgreSQL (handles JSON aggregations)
 */
function processFactoidRow(row: unknown): Factoid {
  const factoidRow = row as Factoid;
  
  return {
    id: factoidRow.id,
    title: factoidRow.title,
    description: factoidRow.description,
    bullet_points: factoidRow.bullet_points,
    language: factoidRow.language,
    confidence_score: factoidRow.confidence_score,
    status: factoidRow.status,
    created_at: factoidRow.created_at,
    updated_at: factoidRow.updated_at,
    tags: Array.isArray(factoidRow.tags) ? factoidRow.tags : [],
    sources: Array.isArray(factoidRow.sources) ? factoidRow.sources : []
  };
}

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

    if (!searchQuery || searchQuery.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT f.*, 
             COALESCE(json_agg(DISTINCT jsonb_build_object(
               'id', t.id,
               'name', t.name,
               'slug', t.slug,
               'description', t.description,
               'parent_id', t.parent_id,
               'level', t.level,
               'is_active', t.is_active,
               'confidence_score', ft.confidence_score
             )) FILTER (WHERE t.id IS NOT NULL), '[]') as tags,
             COALESCE(json_agg(DISTINCT jsonb_build_object(
               'id', s.id,
               'name', s.name,
               'domain', s.domain,
               'url', s.url,
               'description', s.description,
               'icon_url', s.icon_url,
               'twitter_handle', s.twitter_handle,
               'profile_photo_url', s.profile_photo_url,
               'is_active', s.is_active,
               'relevance_score', fs.relevance_score,
               'scraped_content', jsonb_build_object(
                 'id', sc.id,
                 'source_url', sc.source_url,
                 'title', sc.title,
                 'content', sc.content,
                 'author', sc.author,
                 'publication_date', sc.publication_date,
                 'content_type', sc.content_type,
                 'language', sc.language
               )
             )) FILTER (WHERE s.id IS NOT NULL), '[]') as sources
      FROM factoids f
      LEFT JOIN factoid_tags ft ON f.id = ft.factoid_id
      LEFT JOIN tags t ON ft.tag_id = t.id
      LEFT JOIN factoid_sources fs ON f.id = fs.factoid_id
      LEFT JOIN scraped_content sc ON fs.scraped_content_id = sc.id
      LEFT JOIN sources s ON sc.source_id = s.id
      WHERE f.status = $1 
        AND (f.search_vector @@ websearch_to_tsquery('english', $2)
             OR f.title ILIKE $3 
             OR f.description ILIKE $3)
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `;
    
    const likePattern = `%${searchQuery}%`;
    const result = await postgresClient.query(query, ['published', searchQuery, likePattern]);
    const factoids = result.rows.map(processFactoidRow);

    return NextResponse.json(factoids);
  } catch (error) {
    console.error('Railway API error - Search factoids:', error);
    return NextResponse.json(
      { error: 'Failed to search factoids' },
      { status: 500 }
    );
  }
} 