@echo off
echo =======================================================
echo    PUSHING 28 COMMITS TO GITHUB REPOSITORY
echo    Repository: https://github.com/yonaslove/Insurance-system.git
echo =======================================================
echo.
cd /d "C:\Users\Hp\Desktop\folder\projects\insurance"
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo    SUCCESS! ALL COMMITS PUSHED TO GITHUB!
    echo =======================================================
) else (
    echo [ERROR] Push failed or was canceled. Please verify credentials.
)
pause
