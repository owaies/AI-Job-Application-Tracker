-- Run once against an existing PostgreSQL database before using the new tracking fields.
-- Fresh databases created from SQLAlchemy models already contain these columns.

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(120);

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'medium';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS next_action VARCHAR(500);

CREATE INDEX IF NOT EXISTS ix_job_applications_priority ON job_applications(priority);

ALTER TABLE job_applications
    ADD CONSTRAINT job_applications_priority_check
    CHECK (priority IN ('low', 'medium', 'high'));
