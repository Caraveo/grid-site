# Mesh installer (Windows 11+)
$ErrorActionPreference = "Stop"
$dest = Join-Path $env:LOCALAPPDATA "Mesh"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Write-Host "Mesh install dir: $dest"
Write-Host "Unpack the MESH-Setup.zip next to this script, or download from grid-compute.com"
Start-Process "https://grid-compute.com/#mesh-downloads"
