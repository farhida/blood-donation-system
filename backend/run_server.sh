#!/usr/bin/env bash
set -euo pipefail

echo "Starting server wrapper..."

# If RUN_SEED env var is set to 'true', run the seed_demo management command once.
if [ "${RUN_SEED:-""}" = "true" ]; then
  echo "RUN_SEED=true detected — running seed_demo"
  python manage.py migrate --noinput || true
  python manage.py seed_demo || true
  echo "Seeding finished."
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting gunicorn..."
exec gunicorn blood_donation.wsgi --log-file -
