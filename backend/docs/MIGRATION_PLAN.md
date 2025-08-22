Full merge migration plan

Goal
- Move donor/account model code into the new `core` app and make `core` the canonical app for models.

IMPORTANT
- This operation changes app labels for models. Always backup your DB before proceeding.
- Run these steps locally; I cannot run migrations here. Follow the plan exactly.

Plan overview
1. Add `core` to INSTALLED_APPS (done).
2. Copy models into `backend/core/models.py` (done).
3. Create an empty migration for `core` that declares the models without running SQL (a "fake" initial migration), then generate migrations for `donors` to ensure no conflicts.
4. Update migration history: mark `core` migrations as applied pointing to existing `donors` migrations (or create data migrations to move state). This step may require manual editing.
5. Remove `donors` app from INSTALLED_APPS and update references to point to `core`.

Detailed commands (run from project root)

# 0) BACKUP
cp db.sqlite3 db.sqlite3.bak
# or use your DB backup procedure for Postgres/MySQL

# 1) Ensure code is committed
git add -A
git commit -m "Pre-migration snapshot: add core models"

# 2) Create initial migration for core (do NOT apply yet):
python manage.py makemigrations core --empty -n initial_core

# 3) Create models migrations file for core (manual step may be required):
# Open the newly created migration file and edit it to include CreateModel operations
# equivalent to the donors models or alternatively copy donors migrations' operations.

# 4) Fake-apply the core initial migration so Django considers core present
python manage.py migrate core --fake

# 5) Remove donors from INSTALLED_APPS and run migrate to ensure no duplicate tables.
# Alternatively, if you want to preserve migrations DB history, consider renaming donors app label
# inside donors/apps.py to 'core' and adjusting migration dependencies.

# 6) Thoroughly test all endpoints and run test suite.

Rollbacks
- If anything fails, restore DB from backup and revert commits:
  git reset --hard <commit-before-migration>
  restore db.sqlite3 from backup

Notes and alternatives
- Safer alternative: Keep `donors` as-is and only remove its views/serializers. Move models later with a careful migration authored manually by someone familiar with Django migrations.
- If you use Postgres, consider creating a new schema and using data migration SQL to move tables.

If you want, I can prepare the initial migration files and a draft migration that maps old table names to new models (I will NOT run them). Tell me if you want me to generate that draft migration now.
