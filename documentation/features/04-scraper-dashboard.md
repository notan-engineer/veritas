# Feature: Scraper Dashboard

## Overview
Comprehensive monitoring and management interface for the content scraping system, providing real-time metrics, job tracking, and system health visualization.

## User Story
As a system administrator, I want to monitor scraping operations and performance so that I can ensure content is being collected efficiently and troubleshoot issues.

## Technical Implementation

### Frontend Components
- **Location**: `services/ui/app/scraper/`
- **Main Page**: `page.tsx` - Tab-based interface
- **Dashboard Tab**: `components/dashboard-tab.tsx`
- **Health Dashboard**: `components/health-dashboard.tsx`
- **Job Trigger**: `components/job-trigger.tsx`

### Key Features

1. **Metrics Overview**
   - Jobs triggered count
   - Success rate percentage
   - Total articles scraped (database-based count from scraped_content table)
   - Average job duration
   - Active jobs indicator
   - Recent errors count

2. **Job Management**
   - Real-time job status tracking with granular states
   - Job history displayed in sortable table
   - Expandable job logs with copy functionality
   - Progress indicators
   - Duration calculations
   - Cancel running jobs
   - Status shown with icons and color coding

3. **Job Triggering**
   - Source selection interface
   - Articles per source configuration
   - Validation and error handling
   - Immediate job status feedback
   - Fallback job handling

4. **Health Monitoring**
   - System status indicators
   - Source-specific health metrics
   - Error notifications
   - Recovery action buttons
   - Performance tracking

### Data Flow
1. **Auto-refresh**: 30-second intervals for live data
2. **Parallel Loading**: Multiple API calls simultaneously
3. **Progressive Enhancement**: Show data as it loads
4. **Error Resilience**: Fallback to partial data

### UI Components
- Metric cards with icons
- Sortable table for job history
- Expandable job rows with logs
- Progress bars
- Status badges with color coding
- Loading skeletons
- Error alerts
- Tooltip components for additional context (including per-source article counts)
- Table component with client-side sorting

### State Management
- React hooks for component state
- Polling intervals for live updates
- Expanded state tracking
- Log caching to reduce API calls

## User Workflows

### Monitoring Workflow
1. Navigate to Scraper > Dashboard
2. View real-time metrics
3. Check active jobs
4. Review recent job history
5. Expand jobs for detailed logs

### Troubleshooting Workflow
1. Identify failed jobs
2. Expand to view error logs
3. Check source health status
4. Take recovery actions
5. Re-trigger if needed

## API Integration
- **GET /api/scraper/metrics**: Dashboard metrics (with database-based article counts)
- **GET /api/scraper/jobs**: Job listing (includes per-source article counts)
- **GET /api/scraper/jobs/:id/logs**: Job logs
- **GET /api/scraper/monitoring**: Health data
- **POST /api/scraper/monitoring**: Recovery actions

## Performance Features
- Metrics caching (1-minute TTL)
- Lazy log loading
- Pagination for job history
- Optimistic UI updates

### Job Logs
- Expandable row interface for viewing detailed logs
- Timestamp, level, and message display
- Copy logs to clipboard functionality
- Real-time log retrieval from API
- Helps identify and troubleshoot issues

### Sorting and Filtering
- Client-side sorting for all table columns
- Sort by timestamp, status, duration, etc.
- Maintains sort state during auto-refresh
- Instant sorting without server calls

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Job Triggering](./04a-job-triggering.md)
- [Job Monitoring and Logs](./04b-job-monitoring.md)
- [Source Management](./05-source-management.md) 