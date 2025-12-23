-- Add is_read column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Set is_read based on existing read_at values
UPDATE messages 
SET is_read = true 
WHERE read_at IS NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_is_read 
ON messages(conversation_id, is_read);
