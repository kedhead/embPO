# This script helps convert the SVG logo to an ICO file using SVG Converter
# It requires internet connection to download the necessary tools

Write-Host "StitchPay Icon Generator" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if we have an SVG file
$svgPath = ".\electron\stitchpay_logo.svg"
if (-not (Test-Path -Path $svgPath)) {
    Write-Host "Error: SVG file not found at $svgPath" -ForegroundColor Red
    exit 1
}

# Create a temporary directory
$tempDir = ".\temp_icon_converter"
if (-not (Test-Path -Path $tempDir)) {
    New-Item -Path $tempDir -ItemType Directory | Out-Null
}

try {
    # Install required packages via npm
    Write-Host "Installing required npm packages..." -ForegroundColor Yellow
    Push-Location $tempDir
    
    # Initialize npm and install required packages
    npm init -y
    npm install svg2png-cli png-to-ico --no-fund --no-audit
    
    # Create conversion script
    $scriptContent = @"
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sizes = [16, 32, 48, 64, 128, 256];
const svgPath = path.resolve('../electron/stitchpay_logo.svg');
const iconPath = path.resolve('../electron/icon.ico');

// Create PNGs for each size
console.log('Creating PNGs from SVG...');
sizes.forEach(size => {
    const outputPath = path.resolve(`./logo_\${size}.png`);
    execSync(`node_modules\\.bin\\svg2png-cli -i "\${svgPath}" -o "\${outputPath}" -w \${size} -h \${size}`);
    console.log(`Created \${size}x\${size} PNG`);
});

// Create ICO file
console.log('Creating ICO file...');
const pngFiles = sizes.map(size => `logo_\${size}.png`);
execSync(`node_modules\\.bin\\png-to-ico \${pngFiles.join(' ')} > "\${iconPath}"`);

// Clean up
console.log('Cleaning up temporary files...');
pngFiles.forEach(file => fs.unlinkSync(file));

console.log('Done! Icon created at: ' + iconPath);
"@
    
    Set-Content -Path "convert.js" -Value $scriptContent

    # Run the conversion script
    Write-Host "Converting SVG to ICO file..." -ForegroundColor Yellow
    node convert.js
    
    Pop-Location
    
    # Verify the icon was created
    if (Test-Path -Path ".\electron\icon.ico") {
        Write-Host "Icon created successfully at: .\electron\icon.ico" -ForegroundColor Green
    } else {
        Write-Host "Error: Icon creation failed" -ForegroundColor Red
        exit 1
    }
} 
catch {
    Write-Host "Error during icon conversion: $_" -ForegroundColor Red
}
finally {
    # Clean up
    Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
    if (Test-Path -Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force
    }
}

Write-Host "Icon conversion process completed!" -ForegroundColor Cyan
