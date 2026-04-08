@echo off
echo 🚀 Code-Dual Deployment Helper
echo.
echo This script will help you deploy your Code-Dual website
echo.

echo Step 1: Initialize Git Repository
git init
git add .
git commit -m "Initial commit - Code-Dual ready for deployment"

echo.
echo ✅ Git repository initialized!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub called 'code-dual'
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/code-dual.git
echo 3. Run: git push -u origin main
echo 4. Go to render.com and deploy from your GitHub repo
echo.
echo Your website will be live in minutes!
pause