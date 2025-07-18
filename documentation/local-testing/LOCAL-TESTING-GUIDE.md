# Veritas Scraper - Local Testing Guide

## Prerequisites

1. **PostgreSQL installed locally** (download from https://www.postgresql.org/download/windows/)
2. **Node.js 18+** installed
3. **Railway CLI** installed and linked to project

## Setup Steps

### 1. Database Setup

Run the provided PowerShell script:
```powershell
.\setup-local-db.ps1
```

Or manually:
```bash
# Create local database
createdb veritas_local

# Connect to Railway and export production data
railway connect  # Select 'db' service
pg_dump railway > veritas_prod_dump.sql
exit

# Import to local database
psql veritas_local < veritas_prod_dump.sql

# Verify BBC News exists
psql veritas_local -c "SELECT id, name, rss_url FROM sources WHERE name LIKE '%BBC%';"
```

### 2. Environment Configuration

Create `services/scraper/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/veritas_local
NODE_ENV=development
PORT=3001
DEBUG=true
LOG_LEVEL=debug
```

**Note**: Adjust the PostgreSQL password if yours is different from 'postgres'.

### 3. Install Dependencies & Run Scraper

```bash
cd services/scraper
npm install
npm run dev
```

The scraper should start on http://localhost:3001

### 4. Test Scraping

Option A: Use the test script
```bash
cd services/scraper
npm install node-fetch  # If not already installed
node test-local-scraping.js
```

Option B: Manual testing with curl
```bash
# Check health
curl http://localhost:3001/health

# Get sources
curl http://localhost:3001/api/scraper/sources

# Trigger BBC scraping (replace BBC_NAME with actual name from sources)
curl -X POST http://localhost:3001/api/scraper/trigger \
  -H "Content-Type: application/json" \
  -d '{"sources": ["BBC News"], "maxArticles": 3}'

# Monitor job (replace JOB_ID with the returned jobId)
curl http://localhost:3001/api/scraper/jobs/JOB_ID

# Check scraped content
curl "http://localhost:3001/api/scraper/content?source=BBC%20News"
```

### 5. Verify Results in Database

```bash
# Check scraping jobs
psql veritas_local -c "SELECT id, status, total_articles_scraped, total_errors FROM scraping_jobs ORDER BY triggered_at DESC LIMIT 5;"

# Check scraped content
psql veritas_local -c "SELECT title, source_name, created_at FROM scraped_content ORDER BY created_at DESC LIMIT 10;"

# Check job logs
psql veritas_local -c "SELECT log_level, message, timestamp FROM scraping_logs ORDER BY timestamp DESC LIMIT 20;"
```

## Common Issues & Solutions

### Issue 1: Database Connection Error
- **Error**: `error: database "veritas_local" does not exist`
- **Solution**: Run `createdb veritas_local`

### Issue 2: PostgreSQL Authentication Failed
- **Error**: `password authentication failed for user "postgres"`
- **Solution**: Update DATABASE_URL in .env with your PostgreSQL password

### Issue 3: Port Already in Use
- **Error**: `Error: listen EADDRINUSE: address already in use :::3001`
- **Solution**: Change PORT in .env or kill the process using port 3001

### Issue 4: Module Not Found
- **Error**: `Cannot find module 'crawlee'`
- **Solution**: Run `npm install` in services/scraper directory

### Issue 5: TypeScript Errors
- **Error**: TypeScript compilation errors
- **Solution**: Run `npm run build` to check for type errors, fix them in the source files

## Expected Successful Output

When scraping works correctly, you should see:

1. **Job Created**: Status 'pending' → 'running' → 'completed'
2. **Logs Generated**: RSS fetch, article processing, completion logs
3. **Articles Saved**: 3-5 BBC News articles in scraped_content table
4. **No Errors**: total_errors should be 0 in scraping_jobs

## Debugging Tips

1. **Enable verbose logging**: Set DEBUG=true in .env
2. **Check logs table**: Most errors are logged with details in additional_data
3. **Monitor memory**: Watch for memory leaks with large scraping jobs
4. **Test incrementally**: Start with 1 article, then increase

## Next Steps After Success

1. Test other news sources
2. Test error scenarios (invalid RSS, network failures)
3. Test job cancellation
4. Test concurrent jobs
5. Integrate with UI at http://localhost:3000/scraper 