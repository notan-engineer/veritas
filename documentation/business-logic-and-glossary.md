# Business Logic and Glossary

## Core Business Terms

### Content Terms

**Factoid**
- A structured unit of verified information extracted from news articles
- Contains: title, description, bullet points, sources, language, and tags
- Maximum 500 characters for title, up to 10,000 for description
- Up to 20 bullet points per factoid
- Must be verified by multiple sources when possible

**Bullet Point**
- A single, atomic fact extracted from a news article
- Should be self-contained and understandable without context
- Typically 1-2 sentences maximum
- Free from opinion or editorial content

**Source**
- A news organization or content provider (e.g., CNN, Fox News)
- Contains: name, domain, URL, description, RSS feed URL
- Can be active or inactive
- Tracks scraping configuration and health metrics

**Scraped Content**
- Raw article data collected from news sources
- Stored temporarily before processing into factoids
- Contains: title, content, URL, publication date, source reference, job_id
- Subject to deduplication based on content hash
- Linked to originating scraping job for audit trail and traceability

**Tag**
- A category or topic classifier for factoids
- Examples: Politics, Technology, Science, Business, Environment, Health
- Used for filtering and content discovery
- Many-to-many relationship with factoids

### User Terms

**Information-Conscious Professional**
- Primary user persona
- Values time efficiency and accuracy in news consumption
- Seeks facts without editorial bias
- Typically checks news 2-3 times daily for 5-10 minutes

**Multilingual User**
- Secondary user persona
- Requires proper RTL (Right-to-Left) support
- Consumes content in Hebrew or Arabic
- Expects correct text direction and formatting

**Student/Researcher**
- Secondary user persona
- Needs verified, citable information
- Cross-references multiple sources
- Uses deep-dive features for research

### Technical Terms

**RTL Support**
- Right-to-Left text direction for Hebrew and Arabic
- Includes proper text alignment, UI mirroring, and typography
- Implemented via `rtl-utils.ts` utilities

**Content Aggregation**
- Automated process of collecting articles from multiple sources
- Includes RSS feed monitoring and web scraping
- Runs on scheduled intervals via scraper service

**Deduplication**
- Process of identifying and removing duplicate content
- Based on content hashing algorithms
- Prevents same story from appearing multiple times

**Source Health**
- Metrics tracking source reliability and performance
- Includes: success rate, error count, last successful fetch
- Used to identify and disable problematic sources

**Job Traceability**
- Ability to trace scraped content back to its originating scraping job
- Implemented via job_id foreign key in scraped_content table
- Enables audit trails, debugging, and content attribution
- Supports troubleshooting by linking content issues to specific job execution

### Business Rules

**Content Verification**
- Facts should be confirmed by multiple sources when possible
- Conflicting information should be noted in bullet points
- Source attribution must always be included

**Content Freshness**
- Focus on recent news (typically last 24-48 hours)
- Older content may be archived or removed
- Publication dates must be clearly displayed

**Language Detection**
- Automatic detection of content language
- Proper formatting applied based on language (LTR vs RTL)
- UI elements adjust to language requirements

**Quality Standards**
- No opinion or editorial content in factoids
- Clear, concise writing in bullet points
- Accurate source attribution
- Proper categorization with relevant tags

### Status Values

**Factoid Status**
- `published`: Visible to users in the feed
- `draft`: Being prepared, not yet visible
- `archived`: Older content, removed from main feed

**Source Status**
- `active`: Currently being scraped
- `inactive`: Temporarily disabled
- `error`: Experiencing persistent failures

**Scraping Job Status**
- `new`: Job created but not yet started
- `in-progress`: Currently processing sources
- `successful`: All sources completed successfully
- `partial`: Some sources failed, some succeeded
- `failed`: All sources failed or critical error occurred

### Metrics and Monitoring

**Success Rate**
- Percentage of successful scraping operations per source
- Calculated over rolling time window
- Used to identify problematic sources

**Content Volume**
- Number of articles scraped per time period
- Number of factoids created per time period
- Used for capacity planning

**Error Categories**
- Network errors: Connection failures, timeouts
- Parsing errors: Invalid RSS/HTML structure
- Validation errors: Missing required fields
- Rate limit errors: Too many requests

### UI Patterns

**Sortable Tables**
- Primary pattern for displaying lists of data (jobs, sources)
- Client-side sorting for instant feedback
- Visual indicators for sort direction
- Responsive with horizontal scroll on mobile

**Modal Dialogs**
- Used for focused user actions (job configuration, source editing)
- Blocks background interaction
- Clear primary action button
- Auto-closes on successful completion

**Expandable Rows**
- Used for showing detailed information (job logs)
- Smooth animation on expand/collapse
- Preserves table layout
- Lazy loads content for performance 