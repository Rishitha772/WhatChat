@echo off
title WhatChat Web App
echo ===================================================
echo           Starting WhatChat Web App (React)
echo ===================================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
    echo [1/2] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies.
        pause
        exit /b %errorlevel%
    )
)

echo [2/2] Launching Vite Dev Server at http://localhost:5173 ...
echo.
call npm run dev
pause
