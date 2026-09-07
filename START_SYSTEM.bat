@echo off
title Umar Farooq Mobile Zone - System Launcher
color 0b

echo =====================================================================
echo           UMAR FAROOQ MOBILE ZONE - ONE-CLICK LAUNCHER
echo =====================================================================
echo.

echo [1/3] Starting MongoDB Backend API Server (Port 3000)...
start "Umar Farooq Backend API" cmd /k "cd mobile-shop-backend && npm start"

echo Waiting for Backend to initialize...
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Web Interface (Port 5173)...
start "Umar Farooq Frontend App" cmd /k "npm run dev"

echo Waiting for Frontend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Opening Application in your Default Web Browser...
start http://localhost:5173

echo.
echo =====================================================================
echo  STATUS: System successfully launched!
echo  URL:    http://localhost:5173
echo  API:    http://localhost:3000/api
echo.
echo  Default Login:
echo  Email:    admin@celltech.com
echo  Password: password123 (or admin123)
echo =====================================================================
echo  NOTE: Please keep the terminal windows open while using the software.
echo.
pause
