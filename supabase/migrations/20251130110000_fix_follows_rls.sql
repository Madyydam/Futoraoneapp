-- Fix RLS policies for follows table
-- Drop existing select policy if it exists (to avoid conflicts, though 'create or replace' isn't standard for policies)
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
DROP POLICY IF EXISTS "Enable read access for all users" ON follows;

-- Create a permissive select policy for follows
CREATE POLICY "Enable read access for all users"
ON follows FOR SELECT
USING (true);

-- Ensure profiles are publicly visible (if not already)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);
