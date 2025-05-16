# Test script for StitchPay components
Write-Host "Testing StitchPay components..." -ForegroundColor Cyan

# Test Node.js
Write-Host "Testing Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Test npm
Write-Host "Testing npm..." -ForegroundColor Green
try {
    $npmVersion = npm -v
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Test Python
Write-Host "Testing Python..." -ForegroundColor Green
try {
    # Try virtual environment first if it exists
    if (Test-Path -Path ".\venv\Scripts\python.exe") {
        $pythonVersion = & ".\venv\Scripts\python.exe" -c "import sys; print(f'Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
        Write-Host "Python version (venv): $pythonVersion" -ForegroundColor Green
    } else {
        $pythonVersion = python -c "import sys; print(f'Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
        Write-Host "Python version: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Test PyInstaller
Write-Host "Testing PyInstaller..." -ForegroundColor Green
try {
    if (Test-Path -Path ".\venv\Scripts\python.exe") {
        $pyinstallerVersion = & ".\venv\Scripts\python.exe" -c "import PyInstaller; print(f'PyInstaller {PyInstaller.__version__}')"
        Write-Host "PyInstaller version (venv): $pyinstallerVersion" -ForegroundColor Green
    } else {
        $pyinstallerVersion = python -c "import PyInstaller; print(f'PyInstaller {PyInstaller.__version__}')"
        Write-Host "PyInstaller version: $pyinstallerVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: PyInstaller is not installed. Please install it with: pip install pyinstaller" -ForegroundColor Red
    exit 1
}

# Test Electron and Electron Builder
Write-Host "Testing Electron..." -ForegroundColor Green
try {
    & npx electron -v 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Electron is installed" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Electron is not installed. Please install it with: npm install --save-dev electron" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Electron is not installed. Please install it with: npm install --save-dev electron" -ForegroundColor Red
    exit 1
}

# Check if required directories exist
Write-Host "Checking project structure..." -ForegroundColor Green
$requiredDirs = @(
    ".\src", 
    ".\backend",
    ".\electron"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path -Path $dir) {
        Write-Host "Directory exists: $dir" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Required directory missing: $dir" -ForegroundColor Red
        exit 1
    }
}

Write-Host "All tests passed successfully!" -ForegroundColor Cyan
Write-Host "Your system is ready to build the StitchPay application." -ForegroundColor Green
Write-Host "To build the application, run: .\build.ps1" -ForegroundColor Yellow
