param([ValidateSet("work","home","other")][string]$Role = "other")

$ErrorActionPreference = "Stop"
$Root = "$HOME\biotrix"
$Repo = "https://github.com/jeongyucan-hash/biotrix.git"
$Branch = "feat/agent-stack-bootstrap-v1"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw "winget is required to bootstrap Git automatically." }
  winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
}
if (-not (Test-Path (Join-Path $Root ".git"))) { git clone $Repo $Root }
Set-Location $Root
git fetch origin
git switch $Branch
git pull --ff-only origin $Branch
powershell -ExecutionPolicy Bypass -File ".\scripts\install-biotrix-node.ps1" -Role $Role -InstallRoot $Root
