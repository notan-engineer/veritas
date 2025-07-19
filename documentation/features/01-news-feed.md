# Feature: News Feed (Factoid Display)

## Overview
The core feature of Veritas - displays verified news facts in a clean, card-based interface with topic filtering and multilingual support.

## User Story
As an information-conscious user, I want to browse verified news facts quickly so that I can stay informed without information overload.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/page.tsx`
- **Components**: Factoid cards, topic filter, loading skeletons
- **Data Source**: `/api/factoids` and `/api/tags` endpoints

### Key Features
1. **Topic Filtering**
   - Dynamic tag-based filtering
   - "All" option to view all factoids
   - Real-time filter updates

2. **Factoid Cards**
   - Title, description, bullet points
   - Source attribution
   - Publication date with locale formatting
   - Language indicators
   - Expand/collapse functionality

3. **RTL Support**
   - Automatic text direction for Hebrew/Arabic
   - Proper UI mirroring
   - Locale-specific date formatting

4. **Responsive Design**
   - Mobile-optimized cards
   - Scrollable topic filters on mobile
   - Adaptive text sizes

### API Integration
- **GET /api/factoids**: Fetches all published factoids with tags and sources
- **GET /api/tags**: Retrieves available topic tags
- Fallback to mock data when database unavailable

### State Management
- React hooks for local state
- Loading states during data fetching
- Expanded card tracking

## User Experience
1. User lands on homepage
2. Sees loading skeleton briefly
3. Factoid cards appear with topic filters
4. Can filter by topic instantly
5. Can expand cards for more details
6. Can click through to full article view

## Related Features
- [Article Detail View](./02-article-detail.md)
- [API System](./08-api-system.md)
- [Multilingual Support](./10-multilingual-support.md) 