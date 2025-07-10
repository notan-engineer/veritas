/**
 * Data Service - Client for accessing factoid data
 * 
 * This service provides a unified interface for accessing factoid data
 * through API routes that use Railway PostgreSQL database.
 */

// Type definitions
export interface Factoid {
  id: string;
  title: string;
  description: string;
  bullet_points: string[];
  language: 'en' | 'he' | 'ar' | 'other';
  confidence_score: number;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  created_at: string;
  updated_at: string;
  tags: Tag[];
  sources: Source[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
  confidence_score?: number;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  url: string;
  description?: string;
  icon_url?: string;
  twitter_handle?: string;
  profile_photo_url?: string;
  is_active: boolean;
  scraped_content?: {
    id: string;
    source_url: string;
    title?: string;
    content?: string;
    author?: string;
    publication_date?: string;
    content_type: string;
    language: string;
  };
  relevance_score?: number;
}

/**
 * Check if we're running on the server-side
 */
function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get all published factoids with their tags and sources
 */
export async function getAllFactoids(): Promise<Factoid[]> {
  if (isServerSide()) {
    // Server-side: directly query the database
    try {
      // Use require() to avoid webpack bundling
      const railwayDb = eval('require')('./railway-database');
      const result = await railwayDb.query(`
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
        WHERE f.status = 'published'
        ORDER BY f.created_at DESC
      `);

      return result.rows.map((row: Record<string, unknown>) => ({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        sources: Array.isArray(row.sources) ? row.sources : []
      }));
    } catch (error) {
      console.error('Error fetching factoids (server-side):', error);
      throw new Error('Failed to fetch factoids');
    }
  } else {
    // Client-side: use API route
    try {
      const response = await fetch('/api/factoids', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching factoids (client-side):', error);
      throw new Error('Failed to fetch factoids');
    }
  }
}

/**
 * Get a specific factoid by ID
 */
export async function getFactoidById(id: string): Promise<Factoid | null> {
  if (isServerSide()) {
    // Server-side: directly query the database
    try {
      // Use require() to avoid webpack bundling
      const railwayDb = eval('require')('./railway-database');
      const result = await railwayDb.query(`
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
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        sources: Array.isArray(row.sources) ? row.sources : []
      };
    } catch (error) {
      console.error('Error fetching factoid (server-side):', error);
      throw new Error('Failed to fetch factoid');
    }
  } else {
    // Client-side: use API route
    try {
      const response = await fetch(`/api/factoids/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching factoid (client-side):', error);
      throw new Error('Failed to fetch factoid');
    }
  }
}

/**
 * Get all active tags
 */
export async function getAllTags(): Promise<Tag[]> {
  if (isServerSide()) {
    // Server-side: directly query the database
    try {
      // Use require() to avoid webpack bundling
      const railwayDb = eval('require')('./railway-database');
      const result = await railwayDb.query(`
        SELECT * FROM tags 
        WHERE is_active = true 
        ORDER BY level ASC, name ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error fetching tags (server-side):', error);
      throw new Error('Failed to fetch tags');
    }
  } else {
    // Client-side: use API route
    try {
      const response = await fetch('/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching tags (client-side):', error);
      throw new Error('Failed to fetch tags');
    }
  }
}

/**
 * Search factoids by query
 */
export async function searchFactoids(query: string): Promise<Factoid[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    if (isServerSide()) {
      // Server-side: directly query the database
      const railwayDb = eval('require')('./railway-database');
      const result = await railwayDb.query(`
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
      `, [query, `%${query}%`]);

      return result.rows.map((row: Record<string, unknown>) => ({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        sources: Array.isArray(row.sources) ? row.sources : []
      }));
    } else {
      // Client-side: use API route
      const response = await fetch(`/api/factoids/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }
  } catch (error) {
    console.error('Error searching factoids:', error);
    throw new Error('Failed to search factoids');
  }
}

/**
 * Get factoids by tag
 */
export async function getFactoidsByTag(tagId: string): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    return factoids.filter(factoid => 
      factoid.tags.some((tag: Tag) => tag.id === tagId)
    );
  } catch (error) {
    console.error('Error fetching factoids by tag:', error);
    throw new Error('Failed to fetch factoids by tag');
  }
}

/**
 * Get factoids by source
 */
export async function getFactoidsBySource(sourceId: string): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    return factoids.filter(factoid => 
      factoid.sources.some((source: Source) => source.id === sourceId)
    );
  } catch (error) {
    console.error('Error fetching factoids by source:', error);
    throw new Error('Failed to fetch factoids by source');
  }
}

/**
 * Get all unique sources from factoids
 */
export async function getAllSources(): Promise<Source[]> {
  try {
    const factoids = await getAllFactoids();
    const sourceMap = new Map<string, Source>();
    
    factoids.forEach(factoid => {
      factoid.sources.forEach((source: Source) => {
        sourceMap.set(source.id, source);
      });
    });
    
    return Array.from(sourceMap.values());
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw new Error('Failed to fetch sources');
  }
}

/**
 * Get factoids by language
 */
export async function getFactoidsByLanguage(language: string): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    return factoids.filter(factoid => factoid.language === language);
  } catch (error) {
    console.error('Error fetching factoids by language:', error);
    throw new Error('Failed to fetch factoids by language');
  }
}

/**
 * Get recent factoids (last 7 days)
 */
export async function getRecentFactoids(): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return factoids.filter(factoid => 
      new Date(factoid.created_at) > sevenDaysAgo
    );
  } catch (error) {
    console.error('Error fetching recent factoids:', error);
    throw new Error('Failed to fetch recent factoids');
  }
}

/**
 * Get factoids by confidence score threshold
 */
export async function getFactoidsByConfidence(minConfidence: number): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    return factoids.filter(factoid => 
      factoid.confidence_score >= minConfidence
    );
  } catch (error) {
    console.error('Error fetching factoids by confidence:', error);
    throw new Error('Failed to fetch factoids by confidence');
  }
}

/**
 * Get database provider information
 */
export async function getDatabaseProvider(): Promise<string> {
  return 'railway';
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    if (isServerSide()) {
      // Server-side: directly test database connection
      const railwayDb = eval('require')('./railway-database');
      const health = await railwayDb.checkDatabaseHealth();
      return health.connected;
    } else {
      // Client-side: test via API route
      const response = await fetch('/api/factoids', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      return response.ok;
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

 