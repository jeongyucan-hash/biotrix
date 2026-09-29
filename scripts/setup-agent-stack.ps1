$ErrorActionPreference = "Continue"

Write-Host "=== BIOTRIX Agent Stack Bootstrap ===" -ForegroundColor Cyan

function Run-Step {
  param([string]$Name, [scriptblock]$Command)
  Write-Host ""
  Write-Host ">>> $Name" -ForegroundColor Yellow
  try {
    & $Command
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
      Write-Warning "$Name exited with code $LASTEXITCODE"
    }
  } catch {
    Write-Warning "$Name failed: $($_.Exception.Message)"
  }
}

Write-Host "Checking prerequisites..."
node --version
npm --version
npx --version
python --version
codex --version

Run-Step "Emil Kowalski design skills" {
  npx -y skills add emilkowalski/skill -y
}

Run-Step "Taste Skill" {
  npx -y skills add https://github.com/jeettrench/taste-skill -y
}

Run-Step "Impeccable for Codex (project scope)" {
  npx -y impeccable@latest install -y --providers=codex --scope=project
}

Run-Step "Playwright MCP for Codex" {
  codex mcp add playwright npx "@playwright/mcp@latest"
}

Run-Step "AgentMemory skills" {
  npx -y skills add rohitg00/agentmemory -y
}

Run-Step "AgentMemory runtime bootstrap" {
  npx -y @agentmemory/agentmemory@latest
}

Run-Step "Diagram Design" {
  npx -y skills add cathrynlavery/diagram-design -y
}

Run-Step "Scientific Agent Skills" {
  npx -y skills add K-Dense-AI/scientific-agent-skills -y
}

Run-Step "Cybersecurity Agent Skills" {
  npx -y skills add mukul975/Anthropic-Cybersecurity-Skills -y
}

Run-Step "Harness engineering reference skills" {
  npx -y skills add ai-boost/awesome-harness-engineering -y
}

Write-Host ""
Write-Host ">>> Browser Use" -ForegroundColor Yellow
if (Get-Command uv -ErrorAction SilentlyContinue) {
  Run-Step "Browser Use package" { uv tool install browser-use }
  Run-Step "Browser Use skill registration" { browser-use skill install }
} else {
  Write-Warning "uv is not installed. Install uv, then run: uv tool install browser-use; browser-use skill install"
}

Write-Host ""
Write-Host ">>> OpenViking" -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
  Run-Step "OpenViking package" { python -m pip install --upgrade openviking }
  Write-Host "OpenViking requires provider/model configuration. Next: openviking-server init; openviking-server doctor"
} else {
  Write-Warning "Python 3.10+ is required for OpenViking."
}

Write-Host ""
Write-Host "=== Manual/interactive follow-ups ===" -ForegroundColor Cyan
Write-Host "1. In Codex, open /hooks and approve the Impeccable project hook."
Write-Host "2. Run /impeccable init, then /impeccable audit."
Write-Host "3. Native Windows AgentMemory requires pinned iii-engine support; if bootstrap requests it, follow the installer prompt or use WSL2."
Write-Host "4. Run openviking-server init and openviking-server doctor."
Write-Host "5. Figma/Canva/Runway are account connectors, not npm packages; connect them in ChatGPT/Codex separately."
Write-Host "6. NVIDIA key must remain outside Git. Set NVIDIA_API_KEY in local/Vercel/GitHub secret storage."
Write-Host ""
Write-Host "Bootstrap finished. Review warnings above; a command being attempted is not proof that its integration is healthy." -ForegroundColor Green
