Migration: remove `donated_recently` and `not_ready` fields from `core.UserProfile`

Overview

You requested the convenience flags `donated_recently` and `not_ready` be removed from the codebase and availability be driven solely by `last_donation`.

I added a migration skeleton at `backend/core/migrations/0001_remove_donated_flags.py` that expresses the RemoveField operations in Django's migration format. Depending on your database backend there are details to consider.

Recommended safe steps (local, manual):

1) Backup your database file (critical):

   - sqlite: copy `backend/db.sqlite3` somewhere safe.
   - postgres/mysql: dump or backup using your DB tools.

2) Inspect current migration state and ensure you understand dependencies:

   python manage.py showmigrations

   If your project previously used `donors` app and you mapped `core` models' `db_table` to existing tables, you may need to ensure the migration dependency points to the correct migration that created the `donors_userprofile` table. Edit `backend/core/migrations/0001_remove_donated_flags.py` and set `dependencies` accordingly.

3) Apply migrations (recommended on dev copy first):

   python manage.py makemigrations core
   python manage.py migrate core

   Note: In some setups (notably SQLite), Django's `RemoveField` may attempt to alter the table in-place which SQLite doesn't fully support; Django may instead recreate the table if needed. If you see SQLite-specific errors, follow the manual path described below.

SQLite manual path (if automatic migration fails):

- Approach A (recommended local/dev):
  1. Create a new table matching the desired schema (without the two boolean columns).
  2. Copy data from the old table into the new table excluding the dropped columns.
  3. Drop the old table and rename the new table to the original name.

  Steps (example):

  -- open a sqlite shell or use a tool like DB Browser for SQLite
  CREATE TABLE core_userprofile_new (id INTEGER PRIMARY KEY, user_id INTEGER, phone VARCHAR(15), blood_group VARCHAR(10), last_donation DATE, district VARCHAR(100), share_phone BOOLEAN);
  INSERT INTO core_userprofile_new (id, user_id, phone, blood_group, last_donation, district, share_phone)
    SELECT id, user_id, phone, blood_group, last_donation, district, share_phone FROM donors_userprofile;
  ALTER TABLE donors_userprofile RENAME TO donors_userprofile_old;
  ALTER TABLE core_userprofile_new RENAME TO donors_userprofile;

  2. Verify data and then you may remove the old table.

- Approach B (if you prefer Django-managed migration and can tolerate table recreation):
  Let Django recreate the table during migration — but only after backing up DB and testing on a dev copy.

Post-migration steps

- Run `python manage.py makemigrations` and `python manage.py migrate` in your environment
- Run `python manage.py check` to ensure no broken imports or missing fields
- Run a simple smoke test: create a user, set last_donation to today, then query the public donor search endpoint to confirm the user is excluded.

If you'd like, I can:
- Generate a more precise migration file with an explicit `dependencies` value if you tell me which migration in your repo created the original donors tables (for example: `('donors', '0005_userprofile')`).
- Or, I can create a set of SQL statements tailored to your current SQLite database to drop the two columns safely.

Warnings

- Do not run destructive migrations on production without backups and testing.
- The migration file I created may need the correct dependencies adjusted before applying.

Contact me which option you prefer and I will produce the exact migration or SQL for your DB.
