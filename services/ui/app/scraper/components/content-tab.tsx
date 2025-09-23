"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrapedArticle, PaginatedResponse, NewsSource } from '../types'

export function ContentTab() {
  const [articles, setArticles] = useState<ScrapedArticle[]>([])
  const [sources, setSources] = useState<NewsSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState('all-sources')
  const [selectedLanguage, setSelectedLanguage] = useState('all-languages')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchSources()
    fetchArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedSource, selectedLanguage])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/scraper/sources')
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    }
  }

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20'
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedSource && selectedSource !== 'all-sources') params.append('source', selectedSource)
      if (selectedLanguage && selectedLanguage !== 'all-languages') params.append('language', selectedLanguage)
      
      const response = await fetch(`/api/scraper/content?${params}`)
      if (response.ok) {
        const data: PaginatedResponse<ScrapedArticle> = await response.json()
        setArticles(data.data)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchArticles()
  }

  const toggleArticleExpanded = (articleId: string) => {
    const newExpanded = new Set(expandedArticles)
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId)
    } else {
      newExpanded.add(articleId)
    }
    setExpandedArticles(newExpanded)
  }

  const getLanguageLabel = (lang: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      he: 'Hebrew',
      ar: 'Arabic',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean'
    }
    return languages[lang] || lang.toUpperCase()
  }

  const formatArticleContent = (content: string) => {
    // Split by triple newlines (the separator used by the scraper)
    const paragraphs = content.split(/\n{3,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0)

    // If no triple newlines found, try double newlines
    if (paragraphs.length === 1) {
      const doubleSplit = content.split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0)

      if (doubleSplit.length > 1) {
        return doubleSplit
      }
    }

    return paragraphs
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sources">All sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source.id} value={source.name}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-languages">All languages</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">Hebrew</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading articles...</div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No articles found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          (articles || []).map(article => (
            <Card key={article.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <CardTitle className="text-lg leading-tight">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {article.sourceName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">
                        {getLanguageLabel(article.language)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArticleExpanded(article.id)}
                  >
                    {expandedArticles.has(article.id) ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {expandedArticles.has(article.id) ? (
                  <div className="text-sm space-y-3">
                    {formatArticleContent(article.content || '').map((paragraph, index) => (
                      <p key={index} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm line-clamp-3">
                    {article.content || ''}
                  </p>
                )}

                {expandedArticles.has(article.id) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {article.author && <p>Author: {article.author}</p>}
                        <p>Status: {article.processingStatus}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={article.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Original
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && articles.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 