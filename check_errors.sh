conti#!/bin/bash
echo "=== Testing Server ==="
cd /Users/muditagrawal/Documents/Developer/tenali_ff\ copy/Tenali_123/server
node -c index.js 2>&1
echo "Server syntax check exit code: $?"

echo ""
echo "=== Testing Client Build ==="
cd /Users/muditagrawal/Documents/Developer/tenali_ff\ copy/Tenali_123/client
npx vite build 2>&1
echo "Client build exit code: $?"

