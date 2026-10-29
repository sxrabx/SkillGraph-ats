@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title SkillGraph ATS - Backend Server

echo ======================================================
echo          SkillGraph ATS - Backend Launcher
echo ======================================================
echo.

:: Navigate to skillgraph-ats folder
cd /d "%~dp0skillgraph-ats"

echo [*] Checking system environment...

:: 1. Check Virtual Environment
if not exist ".venv\Scripts\python.exe" (
    echo [STATUS: FAILED] Virtual environment folder .venv was not found in:
    echo %cd%
    echo Please create or install .venv first.
    echo.
    pause
    exit /b 1
)
echo [STATUS: OK] Virtual environment detected: .venv

:: 2. Check .env and API key
if exist ".env" (
    findstr /i "GROQ_API_KEY=" .env >nul 2>&1
    if errorlevel 1 (
        echo [STATUS: WARNING] .env found, but GROQ_API_KEY is missing.
    ) else (
        echo [STATUS: OK] GROQ_API_KEY is configured in .env
    )
    findstr /i "NVIDIA_API_KEY=" .env >nul 2>&1
    if errorlevel 1 (
        echo [STATUS: WARNING] .env found, but NVIDIA_API_KEY is missing.
    ) else (
        echo [STATUS: OK] NVIDIA_API_KEY is configured in .env ^(Cloud Embeddings Active^)
    )
) else (
    echo [STATUS: WARNING] .env file not found.
)

:: 3. Port & URL Status Summary
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

:: Activate environment and run uvicorn
call .\.venv\Scripts\activate.bat
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

if errorlevel 1 (
    echo.
    echo [STATUS: STOPPED] Backend server has exited.
    pause
)
