@echo off
setlocal
title AndroMal Frontend - keep this window open
cd /d "%~dp0..\frontend"
echo [AndroMal] Starting frontend at http://127.0.0.1:5173/
node ".\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173 --strictPort
echo.
echo [AndroMal] Frontend stopped. Press any key to close this window.
pause >nul
