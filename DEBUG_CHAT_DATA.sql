-- Debug existing chat data to understand the structure

-- Check conversations
SELECT 'CONVERSATIONS:' as info;
SELECT id, name, created_at, updated_at FROM conversations LIMIT 10;

-- Check messages
SELECT 'MESSAGES:' as info;
SELECT id, content, sender_id, conversation_id, created_at FROM messages LIMIT 10;

-- Check conversation participants
SELECT 'CONVERSATION PARTICIPANTS:' as info;
SELECT conversation_id, user_id FROM conversation_participants LIMIT 10;

-- Check which members have messages
SELECT 'MEMBERS WITH MESSAGES:' as info;
SELECT DISTINCT m.name, m.user_id, COUNT(msg.id) as message_count
FROM members m
JOIN messages msg ON m.user_id = msg.sender_id
GROUP BY m.name, m.user_id
ORDER BY message_count DESC
LIMIT 10;

-- Check which members are in conversations
SELECT 'MEMBERS IN CONVERSATIONS:' as info;
SELECT DISTINCT m.name, m.user_id, COUNT(cp.conversation_id) as conversation_count
FROM members m
JOIN conversation_participants cp ON m.user_id = cp.user_id
GROUP BY m.name, m.user_id
ORDER BY conversation_count DESC
LIMIT 10;