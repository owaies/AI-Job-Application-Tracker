## Application search QA checklist

Search behavior should normalize user input consistently and keep results scoped to the authenticated user's applications.

Regression cases:

- leading and trailing whitespace;
- repeated internal whitespace;
- exact title/company terms;
- partial terms;
- no matches;
- equal timestamps or relevance values requiring deterministic ordering;
- attempts to access another user's application data through search parameters.

Treat search as a user-facing filter rather than a database expression.