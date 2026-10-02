param(
  [string]$StartPath = $PWD.Path,
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

function Write-Section([string]$Text) {
  Write-Host ""
  Write-Host "=== $Text ==="
}

function Get-GitRoot([string]$Path) {
  try {
    $root = git -C $Path rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $root) { return $root.Trim() }
  } catch {}
  return $null
}

function Test-BiotrixRepo([string]$Path) {
  try {
    $remote = git -C $Path remote get-url origin 2>$null
    return ($LASTEXITCODE -eq 0 -and $remote -match "jeongyucan-hash/biotrix(\.git)?$")
  } catch { return $false }
}

function Find-BiotrixRepo([string]$Seed) {
  $direct = Get-GitRoot $Seed
  if ($direct -and (Test-BiotrixRepo $direct)) { return $direct }

  $roots = @(
    $env:USERPROFILE,
    (Join-Path $env:USERPROFILE "Desktop"),
    (Join-Path $env:USERPROFILE "Documents"),
    (Join-Path $env:USERPROFILE "Downloads"),
    (Join-Path $env:USERPROFILE "OneDrive")
  ) | Select-Object -Unique | Where-Object { Test-Path $_ }

  $seen = New-Object "System.Collections.Generic.HashSet[string]"
  $queue = New-Object System.Collections.Queue
  foreach ($r in $roots) { $queue.Enqueue(@($r,0)) }

  while ($queue.Count -gt 0) {
    $item = $queue.Dequeue()
    $path = [string]$item[0]
    $depth = [int]$item[1]
    if ($seen.Contains($path)) { continue }
    [void]$seen.Add($path)

    if (Test-Path (Join-Path $path ".git")) {
      if (Test-BiotrixRepo $path) { return $path }
    }

    if ($depth -ge 4) { continue }

    try {
      Get-ChildItem -LiteralPath $path -Directory -Force -ErrorAction SilentlyContinue |
        Where-Object {
          $_.Name -notin @("node_modules",".next",".vercel",".git","AppData","Windows","Program Files","Program Files (x86)")
        } |
        ForEach-Object { $queue.Enqueue(@($_.FullName,$depth+1)) }
    } catch {}
  }

  return $null
}

function Test-RiskyUntracked([string]$RepoRoot, [string]$RelPath) {
  $norm = $RelPath.Replace("\","/")
  $name = [IO.Path]::GetFileName($norm)

  if ($norm -match "(^|/)(node_modules|\.next|\.vercel|dist|build|coverage|\.cache)(/|$)") { return $true }
  if ($name -match "^\.env($|\.)") { return $true }
  if ($norm -match "\.(db|sqlite|sqlite3|pfx|p12|pem|key)$") { return $true }
  if ($norm -match "(^|/)(credentials?|secrets?|tokens?)(\.|/|$)") { return $true }

  $full = Join-Path $RepoRoot $RelPath
  if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { return $false }

  try {
    $fi = Get-Item -LiteralPath $full
    if ($fi.Length -gt 2MB) { return $false }

    $ext = $fi.Extension.ToLowerInvariant()
    $textExts = @(".txt",".md",".json",".js",".jsx",".ts",".tsx",".mjs",".cjs",".css",".scss",".html",".htm",".yml",".yaml",".toml",".ini",".conf",".ps1",".py",".sql",".xml",".csv")
    if ($textExts -contains $ext -or $fi.Name -in @("Dockerfile","Procfile")) {
      $content = Get-Content -LiteralPath $full -Raw -ErrorAction SilentlyContinue
      if ($content -match "(?i)(sk-[A-Za-z0-9_-]{20,}|OPENAI_API_KEY\s*=\s*\S+|SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+|PAYMENT_SECRET_KEY\s*=\s*\S+|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)") {
        return $true
      }
    }
  } catch {}

  return $false
}

Write-Section "Locate BIOTRIX repository"
$repo = Find-BiotrixRepo $StartPath
if (-not $repo) {
  throw "BIOTRIX Git repository was not found on this PC."
}
Write-Host "Repository: $repo"

Write-Section "Verify remote"
$origin = git -C $repo remote get-url origin
Write-Host "origin: $origin"
if ($origin -notmatch "jeongyucan-hash/biotrix(\.git)?$") {
  throw "Unexpected origin remote. Aborting."
}

Write-Section "Fetch cloud state"
git -C $repo fetch --all --prune
if ($LASTEXITCODE -ne 0) { throw "git fetch failed." }

$currentBranch = (git -C $repo branch --show-current).Trim()
if (-not $currentBranch) { $currentBranch = "detached" }
Write-Host "Current branch: $currentBranch"

Write-Section "Detect local-only work"
$status = git -C $repo status --porcelain=v1 -uall
if (-not $status) {
  Write-Host "No uncommitted or untracked changes found."
  exit 0
}
$status | ForEach-Object { Write-Host $_ }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$hostSafe = ($env:COMPUTERNAME -replace "[^A-Za-z0-9_-]","-").ToLowerInvariant()
$backupBranch = "backup/local-$hostSafe-$timestamp"

Write-Section "Create safety backup branch"
git -C $repo switch -c $backupBranch
if ($LASTEXITCODE -ne 0) { throw "Could not create backup branch." }

# Track modifications/deletions to already-versioned files.
git -C $repo add -u

# Add only untracked files that do not look like secrets, local DBs, caches, or build artifacts.
$untracked = git -C $repo ls-files --others --exclude-standard
$skipped = @()
foreach ($p in $untracked) {
  if (Test-RiskyUntracked $repo $p) {
    $skipped += $p
    continue
  }
  git -C $repo add -- "$p"
}

Write-Section "Staged snapshot"
git -C $repo status --short

if ($skipped.Count -gt 0) {
  Write-Host ""
  Write-Host "Skipped potentially sensitive/local-only files:"
  $skipped | ForEach-Object { Write-Host "  - $_" }
}

$staged = git -C $repo diff --cached --name-only
if (-not $staged) {
  Write-Host "Nothing safe to commit. No cloud push was made."
  exit 0
}

Write-Section "Commit snapshot"
$msg = "backup: sync local workspace from $env:COMPUTERNAME at $timestamp"
git -C $repo commit -m $msg
if ($LASTEXITCODE -ne 0) { throw "git commit failed." }

if ($NoPush) {
  Write-Host "NoPush specified. Local backup branch created: $backupBranch"
  exit 0
}

Write-Section "Push backup branch"
git -C $repo push -u origin $backupBranch
if ($LASTEXITCODE -ne 0) {
  throw "git push failed. The local backup commit is still preserved on branch $backupBranch."
}

Write-Host ""
Write-Host "SYNC COMPLETE"
Write-Host "Backup branch: $backupBranch"
Write-Host "Original working branch before backup: $currentBranch"
if ($skipped.Count -gt 0) {
  Write-Host "Review skipped files manually before deciding whether any should be uploaded."
}
