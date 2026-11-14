$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = Join-Path $projectRoot 'backend'

# Auto-load .env configuration if present
$envFile = Join-Path $projectRoot '.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
            $parts = $line.Split('=', 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim()
            if (-not [Environment]::GetEnvironmentVariable($k, 'Process') -and $v) {
                [Environment]::SetEnvironmentVariable($k, $v, 'Process')
            }
        }
    }
}

# Automatically free port 8080 if an existing Java or zombie process is holding it
try {
    $portConnections = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
    if ($portConnections) {
        foreach ($conn in $portConnections) {
            $pId = $conn.OwningProcess
            if ($pId -and $pId -ne $PID) {
                Write-Host "[Backend] Port 8080 is held by PID $pId. Automatically freeing port..." -ForegroundColor Yellow
                Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Milliseconds 600
    }
} catch {
    # Non-fatal if Get-NetTCPConnection isn't accessible
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       Starting WhatChat Spring Boot Backend       " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$mongoUri = $env:MONGODB_URI
if (-not $mongoUri) {
    $mongoUri = 'mongodb://localhost:27017/whatchat_db'
    $env:MONGODB_URI = $mongoUri
}
Write-Host "[MongoDB] Target URI: $mongoUri" -ForegroundColor Magenta
Write-Host "[Backend] Server port: 8080" -ForegroundColor Green
Write-Host "[Swagger] API Docs: http://localhost:8080/swagger-ui/index.html" -ForegroundColor Cyan

if (-not $env:APP_URL) { $env:APP_URL = 'http://localhost:5173' }
if (-not $env:APP_ORIGIN) { $env:APP_ORIGIN = 'http://localhost:5173' }
$env:COOKIE_SECURE = 'false'

if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = 'whatchat-secret-key-32-chars-minimum-length-production'
}

Push-Location $backendRoot
try {
    $maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
    if ($maven) {
        $mavenCommand = $maven.Source
    } else {
        $maven = Get-Command mvn -ErrorAction SilentlyContinue
        if ($maven) {
            $mavenCommand = $maven.Source
        } else {
            $mavenCache = Join-Path $HOME '.m2\wrapper\dists'
            $cachedMaven = Get-ChildItem -Path $mavenCache -Filter mvn.cmd -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if (-not $cachedMaven) {
                throw 'Maven was not found. Install Maven 3.9+ or ensure mvn is in PATH.'
            }
            $mavenCommand = $cachedMaven.FullName
        }
    }
    Write-Host "Launching with Maven: $mavenCommand spring-boot:run ..." -ForegroundColor Green
    & $mavenCommand spring-boot:run
} finally {
    Pop-Location
}
