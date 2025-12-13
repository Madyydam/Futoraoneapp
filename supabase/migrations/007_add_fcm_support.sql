-- Migration to add FCM support and automatic notification triggers

-- 1. Add FCM token column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- 2. Create index on fcm_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);

-- 3. Create function to send notification when new message is inserted
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  receiver_id UUID;
  sender_name TEXT;
  sender_username TEXT;
BEGIN
  -- Get the receiver ID (the user who should receive the notification)
  SELECT user_id INTO receiver_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  -- If no receiver found, skip notification
  IF receiver_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get sender's name for notification
  SELECT full_name, username INTO sender_name, sender_username
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Insert notification record
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    receiver_id,
    'message',
    'New message from ' || COALESCE(sender_name, sender_username),
    NEW.content,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'message_id', NEW.id
    ),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 4. Create trigger on messages table
DROP TRIGGER IF EXISTS trigger_notify_on_new_message ON messages;
CREATE TRIGGER trigger_notify_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_message();

-- 5. Create function to send notification when someone follows you
CREATE OR REPLACE FUNCTION notify_on_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  follower_name TEXT;
  follower_username TEXT;
BEGIN
  -- Get follower's name for notification
  SELECT full_name, username INTO follower_name, follower_username
  FROM profiles
  WHERE id = NEW.follower_id;

  -- Insert notification record
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    COALESCE(follower_name, follower_username) || ' started following you',
    jsonb_build_object(
      'follower_id', NEW.follower_id
    ),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 6. Create trigger on follows table
DROP TRIGGER IF EXISTS trigger_notify_on_new_follow ON follows;
CREATE TRIGGER trigger_notify_on_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_follow();

-- 7. Create function to send notification on new like
CREATE OR REPLACE FUNCTION notify_on_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  liker_name TEXT;
  liker_username TEXT;
  post_owner_id UUID;
  post_title TEXT;
BEGIN
  -- Get post owner
  SELECT user_id, title INTO post_owner_id, post_title
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker's name for notification
  SELECT full_name, username INTO liker_name, liker_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- Insert notification record
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    post_owner_id,
    'like',
    'New Like',
    COALESCE(liker_name, liker_username) || ' liked your post',
    jsonb_build_object(
      'post_id', NEW.post_id,
      'liker_id', NEW.user_id
    ),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 8. Create trigger on post_reactions table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_reactions') THEN
    DROP TRIGGER IF EXISTS trigger_notify_on_new_like ON post_reactions;
    CREATE TRIGGER trigger_notify_on_new_like
      AFTER INSERT ON post_reactions
      FOR EACH ROW
      WHEN (NEW.reaction_type = 'like')
      EXECUTE FUNCTION notify_on_new_like();
  END IF;
END
$$;

-- 9. Create function to send notification on new comment
CREATE OR REPLACE FUNCTION notify_on_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commenter_name TEXT;
  commenter_username TEXT;
  post_owner_id UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's name for notification
  SELECT full_name, username INTO commenter_name, commenter_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- Insert notification record
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    post_owner_id,
    'comment',
    'New Comment',
    COALESCE(commenter_name, commenter_username) || ' commented on your post',
    jsonb_build_object(
      'post_id', NEW.post_id,
      'comment_id', NEW.id,
      'commenter_id', NEW.user_id
    ),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 10. Create trigger on comments table
DROP TRIGGER IF EXISTS trigger_notify_on_new_comment ON comments;
CREATE TRIGGER trigger_notify_on_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_comment();

-- 11. Create index on notifications table for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'FCM support migration completed successfully!';
  RAISE NOTICE 'Database triggers created for: messages, follows, likes, comments';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set FIREBASE_SERVER_KEY in Supabase secrets';
  RAISE NOTICE '2. Deploy send-fcm-notification Edge Function';
  RAISE NOTICE '3. Update your app with FCM code';
  RAISE NOTICE '4. Rebuild and reinstall APK';
END
$$;
