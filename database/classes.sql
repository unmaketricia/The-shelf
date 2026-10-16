-- Additive schema change; existing resources and supplies are untouched.
CREATE TABLE the_shelf.classes (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  subject text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time without time zone NOT NULL,
  added text NOT NULL
);
CREATE INDEX classes_schedule_idx ON the_shelf.classes (scheduled_date,scheduled_time);
ALTER TABLE the_shelf.classes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE the_shelf.classes FROM PUBLIC, anon, authenticated;
