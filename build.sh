#!/usr/bin/env bash
set -e

# Top-level wrapper so Render can run a single build command from repo root.
# Usage in Render Build Command: bash build.sh

echo "Invoking backend/build.sh from repo root"
bash ./backend/build.sh
#!/usr/bin/env bash
# exit on error
set -o errexit

# Build React frontend first
echo "Building React frontend..."
cd frontend
npm ci
npm run build
cd ..

# Navigate to backend directory for Django operations
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run Django commands
python manage.py migrate


# Create static directories and copy essential files
mkdir -p staticfiles/media

# Copy essential assets (logo)
cp ../frontend/src/assets/IUBAT2.png staticfiles/media/IUBAT2.png 2>/dev/null || true

# Collect static files
python manage.py collectstatic --noinput