-- SIMPLE ROLE RESTORATION
-- Run this first to restore admin access

-- Add roles for all three admin users
INSERT INTO user_roles (user_id, role) VALUES 
('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'admin'),
('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'super_admin'),
('d04abf92-cf98-480e-bb46-c9df417b7940', 'admin'),
('d04abf92-cf98-480e-bb46-c9df417b7940', 'super_admin'),
('51560aaf-743a-4527-9047-49ccddc76295', 'admin'),
('51560aaf-743a-4527-9047-49ccddc76295', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify roles were added
SELECT user_id, role FROM user_roles 
WHERE user_id IN ('811dcfa7-74ca-47a4-a491-82f512d8ff07', 'd04abf92-cf98-480e-bb46-c9df417b7940', '51560aaf-743a-4527-9047-49ccddc76295')
ORDER BY user_id, role;