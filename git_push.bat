@echo off
chcp 65001 >nul
title GreenStreets - Git Auto Push
color 0A

:: ============================================================================
::  GreenStreets Prototypes - One-Click Commit & Push to GitHub
::  Repo: https://github.com/loumizhu/GreenStreets_Prototypes
:: ============================================================================

set "REPO=d:\((_atWork_))\DuneTech\GreenStreets-UI-UX\Prototypes"
cd /d "%REPO%"

echo.
echo  +======================================================+
echo  ^|       GreenStreets  -  GitHub Auto Push              ^|
echo  +======================================================+
echo.

:: -- Step 1: Check for anything to commit ------------------------------------
echo  [1/5] Checking for changes...
git status --short > "%TEMP%\gs_gitstatus.txt" 2>&1

:: Count lines in the status file - if 0, nothing to commit
set "HAS_CHANGES=0"
for /f "usebackq" %%L in ("%TEMP%\gs_gitstatus.txt") do set "HAS_CHANGES=1"

if "%HAS_CHANGES%"=="0" (
    echo.
    echo  [OK] No changes detected - everything is already up to date.
    echo       Nothing to commit. Exiting.
    echo.
    goto :END
)

echo  Found changes:
git status --short
echo.

:: -- Step 2: Bump the push counter & stamp it into index.html ----------------
echo  [2/5] Updating push number...
set "COUNTFILE=%REPO%\.push-count"
set "PUSHNUM="
if exist "%COUNTFILE%" (
    for /f "usebackq tokens=1 delims= " %%N in ("%COUNTFILE%") do set "PUSHNUM=%%N"
)
:: no counter file yet ^(or it's empty^): fall back to the number in index.html
if not defined PUSHNUM (
    for /f %%N in ('powershell -NoProfile -Command "$m=[regex]::Match([IO.File]::ReadAllText((Join-Path '%REPO%' 'index.html')),'Version/Push Number : (\d+)'); if($m.Success){$m.Groups[1].Value}else{0}"') do set "PUSHNUM=%%N"
)
if not defined PUSHNUM set "PUSHNUM=0"

set /a PUSHNUM=PUSHNUM+1 2>nul
if errorlevel 1 set /a PUSHNUM=1

> "%COUNTFILE%" echo %PUSHNUM%

powershell -NoProfile -Command ^
  "$f = Join-Path '%REPO%' 'index.html';" ^
  "$t = [IO.File]::ReadAllText($f);" ^
  "$n = $t -replace 'Version/Push Number : \d+', 'Version/Push Number : %PUSHNUM%';" ^
  "if ($n -ne $t) { [IO.File]::WriteAllText($f, $n); exit 0 } else { exit 3 }"
if errorlevel 3 (
    echo  [!] Warning: 'Version/Push Number : NN' not found ^(or unchanged^) in index.html.
) else (
    echo  [OK] index.html updated to push number %PUSHNUM%.
)
echo  Total pushes so far: %PUSHNUM%
echo.

:: -- Step 3: Stage all changes -----------------------------------------------
echo  [3/5] Staging all changes ^(git add -A^)...
git add -A 2>nul
echo  [OK] All changes staged.
echo.

:: -- Step 4: Commit with timestamped message ---------------------------------
echo  [4/5] Committing...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set "LDT=%%I"
set "TSTAMP=%LDT:~0,4%-%LDT:~4,2%-%LDT:~6,2% %LDT:~8,2%:%LDT:~10,2%"

set "MSG=chore: auto-push #%PUSHNUM% [%TSTAMP%]"
git commit -m "%MSG%"
if errorlevel 1 (
    echo  [!!] ERROR: Commit failed!
    goto :FAIL
)
echo  [OK] Committed: %MSG%
echo.

:: -- Step 5: Push to GitHub --------------------------------------------------
echo  [5/5] Pushing to GitHub ^(origin/main^)...
git push origin main > "%TEMP%\gs_push_out.txt" 2>&1
type "%TEMP%\gs_push_out.txt"

:: git writes progress to stderr - check for a success string instead of errorlevel
findstr /C:"main -> main" /C:"Everything up-to-date" "%TEMP%\gs_push_out.txt" >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [!!] ERROR: Push failed! See output above.
    echo       Possible reasons:
    echo         * No internet connection
    echo         * Authentication issue ^(check Windows Credential Manager^)
    echo         * Remote has newer commits - try: git pull --rebase origin main
    goto :FAIL
)

:: -- Success -----------------------------------------------------------------
set "BOXLINE=   Total pushes so far: %PUSHNUM%                                                        "
set "BOXLINE=%BOXLINE:~0,54%"
echo.
echo  +======================================================+
echo  ^|                                                      ^|
echo  ^|   SUCCESS!  All changes pushed to GitHub!            ^|
echo  ^|%BOXLINE%^|
echo  ^|                                                      ^|
echo  ^|   https://github.com/loumizhu/                       ^|
echo  ^|   GreenStreets_Prototypes                            ^|
echo  ^|                                                      ^|
echo  +======================================================+
echo.
goto :END

:FAIL
echo.
echo  +======================================================+
echo  ^|                                                      ^|
echo  ^|   PUSH FAILED - see error above                      ^|
echo  ^|                                                      ^|
echo  +======================================================+
echo.

:END
echo  Press any key to close...
pause >nul
