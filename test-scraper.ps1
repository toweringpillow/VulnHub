# PowerShell script to test the scraper endpoint
# Usage: .\test-scraper.ps1 -Url "https://your-vercel-url.vercel.app" -Secret "your-cron-secret"

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,
    
    [Parameter(Mandatory=$true)]
    [string]$Secret
)

$headers = @{
    "Authorization" = "Bearer $Secret"
    "Content-Type" = "application/json"
}

Write-Host "Testing scraper endpoint: $Url/api/cron/scraper" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$Url/api/cron/scraper" -Method POST -Headers $headers
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success) {
        Write-Host ""
        Write-Host "Articles processed: $($response.result.articlesProcessed)" -ForegroundColor Green
        Write-Host "Articles added: $($response.result.articlesAdded)" -ForegroundColor Green
        Write-Host "Articles skipped: $($response.result.articlesSkipped)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

