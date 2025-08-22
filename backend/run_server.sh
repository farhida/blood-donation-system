#!/usr/bin/env bash
set -euo pipefail

echo "Starting server wrapper..."

# If RUN_SEED env var is set to 'true', run the seed_demo management command once.
if [ "${RUN_SEED:-""}" = "true" ]; then
  echo "RUN_SEED=true detected — running seed_demo"
  echo "Running migrations..."
  python manage.py migrate --noinput
  echo "Running core.seed_demo command..."
  python manage.py seed_demo
  echo "Seeding finished. To avoid re-running, unset RUN_SEED or set it to 'false'."
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting gunicorn..."
exec gunicorn blood_donation.wsgi --log-file -
