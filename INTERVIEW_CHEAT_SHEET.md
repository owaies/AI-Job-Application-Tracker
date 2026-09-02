# AI Job Application Tracker - Interview Cheat Sheet

## 30-second explanation

I built a full-stack job application tracker using React and TypeScript on the frontend and FastAPI with SQLAlchemy on the backend. Users can securely register and log in with JWT authentication, then create, edit, search, filter, prioritize, and delete their job applications. The dashboard provides pipeline analytics and deterministic smart next-action recommendations based on application status and dates. The API enforces user-level data isolation, and the repository includes automated backend tests and frontend build CI.

## 2-minute explanation

The problem I wanted to solve was the difficulty of keeping a job search organized once applications, screening stages, interviews, and follow-ups start accumulating.

The application uses a React + TypeScript + Vite frontend and a Python FastAPI REST backend. Authentication is handled by JWT access tokens, while passwords are stored as bcrypt hashes. After login, the frontend sends the token in the Authorization header for protected API requests.

The main database entity is `job_applications`, which stores company, role, location, status, priority, salary, application date, follow-up date, interview date, next action, and notes. Each record contains a `user_id`, and every application query uses the authenticated user's ID. This prevents one account from accessing another account's records.

The API supports CRUD operations, search across company/role/location, status filtering, analytics, and smart-action recommendations. The analytics endpoint calculates total, active, interview, offer, and per-status counts. The smart-action endpoint is intentionally deterministic rather than an external LLM call, so the project remains free to run and easy to reproduce.

The frontend combines the create/edit form, searchable pipeline, analytics, and smart actions into a responsive dashboard. GitHub Actions runs backend tests and the frontend production build. Production deployment is not claimed yet because a suitable Vercel project and production FastAPI/PostgreSQL host have not been verified for this repository.

## Architecture Q&A

### Why FastAPI?
FastAPI provides typed request validation, automatic OpenAPI documentation, dependency injection, and good performance with a small Python codebase.

### Why React + TypeScript?
React makes the dashboard component-based, while TypeScript catches mismatches between API data and UI state during development.

### Why SQLAlchemy?
SQLAlchemy gives the backend a structured ORM layer, typed models, query composition, and database portability.

### Why PostgreSQL?
The application is relational: users own many applications, and fields such as status, dates, and ownership benefit from relational constraints and indexing.

### Why REST?
The frontend and backend are independently deployable. REST + JSON keeps the boundary simple and easy to test with Swagger/OpenAPI.

## Authentication and security

### How does login work?
The API finds the user by normalized email, verifies the password against its bcrypt hash, and returns a signed JWT containing the user ID and expiry.

### How are protected routes secured?
FastAPI's HTTP Bearer dependency extracts the JWT. The backend verifies its signature and expiration, resolves the user, and injects that user into the route.

### How is data isolation enforced?
Application queries include both the application ID and the authenticated `user_id` when fetching a single record. List, analytics, and smart-action queries also filter by the authenticated user's ID.

### What should never be committed?
`.env` files, JWT secrets, database passwords, API keys, Supabase service-role keys, and other credentials.

### What is CORS doing?
CORS restricts which browser origins can call the API. The allowed origins are configured through environment settings rather than hard-coded production secrets.

## Database Q&A

### What are the main tables?
`users` stores account credentials/profile data. `job_applications` stores the user's job-search records.

### Why is `user_id` indexed?
Most application queries are scoped by user ID, so an index supports that access pattern as the dataset grows.

### How are schema changes handled?
SQLAlchemy models define fresh database structure. The repository also contains an explicit PostgreSQL migration for adding profile and tracking fields to an existing database.

### Why is a migration needed if SQLAlchemy creates tables?
`create_all()` creates missing tables but does not safely alter an existing production table. A migration makes an existing database upgrade explicit and repeatable.

## API Q&A

### What endpoints exist?
`/api/health`, `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, and application CRUD plus `/analytics` and `/smart-actions`.

### What does PATCH provide?
PATCH changes only the fields supplied by the client, which is appropriate for editing individual application attributes.

### How are invalid statuses handled?
The backend validates the status against the allowed pipeline set and returns HTTP 422 for invalid values.

### How are invalid priorities handled?
Priority is restricted to low, medium, and high, with the same server-side 422 validation pattern.

### How does search work?
The backend uses a case-insensitive SQL `ILIKE` condition against company, role, and location.

## Frontend Q&A

### How does the UI avoid a request on every keystroke?
Search and status changes use a 250 ms debounce before refreshing the application list.

### How are edit and create handled?
The same form switches between create and edit mode. Editing loads an application's values into form state and sends a PATCH request on save.

### What happens after a mutation?
The dashboard refreshes the application list, analytics, and smart actions so the UI remains consistent with the backend.

### How are empty and error states handled?
The UI displays loading feedback, an empty-state message for no matching applications, and a visible error banner for failed requests.

## Smart actions

### Is the smart-action endpoint an LLM?
No. It is deterministic business logic. It checks status, follow-up dates, interview dates, and priority to recommend a next action.

### Why not call an LLM by default?
A paid API dependency would make the project harder to reproduce and could create unexpected usage costs. The current implementation stays free and deterministic. An optional provider can be added later with explicit user-controlled credentials.

### Give examples of smart actions.
A due follow-up produces a recommendation to send a follow-up message. An upcoming interview produces an interview-preparation recommendation. An applied application without a follow-up date is prompted to set one.

## Testing and debugging

### What does the backend test suite cover?
Health, registration, authenticated user lookup, CRUD, search, analytics, smart actions, user isolation, and status/priority validation.

### What CI checks exist?
GitHub Actions runs the backend pytest suite and the frontend production build on pushes to `main` and pull requests.

### What issue was found during CI setup?
The first backend run exposed a missing Python import path in CI. That was fixed by running pytest with `PYTHONPATH=.`. A later run exposed a bcrypt/passlib compatibility problem caused by the newest bcrypt package, so bcrypt was constrained below version 5 for the current passlib implementation.

### How would you debug a failing API request?
First inspect the browser network response and status code, then reproduce the request in `/docs` or a REST client, inspect backend logs/tracebacks, verify validation and authentication, and finally check the database query and ownership condition.

## Scalability questions

### What would you change for many applications?
Add pagination, stronger database indexes, server-side sorting, and possibly full-text search. Avoid returning the entire application table to the browser.

### What about analytics at scale?
Move more aggregate calculations into optimized SQL queries or materialized/summary structures when justified by measured workload.

### What about background notifications?
Use a background job/queue system for scheduled reminders rather than blocking API requests.

### What about multiple organizations?
Introduce organizations/workspaces and membership tables, then enforce organization-level authorization in addition to user-level ownership.

## Behavioral questions

### What was the main engineering challenge?
Keeping authentication, database ownership, frontend state, and new tracking fields consistent while evolving the schema. The solution was to keep validation in the backend, use a migration for existing databases, and refresh derived dashboard data after mutations.

### What did you learn?
I learned how the frontend, REST API, ORM, authentication layer, and relational database fit together as one system, and why migrations and automated tests matter as the project evolves.

### What would you improve next?
Add optional calendar/reminder integrations, export, pagination, and an opt-in LLM feature for resume/job matching or application coaching.

## Rapid revision

**Frontend:** React + TypeScript + Vite

**Backend:** Python + FastAPI + Pydantic

**ORM:** SQLAlchemy 2.x

**DB:** PostgreSQL

**Auth:** JWT + bcrypt

**Core entity:** `job_applications`

**Security boundary:** Bearer JWT + authenticated `user_id` filtering

**Search:** company + role + location via `ILIKE`

**Analytics:** total, active, interviews, offers, status counts

**Smart actions:** deterministic status/date/priority rules

**Tests:** pytest + FastAPI TestClient

**CI:** GitHub Actions backend tests + frontend build

**Deployment:** not claimed until a suitable free-tier production setup is verified
