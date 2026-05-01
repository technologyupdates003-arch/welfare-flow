-- SIMPLE CHAT FIX - Copy and paste this into Supabase SQL Editor

-- Step 1: See who's missing
SELECT m.user_id, au.email
FROM messages m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN members mem ON mem.user_id = m.user_id
WHERE mem.id IS NULL
GROUP BY m.user_id, au.email;

-- Step 2: For EACH user_id above, run this (replace USER_ID and NAME):
-- INSERT INTO members (user_id, name, phone, member_id, is_active, total_contributions, total_penalties)
-- VALUES ('USER_ID_HERE', 'ACTUAL_NAME', '0712345678', 'MEM0001', true, 0, 0);

-- Example for the user "nishaweka":
-- INSERT INTO members (user_id, name, phone, member_id, is_active, total_contributions, total_penalties)
-- VALUES ('their-user-id', 'Nishaweka', '0712345678', 'MEM0001', true, 0, 0);
