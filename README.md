# JobTrack / AI Job Application Tracker

> **Track. Focus. Follow Up. Get Hired.**

JobTrack is a full-stack job-search command center for managing applications, tracking pipeline progress, planning follow-ups and interviews, and surfacing deterministic next actions.

**Live demo:** https://ai-job-application-tracker-rose.vercel.app  
**Repository:** https://github.com/owaies/AI-Job-Application-Tracker

## Why JobTrack?

A job search quickly becomes fragmented across spreadsheets, notes, recruiter messages, and calendar reminders. JobTrack turns that scattered workflow into one authenticated, searchable, user-scoped application registry with pipeline analytics and actionable follow-up guidance.

## Core features

- Account registration and login
- JWT authentication with bcrypt password hashing
- Persistent authenticated session across page refresh
- User-scoped application data
- Create, view, edit, and delete applications
- Status pipeline: saved, applied, screening, interview, offer, rejected, withdrawn
- Priority levels: low, medium, high
- Search by company, role, or location
- Status filtering and sorting
- Follow-up and interview date tracking
- Next-action notes and application notes
- Dashboard totals for total, active, interviews, and offers
- Status distribution analytics
- Deterministic smart next-action recommendations based on status, priority, and dates
- Loading, empty, validation, confirmation, toast, and error states
- Responsive desktop/mobile interface
- Custom date/time and select controls
- GitHub Actions backend tests and frontend production-build checks
- Vercel production deployment backed by PostgreSQL on Supabase

> **AI note:** the current “smart actions” engine is deterministic business logic, not an external LLM call. This keeps the application reproducible and free from a paid AI dependency while leaving room for optional AI features later.

## Screenshots

Real production screenshots supplied for this project are used throughout the final portfolio presentation. They cover the dashboard, applications registry, analytics, profile, login, and session-restoration experience. The presentation treats them as product artifacts with annotated frames rather than mockups.

## Technology stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Component-based UI with static type checking and a fast Vite build |
| Backend | Python + FastAPI + Pydantic | Typed REST API, validation, dependency injection, and OpenAPI docs |
| ORM | SQLAlchemy 2.x | Structured database access and composable queries |
| Database | PostgreSQL | Relational storage for accounts and application records |
| Infrastructure | Supabase PostgreSQL | Managed PostgreSQL infrastructure |
| Authentication | JWT + bcrypt | Signed bearer tokens plus password hashing |
| Testing | pytest + FastAPI TestClient | Automated API and business-logic verification |
| CI | GitHub Actions | Repeatable backend-test and frontend-build checks |
| Deployment | Vercel | Production hosting and Git-based deployment |

## Architecture

```text
                    ┌─────────────────────┐
                    │       USER          │
                    │ Desktop / Android   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │ REST / JSON
                               │ Bearer JWT
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │ Auth + API + Rules  │
                    └──────────┬──────────┘
                               │ SQLAlchemy
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL /        │
                    │ Supabase            │
                    └─────────────────────┘
```

The frontend and API share the production origin through Vercel routing. Application endpoints require a valid Bearer JWT, and queries are scoped to the authenticated user's ID.

## Application workflow

```text
REGISTER
   ↓
LOGIN
   ↓
JWT ACCESS TOKEN
   ↓
SESSION RESTORATION
   ↓
DASHBOARD
   ↓
ADD / EDIT APPLICATION
   ↓
TRACK STATUS + PRIORITY
   ↓
SET FOLLOW-UP / INTERVIEW
   ↓
SMART NEXT ACTION
   ↓
ANALYTICS
   ↓
OFFER / REJECTION / WITHDRAWAL
```

## Database

### `users`

- `id` - primary key
- `email` - unique, indexed
- `password_hash`
- `full_name`
- `created_at`

### `job_applications`

- `id` - primary key
- `user_id` - authenticated owner identifier
- `company`
- `role`
- `location`
- `status`
- `priority`
- `salary`
- `application_date`
- `follow_up_date`
- `interview_date`
- `next_action`
- `notes`
- `created_at`
- `updated_at`

The `user_id` access pattern is indexed. Existing PostgreSQL databases use the migration at `backend/migrations/20260902_add_tracking_fields.sql`; fresh databases can be created from the SQLAlchemy models.

## API

### System
- `GET /api/health`

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Applications
- `GET /api/applications`
- `GET /api/applications/{id}`
- `POST /api/applications`
- `PATCH /api/applications/{id}`
- `DELETE /api/applications/{id}`
- `GET /api/applications/analytics`
- `GET /api/applications/smart-actions`

Application endpoints require Bearer authentication. List, analytics, smart-action, and single-record queries enforce authenticated user ownership.

## Authentication and security

1. User submits credentials.
2. Backend verifies the password against a bcrypt hash.
3. Backend returns a signed JWT containing the user ID and expiry.
4. Frontend stores the access token under `job-tracker-token`.
5. Protected requests send `Authorization: Bearer <token>`.
6. FastAPI verifies the JWT and resolves the authenticated user.
7. Application queries are filtered by that user ID.

The frontend also has an explicit authentication-initialization state. On refresh it waits for `/api/auth/me` to restore the user before rendering the login state. Only a confirmed 401 causes the saved token to be removed; non-authentication bootstrap failures do not silently log the user out.

Secrets, database credentials, API keys, and service-role credentials are kept in environment variables and are not committed.

## Local development

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\\Scripts\\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

Create `backend/.env` from `backend/.env.example` and provide a PostgreSQL connection and JWT settings.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If the API is not served from the default local origin, configure `VITE_API_URL`.

## Testing and verification

Verified on repository revision `5d85c84600e2f58b99a2a5c1d92abfd86bca58f5`:

- GitHub Actions **Backend Tests**: PASS
- GitHub Actions **Frontend Build**: PASS
- Frontend authentication bootstrap regression check: PASS
- Production `GET /api/health`: HTTP 200
- Production unauthenticated `GET /api/applications`: HTTP 401
- Production application detail route `/applications/1`: HTTP 200 and serves the SPA shell
- Vercel production deployment: READY
- Vercel production runtime error/fatal log check for the inspected window: no entries
- Real Android-device acceptance: user-confirmed login/session persistence works after the authentication fix

The automated suite covers health, registration, authenticated `/me`, application CRUD, search, analytics, smart actions, user isolation, and status/priority validation.

## Deployment

**Vercel project:** `ai-job-application-tracker`  
**Production URL:** https://ai-job-application-tracker-rose.vercel.app  
**Latest verified production deployment:** `dpl_2d2hsnXKg9HdpejpvBfRFh5sdn3R`  
**Source commit:** `5d85c84600e2f58b99a2a5c1d92abfd86bca58f5`

Production routing serves the React SPA and the FastAPI API through the same Vercel project. PostgreSQL is hosted on Supabase.

No paid service or billing upgrade was required for the verified deployment.

## Engineering challenge: authentication persistence

### Problem
A valid saved JWT existed after refresh, but the React application initially rendered the unauthenticated branch before `/api/auth/me` finished restoring the user.

### Fix
Added an explicit authentication bootstrap state, restored the user before deciding whether to show the login screen, and limited token removal to confirmed 401 authentication failures.

### Result
The session now survives page refresh. The real Android-device workflow was confirmed working.

Relevant commits:

- `d49ffa001956300bdbcaebdf236307b443b47812` - `fix: persist authentication across page refresh`
- `4c7f44bce5eda73e86c2ecc210b35d50b226165e` - `chore: remove one-time auth fix workflow`
- `5d85c84600e2f58b99a2a5c1d92abfd86bca58f5` - `fix: serve application detail routes through SPA`

## Lessons learned

- Authentication is both a backend security boundary and a frontend state-management problem.
- Persisting a token is not enough; the UI must explicitly bootstrap the authenticated user.
- Database migrations are necessary when existing schemas evolve.
- User ownership must be enforced in backend queries, not just hidden in the UI.
- Deterministic business logic can deliver useful recommendations without forcing an external AI dependency.
- CI catches regressions that are easy to miss during manual development.
- Production routing needs to support direct navigation to SPA routes.

## Future scope

- Calendar integration for interviews
- Email or push reminders for follow-ups
- Pagination and server-side sorting for larger datasets
- CSV/JSON export
- Optional LLM-powered resume/job matching or application coaching using user-supplied credentials
- Workspace/team support for multi-user recruiting workflows

## Portfolio deliverables

The final project presentation and authentic screenshot assets are delivered alongside the repository. The interview preparation guide is versioned in the repository:

- [`INTERVIEW_CHEAT_SHEET.md`](./INTERVIEW_CHEAT_SHEET.md)

## Author

**MOHAMMED OWAIES**  
GitHub: https://github.com/owaies
