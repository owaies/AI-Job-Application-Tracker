# JobTrack Local Testing

## Backend

Use the backend virtual environment and run the existing test suite before shipping route or schema changes. The repository contains API tests under backend/tests/.

## Frontend

The frontend has a browser-oriented test surface under frontend/tests/ and a production build workflow in GitHub Actions.

## Manual smoke path

1. Register a new account.
2. Sign in.
3. Create an application.
4. Edit and search the application.
5. Change its tracking status.
6. Confirm another user cannot access the first user's application.
7. Refresh the browser and confirm the authenticated state behaves as expected.

Record failures as code or test changes rather than marking a workflow complete without verification.
