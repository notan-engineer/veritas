import { NextRequest, NextResponse } from 'next/server';

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  createdAt: string;
}

interface ContentResponse {
  content: ScrapedArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Mock scraped articles data
const mockArticles: ScrapedArticle[] = [
  {
    id: 'article-001',
    title: 'Breaking: Major Technology Breakthrough Announced',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
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
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
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
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
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
  },
  {
    id: 'article-004',
    title: 'Healthcare Innovation Saves Lives in Rural Areas',
    content: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.',
    author: 'Dr. Smith',
    sourceUrl: 'https://example.com/article-4',
    sourceName: 'Medical Journal',
    publicationDate: new Date(Date.now() - 10800000).toISOString(),
    language: 'en',
    category: 'Healthcare',
    tags: ['healthcare', 'innovation', 'rural'],
    contentType: 'article',
    processingStatus: 'completed',
    contentHash: 'jkl012',
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'article-005',
    title: 'Space Exploration Reaches New Milestone',
    content: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
    author: 'Space Reporter',
    sourceUrl: 'https://example.com/article-5',
    sourceName: 'Space News',
    publicationDate: new Date(Date.now() - 14400000).toISOString(),
    language: 'en',
    category: 'Science',
    tags: ['space', 'exploration', 'milestone'],
    contentType: 'article',
    processingStatus: 'completed',
    contentHash: 'mno345',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'article-006',
    title: 'Sports Championship Ends with Surprising Victory',
    content: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
    author: 'Sports Writer',
    sourceUrl: 'https://example.com/article-6',
    sourceName: 'Sports Today',
    publicationDate: new Date(Date.now() - 18000000).toISOString(),
    language: 'en',
    category: 'Sports',
    tags: ['sports', 'championship', 'victory'],
    contentType: 'article',
    processingStatus: 'completed',
    contentHash: 'pqr678',
    createdAt: new Date(Date.now() - 18000000).toISOString()
  }
];

/**
 * GET /api/scraper/content
 * Retrieve scraped content with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ContentResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const source = searchParams.get('source');
    const language = searchParams.get('language');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Try to get data from scraper service first
    try {
      const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3001';
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(source && { source }),
        ...(language && { language }),
        ...(status && { status }),
        ...(search && { search }),
        ...(category && { category })
      });

      const response = await fetch(`${scraperServiceUrl}/api/content?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const scraperData = await response.json();
        return NextResponse.json({
          success: true,
          data: scraperData,
          message: 'Content retrieved from scraper service'
        });
      }
    } catch (error) {
      console.log('Scraper service unavailable, trying database');
    }

    // Try to get scraped content from database
    try {
      const { railwayDb } = await import('@/lib/railway-database');
      
      let query = `
        SELECT sc.*, s.name as source_name, s.domain as source_domain 
        FROM scraped_content sc 
        JOIN sources s ON sc.source_id = s.id 
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (source) {
        query += ` AND s.name ILIKE $${params.length + 1}`;
        params.push(`%${source}%`);
      }
      
      if (language) {
        query += ` AND sc.language = $${params.length + 1}`;
        params.push(language);
      }
      
      if (status) {
        query += ` AND sc.processing_status = $${params.length + 1}`;
        params.push(status);
      }
      
      if (search) {
        query += ` AND (sc.title ILIKE $${params.length + 1} OR sc.content ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY sc.created_at DESC`;
      
      // Apply pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit);
      params.push(offset);
      
      const result = await railwayDb.query(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM scraped_content sc 
        JOIN sources s ON sc.source_id = s.id 
        WHERE 1=1
      `;
      const countParams: any[] = [];
      
      if (source) {
        countQuery += ` AND s.name ILIKE $${countParams.length + 1}`;
        countParams.push(`%${source}%`);
      }
      
      if (language) {
        countQuery += ` AND sc.language = $${countParams.length + 1}`;
        countParams.push(language);
      }
      
      if (status) {
        countQuery += ` AND sc.processing_status = $${countParams.length + 1}`;
        countParams.push(status);
      }
      
      if (search) {
        countQuery += ` AND (sc.title ILIKE $${countParams.length + 1} OR sc.content ILIKE $${countParams.length + 1})`;
        countParams.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }
      
      const countResult = await railwayDb.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Transform database results to match expected interface
      const articles = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title || 'Untitled',
        content: row.content || '',
        author: row.author,
        publicationDate: row.publication_date,
        sourceName: row.source_name,
        sourceDomain: row.source_domain,
        sourceUrl: row.source_url,
        contentType: row.content_type,
        language: row.language,
        processingStatus: row.processing_status,
        createdAt: row.created_at
      }));
      
      const hasMore = offset + limit < total;

      const response: ContentResponse = {
        content: articles,
        total,
        page,
        pageSize: limit,
        hasMore
      };

      return NextResponse.json({
        success: true,
        data: response,
        message: `Retrieved ${articles.length} articles from database`
      });
      
    } catch (dbError) {
      console.log('Database also unavailable:', dbError);
      
      // Return empty result instead of mock data
      const response: ContentResponse = {
        content: [],
        total: 0,
        page,
        pageSize: limit,
        hasMore: false
      };

      return NextResponse.json({
        success: true,
        data: response,
        message: 'No scraped content available - scraper service and database unavailable'
      });
    }

  } catch (error) {
    console.error('[Content API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve content'
    }, { status: 500 });
  }
} 