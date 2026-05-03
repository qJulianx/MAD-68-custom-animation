@echo off
title MAD 68 Pro R - RGB Panel
pushd "%~dp0"

node --version >nul 2>&1
if errorlevel 1 (
    echo [BŁĄD/ERROR] Node.js nie jest zainstalowany! / Node.js is not installed!
    echo Pobierz/Download: https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Instaluję zależności... / Installing dependencies...
    npm install
)

echo [INFO] Uruchamiam serwer RGB... / Starting RGB server...
start "MAD68 RGB Server" cmd /k "node server.js"

timeout /t 2 /nobreak >nul
start http://localhost:3333

echo.
echo Panel: http://localhost:3333
echo.
popd
