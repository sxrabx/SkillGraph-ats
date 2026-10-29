@echo off
chcp 65001 >nul
title SkillGraph ATS - Full Stack Launcher

echo ======================================================
echo       SkillGraph ATS - Full Stack Launcher
echo ======================================================
echo.
echo [*] Launching Backend Server in a new window...
start "SkillGraph ATS - Backend" cmd /c "%~dp0run_backend.bat"

timeout /t 2 /nobreak >nul

echo [*] Launching Frontend Client in a new window...
start "SkillGraph ATS - Frontend" cmd /c "%~dp0run_frontend.bat"

echo.
echo [STATUS: OK] Both services have been launched!
echo - Backend:  http://127.0.0.1:8000 (API & Docs)
echo - Frontend: http://localhost:5173 (Web Dashboard)
echo.
timeout /t 5
