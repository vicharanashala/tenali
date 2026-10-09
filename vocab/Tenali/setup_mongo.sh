#!/usr/bin/env bash
# Tenali — install and start MongoDB locally on macOS via Homebrew.
# Idempotent: safe to re-run.

set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
  echo "[setup_mongo] This script targets macOS. On Linux install mongodb-community via your package manager."
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "[setup_mongo] Homebrew is required. Install it from https://brew.sh and re-run."
  exit 1
fi

if ! brew tap | grep -q '^mongodb/brew$'; then
  echo "[setup_mongo] Tapping mongodb/brew …"
  brew tap mongodb/brew
fi

if ! brew list --formula 2>/dev/null | grep -q '^mongodb-community'; then
  echo "[setup_mongo] Installing mongodb-community …"
  brew install mongodb-community
else
  echo "[setup_mongo] mongodb-community already installed."
fi

# Start it as a background service so it auto-runs on boot.
echo "[setup_mongo] Starting mongodb-community service …"
brew services start mongodb-community || true

# Wait a moment then ping.
sleep 2

if command -v mongosh >/dev/null 2>&1; then
  echo "[setup_mongo] Pinging MongoDB …"
  if mongosh --quiet --eval 'db.runCommand({ping:1}).ok' >/dev/null 2>&1; then
    echo "[setup_mongo] MongoDB is up at mongodb://127.0.0.1:27017"
  else
    echo "[setup_mongo] MongoDB did not respond yet. Try: brew services list"
  fi
else
  echo "[setup_mongo] mongosh not on PATH; skipping ping. MongoDB should be running on 27017."
fi

echo "[setup_mongo] Done. Server reads MONGO_URI; default is mongodb://127.0.0.1:27017/tenali"
