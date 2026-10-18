@echo off
title GreenGridAI — Runner
cd /d "%~dp0"

echo ========================================================
echo   GreenGridAI Launcher
echo ========================================================

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set PY_CMD=python
) else if exist "C:\Users\sathv\AppData\Local\Programs\Python\Python313\python.exe" (
    set PY_CMD="C:\Users\sathv\AppData\Local\Programs\Python\Python313\python.exe"
) else (
    echo [ERROR] Python not found on system.
    pause
    exit /b 1
)

%PY_CMD% run_all.py %*
pause
