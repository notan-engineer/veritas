# Feature: Job Triggering

## Overview
Interface for manually triggering content scraping jobs with source selection and configuration options.

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
   - Articles per source (1-50)
   - Multi-select source picker
   - Validation and constraints

3. **Source Selection**
   - Checkbox list of available sources
   - Select all/none functionality
   - Active source filtering
   - Source name display

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
2. Configure job parameters
3. Select target sources
4. Submit job request
5. Monitor job progress
6. View results in dashboard

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
- Articles: 1-50 per source
- Only active sources shown
- Duplicate job prevention

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