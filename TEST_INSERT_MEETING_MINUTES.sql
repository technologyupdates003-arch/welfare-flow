-- Test insert to see what the actual error is
-- Replace the user_id with Nancy's actual user ID

INSERT INTO public.meeting_minutes (
  created_by,
  title,
  meeting_date,
  meeting_type,
  status,
  attendees,
  chairperson_name,
  chairperson_signature_url,
  secretary_name,
  secretary_signature_url,
  absent_with_apology,
  absent_without_apology,
  visible_to_members
) VALUES (
  'd34e2b54-8b1b-4fad-ad3a-7ef651c1ce6b',  -- Nancy's user ID
  'Test Meeting',
  '2026-04-27',
  'general',
  'draft',
  ARRAY['John Doe', 'Jane Smith'],
  'JOSEPH M. GITHINJI',
  NULL,
  'CAROLINE WACHIRA',
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[]
);

-- If successful, check the inserted record
SELECT id, title, chairperson_name, secretary_name, created_at 
FROM public.meeting_minutes 
WHERE created_by = 'd34e2b54-8b1b-4fad-ad3a-7ef651c1ce6b'
ORDER BY created_at DESC 
LIMIT 1;
