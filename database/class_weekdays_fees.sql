ALTER TABLE the_shelf.classes
  ALTER COLUMN scheduled_date DROP NOT NULL,
  ALTER COLUMN scheduled_time DROP NOT NULL,
  ADD COLUMN schedule jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(schedule) = 'array'),
  ADD COLUMN monthly_fee text NOT NULL DEFAULT '',
  ADD COLUMN annual_fee text NOT NULL DEFAULT '';

-- Retain any existing day/time when moving from dated to weekly schedules.
UPDATE the_shelf.classes
SET schedule = jsonb_build_array(jsonb_build_object(
  'day', trim(to_char(scheduled_date,'Day')),
  'time', coalesce(to_char(scheduled_time,'HH24:MI'),'')
))
WHERE scheduled_date IS NOT NULL;
