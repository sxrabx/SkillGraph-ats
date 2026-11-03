@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title SkillGraph ATS - Backend Server

echo ======================================================
echo          SkillGraph ATS - Backend Launcher
echo ======================================================
echo.

cd /d "%~dp0skillgraph-ats"

echo [*] Checking system environment...

if not exist ".venv\Scripts\python.exe" goto :no_venv
goto :venv_ok

:no_venv
echo [STATUS: WARNING] .venv not found. Creating virtual environment...
python -m venv .venv
if not exist ".venv\Scripts\python.exe" (
    echo [STATUS: FAILED] Could not create virtual environment.
    pause
    exit /b 1
)
echo [*] Installing requirements...
".venv\Scripts\pip.exe" install -r requirements.txt
if errorlevel 1 (
    echo [STATUS: FAILED] Failed to install requirements.
    pause
    exit /b 1
)

:venv_ok
echo [STATUS: OK] Virtual environment detected: .venv

if not exist ".env" (
    if exist "..\.env" copy /y "..\.env" ".env" >nul
)

if not exist ".env" (
    echo [STATUS: WARNING] .env file not found.
) else (
    echo [STATUS: OK] .env file found.
)

:: Free port 8000 if held by an orphaned process
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ======================================================
echo                 BACKEND SERVER STATUS
echo ======================================================
echo   Status:       STARTING...
echo   Port:         8000
echo   URL:          http://127.0.0.1:8000
echo   API Docs:     http://127.0.0.1:8000/docs
echo   Health Check: http://127.0.0.1:8000/health
echo ======================================================
echo.
echo [INFO] Loading AI models and initializing FastAPI...
echo Press Ctrl+C anytime to stop the server.
echo ------------------------------------------------------
echo.

call .\.venv\Scripts\activate.bat
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

if errorlevel 1 (
    echo.
    echo [STATUS: STOPPED] Backend server has exited.
    pause
)
