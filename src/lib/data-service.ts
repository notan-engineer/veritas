import { supabase } from './supabase'

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

// Helper to fetch tags for an article
async function getTagsForArticle(article_id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('article_tags')
    .select('tags(name)')
    .eq('article_id', article_id)
  if (error) return []
  return data?.map((row: any) => row.tags.name) || []
}

// Helper to fetch source URLs for an article
async function getSourceUrlsForArticle(scraped_article_id: string | null): Promise<string[]> {
  if (!scraped_article_id) return []
  const { data, error } = await supabase
    .from('scraped_articles')
    .select('source_url')
    .eq('id', scraped_article_id)
  if (error) return []
  return data?.map((row: any) => row.source_url) || []
}

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('processed_articles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }
  // Fetch tags and source URLs for each article
  const articles: Article[] = await Promise.all(
    (data || []).map(async (row: any) => {
      const tags = await getTagsForArticle(row.id)
      const source_urls = await getSourceUrlsForArticle(row.scraped_article_id)
      return {
        id: row.id,
        title: row.title,
        short_summary: row.short_summary,
        tags,
        bullet_summary: row.bullet_summary,
        source_urls,
        created_at: row.created_at,
        language: row.language,
      }
    })
  )
  return articles
}

export async function getArticlesByTopic(topic: string): Promise<Article[]> {
  // Find tag id by name
  const { data: tagData, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', topic)
    .single()
  if (tagError || !tagData) return []
  // Find article ids with this tag
  const { data: articleTags, error: atError } = await supabase
    .from('article_tags')
    .select('article_id')
    .eq('tag_id', tagData.id)
  if (atError) return []
  const articleIds = articleTags.map((row: any) => row.article_id)
  // Fetch articles by ids
  const { data, error } = await supabase
    .from('processed_articles')
    .select('*')
    .in('id', articleIds)
    .order('created_at', { ascending: false })
  if (error) return []
  const articles: Article[] = await Promise.all(
    (data || []).map(async (row: any) => {
      const tags = await getTagsForArticle(row.id)
      const source_urls = await getSourceUrlsForArticle(row.scraped_article_id)
      return {
        id: row.id,
        title: row.title,
        short_summary: row.short_summary,
        tags,
        bullet_summary: row.bullet_summary,
        source_urls,
        created_at: row.created_at,
        language: row.language,
      }
    })
  )
  return articles
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('processed_articles')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  const tags = await getTagsForArticle(data.id)
  const source_urls = await getSourceUrlsForArticle(data.scraped_article_id)
  return {
    id: data.id,
    title: data.title,
    short_summary: data.short_summary,
    tags,
    bullet_summary: data.bullet_summary,
    source_urls,
    created_at: data.created_at,
    language: data.language,
  }
}

export async function getArticlesByLanguage(language: 'en' | 'he'): Promise<Article[]> {
  const { data, error } = await supabase
    .from('processed_articles')
    .select('*')
    .eq('language', language)
    .order('created_at', { ascending: false })
  if (error) return []
  const articles: Article[] = await Promise.all(
    (data || []).map(async (row: any) => {
      const tags = await getTagsForArticle(row.id)
      const source_urls = await getSourceUrlsForArticle(row.scraped_article_id)
      return {
        id: row.id,
        title: row.title,
        short_summary: row.short_summary,
        tags,
        bullet_summary: row.bullet_summary,
        source_urls,
        created_at: row.created_at,
        language: row.language,
      }
    })
  )
  return articles
}

export async function searchArticles(query: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('processed_articles')
    .select('*')
    .or(`title.ilike.%${query}%,short_summary.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  if (error) return []
  const articles: Article[] = await Promise.all(
    (data || []).map(async (row: any) => {
      const tags = await getTagsForArticle(row.id)
      const source_urls = await getSourceUrlsForArticle(row.scraped_article_id)
      return {
        id: row.id,
        title: row.title,
        short_summary: row.short_summary,
        tags,
        bullet_summary: row.bullet_summary,
        source_urls,
        created_at: row.created_at,
        language: row.language,
      }
    })
  )
  return articles
}

export async function getUniqueTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
  if (error) return []
  return data?.map((row: any) => row.name) || []
} 