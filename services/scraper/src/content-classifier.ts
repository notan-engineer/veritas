import { CheerioAPI } from 'cheerio';
import { CrawleeClassification } from './types';

// Note: ArticleExtractor functionality will be implemented manually
// as it's not available in the current Crawlee version

export interface ContentClassificationResult {
  isArticle: boolean;
  confidence: number;
  contentType: string;
  category?: string;
  tags: string[];
  extractedContent?: {
    title: string;
    content: string;
    author?: string;
    publishDate?: Date;
    language?: string;
  };
  crawleeClassification: CrawleeClassification;
}

export interface ClassificationOptions {
  minConfidence?: number;
  extractContent?: boolean;
  detectLanguage?: boolean;
  extractTags?: boolean;
}

/**
 * Content Classification wrapper with manual content extraction
 * Provides article detection, categorization, and content extraction
 */
export class ContentClassifier {
  private readonly defaultOptions: Required<ClassificationOptions> = {
    minConfidence: 0.7,
    extractContent: true,
    detectLanguage: true,
    extractTags: true
  };

  constructor() {
    // Manual implementation without ArticleExtractor
  }

  /**
   * Classify content from a Cheerio instance
   */
  async classifyContent(
    $: CheerioAPI, 
    url: string, 
    options: ClassificationOptions = {}
  ): Promise<ContentClassificationResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Extract article content manually
      const articleData = this.extractArticleData($, url);
      
      // Determine if this is a valid article
      const isArticle = this.isValidArticle(articleData, opts.minConfidence);
      
      // Extract category and tags
      const category = this.extractCategory($, url);
      const tags = opts.extractTags ? this.extractTags($, articleData) : [];
      
      // Build classification result
      const result: ContentClassificationResult = {
        isArticle,
        confidence: this.calculateConfidence(articleData, $),
        contentType: this.determineContentType(articleData, $),
        category,
        tags,
        crawleeClassification: {
          contentType: isArticle ? 'article' : 'webpage',
          confidence: this.calculateConfidence(articleData, $),
          metadata: {
            url,
            wordCount: articleData.text?.split(/\s+/).length || 0,
            hasAuthor: !!articleData.author,
            hasPublishDate: !!articleData.publishedTime,
            titleLength: articleData.title?.length || 0,
            contentLength: articleData.text?.length || 0
          },
          extractedAt: new Date()
        }
      };

      // Add extracted content if requested
      if (opts.extractContent && isArticle) {
        result.extractedContent = {
          title: articleData.title || this.extractFallbackTitle($),
          content: articleData.text || this.extractFallbackContent($),
          author: articleData.author || this.extractFallbackAuthor($),
          publishDate: articleData.publishedTime ? new Date(articleData.publishedTime) : undefined,
          language: opts.detectLanguage ? this.detectLanguage(articleData.text || '') : undefined
        };
      }

      return result;

    } catch (error) {
      console.error('[ContentClassifier] Classification error:', error);
      
      // Return fallback classification
      return this.createFallbackClassification($, url, opts);
    }
  }

  /**
   * Extract article data manually from Cheerio
   */
  private extractArticleData($: CheerioAPI, url: string): any {
    return {
      title: this.extractFallbackTitle($),
      text: this.extractFallbackContent($),
      author: this.extractFallbackAuthor($),
      publishedTime: this.extractPublishDate($),
      url
    };
  }

  /**
   * Extract publish date from page
   */
  private extractPublishDate($: CheerioAPI): string | undefined {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'time[datetime]',
      '.date',
      '.published'
    ];
    
    for (const selector of dateSelectors) {
      const date = $(selector).attr('content') || $(selector).attr('datetime') || $(selector).text().trim();
      if (date && date.length > 0) {
        return date;
      }
    }
    
    return undefined;
  }

  /**
   * Check if extracted data represents a valid article
   */
  private isValidArticle(articleData: any, minConfidence: number): boolean {
    // Basic article validation criteria
    const hasTitle = articleData.title && articleData.title.length > 10;
    const hasContent = articleData.text && articleData.text.length > 200;
    const hasDate = !!articleData.publishedTime;
    const hasAuthor = !!articleData.author;
    
    // Calculate article score
    let score = 0;
    if (hasTitle) score += 0.4;
    if (hasContent) score += 0.4;
    if (hasDate) score += 0.1;
    if (hasAuthor) score += 0.1;
    
    return score >= minConfidence;
  }

  /**
   * Calculate confidence score for classification
   */
  private calculateConfidence(articleData: any, $: CheerioAPI): number {
    let confidence = 0;
    
    // Title indicators
    if (articleData.title) {
      confidence += 0.2;
      if (articleData.title.length > 20) confidence += 0.1;
    }
    
    // Content indicators
    if (articleData.text) {
      confidence += 0.3;
      if (articleData.text.length > 500) confidence += 0.1;
      if (articleData.text.length > 1000) confidence += 0.1;
    }
    
    // Metadata indicators
    if (articleData.author) confidence += 0.1;
    if (articleData.publishedTime) confidence += 0.1;
    
    // DOM structure indicators
    if ($('article').length > 0) confidence += 0.1;
    if ($('time').length > 0) confidence += 0.05;
    if ($('[class*="author"]').length > 0) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Determine content type based on extracted data
   */
  private determineContentType(articleData: any, $: CheerioAPI): string {
    // Check for specific content types
    if ($('article').length > 0 && articleData.text) return 'article';
    if ($('[class*="blog"]').length > 0) return 'blog-post';
    if ($('[class*="news"]').length > 0) return 'news-article';
    if ($('[class*="press"]').length > 0) return 'press-release';
    if ($('[class*="review"]').length > 0) return 'review';
    if ($('[class*="opinion"]').length > 0) return 'opinion';
    
    // Default classification
    if (articleData.text && articleData.text.length > 200) return 'article';
    return 'webpage';
  }

  /**
   * Extract category from URL and content
   */
  private extractCategory($: CheerioAPI, url: string): string | undefined {
    // Extract category from URL path
    let urlPath: string;
    try {
      urlPath = new URL(url).pathname.toLowerCase();
    } catch {
      return undefined;
    }
    const urlCategories = {
      '/politics/': 'Politics',
      '/business/': 'Business',
      '/technology/': 'Technology',
      '/tech/': 'Technology',
      '/sports/': 'Sports',
      '/entertainment/': 'Entertainment',
      '/health/': 'Health',
      '/science/': 'Science',
      '/world/': 'World News',
      '/local/': 'Local News',
      '/opinion/': 'Opinion',
      '/lifestyle/': 'Lifestyle',
      '/travel/': 'Travel',
      '/food/': 'Food',
      '/culture/': 'Culture'
    };
    
    for (const [path, category] of Object.entries(urlCategories)) {
      if (urlPath.includes(path)) {
        return category;
      }
    }
    
    // Extract category from meta tags
    const metaSection = $('meta[name="section"]').attr('content') || 
                        $('meta[property="article:section"]').attr('content');
    if (metaSection) {
      return this.normalizeCategory(metaSection);
    }
    
    // Extract category from breadcrumbs
    const breadcrumbs = $('[class*="breadcrumb"] a').map((_, el) => $(el).text()).get();
    if (breadcrumbs.length > 1 && breadcrumbs[1]) {
      return this.normalizeCategory(breadcrumbs[1]);
    }
    
    return undefined;
  }

  /**
   * Extract tags from content and metadata
   */
  private extractTags($: CheerioAPI, articleData: any): string[] {
    const tags = new Set<string>();
    
    // Extract from meta tags
    const metaTags = $('meta[name="keywords"]').attr('content') ||
                     $('meta[property="article:tag"]').attr('content');
    if (metaTags) {
      metaTags.split(',').forEach((tag: string) => tags.add(tag.trim()));
    }
    
    // Extract from article tag elements
    $('[class*="tag"], [class*="category"]').each((_, el) => {
      const tagText = $(el).text().trim();
      if (tagText && tagText.length < 50) {
        tags.add(tagText);
      }
    });
    
    // Extract tags from title if available
    if (articleData.title) {
      const titleWords = articleData.title.toLowerCase().split(/\s+/);
      const commonTags = ['covid', 'ukraine', 'climate', 'election', 'economy', 'ai', 'bitcoin'];
      titleWords.forEach((word: string) => {
        if (commonTags.includes(word)) {
          tags.add(word);
        }
      });
    }
    
    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  /**
   * Detect language from text content
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const englishPattern = /^[a-zA-Z0-9\s.,!?;:'"()-]+$/;
    const arabicPattern = /[\u0600-\u06FF]/;
    const hebrewPattern = /[\u0590-\u05FF]/;
    
    if (arabicPattern.test(text)) return 'ar';
    if (hebrewPattern.test(text)) return 'he';
    if (englishPattern.test(text.substring(0, 100))) return 'en';
    
    return 'en'; // Default to English
  }

  /**
   * Extract fallback title when ArticleExtractor fails
   */
  private extractFallbackTitle($: CheerioAPI): string {
    return $('h1').first().text().trim() || 
           $('title').text().trim() || 
           $('meta[property="og:title"]').attr('content') || 
           'No title available';
  }

  /**
   * Extract fallback content when ArticleExtractor fails
   */
  private extractFallbackContent($: CheerioAPI): string {
    // Try common content selectors
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.story-body',
      'main',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > 100) {
        return content;
      }
    }
    
    // Fallback to body content
    return $('body').text().trim().substring(0, 1000) || 'No content available';
  }

  /**
   * Extract fallback author when ArticleExtractor fails
   */
  private extractFallbackAuthor($: CheerioAPI): string | undefined {
    const authorSelectors = [
      '[class*="author"]',
      '[class*="byline"]',
      'meta[name="author"]',
      'meta[property="article:author"]',
      '.by-author',
      '.author-name'
    ];
    
    for (const selector of authorSelectors) {
      const author = $(selector).attr('content') || $(selector).text().trim();
      if (author && author.length > 0 && author.length < 100) {
        return author;
      }
    }
    
    return undefined;
  }

  /**
   * Normalize category name
   */
  private normalizeCategory(category: string): string {
    return category.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Create fallback classification when extraction fails
   */
  private createFallbackClassification(
    $: CheerioAPI, 
    url: string, 
    options: ClassificationOptions
  ): ContentClassificationResult {
    const fallbackContent = options.extractContent ? {
      title: this.extractFallbackTitle($),
      content: this.extractFallbackContent($),
      author: this.extractFallbackAuthor($),
      publishDate: undefined,
      language: 'en'
    } : undefined;

    return {
      isArticle: false,
      confidence: 0.3,
      contentType: 'webpage',
      category: this.extractCategory($, url),
      tags: options.extractTags ? this.extractTags($, {}) : [],
      extractedContent: fallbackContent,
      crawleeClassification: {
        contentType: 'webpage',
        confidence: 0.3,
        metadata: {
          url,
          extractionFailed: true,
          fallbackUsed: true
        },
        extractedAt: new Date()
      }
    };
  }
}

// Export singleton instance
export const contentClassifier = new ContentClassifier(); 