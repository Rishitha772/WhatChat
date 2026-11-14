@echo off
title WhatChat Full Stack Launcher
echo ===================================================
echo             WhatChat Full Stack Launcher
echo ===================================================
echo.
echo [1/2] Launching Spring Boot Backend in a separate window...
start "WhatChat Backend" cmd /c "%~dp0start-backend.bat"

echo [2/2] Launching Frontend Vite Dev Server in a separate window...
timeout /t 3 /nobreak >nul
start "WhatChat Frontend" cmd /c "%~dp0start-dev.bat"

echo.
echo Both services are starting!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8080
echo.
