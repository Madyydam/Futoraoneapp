-- Ensure Realtime is enabled for messages table
-- Check current publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Add messages table to realtime publication if not already there
DO $$
BEGIN
    -- Try to add the table to the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table is already in the publication, do nothing
        NULL;
END $$;

-- Verify it was added
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
