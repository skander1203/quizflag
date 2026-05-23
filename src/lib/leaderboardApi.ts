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
  console.log('Saving score:', playerName, score, difficulty);

  const { data: existing, error: selectError } = await supabase
    .from('leaderboard')
    .select('score')
    .eq('player_name', playerName)
    .eq('difficulty', difficulty)
    .maybeSingle();

  if (selectError) {
    console.log('[leaderboard] select error', selectError);
    throw selectError;
  }

  if (existing && score <= existing.score) {
    console.log('[leaderboard] score not higher, skipping update', {
      playerName,
      score,
      existingScore: existing.score,
      difficulty,
    });
    return;
  }

  const { error } = await supabase.from('leaderboard').upsert(
    { player_name: playerName, score, difficulty },
    { onConflict: 'player_name,difficulty' },
  );

  if (error) {
    console.log('[leaderboard] upsert error', error);
    throw error;
  }

  console.log('[leaderboard] saved', { playerName, score, difficulty });
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
