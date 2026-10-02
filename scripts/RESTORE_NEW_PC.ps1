param(
  [string]$Destination = (Join-Path $env:USERPROFILE "BIOTRIX")
)

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/jeongyucan-hash/biotrix.git"

if (Test-Path $Destination) {
  if (Test-Path (Join-Path $Destination ".git")) {
    git -C $Destination fetch --all --prune
  } else {
    throw "Destination exists but is not a Git repository: $Destination"
  }
} else {
  git clone $repoUrl $Destination
}

git -C $Destination fetch --all --prune

Write-Host ""
Write-Host "BIOTRIX cloud workspace restored to: $Destination"
Write-Host ""
Write-Host "Primary branches:"
Write-Host "  Public site : preview/biotrix-science-20261001"
Write-Host "  HQ          : hq-nextjs"
Write-Host "  Commerce    : commerce-nextjs"
Write-Host ""
Write-Host "Environment secrets are intentionally not stored in Git."
Write-Host "Recreate .env.local from authorized Supabase/Vercel settings before running Next.js apps."
