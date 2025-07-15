"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  User, 
  Globe, 
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Filter,
  Eye,
  Hash,
  Clock
} from "lucide-react";
import Link from "next/link";

interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl: string;
  sourceName: string;
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  contentHash?: string;
  createdAt: string;
}

export function ContentFeed() {
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load scraped content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(selectedSource !== 'all' && { source: selectedSource }),
          ...(selectedLanguage !== 'all' && { language: selectedLanguage }),
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
          ...(searchTerm && { search: searchTerm })
        });

        const response = await fetch(`/api/scraper/content?${params}`);
        const result = await response.json();
        
        if (result.success) {
          if (page === 1) {
            setArticles(result.data.content);
          } else {
            setArticles(prev => [...prev, ...result.data.content]);
          }
          setHasMore(result.data.hasMore);
        } else {
          console.error('Failed to load content:', result.error);
          // Mock data for development
          setArticles([
            {
              id: 'article-001',
              title: 'Breaking: Major Technology Breakthrough Announced',
              content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              author: 'John Doe',
              sourceUrl: 'https://example.com/article-1',
              sourceName: 'Tech News',
              publicationDate: new Date().toISOString(),
              language: 'en',
              category: 'Technology',
              tags: ['tech', 'innovation', 'breaking'],
              contentType: 'article',
              processingStatus: 'completed',
              contentHash: 'abc123',
              createdAt: new Date().toISOString()
            },
            {
              id: 'article-002',
              title: 'Global Climate Summit Reaches Historic Agreement',
              content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
              author: 'Jane Smith',
              sourceUrl: 'https://example.com/article-2',
              sourceName: 'Global News',
              publicationDate: new Date(Date.now() - 3600000).toISOString(),
              language: 'en',
              category: 'Environment',
              tags: ['climate', 'global', 'agreement'],
              contentType: 'article',
              processingStatus: 'completed',
              contentHash: 'def456',
              createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'article-003',
              title: 'Economic Markets Show Strong Recovery Signs',
              content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
              sourceUrl: 'https://example.com/article-3',
              sourceName: 'Financial Times',
              publicationDate: new Date(Date.now() - 7200000).toISOString(),
              language: 'en',
              category: 'Finance',
              tags: ['economy', 'markets', 'recovery'],
              contentType: 'article',
              processingStatus: 'completed',
              contentHash: 'ghi789',
              createdAt: new Date(Date.now() - 7200000).toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [page, selectedSource, selectedLanguage, selectedStatus, searchTerm]);

  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getLanguageBadge = (language: string) => {
    const languages = {
      'en': 'English',
      'he': 'עברית',
      'ar': 'العربية',
      'other': 'Other'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {languages[language as keyof typeof languages] || language}
      </Badge>
    );
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
  });

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSource('all');
    setSelectedLanguage('all');
    setSelectedStatus('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific articles from scraped content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Sources</option>
                <option value="cnn">CNN</option>
                <option value="bbc">BBC News</option>
                <option value="reuters">Reuters</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="he">Hebrew</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Article Feed */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading articles...</span>
          </div>
        ) : (
          <>
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{article.sourceName}</span>
                        {getLanguageBadge(article.language)}
                        {getStatusBadge(article.processingStatus)}
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-lg leading-tight mb-2">
                        <Link 
                          href={`/scraper/content/${article.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {article.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{article.author}</span>
                          </div>
                        )}
                        {article.publicationDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.publicationDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Scraped {formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArticleExpansion(article.id)}
                      >
                        {expandedArticles.has(article.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/scraper/content/${article.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Expandable Content */}
                {expandedArticles.has(article.id) && (
                  <CardContent className="pt-0">
                    <div className="text-sm leading-relaxed text-muted-foreground mb-4">
                      {article.content.substring(0, 500)}
                      {article.content.length > 500 && '...'}
                    </div>
                    
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Content Hash */}
                    {article.contentHash && (
                      <div className="text-xs text-muted-foreground font-mono">
                        Hash: {article.contentHash}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
            
            {filteredArticles.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-sm">
                  {searchTerm || selectedSource !== 'all' || selectedLanguage !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your search criteria or filters'
                    : 'No scraped content available. Trigger a job to start scraping articles.'}
                </p>
              </div>
            )}
            
            {/* Load More Button */}
            {hasMore && filteredArticles.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 