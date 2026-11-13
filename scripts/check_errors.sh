#!/usr/bin/env bash
# scripts/check_errors.sh — syntax-check server entry point and build client SPA
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Testing Server Syntax ==="
cd "$REPO_ROOT/server"
node -c index.js 2>&1
echo "Server syntax check exit code: $?"

echo ""
echo "=== Testing Client Build ==="
cd "$REPO_ROOT/client"
npm run build 2>&1
echo "Client build exit code: $?"
