@echo off
setlocal
title AndroMal Backend - keep this window open
cd /d "%~dp0.."
echo [AndroMal] Starting backend at http://127.0.0.1:8000/
".\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
echo.
echo [AndroMal] Backend stopped. Press any key to close this window.
pause >nul
