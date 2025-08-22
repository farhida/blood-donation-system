#!/usr/bin/env bash
set -e

# Install dependencies
pip install -r requirements.txt

# Run migrations; if core initial migration needs to be faked, try that fallback
python manage.py migrate --noinput || (
  python manage.py migrate core 0001_rebuild_core --fake && 
  python manage.py migrate --noinput
)

# Load production fixture (if present)
if [ -f prod_fixture.json ]; then
  echo "Loading prod_fixture.json"
  python manage.py loaddata prod_fixture.json
else
  echo "prod_fixture.json not found; skipping loaddata"
fi

# Collect static files
python manage.py collectstatic --noinput
