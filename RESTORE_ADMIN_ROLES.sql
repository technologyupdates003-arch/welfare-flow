-- Restore admin roles for the main admin users
-- This ensures they can access both admin and super_admin dashboards

-- First, let's check current roles
SELECT 
  ur.user_id,
  ur.role,
  u.email,
  m.name as member_name
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.user_id IN (
  '51560aaf-743a-4527-9047-49ccddc76295',
  '811dcfa7-74ca-47a4-a491-82f512d8ff07',
  'd04abf92-cf98-480e-bb46-c9df417b7940'
)
ORDER BY ur.user_id, ur.role;

-- Insert missing admin roles (ignore if already exists)
INSERT INTO user_roles (user_id, role) 
VALUES 
  ('51560aaf-743a-4527-9047-49ccddc76295', 'admin'),
  ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'admin'),
  ('d04abf92-cf98-480e-bb46-c9df417b7940', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert missing super_admin roles (ignore if already exists)
INSERT INTO user_roles (user_id, role) 
VALUES 
  ('51560aaf-743a-4527-9047-49ccddc76295', 'super_admin'),
  ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'super_admin'),
  ('d04abf92-cf98-480e-bb46-c9df417b7940', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the roles were added
SELECT 
  ur.user_id,
  ur.role,
  u.email,
  m.name as member_name
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.user_id IN (
  '51560aaf-743a-4527-9047-49ccddc76295',
  '811dcfa7-74ca-47a4-a491-82f512d8ff07',
  'd04abf92-cf98-480e-bb46-c9df417b7940'
)
ORDER BY ur.user_id, ur.role;