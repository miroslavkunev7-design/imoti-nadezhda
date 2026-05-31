# Синхронизира Desktop папката imoti-nadezhda с последния Vercel Production deploy.
# Стартирай в PowerShell (като администратор не е нужно):
#   powershell -ExecutionPolicy Bypass -File .\scripts\sync-desktop-from-vercel.ps1
#
# Или от repo root:
#   cd C:\Users\ТВОЕТО_ИМЕ\Desktop\imoti-nadezhda
#   powershell -ExecutionPolicy Bypass -File .\scripts\sync-desktop-from-vercel.ps1

$ErrorActionPreference = "Stop"

# Последен Production deploy (Vercel bot, GitHub deployments) — 2026-05-31
$VercelCommit = if ($env:VERCEL_COMMIT) { $env:VERCEL_COMMIT } else { "a4b4ad405a2f0a103a0305097ec1b9c53b6b062e" }
$Repo = "https://github.com/miroslavkunev7-design/imoti-nadezhda.git"
$ProductionUrl = "https://imoti-nadezhda.vercel.app"

# Типични места за папката на работния плот
$Candidates = @(
    if ($env:IMOTI_DESKTOP) { $env:IMOTI_DESKTOP },
    (Join-Path $env:USERPROFILE "Desktop\imoti-nadezhda"),
    "C:\Users\Win11\Desktop\imoti-nadezhda",
    (Join-Path $env:USERPROFILE "OneDrive\Desktop\imoti-nadezhda"),
    "C:\Desktop\Miro\imoti-nadezhda"
) | Where-Object { $_ }

$Target = $Candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Target) {
    $Target = Join-Path $env:USERPROFILE "Desktop\imoti-nadezhda"
    Write-Host "==> Нова папка: $Target"
}

$Parent = Split-Path $Target -Parent
$Backup = Join-Path $Parent ("imoti-nadezhda.backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$TempClone = Join-Path $env:TEMP ("imoti-nadezhda-vercel-" + [guid]::NewGuid().ToString("n").Substring(0, 8))

Write-Host ""
Write-Host "=== Синхронизация с Vercel Production ==="
Write-Host "Production: $ProductionUrl"
Write-Host "Commit:     $VercelCommit"
Write-Host "Цел:        $Target"
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ГРЕШКА: Инсталирай Git for Windows — https://git-scm.com/download/win"
    exit 1
}

Write-Host "==> Клониране на точния deploy commit во временна папка..."
if (Test-Path $TempClone) { Remove-Item -Recurse -Force $TempClone }
git clone --depth 1 --branch master $Repo $TempClone
Set-Location $TempClone
git fetch --depth 1 origin $VercelCommit
git checkout -f $VercelCommit
$actual = (git rev-parse HEAD).Trim()
Write-Host "    Checkout: $actual"

Set-Location $Parent

if (Test-Path $Target) {
    Write-Host "==> Backup на старата папка -> $Backup"
    Rename-Item -Path $Target -NewName (Split-Path $Backup -Leaf)
}

Write-Host "==> Преместване на новия проект -> $Target"
Move-Item -Path $TempClone -Destination $Target
Set-Location $Target

if (Test-Path ".env.local") {
    Write-Host "==> Запазен .env.local от backup (ако има)..."
    $bakEnv = Join-Path $Backup ".env.local"
    if (Test-Path $bakEnv) { Copy-Item $bakEnv ".env.local" -Force }
} elseif (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env.local"
}

Write-Host "==> npm install..."
npm install

Write-Host "==> Hero assets (ако липсват)..."
npm run burgas:hero 2>$null

Write-Host ""
Write-Host "ГОТОВО — папката съвпада с Vercel Production ($VercelCommit)"
Write-Host "Стара папка (backup): $Backup"
Write-Host ""
Write-Host "Dev сървър:"
Write-Host "  cd `"$Target`""
Write-Host "  npm run dev"
Write-Host "  http://localhost:3000/cities/burgas"
Write-Host ""
