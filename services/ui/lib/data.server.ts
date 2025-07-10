import 'server-only';
import { railwayDb } from '@/lib/railway-database';
import type { Factoid } from './data-service';

/**
 * Get a specific factoid by ID directly from the database.
 * This function is intended for use in Server Components only.
 */
export async function getFactoidById(id: string): Promise<Factoid | null> {
  try {
    const result = await railwayDb.query(`
      SELECT f.*, 
             COALESCE(tags_agg.tags, '[]'::json) as tags,
             COALESCE(sources_agg.sources, '[]'::json) as sources
      FROM factoids f
      LEFT JOIN (
        SELECT ft.factoid_id, json_agg(t.*) as tags
        FROM factoid_tags ft JOIN tags t ON ft.tag_id = t.id
        WHERE t.is_active = true GROUP BY ft.factoid_id
      ) tags_agg ON f.id = tags_agg.factoid_id
      LEFT JOIN (
        SELECT fs.factoid_id, json_agg(s.*) as sources
        FROM factoid_sources fs JOIN sources s ON fs.source_id = s.id
        WHERE s.is_active = true GROUP BY fs.factoid_id
      ) sources_agg ON f.id = sources_agg.factoid_id
      WHERE f.id = $1 AND f.status = 'published'
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : [],
    } as Factoid;
  } catch (error) {
    console.error('❌ [DataService.server] Error fetching factoid by ID:', error);
    // Re-throwing the error is important for the Server Component to catch it.
    throw error;
  }
} 