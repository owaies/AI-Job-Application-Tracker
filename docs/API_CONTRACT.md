# JobTrack API Contract

The backend is a FastAPI service organized around authentication and application-management routes.

## Authentication

Registration and login establish the authenticated user context. Protected application operations must use the configured JWT signing secret and keep application data scoped to the authenticated user.

## Application operations

The application route supports the job-search workflow around creating, reading, updating, deleting, searching, and tracking applications. Company and role values are trimmed and must remain non-empty. Updates must not set the required company, role, or application date fields to `null`; omit fields that should remain unchanged. List ordering uses a deterministic created-at and identifier tie-breaker so repeated requests produce stable ordering when timestamps match.

## Change checklist

When adding an application field, update the Pydantic schema, persistence model, route behavior, frontend type, and relevant tests together. Keep user-owned records scoped by user identity at the query boundary.
