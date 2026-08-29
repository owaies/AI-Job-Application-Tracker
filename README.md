# AI Job Application Tracker

A portfolio-grade full-stack application for managing job applications, tracking pipeline progress, and preparing for AI-assisted job search workflows.

## Project Status

**Day 1 of 4–5: Foundation**

The repository is being built as a production-minded MVP with a React frontend, FastAPI backend, and PostgreSQL database.

## Problem

Job seekers often track applications across spreadsheets, browser bookmarks, email, and notes. This makes it difficult to see pipeline status, follow-ups, interview history, and overall search performance in one place.

## MVP Solution

AI Job Application Tracker will provide a centralized dashboard where a user can create and manage applications, organize companies and roles, track application stages, and later use analytics and AI-assisted features to make the job search more systematic.

## Planned Core Features

- Application pipeline and status tracking
- Company, role, location, salary/stipend, and application-date fields
- Search, filtering, and sorting
- Follow-up and interview tracking
- Dashboard analytics
- Authentication and protected resources
- AI-assisted job/resume insights where they provide real value

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT + password hashing (planned)
- **Testing:** Pytest + frontend testing (planned)
- **Deployment:** Docker/cloud-ready configuration (planned)

## Architecture

```text
┌──────────────┐
│    User      │
└──────┬───────┘
       │ HTTPS
       ▼
┌──────────────┐
│ React / Vite │
│  Frontend    │
└──────┬───────┘
       │ REST / JSON
       ▼
┌──────────────┐
│   FastAPI    │
│   Backend    │
└──────┬───────┘
       │ SQLAlchemy
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

AI services will be introduced only for concrete workflows such as resume/job analysis or application insights.

## Repository Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── __init__.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── LICENSE
└── README.md
```

## Day 1 Foundation

- Defined the MVP and architecture
- Established frontend/backend boundaries
- Added a runnable FastAPI health endpoint
- Added a React/Vite dashboard shell
- Added environment configuration examples
- Documented local setup and the development roadmap

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend API: `http://127.0.0.1:8000`  
API docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

> PostgreSQL integration will be added during the backend/database phase. Do not add production credentials to the repository.

## Environment Variables

Backend configuration is documented in `backend/.env.example`. Secrets belong in a local `.env` file and must never be committed.

## Development Roadmap

- **Day 1:** Foundation and application shell
- **Day 2:** Database models, migrations, core APIs, authentication
- **Day 3:** Full frontend/API integration and responsive UX
- **Day 4:** Analytics, search/filtering, AI-assisted workflow, security and testing
- **Day 5 (if needed):** Final QA, documentation, screenshots, and portfolio polish

## Author

**Owaies**  
GitHub: https://github.com/owaies

## License

MIT License. See [LICENSE](LICENSE).
