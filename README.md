# AI Job Application Tracker

A full-stack job-search command center for managing applications, tracking pipeline progress, planning follow-ups/interviews, and surfacing deterministic next actions.

## Why this project?

Job searches often become a spreadsheet of forgotten applications, recruiter messages, interview dates, and follow-ups. This project turns that scattered process into a secure, user-scoped application pipeline with searchable records and actionable insights.

## Features

- Account registration and login
- JWT authentication with bcrypt password hashing
- Optional profile name stored with the account
- User-scoped application data
- Create, edit, and delete applications
- Status pipeline: saved, applied, screening, interview, offer, rejected, withdrawn
- Priority levels: low, medium, high
- Search by company, role, or location
- Filter applications by status
- Follow-up and interview date tracking
- Next-action notes per application
- Pipeline summary: total, active, interviews, offers
- Status breakdown analytics
- Smart next-action recommendations based on status, priority, and dates
- Loading, empty, validation, and error states
- Responsive desktop/mobile interface
- Automated backend tests and frontend build checks through GitHub Actions

> The smart-action feature is deterministic business logic, not a paid LLM call. This keeps the repository runnable without an external AI bill while leaving room for an optional AI provider integration later.

## Architecture

```text
React + TypeScript + Vite
          |
          | REST / JSON + Bearer JWT
          v
       FastAPI
       /     \
      /       \
Authentication  Application API
                    |
                SQLAlchemy
                    |
                    v
                PostgreSQL
```

## Data model

### users

- `id` primary key
- `email` unique, indexed
- `password_hash`
- `full_name`
- `created_at`

### job_applications

- `id` primary key
- `user_id` owner identifier
- `company`, `role`, `location`
- `status`, `priority`
- `salary`
- `application_date`
- `follow_up_date`, `interview_date`
- `next_action`, `notes`
- `created_at`, `updated_at`

Existing PostgreSQL databases must run `backend/migrations/20260902_add_tracking_fields.sql` once after updating the application. Fresh databases created from the SQLAlchemy models include the new columns automatically.

## API

### System

- `GET /api/health` - health check

### Authentication

- `POST /api/auth/register` - create an account and receive a JWT
- `POST /api/auth/login` - authenticate and receive a JWT
- `GET /api/auth/me` - return the authenticated user

### Applications

- `GET /api/applications` - list applications; supports `search` and `status`
- `GET /api/applications/{id}` - fetch one application
- `POST /api/applications` - create an application
- `PATCH /api/applications/{id}` - update an application
- `DELETE /api/applications/{id}` - delete an application
- `GET /api/applications/analytics` - user-scoped pipeline totals and status counts
- `GET /api/applications/smart-actions` - user-scoped next-action recommendations

All application routes require a valid Bearer JWT. Records are always queried using the authenticated user's ID, preventing one user from reading or modifying another user's applications.

## Tech stack

- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI, Pydantic
- ORM: SQLAlchemy 2.x
- Database: PostgreSQL
- Authentication: JWT + bcrypt
- Testing: pytest + FastAPI TestClient
- CI: GitHub Actions

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` using the values in `backend/.env.example`. Configure a PostgreSQL database, then run any required migration from `backend/migrations/`.

Start the API:

```bash
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` when the API is not running at the default local URL.

## Testing

Backend tests live in `backend/tests/test_api.py` and cover health, registration, authenticated `/me`, application CRUD, search, analytics, smart actions, user isolation, and status/priority validation.

Run locally with:

```bash
cd backend
pytest -q
```

Verified GitHub Actions run for the backend suite: **success** on the latest code revision. Verified frontend production build: **success** on the latest code revision. Earlier CI failures were fixed during development and are retained in the repository history as useful debugging evidence.

## Security

- Never commit `.env` files, API keys, passwords, database credentials, or service-role secrets.
- Passwords are stored as bcrypt hashes.
- Protected endpoints require a Bearer JWT.
- Application queries are scoped to the authenticated user.
- Input lengths and application status/priority values are validated server-side.
- CORS is configured through environment settings.

## Deployment

A production deployment is not claimed yet. The connected Vercel account currently has projects for other repositories, but no Vercel project linked to this repository. No unrelated project was deployed or modified.

For a production deployment, connect this repository to a free Vercel project for the frontend and configure `VITE_API_URL` to a verified production API. The FastAPI backend also requires a production host and PostgreSQL connection. No paid service or billing upgrade is required by the repository itself.

## Interview material

- [`INTERVIEW_CHEAT_SHEET.md`](./INTERVIEW_CHEAT_SHEET.md) contains the 30-second and 2-minute explanations, technology/architecture/security/API/database Q&A, project-specific questions, debugging/scalability questions, HR questions, and rapid revision notes.
- A presentation deck is provided separately with the project deliverables.

## Project status

### Code-complete MVP

- Foundation and architecture
- PostgreSQL/SQLAlchemy data model
- CRUD API
- JWT authentication
- React frontend integration
- Search and filtering
- Edit/delete workflow
- Analytics dashboard
- Follow-up/interview tracking
- Priority management
- Smart next-action recommendations
- Automated backend tests
- Frontend build CI
- Security and setup documentation
- Interview cheat sheet
- Presentation deck

### Optional future scope

- Calendar integration for interview dates
- Email/reminder notifications
- CSV/JSON export
- Optional LLM-powered resume/job matching or application coaching using a user-supplied API key
- Production deployment after a suitable free-tier backend host and database are configured

## License

MIT
