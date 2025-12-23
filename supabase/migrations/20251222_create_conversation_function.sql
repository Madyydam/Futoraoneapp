-- Function to create or get a conversation between two users
CREATE OR REPLACE FUNCTION create_or_get_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation between these two users
  SELECT cp1.conversation_id INTO conversation_id
  FROM conversation_participants cp1
  INNER JOIN conversation_participants cp2 
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user1_id 
    AND cp2.user_id = user2_id
    AND cp1.conversation_id NOT IN (
      SELECT conversation_id FROM messages WHERE group_id IS NOT NULL
    )
  LIMIT 1;

  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    -- Create new conversation
    INSERT INTO conversations (created_at, updated_at)
    VALUES (NOW(), NOW())
    RETURNING id INTO conversation_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id, created_at)
    VALUES 
      (conversation_id, user1_id, NOW()),
      (conversation_id, user2_id, NOW());
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
