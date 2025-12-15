-- Add pinned and archived columns to conversation_participants
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add index for performance on fetching
CREATE INDEX IF NOT EXISTS conversation_participants_user_id_pinned_archived_idx 
ON conversation_participants (user_id, is_pinned DESC, is_archived ASC);
