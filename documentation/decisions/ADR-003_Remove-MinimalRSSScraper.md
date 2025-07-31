# ADR-003: Remove MinimalRSSScraper and Consolidate to Enhanced Scraper

## Status
Accepted

## Context
The scraper service had two parallel scraper implementations:
- `MinimalRSSScraper` - Simple RSS parsing with basic logging
- `EnhancedRSSScraper` - Advanced scraping with structured JSONB logging, performance monitoring, and comprehensive error handling

Having two scraper implementations created maintenance overhead, code duplication, and potential confusion about which implementation to use for different scenarios. The enhanced scraper provided all capabilities of the minimal scraper plus significant additional functionality for monitoring, debugging, and performance analysis.

The logging system was also fragmented, with basic text-based logging in the minimal scraper versus structured JSONB logging in the enhanced version. This made it difficult to:
- Query and analyze log data effectively
- Implement consistent monitoring across the platform
- Provide detailed debugging information
- Track performance metrics consistently

## Decision
Remove the `MinimalRSSScraper` implementation entirely and make `EnhancedRSSScraper` the single scraper implementation for the service. All scraping operations will use the enhanced implementation with its structured JSONB logging system.

## Consequences

### Positive
- **Reduced Code Complexity**: Single scraper implementation eliminates maintenance of parallel codebases
- **Enhanced Observability**: All scraping operations now use structured JSONB logging with comprehensive performance, HTTP, and extraction event tracking
- **Better Debugging**: Detailed correlation tracking, performance snapshots, and quality scoring provide much better debugging capabilities
- **Improved Monitoring**: Performance monitoring, memory tracking, and error categorization enable proactive system management
- **Consistent Logging**: All logs now use the same structured format with queryable JSONB fields and optimized indexes
- **Future-Proof Architecture**: Enhanced logger supports extensible event types and correlation tracking for complex debugging scenarios

### Negative
- **Slightly Higher Resource Usage**: Enhanced logging uses more database storage and CPU for JSONB operations
- **Migration Complexity**: Existing references to minimal scraper needed to be updated throughout the codebase
- **Learning Curve**: More complex logging structure requires understanding of JSONB query patterns

### Neutral
- **API Compatibility**: All existing API endpoints continue to work with the enhanced scraper
- **Configuration**: Same source configuration format works with enhanced implementation
- **Job Management**: Job lifecycle and status management remain unchanged

## Alternatives Considered

1. **Keep Both Implementations**: Continue maintaining both scrapers for different use cases
   - Rejected due to maintenance overhead and code duplication
   - No clear scenarios where minimal scraper was actually preferred

2. **Extract Common Interface**: Create shared interface and keep both implementations
   - Rejected as adding unnecessary abstraction layer
   - Enhanced scraper already handled all use cases effectively

3. **Gradual Migration**: Slowly migrate features from minimal to enhanced over time
   - Rejected as enhanced scraper was already feature-complete
   - Would extend the period of maintaining duplicate code

## Implementation Notes

### Files Removed
- `services/scraper/src/minimal-scraper.ts` - Complete file deletion

### Files Modified
- `services/scraper/src/api-server.ts` - Removed minimal scraper import and usage
- `services/scraper/src/enhanced-scraper.ts` - Now uses EnhancedLogger class for all logging operations

### New Utilities Created
- `services/scraper/src/enhanced-logger.ts` - Comprehensive structured logging with JSONB support
- `services/scraper/src/log-queries.ts` - Helper functions for querying structured log data
- `services/scraper/src/test-logs.ts` - Utilities for testing logging functionality
- `services/scraper/src/clear-data.ts` - Data cleanup script for development and testing

### Database Changes
- Added JSONB indexes to optimize queries on `scraping_logs.additional_data` field
- Enhanced table comments to reflect structured logging capabilities

### Migration Strategy
1. All existing jobs continue to work without interruption
2. Enhanced logging provides more detailed information than previous implementation
3. Log query patterns updated to leverage new JSONB structure
4. Performance monitoring now active by default for all scraping operations