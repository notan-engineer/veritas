/**
 * Railway PostgreSQL Query Constants
 * 
 * Centralized SQL queries for Railway API endpoints to improve maintainability,
 * testing, and code organization. All queries include comprehensive joins for
 * tags and sources with proper JSON aggregation.
 */

/**
 * Base SELECT and JOIN clauses for factoids with tags and sources
 * This common structure is used across all factoid queries
 */
const FACTOID_BASE_SELECT = `
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
  LEFT JOIN sources s ON sc.source_id = s.id`;

/**
 * Query to get a single factoid by ID
 * Parameters: [id: string, status: string]
 */
export const FACTOID_BY_ID_QUERY = `${FACTOID_BASE_SELECT}
  WHERE f.id = $1 AND f.status = $2
  GROUP BY f.id`;

/**
 * Query to get all published factoids
 * Parameters: [status: string]
 */
export const ALL_FACTOIDS_QUERY = `${FACTOID_BASE_SELECT}
  WHERE f.status = $1
  GROUP BY f.id
  ORDER BY f.created_at DESC`;

/**
 * Query to search factoids with full-text search
 * Parameters: [status: string, searchQuery: string, likePattern: string]
 */
export const SEARCH_FACTOIDS_QUERY = `${FACTOID_BASE_SELECT}
  WHERE f.status = $1 
    AND (f.search_vector @@ websearch_to_tsquery('english', $2)
         OR f.title ILIKE $3 
         OR f.description ILIKE $3)
  GROUP BY f.id
  ORDER BY f.created_at DESC`;

/**
 * Query to get factoids by language
 * Parameters: [status: string, language: string]
 */
export const FACTOIDS_BY_LANGUAGE_QUERY = `${FACTOID_BASE_SELECT}
  WHERE f.status = $1 AND f.language = $2
  GROUP BY f.id
  ORDER BY f.created_at DESC`;

/**
 * Query to get factoids by tag slug
 * This query joins through the tag system to find factoids with a specific tag
 * Parameters: [status: string, tagSlug: string]
 * 
 * Performance Optimization:
 * For large datasets, ensure these indexes exist for optimal performance:
 * - CREATE INDEX idx_factoid_tags_factoid_id ON factoid_tags(factoid_id);
 * - CREATE INDEX idx_factoid_tags_tag_id ON factoid_tags(tag_id);
 * - CREATE INDEX idx_tags_slug ON tags(slug);
 * - CREATE INDEX idx_factoids_status_created_at ON factoids(status, created_at DESC);
 * 
 * Note: The base query uses LEFT JOINs for tags/sources aggregation while this
 * query uses additional INNER JOINs for filtering. The combination requires
 * careful index optimization to prevent performance degradation.
 */
export const FACTOIDS_BY_TAG_QUERY = `${FACTOID_BASE_SELECT}
  INNER JOIN factoid_tags ft_filter ON f.id = ft_filter.factoid_id
  INNER JOIN tags t_filter ON ft_filter.tag_id = t_filter.id
  WHERE f.status = $1 AND t_filter.slug = $2 AND t_filter.is_active = true
  GROUP BY f.id
  ORDER BY f.created_at DESC`;

/**
 * Query parameter builders for common use cases
 */
export const QueryParams = {
  /**
   * Parameters for getting published factoids by ID
   */
  factoidById: (id: string) => [id, 'published'],
  
  /**
   * Parameters for getting all published factoids
   */
  allPublished: () => ['published'],
  
  /**
   * Parameters for searching published factoids
   */
  searchPublished: (query: string) => ['published', query, `%${query}%`],
  
  /**
   * Parameters for getting published factoids by language
   */
  byLanguage: (language: string) => ['published', language],
  
  /**
   * Parameters for getting published factoids by tag
   */
  byTag: (tagSlug: string) => ['published', tagSlug],
};

/**
 * Query documentation for reference
 */
export const QueryDocs = {
  /**
   * Common patterns used in all factoid queries:
   * 
   * 1. JSON Aggregation: Uses json_agg with jsonb_build_object to aggregate
   *    related tags and sources into JSON arrays
   * 
   * 2. FILTER Clause: Uses FILTER (WHERE x.id IS NOT NULL) to exclude
   *    NULL results from LEFT JOINs
   * 
   * 3. COALESCE: Ensures empty arrays '[]' instead of NULL when no
   *    related records exist
   * 
   * 4. DISTINCT: Prevents duplicate entries in aggregated arrays when
   *    multiple JOIN paths exist
   * 
   * 5. GROUP BY: Required when using aggregation functions, groups by
   *    the main factoid record
   */
  aggregationPatterns: 'See QueryDocs.aggregationPatterns for details',
  
  /**
   * Parameter patterns:
   * - $1, $2, etc.: Parameterized queries prevent SQL injection
   * - Always use 'published' status for public-facing endpoints
   * - Use ILIKE for case-insensitive text search (PostgreSQL-specific)
   * - Use websearch_to_tsquery for full-text search capabilities
   */
  parameterPatterns: 'See QueryDocs.parameterPatterns for details',
} as const; 