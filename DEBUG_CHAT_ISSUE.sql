-- DEBUG: Why chat doesn't show member names

-- 1. Check: Do members exist?
SELECT COUNT(*) as total_members, COUNT(name) as members_with_names
FROM members;

-- 2. Check: Do messages have user_id?
SELECT COUNT(*) as total_messages, COUNT(DISTINCT user_id) as unique_users
FROM messages;

-- 3. Check: Are user_ids matching between messages and members?
SELECT 
    m.user_id as message_user_id,
    mem.user_id as member_user_id,
    mem.name as member_name,
    au.email,
    CASE 
        WHEN mem.user_id IS NULL THEN '❌ NO MATCH'
        WHEN mem.name IS NULL THEN '❌ NO NAME'
        ELSE '✅ MATCHED'
    END as status
FROM messages m
LEFT JOIN members mem ON mem.user_id = m.user_id
LEFT JOIN auth.users au ON au.id = m.user_id
GROUP BY m.user_id, mem.user_id, mem.name, au.email
ORDER BY status;

-- 4. Check: Sample of members table
SELECT user_id, name, phone, member_id 
FROM members 
LIMIT 10;
