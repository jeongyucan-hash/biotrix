$ErrorActionPreference = "Stop"
$Root = "$HOME\biotrix"
if (-not (Test-Path (Join-Path $Root ".git"))) { throw "BIOTRIX node is not installed at $Root" }
Set-Location $Root
git fetch origin
git switch feat/agent-stack-bootstrap-v1
git pull --ff-only origin feat/agent-stack-bootstrap-v1
powershell -ExecutionPolicy Bypass -File ".\scripts\setup-agent-stack.ps1"
powershell -ExecutionPolicy Bypass -File ".\scripts\verify-agent-stack.ps1"
