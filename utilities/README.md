# Veritas Testing Utilities

A comprehensive suite of testing and debugging tools for the Veritas project. All utilities are standalone and can be run directly from the testing directory.

## 📋 Quick Reference

| File | Purpose | Usage |
|------|---------|-------|
| `01-db-setup.ps1` | Database setup & Railway import | `.\01-db-setup.ps1` |
| `02-db-clear.js` | Clear all scraped data | `node 02-db-clear.js --confirm [--production]` |
| `03-test-scraper.js` | End-to-end scraper testing | `node 03-test-scraper.js [source] [count]` |
| `04-test-api.js` | Simple API test server | `node 04-test-api.js [port]` |
| `05-test-db-mapping.js` | Test snake_case/camelCase mapping | `node 05-test-db-mapping.js` |
| `06-test-logs.js` | Analyze job logs | `node 06-test-logs.js <jobId> [options]` |
| `07-extraction-analyzer.js` | Scraper extraction debugging with HTML export | `node 07-extraction-analyzer.js [source] [output.html]` |
| `08-analyze-all-sources.js` | Batch analyze all sources | `node 08-analyze-all-sources.js` |
| `09-e2e-extraction-test.js` | E2E extraction quality test | `node 09-e2e-extraction-test.js` |
| `10-test-spacing.js` | Validate paragraph spacing | `node 10-test-spacing.js` |
| `11-validate-extraction.js` | Validate content preservation | `node 11-validate-extraction.js` |
| `test-crawlee-storage.js` | Test Crawlee storage configuration | `node test-crawlee-storage.js` |

**Note:** For advanced debugging scenarios, consider using **Playwright MCP** through Claude Code for:
- Visual site structure analysis
- JavaScript-heavy content debugging  
- Dynamic content extraction testing
- Cross-browser compatibility verification

## 🚀 Getting Started

### Prerequisites
- PostgreSQL installed locally
- Node.js 18+ installed
- Railway CLI (for importing production data)

### Initial Setup

1. **Set up local database with Railway data:**
   ```powershell
   .\01-db-setup.ps1
   # Choose option 1 for full setup
   ```

2. **Configure environment:**
   Create `services/scraper/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/veritas_local
   NODE_ENV=development
   PORT=3001
   DEBUG=true
   ```

3. **Test the setup:**
   ```bash
   node 03-test-scraper.js
   ```

## 📚 Detailed Tool Documentation

### 01-db-setup.ps1 - Database Setup Tool
PowerShell script for database initialization and Railway data import.

**Features:**
- Create local PostgreSQL database
- Export data from Railway production
- Import data to local database
- Verify data integrity

**Menu Options:**
1. Full setup (recommended for first time)
2. Create database only
3. Import existing dump
4. Export Railway data only

**Example:**
```powershell
.\01-db-setup.ps1
# Select option 1 for complete setup
```

---

### 02-db-clear.js - Database Cleanup
Safely removes all scraped content and job data while preserving sources. Supports both local and production databases.

**What it clears:**
- All scraping jobs
- All scraping logs  
- All scraped content
- All archived content
- Factoid-source relationships

**What it preserves:**
- Source definitions
- User settings
- System configuration

**Usage:**
```bash
# Preview what will be deleted (local)
node 02-db-clear.js

# Clear local database
node 02-db-clear.js --confirm

# Preview what will be deleted (production)
node 02-db-clear.js --production

# Clear production database
node 02-db-clear.js --confirm --production
# or
node 02-db-clear.js --confirm --prod
```

**Requirements for production:**
- Railway CLI installed and authenticated
- Project linked: `railway link -p 32900e57-b721-494d-8e68-d15ac01e5c03`

---

### 03-test-scraper.js - Scraper Testing
Complete end-to-end testing of the scraping workflow.

**Tests performed:**
1. Health check
2. Source retrieval
3. Job triggering
4. Real-time monitoring
5. Log analysis
6. Content verification

**Usage:**
```bash
# Test default (BBC News, 3 articles)
node 03-test-scraper.js

# Test specific source
node 03-test-scraper.js "CNN" 5

# Test all available sources
node 03-test-scraper.js "ALL" 2
```

**Environment Variables:**
- `SCRAPER_URL`: Override scraper URL (default: http://localhost:3001)

---

### 04-test-api.js - API Test Server
Lightweight Express server for testing database operations and API endpoints.

**Endpoints:**
- `GET /health` - Server health check
- `GET /api/sources` - List all sources
- `GET /api/sources/:id` - Get single source
- `GET /api/jobs` - List scraping jobs
- `GET /api/jobs/:id` - Get job details with logs
- `GET /api/content` - Get scraped content
- `GET /api/stats` - Database statistics
- `POST /api/test/create-job` - Create test job
- `DELETE /api/test/clear` - Clear test data

**Usage:**
```bash
# Start on default port (3001)
node 04-test-api.js

# Start on custom port
node 04-test-api.js 3002

# Test endpoints
curl http://localhost:3001/api/stats
```

---

### 05-test-db-mapping.js - Field Mapping Test
Verifies snake_case to camelCase field conversion.

**Tests:**
- Sources table mapping
- Jobs table mapping
- Content table mapping
- Complex JOIN queries
- Field accessibility

**Usage:**
```bash
node 05-test-db-mapping.js
```

**Expected output:**
```
✓ All critical fields mapped correctly
✓ snake_case fields properly converted to camelCase
```

---

### 06-test-logs.js - Log Analysis Tool
Advanced log analysis with metrics and performance insights.

**Features:**
- Job timeline visualization
- Performance metrics
- Error aggregation
- Source-specific analysis
- HTTP response time statistics
- Extraction quality metrics

**Usage:**
```bash
# Basic usage
node 06-test-logs.js <jobId>

# With options
node 06-test-logs.js abc-123 --limit=100 --level=error

# Show timeline and metrics
node 06-test-logs.js abc-123 --timeline --metrics
```

**Options:**
- `--limit=N`: Number of logs to display (default: 50)
- `--level=LEVEL`: Filter by level (error, warning, info, debug)
- `--timeline`: Show job lifecycle events
- `--metrics`: Show performance metrics

---

### 07-extraction-analyzer.js - Extraction Debug Report Generator
Quick and simple tool that performs real scraping and exports a comprehensive HTML report for debugging extraction issues.

**Features:**
- Performs actual article scraping via RSS feeds
- Generates self-contained HTML report (no external dependencies)
- Side-by-side view of raw HTML source and extracted content
- Shows which extraction method succeeded (JSON-LD, Selectors, Fallback)
- Displays all selector matches and misses
- Visual article preview using clean formatting
- Exports everything to a single HTML file for easy sharing

**Usage:**
```bash
# Interactive mode - select source from menu
node 07-extraction-analyzer.js

# Analyze specific source
node 07-extraction-analyzer.js "BBC News"

# Custom output file
node 07-extraction-analyzer.js "BBC News" debug-report.html
```

**What it does:**
1. Fetches RSS feed from selected source
2. Scrapes first 3 articles from the feed
3. Captures raw HTML and extraction results for each
4. Generates a comprehensive HTML report with:
   - Side-by-side source HTML and extracted content
   - Extraction method details (JSON-LD, Selectors, Fallback)
   - Selector analysis showing all matches/misses
   - Clean article preview with formatting
   - Navigation between multiple articles

**Output:**
- Self-contained HTML file (no external dependencies)
- Opens directly in any browser
- Includes all styling and interactivity
- Easy to share for debugging collaboration

**Best for:**
- Debugging extraction failures
- Understanding which selectors are working
- Identifying site structure changes
- Fine-tuning extraction strategies
- Sharing debug information with team

---

### 08-analyze-all-sources.js - Batch Source Analysis
Runs extraction analyzer on all configured news sources for comprehensive testing.

**Features:**
- Analyzes all sources automatically
- Generates individual reports per source
- Provides summary of successes/failures
- Useful for regression testing after changes

**Usage:**
```bash
# Analyze all sources (3 articles each)
node 08-analyze-all-sources.js
```

**Output:**
- Multiple HTML reports in `utility-output/`
- Summary statistics for all sources
- Identifies sources with issues

---

### 09-e2e-extraction-test.js - End-to-End Extraction Test
Comprehensive E2E testing to validate extraction quality across all sources.

**Features:**
- Tests content extraction completeness
- Validates paragraph spacing preservation
- Checks content quality metrics
- Identifies potential extraction issues

**Usage:**
```bash
# Run E2E tests on all sources
node 09-e2e-extraction-test.js
```

**Output:**
- Console output with detailed metrics per source
- Quality checks (content length, paragraph count)
- Warnings for potential issues

---

### 10-test-spacing.js - Paragraph Spacing Validator
Validates that paragraph spacing (triple newlines) is working correctly across sources.

**Features:**
- Tests paragraph separation logic
- Validates spacing preservation
- Checks for spacing consistency
- Quick validation after code changes

**Usage:**
```bash
# Test paragraph spacing across all sources
node 10-test-spacing.js
```

**Output:**
- Spacing analysis per source
- Success/failure indicators
- Sample paragraph output with visual spacing

---

### 11-validate-extraction.js - Content Preservation Validator
Ensures content filtering doesn't accidentally remove legitimate article content.

**Features:**
- Validates filtering safety
- Checks for false positives
- Tests across multiple sources
- Ensures content preservation

**Usage:**
```bash
# Validate extraction doesn't lose content
node 11-validate-extraction.js
```

**Output:**
- Safety analysis per source
- Risk assessment for filtering
- Confirmation of content preservation

## 🔧 Common Workflows

### Complete Local Testing Setup
```bash
# 1. Setup database
.\01-db-setup.ps1

# 2. Start scraper service
cd services/scraper
npm run dev

# 3. Run scraper test
cd ../../utilities
node 03-test-scraper.js

# 4. Analyze results
node 06-test-logs.js <job-id-from-test>
```

### Extraction Quality Testing Workflow
```bash
# Test extraction on all sources
node 08-analyze-all-sources.js

# Run comprehensive E2E test
node 09-e2e-extraction-test.js

# Validate paragraph spacing
node 10-test-spacing.js

# Ensure no content is lost
node 11-validate-extraction.js

# Generate detailed report for specific source
node 07-extraction-analyzer.js "Fox News"
```

### Quick Validation After Code Changes
```bash
# After modifying extraction logic:
cd services/scraper
npm run rebuild

# Test extraction quality
cd ../../utilities
node 10-test-spacing.js
node 11-validate-extraction.js

# If issues found, debug specific source
node 07-extraction-analyzer.js "BBC News" debug.html
```

### Comprehensive Testing Before Deploy
```bash
# 1. Clear and rebuild
cd services/scraper
npm run rebuild

# 2. Run all extraction tests
cd ../../utilities
node 09-e2e-extraction-test.js

# 3. Generate analysis reports
node 08-analyze-all-sources.js

# 4. Review generated HTML reports in utility-output/
```

### Test Crawlee Storage Configuration
```bash
# Verify Crawlee storage modes for both environments
node test-crawlee-storage.js

# Output shows:
# - Development mode: file system storage
# - Production mode: in-memory storage
# This ensures proper configuration per ADR-004
```

### Database Cleanup Workflow
```bash
# Clear all scraped content (preserves sources)
node 02-db-clear.js --confirm

# For production (requires confirmation)
node 02-db-clear.js --production --confirm
```

### Debug Failed Scraping Job
```bash
# 1. Get job details
node 06-test-logs.js <job-id> --level=error

# 2. Check timeline
node 06-test-logs.js <job-id> --timeline

# 3. View performance metrics
node 06-test-logs.js <job-id> --metrics

# 4. Generate extraction debug report
node 07-extraction-analyzer.js "Source Name"
# Open generated HTML file in browser
```

### Debug Content Extraction Issues
```bash
# 1. Interactive mode - select source from menu
node 07-extraction-analyzer.js

# 2. Analyze specific source directly
node 07-extraction-analyzer.js "BBC News"

# 3. Custom output file
node 07-extraction-analyzer.js "BBC News" bbc-debug.html

# 4. Open generated HTML report:
#    - Side-by-side source HTML and extracted content
#    - Extraction method details (JSON-LD, Selectors, Fallback)
#    - Selector analysis showing what matched
#    - Visual highlighting of extracted sections
```

### Reset and Start Fresh
```bash
# 1. Clear all data
node 02-db-clear.js --confirm

# 2. Re-import from Railway
.\01-db-setup.ps1
# Choose option 3

# 3. Test with fresh data
node 03-test-scraper.js
```

## 📝 Environment Configuration

All tools respect the following environment variables:

```env
# Database connection (required)
DATABASE_URL=postgresql://user:pass@host:port/database

# Scraper service URL (optional)
SCRAPER_URL=http://localhost:3001

# API server port (optional)
PORT=3001

# Enable debug output (optional)
DEBUG=true
```

Tools will look for `.env` file in:
1. Current directory (`testing/`)
2. Scraper service directory (`services/scraper/`)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify database exists
psql -U postgres -l | grep veritas_local

# Test connection string
node -e "console.log(process.env.DATABASE_URL)"
```

### Scraper Not Responding
```bash
# Check if scraper is running
curl http://localhost:3001/health

# Check for port conflicts
netstat -an | grep 3001

# Start scraper manually
cd services/scraper
npm run dev
```

### Import/Export Issues
```bash
# Verify Railway connection
railway status

# Check dump file exists
ls *.sql

# Try manual import
psql -U postgres veritas_local < veritas_prod_dump.sql
```

## 📊 Performance Tips

1. **For large datasets**: Use `--limit` flag to reduce output
2. **For debugging**: Enable `DEBUG=true` in environment
3. **For monitoring**: Use `--timeline` and `--metrics` together
4. **For automation**: All tools support non-interactive mode

## 🔐 Security Notes

- Never commit `.env` files
- Database dumps may contain sensitive data
- Use `--confirm` flags to prevent accidental data deletion
- API test server has no authentication - use only locally

## 📦 Dependencies

All utilities use standard Node.js packages:
- `pg`: PostgreSQL client
- `express`: API server framework
- `cors`: CORS middleware
- `dotenv`: Environment variable management

Install if needed:
```bash
npm install pg express cors dotenv
```

## 🤝 Contributing

When adding new testing utilities:
1. Follow the naming convention: `XX-purpose.js`
2. Include clear usage instructions in file header
3. Support both interactive and non-interactive modes
4. Update this README with documentation
5. Test on both Windows and Unix systems