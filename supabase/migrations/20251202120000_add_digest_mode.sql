-- Add digest_mode and last_digest_at to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS digest_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_digest_at TIMESTAMP WITH TIME ZONE DEFAULT now();
