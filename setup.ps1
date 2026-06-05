# Script de setup para Lol-edate
# Ejecutar en PowerShell: .\setup.ps1

Write-Host "=== Lol-edate Setup ===" -ForegroundColor Magenta

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "npm no encontrado. Necesitas instalar Node.js completo (no solo el de Cursor)." -ForegroundColor Yellow
    Write-Host "Descargalo desde:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download" -ForegroundColor White
    Write-Host ""
    Write-Host "O con winget:" -ForegroundColor Yellow
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host ""
    Write-Host "Despues de instalar, cierra y vuelve a abrir PowerShell." -ForegroundColor Cyan
    exit 1
}

Write-Host "Node: $(node -v)" -ForegroundColor Green
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env creado desde .env.example" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo! Arranca con:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Abre http://localhost:5173" -ForegroundColor Cyan
