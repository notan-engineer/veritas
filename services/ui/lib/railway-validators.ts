/**
 * Railway API Response Validators
 * 
 * Runtime validation utilities to ensure type safety when processing
 * Railway PostgreSQL API responses, replacing unsafe type casting.
 */

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

/**
 * Validation error for better debugging
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    public expected: string,
    public received: unknown,
    public context?: string
  ) {
    super(`Validation failed for ${field}: expected ${expected}, received ${typeof received} ${context ? `(${context})` : ''}`)
    this.name = 'ValidationError'
  }
}

/**
 * Utility to check if value is a non-empty string
 */
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * Utility to check if value is a valid number
 */
function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Utility to check if value is a valid boolean
 */
function isValidBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Utility to check if value is a valid array
 */
function isValidArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * Validate scraped content object
 */
function validateScrapedContent(data: unknown, context = 'scraped_content'): Source['scraped_content'] {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('scraped_content', 'object', data, context)
  }

  const obj = data as Record<string, unknown>

  if (!isValidString(obj.id)) {
    throw new ValidationError('scraped_content.id', 'string', obj.id, context)
  }

  if (!isValidString(obj.source_url)) {
    throw new ValidationError('scraped_content.source_url', 'string', obj.source_url, context)
  }

  if (!isValidString(obj.content_type)) {
    throw new ValidationError('scraped_content.content_type', 'string', obj.content_type, context)
  }

  if (!isValidString(obj.language)) {
    throw new ValidationError('scraped_content.language', 'string', obj.language, context)
  }

  return {
    id: obj.id,
    source_url: obj.source_url,
    title: typeof obj.title === 'string' ? obj.title : undefined,
    content: typeof obj.content === 'string' ? obj.content : undefined,
    author: typeof obj.author === 'string' ? obj.author : undefined,
    publication_date: typeof obj.publication_date === 'string' ? obj.publication_date : undefined,
    content_type: obj.content_type,
    language: obj.language
  }
}

/**
 * Validate and transform a Tag object from Railway response
 */
export function validateTag(data: unknown, context = 'tag'): Tag {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('tag', 'object', data, context)
  }

  const obj = data as Record<string, unknown>

  // Validate required fields
  if (!isValidString(obj.id)) {
    throw new ValidationError('tag.id', 'string', obj.id, context)
  }

  if (!isValidString(obj.name)) {
    throw new ValidationError('tag.name', 'string', obj.name, context)
  }

  if (!isValidString(obj.slug)) {
    throw new ValidationError('tag.slug', 'string', obj.slug, context)
  }

  if (!isValidNumber(obj.level)) {
    throw new ValidationError('tag.level', 'number', obj.level, context)
  }

  if (!isValidBoolean(obj.is_active)) {
    throw new ValidationError('tag.is_active', 'boolean', obj.is_active, context)
  }

  return {
    id: obj.id,
    name: obj.name,
    slug: obj.slug,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    parent_id: typeof obj.parent_id === 'string' ? obj.parent_id : undefined,
    level: obj.level,
    is_active: obj.is_active,
    confidence_score: typeof obj.confidence_score === 'number' ? obj.confidence_score : undefined
  }
}

/**
 * Validate and transform a Source object from Railway response
 */
export function validateSource(data: unknown, context = 'source'): Source {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('source', 'object', data, context)
  }

  const obj = data as Record<string, unknown>

  // Validate required fields
  if (!isValidString(obj.id)) {
    throw new ValidationError('source.id', 'string', obj.id, context)
  }

  if (!isValidString(obj.name)) {
    throw new ValidationError('source.name', 'string', obj.name, context)
  }

  if (!isValidString(obj.domain)) {
    throw new ValidationError('source.domain', 'string', obj.domain, context)
  }

  if (!isValidString(obj.url)) {
    throw new ValidationError('source.url', 'string', obj.url, context)
  }

  if (!isValidBoolean(obj.is_active)) {
    throw new ValidationError('source.is_active', 'boolean', obj.is_active, context)
  }

  return {
    id: obj.id,
    name: obj.name,
    domain: obj.domain,
    url: obj.url,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    icon_url: typeof obj.icon_url === 'string' ? obj.icon_url : undefined,
    twitter_handle: typeof obj.twitter_handle === 'string' ? obj.twitter_handle : undefined,
    profile_photo_url: typeof obj.profile_photo_url === 'string' ? obj.profile_photo_url : undefined,
    is_active: obj.is_active,
    scraped_content: obj.scraped_content ? validateScrapedContent(obj.scraped_content, `${context}.scraped_content`) : undefined,
    relevance_score: typeof obj.relevance_score === 'number' ? obj.relevance_score : undefined
  }
}

/**
 * Validate and transform a Factoid object from Railway response
 */
export function validateFactoid(data: unknown, context = 'factoid'): Factoid {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('factoid', 'object', data, context)
  }

  const obj = data as Record<string, unknown>

  // Validate required fields
  if (!isValidString(obj.id)) {
    throw new ValidationError('factoid.id', 'string', obj.id, context)
  }

  if (!isValidString(obj.title)) {
    throw new ValidationError('factoid.title', 'string', obj.title, context)
  }

  if (!isValidString(obj.description)) {
    throw new ValidationError('factoid.description', 'string', obj.description, context)
  }

  if (!isValidArray(obj.bullet_points)) {
    throw new ValidationError('factoid.bullet_points', 'array', obj.bullet_points, context)
  }

  // Validate bullet_points are strings
  for (let i = 0; i < obj.bullet_points.length; i++) {
    if (!isValidString(obj.bullet_points[i])) {
      throw new ValidationError(`factoid.bullet_points[${i}]`, 'string', obj.bullet_points[i], context)
    }
  }

  if (!isValidString(obj.language) || !['en', 'he', 'ar', 'other'].includes(obj.language)) {
    throw new ValidationError('factoid.language', "'en' | 'he' | 'ar' | 'other'", obj.language, context)
  }

  if (!isValidNumber(obj.confidence_score)) {
    throw new ValidationError('factoid.confidence_score', 'number', obj.confidence_score, context)
  }

  if (!isValidString(obj.status) || !['draft', 'published', 'archived', 'flagged'].includes(obj.status)) {
    throw new ValidationError('factoid.status', "'draft' | 'published' | 'archived' | 'flagged'", obj.status, context)
  }

  if (!isValidString(obj.created_at)) {
    throw new ValidationError('factoid.created_at', 'string', obj.created_at, context)
  }

  if (!isValidString(obj.updated_at)) {
    throw new ValidationError('factoid.updated_at', 'string', obj.updated_at, context)
  }

  // Validate tags array
  if (!isValidArray(obj.tags)) {
    throw new ValidationError('factoid.tags', 'array', obj.tags, context)
  }

  const tags: Tag[] = []
  for (let i = 0; i < obj.tags.length; i++) {
    try {
      tags.push(validateTag(obj.tags[i], `${context}.tags[${i}]`))
    } catch (error) {
      console.error(`Failed to validate tag at index ${i}:`, error)
      // Continue processing other tags rather than failing completely
    }
  }

  // Validate sources array
  if (!isValidArray(obj.sources)) {
    throw new ValidationError('factoid.sources', 'array', obj.sources, context)
  }

  const sources: Source[] = []
  for (let i = 0; i < obj.sources.length; i++) {
    try {
      sources.push(validateSource(obj.sources[i], `${context}.sources[${i}]`))
    } catch (error) {
      console.error(`Failed to validate source at index ${i}:`, error)
      // Continue processing other sources rather than failing completely
    }
  }

  return {
    id: obj.id,
    title: obj.title,
    description: obj.description,
    bullet_points: obj.bullet_points as string[],
    language: obj.language as 'en' | 'he' | 'ar' | 'other',
    confidence_score: obj.confidence_score,
    status: obj.status as 'draft' | 'published' | 'archived' | 'flagged',
    created_at: obj.created_at,
    updated_at: obj.updated_at,
    tags,
    sources
  }
}

/**
 * Validate an array of factoids from Railway response
 */
export function validateFactoids(data: unknown, context = 'factoids'): Factoid[] {
  if (!isValidArray(data)) {
    throw new ValidationError('factoids', 'array', data, context)
  }

  const factoids: Factoid[] = []
  for (let i = 0; i < data.length; i++) {
    try {
      factoids.push(validateFactoid(data[i], `${context}[${i}]`))
    } catch (error) {
      console.error(`Failed to validate factoid at index ${i}:`, error)
      // Continue processing other factoids rather than failing completely
    }
  }

  return factoids
}

/**
 * Validate an array of tags from Railway response
 */
export function validateTags(data: unknown, context = 'tags'): Tag[] {
  if (!isValidArray(data)) {
    throw new ValidationError('tags', 'array', data, context)
  }

  const tags: Tag[] = []
  for (let i = 0; i < data.length; i++) {
    try {
      tags.push(validateTag(data[i], `${context}[${i}]`))
    } catch (error) {
      console.error(`Failed to validate tag at index ${i}:`, error)
      // Continue processing other tags rather than failing completely
    }
  }

  return tags
}

/**
 * Validate an array of sources from Railway response
 */
export function validateSources(data: unknown, context = 'sources'): Source[] {
  if (!isValidArray(data)) {
    throw new ValidationError('sources', 'array', data, context)
  }

  const sources: Source[] = []
  for (let i = 0; i < data.length; i++) {
    try {
      sources.push(validateSource(data[i], `${context}[${i}]`))
    } catch (error) {
      console.error(`Failed to validate source at index ${i}:`, error)
      // Continue processing other sources rather than failing completely
    }
  }

  return sources
} 