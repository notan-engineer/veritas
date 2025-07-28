# Feature: Job Triggering

## Overview
Streamlined modal interface for manually triggering content scraping jobs with multi-select source selection and configuration options.

## User Story
As a content administrator, I want to manually trigger scraping jobs so that I can collect fresh content on-demand from specific sources.

## Technical Implementation

### Frontend Component
- **Location**: `services/ui/app/scraper/components/job-trigger.tsx`
- **Type**: Modal-based form interface
- **Integration**: Header button on scraper page

### Key Features

1. **Trigger Button**
   - Prominent placement in header
   - Icon and text label
   - Opens modal dialog

2. **Job Configuration**
   - Articles per source (1-1000)
   - Multi-select source checklist
   - All sources selected by default
   - Validation and constraints

3. **Source Selection**
   - Checkbox list in scrollable container
   - Select all/none buttons
   - All sources selected by default
   - Active source filtering
   - Source name display
   - Summary of selection (X sources × Y articles)

4. **Job Submission**
   - Form validation
   - Loading states
   - Success/error feedback
   - Automatic modal close

5. **Job Status Tracking**
   - Real-time status updates
   - Progress monitoring
   - Error notifications
   - Completion alerts

### Workflow
1. Click "Trigger Scraping Job"
2. Modal opens with all sources pre-selected
3. Adjust source selection if needed
4. Set articles per source count
5. Submit job with single click
6. Monitor job progress in dashboard

### API Integration
```typescript
POST /api/scraper/trigger
{
  sources: string[],      // Source names
  maxArticles: number     // Per source limit
}
```

### Validation Rules
- At least one source required
- Articles: 1-1000 per source
- Only active sources shown
- Duplicate job prevention
- Support for large-scale scraping (100 sources × 1,000 articles)

### Error Handling
- Network failures
- Invalid source detection
- Scraper service unavailable
- Fallback job creation

### Accessibility Features
- Form labels with `htmlFor`
- Input `id` attributes
- Semantic HTML structure
- Keyboard navigation

## UI States

### Initial State
- Button in header
- No modal visible

### Configuration State
- Modal open
- Form inputs active
- Sources loaded

### Loading State
- Submit button disabled
- Loading spinner
- Inputs disabled

### Success State
- Modal closes
- Dashboard refreshes
- Job appears in list

### Error State
- Error message shown
- Form remains open
- Retry available

## Related Features
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Scraping System](./03-content-scraping.md)
- [Source Management](./05-source-management.md) 