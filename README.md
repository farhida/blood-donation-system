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
python -m venv .venv
source .venv/bin/activate
```

2) Install Python dependencies (single command using top-level requirements):

```bash
pip install -r requirements.txt
```

This will pull in the backend dependencies (Django, DRF, SimpleJWT, dj-database-url, etc.).

Backend setup
1. Apply migrations and create a superuser:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

2. Run the dev server:

```bash
python manage.py runserver
```

3. Open http://127.0.0.1:8000/ for API and http://127.0.0.1:8000/admin/ for the admin UI.

Using a production DB (Postgres / MySQL)
- Set the `DATABASE_URL` environment variable before running migrations or the server. Examples:

Postgres example (bash):
```bash
export DATABASE_URL="postgres://USER:PASS@HOST:5432/DBNAME"
python manage.py migrate
```

MySQL example (bash):
```bash
export DATABASE_URL="mysql://USER:PASS@HOST:3306/DBNAME"
python manage.py migrate
```

Frontend setup
1. Install Node.js (v16+) and npm/yarn. Then from repo root:

```bash
cd frontend
npm install
npm start
```

This starts the React dev server (usually on http://localhost:3000). The frontend expects the backend API at the same host under `/api` (proxy configured in development). For production builds:

```bash
cd frontend
npm run build
```

Project layout (important files)
- `backend/` — Django project and apps (`donors`, `accounts`). API endpoints live under `/api/`.
- `frontend/` — React app (create-react-app) with pages in `src/pages` and routes in `src/App.js`.
- `requirements.txt` — top-level file that references backend Python requirements.

API highlights
- Registration: POST `/api/auth/register/` (payload: full_name, email, password, blood_group, district, optional phone/last_donation)
- Login (JWT): POST `/api/login/` (also `/api/token/` available)
- Public donor search: GET `/api/donors/search/?blood_group=A%2B&district=Dhaka`
-- Profile: GET/PUT `/api/profile/`

How this meets the original checklist
- CRUD + DB: implemented via Django models + DRF views/serializers. Django supports sqlite/postgres/mysql; set `DATABASE_URL` to use other DBs.
- Auth: registration and login (JWT) implemented; `Me` endpoint and admin-only APIs provided.
- Admin: Django admin is enabled; admin frontend pages exist.
- Styling & theme: `frontend/src/App.css` defines a consistent theme; most pages use `.card` and token variables for look & feel.
- 6+ pages and dynamic routing: See `frontend/src/App.js` and `frontend/src/pages` — many pages and `react-router` usage.

Troubleshooting
- If `dj_database_url` import fails, ensure you installed requirements into the active venv: `pip install -r requirements.txt`.
- If frontend cannot reach backend in dev mode, ensure the backend is running and check the proxy settings or REACT_APP_API_BASE in `.env`.

Tests
- Backend tests are under `backend/*/tests.py`. Run them with:

```bash
cd backend
python manage.py test
```

Support and next steps
- If you want, I can:
	- Add `admin.site.register(...)` entries so Django admin shows custom models by default.
	- Harden `backend/blood_donation/settings.py` for production (move SECRET_KEY to env, set DEBUG via env, tighten cookie/security settings).
	- Add a `Makefile` or `setup.sh` to automate the entire setup (including Node install checks) for truly one-command setup.
