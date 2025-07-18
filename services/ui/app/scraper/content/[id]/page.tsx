import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  Globe, 
  Hash,
  Clock,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

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
  fullHtml?: string;
  createdAt: string;
}

async function getArticleById(id: string): Promise<ScrapedArticle | null> {
  try {
    // Try to get data from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${scraperServiceUrl}/api/content/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || null;
      }
    } catch (error) {
      console.log('Scraper service unavailable, using mock data');
    }

    // Mock data for development
    const mockArticles: ScrapedArticle[] = [
      {
        id: 'article-001',
        title: 'Breaking: Major Technology Breakthrough Announced',
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`,
        author: 'John Doe',
        sourceUrl: 'https://example.com/article-1',
        sourceName: 'Tech News',
        publicationDate: new Date().toISOString(),
        language: 'en',
        category: 'Technology',
        tags: ['tech', 'innovation', 'breaking'],
        contentType: 'article',
        processingStatus: 'completed',
        contentHash: 'abc123def456',
        fullHtml: '<article><h1>Breaking: Major Technology Breakthrough Announced</h1><p>Lorem ipsum dolor sit amet...</p></article>',
        createdAt: new Date().toISOString()
      },
      {
        id: 'article-002',
        title: 'Global Climate Summit Reaches Historic Agreement',
        content: `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
        author: 'Jane Smith',
        sourceUrl: 'https://example.com/article-2',
        sourceName: 'Global News',
        publicationDate: new Date(Date.now() - 3600000).toISOString(),
        language: 'en',
        category: 'Environment',
        tags: ['climate', 'global', 'agreement'],
        contentType: 'article',
        processingStatus: 'completed',
        contentHash: 'def456ghi789',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    return mockArticles.find(article => article.id === id) || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await getArticleById(resolvedParams.id);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
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
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
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
      <Badge variant="outline">
        {languages[language as keyof typeof languages] || language}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Back Button */}
      <div>
        <Link href="/scraper">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Scraper Dashboard
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-lg">{article.sourceName}</span>
                {getLanguageBadge(article.language)}
                {getStatusBadge(article.processingStatus)}
                {article.category && (
                  <Badge variant="secondary">
                    {article.category}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl sm:text-3xl leading-tight mb-4">
                {article.title}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                )}
                {article.publicationDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published {formatDate(article.publicationDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>Scraped {formatDate(article.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span>Article Content</span>
              <Badge variant="outline" className="text-xs">
                {article.contentType}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {(article.content || '').split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Article Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Article Metadata</CardTitle>
          <CardDescription>
            Technical details about the scraped article
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(article.tags || []).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Hash */}
          {article.contentHash && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Content Hash</span>
              </div>
              <div className="font-mono text-xs bg-muted p-2 rounded">
                {article.contentHash}
              </div>
            </div>
          )}

          {/* Source URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Source URL</span>
            </div>
            <div className="text-sm">
              <a 
                href={article.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {article.sourceUrl}
              </a>
            </div>
          </div>

          {/* Processing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-medium mb-1">Processing Status</div>
              <div className="text-sm text-muted-foreground">
                {getStatusBadge(article.processingStatus)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Content Type</div>
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline">{article.contentType}</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Language</div>
              <div className="text-sm text-muted-foreground">
                {getLanguageBadge(article.language)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Content Length</div>
              <div className="text-sm text-muted-foreground">
                {article.content.length} characters
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw HTML Preview */}
      {article.fullHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Raw HTML Content</CardTitle>
            <CardDescription>
              Full HTML content as scraped from the source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {article.fullHtml}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 sm:pt-8">
        <Link href="/scraper?tab=content">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </Button>
        </Link>
        
        <Button asChild>
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Original
          </a>
        </Button>
      </div>
    </div>
  );
} 