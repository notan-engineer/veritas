/**
 * Data Service - Client for accessing factoid data via API routes.
 * 
 * This service is safe to use in Client Components.
 */

// Type definitions
export interface Factoid {
  id: string;
  title: string;
  description: string;
  bullet_points?: string[];  // Make optional
  language: 'en' | 'he' | 'ar' | 'other';
  confidence_score: number;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  created_at: string;
  updated_at: string;
  tags?: Tag[];  // Make optional
  sources?: Source[];  // Make optional
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  url: string; // Maps to rss_url from database
  icon_url?: string;
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
 * These functions are called from client components and MUST use fetch.
 */
export async function getAllFactoids(): Promise<Factoid[]> {
    const response = await fetch('/api/factoids');
    return handleApiResponse<Factoid[]>(response);
}

export async function getAllTags(): Promise<Tag[]> {
    const response = await fetch('/api/tags');
    return handleApiResponse<Tag[]>(response);
}

export async function searchFactoids(query: string): Promise<Factoid[]> {
    if (!query.trim()) return [];
    const response = await fetch(`/api/factoids/search?q=${encodeURIComponent(query)}`);
    return handleApiResponse<Factoid[]>(response);
}

// Client-side version of getFactoidById for potential use in client components
export async function getFactoidById_Client(id: string): Promise<Factoid | null> {
  const response = await fetch(`/api/factoids/${id}`);
  if (response.status === 404) return null;
  return handleApiResponse<Factoid>(response);
}

/**
 * Get factoids by tag
 */
export async function getFactoidsByTag(tagId: string): Promise<Factoid[]> {
  try {
    const factoids = await getAllFactoids();
    return factoids.filter(factoid => 
      factoid.tags?.some((tag: Tag) => tag.id === tagId)
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
      factoid.sources?.some((source: Source) => source.id === sourceId)
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
      factoid.sources?.forEach((source: Source) => {
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

 