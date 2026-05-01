-- Check if Nancy has secretary role
SELECT 
  ur.user_id,
  ur.role,
  m.name
FROM user_roles ur
LEFT JOIN members m ON ur.user_id = m.user_id
WHERE ur.user_id = 'd34e2b54-8b1b-4fad-ad3a-7ef651c1ce6b';
