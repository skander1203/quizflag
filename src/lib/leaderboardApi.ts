import type { Difficulty } from '../types';
import { supabase } from './supabase';

export interface OnlineLeaderboardRow {
  player_name: string;
  score: number;
  difficulty: Difficulty;
}

export async function fetchTopLeaderboard(
  limit = 20,
  difficulty: Difficulty,
): Promise<OnlineLeaderboardRow[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('player_name, score, difficulty')
    .eq('difficulty', difficulty)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as OnlineLeaderboardRow[];
}

/** Keep only the player's personal best per difficulty. */
export async function upsertLeaderboardBestScore(
  playerName: string,
  score: number,
  difficulty: Difficulty,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('player_name', playerName)
    .eq('difficulty', difficulty)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing && score <= existing.score) {
    return;
  }

  const { error: upsertError } = await supabase.from('leaderboard').upsert(
    { player_name: playerName, score, difficulty },
    { onConflict: 'player_name,difficulty' },
  );

  if (upsertError) throw upsertError;
}
