import { NextResponse } from 'next/server';
import { query } from '@/lib/railway-database';
import { mockFactoids } from '@/lib/mock-data';

/**
 * GET /api/factoids/search?q=query - Search factoids
 * Falls back to mock data if database is unavailable
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q');

  if (!queryText || !queryText.trim()) {
    return NextResponse.json([]);
  }

  try {
    const result = await query(`
      SELECT f.*, 
             COALESCE(tags_agg.tags, '[]'::json) as tags,
             COALESCE(sources_agg.sources, '[]'::json) as sources,
             ts_rank(f.search_vector, websearch_to_tsquery('english', $1)) as rank
      FROM factoids f
      LEFT JOIN (
        SELECT ft.factoid_id,
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'slug', t.slug,
                   'description', t.description,
                   'parent_id', t.parent_id,
                   'level', t.level,
                   'is_active', t.is_active,
                   'confidence_score', ft.confidence_score
                 )
               ) as tags
        FROM factoid_tags ft
        JOIN tags t ON ft.tag_id = t.id
        WHERE t.is_active = true
        GROUP BY ft.factoid_id
      ) tags_agg ON f.id = tags_agg.factoid_id
      LEFT JOIN (
        SELECT fs.factoid_id,
               json_agg(
                 json_build_object(
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
                   'scraped_content', json_build_object(
                     'id', sc.id,
                     'source_url', sc.source_url,
                     'title', sc.title,
                     'content', sc.content,
                     'author', sc.author,
                     'publication_date', sc.publication_date,
                     'content_type', sc.content_type,
                     'language', sc.language
                   )
                 )
               ) as sources
        FROM factoid_sources fs
        JOIN scraped_content sc ON fs.scraped_content_id = sc.id
        JOIN sources s ON sc.source_id = s.id
        WHERE s.is_active = true
        GROUP BY fs.factoid_id
      ) sources_agg ON f.id = sources_agg.factoid_id
      WHERE f.status = 'published' 
        AND (
          f.search_vector @@ websearch_to_tsquery('english', $1)
          OR f.title ILIKE $2
          OR f.description ILIKE $2
        )
      ORDER BY rank DESC, f.created_at DESC
    `, [queryText, `%${queryText}%`]);

    const factoids = result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));

    return NextResponse.json(factoids);
  } catch (error) {
    console.error('Database error - falling back to mock data search:', error);
    
    // Return mock data as fallback with simple text search
    console.log('⚠️ [API] Database unavailable, searching mock data for:', queryText);
    
    const searchLower = queryText.toLowerCase();
    const filteredFactoids = mockFactoids.filter(factoid =>
      factoid.title.toLowerCase().includes(searchLower) ||
      factoid.description.toLowerCase().includes(searchLower) ||
      factoid.bullet_points.some(point => point.toLowerCase().includes(searchLower)) ||
      factoid.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
    );
    
    return NextResponse.json(filteredFactoids);
  }
} 