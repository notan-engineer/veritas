Write-Host "Veritas Database Setup & Import Tool" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "This script handles both local database setup and Railway data import" -ForegroundColor Cyan

# Check if PostgreSQL is installed
try {
    $pgVersion = psql --version
    Write-Host "`nPostgreSQL detected: $pgVersion" -ForegroundColor Cyan
} catch {
    Write-Host "PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Menu options
Write-Host "`nWhat would you like to do?" -ForegroundColor Yellow
Write-Host "1. Full setup (create DB + import Railway data)" -ForegroundColor White
Write-Host "2. Create local database only" -ForegroundColor White
Write-Host "3. Import Railway data to existing database" -ForegroundColor White
Write-Host "4. Export Railway data only (create dump file)" -ForegroundColor White

$choice = Read-Host "`nEnter choice (1-4)"

function Create-LocalDatabase {
    Write-Host "`nCreating local database..." -ForegroundColor Yellow
    $createResult = createdb -U postgres veritas_local 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database 'veritas_local' created successfully!" -ForegroundColor Green
        return $true
    } elseif ($createResult -match "already exists") {
        Write-Host "Database 'veritas_local' already exists - continuing..." -ForegroundColor Yellow
        return $true
    } else {
        Write-Host "Error creating database: $createResult" -ForegroundColor Red
        Write-Host "Note: Make sure PostgreSQL is running and you know the postgres user password" -ForegroundColor Yellow
        return $false
    }
}

function Export-RailwayData {
    Write-Host "`nConnecting to Railway to export production data..." -ForegroundColor Yellow
    Write-Host "This will open Railway CLI. Please select the 'db' service when prompted." -ForegroundColor Cyan
    Write-Host "After connecting, run this command:" -ForegroundColor Cyan
    Write-Host "`n  pg_dump railway > veritas_prod_dump.sql" -ForegroundColor White -BackgroundColor DarkGray
    Write-Host "`nThen type 'exit' to continue." -ForegroundColor Cyan
    Write-Host "`nPress Enter to open Railway CLI..." -ForegroundColor Yellow
    Read-Host
    
    railway connect
    
    if (Test-Path "veritas_prod_dump.sql") {
        $fileSize = (Get-Item "veritas_prod_dump.sql").Length / 1MB
        Write-Host "`nSuccess! Database dump created:" -ForegroundColor Green
        Write-Host "  File: veritas_prod_dump.sql" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
        return $true
    } else {
        Write-Host "`nError: veritas_prod_dump.sql not found!" -ForegroundColor Red
        Write-Host "Did you run the pg_dump command inside Railway?" -ForegroundColor Yellow
        return $false
    }
}

function Import-ToLocalDatabase {
    if (Test-Path "veritas_prod_dump.sql") {
        Write-Host "`nImporting production data to local database..." -ForegroundColor Yellow
        psql -U postgres veritas_local -f veritas_prod_dump.sql
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Data imported successfully!" -ForegroundColor Green
            
            # Verify data
            Write-Host "`nVerifying imported data..." -ForegroundColor Yellow
            $sourceQuery = "SELECT COUNT(*) as count FROM sources;"
            $jobQuery = "SELECT COUNT(*) as count FROM scraping_jobs;"
            $contentQuery = "SELECT COUNT(*) as count FROM scraped_content;"
            
            Write-Host "Database statistics:" -ForegroundColor Cyan
            psql -U postgres veritas_local -t -c $sourceQuery
            psql -U postgres veritas_local -t -c $jobQuery
            psql -U postgres veritas_local -t -c $contentQuery
            
            # Check BBC News
            Write-Host "`nBBC News sources:" -ForegroundColor Cyan
            $bbcQuery = "SELECT id, name, rss_url FROM sources WHERE LOWER(name) LIKE '%bbc%' LIMIT 5;"
            psql -U postgres veritas_local -c $bbcQuery
            
            return $true
        } else {
            Write-Host "Error importing data. Check the output above." -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "Error: veritas_prod_dump.sql not found!" -ForegroundColor Red
        Write-Host "Please run option 4 first to export Railway data." -ForegroundColor Yellow
        return $false
    }
}

function Show-NextSteps {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Setup complete! Next steps:" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`n1. Create services/scraper/.env file with:" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/veritas_local" -ForegroundColor White
    Write-Host "   NODE_ENV=development" -ForegroundColor White
    Write-Host "   PORT=3001" -ForegroundColor White
    Write-Host "   DEBUG=true" -ForegroundColor White
    Write-Host "   LOG_LEVEL=debug" -ForegroundColor White
    Write-Host "`n2. Start the scraper service:" -ForegroundColor Yellow
    Write-Host "   cd services/scraper" -ForegroundColor Cyan
    Write-Host "   npm install" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host "`n3. Test scraping:" -ForegroundColor Yellow
    Write-Host "   cd testing" -ForegroundColor Cyan
    Write-Host "   node 03-test-scraper.js" -ForegroundColor Cyan
}

# Execute based on choice
switch ($choice) {
    "1" {
        if (Create-LocalDatabase) {
            if (Export-RailwayData) {
                if (Import-ToLocalDatabase) {
                    Show-NextSteps
                }
            }
        }
    }
    "2" {
        if (Create-LocalDatabase) {
            Write-Host "`nDatabase created. You can now import data using option 3." -ForegroundColor Green
        }
    }
    "3" {
        if (Import-ToLocalDatabase) {
            Show-NextSteps
        }
    }
    "4" {
        if (Export-RailwayData) {
            Write-Host "`nExport complete. You can now import using option 3." -ForegroundColor Green
        }
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}