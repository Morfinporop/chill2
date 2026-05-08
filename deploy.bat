@echo off
echo ChillGram Deployment Script
echo ================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building frontend...
call npm run build

echo.
echo Step 3: Build complete!
echo.
echo Files ready:
dir dist\index.html

echo.
echo Next steps:
echo 1. git add .
echo 2. git commit -m "deploy to railway"
echo 3. git push origin main
echo.
echo Railway will auto-deploy!
pause
