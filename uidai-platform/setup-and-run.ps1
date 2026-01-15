# UIDAI Platform Complete Setup Script
# Run this script to set up and launch the entire platform

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "UIDAI ANALYTICAL PLATFORM - COMPLETE SETUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$platformDir = "C:\Users\Pulastya\Downloads\Data Analysis for UIDAI\uidai-platform"

# Change to platform directory
Set-Location $platformDir

Write-Host "[STEP 1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STEP 2/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 2-3 minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STEP 3/5] Preparing data from UIDAI CSVs..." -ForegroundColor Yellow
Set-Location scripts
python prepare_data.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Data prepared successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Data preparation had issues - check if CSVs exist" -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "[STEP 4/5] Verifying data files..." -ForegroundColor Yellow
$dataFiles = @(
    "public\data\state_summary.json",
    "public\data\district_summary.json",
    "public\data\monthly_summary.json",
    "public\data\district_daily.json"
)

$allFilesExist = $true
foreach ($file in $dataFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1MB
        Write-Host "  ✓ $file ($("{0:N2}" -f $size) MB)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠ Some data files are missing. Platform may not work correctly." -ForegroundColor Yellow
    Write-Host "Make sure your UIDAI CSV files are in the correct location." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[STEP 5/5] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Platform launching at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Available pages:" -ForegroundColor White
Write-Host "  • Home:                http://localhost:3000" -ForegroundColor Gray
Write-Host "  • Datasets:            http://localhost:3000/datasets" -ForegroundColor Gray
Write-Host "  • Metrics Explorer:    http://localhost:3000/metrics" -ForegroundColor Gray
Write-Host "  • Threat Intelligence: http://localhost:3000/threat-intelligence" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
