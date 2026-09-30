param(
  [ValidateSet("work","home","other")]
  [string]$Role = "other",
  [string]$InstallRoot = "$HOME\biotrix"
)

$ErrorActionPreference = "Stop"
$Repo = "https://github.com/jeongyucan-hash/biotrix.git"
$Branch = "feat/agent-stack-bootstrap-v1"

Write-Host "=== BIOTRIX AI NODE INSTALLER ===" -ForegroundColor Cyan
Write-Host "Role: $Role"
Write-Host "Root: $InstallRoot"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "Git is missing and winget is unavailable. Install Git for Windows first."
  }
  winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
}

if (-not (Test-Path (Join-Path $InstallRoot ".git"))) {
  git clone $Repo $InstallRoot
}

Set-Location $InstallRoot
git fetch origin
git switch $Branch
git pull --ff-only origin $Branch

$nodeDir = Join-Path $HOME ".biotrix"
New-Item -ItemType Directory -Force $nodeDir | Out-Null
$nodeFile = Join-Path $nodeDir "node.json"

if (Test-Path $nodeFile) {
  $node = Get-Content $nodeFile -Raw | ConvertFrom-Json
} else {
  $node = [ordered]@{
    node_id = [guid]::NewGuid().ToString()
    role = $Role
    machine = $env:COMPUTERNAME
    created_at = (Get-Date).ToUniversalTime().ToString("o")
  }
  $node | ConvertTo-Json | Set-Content $nodeFile -Encoding UTF8
}

Write-Host "Node ID: $($node.node_id)" -ForegroundColor Green
Write-Host "Machine: $($node.machine)"
Write-Host "Role: $($node.role)"

powershell -ExecutionPolicy Bypass -File ".\scripts\setup-agent-stack.ps1"

Write-Host ""
Write-Host "Running health check..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File ".\scripts\verify-agent-stack.ps1"

Write-Host ""
Write-Host "BIOTRIX node bootstrap finished." -ForegroundColor Green
Write-Host "Local identity: $nodeFile"
Write-Host "Secrets are NOT synchronized by Git. Configure provider secrets separately on this machine."
