# AI Job Application Tracker

A full-stack workspace for managing job applications, tracking pipeline progress, and preparing the foundation for AI-assisted job-search insights.

## Current implementation

The React frontend is connected to a protected FastAPI API and now provides application management plus pipeline analytics.

### Features implemented

- Account registration and login
- JWT authentication with protected API resources
- User-scoped application data
- Create, edit, and delete applications
- Application status pipeline
- Search by company, role, or location
- Filter applications by status
- Pipeline summary cards for total, active, interviews, and offers
- Status breakdown analytics
- API loading, empty, validation, and error states
- Responsive desktop/mobile interface

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

## Backend API

### Authentication

- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - authenticate and receive an access token
- `GET /api/auth/me` - return the authenticated user

### Applications

- `GET /api/applications` - list applications; supports `search` and `status` query parameters
- `GET /api/applications/{id}` - fetch one application
- `POST /api/applications` - create an application
- `PATCH /api/applications/{id}` - update an application
- `DELETE /api/applications/{id}` - delete an application
- `GET /api/applications/analytics` - return user-scoped pipeline totals and status counts

All application routes require a valid Bearer JWT. Application reads and mutations are restricted to the authenticated user's records.

## Tech stack

- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI, Pydantic
- ORM: SQLAlchemy
- Database: PostgreSQL
- Authentication: JWT + bcrypt password hashing

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` from the documented environment variables and configure a PostgreSQL database, then run:

```bash
uvicorn app.main:app --reload
```

API docs are available at `http://127.0.0.1:8000/docs` while the backend is running.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` when the API is not running at the default local URL.

## Development roadmap

1. Foundation and architecture - complete
2. Database and CRUD API - complete
3. Authentication and frontend integration - complete
4. Search, filters, analytics, and application management - complete
5. AI-assisted workflow, automated tests, security hardening, deployment, and final documentation

## Security notes

- Secrets belong in environment variables and must never be committed.
- Passwords are stored as bcrypt hashes rather than plaintext.
- JWT-protected endpoints identify the current user before accessing application records.
- Search and status filters operate only within the authenticated user's application scope.

## Deployment

Production deployment has not yet been claimed. Vercel and Supabase configuration will be documented only after the corresponding free-tier setup and deployment are actually verified.

## License

MIT
