-- Add verification fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_category TEXT;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT,
    CONSTRAINT unique_pending_request UNIQUE (user_id, status)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Enable Row Level Security
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_requests
-- Users can view their own requests
CREATE POLICY "Users can view own verification requests"
    ON verification_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create verification requests"
    ON verification_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE verification_requests IS 'Stores user verification requests similar to Instagram/Meta verification system';
COMMENT ON COLUMN profiles.is_verified IS 'Indicates if the user account is verified';
COMMENT ON COLUMN profiles.verification_category IS 'Category of verification (e.g., developer, creator, business)';
