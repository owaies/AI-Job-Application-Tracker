# JobTrack / AI Job Application Tracker - Interview Cheat Sheet

## 1. 30-second explanation

I built JobTrack, a full-stack job application tracker using React and TypeScript on the frontend and FastAPI with SQLAlchemy on the backend. Users register and log in with JWT authentication and bcrypt password hashing, then create, edit, search, filter, prioritize, and delete applications. The dashboard combines pipeline analytics, follow-up and interview tracking, and deterministic smart next-action recommendations. The API enforces user-scoped access, and GitHub Actions verifies the backend tests and frontend production build.

## 2. 2-minute explanation

The problem was that a serious job search becomes fragmented across spreadsheets, notes, recruiter messages, interviews, and follow-up dates.

I designed JobTrack as a single command center. The frontend is React + TypeScript + Vite. It talks to a Python FastAPI REST API using JSON and Bearer JWT authentication. Passwords are never stored as plaintext; they are hashed with bcrypt.

The core data model has two main tables: `users` and `job_applications`. An application stores company, role, location, status, priority, salary, application date, follow-up date, interview date, next action, notes, and timestamps. Every application record carries a `user_id`, and the backend uses the authenticated user's ID in application queries. That makes ownership a server-side rule rather than a UI convention.

The API supports authentication, application CRUD, search, status filtering, analytics, and smart actions. Search uses case-insensitive `ILIKE` over company, role, and location. Analytics calculates total, active, interview, offer, and per-status counts. Smart actions are deterministic rules using status, dates, and priority, not an external LLM.

One of the most important production bugs was authentication persistence on refresh. The JWT remained in `localStorage`, but React initially rendered the login branch while `/api/auth/me` was still restoring the user. I fixed that by adding an explicit authentication initialization state and only clearing the token for a confirmed 401. The user then confirmed the fixed session persistence on a real Android device.

The application is deployed through Vercel with PostgreSQL hosted on Supabase.

---

# 3. Architecture explanation

```text
User
  ↓
React + TypeScript + Vite
  ↓ REST / JSON + Bearer JWT
FastAPI
  ├─ Authentication
  ├─ Validation
  ├─ Application CRUD
  ├─ Analytics
  └─ Smart-action rules
  ↓ SQLAlchemy
PostgreSQL / Supabase
```

**Key interview sentence:** “The frontend handles presentation and interaction, while the FastAPI layer is the security and business-logic boundary.”

---

# 4. Frontend questions

### Q1. Why React?
React lets the UI be split into reusable components and makes state-driven rendering natural for dashboards, forms, filters, modals, and application cards.

### Q2. Why TypeScript?
TypeScript catches invalid assumptions about API data and component props before runtime. It was particularly useful for strongly typing custom controls such as the select component.

### Q3. Why Vite?
Vite provides a fast development server and a simple production build for a React application.

### Q4. How does routing work?
JobTrack uses browser history and a lightweight path-state hook for the application pages. Vercel is configured to serve the SPA shell for the application routes, including application-detail paths.

### Q5. How do create and edit share code?
The same application form receives initial values and an optional editing ID. Create sends POST; edit sends PATCH.

### Q6. How are loading and errors handled?
The UI has loading states, empty states, visible error messaging, toasts, and a destructive-action confirmation modal.

### Q7. How is search handled?
The frontend waits briefly after search/filter changes before refreshing the list, reducing unnecessary requests. The backend performs the actual search.

### Q8. How does the UI stay consistent after mutations?
After a create, edit, or delete operation, the application data and derived analytics/smart-action state are refreshed.

---

# 5. React questions

### Q9. Why use state for authentication?
Authentication state controls whether protected application content or the auth interface should render.

### Q10. What caused the refresh bug?
`token` was restored synchronously from localStorage, but `user` started as `null`. The UI treated `!user` as logged out before the asynchronous `/api/auth/me` request completed.

### Q11. How was it fixed?
An explicit `authInitializing` state now gates the auth decision. The UI waits for the bootstrap request to resolve before rendering the login branch.

### Q12. Why not use a fixed timeout?
A timeout does not prove that authentication restoration finished. It creates a race and makes behavior depend on network speed.

---

# 6. TypeScript questions

### Q13. What is a union type used for?
Page names, toast kinds, and similar bounded values use union types so only supported strings can be passed.

### Q14. Why type the CustomSelect props?
The component requires a string value and a callback accepting a string. Strong typing prevents accidentally passing a setter function as the displayed value.

### Q15. What is the benefit of interfaces/types around API objects?
They make the frontend contract explicit and reduce accidental property-name or value-type mismatches.

---

# 7. FastAPI questions

### Q16. Why FastAPI?
FastAPI provides request validation through Pydantic, dependency injection, OpenAPI documentation, and a small Python REST architecture.

### Q17. How are dependencies used?
Authentication and database sessions are injected into route functions. That keeps route code focused on the actual operation.

### Q18. How are invalid application values rejected?
The backend validates status against the supported pipeline set and priority against low/medium/high. Invalid values return HTTP 422.

### Q19. What does `/api/auth/me` do?
It validates the Bearer JWT, extracts the user ID, loads the user, and returns the authenticated user record.

---

# 8. REST API questions

### Q20. Why REST?
The frontend and backend have a clean HTTP/JSON boundary that is easy to inspect, test, document, and deploy.

### Q21. Why PATCH for edits?
PATCH represents partial updates. The client can send only the fields that changed.

### Q22. What does 401 mean in this project?
The request is not authenticated, for example because the Bearer token is missing, invalid, expired, or belongs to a user that no longer exists.

### Q23. What does 404 mean for another user's application?
The backend intentionally looks up the application using both its ID and the authenticated user's ID. If it is not owned by that user, it behaves as not found.

---

# 9. PostgreSQL questions

### Q24. Why PostgreSQL?
The data is relational and benefits from structured columns, indexing, and reliable transactions.

### Q25. What are the main tables?
`users` and `job_applications`.

### Q26. Why index `user_id`?
Most application queries are scoped by authenticated user, so indexing that column supports the primary access pattern.

### Q27. Why use a migration?
`create_all()` can create missing tables but does not safely evolve an existing table. The explicit migration updates an existing PostgreSQL schema.

### Q28. Is `user_id` a database foreign-key constraint?
The current SQLAlchemy model stores `user_id` as an indexed owner identifier. The application enforces ownership in the API query layer.

---

# 10. Supabase questions

### Q29. What does Supabase provide here?
Supabase is used for managed PostgreSQL infrastructure.

### Q30. Is Supabase Auth used?
No. Authentication is implemented in the FastAPI backend with JWT and bcrypt.

### Q31. Is Supabase RLS the security boundary?
No. The current security boundary is the FastAPI backend, which authenticates the JWT and scopes application queries to the authenticated user ID.

---

# 11. JWT questions

### Q32. What is inside the JWT?
The current implementation puts the user ID in `sub` and includes an `exp` expiration claim.

### Q33. What algorithm is used?
HS256, configured through backend settings.

### Q34. How long does the default token live?
The backend default is 60 minutes, configurable through `access_token_expire_minutes`.

### Q35. What happens when a token expires?
JWT decoding fails and the API returns HTTP 401. The frontend treats a confirmed 401 as an authentication failure.

### Q36. Why use Bearer authentication?
It provides a standard HTTP mechanism for sending the access token with protected API requests.

---

# 12. bcrypt questions

### Q37. Why bcrypt?
bcrypt is designed for password hashing and is intentionally computationally expensive, making brute-force attacks harder than with fast general-purpose hashes.

### Q38. Do you store passwords?
No plaintext passwords are stored. The database stores `password_hash`.

---

# 13. Authentication and authorization

### Q39. Authentication vs authorization?
Authentication answers “Who are you?” Authorization answers “What are you allowed to access?” JobTrack uses JWT authentication and user-ID ownership checks for authorization.

### Q40. Where is authorization enforced?
In backend application queries such as fetching an application by both application ID and authenticated user ID.

### Q41. What was the production auth bug?
The saved token existed, but the UI rendered before user restoration finished.

### Q42. What was the exact fix?
Add explicit auth initialization, wait for `/api/auth/me`, preserve the token for non-401 bootstrap failures, and only clear it for confirmed 401 responses.

---

# 14. Vercel questions

### Q43. What is deployed?
The React frontend and FastAPI backend are served through the same Vercel project using the repository's routing configuration.

### Q44. What is the verified production URL?
`https://ai-job-application-tracker-rose.vercel.app`

### Q45. How are SPA deep links handled?
Vercel routing sends application paths, including `/applications/...`, to the SPA shell so browser refreshes can load the React application.

### Q46. Why keep the API same-origin?
It simplifies browser requests and reduces cross-origin configuration compared with separate frontend and API domains.

---

# 15. CORS questions

### Q47. What is CORS?
Cross-Origin Resource Sharing controls which browser origins are allowed to make cross-origin requests.

### Q48. How is CORS configured?
The backend reads allowed origins from environment-backed settings.

### Q49. Is CORS authentication?
No. CORS is a browser access-control mechanism. JWT verification and authorization happen at the API.

---

# 16. Responsive design questions

### Q50. How does the UI adapt to mobile?
The frontend contains responsive layout rules, a mobile navigation state, stacked content patterns, and mobile-safe controls.

### Q51. Was mobile behavior actually verified?
Yes. The user confirmed the authentication workflow works on a real Android device, and the supplied project evidence includes portrait production UI captures.

### Q52. What is important about touch controls?
Interactive controls need adequate spacing, clear states, and behavior that does not depend on hover.

---

# 17. Smart actions and analytics

### Q53. Is JobTrack actually calling an LLM?
No. Smart actions are deterministic business logic.

### Q54. How does smart-action logic decide what to recommend?
It checks interview dates, follow-up dates, status, and priority. For example, an upcoming interview triggers interview-preparation guidance, while a due follow-up triggers a follow-up recommendation.

### Q55. Why deterministic rules?
They are predictable, free to run, easy to test, and reproducible without a paid external AI provider.

### Q56. What does analytics return?
Total applications, active applications, interview count, offer count, and counts grouped by status.

---

# 18. 20+ project-specific technical Q&A

### Q57. Why does every application carry `user_id`?
It establishes ownership and lets the API enforce user-level isolation.

### Q58. Why validate status twice?
The frontend constrains choices for UX, while the backend validates again because clients cannot be trusted.

### Q59. Why use `ILIKE` for search?
It provides case-insensitive matching across company, role, and location.

### Q60. How do you prevent cross-user reads?
Every protected application query uses the authenticated user's ID. Single-record access combines application ID and user ID.

### Q61. How do you prevent cross-user updates?
The update route first resolves the application through `_get_application(application_id, current_user.id, db)`. A record owned by another user therefore cannot be updated.

### Q62. How do you prevent cross-user deletes?
Delete uses the same ownership-aware lookup before removing the row.

### Q63. Why return 404 for another user's record?
It avoids exposing whether a specific application ID exists for another account.

### Q64. Why is `smart-actions` user-scoped?
Recommendations must be based only on the current user's applications.

### Q65. Why skip rejected, withdrawn, and offered applications in smart actions?
Those states no longer need the same active next-action workflow.

### Q66. How are overdue follow-ups recognized?
The smart-action service compares stored follow-up dates with the current UTC time.

### Q67. How are interview recommendations prioritized?
An upcoming interview takes precedence over a due follow-up, followed by stage-specific recommendations.

### Q68. Why is priority used?
It helps sort recommendations so higher-priority applications receive attention first.

### Q69. Why use a custom select?
The project has a strong branded visual language and needed a consistent interaction pattern across status and priority fields.

### Q70. What regression was found with the custom select?
A filter value was accidentally wired to a setter function instead of the current string value. Strong prop typing and a regression contract were added to prevent that class of error.

### Q71. What did the date picker fix teach you?
Browser-native controls are not always visually consistent with a highly branded UI. A custom date/time control gives the application predictable presentation and interaction.

### Q72. Why use confirmation before delete?
Delete is destructive and irreversible, so the UI explicitly asks for confirmation.

### Q73. Why use toast messages?
They provide lightweight feedback after successful or failed actions without forcing navigation.

### Q74. What does the profile screen communicate?
It surfaces the authenticated user, JWT/Bearer authentication mode, user-isolated data scope, and PostgreSQL backing store.

### Q75. Why have an error boundary?
Unexpected frontend render errors should fail visibly and recoverably rather than leaving a blank page.

### Q76. Why keep environment variables out of Git?
Credentials and secrets should never be committed to a public repository.

---

# 19. Production debugging

## Challenge: authentication persistence

**Observed:** Login worked, but refresh returned the user to the login page.

**Investigation:**
1. Confirmed `job-tracker-token` persisted.
2. Checked auth bootstrap and protected-route rendering.
3. Checked `/api/auth/me`.
4. Confirmed JWT expiration was not the cause.
5. Found that `user` started as `null` while the async bootstrap request was still running.
6. The login branch rendered too early.

**Fix:** explicit authentication initialization + `/api/auth/me` restoration + 401-only token clearing.

**Result:** user confirmed the fixed workflow on a real Android device.

## Challenge: application detail refresh

A direct application-detail route needed SPA handling on Vercel. The production routing configuration was updated so `/applications/(.*)` serves the React shell.

---

# 20. Testing

The automated backend suite covers:

- health
- registration
- authenticated `/me`
- application create
- application read
- application update
- application delete
- search
- analytics
- smart actions
- user isolation
- status validation
- priority validation

GitHub Actions currently reports:

- Backend Tests: **PASS**
- Frontend Build: **PASS**
- Authentication bootstrap regression test: **PASS**

Production verification:

- `/api/health` → HTTP 200
- unauthenticated `/api/applications` → HTTP 401
- `/applications/1` → HTTP 200 SPA shell
- Vercel runtime error/fatal log check → no entries in the checked window

---

# 21. Scalability questions

### Q77. What would you do for 100,000 applications?
Add pagination, server-side sorting/filtering, optimized indexes, and avoid loading the entire table into the browser.

### Q78. How would you scale analytics?
Move more aggregation into SQL and introduce summary/materialized structures only if measured workload justifies them.

### Q79. How would you implement reminders?
Use scheduled background jobs or a queue so reminder delivery does not block API requests.

### Q80. How would you support teams?
Add organizations/workspaces, memberships, roles, and organization-aware authorization.

### Q81. How would you add AI safely?
Make AI an optional provider integration with explicit user-supplied credentials, rate limits, validation, logging, and clear cost controls.

---

# 22. Challenges and solutions

| Challenge | Solution |
|---|---|
| Refresh logged users out | Explicit auth bootstrap state and `/api/auth/me` restoration |
| Non-auth bootstrap errors | Preserve token and surface a recoverable session-restore error |
| Invalid status/priority | Server-side allow-list validation |
| Cross-user access | User-scoped queries using authenticated `user_id` |
| Custom select regression | Strong prop typing and regression contract |
| Direct SPA detail route | Vercel route for `/applications/(.*)` |
| Existing DB schema evolution | Explicit PostgreSQL migration |
| Reproducible smart actions | Deterministic business rules instead of paid LLM calls |

---

# 23. HR / behavioral questions

### Why did you build this project?
I wanted to solve a real workflow problem and use it to learn how frontend state, REST APIs, authentication, relational data, testing, and deployment work together.

### What are you most proud of?
The production debugging process. The refresh issue looked like a token problem at first, but tracing the state lifecycle showed it was an authentication-bootstrap race.

### What was difficult?
Keeping the system consistent while adding tracking fields, analytics, smart actions, and authentication fixes without weakening the security boundary.

### What would you change with more time?
Add reminders/calendar integration, pagination, export, and an optional AI-assisted job/resume matching workflow.

### What did you learn?
I learned that production engineering is not just writing features. It is verifying assumptions across browser state, APIs, database ownership, CI, and deployment.

### How did you handle a bug you could not immediately explain?
I reduced it to observable facts, inspected the token lifecycle and API behavior, reproduced the state transition, then changed the smallest part of the system that explained the root cause.

---

# 24. One-page rapid revision

**PRODUCT:** JobTrack / AI Job Application Tracker

**PROBLEM:** Job-search information becomes scattered and follow-ups get missed.

**FRONTEND:** React + TypeScript + Vite

**BACKEND:** Python + FastAPI + Pydantic

**ORM:** SQLAlchemy 2.x

**DATABASE:** PostgreSQL on Supabase

**AUTH:** JWT + bcrypt

**TOKEN:** `job-tracker-token`

**JWT CLAIMS:** `sub`, `exp`

**DEFAULT EXPIRY:** 60 minutes

**SECURITY BOUNDARY:** FastAPI

**AUTHORIZATION:** authenticated `user_id` filtering

**CORE TABLES:** `users`, `job_applications`

**CRUD:** GET / POST / PATCH / DELETE

**SEARCH:** company + role + location using `ILIKE`

**STATUSES:** saved, applied, screening, interview, offer, rejected, withdrawn

**PRIORITIES:** low, medium, high

**ANALYTICS:** total, active, interviews, offers, status counts

**SMART ACTIONS:** deterministic status/date/priority rules

**TESTING:** pytest + FastAPI TestClient

**CI:** GitHub Actions

**DEPLOYMENT:** Vercel + Supabase PostgreSQL

**LIVE:** https://ai-job-application-tracker-rose.vercel.app

**KEY BUG:** refresh rendered login before async auth restoration completed

**FIX:** explicit `authInitializing` state + `/api/auth/me`

**MOBILE ACCEPTANCE:** user-confirmed real Android workflow

**LATEST COMMIT:** `5d85c84600e2f58b99a2a5c1d92abfd86bca58f5`

**PRESENTATION:** `JobTrack_Final_Presentation.pptx`
