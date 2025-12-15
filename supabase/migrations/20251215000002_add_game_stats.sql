-- Create user_game_stats table for tracking game performance
CREATE TABLE IF NOT EXISTS user_game_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL, -- e.g., 'tic-tac-toe', 'connect-four'
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE user_game_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON user_game_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON user_game_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_game_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_user_game_stats_game_wins ON user_game_stats(game_id, wins DESC);
