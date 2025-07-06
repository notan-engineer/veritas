import { supabase } from './supabase'

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

// Database response types
interface FactoidTagResponse {
  confidence_score: number
  tags: {
    id: string
    name: string
    slug: string
    description?: string
    parent_id?: string
    level: number
    is_active: boolean
  }
}

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

// Helper to fetch tags for a factoid
async function getTagsForFactoid(factoid_id: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('factoid_tags')
    .select(`
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
    .eq('factoid_id', factoid_id)
  
  if (error) {
    console.error('Error fetching tags for factoid:', error)
    return []
  }
  
  return data?.map((row: unknown) => {
    const typedRow = row as FactoidTagResponse
    return {
      ...typedRow.tags,
      confidence_score: typedRow.confidence_score
    }
  }) || []
}

// Helper to fetch sources for a factoid
async function getSourcesForFactoid(factoid_id: string): Promise<Source[]> {
  const { data, error } = await supabase
    .from('factoid_sources')
    .select(`
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
    .eq('factoid_id', factoid_id)
  
  if (error) {
    console.error('Error fetching sources for factoid:', error)
    return []
  }
  
  return data?.map((row: unknown) => {
    const typedRow = row as FactoidSourceResponse
    return {
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
    }
  }) || []
}

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
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching factoids:', error)
    return []
  }
  
  if (!data || data.length === 0) {
    return []
  }
  
  // Get all factoid IDs for batch queries
  const factoidIds = data.map(row => row.id)
  
  // Batch fetch all tags and sources to avoid N+1 queries
  const [allTags, allSources] = await Promise.all([
    getBatchTagsForFactoids(factoidIds),
    getBatchSourcesForFactoids(factoidIds)
  ])
  
  // Assemble factoids with their tags and sources
  const factoids: Factoid[] = (data as FactoidDbRow[]).map(row => {
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

// Get factoids by tag
export async function getFactoidsByTag(tagSlug: string): Promise<Factoid[]> {
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

// Legacy compatibility functions (for backward compatibility)
export interface Article {
  id: string
  title: string
  short_summary: string
  tags: string[]
  bullet_summary: string[]
  source_urls: string[]
  created_at: string
  language: 'en' | 'he'
}

// Convert factoid to legacy article format (only for supported languages)
function factoidToArticle(factoid: Factoid): Article | null {
  // Only convert factoids with supported languages for Article interface
  if (factoid.language !== 'en' && factoid.language !== 'he') {
    return null
  }
  
  return {
    id: factoid.id,
    title: factoid.title,
    short_summary: factoid.description,
    tags: factoid.tags.map(tag => tag.name),
    bullet_summary: factoid.bullet_points,
    source_urls: factoid.sources.map(source => source.scraped_content?.source_url || source.url),
    created_at: factoid.created_at,
    language: factoid.language // Safe to use directly since we checked above
  }
}

// Legacy functions that convert to new format
export async function getAllArticles(): Promise<Article[]> {
  const factoids = await getAllFactoids()
  return factoids
    .map(factoidToArticle)
    .filter((article): article is Article => article !== null)
}

export async function getArticlesByTopic(topic: string): Promise<Article[]> {
  const factoids = await getFactoidsByTag(topic)
  return factoids
    .map(factoidToArticle)
    .filter((article): article is Article => article !== null)
}

export async function getArticleById(id: string): Promise<Article | null> {
  const factoid = await getFactoidById(id)
  return factoid ? factoidToArticle(factoid) : null
}

export async function getArticlesByLanguage(language: 'en' | 'he'): Promise<Article[]> {
  const factoids = await getFactoidsByLanguage(language)
  return factoids
    .map(factoidToArticle)
    .filter((article): article is Article => article !== null)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const factoids = await searchFactoids(query)
  return factoids
    .map(factoidToArticle)
    .filter((article): article is Article => article !== null)
}

export async function getUniqueTags(): Promise<string[]> {
  const tags = await getAllTags()
  return tags.map(tag => tag.name)
} 