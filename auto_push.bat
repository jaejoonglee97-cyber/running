@echo off
echo Auto-pushing to git...
echo ----------------------------------------

:: Check remote
git remote get-url origin >nul 2>&1
if errorlevel 1 goto NoRemote

:: Add all files
git add .

:: Commit with timestamp
git commit -m "Auto-update: %date% %time%"

:: Push to master branch
git push origin master

echo ----------------------------------------
echo Done!
pause
exit /b

:NoRemote
echo [Error] Remote 'origin' is not configured.
echo Please run: git remote add origin <your-repo-url>
pause
