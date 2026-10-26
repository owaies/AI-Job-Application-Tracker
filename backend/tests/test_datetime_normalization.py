from datetime import datetime, timedelta, timezone

from app.routes.applications import _as_utc


def test_naive_database_datetime_is_treated_as_utc():
    value = datetime(2026, 1, 15, 12, 30)

    assert _as_utc(value) == datetime(2026, 1, 15, 12, 30, tzinfo=timezone.utc)


def test_aware_datetime_is_converted_to_utc():
    value = datetime(2026, 1, 15, 12, 30, tzinfo=timezone(timedelta(hours=5, minutes=30)))

    assert _as_utc(value) == datetime(2026, 1, 15, 7, 0, tzinfo=timezone.utc)


def test_missing_datetime_stays_none():
    assert _as_utc(None) is None
