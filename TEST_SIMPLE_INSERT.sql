-- Simple test insert
INSERT INTO public.meeting_minutes (
  created_by,
  title,
  meeting_date,
  meeting_type,
  status,
  attendees,
  chairperson_name,
  secretary_name
) VALUES (
  'd34e2b54-8b1b-4fad-ad3a-7ef651c1ce6b',
  'Test Meeting',
  '2026-04-27',
  'general',
  'draft',
  ARRAY['John Doe'],
  'JOSEPH M. GITHINJI',
  'CAROLINE WACHIRA'
);

-- Check if it worked
SELECT id, title, chairperson_name, secretary_name FROM public.meeting_minutes 
WHERE title = 'Test Meeting' LIMIT 1;
