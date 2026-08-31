# AI Job Application Tracker

A portfolio-grade full-stack application for managing job applications, tracking pipeline progress, and preparing for AI-assisted job search workflows.

## Project Status

**Backend milestone in progress: database + validated CRUD API**

## Problem

Job seekers often track applications across spreadsheets, browser bookmarks, email, and notes. This makes it difficult to see pipeline status, follow-ups, interview history, and overall search performance in one place.

## MVP Solution

A centralized tracker for applications, companies, roles, statuses, dates, compensation notes, and follow-ups, with analytics and AI-assisted workflows planned only where useful.

## Implemented Features

- React + TypeScript + Vite frontend shell
- FastAPI backend with automatic OpenAPI documentation
- PostgreSQL connection configuration
- SQLAlchemy 2.x database layer
- `job_applications` schema for core application data
- Pydantic request/response validation
- Application list endpoint
- Application detail endpoint
- Application create endpoint
- Application partial-update endpoint
- Application delete endpoint
- Status allow-list validation
- User-scoped queries using a temporary development user until authentication is implemented
- `/api/health` readiness endpoint
- Environment-based configuration with secrets excluded from Git

## Planned Features

- JWT authentication and protected resources
- Password hashing and authorization
- Frontend application management UI
- Search, filtering, sorting, and pagination
- Interview and follow-up tracking
- Dashboard analytics
- AI-assisted resume/job insights using a free/open-source or explicitly approved provider
- Automated tests
- Free-tier deployment when appropriate

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT + password hashing (planned)
- **Testing:** Pytest + frontend testing (planned)
- **Deployment:** Vercel/free-tier services when configured and verified

## Architecture

```text
User
  ↓ HTTPS
React / Vite
  ↓ REST / JSON
FastAPI
  ↓ SQLAlchemy
PostgreSQL
```

## Repository Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── applications.py
│   │   ├── db.py
│   │   ├── init_db.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── settings.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
├── .gitignore
├── LICENSE
└── README.md
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API readiness |
| GET | `/api/applications` | List development user's applications |
| GET | `/api/applications/{id}` | Get one application |
| POST | `/api/applications` | Create an application |
| PATCH | `/api/applications/{id}` | Update an application |
| DELETE | `/api/applications/{id}` | Delete an application |

Interactive API documentation is available at `/docs` when the FastAPI server is running.

### Supported application statuses

`saved`, `applied`, `screening`, `interview`, `offer`, `rejected`, `withdrawn`

## Local Setup

### PostgreSQL

Create a database named `job_tracker`, then configure `backend/.env` from `backend/.env.example`.

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

- Never commit `.env` files or production credentials.
- `JWT_SECRET_KEY` must be replaced with a long random secret outside local examples.
- Authentication and authorization are not yet claimed as implemented.
- Application queries are currently scoped to development user ID `1`; this will be replaced by the authenticated user's identity in the authentication milestone.

## Development Roadmap

- **Foundation:** React/Vite + FastAPI + database configuration ✅
- **Backend:** SQLAlchemy model + validated CRUD API 🚧
- **Next:** Authentication, protected resources, and frontend/API integration
- **Then:** Analytics, search/filtering, AI-assisted workflow, security, testing
- **Final:** QA, free-tier deployment where appropriate, documentation, screenshots, presentation, and interview preparation

## Author

**Owaies**  
GitHub: https://github.com/owaies

## License

MIT License. See [LICENSE](LICENSE).
