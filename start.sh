#!/bin/sh
set -e
echo "[startup] === Runtime environment debug ==="
echo "[startup] PWD: $(pwd)"
echo "[startup] /app contents:"
ls -la /app 2>&1 || echo "  /app does not exist"
echo "[startup] /app/backend contents:"
ls -la /app/backend 2>&1 || echo "  /app/backend does not exist"
echo "[startup] /app/backend/dist contents:"
ls -la /app/backend/dist 2>&1 || echo "  /app/backend/dist does not exist"
echo "[startup] /opt/server contents:"
ls -la /opt/server 2>&1 || echo "  /opt/server does not exist"
echo "[startup] === Looking for main.js ==="
find / -name "main.js" -path "*backend*" 2>/dev/null | head -10
find / -name "main.js" -path "*dist*" 2>/dev/null | head -10
echo "[startup] === Attempting to start ==="

# Try multiple known locations
if [ -f /opt/server/dist/main.js ]; then
  echo "[startup] Starting from /opt/server/dist/main.js"
  cd /opt/server && exec node dist/main.js
elif [ -f /app/backend/dist/main.js ]; then
  echo "[startup] Starting from /app/backend/dist/main.js"
  cd /app && exec node backend/dist/main.js
else
  echo "[startup] FATAL: No compiled main.js found anywhere"
  exit 1
fi
