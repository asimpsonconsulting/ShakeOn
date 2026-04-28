#!/usr/bin/env bash
# Serve the repo over HTTP so ES modules load (file:// will not work).
set -e
cd "$(dirname "$0")"
PORT="${PORT:-8765}"
echo ""
echo "  Shake On — local preview"
echo "  ─────────────────────────"
echo "  Hero demo:  http://127.0.0.1:${PORT}/shake-on-overflow-hero.html"
echo "  Main site:   http://127.0.0.1:${PORT}/index.html"
echo ""
echo "  Press Ctrl+C to stop."
echo ""
exec python3 -m http.server "$PORT"
