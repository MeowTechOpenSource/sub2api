ALTER TABLE groups
    ADD COLUMN IF NOT EXISTS happy_hour_events JSONB NOT NULL DEFAULT '[]'::jsonb;
