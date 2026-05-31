#!/usr/bin/env bash
# Пълен setup за Desktop/Miro (Linux/macOS/Git Bash) — същото като setup-miro-desktop.ps1
set -euo pipefail

DESKTOP_MIRO="${MIRO_DESKTOP:-$HOME/Desktop/Miro}"
PROJECT_NAME="imoti-nadezhda"
TARGET="$DESKTOP_MIRO/$PROJECT_NAME"
REPO="https://github.com/miroslavkunev7-design/imoti-nadezhda.git"
BRANCH="${IMOTI_BRANCH:-master}"

echo "==> Цел: $TARGET"
mkdir -p "$DESKTOP_MIRO"

if [[ -d "$TARGET/.git" ]]; then
  echo "==> git pull"
  git -C "$TARGET" fetch origin
  git -C "$TARGET" checkout "$BRANCH"
  git -C "$TARGET" pull origin "$BRANCH"
else
  echo "==> git clone"
  git clone --branch "$BRANCH" --depth 1 "$REPO" "$TARGET"
fi

cd "$TARGET"

if command -v vercel >/dev/null 2>&1; then
  echo "==> vercel pull"
  vercel pull --yes 2>/dev/null || echo "vercel pull skipped"
else
  [[ -f .env.local ]] || [[ -f .env.example ]] && cp -n .env.example .env.local 2>/dev/null || true
fi

npm install
bash "$(dirname "$0")/burgas-max-setup.sh" || true
npm run build

echo "ГОТОВО: $TARGET"
echo "npm run dev → http://localhost:3000/cities/burgas"
