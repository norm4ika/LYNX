Write-Host "Cleaning npm cache..." -ForegroundColor Green
npm cache clean --force

Write-Host "Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Installation complete!" -ForegroundColor Green
Read-Host "Press Enter to continue"
