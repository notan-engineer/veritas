# Veritas Product Requirements

**Last Updated**: 11-07-25  
**Product Status**: Core MVP operational, ready for incremental expansion  
**Target Users**: Information-conscious professionals, students, multilingual users

## Product Vision

**Veritas** transforms traditional news consumption by presenting verified information as structured "factoids" instead of lengthy articles. Users get quick, accurate, unbiased news without information overload.

## Core Value Proposition

- **Time Saving**: Extract key facts without reading full articles
- **Accuracy Focus**: Verified information from multiple sources
- **Bias Reduction**: Present facts without editorial opinion
- **Multilingual**: Support English, Hebrew, and Arabic content
- **Clean Interface**: Distraction-free news consumption

## Core Features

### Content Consumption (Primary Interface)
- **Factoid Feed**: Card-based layout displaying verified news facts
- **Topic Filtering**: Dynamic filtering by categories and tags
- **Article Detail Views**: Expandable content with source attribution  
- **RTL Support**: Full Hebrew and Arabic text direction support
- **Responsive Design**: Mobile-optimized interface
- **Dark/Light Themes**: User preference settings

### Content Aggregation System (Advanced)
- **Automated Content Collection**: RSS feed monitoring and article scraping
- **Multi-Source Integration**: Support for CNN, Fox News, and custom RSS feeds
- **Real-time Processing**: Automated content extraction and classification
- **Duplicate Detection**: Content hash-based deduplication across sources
- **Content Archival**: Automated cleanup and compression policies
- **Source Health Monitoring**: RSS feed validation and performance tracking

### Source Management (Administrative)
- **Dynamic Source Configuration**: Add, edit, and remove content sources
- **RSS Feed Validation**: Real-time feed testing and content verification
- **Source Health Monitoring**: Success rates, error tracking, and performance metrics
- **Bulk Operations**: Enable/disable multiple sources simultaneously
- **Source Testing**: Validate RSS feeds and content extraction capabilities

### Content Monitoring Dashboard (Operational)
- **Health Metrics**: Job success rates, content volumes, error statistics
- **Job Management**: Trigger, monitor, and cancel scraping operations
- **Content Feed**: Browse scraped articles with filtering and search
- **Real-time Updates**: Live monitoring of system performance
- **Error Tracking**: Comprehensive error categorization and recovery monitoring
- **Resource Management**: Memory, storage, and performance monitoring

### Technical Features
- **Advanced Error Handling**: Automatic retry with exponential backoff
- **Content Classification**: Automated categorization and tag extraction
- **Performance Optimization**: Concurrent processing with resource management
- **Security**: Input validation, error sanitization, and secure communication
- **API Integration**: RESTful APIs for all system operations

## User Personas

### Primary: Information-Conscious Professional
- **Need**: Stay informed without time waste
- **Behavior**: Quick news checks between meetings
- **Pain Point**: Too much noise in traditional news
- **Solution**: Structured factoids with key information only

### Secondary: Student/Researcher  
- **Need**: Accurate information for academic work
- **Behavior**: Cross-reference multiple sources
- **Pain Point**: Determining source reliability
- **Solution**: Pre-verified facts with clear attribution

### Secondary: Multilingual User
- **Need**: News in Hebrew/Arabic with proper formatting
- **Behavior**: Consume content in multiple languages
- **Pain Point**: Poor RTL support in news sites
- **Solution**: Native RTL support with correct text flow

## Content Strategy

### Factoid Structure
```
Title: Clear, concise headline (max 500 chars)
Description: Context and background (10-10,000 chars)
Bullet Points: Key facts (max 20 points)
Sources: Attribution with links to originals
Language: Auto-detected with proper formatting
```

### Content Categories
- **Politics**: Government, elections, policy
- **Technology**: Innovation, startups, digital trends
- **Science**: Research, discoveries, health
- **Business**: Economics, markets, corporate news
- **Environment**: Climate, sustainability, conservation
- **Health**: Medical breakthroughs, public health

### Quality Standards
- **Multi-source Verification**: Facts confirmed by multiple outlets
- **Recency**: Focus on current events and developments
- **Clarity**: Technical topics explained accessibly
- **Accuracy**: Facts over opinions or speculation

## Technical Requirements

### Performance
- **Page Load**: < 3 seconds on 3G connection
- **Time to Interactive**: < 2 seconds
- **Mobile Optimization**: Responsive design, touch-friendly
- **Accessibility**: Keyboard navigation, screen reader support

### Data Management
- **Content Storage**: PostgreSQL for structured data
- **Media Handling**: Optimized images with Next.js Image
- **Caching**: Static generation where possible
- **Backup**: Automated database backups

### Internationalization
- **RTL Languages**: Hebrew, Arabic text direction
- **Font Support**: Proper rendering for all scripts
- **Date Formatting**: Locale-appropriate formats
- **Cultural Adaptation**: Region-specific content preferences

## Future Features (Not Currently Implemented)

### Phase 1: User Engagement
- **User Accounts**: Personal preferences and history
- **Bookmarking**: Save factoids for later reading
- **Reading History**: Track viewed content
- **Personalization**: Customize topic preferences

### Phase 2: Content Automation
- **RSS Scraping**: Automated content ingestion
- **LLM Processing**: AI-powered factoid extraction
- **Real-time Updates**: Fresh content throughout day
- **Breaking News**: Priority alerts for urgent information

### Phase 3: Community Features
- **Comments**: User discussions on factoids
- **Ratings**: Community verification of accuracy
- **Corrections**: User-submitted fact corrections
- **Sharing**: Social media integration

### Phase 4: Advanced Features
- **Search**: Full-text search across all content
- **Analytics**: Reading patterns and preferences
- **API Access**: Developer access to factoid data
- **Premium Features**: Advanced filtering, export options

## Success Metrics

### Engagement
- **Time on Site**: Average session duration
- **Page Views**: Factoids read per session
- **Return Rate**: Daily/weekly active users
- **Content Completion**: Full factoid read rates

### Quality
- **Source Diversity**: Multiple sources per factoid
- **Update Frequency**: Fresh content daily
- **Error Rate**: Fact correction frequency
- **User Satisfaction**: Feedback and ratings

### Growth
- **User Acquisition**: New users per week
- **Content Volume**: New factoids per day
- **Language Coverage**: Multi-language content ratio
- **Mobile Usage**: Mobile vs desktop traffic

## Content Guidelines

### Editorial Standards
- **Fact-based**: No opinion or editorial content
- **Source Attribution**: Clear links to original articles
- **Verification**: Multiple source confirmation required
- **Neutrality**: Balanced presentation of information
- **Clarity**: Technical topics explained simply

### Prohibited Content
- **Unverified Claims**: Single-source or unconfirmed information
- **Opinion Pieces**: Editorial or opinion content
- **Advertising**: Promotional or sponsored content
- **Sensationalism**: Clickbait or inflammatory headlines
- **Personal Attacks**: Content targeting individuals

## Business Model (Future)

### Revenue Streams
- **Premium Subscriptions**: Advanced features, ad-free experience
- **API Licensing**: Developer access to factoid database
- **White-label Solutions**: Custom news feeds for organizations
- **Data Insights**: Anonymized reading pattern analytics

### Cost Structure
- **Infrastructure**: Database, hosting, CDN costs
- **Content**: Editorial team, fact-checking resources
- **Development**: Feature development and maintenance
- **Operations**: Customer support, legal compliance

## Competitive Positioning

### Differentiators
- **Factoid Format**: Unique structured information presentation
- **Multi-source Verification**: Higher accuracy than single sources
- **RTL Support**: Better multilingual experience
- **Clean Interface**: Distraction-free news consumption
- **Time Efficiency**: Faster information consumption

### Market Position
- **Primary**: Alternative to traditional news websites
- **Secondary**: Complement to social media news consumption
- **Tertiary**: Research tool for students and professionals

## Infrastructure & Deployment

### Railway Services Architecture
The platform runs on three Railway services:
- **UI Service**: Next.js application serving the user interface and factoid display
- **Scraper Service**: Advanced Crawlee-based content aggregation with monitoring dashboard
- **Database Service**: Shared PostgreSQL instance for data storage across services

### Content Processing Pipeline
1. **RSS Monitoring**: Automated monitoring of configured news sources
2. **Content Extraction**: Article parsing and content classification
3. **Duplicate Detection**: Hash-based deduplication across all sources
4. **Content Storage**: Structured storage with metadata and source attribution
5. **Health Monitoring**: Real-time tracking of source performance and system health
6. **Automated Cleanup**: Content archival and storage optimization

### Monitoring & Operations
- **Real-time Dashboard**: 3-tab interface for health, content, and source management
- **Error Recovery**: Automatic retry mechanisms with exponential backoff
- **Performance Tracking**: Resource usage monitoring and optimization
- **Source Health**: RSS feed validation and success rate tracking
- **Job Management**: Visual interface for scraping operations

### Scalability Features
- **Independent Service Scaling**: UI and Scraper services scale independently
- **Resource Management**: Automated cleanup and storage optimization
- **Concurrent Processing**: Multi-source scraping with resource limits
- **Error Resilience**: Comprehensive error handling and recovery systems

### API Architecture
- **RESTful APIs**: Comprehensive endpoint coverage for all operations
- **Service Communication**: HTTP-based communication between UI and Scraper
- **Health Endpoints**: Detailed system health and performance monitoring
- **Authentication Ready**: Architecture supports future authentication implementation

### Development & Deployment
- **Multi-Service Development**: Independent development and testing
- **Automated Deployment**: Railway auto-deployment on code changes
- **Environment Management**: Service-specific environment configuration
- **Monitoring Integration**: Built-in health checks and performance tracking

**Reference**: See `documentation/railway-interface.md` for complete Railway infrastructure management, CLI commands, and deployment procedures. This file is git-ignored and contains sensitive project information.

## Current Status Summary

**Operational**: Core MVP with essential features  
**User Ready**: Functional for information consumption  
**Growth Ready**: Foundation for feature expansion  
**Next Priority**: User feedback collection and content automation

**Key Achievement**: Delivered focused news consumption platform without feature bloat. 