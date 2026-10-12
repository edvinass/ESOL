#!/usr/bin/env bash
# Starts the ESOL Trainer in development mode.
# Usage: ./dev.sh [port]   (default port 3000, or $PORT)
set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-${PORT:-3000}}"

if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "Installing dependencies…"
  npm install
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example."
fi

if ! grep -qE '^OPENAI_API_KEY=.{20,}' .env.local; then
  echo "Warning: OPENAI_API_KEY is empty in .env.local."
  echo "         Writing feedback and generating sets or voices will not work until you add it."
fi

if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Stop that process or run: ./dev.sh <other port>"
  exit 1
fi

echo "Starting on http://localhost:$PORT"
exec npx next dev --port "$PORT"
