Backend (Django) README

Purpose
- Small Django + DRF backend for the Blood Donation System.

Quickstart (developer)
1. Create and activate a virtual environment (recommended):
   python -m venv venv
   source venv/Scripts/activate    # on Windows (Git Bash/msys)
2. Install dependencies:
   pip install -r requirements.txt
3. Run migrations and start server:
   python manage.py migrate
   python manage.py runserver

Important notes
- Do NOT commit your virtual environment or local sqlite DB. This repository previously contained `venv/` and `db.sqlite3` which should be removed from Git history and ignored. To remove tracked files and keep them locally:
  git rm -r --cached venv/
  git rm --cached db.sqlite3
  git commit -m "Remove venv and db from repo; add .gitignore"
- For production, set SECRET_KEY and DEBUG via environment variables and use a real DB (Postgres/MySQL).
- The donor availability rule: donors marked `not_ready` or whose `last_donation` is within 90 days are excluded from public availability and inventory endpoints.

Files of interest
- `accounts/` - registration, user/profile serializers and admin user endpoints.
- `donors/` - donor profiles, requests, notifications, inventory, donations, analytics.
- `blood_donation/settings.py` - project settings; review DB and security settings before deploying.

If you'd like, I can now safely remove tracked `venv/` and `db.sqlite3` from Git and add a commit that documents the change. Confirm to proceed with destructive removals.
