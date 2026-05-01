-- Simple check for Nancy - only public tables

-- 1. Find Nancy in members table
SELECT 
  id,
  name,
  phone,
  user_id
FROM public.members
WHERE name ILIKE '%nancy%' OR name ILIKE '%mburu%';

-- 2. Check Nancy's role
SELECT 
  ur.user_id,
  ur.role
FROM public.user_roles ur
WHERE ur.user_id IN (
  SELECT user_id FROM public.members 
  WHERE name ILIKE '%nancy%' OR name ILIKE '%mburu%'
);
