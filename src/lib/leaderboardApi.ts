import type { Difficulty } from '../types';
import { supabase } from './supabase';

export interface OnlineLeaderboardRow {
  player_name: string;
  score: number;
  difficulty: Difficulty;
}

export async function saveBestScore(
  playerName: string,
  score: number,
  difficulty: Difficulty,
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('player_name', playerName)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    if (score > existing.score) {
      const { error } = await supabase
        .from('leaderboard')
        .update({ score, difficulty })
        .eq('player_name', playerName);
      if (error) throw error;
    }
  } else {
    const { error } = await supabase.from('leaderboard').insert({
      player_name: playerName,
      score,
      difficulty,
    });
    if (error) throw error;
  }
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
