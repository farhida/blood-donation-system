# blood-donation-system

This repository implements a Blood Donation system using Django + Django REST Framework for the backend and a React frontend.

This README documents how to set up the project locally (backend and frontend), how the project satisfies your requirements, and quick troubleshooting notes.

Requirements covered
- CRUD connected to DB (sqlite, mysql, postgresql, etc) — backend uses Django ORM; set `DATABASE_URL` to use Postgres/MySQL or use the default SQLite.
- Authorization — registration and login implemented (JWT via SimpleJWT). Registration creates a Django User and a `UserProfile`.
- Admin page — Django admin available at `/admin/`; additional admin frontend pages exist under `/admin`.
- Styling & consistent theme — frontend provides a cohesive theme via `src/App.css` and component styles.
-- 6+ webpages — frontend routes include Donor Search, Login, Register, Profile, Dashboard, Donations, Admin pages, NotFound.
- Dynamic routing — React Router is used (`Routes`, `Route`, `useLocation`, etc.).
- Backend framework used — Django + DRF (required).

Quick setup (one-step Python install)
This repository includes a root `requirements.txt` that references the backend Python requirements. On any machine with Python 3.8+ and Node.js installed you can install all Python dependencies with a single pip install command.

1) Create and activate a Python virtualenv (bash / WSL / Git Bash on Windows):

```bash
# Blood Donation System

This repository contains a Django REST backend and a React frontend for a Blood Donation System.

This README gives quick instructions to run the project locally and notes about deployment and runtime configuration.

Quickstart — backend

1) Create and activate a virtualenv (recommended):

```bash
python -m venv .venv
# On Windows (Git Bash / WSL): source .venv/bin/activate
# On Windows (PowerShell): .\.venv\Scripts\Activate.ps1
```

2) Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

3) Run migrations and start the dev server:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Visit http://127.0.0.1:8000/ for the API and http://127.0.0.1:8000/admin/ for Django admin.

Quickstart — frontend (dev)

```bash
cd frontend
npm install
npm start
```

Build the frontend for production:

```bash
cd frontend
npm run build
```

Runtime configuration for production
- Set `DATABASE_URL` for Postgres/MySQL in production.
- Frontend runtime API host is provided by `runtime-config.json` served at the site root (the app reads `API_URL` from that file at startup).
- Use environment variables to set `SECRET_KEY`, `DEBUG=False`, and admin credentials for automated admin creation if desired.

Files and folders you may remove locally (we removed generated artifacts in this branch):
- `frontend/node_modules/` (regenerate with `npm install`)
- `frontend/build/` (regenerate with `npm run build`)
- local DB `db.sqlite3` should not be tracked (keep a local backup if needed)

Notes
- Preserve `backend/migrations/` — they are required for schema history.
- `prod_fixture.json` is used for guarded seed data during builds; keep it if you rely on build-time seeding.

If you want a PDF or PPTX presentation, tell me and I will create one from `presentation.txt`.
