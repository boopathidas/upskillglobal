@echo off
cd /d %~dp0

REM Root repository setup
git init
git config core.autocrlf false

REM Add remote repository
git remote add origin https://github.com/boopathidas/upskillglobal.git

REM Create .gitignore
echo # Dependency directories > .gitignore
echo node_modules/ >> .gitignore
echo .env >> .gitignore
echo build/ >> .gitignore
echo dist/ >> .gitignore

REM Stage and commit root files
git add .
git commit -m "Initial project setup"

REM Push to GitHub
git push -u origin master

echo Git repository setup complete!
