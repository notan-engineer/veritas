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

## Current Product Features (MVP)

### 1. News Feed (Homepage)
- **Factoid Cards**: Title, description, bullet points, sources
- **Topic Filtering**: Filter by categories (Politics, Technology, etc.)
- **Real-time Loading**: Skeleton states while content loads
- **RTL Support**: Proper display for Hebrew/Arabic content
- **Responsive Design**: Works on desktop and mobile

### 2. Article Detail View
- **Full Factoid Display**: Complete information with sources
- **Source Attribution**: Links to original articles
- **Navigation**: Back to feed, topic-based browsing
- **Share-ready Format**: Clean, structured information

### 3. User Experience
- **Theme Toggle**: Dark/light mode preference
- **Language Detection**: Automatic RTL layout for Hebrew/Arabic
- **Fast Loading**: Optimized for quick information access
- **Clean Design**: Focus on content, minimal distractions

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

## Current Status Summary

**Operational**: Core MVP with essential features  
**User Ready**: Functional for information consumption  
**Growth Ready**: Foundation for feature expansion  
**Next Priority**: User feedback collection and content automation

**Key Achievement**: Delivered focused news consumption platform without feature bloat. 