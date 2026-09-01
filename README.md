# AI Job Application Tracker

A portfolio-grade full-stack application for managing job applications, tracking pipeline progress, and preparing for AI-assisted job search workflows.

## Project Status

**Authentication milestone complete. Core application APIs are protected by JWT authentication.**

## Implemented Features

- React + TypeScript + Vite frontend shell
- FastAPI backend with automatic OpenAPI documentation
- PostgreSQL connection configuration
- SQLAlchemy 2.x database layer
- User persistence with unique email addresses
- Secure password hashing with bcrypt
- JWT access tokens with expiration
- Register, login, and current-user endpoints
- Bearer-token authentication dependency
- User-scoped job application CRUD APIs
- Application status allow-list validation
- `/api/health` readiness endpoint
- Environment-based configuration with secrets excluded from Git

## Authentication API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account and receive a JWT |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Return the authenticated user |

Send the token in subsequent requests:

```text
Authorization: Bearer <access_token>
```

Application endpoints now require authentication. Each query is scoped to the authenticated user's ID, preventing one user from reading or modifying another user's applications.

## Application API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/applications` | List the authenticated user's applications |
| GET | `/api/applications/{id}` | Get one owned application |
| POST | `/api/applications` | Create an application |
| PATCH | `/api/applications/{id}` | Update an owned application |
| DELETE | `/api/applications/{id}` | Delete an owned application |

Interactive API documentation is available at `/docs` when the FastAPI server is running.

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT + bcrypt password hashing
- **Deployment:** Free-tier deployment planned after integration and QA

## Architecture

```text
User
  ↓ HTTPS
React / Vite
  ↓ REST / JSON + Bearer JWT
FastAPI
  ↓ SQLAlchemy
PostgreSQL
```

## Local Setup

Create a PostgreSQL database named `job_tracker`, then configure `backend/.env` from `backend/.env.example`. Set `JWT_SECRET_KEY` to a long random value for local use.

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.init_db
uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`  
API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Security Notes

- Passwords are never stored in plaintext; only bcrypt hashes are persisted.
- JWTs have a finite expiration time.
- Protected application routes derive ownership from the authenticated JWT identity.
- Invalid, expired, or missing bearer tokens receive `401 Unauthorized`.
- Duplicate registration attempts receive `409 Conflict`.
- Input validation is handled by Pydantic and explicit application-status validation.
- Never commit `.env` files or production credentials.

## Roadmap

- **Foundation:** React/Vite + FastAPI + database configuration ✅
- **Backend:** SQLAlchemy model + validated CRUD API ✅
- **Authentication:** Registration, login, JWT, protected resources ✅
- **Next:** Frontend authentication and application management UI
- **Then:** Search/filtering, interview and follow-up tracking, analytics, AI-assisted workflow, testing
- **Final:** QA, free-tier Supabase/Vercel deployment where appropriate, screenshots, presentation, and interview preparation

## Author

**Owaies**  
GitHub: https://github.com/owaies

## License

MIT License. See [LICENSE](LICENSE).
