@echo off
title GreenStreets — Git Auto Push
color 0A

:: ─────────────────────────────────────────────────────────────────────────────
::  GreenStreets Prototypes — One-Click Commit & Push to GitHub
::  Repo: https://github.com/loumizhu/GreenStreets_Prototypes
:: ─────────────────────────────────────────────────────────────────────────────

set "REPO=d:\((_atWork_))\DuneTech\GreenStreets-UI-UX\Prototypes"
cd /d "%REPO%"

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║       GreenStreets  —  GitHub Auto Push              ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: ── Step 1: Check for anything to commit ─────────────────────────────────────
echo  [1/4] Checking for changes...
git status --short > "%TEMP%\gs_gitstatus.txt" 2>&1
set /p STATUS_LINE=<"%TEMP%\gs_gitstatus.txt"

if "%STATUS_LINE%"=="" (
    echo.
    echo  ✓  No changes detected — everything is already up to date.
    echo     Nothing to commit. Exiting.
    echo.
    goto :END
)

echo  Found changes:
git status --short
echo.

:: ── Step 2: Stage all changes ────────────────────────────────────────────────
echo  [2/4] Staging all changes (git add -A)...
git add -A
if errorlevel 1 (
    echo  ✗  ERROR: Failed to stage changes!
    goto :FAIL
)
echo  ✓  All changes staged.
echo.

:: ── Step 3: Commit with timestamped message ──────────────────────────────────
echo  [3/4] Committing...
for /f "tokens=1-2 delims=T" %%a in ("%DATE% %TIME%") do set "DT=%%a %%b"
:: Build a clean timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "LDT=%%I"
set "TSTAMP=%LDT:~0,4%-%LDT:~4,2%-%LDT:~6,2% %LDT:~8,2%:%LDT:~10,2%"

set "MSG=chore: auto-push [%TSTAMP%]"
git commit -m "%MSG%"
if errorlevel 1 (
    echo  ✗  ERROR: Commit failed!
    goto :FAIL
)
echo  ✓  Committed: %MSG%
echo.

:: ── Step 4: Push to GitHub ───────────────────────────────────────────────────
echo  [4/4] Pushing to GitHub (origin/main)...
git push origin main
if errorlevel 1 (
    echo.
    echo  ✗  ERROR: Push failed!
    echo     Possible reasons:
    echo       • No internet connection
    echo       • Authentication issue (run: git credential-manager)
    echo       • Remote has new commits — try: git pull --rebase origin main
    goto :FAIL
)

:: ── Success ──────────────────────────────────────────────────────────────────
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║   ✅  SUCCESS!  All changes pushed to GitHub!        ║
echo  ║                                                      ║
echo  ║   🔗  https://github.com/loumizhu/                   ║
echo  ║        GreenStreets_Prototypes                       ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
goto :END

:FAIL
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║   ❌  PUSH FAILED — see error above                  ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:END
echo  Press any key to close...
pause >nul
