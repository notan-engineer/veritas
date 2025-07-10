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
 * Build the correct URL for API calls based on environment
 * - Server-side: Use localhost with correct port
 * - Client-side: Use relative URL
 */
function getApiUrl(path: string): string {
  // Client-side: use relative URL
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // Server-side: use localhost (same server process)
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}${path}`;
}

/**
 * Handles API responses and errors
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Get all published factoids with their tags and sources
 */
export async function getAllFactoids(): Promise<Factoid[]> {
  try {
    const response = await fetch(getApiUrl('/api/factoids'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleApiResponse<Factoid[]>(response);
  } catch (error) {
    console.error('Error fetching factoids:', error);
    throw new Error('Failed to fetch factoids');
  }
}

/**
 * Get a specific factoid by ID
 */
export async function getFactoidById(id: string): Promise<Factoid | null> {
  try {
    const response = await fetch(getApiUrl(`/api/factoids/${id}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      return null;
    }

    return handleApiResponse<Factoid>(response);
  } catch (error) {
    console.error('Error fetching factoid:', error);
    throw new Error('Failed to fetch factoid');
  }
}

/**
 * Get all active tags
 */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const response = await fetch(getApiUrl('/api/tags'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleApiResponse<Tag[]>(response);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Failed to fetch tags');
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

    const response = await fetch(getApiUrl(`/api/factoids/search?q=${encodeURIComponent(query)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleApiResponse<Factoid[]>(response);
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
    const response = await fetch(getApiUrl('/api/factoids'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

 