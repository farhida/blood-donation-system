#!/usr/bin/env bash
set -euo pipefail

# backend/build.sh - intended to be invoked from the repo root as:
#   bash backend/build.sh
# This script locates the repository root and runs Django setup steps.

echo "Running backend/build.sh"

# Compute repo root (the directory containing this script's parent directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${SCRIPT_DIR}"

echo "Repo root: ${REPO_ROOT}"
echo "Backend dir: ${BACKEND_DIR}"

echo "Installing Python dependencies (from repo root)"
pip install -r "${REPO_ROOT}/requirements.txt"

cd "${BACKEND_DIR}"

echo "Running migrations"
python manage.py migrate --noinput || (
  python manage.py migrate core 0001_rebuild_core --fake &&
  python manage.py migrate --noinput
)

# Optional safe fixture load: only when LOAD_FIXTURE=True and prod_fixture.json exists in repo root
if [ "${LOAD_FIXTURE:-"False"}" = "True" ] && [ -f "${REPO_ROOT}/prod_fixture.json" ]; then
  echo "LOAD_FIXTURE=True and prod_fixture.json found — checking DB before loading"
  python - <<PY
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blood_donation.settings')
django.setup()
from django.contrib.auth import get_user_model
from django.core.management import call_command
User = get_user_model()
if User.objects.count() == 0:
    print('No users found in DB — loading prod_fixture.json')
    call_command('loaddata', '${REPO_ROOT}/prod_fixture.json')
else:
    print('Users exist in DB — skipping prod_fixture.json load')
PY
else
  echo "Skipping fixture load (set LOAD_FIXTURE=True and ensure prod_fixture.json present to enable)"
fi

# Create or update admin user from env vars if provided
if [ -n "${ADMIN_USERNAME:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "Ensuring admin user exists: ${ADMIN_USERNAME}"
  python - <<PY
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
