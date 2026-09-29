$ErrorActionPreference = "Continue"

Write-Host "=== BIOTRIX AI SERVER / AGENT STACK BOOTSTRAP ===" -ForegroundColor Cyan

function Run-Step {
  param([string]$Name, [scriptblock]$Command)
  Write-Host ""
  Write-Host ">>> $Name" -ForegroundColor Yellow
  try {
    & $Command
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) { Write-Warning "$Name exited with code $LASTEXITCODE" }
  } catch { Write-Warning "$Name failed: $($_.Exception.Message)" }
}

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path","Machine")
  $user = [Environment]::GetEnvironmentVariable("Path","User")
  $env:Path = "$machine;$user"
}

# Core runtimes. Uses winget when available; does not remove existing versions.
if (Get-Command winget -ErrorAction SilentlyContinue) {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Run-Step "Git" { winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements }
  }
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Run-Step "Node.js LTS" { winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements }
  }
  if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Run-Step "Python 3.12" { winget install --id Python.Python.3.12 -e --accept-package-agreements --accept-source-agreements }
  }
  Refresh-Path
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Run-Step "uv Python package manager" { irm https://astral.sh/uv/install.ps1 | iex }
  Refresh-Path
}

if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
  Run-Step "OpenAI Codex CLI" { powershell -ExecutionPolicy Bypass -c "irm https://chatgpt.com/codex/install.ps1 | iex" }
  Refresh-Path
}

Write-Host ""
Write-Host "Versions:" -ForegroundColor Cyan
git --version
node --version
npm --version
npx --version
python --version
uv --version
codex --version

Run-Step "Emil Kowalski design/animation skills" {
  npx -y skills@latest add emilkowalski/skills -y
}

Run-Step "Taste Skill (all skills)" {
  npx -y skills@latest add https://github.com/jeettrench/taste-skill -y
}

Run-Step "Impeccable (Codex, project scope)" {
  npx -y impeccable@latest install -y --providers=codex --scope=project
}

Run-Step "Playwright MCP" {
  codex mcp add playwright npx "@playwright/mcp@latest"
}

Run-Step "Diagram Design" {
  npx -y skills@latest add cathrynlavery/diagram-design -y
}

Run-Step "Scientific Agent Skills" {
  npx -y skills@latest add K-Dense-AI/scientific-agent-skills -y
}

Run-Step "Cybersecurity Agent Skills" {
  npx -y skills@latest add mukul975/Anthropic-Cybersecurity-Skills -y
}

Run-Step "Harness Engineering references/skills" {
  npx -y skills@latest add ai-boost/awesome-harness-engineering -y
}

# Browser Use: official current Windows path is uv + Python 3.12.
if (Get-Command uv -ErrorAction SilentlyContinue) {
  Run-Step "Browser Use CLI" { uv tool install --python 3.12 --upgrade --force browser-use }
  Refresh-Path
  Run-Step "Browser Use browser runtime" { uvx browser-use install }
  Run-Step "Browser Use agent skill" { browser-use skill install --target all }
  Run-Step "Browser Use health check" { browser-use --doctor }
}

# OpenViking: install as a persistent context/memory service.
if (Get-Command uv -ErrorAction SilentlyContinue) {
  Run-Step "OpenViking" { uv tool install openviking --upgrade }
  Refresh-Path
  Write-Host "OpenViking installed. Provider/model setup is interactive: run 'openviking-server init', then 'openviking-server doctor', then 'openviking-server'." -ForegroundColor Magenta
}

# AgentMemory: install skills + pinned native Windows iii engine + runtime.
Run-Step "AgentMemory skills" {
  npx -y skills@latest add rohitg00/agentmemory -y
}

$iiiDir = Join-Path $HOME ".agentmemory\bin"
$iiiExe = Join-Path $iiiDir "iii.exe"
if (-not (Test-Path $iiiExe)) {
  Run-Step "AgentMemory pinned iii-engine v0.22.1" {
    New-Item -ItemType Directory -Force $iiiDir | Out-Null
    $zip = Join-Path $env:TEMP "iii-x86_64-pc-windows-msvc.zip"
    Invoke-WebRequest -Uri "https://github.com/iii-hq/iii/releases/download/iii%2Fv0.22.1/iii-x86_64-pc-windows-msvc.zip" -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $iiiDir -Force
    Remove-Item $zip -Force
  }
}
if (Test-Path $iiiExe) {
  Run-Step "Verify iii-engine" { & $iiiExe --version }
}
Run-Step "AgentMemory runtime" {
  npx -y @agentmemory/agentmemory@latest
}
Run-Step "AgentMemory demo/recall" {
  npx -y @agentmemory/agentmemory@latest demo
}

Write-Host ""
Write-Host "=== REQUIRED INTERACTIVE FINISH ===" -ForegroundColor Cyan
Write-Host "1. Restart Codex, open /hooks, approve the Impeccable project hook."
Write-Host "2. Run /impeccable init and then /impeccable audit."
Write-Host "3. Run: openviking-server init"
Write-Host "4. Then: openviking-server doctor"
Write-Host "5. Then start OpenViking: openviking-server"
Write-Host "6. Confirm Playwright: codex mcp list"
Write-Host "7. Canva/Figma/Runway are account connectors and must be authorized separately."
Write-Host "8. Never paste provider secrets into source. NVIDIA_API_KEY belongs in local/deployment secret storage."
Write-Host ""
Write-Host "=== BOOTSTRAP ATTEMPT COMPLETE ===" -ForegroundColor Green
Write-Host "A package is only DONE after its health/connection check passes."
