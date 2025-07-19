# Feature: Article Detail View

## Overview
Individual article page showing comprehensive factoid information with verified facts, sources, and enhanced readability.

## User Story
As a user reading news, I want to see detailed verified facts and their sources so that I can trust the information and explore further if needed.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/article/[id]/page.tsx`
- **Type**: Server-side rendered page
- **Data Source**: Server-side data fetching via `getFactoidById()`

### Key Features
1. **Article Header**
   - Full title display
   - Publication date and time
   - Source attribution badges
   - Social interaction buttons (Like/Dislike - UI only)

2. **Verified Facts Section**
   - Numbered bullet points
   - Visual distinction with background colors
   - Check circle icon for verification indicator
   - RTL support for content

3. **Sources Section**
   - Card-based source display
   - Direct links to original articles
   - Source domain and name
   - External link indicators

4. **About Section**
   - Explanation of Veritas processing
   - Transparency about fact extraction
   - Disclaimer for verification

### Data Flow
1. Dynamic route captures article ID
2. Server-side fetch using `getFactoidById()`
3. 404 handling for non-existent articles
4. Full data hydration before render

### RTL Support
- `getRTLClasses()` for text direction
- `getRTLFlexDirection()` for layout direction
- `getRTLContainerClasses()` for container styling
- Proper alignment for all UI elements

## User Experience
1. User clicks article from feed
2. Server renders full article page
3. Sees comprehensive fact breakdown
4. Can explore original sources
5. Navigate back to feed easily

## Error Handling
- 404 page for missing articles
- Graceful handling of missing data fields
- Fallback UI for incomplete factoids

## Related Features
- [News Feed](./01-news-feed.md)
- [Multilingual Support](./10-multilingual-support.md) 