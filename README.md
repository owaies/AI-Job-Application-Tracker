# AI Job Application Tracker

A full-stack workspace for managing job applications, tracking pipeline progress, and preparing the foundation for AI-assisted job-search insights.

## Day 3 implementation

The React frontend now includes a working authentication flow and application-management dashboard backed by the protected FastAPI API.

### Implemented

- Account registration and login
- JWT stored locally for the current browser session
- Authenticated user lookup
- Protected application listing
- Create application form
- Application pipeline cards
- Status overview counters
- Sign out flow
- API error/loading states
- Responsive layout for desktop and mobile

## Architecture

```text
React + TypeScript
       |
       | REST / JSON + Bearer JWT
       v
FastAPI
  |        |
  |        +--> Authentication
  |
  +------> SQLAlchemy
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

- `GET /api/applications` - list the current user's applications
- `GET /api/applications/{id}` - fetch one application
- `POST /api/applications` - create an application
- `PATCH /api/applications/{id}` - update an application
- `DELETE /api/applications/{id}` - delete an application

All application routes require a valid Bearer JWT.

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
4. Search, filters, analytics, and AI-assisted features
5. Automated tests, security hardening, deployment, and final documentation

## Security notes

Secrets belong in environment variables and must never be committed. JWT-protected endpoints enforce user ownership at the database query level.

## License

MIT
