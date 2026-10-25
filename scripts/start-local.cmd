@echo off
setlocal
start "AndroMal Backend" "%ComSpec%" /k call "%~dp0start-backend.cmd"
start "AndroMal Frontend" "%ComSpec%" /k call "%~dp0start-frontend.cmd"
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173/"
exit /b 0
