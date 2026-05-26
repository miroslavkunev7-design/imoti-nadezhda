# Sync production env vars to Vercel and deploy
# Requires .env.vercel with POSTGRES_URL, SUPABASE keys, NEXTAUTH_SECRET, etc.

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$envFile = Join-Path $root ".env.vercel"
if (-not (Test-Path $envFile)) {
    Write-Error ".env.vercel not found in $root"
    exit 1
}

Write-Host "=== Syncing env to Vercel from $envFile ==="

$vars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^([^=]+)=(.*)$') {
        $vars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

function Set-VercelEnv($name, $value, $target) {
    if ([string]::IsNullOrWhiteSpace($value)) { return }
    Write-Host "  $name -> $target"
    echo $value | npx --yes vercel env add $name $target --force
}

foreach ($target in @("production", "preview", "development")) {
    Write-Host "`n--- $target ---"
    foreach ($key in $vars.Keys) {
        Set-VercelEnv $key $vars[$key] $target
    }
}

Write-Host "`n=== Deploying to production ==="
npx --yes vercel deploy --prod --yes

Write-Host "`nDone: https://imoti-nadezhda777.vercel.app"
