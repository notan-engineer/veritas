# Feature: Content Management

## Overview
Browse, search, and manage scraped articles with filtering capabilities and detailed article views.

## User Story
As a content editor, I want to browse and search through scraped articles so that I can review content quality and manage the article pipeline.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/components/content-tab.tsx`
- **Content Feed**: `components/content-feed.tsx`
- **Article Detail**: `app/scraper/content/[id]/page.tsx`

### Key Features

1. **Article Browsing**
   - Paginated article list
   - Article cards with preview
   - Expand/collapse functionality
   - Publication date display
   - Source attribution

2. **Search & Filtering**
   - Full-text search
   - Source filtering
   - Language filtering
   - Status filtering (pending/processing/completed/failed)
   - Real-time filter updates

3. **Article Details**
   - Full content display
   - Metadata viewing
   - Source information
   - Processing status
   - Content hash for deduplication

4. **Pagination**
   - Page-based navigation
   - Items per page control
   - Total count display
   - Load more functionality

### Data Structure
```typescript
interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  author?: string;
  sourceUrl: string;
  sourceId: string;
  sourceName?: string;
  publicationDate?: string;
  language: string;
  category?: string;
  tags?: string[];
  contentType: 'article' | 'rss-item';
  processingStatus: ProcessingStatus;
  contentHash: string;
  createdAt: string;
}
```

### UI Components

1. **Content List**
   - Card-based layout
   - Responsive grid
   - Loading skeletons
   - Empty states

2. **Search Bar**
   - Debounced input
   - Clear button
   - Search icon
   - Placeholder text

3. **Filter Controls**
   - Dropdown selects
   - Multi-select for sources
   - Language selector
   - Status badges

4. **Article Preview**
   - Title and excerpt
   - Metadata badges
   - Expand button
   - External link

### Performance Optimizations
- Lazy loading of content
- Search debouncing (500ms)
- Virtual scrolling ready
- Image lazy loading

## User Workflows

### Content Review
1. Navigate to Scraper > Content
2. Browse recent articles
3. Use filters to narrow results
4. Click to expand articles
5. Review full content

### Content Search
1. Enter search terms
2. Select filters
3. View filtered results
4. Paginate through results
5. Open original articles

## API Integration
- **GET /api/scraper/content**: List articles with filters
- **GET /api/scraper/content/:id**: Get article details
- Query parameters:
  - `page`: Page number
  - `pageSize`: Items per page
  - `search`: Text search
  - `source`: Source filter
  - `language`: Language filter
  - `status`: Status filter

## Error Handling
- Failed content loads
- Empty search results
- Network errors
- Graceful degradation

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Source Management](./05-source-management.md)
- [News Feed](./01-news-feed.md) 