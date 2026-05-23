import type { Difficulty } from '../types';
import { supabase } from './supabase';

export interface OnlineLeaderboardRow {
  player_name: string;
  score: number;
  difficulty: Difficulty;
}

export async function fetchTopLeaderboard(
  limit = 20,
  difficulty?: Difficulty,
): Promise<OnlineLeaderboardRow[]> {
  let query = supabase
    .from('leaderboard')
    .select('player_name, score, difficulty')
    .order('score', { ascending: false })
    .limit(limit);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as OnlineLeaderboardRow[];
}
