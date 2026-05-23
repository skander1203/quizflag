import type { Difficulty } from '../types';
import { supabase } from './supabase';
import { fetchAvatarsByUsernames } from './profilesApi';

export interface OnlineLeaderboardRow {
  player_name: string;
  score: number;
  difficulty: Difficulty;
  avatar_url?: string | null;
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
  const rows = (data ?? []) as OnlineLeaderboardRow[];

  const avatars = await fetchAvatarsByUsernames(rows.map((r) => r.player_name));
  return rows.map((row) => ({
    ...row,
    avatar_url: avatars[row.player_name] ?? null,
  }));
}
