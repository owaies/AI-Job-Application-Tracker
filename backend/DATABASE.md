# Database setup

The project uses PostgreSQL through SQLAlchemy 2.x.

1. Create a PostgreSQL database named `job_tracker`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `DATABASE_URL` to the local or hosted PostgreSQL connection string.
4. Run `python -m app.init_db` from `backend` to create the current MVP tables.

The schema will move to versioned Alembic migrations before production deployment.
