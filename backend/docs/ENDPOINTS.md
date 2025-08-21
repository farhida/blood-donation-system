API endpoints used by the frontend

This document lists the consolidated, minimal API surface the frontend calls.
The routes below are exposed under the `/api/` prefix (see `backend/blood_donation/urls.py`).
Implementations are centrally re-exported from `backend/core/views.py` which points at the original code in `accounts/` and `donors/`.

Summary table
- Path (relative to /api/) — HTTP method(s) — Auth required — Implementing view — Notes

1. auth/register/ — POST — AllowAny — `accounts.views.RegisterView`
   - Register a new user. Frontend uses full_name / email / password fields.

2. auth/me/ — GET, PUT — IsAuthenticated — `accounts.views.MyProfileView`
   - Retrieve and update the authenticated user's profile.

3. auth/admin/users/ — GET — IsAdminUser — `accounts.views.AdminUserListView`
   - Admin user listing. Frontend admin UI uses this.

4. auth/admin/users/<id>/ — GET, PUT, DELETE — IsAdminUser — `accounts.views.AdminUserDetailView`
   - Admin user detail and edit endpoint for admin UI.

5. login/ — POST — AllowAny — `donors.views.LoginView`
   - Login endpoint. Supports username, email, or full name as identifier. Returns JWT `access` and `refresh` tokens.

6. donors/search/ — GET — AllowAny — `donors.views.PublicDonorSearch`
   - Public donor search filtered by query params (blood_group, district).
   - Applies donor availability rules: `not_ready == False` AND (`last_donation` is null OR older than 90 days).

7. inventory/ — GET — IsAuthenticated — `donors.views.BloodInventoryList`
   - Returns computed available donors (not a DB inventory table). Phone is returned only when the donor's `share_phone` flag is true.

8. dashboard-summary/ — GET — IsAuthenticated — `donors.views.DashboardSummaryView`
   - Small user dashboard summary used by the frontend.

9. analytics/ — GET — IsAuthenticated — `donors.views.AnalyticsView`
   - Admin or authenticated analytics view used by the admin frontend.

Supporting token endpoints (standard SimpleJWT)
- api/token/ — POST — AllowAny — TokenObtainPairView (returns access & refresh)
- api/token/refresh/ — POST — AllowAny — TokenRefreshView (exchange refresh for new access)

Where routing lives
- Entry: `backend/blood_donation/urls.py` includes `path('api/', include('api.urls'))`.
- Facade: `backend/api/urls.py` declares the consolidated routes.
- Implementation: `backend/core/views.py` re-exports views from `accounts.views` and `donors.views`.

Notes and developer tips
- The donor availability window of 90 days is currently implemented inline in the `donors` views. Consider extracting to settings (e.g. `DONOR_REST_WINDOW_DAYS`) for easier tuning.
- I pruned `accounts/urls.py` and `donors/urls.py` to the minimal set the frontend uses; the view code (and other, now-unrouted views) remain in the codebase as safe backups under `accounts/` and `donors/`.
- Later cleanup: after verification you can move the original app folders into `legacy_` directories or remove unneeded views; do this only after running the app through the common user flows and tests.

Quick smoke-test examples (replace HOST and tokens as appropriate)

Bash examples:

```bash
# 1) Public donor search (no auth required)
curl -i "http://localhost:8000/api/donors/search/?blood_group=O+"

# 2) Obtain token (login)
curl -i -X POST http://localhost:8000/api/token/ -H "Content-Type: application/json" -d '{"username":"alice","password":"secret"}'

# 3) Use access token for an authenticated endpoint (dashboard-summary)
curl -i -H "Authorization: Bearer <ACCESS>" http://localhost:8000/api/dashboard-summary/

# 4) Admin analytics (requires authenticated admin token)
curl -i -H "Authorization: Bearer <ADMIN_ACCESS>" http://localhost:8000/api/analytics/
```

