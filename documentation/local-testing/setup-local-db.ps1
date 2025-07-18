Write-Host "Veritas Local Database Setup" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    $pgVersion = psql --version
    Write-Host "PostgreSQL detected: $pgVersion" -ForegroundColor Cyan
} catch {
    Write-Host "PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Step 1: Create local database
Write-Host "`nStep 1: Creating local database..." -ForegroundColor Yellow
Write-Host "Using postgres user to create database..." -ForegroundColor Cyan
$createResult = createdb -U postgres veritas_local 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database 'veritas_local' created successfully!" -ForegroundColor Green
} elseif ($createResult -match "already exists") {
    Write-Host "Database 'veritas_local' already exists - continuing..." -ForegroundColor Yellow
} else {
    Write-Host "Error creating database: $createResult" -ForegroundColor Red
    Write-Host "Note: Make sure PostgreSQL is running and you know the postgres user password" -ForegroundColor Yellow
    exit 1
}

# Step 2: Export production data
Write-Host "`nStep 2: Connecting to Railway to export production data..." -ForegroundColor Yellow
Write-Host "This will open Railway CLI. Please select the 'db' service when prompted." -ForegroundColor Cyan
Write-Host "After connecting, run: pg_dump railway > veritas_prod_dump.sql" -ForegroundColor Cyan
Write-Host "Then type 'exit' to continue." -ForegroundColor Cyan
Write-Host "`nPress Enter to open Railway CLI..." -ForegroundColor Yellow
Read-Host

railway connect

# Step 3: Import to local database
if (Test-Path "veritas_prod_dump.sql") {
    Write-Host "`nStep 3: Importing production data to local database..." -ForegroundColor Yellow
    psql -U postgres veritas_local -f veritas_prod_dump.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Data imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error importing data. Check the output above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nError: veritas_prod_dump.sql not found!" -ForegroundColor Red
    Write-Host "Please ensure you exported the production data correctly." -ForegroundColor Yellow
    exit 1
}

# Step 4: Verify BBC News source
Write-Host "`nStep 4: Verifying BBC News source exists..." -ForegroundColor Yellow
$bbcQuery = @"
SELECT id, name, domain, rss_url, is_active 
FROM sources 
WHERE LOWER(name) LIKE '%bbc%' 
LIMIT 5;
"@

Write-Host "BBC News sources in database:" -ForegroundColor Cyan
psql -U postgres veritas_local -c $bbcQuery

Write-Host "`nLocal database setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create services/scraper/.env file with:" -ForegroundColor Cyan
Write-Host "   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/veritas_local" -ForegroundColor White
Write-Host "   NODE_ENV=development" -ForegroundColor White
Write-Host "   PORT=3001" -ForegroundColor White
Write-Host "2. cd services/scraper" -ForegroundColor Cyan
Write-Host "3. npm install" -ForegroundColor Cyan
Write-Host "4. npm run dev" -ForegroundColor Cyan 