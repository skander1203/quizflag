-- QuizFlag leaderboard schema and reset
-- Run in Supabase SQL Editor

-- One best score per player per difficulty
ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_player_difficulty_unique;
ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_player_difficulty_unique
  UNIQUE (player_name, difficulty);

-- Clear all existing leaderboard entries (run once to reset)
DELETE FROM leaderboard;
