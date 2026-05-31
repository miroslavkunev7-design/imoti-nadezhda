#!/usr/bin/env bash
# Експорт на целия проект (като Vercel/Git master) без node_modules — за Desktop/Miro
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/dist/imoti-nadezhda-full.zip}"
mkdir -p "$(dirname "$OUT")"
cd "$ROOT"
git archive --format=zip -o "$OUT" HEAD
echo "Създаден: $OUT"
echo "На Windows: разархивирай в C:\\Desktop\\Miro\\ и пусни scripts\\setup-miro-desktop.ps1"
