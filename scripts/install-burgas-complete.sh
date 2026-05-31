#!/usr/bin/env bash
# Копира файлове от разархивиран burgas-COMPLETE в burgas-complete/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/burgas-COMPLETE}"
DEST="$ROOT/burgas-complete"

if [ ! -d "$SRC" ]; then
  echo "Липсва папка: $SRC"
  echo "Разархивирайте burgas-COMPLETE (2).zip в $ROOT/burgas-COMPLETE и пуснете отново."
  exit 1
fi

for sub in city quarter property; do
  if [ -d "$SRC/$sub" ]; then
    cp -a "$SRC/$sub/." "$DEST/$sub/"
    echo "OK: $sub"
  fi
done

echo "Готово. Рестартирайте npm run dev."
