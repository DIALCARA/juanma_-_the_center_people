# Exporta todo el contenido cargado en local (DB + archivos media) a un ZIP.
# El ZIP queda en backups/ con timestamp.
#
# Uso: cd al repo y `powershell -ExecutionPolicy Bypass -File scripts\export-data.ps1`
#
# Después, para importar en otra máquina o en Docker:
#   1. Copiar el ZIP al destino
#   2. Descomprimir
#   3. Copiar app.db → apps/api/data/  (o al volumen api_data en Docker)
#   4. Copiar media/ → storage/  (o al volumen media_data en Docker)
#   5. Reiniciar la API

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUPS = Join-Path $ROOT "backups"
$STAGING = Join-Path $BACKUPS "staging_$timestamp"
$ZIP = Join-Path $BACKUPS "data_export_$timestamp.zip"

if (-not (Test-Path $BACKUPS)) { New-Item -ItemType Directory -Path $BACKUPS | Out-Null }
New-Item -ItemType Directory -Path $STAGING | Out-Null

# 1. DB SQLite
$dbSrc = Join-Path $ROOT "apps\api\data\app.db"
if (Test-Path $dbSrc) {
    Copy-Item $dbSrc -Destination $STAGING -Force
    Write-Host "  [OK] app.db copiada"
} else {
    Write-Warning "No existe $dbSrc - saltando DB"
}

# 2. Carpeta media
$mediaSrc = Join-Path $ROOT "storage\media"
if (Test-Path $mediaSrc) {
    Copy-Item $mediaSrc -Destination (Join-Path $STAGING "media") -Recurse -Force
    $count = (Get-ChildItem -Path $mediaSrc -Recurse -File | Measure-Object).Count
    Write-Host "  [OK] $count archivos de media copiados"
} else {
    Write-Warning "No existe $mediaSrc - saltando media"
}

# 3. Logo (assets estáticos personalizados)
$logoSrc = Join-Path $ROOT "apps\web\public"
$logoStaging = Join-Path $STAGING "web-public"
New-Item -ItemType Directory -Path $logoStaging -Force | Out-Null
Get-ChildItem $logoSrc -Filter "logo-*.png" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination $logoStaging -Force
    Write-Host "  [OK] $($_.Name) copiada"
}
Get-ChildItem $logoSrc -Filter "hero-bg.*" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination $logoStaging -Force
    Write-Host "  [OK] $($_.Name) copiada"
}

# 4. Zippear
Compress-Archive -Path "$STAGING\*" -DestinationPath $ZIP -Force
Remove-Item $STAGING -Recurse -Force

$sizeMb = [math]::Round((Get-Item $ZIP).Length / 1MB, 2)
Write-Host ""
Write-Host "[OK] Exportacion completa:"
Write-Host "     $ZIP"
Write-Host "     $sizeMb MB"
Write-Host ""
Write-Host "Para restaurar en otro entorno:"
Write-Host "  1. Descomprimir el ZIP"
Write-Host "  2. Colocar app.db en apps/api/data/ (o volumen api_data si Docker)"
Write-Host "  3. Colocar la carpeta media/ en storage/ (o volumen media_data si Docker)"
Write-Host "  4. Colocar logo-*.png y hero-bg.* en apps/web/public/"
Write-Host "  5. Reiniciar los servicios"
