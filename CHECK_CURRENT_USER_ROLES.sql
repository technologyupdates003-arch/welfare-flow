-- Check current user roles and status
-- Replace with your actual user ID

-- Check user roles for the main admin users
SELECT 
  ur.user_id,
  ur.role,
  u.email,
  m.name as member_name,
  m.phone
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.user_id IN (
  '51560aaf-743a-4527-9047-49ccddc76295',
  '811dcfa7-74ca-47a4-a491-82f512d8ff07',
  'd04abf92-cf98-480e-bb46-c9df417b7940'
)
ORDER BY ur.user_id, ur.role;

-- Check if there are any issues with the user_roles table
SELECT COUNT(*) as total_roles FROM user_roles;

-- Check the enum values
SELECT unnest(enum_range(NULL::app_role)) as available_roles;