Render one-time seed instructions

This repository includes a one-time management command `seed_demo` that creates an admin user (`toushi` / `12345678`) and a few sample donor profiles.

To run it on Render without shell access:

1. In your Render service environment variables (for backend), add:
   - RUN_SEED = true

2. Trigger a manual deploy (or restart). The deploy Build Command will pick up this env var and you can run the command in a one-off migrate/seed step.

3. After deploy and confirming the admin exists, remove the `RUN_SEED` env var (so the command doesn't run again).

If you prefer to run locally, from `backend/` run:

```bash
export DATABASE_URL='<your Neon connection string>'
python manage.py seed_demo
```

Note: this command is idempotent and intended for staging/demo only. Remove or protect it for production use.
