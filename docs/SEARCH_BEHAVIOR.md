# Application Search Behavior

Search input should be treated as a user-facing filter, not as a database expression.

Expected behavior:

- Trim leading and trailing whitespace.
- Treat repeated whitespace consistently.
- Match supported application fields using the same normalization rules as the API.
- Return deterministic ordering for equal relevance/timestamps.
- Return an empty result set rather than an error when no applications match.

When changing search behavior, cover both exact and partial terms and verify that one user's records never appear in another user's results.
