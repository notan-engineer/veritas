import { NextResponse } from 'next/server';
import { query } from '@/lib/railway-database';

/**
 * GET /api/factoids/[id] - Get factoid by ID with tags and sources
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const result = await query(`
      SELECT f.*, 
             COALESCE(tags_agg.tags, '[]'::json) as tags,
             COALESCE(sources_agg.sources, '[]'::json) as sources
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
      WHERE f.id = $1 AND f.status = 'published'
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Factoid not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const factoid = {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    };

    return NextResponse.json(factoid);
  } catch (error) {
    console.error('API error - Get factoid by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch factoid' },
      { status: 500 }
    );
  }
} 