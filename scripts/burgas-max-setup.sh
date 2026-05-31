#!/usr/bin/env bash
# Максимално Burgas съвпадение: намери zip → install-burgas-complete → build assets
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

find_zip() {
  local candidates=(
    "$ROOT/burgas-COMPLETE (2).zip"
    "$ROOT/burgas-COMPLETE.zip"
    "${MIRO_DESKTOP:-}/burgas-COMPLETE (2).zip"
    "${MIRO_DESKTOP:-$HOME/Desktop/Miro}/burgas-COMPLETE (2).zip"
    "$HOME/Desktop/burgas-COMPLETE (2).zip"
    "$HOME/Desktop/new im/burgas-COMPLETE (2).zip"
    "$HOME/Downloads/burgas-COMPLETE (2).zip"
    "/mnt/c/Desktop/Miro/burgas-COMPLETE (2).zip"
    "/mnt/c/Users/*/Desktop/Miro/burgas-COMPLETE (2).zip"
  )
  for z in "${candidates[@]}"; do
    # shellcheck disable=SC2086
    for f in $z; do
      [[ -f "$f" ]] && echo "$f" && return 0
    done
  done
  return 1
}

install_from_dir() {
  if [[ -d "$ROOT/burgas-COMPLETE" ]]; then
    bash "$ROOT/scripts/install-burgas-complete.sh"
    return 0
  fi
  return 1
}

ZIP=""
if ZIP="$(find_zip 2>/dev/null)"; then
  echo "==> Намерен zip: $ZIP"
  WORK="$(mktemp -d)"
  unzip -q -o "$ZIP" -d "$WORK"
  # Нормализирай структурата
  if [[ -d "$WORK/burgas-COMPLETE" ]]; then
    rm -rf "$ROOT/burgas-COMPLETE"
    mv "$WORK/burgas-COMPLETE" "$ROOT/burgas-COMPLETE"
  elif [[ -d "$WORK/city" ]]; then
    rm -rf "$ROOT/burgas-COMPLETE"
    mkdir -p "$ROOT/burgas-COMPLETE"
    for sub in city quarter property; do
      [[ -d "$WORK/$sub" ]] && mv "$WORK/$sub" "$ROOT/burgas-COMPLETE/"
    done
  fi
  rm -rf "$WORK"
fi

if install_from_dir; then
  echo "==> burgas-complete инсталиран от zip"
else
  echo "WARN: Няма burgas-COMPLETE — сложи burgas-COMPLETE (2).zip в проекта или Desktop/Miro"
fi

if command -v node >/dev/null 2>&1; then
  node -e "
const fs=require('fs');const p='public/images/cities/burgas-city-hero-sunset.jpg';
if(fs.existsSync(p)&&fs.existsSync('node_modules/sharp')){
  require('sharp')(p).webp({quality:90}).toFile('public/images/cities/burgas-city-hero-sunset.webp').then(()=>console.log('webp ok')).catch(()=>{});
} else console.log('skip webp');
" 2>/dev/null || true
fi

echo "==> burgas-max-setup готово"
