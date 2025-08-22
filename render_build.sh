#!/usr/bin/env bash
set -e

# Install dependencies
pip install -r requirements.txt

# Run migrations; if core initial migration needs to be faked, try that fallback
python manage.py migrate --noinput || (
  python manage.py migrate core 0001_rebuild_core --fake && 
  python manage.py migrate --noinput
)

# Load production fixture only when explicitly requested via LOAD_FIXTURE env var
# This prevents accidental duplicate imports and keeps production data safe.
if [ "${LOAD_FIXTURE:-"False"}" = "True" ] && [ -f prod_fixture.json ]; then
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
    call_command('loaddata', 'prod_fixture.json')
else:
    print('Users exist in DB — skipping prod_fixture.json load')
PY
else
  echo "Skipping fixture load (set LOAD_FIXTURE=True and ensure prod_fixture.json is present to enable)"
fi

# Create or update admin user from environment variables (ADMIN_USERNAME, ADMIN_PASSWORD, optional ADMIN_EMAIL)
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

# Collect static files
python manage.py collectstatic --noinput
