# GRID CLI installer for Windows x86_64.
# Host containers use the Linux containerd workflow in WSL2; this installs the
# native CLI only and never starts services, reads keys, or changes Docker.
$ErrorActionPreference = "Stop"
$origin = if ($env:GRID_ORIGIN) { $env:GRID_ORIGIN.TrimEnd("/") } else { "https://grid-compute.com" }
$binDir = if ($env:GRID_INSTALL_DIR) { $env:GRID_INSTALL_DIR } else { Join-Path $HOME ".grid\\bin" }
$target = Join-Path $binDir "grid.exe"
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "grid-windows-x86_64.exe"

New-Item -ItemType Directory -Force -Path $binDir | Out-Null
Invoke-WebRequest -UseBasicParsing "$origin/downloads/cli/grid-windows-x86_64.exe" -OutFile $tmp
Move-Item -Force $tmp $target

try {
  & $target auth --help | Out-Null
} catch {
  Remove-Item -Force $target -ErrorAction SilentlyContinue
  throw "Downloaded binary did not expose the GRID auth command."
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not (($userPath -split ";") -contains $binDir)) {
  [Environment]::SetEnvironmentVariable("Path", (($userPath.TrimEnd(";") + ";" + $binDir).TrimStart(";")), "User")
}

Write-Host "GRID v0.2.16 installed: $target"
Write-Host "Open a new PowerShell, then run: grid --version"
Write-Host "For isolated host jobs: wsl --install -d Ubuntu, then run the Linux installer inside WSL2."
