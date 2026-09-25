# Application tracking data flow

The tracker should treat each job application as the source record for dashboard and analytics views.

## Change guidance

- Keep status values consistent across forms, filters, and summaries.
- Preserve the application identifier when editing a record.
- Recalculate derived dashboard values from persisted records rather than duplicated client state.
- Keep user-scoped queries explicit so one user's applications cannot appear in another user's workspace.
