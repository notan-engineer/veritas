import { query } from './railway-database'

export interface Factoid {
  id: string
  title: string
  description: string
  bullet_points: string[]
  language: 'en' | 'he' | 'ar' | 'other'
  confidence_score: number
  status: 'draft' | 'published' | 'archived' | 'flagged'
  created_at: string
  updated_at: string
  tags: Tag[]
  sources: Source[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  level: number
  is_active: boolean
  confidence_score?: number
}

export interface Source {
  id: string
  name: string
  domain: string
  url: string
  description?: string
  icon_url?: string
  twitter_handle?: string
  profile_photo_url?: string
  is_active: boolean
  scraped_content?: {
    id: string
    source_url: string
    title?: string
    content?: string
    author?: string
    publication_date?: string
    content_type: string
    language: string
  }
  relevance_score?: number
}

export interface ScrapedContent {
  id: string
  source_id: string
  source_url: string
  title?: string
  content?: string
  author?: string
  publication_date?: string
  content_type: 'article' | 'social_post' | 'video' | 'other'
  language: 'en' | 'he' | 'ar' | 'other'
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

// Result types for better error handling
export interface ApiResult<T> {
  data: T
  error?: Error
}

export interface ApiArrayResult<T> {
  data: T[]
  error?: Error
}

export interface ApiNullableResult<T> {
  data: T | null
  error?: Error
}

// Get all published factoids with tags and sources
export async function getAllFactoids(): Promise<Factoid[]> {
  try {
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
      WHERE f.status = 'published'
      ORDER BY f.created_at DESC
    `);

    return result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));
  } catch (error) {
    console.error('Error fetching factoids:', error);
    return [];
  }
}

// Get factoids by tag
export async function getFactoidsByTag(tagSlug: string): Promise<Factoid[]> {
  try {
    const result = await query(`
      SELECT f.*, 
             COALESCE(tags_agg.tags, '[]'::json) as tags,
             COALESCE(sources_agg.sources, '[]'::json) as sources
      FROM factoids f
      JOIN factoid_tags ft ON f.id = ft.factoid_id
      JOIN tags tag_filter ON ft.tag_id = tag_filter.id
      LEFT JOIN (
        SELECT ft2.factoid_id,
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'name', t.name,
                   'slug', t.slug,
                   'description', t.description,
                   'parent_id', t.parent_id,
                   'level', t.level,
                   'is_active', t.is_active,
                   'confidence_score', ft2.confidence_score
                 )
               ) as tags
        FROM factoid_tags ft2
        JOIN tags t ON ft2.tag_id = t.id
        WHERE t.is_active = true
        GROUP BY ft2.factoid_id
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
        AND tag_filter.slug = $1 
        AND tag_filter.is_active = true
      ORDER BY f.created_at DESC
    `, [tagSlug]);

    return result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));
  } catch (error) {
    console.error('Error fetching factoids by tag:', error);
    return [];
  }
}

// Get factoid by ID
export async function getFactoidById(id: string): Promise<Factoid | null> {
  try {
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
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    };
  } catch (error) {
    console.error('Error fetching factoid by ID:', error);
    return null;
  }
}

// Get factoids by language
export async function getFactoidsByLanguage(language: 'en' | 'he' | 'ar' | 'other'): Promise<Factoid[]> {
  try {
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
      WHERE f.language = $1 AND f.status = 'published'
      ORDER BY f.created_at DESC
    `, [language]);

    return result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));
  } catch (error) {
    console.error('Error fetching factoids by language:', error);
    return [];
  }
}

// Search factoids using text search
export async function searchFactoids(queryText: string): Promise<Factoid[]> {
  if (!queryText.trim()) {
    return [];
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

    return result.rows.map(row => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
      sources: Array.isArray(row.sources) ? row.sources : []
    }));
  } catch (error) {
    console.error('Error searching factoids:', error);
    return [];
  }
}

// Get all active tags
export async function getAllTags(): Promise<Tag[]> {
  try {
    const result = await query(`
      SELECT * FROM tags 
      WHERE is_active = true 
      ORDER BY level ASC, name ASC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Get tags by level
export async function getTagsByLevel(level: number): Promise<Tag[]> {
  try {
    const result = await query(`
      SELECT * FROM tags 
      WHERE level = $1 AND is_active = true 
      ORDER BY name ASC
    `, [level]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching tags by level:', error);
    return [];
  }
}

// Get child tags for a parent
export async function getChildTags(parentId: string): Promise<Tag[]> {
  try {
    const result = await query(`
      SELECT * FROM tags 
      WHERE parent_id = $1 AND is_active = true 
      ORDER BY name ASC
    `, [parentId]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching child tags:', error);
    return [];
  }
}

// Get all active sources
export async function getAllSources(): Promise<Source[]> {
  try {
    const result = await query(`
      SELECT * FROM sources 
      WHERE is_active = true 
      ORDER BY name ASC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
}

// Enhanced error handling versions

export async function getAllFactoidsWithErrors(): Promise<ApiArrayResult<Factoid>> {
  try {
    const data = await getAllFactoids()
    return { data }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

export async function getFactoidByIdWithErrors(id: string): Promise<ApiNullableResult<Factoid>> {
  try {
    const data = await getFactoidById(id)
    return { data }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function searchFactoidsWithErrors(queryText: string): Promise<ApiArrayResult<Factoid>> {
  try {
    const data = await searchFactoids(queryText)
    return { data }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

export async function getAllTagsWithErrors(): Promise<ApiArrayResult<Tag>> {
  try {
    const data = await getAllTags()
    return { data }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

export async function getFactoidsByTagWithErrors(tagSlug: string): Promise<ApiArrayResult<Factoid>> {
  try {
    const data = await getFactoidsByTag(tagSlug)
    return { data }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

 