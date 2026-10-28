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


## Password byte limits

The API uses bcrypt through Passlib, whose password input limit is 72 UTF-8 bytes. Validate this at the request-schema boundary for both registration and login so multibyte passwords cannot pass character-count validation and then fail during hashing or verification.

Regression coverage: `pytest backend/tests/test_auth_password_limits.py` checks the 72-byte boundary with ASCII and multibyte UTF-8 input.
