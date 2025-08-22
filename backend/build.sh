#!/usr/bin/env bash
set -e

# This wrapper is intended to be invoked from the repo root by Render as:
#   bash backend/build.sh
# It runs installs, migrations, optional fixture load (safe), admin creation, and collectstatic.

echo "Running backend/build.sh"

# Install top-level requirements
echo "Installing dependencies"
pip install -r requirements.txt

echo "Changing to backend/ and running migrations"
cd backend

# Run migrations (with safe fake fallback for core initial rebuild migration)
python manage.py migrate --noinput || (
  python manage.py migrate core 0001_rebuild_core --fake &&
  python manage.py migrate --noinput
)

# Optional safe fixture load: only when LOAD_FIXTURE=True and DB has no users
if [ "${LOAD_FIXTURE:-"False"}" = "True" ] && [ -f ../prod_fixture.json ]; then
  echo "LOAD_FIXTURE=True and prod_fixture.json found — checking DB before loading"
  python - <<'PY'
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blood_donation.settings')
django.setup()
from django.contrib.auth import get_user_model
from django.core.management import call_command
User = get_user_model()
if User.objects.count() == 0:
    print('No users found in DB — loading prod_fixture.json')
    call_command('loaddata', '../prod_fixture.json')
else:
    print('Users exist in DB — skipping prod_fixture.json load')
PY
else
  echo "Skipping fixture load (set LOAD_FIXTURE=True and ensure prod_fixture.json present to enable)"
fi

# Create or update admin user from env vars if provided
if [ -n "$ADMIN_USERNAME" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Ensuring admin user exists: $ADMIN_USERNAME"
  python - <<'PY'
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blood_donation.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
u = os.environ.get('ADMIN_USERNAME')
p = os.environ.get('ADMIN_PASSWORD')
e = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
if u and p:
    user, created = User.objects.get_or_create(username=u, defaults={'email': e, 'is_staff': True, 'is_superuser': True})
    if created:
        user.set_password(p)
        user.save()
        print('Created superuser', u)
    else:
        changed = False
        if not user.check_password(p):
            user.set_password(p); changed = True
        if not user.is_staff:
            user.is_staff = True; changed = True
        if not user.is_superuser:
            user.is_superuser = True; changed = True
        if changed:
            user.save(); print('Updated admin user:', u)
        else:
            print('Admin user exists and is unchanged:', u)
else:
    print('ADMIN_USERNAME or ADMIN_PASSWORD missing; skipping admin creation')
PY
else
  echo "ADMIN_USERNAME or ADMIN_PASSWORD not set; skipping admin creation"
fi

echo "Collecting static files"
python manage.py collectstatic --noinput

echo "backend/build.sh completed"
