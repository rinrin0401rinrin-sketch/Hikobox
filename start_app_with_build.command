#!/bin/zsh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "Updating search index..."
npm run build:search-index

echo "Updating thumbnails..."
npm run build:thumbnails

exec "$PROJECT_DIR/start_app.command"
