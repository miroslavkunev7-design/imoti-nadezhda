#!/usr/bin/env bash
# Копира файлове от разархивиран burgas-COMPLETE в burgas-complete/
# Използване: bash scripts/install-burgas-complete.sh [папка-източник]
# Или: bash scripts/burgas-max-setup.sh (авто-намира zip)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/burgas-COMPLETE}"
DEST="$ROOT/burgas-complete"

if [ ! -d "$SRC" ]; then
  echo "Липсва папка: $SRC"
  echo "Разархивирайте burgas-COMPLETE (2).zip в $ROOT/burgas-COMPLETE"
  echo "или пуснете: bash scripts/burgas-max-setup.sh"
  echo "или на Windows: .\\scripts\\setup-miro-desktop.ps1"
  exit 1
fi

for sub in city quarter property; do
  if [ -d "$SRC/$sub" ]; then
    cp -a "$SRC/$sub/." "$DEST/$sub/"
    echo "OK: $sub"
  fi
done

echo "Готово. Рестартирайте npm run dev."
