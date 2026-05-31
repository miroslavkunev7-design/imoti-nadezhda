# Пълен setup: imoti-nadezhda на Desktop/Miro + Burgas zip + Vercel env
# Стартирай в PowerShell:  .\scripts\setup-miro-desktop.ps1
# Или:  powershell -ExecutionPolicy Bypass -File .\scripts\setup-miro-desktop.ps1

$ErrorActionPreference = "Stop"

$DesktopMiro = if ($env:MIRO_DESKTOP) { $env:MIRO_DESKTOP } else { "C:\Desktop\Miro" }
$ProjectName = "imoti-nadezhda"
$Target = Join-Path $DesktopMiro $ProjectName
$Repo = "https://github.com/miroslavkunev7-design/imoti-nadezhda.git"
$Branch = if ($env:IMOTI_BRANCH) { $env:IMOTI_BRANCH } else { "master" }

Write-Host "==> Целева папка: $Target"

if (-not (Test-Path $DesktopMiro)) {
    New-Item -ItemType Directory -Path $DesktopMiro -Force | Out-Null
}

if (Test-Path (Join-Path $Target ".git")) {
    Write-Host "==> Обновяване на repo (git pull)..."
    Set-Location $Target
    git fetch origin
    git checkout $Branch
    git pull origin $Branch
} else {
    Write-Host "==> Клониране от GitHub (същият код като Vercel deploy)..."
    git clone --branch $Branch --depth 1 $Repo $Target
    Set-Location $Target
}

# Vercel env (ако имаш vercel login)
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "==> vercel pull (environment)..."
    try { vercel pull --yes } catch { Write-Host "vercel pull пропуснат (login?)" }
} else {
    Write-Host "==> Vercel CLI липсва — копирай .env от Vercel Dashboard или: npm i -g vercel && vercel login && vercel pull"
    if (-not (Test-Path ".env.local")) {
        if (Test-Path ".env.example") { Copy-Item ".env.example" ".env.local" }
    }
}

Write-Host "==> npm install..."
npm install

# Burgas max match (zip → burgas-complete)
$env:MIRO_DESKTOP = $DesktopMiro
$Bash = Get-Command bash -ErrorAction SilentlyContinue
if ($Bash) {
    Write-Host "==> burgas-max-setup.sh (авто zip + 1:1 mockup)..."
    & bash scripts/burgas-max-setup.sh
    if ($LASTEXITCODE -ne 0) { Write-Host "burgas-max-setup: $LASTEXITCODE (виж WARN по-горе)" }
} else {
    Write-Host "==> Git Bash липсва — инсталирай Git for Windows или пусни от Git Bash: bash scripts/burgas-max-setup.sh"
    $CompleteDir = Join-Path $Target "burgas-COMPLETE"
    $ZipCandidates = @(
        (Join-Path $DesktopMiro "burgas-COMPLETE (2).zip"),
        (Join-Path $env:USERPROFILE "Desktop\burgas-COMPLETE (2).zip"),
        (Join-Path $env:USERPROFILE "Downloads\burgas-COMPLETE (2).zip")
    )
    foreach ($z in $ZipCandidates) {
        if (Test-Path $z) {
            Expand-Archive -Path $z -DestinationPath $Target -Force
            break
        }
    }
    if (Test-Path $CompleteDir) {
        $Dest = Join-Path $Target "burgas-complete"
        foreach ($sub in @("city", "quarter", "property")) {
            $src = Join-Path $CompleteDir $sub
            if (Test-Path $src) {
                New-Item -ItemType Directory -Path (Join-Path $Dest $sub) -Force | Out-Null
                Copy-Item -Path (Join-Path $src "*") -Destination (Join-Path $Dest $sub) -Recurse -Force
            }
        }
    } else {
        Write-Host "WARN: Сложи burgas-COMPLETE (2).zip в $DesktopMiro и пусни скрипта отново."
    }
}

Write-Host "==> npm run build..."
npm run build

Write-Host ""
Write-Host "ГОТОВО: $Target"
Write-Host "Dev:  cd `"$Target`"  &&  npm run dev"
Write-Host "URLs: http://localhost:3000/cities/burgas | /cities/burgas/lazur | .../property/900001"
