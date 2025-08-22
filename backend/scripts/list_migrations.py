import sqlite3
from pathlib import Path

db = Path(__file__).resolve().parents[1] / 'db.sqlite3'
if not db.exists():
    print('No db.sqlite3 found at', db)
    raise SystemExit(1)

conn = sqlite3.connect(str(db))
cur = conn.cursor()
cur.execute("SELECT app, name, applied FROM django_migrations ORDER BY applied")
rows = cur.fetchall()
if not rows:
    print('No rows in django_migrations')
else:
    apps = {}
    for app, name, applied in rows:
        apps.setdefault(app, []).append(name)
    for a in ('core','donors','accounts','auth','admin'):
        print(f'--- migrations for app: {a} ---')
        for n in apps.get(a, []):
            print(n)

conn.close()
