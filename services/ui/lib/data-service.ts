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
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
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
  
  const factoidIds = rows.map(row => row.id)
  
  // Batch fetch tags and sources
  const [tagsMap, sourcesMap] = await Promise.all([
    getBatchTagsForFactoids(factoidIds),
    getBatchSourcesForFactoids(factoidIds)
  ])
  
  return rows.map(row => ({
    ...row,
    tags: tagsMap[row.id] || [],
    sources: sourcesMap[row.id] || []
  }))
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
  if (!query.trim()) {
    return []
  }
  
  const { data, error } = await supabase
    .from('factoids')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error searching factoids:', error)
    return []
  }
  
  return await processFactoidRows(data as FactoidDbRow[] || [])
}

// Get all active tags
export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: true })
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }
  
  return data as Tag[] || []
}

// Get tags by level
export async function getTagsByLevel(level: number): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('level', level)
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching tags by level:', error)
    return []
  }
  
  return data as Tag[] || []
}

// Get child tags for a parent
export async function getChildTags(parentId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching child tags:', error)
    return []
  }
  
  return data as Tag[] || []
}

// Get all active sources
export async function getAllSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching sources:', error)
    return []
  }
  
  return data as Source[] || []
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

export async function searchFactoidsWithErrors(query: string): Promise<ApiArrayResult<Factoid>> {
  try {
    const data = await searchFactoids(query)
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

 