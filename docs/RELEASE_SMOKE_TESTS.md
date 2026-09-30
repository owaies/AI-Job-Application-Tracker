# JobTrack Release Smoke Tests

## Authentication
- Register a new test account.
- Sign in and refresh the browser.
- Confirm unauthenticated requests cannot read another user's applications.
- Sign out and verify protected screens return to the authenticated entry point.

## Application lifecycle
- Create an application with the minimum valid fields.
- Edit its status and notes.
- Search using partial company/title terms.
- Confirm list ordering is deterministic when records share the same timestamp.
- Delete the test application and verify it disappears from the list.

## API errors
Verify validation failures return a predictable HTTP status and a user-safe message without exposing database or token internals.
