#!/usr/bin/env bash
set -euo pipefail

# Top-level wrapper so Render can run a single build command from repo root.
# Usage in Render Build Command: bash build.sh

echo "Building frontend (if present)..."
if [ -d "frontend" ]; then
	pushd frontend > /dev/null
	if [ -f package.json ]; then
		npm ci
		npm run build
	else
		echo "No package.json in frontend — skipping frontend build"
	fi
	popd > /dev/null
else
	echo "No frontend directory found — skipping frontend build"
fi

echo "Invoking backend/build.sh from repo root"
bash ./backend/build.sh