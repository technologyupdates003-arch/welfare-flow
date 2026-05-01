-- Check if message user_ids match member user_ids

SELECT 
    m.id as message_id,
    m.user_id as message_user_id,
    m.content,
    mem.name as member_name,
    mem.phone as member_phone,
    CASE 
        WHEN mem.name IS NOT NULL THEN '✅ HAS NAME'
        ELSE '❌ NO NAME FOUND'
    END as status
FROM messages m
LEFT JOIN members mem ON mem.user_id = m.user_id
ORDER BY m.created_at DESC
LIMIT 20;
