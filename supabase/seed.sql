-- Seed sample Sheffield events
INSERT INTO events (title, description, category, venue, image_url, recurrence_type, day_of_week, event_time) VALUES
(
  'Code Fridays @ Foundry',
  'Sheffield''s biggest weekly student night. Cheap drinks, great music, and a legendary atmosphere at The Foundry.',
  'club',
  'The Foundry, Sheffield',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
  'weekly',
  5,
  '22:00'
),
(
  'Pop Tarts @ Leadmill',
  'Sheffield''s most beloved indie and pop club night. The Leadmill is a Sheffield institution.',
  'club',
  'The Leadmill, Sheffield',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'weekly',
  6,
  '22:00'
),
(
  'Tuesday Club @ Corp',
  'The legendary Corp Tuesday night. Student favourite every week.',
  'club',
  'Corporation, Sheffield',
  'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800',
  'weekly',
  2,
  '22:00'
);

INSERT INTO events (title, description, category, venue, image_url, recurrence_type, event_date) VALUES
(
  'Sheffield United vs Leeds United',
  'The Steel City derby plus cross-Pennine rivalry. Bramall Lane electric atmosphere guaranteed.',
  'sports',
  'Bramall Lane, Sheffield',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
  'one_off',
  (CURRENT_DATE + INTERVAL '14 days')::DATE
),
(
  'Doncaster Races',
  'A classic day at the races. Enjoy live horse racing at one of England''s best racecourses.',
  'racing',
  'Doncaster Racecourse, Doncaster',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'one_off',
  (CURRENT_DATE + INTERVAL '21 days')::DATE
),
(
  'Engineering Society Ball',
  'The annual Engineering Society black tie ball. Food, drinks, dancing and awards.',
  'other',
  'Cutlers'' Hall, Sheffield',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
  'one_off',
  (CURRENT_DATE + INTERVAL '30 days')::DATE
);

-- Create event occurrences for one-off events
INSERT INTO event_occurrences (event_id, date, status)
SELECT id, event_date, 'upcoming'
FROM events
WHERE recurrence_type = 'one_off';

-- Create upcoming occurrences for weekly events
-- Code Fridays (day_of_week = 5)
INSERT INTO event_occurrences (event_id, date, status)
SELECT
  id,
  (CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 + 
    CASE WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0 THEN 7 ELSE 0 END
  ) * INTERVAL '1 day')::DATE,
  'upcoming'
FROM events WHERE title = 'Code Fridays @ Foundry';

-- Pop Tarts (day_of_week = 6)
INSERT INTO event_occurrences (event_id, date, status)
SELECT
  id,
  (CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 + 
    CASE WHEN (6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0 THEN 7 ELSE 0 END
  ) * INTERVAL '1 day')::DATE,
  'upcoming'
FROM events WHERE title = 'Pop Tarts @ Leadmill';

-- Tuesday Club (day_of_week = 2)
INSERT INTO event_occurrences (event_id, date, status)
SELECT
  id,
  (CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 + 
    CASE WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0 THEN 7 ELSE 0 END
  ) * INTERVAL '1 day')::DATE,
  'upcoming'
FROM events WHERE title = 'Tuesday Club @ Corp';
