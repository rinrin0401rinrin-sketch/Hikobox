#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/data/photos"
THUMB_DIR="$SOURCE_DIR/thumbs"
MAX_SIZE="${1:-320}"

mkdir -p "$THUMB_DIR"

find "$SOURCE_DIR" -maxdepth 1 -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) | while read -r src; do
  filename="$(basename "$src")"
  target="$THUMB_DIR/$filename"

  if [[ -f "$target" && "$target" -nt "$src" ]]; then
    continue
  fi

  cp "$src" "$target"
  sips -Z "$MAX_SIZE" "$target" >/dev/null
done

echo "thumbnails built in $THUMB_DIR"
