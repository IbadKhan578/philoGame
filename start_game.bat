@echo off
title Philosophy World - Launcher
color 0B
echo ===================================================
echo     PHILOSOPHY WORLD - 2D EXPLORATION GAME
echo ===================================================
echo.
echo [1/3] Starting FastAPI + SQLite Backend on port 8000...
start "Philosophy World - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/3] Starting Vite + React Frontend on port 5173...
start "Philosophy World - Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo Both servers are running!
echo Keep the backend and frontend terminal windows open.
echo You can close this launcher window at any time.
echo ===================================================
pause
