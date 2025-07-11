# Crawlee Scraper Integration - Veritas Project

**Creation Date**: 11-07-25  
**Last Updated**: 11-07-25  
**Implementation Status**: Not started  

## Project Overview

Integration of Crawlee-based scraping service into Veritas platform to automate news content collection from RSS feeds and article scraping. This will populate the `scraped_content` and `sources` database tables with real content for factoid generation.

## Project Goals

1. **Minimal Integration**: Add scraper service with minimal code complexity
2. **Database Population**: Automatically populate existing DB tables with scraped content
3. **On-Demand Scraping**: Manual trigger from UI for controlled content collection
4. **Proof of Concept**: Demonstrate scraping capability with CNN and Fox News RSS feeds
5. **Foundation for Expansion**: Create extensible architecture for additional sources

## Technical Architecture

### Service Structure
```
services/
├── ui/              # Existing Next.js application
└── scraper/         # New Crawlee-based scraping service (MINIMAL)
    ├── src/
    │   ├── scraper.ts      # Main scraper logic (RSS + Article)
    │   ├── database.ts     # Database operations
    │   └── types.ts        # TypeScript interfaces
    ├── package.json
    └── tsconfig.json
```

### Railway Deployment Structure
```
Railway Project: Veritas (32900e57-b721-494d-8e68-d15ac01e5c03)
├── ui service       # Existing Next.js application
└── scraper service  # New scraper service (separate deployment)
```

### Database Integration
- **Sources Table**: Auto-populate with RSS feed sources
- **Scraped Content Table**: Store full article content with metadata
- **Processing Status**: Track scraping progress and errors

## Implementation Plan

### Phase 1: Initial Implementation

#### Step 1.1: Project Setup
**Dependencies**: None  
**Estimated Completion**: Step 1 completion  

**Tasks**:
- Create `services/scraper` directory structure
- Initialize `package.json` with Crawlee dependencies
- Set up TypeScript configuration matching UI service
- Create basic project structure

**Files to Create**:
- `services/scraper/package.json`
- `services/scraper/tsconfig.json`
- `services/scraper/src/scraper.ts`

#### Step 1.2: Database Connection & Core Logic
**Dependencies**: Step 1.1  
**Estimated Completion**: Step 1 completion  

**Tasks**:
- Create database client using existing Railway PostgreSQL connection
- Implement RSS feed parsing and article scraping in single file
- Add TypeScript interfaces for all operations
- Store scraped content in database

**Files to Create**:
- `services/scraper/src/database.ts`
- `services/scraper/src/types.ts`

#### Step 1.3: UI Integration - API Endpoint
**Dependencies**: Step 1.2  
**Estimated Completion**: Step 1 completion  

**Tasks**:
- Create API endpoint in UI service to trigger scraping
- Add basic logging and error handling

**Files to Create**:
- `services/ui/app/api/scraper/trigger/route.ts`

#### Step 1.4: UI Integration - Settings Page Button
**Dependencies**: Step 1.3  
**Estimated Completion**: Step 1 completion  

**Tasks**:
- Add "Content Scraper" section to settings page
- Create simple trigger button with loading states
- Add basic popup for scraping results

**Files to Modify**:
- `services/ui/app/settings/page.tsx`

### Phase 2: Manual Deployment

#### Step 2.1: Railway Scraper Service Setup
**Dependencies**: Phase 1 completion  
**Estimated Completion**: Manual deployment completion  

**Tasks**:
- Set up dedicated Railway service for scraper
- Configure Railway CLI and link to existing project
- Update `railway.toml` to include scraper service
- Configure environment variables for scraper service

**Railway CLI Commands**:
```bash
# Install Railway CLI (if not already installed)
curl -fsSL https://railway.com/install.sh | sh

# Link to existing Veritas project
railway link -p 32900e57-b721-494d-8e68-d15ac01e5c03

# Deploy scraper service
railway up
```

**Files to Modify**:
- `railway.toml`

#### Step 2.2: Testing and Debugging
**Dependencies**: Step 2.1  
**Estimated Completion**: Manual deployment completion  

**Tasks**:
- Test scraper service locally
- Debug Railway deployment issues
- Validate database connections
- Test UI integration

**Implementation Log**:
- [ ] Document any build configuration changes
- [ ] Record deployment issues and solutions
- [ ] Note any dependency conflicts
- [ ] Document Railway-specific adjustments

### Phase 3: Manual Scraping Triggering

#### Step 3.1: Production Scraping Test
**Dependencies**: Phase 2 completion  
**Estimated Completion**: Manual scraping completion  

**Tasks**:
- Trigger scraping from production UI
- Verify database population
- Test error handling
- Validate content extraction quality

**Implementation Log**:
- [ ] Document successful scraping results
- [ ] Record any content extraction issues
- [ ] Note RSS feed parsing problems
- [ ] Document database population results

#### Step 3.2: Error Resolution
**Dependencies**: Step 3.1  
**Estimated Completion**: Manual scraping completion  

**Tasks**:
- Fix any scraping errors discovered
- Improve content extraction accuracy
- Enhance error logging
- Optimize database operations

**Implementation Log**:
- [ ] Document specific errors encountered
- [ ] Record fixes implemented
- [ ] Note performance improvements
- [ ] Document database optimization changes

### Phase 4: Documentation and Finalization

#### Step 4.1: Documentation Updates
**Dependencies**: Phase 3 completion  
**Estimated Completion**: Project completion  

**Tasks**:
- Update `technical-design.md` with scraper architecture
- Update `developer-guidelines.md` with scraper development practices
- Update `product-requirements.md` with scraper functionality
- Document API endpoints and usage

**Files to Modify**:
- `documentation/technical-design.md`
- `documentation/developer-guidelines.md`
- `documentation/product-requirements.md`

#### Step 4.2: Planning Document Finalization
**Dependencies**: Step 4.1  
**Estimated Completion**: Project completion  

**Tasks**:
- Update this planning document with implementation details
- Document lessons learned
- Create next steps for future enhancements
- Archive implementation logs

## Technical Specifications

### RSS Feed Sources
1. **CNN Top Stories**: `http://rss.cnn.com/rss/cnn_topstories.rss`
2. **Fox News Latest**: `https://moxie.foxnews.com/google-publisher/latest.xml`

### Database Schema Usage

#### Sources Table Population
```sql
-- Auto-insert RSS feed sources
INSERT INTO sources (name, domain, url, description, is_active) VALUES
('CNN', 'cnn.com', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'CNN Top Stories RSS Feed', true),
('Fox News', 'foxnews.com', 'https://moxie.foxnews.com/google-publisher/latest.xml', 'Fox News Latest RSS Feed', true)
ON CONFLICT (domain) DO UPDATE SET 
    url = EXCLUDED.url,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;
```

#### Scraped Content Table Population
```sql
-- Insert scraped article content
INSERT INTO scraped_content (
    source_id, source_url, title, content, author, 
    publication_date, content_type, language, processing_status
) VALUES (
    $1, $2, $3, $4, $5, $6, 'article', 'en', 'completed'
);
```

### Railway Configuration

#### Updated railway.toml
```toml
[[services]]
name = "ui"
source = "services/ui"

[services.ui.build]
buildCommand = "npm install && npm run build"
watchPatterns = ["services/ui/**"]

[services.ui.deploy]
startCommand = "npm run db:init && npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[services.ui.variables]
NODE_ENV = "production"
PORT = "${{PORT}}"

[[services]]
name = "scraper"
source = "services/scraper"

[services.scraper.build]
buildCommand = "npm install && npm run build"
watchPatterns = ["services/scraper/**"]

[services.scraper.deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[services.scraper.variables]
NODE_ENV = "production"
PORT = "${{PORT}}"
DATABASE_URL = "${{DATABASE_URL}}"
```

### Scraper Configuration

#### Minimal Package Dependencies
```json
{
  "dependencies": {
    "crawlee": "^3.5.0",
    "playwright": "^1.40.0",
    "pg": "^8.12.0",
    "rss-parser": "^3.13.0"
  }
}
```

### API Endpoint Specification

#### Scraper Trigger Endpoint
```
POST /api/scraper/trigger
Content-Type: application/json

Request Body:
{
  "sources": ["cnn", "foxnews"],
  "maxArticles": 3
}

Response:
{
  "success": true,
  "message": "Scraping initiated",
  "jobId": "uuid",
  "logs": [
    {
      "timestamp": "2025-01-12T10:30:00Z",
      "level": "info",
      "message": "Starting RSS feed scraping...",
      "source": "cnn"
    }
  ]
}
```

### Error Handling Strategy

1. **RSS Feed Parsing Errors**: Log and continue with available feeds
2. **Article Scraping Failures**: Retry with exponential backoff
3. **Database Connection Issues**: Implement connection pooling and retry logic
4. **Content Extraction Errors**: Fallback to basic text extraction
5. **UI Integration Errors**: Provide clear user feedback and error messages

### Security Considerations

1. **Rate Limiting**: Implement respectful scraping delays
2. **User-Agent Headers**: Use appropriate browser identification
3. **SSL Certificate Validation**: Ensure secure connections
4. **Input Validation**: Sanitize all scraped content before database insertion
5. **Error Information**: Never expose internal errors to UI

### Performance Optimization

1. **Concurrent Scraping**: Limit to 2 concurrent requests
2. **Content Caching**: Store scraped content to avoid re-scraping
3. **Database Indexing**: Utilize existing indexes for performance
4. **Memory Management**: Implement proper cleanup for Playwright instances
5. **Timeout Handling**: Set appropriate timeouts for all operations

## Risk Assessment

### High Risk Items
- **Website Structure Changes**: RSS feeds or article layouts may change
- **Rate Limiting**: Target websites may implement stricter rate limits
- **Railway Resource Limits**: Scraping may consume significant resources

### Medium Risk Items
- **Content Quality**: Extracted content may not be suitable for factoid generation
- **Database Performance**: Large content insertion may slow down database
- **Error Handling**: Complex error scenarios may not be covered

### Low Risk Items
- **UI Integration**: Well-defined interface with existing architecture
- **TypeScript Compatibility**: Consistent with existing codebase
- **Development Workflow**: Follows established project patterns

## Success Criteria

### Phase 1 Success Metrics
- [ ] Scraper service successfully integrated into project structure
- [ ] Database tables populated with scraped content
- [ ] UI button triggers scraping with proper feedback
- [ ] RSS feeds parsed and articles extracted successfully

### Phase 2 Success Metrics
- [ ] Scraper service deployed successfully on Railway
- [ ] All build and deployment issues resolved
- [ ] Production environment fully functional

### Phase 3 Success Metrics
- [ ] Manual scraping produces expected results
- [ ] Database contains properly formatted content
- [ ] Error handling works correctly in production
- [ ] User interface provides clear feedback

### Phase 4 Success Metrics
- [ ] All documentation updated and accurate
- [ ] Planning document reflects actual implementation
- [ ] Future development path clearly defined

## Future Enhancements

### Immediate Next Steps (Post-Phase 4)
1. **Automated Scheduling**: Add cron-based scraping schedule
2. **Additional Sources**: Expand to more RSS feeds and news sources
3. **Content Processing**: Implement basic factoid extraction from scraped content
4. **Error Recovery**: Add automatic retry mechanisms for failed scrapes

### Long-term Enhancements
1. **Social Media Integration**: Add Twitter/X scraping capabilities
2. **Content Filtering**: Implement relevance scoring for scraped content
3. **Real-time Processing**: Add webhook-based scraping triggers
4. **Analytics Dashboard**: Track scraping performance and success rates

## Implementation Notes

### Development Best Practices
- Follow existing TypeScript strict mode requirements
- Implement comprehensive error handling
- Add detailed logging for debugging
- Use existing database connection patterns
- Maintain consistency with UI service architecture

### Testing Strategy
- Unit tests for content extraction utilities
- Integration tests for database operations
- End-to-end tests for complete scraping workflow
- Manual testing for UI integration

### Deployment Considerations
- Ensure scraper service doesn't interfere with UI service
- Configure appropriate resource limits
- Set up monitoring and alerting
- Plan for rollback scenarios

---

## Plan Status

### Implementation Progress
- [ ] Phase 1: Initial Implementation (Not Started)
- [ ] Phase 2: Manual Deployment (Not Started)
- [ ] Phase 3: Manual Scraping Triggering (Not Started)
- [ ] Phase 4: Documentation and Finalization (Not Started)

### Key Decisions Made
- Selected Crawlee over other scraping frameworks for TypeScript compatibility
- Chose RSS feeds as initial content source for simplicity
- Integrated with existing database schema without modifications
- Implemented on-demand scraping to maintain control over resource usage

### Next Actions
1. Begin Phase 1 implementation
2. Set up development environment for scraper service
3. Create initial project structure
4. Implement database connection and basic scraping functionality

**Note**: This planning document will be updated continuously throughout implementation to reflect actual progress, challenges encountered, and solutions implemented. 

**Date Format**: All dates use DD-MM-YY format for consistency. Future planning documents should reference `getPlanningDate()` from `services/ui/lib/utils.ts` to ensure current dates are always used. 