# Release Verification Checklist

Use this checklist before promoting a JobTrack release. It complements automated backend tests and the frontend production build; it is not a substitute for either.

## Automated checks

- [ ] Run the backend test suite using the repository's documented project command.
- [ ] Install frontend dependencies from the lockfile and run the production build.
- [ ] Confirm CI checks are green for the exact commit intended for release.
- [ ] Review dependency and migration changes; confirm the deployment has a tested rollback path.

## Authentication and tenant isolation

- [ ] Registration and login handle valid, invalid, and missing fields with controlled responses.
- [ ] Protected API routes reject absent, malformed, expired, and incorrectly signed tokens.
- [ ] A user can only read, update, or delete their own application records.
- [ ] Changing an application ID in a request cannot access another user's record.
- [ ] Logs and error responses do not disclose passwords, bearer tokens, database URLs, or raw internal exceptions.

## Application lifecycle and dates

- [ ] Create, edit, search, filter, and delete application records.
- [ ] Verify each supported status transition and dashboard count.
- [ ] Test empty search results and search strings containing punctuation or wildcard characters.
- [ ] Check follow-up and interview dates around today, month boundaries, and timezone changes.
- [ ] Confirm invalid dates and unsupported status/priority values are rejected clearly.

## Browser, API, and deployment

- [ ] Test the production frontend against the configured API origin, not only localhost.
- [ ] Verify CORS with the intended deployed origin and an unrelated origin.
- [ ] Confirm the frontend receives no server-only secrets through build-time public variables.
- [ ] Check loading, empty, validation, network-failure, and expired-session states.
- [ ] Verify database migrations and required environment variables are documented for the target environment.

## Release record

Record the tested commit, CI run, migration status, target environment, and any deferred checks in the release notes or pull request. Use a staging database with synthetic data for destructive or cross-user authorization tests.
