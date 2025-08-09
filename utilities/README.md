# Veritas Testing Utilities

A comprehensive suite of testing and debugging tools for the Veritas project. All utilities are standalone and can be run directly from the testing directory.

## 📋 Quick Reference

| File | Purpose | Usage |
|------|---------|-------|
| `01-db-setup.ps1` | Database setup & Railway import | `.\01-db-setup.ps1` |
| `02-db-clear.js` | Clear all scraped data | `node 02-db-clear.js --confirm` |
| `03-test-scraper.js` | End-to-end scraper testing | `node 03-test-scraper.js [source] [count]` |
| `04-test-api.js` | Simple API test server | `node 04-test-api.js [port]` |
| `05-test-db-mapping.js` | Test snake_case/camelCase mapping | `node 05-test-db-mapping.js` |
| `06-test-logs.js` | Analyze job logs | `node 06-test-logs.js <jobId> [options]` |

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
Safely removes all scraped content and job data while preserving sources.

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
# Preview what will be deleted
node 02-db-clear.js

# Confirm deletion
node 02-db-clear.js --confirm
```

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

## 🔧 Common Workflows

### Complete Local Testing Setup
```bash
# 1. Setup database
.\01-db-setup.ps1

# 2. Start scraper service
cd services/scraper
npm run dev

# 3. Run scraper test
cd ../../testing
node 03-test-scraper.js

# 4. Analyze results
node 06-test-logs.js <job-id-from-test>
```

### Debug Failed Scraping Job
```bash
# 1. Get job details
node 06-test-logs.js <job-id> --level=error

# 2. Check timeline
node 06-test-logs.js <job-id> --timeline

# 3. View performance metrics
node 06-test-logs.js <job-id> --metrics
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