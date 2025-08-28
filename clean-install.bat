@echo off
echo Cleaning npm cache...
npm cache clean --force

echo Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing dependencies...
npm install

echo Installation complete!
pause
