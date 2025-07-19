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
   - Total articles scraped
   - Average job duration
   - Active jobs indicator
   - Recent errors count

2. **Job Management**
   - Real-time job status tracking
   - Job history with pagination
   - Expandable job logs
   - Progress indicators
   - Duration calculations
   - Cancel running jobs

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
- Expandable job rows
- Progress bars
- Status badges
- Loading skeletons
- Error alerts

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
- **GET /api/scraper/metrics**: Dashboard metrics
- **GET /api/scraper/jobs**: Job listing
- **GET /api/scraper/jobs/:id/logs**: Job logs
- **GET /api/scraper/monitoring**: Health data
- **POST /api/scraper/monitoring**: Recovery actions

## Performance Features
- Metrics caching (1-minute TTL)
- Lazy log loading
- Pagination for job history
- Optimistic UI updates

## Related Features
- [Content Scraping System](./03-content-scraping.md)
- [Job Triggering](./04a-job-triggering.md)
- [Source Management](./05-source-management.md) 