Title: Use render_build.sh as Render build command and set admin env vars

Summary
-------
This small PR proposes a single change for the Render service: set the Build Command to run the repository's `render_build.sh` script so the deploy will run migrations, load the prod fixture (if present), create/update a superuser from environment variables, and collect static files.

Why
---
- The current Render Build Command in your service logs shows it ran migrations and collectstatic but did not run the `loaddata` step nor the admin-creation logic added to `render_build.sh`. That prevented a known admin account/password from being created during deploy, which is why the `/admin/` login failed.

Proposed Build Command
---------------------
Set Render's Build Command to the following (Service → Settings → Build Command):

```bash
bash render_build.sh
```

Notes: The script already installs requirements, runs migrations (with a safe fallback), runs `loaddata` if `prod_fixture.json` is present, creates/updates the admin user when `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars are set, and runs `collectstatic`.

Required Environment Variables
------------------------------
Add these environment variables in Render → Environment:

- ADMIN_USERNAME — e.g. `admin` (required for automatic admin creation)
- ADMIN_PASSWORD — strong password (required for automatic admin creation)
- ADMIN_EMAIL — optional, e.g. `ops@example.com`
- DJANGO_SECRET_KEY — production secret key (recommended)
- DATABASE_URL — your Postgres connection string (if not using sqlite)
- DJANGO_DEBUG — set to `False` in production

Verification steps (after deploy)
-------------------------------
1. Trigger a deploy (Manual Deploy in Render or push to main).
2. Watch build logs; look for:
   - "Loading prod_fixture.json" (if fixture found)
   - "Created superuser <username>" or "Updated admin user: <username>"
3. Visit `https://<your-service>/admin/` and sign in with ADMIN_USERNAME/ADMIN_PASSWORD.

If you prefer I can also update the README with a short note pointing to `render_build.sh`, but this PR only proposes the build-command change instructions so it’s easy to review and apply in Render.

Files changed by this PR
-----------------------
- Adds this instruction file `RENDER_BUILD_PR.md` to the repo root (no code changes to app behavior).

Merge note
----------
After merging, set the Render Build Command to `bash render_build.sh` and add the env vars listed above to your Render service environment. Then trigger a deploy.
