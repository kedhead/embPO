# Build script for StitchPay
Write-Host "Building StitchPay distribution package..." -ForegroundColor Cyan

# 1. Create directories if they don't exist
if (-not (Test-Path -Path ".\backend_dist")) {
    New-Item -Path ".\backend_dist" -ItemType Directory | Out-Null
    Write-Host "Created backend_dist directory" -ForegroundColor Green
}

# 2. Build the frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "Frontend build completed successfully" -ForegroundColor Green

# 3. Build the backend with PyInstaller
Write-Host "Building backend..." -ForegroundColor Green
Set-Location -Path ".\backend"
try {
    # Check if using virtual environment
    if (Test-Path -Path "..\venv\Scripts\python.exe") {
        & "..\venv\Scripts\python.exe" -m PyInstaller stitchpay.spec --distpath ..\backend_dist
    } else {
        python -m PyInstaller stitchpay.spec --distpath ..\backend_dist
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend build failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Set-Location -Path ".."
        exit $LASTEXITCODE
    }
    Write-Host "Backend build completed successfully" -ForegroundColor Green
}
finally {
    Set-Location -Path ".."
}

# 4. Build the Electron package
Write-Host "Building Electron package..." -ForegroundColor Green
npx electron-builder
if ($LASTEXITCODE -ne 0) {
    Write-Host "Electron build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully!" -ForegroundColor Cyan
Write-Host "Installer can be found in the dist_electron directory" -ForegroundColor Green
