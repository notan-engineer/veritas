/**
 * Data Service - Client for accessing factoid data
 * 
 * This service provides a unified interface for accessing factoid data.
 * - On the server, it calls database functions directly.
 * - On the client, it uses fetch to call API routes.
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

function isServerSide(): boolean {
  return typeof window === 'undefined';
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error: ${response.status} ${response.statusText}`, {
      url: response.url,
      body: errorBody,
    });
    const errorJson = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorJson.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Get a specific factoid by ID.
 * On the server, this function bypasses the API route and queries the database directly.
 */
export async function getFactoidById(id: string): Promise<Factoid | null> {
  if (isServerSide()) {
    try {
      // This require is safe because the 'server-only' package in railway-database
      // will prevent this module from ever being bundled for the client.
      const db = require('@/lib/railway-database');
      const result = await db.query(`
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
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        sources: Array.isArray(row.sources) ? row.sources : [],
      };
    } catch (error) {
      console.error('❌ [DataService] Error fetching factoid by ID (server-side):', error);
      throw error;
    }
  }

  // On the client, fetch from the API route
  const response = await fetch(`/api/factoids/${id}`);
  if (response.status === 404) return null;
  return handleApiResponse<Factoid>(response);
}

/**
 * These functions are called from client components and MUST use fetch.
 */
export async function getAllFactoids(): Promise<Factoid[]> {
    console.log('[DataService] getAllFactoids: Running on client. Fetching from API.');
    const response = await fetch('/api/factoids');
    return handleApiResponse<Factoid[]>(response);
}

export async function getAllTags(): Promise<Tag[]> {
    console.log('[DataService] getAllTags: Running on client. Fetching from API.');
    const response = await fetch('/api/tags');
    return handleApiResponse<Tag[]>(response);
}

export async function searchFactoids(query: string): Promise<Factoid[]> {
    if (!query.trim()) return [];
    const response = await fetch(`/api/factoids/search?q=${encodeURIComponent(query)}`);
    return handleApiResponse<Factoid[]>(response);
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
  } catch (error)
 {
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
    const response = await fetch('/api/factoids');
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

 