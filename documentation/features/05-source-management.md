# Feature: Source Management

## Overview
Administrative interface for managing news sources, including adding new sources, configuring scraping parameters, and monitoring source health.

## User Story
As a content administrator, I want to manage news sources and their configurations so that the scraper collects content from reliable, relevant sources.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/components/`
- **Main Component**: `source-management.tsx`
- **Sources Tab**: `sources-tab.tsx`
- **Data Models**: `app/scraper/types.ts`

### Key Features

1. **Source Overview**
   - Total sources count
   - Active sources indicator
   - Success rate metrics
   - Recent activity tracking

2. **Source CRUD Operations**
   - **Create**: Add new RSS sources
   - **Read**: List all sources with health status
   - **Update**: Edit source configurations
   - **Delete**: Remove sources (with confirmation)

3. **Source Configuration**
   - Name and domain
   - RSS feed URL
   - Icon URL (optional)
   - Scraping parameters:
     - Respect robots.txt toggle
     - Request delay (milliseconds)
     - Custom user agent
     - Timeout settings

4. **Source Health Monitoring**
   - Last successful scrape
   - Total articles collected
   - Success/failure counts
   - Error indicators

### UI Components

1. **Source Cards**
   - Visual source representation
   - Health status badges
   - Quick actions (Edit/Delete)
   - Expandable details

2. **Source Form Dialog**
   - Modal-based editing
   - Field validation
   - RSS feed verification
   - Loading states

3. **Metrics Display**
   - Grid layout for stats
   - Color-coded indicators
   - Real-time updates

### Data Flow
1. Load sources with health data
2. Display in card grid
3. Handle CRUD operations
4. Update UI optimistically
5. Sync with backend

### Validation Rules
- Required: Name, Domain, RSS URL
- URL format validation
- Unique source names
- Numeric constraints for delays/timeouts

## Database Schema
```typescript
interface NewsSource {
  id: string;
  name: string;
  domain: string;
  rssUrl: string;
  iconUrl?: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
  userAgent: string;
  timeoutMs: number;
  createdAt: string;
}
```

## API Integration
- **GET /api/scraper/sources**: List all sources
- **POST /api/scraper/sources**: Create new source
- **PUT /api/scraper/sources/:id**: Update source
- **DELETE /api/scraper/sources/:id**: Delete source
- **POST /api/scraper/sources/validate**: Validate RSS feed

## User Workflows

### Adding a Source
1. Click "Add New Source"
2. Fill in source details
3. System validates RSS feed
4. Save source configuration
5. Source appears in list

### Editing a Source
1. Click source card
2. Modify configurations
3. Save changes
4. See updated metrics

## Error Handling
- RSS feed validation errors
- Network connectivity issues
- Duplicate source prevention
- Graceful degradation

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Management](./06-content-management.md) 