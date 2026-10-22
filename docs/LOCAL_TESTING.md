# JobTrack Local Testing

## Backend

Use the backend virtual environment and run the existing test suite before shipping route or schema changes. The repository contains API tests under `backend/tests/`.

From the repository root:

```bash
cd backend
pytest
```

The API tests use an isolated in-memory SQLite database and override the application's database dependency. They should not require a production database.

## Frontend

The frontend has a browser-oriented test surface under `frontend/tests/` and a production build workflow in GitHub Actions. Run the frontend tests using the package script defined in `frontend/package.json`, then run the production build before shipping UI or routing changes.

## Manual smoke path

1. Register a new account.
2. Sign in.
3. Create an application.
4. Edit and search the application.
5. Change its tracking status.
6. Confirm another user cannot access the first user's application.
7. Refresh the browser and confirm the authenticated state behaves as expected.
8. Call a protected endpoint without an Authorization header and confirm it returns `401`.
9. Call a protected endpoint with an expired or malformed bearer token and confirm it returns `401`, without exposing token details in the response.

Record failures as code or test changes rather than marking a workflow complete without verification.
