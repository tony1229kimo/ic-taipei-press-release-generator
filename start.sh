#!/bin/sh
set -e
echo "[startup] === Build & Start Script ==="
echo "[startup] PWD: $(pwd)"
echo "[startup] Node: $(node --version)"
echo "[startup] NPM: $(npm --version)"

# Ensure node_modules exists
if [ ! -d node_modules ]; then
  echo "[startup] Installing dependencies..."
  npm install --no-audit --no-fund
fi

# Build frontend if not already built
if [ ! -f dist/index.html ]; then
  echo "[startup] Building frontend..."
  npx vite build
fi

# Compile backend TypeScript if not already compiled
if [ ! -f backend/dist/main.js ]; then
  echo "[startup] Compiling backend TypeScript..."
  npx tsc -p backend/tsconfig.json
fi

# Verify
if [ ! -f backend/dist/main.js ]; then
  echo "[startup] FATAL: backend/dist/main.js still missing after compile"
  ls -la backend/
  exit 1
fi

echo "[startup] All ready, starting server..."
exec node backend/dist/main.js
