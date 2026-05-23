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
  console.log('[leaderboard] saveBestScore', { playerName, score, difficulty });

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

  if (existing) {
    if (score > existing.score) {
      const { error } = await supabase
        .from('leaderboard')
        .update({ score })
        .eq('player_name', playerName)
        .eq('difficulty', difficulty);
      if (error) {
        console.log('[leaderboard] update error', error);
        throw error;
      }
      console.log('[leaderboard] updated best score', { playerName, score, difficulty });
    } else {
      console.log('[leaderboard] score not higher, skipping update', {
        playerName,
        score,
        existingScore: existing.score,
        difficulty,
      });
    }
  } else {
    const { error } = await supabase.from('leaderboard').insert({
      player_name: playerName,
      score,
      difficulty,
    });
    if (error) {
      console.log('[leaderboard] insert error', error);
      throw error;
    }
    console.log('[leaderboard] inserted new entry', { playerName, score, difficulty });
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
