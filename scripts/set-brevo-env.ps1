<#
  set-brevo-env.ps1
  Prompt for Brevo API key and sender email, update .env safely,
  create a backup .env.bak, and optionally restart docker compose.

  Usage:
    .\scripts\set-brevo-env.ps1         # interactively enter values
    .\scripts\set-brevo-env.ps1 -Restart # update and restart docker compose
#>

param(
    [switch]$Restart
)

function Set-EnvValue {
    param(
        [string]$FilePath,
        [string]$Key,
        [string]$Value
    )

    $escaped = [Regex]::Escape($Key) + ".*"
    $text = Get-Content -Raw -ErrorAction SilentlyContinue -Path $FilePath
    if (-not $text) { $text = "" }

    if ($text -match "(?m)^$Key=") {
        $newText = [Regex]::Replace($text, "(?m)^$Key=.*", "$Key=$Value")
        Set-Content -Path $FilePath -Value $newText -Force
    } else {
        Add-Content -Path $FilePath -Value "`n$Key=$Value"
    }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile = Join-Path $repoRoot "..\.env" | Resolve-Path -ErrorAction SilentlyContinue
if (-not $envFile) { $envFile = Join-Path $repoRoot "..\.env" }

# Backup
$backup = "$envFile.bak"
if (Test-Path $envFile) {
    Copy-Item -Path $envFile -Destination $backup -Force
    Write-Host "Backed up existing .env to .env.bak"
} else {
    New-Item -Path $envFile -ItemType File -Force | Out-Null
    Write-Host "Created new .env file"
}

# Prompt securely for API key and sender
$brevoApiKey = Read-Host -Prompt 'Enter BREVO_API_KEY (paste, will not echo)'
$brevoSender = Read-Host -Prompt 'Enter BREVO_SENDER_EMAIL (e.g. noreply@domain.com)'

if (-not $brevoApiKey) { Write-Host "No BREVO_API_KEY provided, aborting" -ForegroundColor Red; exit 1 }
if (-not $brevoSender) { Write-Host "No BREVO_SENDER_EMAIL provided, aborting" -ForegroundColor Red; exit 1 }

Set-EnvValue -FilePath $envFile -Key 'BREVO_API_KEY' -Value $brevoApiKey
Set-EnvValue -FilePath $envFile -Key 'BREVO_SENDER_EMAIL' -Value $brevoSender

Write-Host "Updated .env with BREVO_API_KEY and BREVO_SENDER_EMAIL (not committed)." -ForegroundColor Green

Write-Host "Next steps: restart containers to apply new env vars. You can run:" -ForegroundColor Yellow
Write-Host "  docker compose down && docker compose up -d --build" -ForegroundColor Yellow

if ($Restart) {
    Write-Host "Restarting docker compose now..." -ForegroundColor Cyan
    Push-Location (Join-Path $repoRoot "..")
    docker compose down
    docker compose up -d --build
    Pop-Location
}
