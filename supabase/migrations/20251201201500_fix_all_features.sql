-- Ensure profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_category TEXT,
ADD COLUMN IF NOT EXISTS tech_skills TEXT[],
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Ensure blocks table exists
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocks
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Policies for blocks
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocks;
CREATE POLICY "Users can view their own blocks" ON public.blocks
  FOR SELECT USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create their own blocks" ON public.blocks;
CREATE POLICY "Users can create their own blocks" ON public.blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocks;
CREATE POLICY "Users can delete their own blocks" ON public.blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- Ensure verification_requests table exists
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT,
    CONSTRAINT unique_pending_request UNIQUE (user_id, status)
);

-- Enable RLS on verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policies for verification_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.verification_requests;
CREATE POLICY "Users can view their own requests" ON public.verification_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create requests" ON public.verification_requests;
CREATE POLICY "Users can create requests" ON public.verification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage policies for post-images (avatars and banners)
-- Note: This assumes the bucket 'post-images' already exists. If not, it needs to be created via dashboard.
-- We can try to insert a policy, but creating buckets via SQL is not standard in all Supabase versions.

-- Allow public access to post-images
-- (This is usually done via dashboard, but we can try to set policies if the bucket exists)
