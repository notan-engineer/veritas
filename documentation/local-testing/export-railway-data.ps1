Write-Host "Railway Database Export Script" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

Write-Host "`nThis script will export the production database from Railway." -ForegroundColor Yellow
Write-Host "When connected to Railway, copy and paste this command:" -ForegroundColor Cyan
Write-Host "`npg_dump railway > veritas_prod_dump.sql" -ForegroundColor White
Write-Host "`nThen type 'exit' to disconnect from Railway." -ForegroundColor Cyan

Write-Host "`nPress Enter to connect to Railway..." -ForegroundColor Yellow
Read-Host

Write-Host "Connecting to Railway database service..." -ForegroundColor Green
railway connect

# Check if dump was created
if (Test-Path "veritas_prod_dump.sql") {
    $fileSize = (Get-Item "veritas_prod_dump.sql").Length / 1MB
    Write-Host "`nSuccess! Database dump created:" -ForegroundColor Green
    Write-Host "  File: veritas_prod_dump.sql" -ForegroundColor White
    Write-Host "  Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
    
    Write-Host "`nNow importing to local database..." -ForegroundColor Yellow
    psql -U postgres veritas_local -f veritas_prod_dump.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nData imported successfully!" -ForegroundColor Green
        
        # Verify BBC News
        Write-Host "`nVerifying BBC News source..." -ForegroundColor Yellow
        $bbcQuery = "SELECT id, name, rss_url FROM sources WHERE LOWER(name) LIKE '%bbc%' LIMIT 5;"
        psql -U postgres veritas_local -c $bbcQuery
    } else {
        Write-Host "Error importing data." -ForegroundColor Red
    }
} else {
    Write-Host "`nError: veritas_prod_dump.sql not found!" -ForegroundColor Red
    Write-Host "Did you run the pg_dump command inside Railway?" -ForegroundColor Yellow
} 