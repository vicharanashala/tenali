#!/bin/bash
# git-push.sh — One-command commit & push with auto lock cleanup + version bump
# Usage:
#   ./git-push.sh "your commit message"
#   ./git-push.sh                        (uses a default message with timestamp)

set -e

cd "$(dirname "$0")"

# 1. Clean ALL stale git locks
for lockfile in .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock; do
  if [ -f "$lockfile" ]; then
    echo "🔓 Removing stale $lockfile..."
    rm -f "$lockfile"
  fi
done

# 2. Auto-increment version and update build date in App.jsx
APP_FILE="client/src/App.jsx"
if [ -f "$APP_FILE" ]; then
  # Extract current version
  CURRENT_VERSION=$(grep "const TENALI_VERSION" "$APP_FILE" | sed "s/.*= '//;s/'.*//")
  if [ -n "$CURRENT_VERSION" ]; then
    # Increment patch version (1.0.1 → 1.0.2)
    MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
    MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
    PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"
    # Get current IST time (UTC+5:30)
    IST_DATE=$(TZ='Asia/Kolkata' date '+%Y-%m-%d %H:%M IST')
    # Update version and date in file
    sed -i '' "s/const TENALI_VERSION = '${CURRENT_VERSION}'/const TENALI_VERSION = '${NEW_VERSION}'/" "$APP_FILE"
    sed -i '' "s/const TENALI_BUILD_DATE = '.*'/const TENALI_BUILD_DATE = '${IST_DATE}'/" "$APP_FILE"
    echo "📌 Version: ${CURRENT_VERSION} → ${NEW_VERSION} (${IST_DATE})"
  fi
fi

# 3. Stage & commit if there are changes
git add -A
if git diff --cached --quiet; then
  echo "✅ Nothing new to commit."
else
  MSG="${1:-auto-commit $(date '+%Y-%m-%d %H:%M:%S')}"
  echo "📝 Committing: $MSG"
  git commit -m "$MSG"
fi

# 4. Push (always — even if nothing new was committed, there may be unpushed commits)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🚀 Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "✅ Done!"
