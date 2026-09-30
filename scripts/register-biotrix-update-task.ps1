param([string]$Time = "09:00")
$Root = "$HOME\biotrix"
$Script = Join-Path $Root "scripts\update-biotrix-node.ps1"
if (-not (Test-Path $Script)) { throw "Run install-biotrix-node.ps1 first." }

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Script`""
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
Register-ScheduledTask -TaskName "BIOTRIX AI Node Update" -Action $action -Trigger $trigger -Settings $settings -Description "Pulls the shared BIOTRIX AI stack and runs health checks." -Force
Write-Host "Scheduled daily BIOTRIX update at $Time." -ForegroundColor Green
