@echo off
chcp 65001 >nul
title SkillGraph ATS - Frontend Client

echo ======================================================
echo          SkillGraph ATS - Frontend Launcher
echo ======================================================
echo.

:: Navigate to skillgraph-ats\frontend folder
cd /d "%~dp0skillgraph-ats\frontend"

echo [*] Checking system environment...

:: 1. Check if Node.js / npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo [STATUS: FAILED] Node.js / npm was not found in your PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)
echo [STATUS: OK] Node.js / npm runtime detected.

:: 2. Check if node_modules exist
if not exist "node_modules\" (
    echo [STATUS: WARNING] node_modules folder not found.
    echo [*] Installing dependencies via npm install...
    call npm install
    if errorlevel 1 (
        echo [STATUS: FAILED] npm install failed.
        pause
        exit /b 1
    )
)
if exist "node_modules\" (
    echo [STATUS: OK] Node dependencies detected.
)

:: 3. Port & URL Status Summary
echo.
echo ======================================================
echo                 FRONTEND SERVER STATUS
echo ======================================================
echo   Status:         STARTING...
echo   Port:           5173
echo   URL:            http://localhost:5173
echo   Browser:        Opening in Google Chrome...
echo   Backend Target: http://127.0.0.1:8000
echo ======================================================
echo.
echo [INFO] Starting Vite development server...
echo Press Ctrl+C anytime to stop the server.
echo ------------------------------------------------------
echo.

:: 4. Auto-open Google Chrome after 2 seconds
start "" /b powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; try { Start-Process 'chrome.exe' 'http://localhost:5173' } catch { Start-Process 'http://localhost:5173' }"

:: Start Vite Dev Server
call npm run dev

if errorlevel 1 (
    echo.
    echo [STATUS: STOPPED] Frontend dev server has exited.
    pause
)
