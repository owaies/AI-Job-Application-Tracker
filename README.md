# AI Job Application Tracker

A portfolio-grade full-stack application for managing job applications, tracking pipeline progress, and preparing for AI-assisted job search workflows.

## Project Status

**Day 2 of 4–5: Backend + Database foundation**

## Problem

Job seekers often track applications across spreadsheets, browser bookmarks, email, and notes. This makes it difficult to see pipeline status, follow-ups, interview history, and overall search performance in one place.

## MVP Solution

A centralized tracker for applications, companies, roles, statuses, dates, compensation notes, and follow-ups, with analytics and AI-assisted workflows planned only where useful.

## Current Features

- React + TypeScript + Vite frontend shell
- FastAPI backend
- PostgreSQL connection configuration
- SQLAlchemy 2.x database layer
- `job_applications` schema for core application data
- `/api/health` readiness endpoint
- `/api/applications` application listing endpoint
- Environment-based configuration with secrets excluded from Git

## Planned Features

- Application create/update/delete workflows
- Authentication and protected resources
- Search, filtering, sorting, and pagination
- Interview and follow-up tracking
- Dashboard analytics
- AI-assisted resume/job insights
- Automated tests and production deployment

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT + password hashing (next backend phase)
- **Testing:** Pytest + frontend testing
- **Deployment:** Vercel frontend + suitable backend hosting when configured

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
│   │   └── settings.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
├── .gitignore
├── LICENSE
└── README.md
```

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

## Development Roadmap

- **Day 1:** Foundation and application shell ✅
- **Day 2:** Database layer and core backend foundation 🚧
- **Day 3:** Authentication, CRUD APIs, and frontend/API integration
- **Day 4:** Analytics, search/filtering, AI-assisted workflow, security, and testing
- **Day 5 (if needed):** QA, deployment, documentation, screenshots, and portfolio polish

## Author

**Owaies**  
GitHub: https://github.com/owaies

## License

MIT License. See [LICENSE](LICENSE).
