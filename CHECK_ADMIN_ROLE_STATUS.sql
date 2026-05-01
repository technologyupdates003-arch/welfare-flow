-- Check admin role status
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.created_at,
  ur.removed_at,
  m.name,
  m.phone
FROM user_roles ur
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.created_at DESC;

-- Check if there are any inactive admin roles
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.removed_at,
  m.name
FROM user_roles ur
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.role IN ('admin', 'super_admin')
AND ur.is_active = false;

-- Check your specific user ID (replace with your actual user ID)
-- SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
