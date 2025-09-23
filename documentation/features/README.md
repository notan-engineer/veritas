# Veritas Features Documentation

## Overview
This directory contains comprehensive documentation for all features implemented in the Veritas news aggregation platform. Each feature is documented with user stories, technical implementation details, and related components.

## Feature Categories

### Core User Features
1. **[News Feed (Factoid Display)](./01-news-feed.md)**
   - Main homepage with verified news facts
   - Topic filtering and card-based layout
   - Multilingual content support

2. **[Article Detail View](./02-article-detail.md)**
   - Individual factoid pages
   - Verified facts breakdown
   - Source attribution and links

### Content Management
3. **[Content Scraping System](./03-content-scraping.md)**
   - Automated RSS feed monitoring
   - Article extraction with Crawlee
   - Content deduplication

4. **[Scraper Dashboard](./04-scraper-dashboard.md)**
   - Real-time job monitoring with sortable tables
   - Performance metrics
   - System health tracking

4a. **[Job Triggering](./04a-job-triggering.md)**
   - Modal-based job configuration
   - Multi-select source checklist
   - Large-scale scraping support

4b. **[Job Monitoring and Logs](./04b-job-monitoring.md)**
   - Granular status tracking
   - Expandable job logs
   - Troubleshooting tools

5. **[Source Management](./05-source-management.md)**
   - Add/edit news sources
   - Configure scraping parameters
   - Monitor source health

6. **[Content Management](./06-content-management.md)**
   - Browse scraped articles
   - Search and filtering
   - Content review workflow

### User Experience
7. **[Settings Page](./07-settings-page.md)**
   - User preferences (planned)
   - App configuration
   - Development roadmap display

8. **[Dark Mode Support](./09-dark-mode.md)**
   - System-wide theme toggle
   - Persistent preferences
   - WCAG compliant colors

9. **[Multilingual Support](./10-multilingual-support.md)**
   - RTL language support
   - Hebrew and Arabic layouts
   - Locale-specific formatting

### Technical Infrastructure
10. **[API System](./08-api-system.md)**
    - RESTful endpoints
    - Inter-service communication
    - Error handling and validation

11. **[Enhanced Logging System](./11-enhanced-logging.md)**
    - Two-phase extraction and persistence tracking
    - JSONB-structured logging with correlation tracking
    - Performance monitoring and quality scoring
    - Advanced debugging with correlation IDs

12. **[Advanced Content Extraction System](./12-content-extraction.md)**
    - Multi-strategy extraction (JSON-LD, selectors, meta tags)
    - Paragraph preservation with proper spacing
    - Structural filtering for promotional content
    - Real-time extraction tracking for debugging

## Feature Status

### ✅ Implemented
- News Feed with factoid display
- Article detail pages
- Content scraping with Crawlee
- Enhanced structured logging with JSONB analytics
- Scraper dashboard with sortable tables
- Enhanced job monitoring with granular statuses
- Modal-based job triggering
- Source management with table UI
- Content browsing and search
- Dark mode toggle
- RTL language support
- Core API endpoints with source testing
- Performance monitoring and correlation tracking
- Advanced content extraction with paragraph preservation
- Structural filtering for promotional content
- Real-time extraction tracking system

### 🚧 In Progress
- User preference storage
- Advanced filtering options
- Real-time notifications

### 📋 Planned
- User authentication
- Personalization features
- Email digest
- Advanced analytics
- Mobile app
- AI-powered summarization

## Architecture Overview
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   UI Service │────▶│ API Gateway  │────▶│   Database  │
│  (Next.js)  │     │   (Routes)   │     │ (PostgreSQL)│
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     ▲
       │                    │                     │
       └────────────────────┼─────────────────────┘
                           │
                    ┌──────▼───────┐
                    │Scraper Service│
                    │  (Express)    │
                    └───────────────┘
```

## Development Guidelines
- Features follow the Keystone framework principles
- Each feature has comprehensive documentation
- Code is minimal and maintainable
- All UI components support dark mode
- RTL languages are properly handled

## Contributing
When adding new features:
1. Create a new numbered feature document
2. Follow the existing documentation template
3. Update this README index
4. Link related features
5. Include user stories and technical details

## Related Documentation
- [Software Architecture](../software-architecture.md)
- [Business Logic & Glossary](../business-logic-and-glossary.md)
- [Development Principles](../../keystone/development-principles.md) 