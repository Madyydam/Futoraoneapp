-- Function to get aggregated global leaderboard with last active date
CREATE OR REPLACE FUNCTION get_overall_leaderboard()
RETURNS TABLE (
  user_id UUID,
  total_wins BIGINT,
  total_losses BIGINT,
  username TEXT,
  avatar_url TEXT,
  full_name TEXT,
  last_active_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ugs.user_id,
    COALESCE(SUM(ugs.wins), 0) as total_wins,
    COALESCE(SUM(ugs.losses), 0) as total_losses,
    p.username,
    p.avatar_url,
    p.full_name,
    MAX(ugs.last_played_at) as last_active_at
  FROM
    user_game_stats ugs
  JOIN
    profiles p ON ugs.user_id = p.id
  GROUP BY
    ugs.user_id, p.id, p.username, p.avatar_url, p.full_name
  ORDER BY
    total_wins DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;
