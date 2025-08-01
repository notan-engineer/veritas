# Feature: Job Monitoring and Logs

## Overview
Enhanced job monitoring with granular statuses and accessible logs for troubleshooting scraping operations.

## User Story
As a system administrator, I want to view detailed job statuses and logs so that I can monitor scraping progress and troubleshoot issues effectively.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/components/dashboard-tab.tsx`
- **UI Library**: shadcn/ui Table and Tooltip components
- **State Management**: React hooks with auto-refresh

### Key Features

1. **Granular Status Tracking**
   - **new**: Job created but not yet started
   - **in-progress**: Currently processing sources
   - **successful**: All sources completed successfully
   - **partial**: Some sources failed, some succeeded
   - **failed**: All sources failed or critical error occurred

2. **Status Visualization**
   - Color-coded status badges
   - Icon indicators for quick recognition
   - Tooltip components showing additional context
   - Real-time status updates

3. **Expandable Job Logs**
   - Click to expand row and view logs
   - Timestamp, level, and message display
   - Copy logs to clipboard functionality
   - Formatted for readability

4. **Job Details Display**
   - Sources requested with count
   - Articles scraped vs requested
   - Job duration calculation
   - Error count tracking
   - **Content relationship tracking**: View which specific articles were scraped by each job

### Database Implementation

#### Status Enum Type
```sql
CREATE TYPE job_status AS ENUM ('new', 'in-progress', 'successful', 'partial', 'failed');
```

#### Status Transitions
- `new` → `in-progress` (when job starts)
- `in-progress` → `successful` (all sources complete)
- `in-progress` → `partial` (some sources fail)
- `in-progress` → `failed` (critical error or all fail)

#### Job-Content Relationship
- Each `scraped_content` record includes a `job_id` foreign key referencing `scraping_jobs(id)`
- Enables tracking which content was scraped during which job execution
- Supports `ON DELETE SET NULL` to preserve content if job records are cleaned up
- Provides audit trail for content traceability and debugging

### API Integration

#### Job Logs Endpoint
```typescript
GET /api/scraper/jobs/:id/logs

Response:
{
  success: true,
  data: {
    logs: [{
      id: string,
      timestamp: string,
      level: 'info' | 'error' | 'warning',
      message: string,
      additional_data?: object
    }]
  }
}
```

### UI Components

1. **Status Badge Component**
   ```tsx
   <Badge variant={getStatusVariant(job.status)}>
     {getStatusIcon(job.status)} {job.status}
   </Badge>
   ```

2. **Expandable Log Row**
   - Chevron icon for expand/collapse
   - Smooth animation on expansion
   - Log content in monospace font
   - Copy button in top-right

3. **Tooltip Integration**
   - Hover over source count for list
   - Status descriptions on hover
   - Error details in tooltips

### Performance Considerations
- Lazy loading of logs (only fetch when expanded)
- Client-side log caching
- Debounced auto-refresh
- Optimistic UI updates

### Error Handling
- Graceful fallback if logs unavailable
- Clear error messages
- Retry mechanism for failed fetches
- Timeout handling

## User Workflows

### Monitoring Active Jobs
1. View dashboard with auto-refresh
2. See real-time status changes
3. Monitor progress indicators
4. Get notified of completions

### Troubleshooting Failed Jobs
1. Identify jobs with errors
2. Click to expand job row
3. Review detailed logs
4. Copy logs for sharing
5. Take corrective action

### Analyzing Partial Successes
1. Find jobs with "partial" status
2. Check source breakdown
3. View logs for failed sources
4. Identify patterns in failures

## Related Features
- [Scraper Dashboard](./04-scraper-dashboard.md)
- [Content Scraping System](./03-content-scraping.md)
- [Job Triggering](./04a-job-triggering.md)