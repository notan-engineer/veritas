import { supabase } from './supabase'
import { getDatabaseProvider } from './database-config'

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

// Database response types
interface FactoidSourceResponse {
  relevance_score: number
  scraped_content: {
    id: string
    source_url: string
    title?: string
    content?: string
    author?: string
    publication_date?: string
    content_type: string
    language: string
    sources: {
      id: string
      name: string
      domain: string
      url: string
      description?: string
      icon_url?: string
      twitter_handle?: string
      profile_photo_url?: string
      is_active: boolean
    }
  }
}

interface FactoidDbRow {
  id: string
  title: string
  description: string
  bullet_points: string[]
  language: 'en' | 'he' | 'ar' | 'other'
  confidence_score: number
  status: 'draft' | 'published' | 'archived' | 'flagged'
  created_at: string
  updated_at: string
}

interface FactoidIdRow {
  factoid_id: string
}

// Railway API helpers (using API routes to avoid client-side pg bundling)

/**
 * Generic Railway API fetch utility with centralized error handling and timeout
 */
async function fetchRailwayAPI<T>(
  endpoint: string, 
  fallbackValue: T, 
  options: { 
    timeoutMs?: number;
    handle404AsNull?: boolean;
    operationName: string;
  } = { timeoutMs: 10000, handle404AsNull: false, operationName: 'API call' }
): Promise<{ data: T; error?: Error }> {
  const { timeoutMs = 10000, handle404AsNull = false, operationName } = options;
  
  try {
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(endpoint, { 
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Handle 404 specially for nullable results
      if (response.status === 404 && handle404AsNull) {
        return { data: fallbackValue };
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Railway API timeout (${timeoutMs}ms) for ${operationName}:`, endpoint);
      return { data: fallbackValue, error: new Error(`Request timeout after ${timeoutMs}ms`) };
    }
    
    console.error(`Error in Railway API ${operationName}:`, error);
    return { data: fallbackValue, error: error as Error };
  }
}

/**
 * Railway API: Get all published factoids
 */
async function getAllFactoidsRailway(): Promise<ApiArrayResult<Factoid>> {
  return fetchRailwayAPI<Factoid[]>(
    '/api/railway/factoids',
    [],
    { operationName: 'fetching factoids' }
  );
}

/**
 * Railway API: Get factoid by ID
 */
async function getFactoidByIdRailway(id: string): Promise<ApiNullableResult<Factoid>> {
  return fetchRailwayAPI<Factoid | null>(
    `/api/railway/factoids/${id}`,
    null,
    { 
      handle404AsNull: true,
      operationName: 'fetching factoid by ID'
    }
  );
}

/**
 * Railway API: Search factoids
 */
async function searchFactoidsRailway(query: string): Promise<ApiArrayResult<Factoid>> {
  return fetchRailwayAPI<Factoid[]>(
    `/api/railway/factoids/search?q=${encodeURIComponent(query)}`,
    [],
    { operationName: 'searching factoids' }
  );
}

/**
 * Railway API: Get factoids by language
 */
async function getFactoidsByLanguageRailway(language: 'en' | 'he' | 'ar' | 'other'): Promise<ApiArrayResult<Factoid>> {
  return fetchRailwayAPI<Factoid[]>(
    `/api/railway/factoids/language/${language}`,
    [],
    { operationName: 'fetching factoids by language' }
  );
}

/**
 * Railway API: Get factoids by tag
 */
async function getFactoidsByTagRailway(tagSlug: string): Promise<ApiArrayResult<Factoid>> {
  return fetchRailwayAPI<Factoid[]>(
    `/api/railway/factoids/tag/${tagSlug}`,
    [],
    { operationName: 'fetching factoids by tag' }
  );
}

/**
 * Railway API: Get all active tags
 */
async function getAllTagsRailway(): Promise<ApiArrayResult<Tag>> {
  return fetchRailwayAPI<Tag[]>(
    '/api/railway/tags',
    [],
    { operationName: 'fetching tags' }
  );
}

/**
 * Railway API: Get tags by level
 */
async function getTagsByLevelRailway(level: number): Promise<ApiArrayResult<Tag>> {
  return fetchRailwayAPI<Tag[]>(
    `/api/railway/tags/level/${level}`,
    [],
    { operationName: 'fetching tags by level' }
  );
}

/**
 * Railway API: Get child tags
 */
async function getChildTagsRailway(parentId: string): Promise<ApiArrayResult<Tag>> {
  return fetchRailwayAPI<Tag[]>(
    `/api/railway/tags/children/${parentId}`,
    [],
    { operationName: 'fetching child tags' }
  );
}

/**
 * Railway API: Get all active sources
 */
async function getAllSourcesRailway(): Promise<ApiArrayResult<Source>> {
  return fetchRailwayAPI<Source[]>(
    '/api/railway/sources',
    [],
    { operationName: 'fetching sources' }
  );
}

// Original Supabase implementations (preserved for compatibility)

// Batch helper to fetch tags for multiple factoids
async function getBatchTagsForFactoids(factoidIds: string[]): Promise<Record<string, Tag[]>> {
  const { data, error } = await supabase
    .from('factoid_tags')
    .select(`
      factoid_id,
      confidence_score,
      tags (
        id,
        name,
        slug,
        description,
        parent_id,
        level,
        is_active
      )
    `)
    .in('factoid_id', factoidIds)
  
  if (error) {
    console.error('Error fetching batch tags for factoids:', error)
    return {}
  }
  
  const result: Record<string, Tag[]> = {}
  
  data?.forEach((row: unknown) => {
    const typedRow = row as { factoid_id: string; confidence_score: number; tags: Tag }
    if (!result[typedRow.factoid_id]) {
      result[typedRow.factoid_id] = []
    }
    result[typedRow.factoid_id].push({
      ...typedRow.tags,
      confidence_score: typedRow.confidence_score
    })
  })
  
  return result
}

// Batch helper to fetch sources for multiple factoids
async function getBatchSourcesForFactoids(factoidIds: string[]): Promise<Record<string, Source[]>> {
  const { data, error } = await supabase
    .from('factoid_sources')
    .select(`
      factoid_id,
      relevance_score,
      scraped_content (
        id,
        source_url,
        title,
        content,
        author,
        publication_date,
        content_type,
        language,
        sources (
          id,
          name,
          domain,
          url,
          description,
          icon_url,
          twitter_handle,
          profile_photo_url,
          is_active
        )
      )
    `)
    .in('factoid_id', factoidIds)
  
  if (error) {
    console.error('Error fetching batch sources for factoids:', error)
    return {}
  }
  
  const result: Record<string, Source[]> = {}
  
  data?.forEach((row: unknown) => {
    const typedRow = row as { factoid_id: string; relevance_score: number; scraped_content: FactoidSourceResponse['scraped_content'] }
    if (!result[typedRow.factoid_id]) {
      result[typedRow.factoid_id] = []
    }
    result[typedRow.factoid_id].push({
      ...typedRow.scraped_content.sources,
      relevance_score: typedRow.relevance_score,
      scraped_content: {
        id: typedRow.scraped_content.id,
        source_url: typedRow.scraped_content.source_url,
        title: typedRow.scraped_content.title,
        content: typedRow.scraped_content.content,
        author: typedRow.scraped_content.author,
        publication_date: typedRow.scraped_content.publication_date,
        content_type: typedRow.scraped_content.content_type,
        language: typedRow.scraped_content.language
      }
    })
  })
  
  return result
}

// Get all published factoids with optimized queries
export async function getAllFactoids(): Promise<Factoid[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getAllFactoidsRailway();
    if (error) {
      console.error('Error fetching factoids from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching factoids:', error)
    return []
  }
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
}

// Get factoids by tag
export async function getFactoidsByTag(tagSlug: string): Promise<Factoid[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getFactoidsByTagRailway(tagSlug);
    if (error) {
      console.error('Error fetching factoids by tag from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  // Find tag by slug
  const { data: tagData, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .eq('is_active', true)
    .single()
  
  if (tagError || !tagData) {
    console.error('Error finding tag:', tagError)
    return []
  }
  
  // Find factoid ids with this tag
  const { data: factoidTags, error: ftError } = await supabase
    .from('factoid_tags')
    .select('factoid_id')
    .eq('tag_id', tagData.id)
  
  if (ftError) {
    console.error('Error finding factoid tags:', ftError)
    return []
  }
  
  const factoidIds = factoidTags.map((row: unknown) => (row as FactoidIdRow).factoid_id)
  
  if (factoidIds.length === 0) return []
  
  // Fetch factoids by ids
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .in('id', factoidIds)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching factoids by tag:', error)
    return []
  }
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
}

// Get factoid by ID
export async function getFactoidById(id: string): Promise<Factoid | null> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getFactoidByIdRailway(id);
    if (error) {
      console.error('Error fetching factoid by ID from Railway API:', error);
      return null;
    }
    return data || null;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()
  
  if (error || !data) {
    console.error('Error fetching factoid by ID:', error)
    return null
  }
  
  const factoids = await processFactoidRows([data as FactoidDbRow])
  return factoids.length > 0 ? factoids[0] : null
}

// Helper function to process factoid rows with batch fetching of tags and sources
async function processFactoidRows(rows: FactoidDbRow[]): Promise<Factoid[]> {
  if (!rows || rows.length === 0) {
    return []
  }
  
  // Get all factoid IDs for batch queries
  const factoidIds = rows.map(row => row.id)
  
  // Batch fetch all tags and sources to avoid N+1 queries
  const [allTags, allSources] = await Promise.all([
    getBatchTagsForFactoids(factoidIds),
    getBatchSourcesForFactoids(factoidIds)
  ])
  
  // Assemble factoids with their tags and sources
  const factoids: Factoid[] = rows.map(row => {
    const tags = allTags[row.id] || []
    const sources = allSources[row.id] || []
    
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      bullet_points: row.bullet_points,
      language: row.language,
      confidence_score: row.confidence_score,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags,
      sources
    }
  })
  
  return factoids
}

// Get factoids by language
export async function getFactoidsByLanguage(language: 'en' | 'he' | 'ar' | 'other'): Promise<Factoid[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getFactoidsByLanguageRailway(language);
    if (error) {
      console.error('Error fetching factoids by language from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .eq('language', language)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching factoids by language:', error)
    return []
  }
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
}

// Search factoids using full-text search
export async function searchFactoids(query: string): Promise<Factoid[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await searchFactoidsRailway(query);
    if (error) {
      console.error('Error searching factoids from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .eq('status', 'published')
    .textSearch('title_description_fts', query, {
      type: 'websearch',
      config: 'english'
    })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error searching factoids with full-text search, falling back to simple search:', error)
    // Fallback to simple search if full-text search fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('factoids')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (fallbackError) {
      console.error('Error with fallback search:', fallbackError)
      return []
    }
    
    return await processFactoidRows(fallbackData as FactoidDbRow[] || [])
  }
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
}

// Get all active tags
export async function getAllTags(): Promise<Tag[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getAllTagsRailway();
    if (error) {
      console.error('Error fetching tags from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }
  
  return (data as Tag[]) || []
}

// Get tags by level (for hierarchy)
export async function getTagsByLevel(level: number): Promise<Tag[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getTagsByLevelRailway(level);
    if (error) {
      console.error('Error fetching tags by level from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('level', level)
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching tags by level:', error)
    return []
  }
  
  return (data as Tag[]) || []
}

// Get child tags for a parent tag
export async function getChildTags(parentId: string): Promise<Tag[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getChildTagsRailway(parentId);
    if (error) {
      console.error('Error fetching child tags from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching child tags:', error)
    return []
  }
  
  return (data as Tag[]) || []
}

// Get all active sources
export async function getAllSources(): Promise<Source[]> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    const { data, error } = await getAllSourcesRailway();
    if (error) {
      console.error('Error fetching sources from Railway API:', error);
      return [];
    }
    return data;
  }
  
  // Supabase implementation (original)
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching sources:', error)
    return []
  }
  
  return (data as Source[]) || []
}

// Enhanced versions with error state for UI components that want to handle errors

/**
 * Enhanced version of getAllFactoids that returns error state
 * Use this in UI components that want to display error messages to users
 * 
 * @example
 * ```typescript
 * // In a React component
 * const { data: factoids, error } = await getAllFactoidsWithErrors();
 * if (error) {
 *   setErrorMessage('Failed to load factoids. Please try again.');
 *   return;
 * }
 * setFactoids(factoids);
 * ```
 */
export async function getAllFactoidsWithErrors(): Promise<ApiArrayResult<Factoid>> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    return getAllFactoidsRailway();
  }
  
  // Supabase implementation (original)
  try {
    const { data, error } = await supabase
      .from('factoids')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching factoids:', error)
      return { data: [], error: new Error(error.message) }
    }
    
    const processedData = await processFactoidRows(data as FactoidDbRow[] || [])
    return { data: processedData }
  } catch (error) {
    console.error('Error fetching factoids:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Enhanced version of getFactoidById that returns error state
 * Use this in UI components that want to display error messages to users
 */
export async function getFactoidByIdWithErrors(id: string): Promise<ApiNullableResult<Factoid>> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    return getFactoidByIdRailway(id);
  }
  
  // Supabase implementation (original)
  try {
    const { data, error } = await supabase
      .from('factoids')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()
    
    if (error || !data) {
      console.error('Error fetching factoid by ID:', error)
      return { data: null, error: error ? new Error(error.message) : new Error('Factoid not found') }
    }
    
    const factoids = await processFactoidRows([data as FactoidDbRow])
    const factoid = factoids.length > 0 ? factoids[0] : null
    return { data: factoid }
  } catch (error) {
    console.error('Error fetching factoid by ID:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Enhanced version of searchFactoids that returns error state
 * Use this in UI components that want to display error messages to users
 */
export async function searchFactoidsWithErrors(query: string): Promise<ApiArrayResult<Factoid>> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    return searchFactoidsRailway(query);
  }
  
  // Supabase implementation (original)
  try {
    const { data, error } = await supabase
      .from('factoids')
      .select('*')
      .eq('status', 'published')
      .textSearch('title_description_fts', query, {
        type: 'websearch',
        config: 'english'
      })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error searching factoids with full-text search, falling back to simple search:', error)
      // Fallback to simple search if full-text search fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('factoids')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      
      if (fallbackError) {
        console.error('Error with fallback search:', fallbackError)
        return { data: [], error: new Error(fallbackError.message) }
      }
      
      const processedData = await processFactoidRows(fallbackData as FactoidDbRow[] || [])
      return { data: processedData }
    }
    
    const processedData = await processFactoidRows(data as FactoidDbRow[] || [])
    return { data: processedData }
  } catch (error) {
    console.error('Error searching factoids:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Enhanced version of getAllTags that returns error state
 * Use this in UI components that want to display error messages to users
 */
export async function getAllTagsWithErrors(): Promise<ApiArrayResult<Tag>> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    return getAllTagsRailway();
  }
  
  // Supabase implementation (original)
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('Error fetching tags:', error)
      return { data: [], error: new Error(error.message) }
    }
    
    return { data: (data as Tag[]) || [] }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Enhanced version of getFactoidsByTag that returns error state
 * Use this in UI components that want to display error messages to users
 */
export async function getFactoidsByTagWithErrors(tagSlug: string): Promise<ApiArrayResult<Factoid>> {
  const provider = getDatabaseProvider();
  
  if (provider === 'railway') {
    return getFactoidsByTagRailway(tagSlug);
  }
  
  // Supabase implementation (original)
  try {
    // Find tag by slug
    const { data: tagData, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .eq('is_active', true)
      .single()
    
    if (tagError || !tagData) {
      console.error('Error finding tag:', tagError)
      return { data: [], error: tagError ? new Error(tagError.message) : new Error('Tag not found') }
    }
    
    // Find factoid ids with this tag
    const { data: factoidTags, error: ftError } = await supabase
      .from('factoid_tags')
      .select('factoid_id')
      .eq('tag_id', tagData.id)
    
    if (ftError) {
      console.error('Error finding factoid tags:', ftError)
      return { data: [], error: new Error(ftError.message) }
    }
    
    const factoidIds = factoidTags.map((row: unknown) => (row as FactoidIdRow).factoid_id)
    
    if (factoidIds.length === 0) return { data: [] }
    
    // Fetch factoids by ids
    const { data, error } = await supabase
      .from('factoids')
      .select('*')
      .in('id', factoidIds)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching factoids by tag:', error)
      return { data: [], error: new Error(error.message) }
    }
    
    const processedData = await processFactoidRows(data as FactoidDbRow[] || [])
    return { data: processedData }
  } catch (error) {
    console.error('Error fetching factoids by tag:', error)
    return { data: [], error: error as Error }
  }
}

 