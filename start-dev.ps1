Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          Starting WhatChat Web App (React)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendRoot = Join-Path $projectRoot 'frontend'
Push-Location $frontendRoot
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "[1/2] Installing dependencies..." -ForegroundColor Yellow
        npm install
    }

    Write-Host "[2/2] Launching Vite Dev Server at http://localhost:5173 ..." -ForegroundColor Green
    Write-Host ""
    npm run dev
} finally {
    Pop-Location
}
