# Test Print Functionality
# This script will open the print test page in a browser

$ErrorActionPreference = "Stop"

Write-Host "Testing Print Functionality..." -ForegroundColor Cyan

# Path to the test HTML file
$printTestPath = Join-Path -Path $PSScriptRoot -ChildPath "public\print_test.html"

# Check if the file exists
if (-not (Test-Path $printTestPath)) {
    Write-Host "Error: Print test file not found at: $printTestPath" -ForegroundColor Red
    exit 1
}

# Check if the logo exists
$logoPath = Join-Path -Path $PSScriptRoot -ChildPath "public\Stitchpay.png"
if (-not (Test-Path $logoPath)) {
    Write-Host "Warning: Logo file not found at: $logoPath" -ForegroundColor Yellow
    
    # Try to find the logo in other locations
    $alternateLogoPath = Join-Path -Path $PSScriptRoot -ChildPath "electron\Stitchpay.png"
    
    if (Test-Path $alternateLogoPath) {
        Write-Host "Found logo in alternate location, copying to public folder..." -ForegroundColor Yellow
        Copy-Item -Path $alternateLogoPath -Destination $logoPath -Force
        Write-Host "Logo copied successfully." -ForegroundColor Green
    } else {
        Write-Host "Warning: Logo not found in any location. Print test may not display correctly." -ForegroundColor Yellow
    }
}

# Open the test file in the default browser
Write-Host "Opening print test page in default browser..." -ForegroundColor Cyan
Start-Process $printTestPath

Write-Host "Print test initiated. Check your browser's print preview." -ForegroundColor Green
