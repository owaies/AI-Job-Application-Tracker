# JobTrack security review

JobTrack contains authentication, user-scoped application data, and PostgreSQL persistence.

## Authentication
Verify JWT validation and password hashing remain server-side. Never expose signing secrets to the browser.

## Data isolation
Every application query and mutation should remain scoped to the authenticated user.

## Dates and follow-ups
Treat dates received from the client as untrusted input and validate them before persistence or recommendation logic.

## Release checks
Test unauthorized requests, cross-user record access, invalid identifiers, and failed database operations before production releases.
