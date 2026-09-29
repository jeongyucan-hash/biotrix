$ErrorActionPreference = "Continue"
Write-Host "=== BIOTRIX AI STACK HEALTH CHECK ===" -ForegroundColor Cyan

function Check-Cmd($name, $cmd) {
  Write-Host ""
  Write-Host "[$name]" -ForegroundColor Yellow
  try { Invoke-Expression $cmd } catch { Write-Warning $_.Exception.Message }
}

Check-Cmd "Git" "git --version"
Check-Cmd "Node" "node --version"
Check-Cmd "Python" "python --version"
Check-Cmd "uv" "uv --version"
Check-Cmd "Codex" "codex --version"
Check-Cmd "Codex MCP" "codex mcp list"
Check-Cmd "Browser Use" "browser-use --doctor"
Check-Cmd "OpenViking" "openviking-server doctor"
Check-Cmd "AgentMemory iii" "& \"$HOME\.agentmemory\bin\iii.exe\" --version"
Check-Cmd "AgentMemory" "npx -y @agentmemory/agentmemory@latest demo"

if ($env:NVIDIA_API_KEY) {
  Write-Host ""
  Write-Host "[NVIDIA NIM]" -ForegroundColor Yellow
  Write-Host "NVIDIA_API_KEY is present in this shell (value hidden)."
} else {
  Write-Warning "NVIDIA_API_KEY is not present in this shell."
}

Write-Host ""
Write-Host "Health check complete. Review each section; presence alone does not prove HQ integration." -ForegroundColor Green
