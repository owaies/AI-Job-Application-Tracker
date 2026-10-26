# Smart actions regression plan

The current smart-action engine is deterministic business logic based on application status, priority, and dates.

## Scenarios
Cover each pipeline status, every priority level, missing follow-up dates, approaching interview dates, and expired follow-up dates.

## Consistency
The same application state should always produce the same recommendation.

## User scope
Recommendations must use only the authenticated user's application records.

## Regression
When a rule changes, record representative inputs and expected next actions so the behavior can be compared across releases.

## Datetime normalization regression
- Verify naive database datetimes are interpreted as UTC.
- Verify timezone-aware values are converted to UTC before comparing follow-up and interview dates.
- Verify missing dates remain unset and do not create recommendations by themselves.

