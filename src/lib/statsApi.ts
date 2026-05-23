import type { Difficulty } from '../types';
import { supabase } from './supabase';

export interface DifficultyStats {
  games_played: number;
  best_score: number;
}

export type StatsPerDifficulty = Partial<Record<Difficulty, DifficultyStats>>;

export interface UserStats {
  id: string;
  games_played: number;
  correct_answers: number;
  wrong_answers: number;
  total_points: number;
  best_score: number;
  stats_per_difficulty: StatsPerDifficulty;
  updated_at: string;
}

export const EMPTY_STATS: Omit<UserStats, 'id' | 'updated_at'> = {
  games_played: 0,
  correct_answers: 0,
  wrong_answers: 0,
  total_points: 0,
  best_score: 0,
  stats_per_difficulty: {},
};

export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    games_played: data.games_played ?? 0,
    correct_answers: data.correct_answers ?? 0,
    wrong_answers: data.wrong_answers ?? 0,
    total_points: data.total_points ?? 0,
    best_score: data.best_score ?? 0,
    stats_per_difficulty: (data.stats_per_difficulty ?? {}) as StatsPerDifficulty,
    updated_at: data.updated_at ?? new Date().toISOString(),
  };
}

export async function updateUserStatsAfterGame(
  userId: string,
  {
    difficulty,
    score,
    correctCount,
    wrongCount,
  }: {
    difficulty: Difficulty;
    score: number;
    correctCount: number;
    wrongCount: number;
  },
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (selectError) throw selectError;

  const diffStats = (existing?.stats_per_difficulty ?? {}) as StatsPerDifficulty;
  const currentDiff = diffStats[difficulty] ?? { games_played: 0, best_score: 0 };

  const newDiffStats: StatsPerDifficulty = {
    ...diffStats,
    [difficulty]: {
      games_played: currentDiff.games_played + 1,
      best_score: Math.max(currentDiff.best_score, score),
    },
  };

  const payload = {
    id: userId,
    games_played: (existing?.games_played ?? 0) + 1,
    correct_answers: (existing?.correct_answers ?? 0) + correctCount,
    wrong_answers: (existing?.wrong_answers ?? 0) + wrongCount,
    total_points: (existing?.total_points ?? 0) + score,
    best_score: Math.max(existing?.best_score ?? 0, score),
    stats_per_difficulty: newDiffStats,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_stats').upsert(payload);
  if (error) throw error;
}

export function globalAccuracy(stats: Pick<UserStats, 'correct_answers' | 'wrong_answers'>): number {
  const total = stats.correct_answers + stats.wrong_answers;
  if (total === 0) return 0;
  return (stats.correct_answers / total) * 100;
}

export function favoriteDifficulty(
  statsPerDifficulty: StatsPerDifficulty,
): Difficulty | null {
  let best: Difficulty | null = null;
  let maxGames = 0;

  for (const [difficulty, data] of Object.entries(statsPerDifficulty) as [
    Difficulty,
    DifficultyStats,
  ][]) {
    if (data.games_played > maxGames) {
      maxGames = data.games_played;
      best = difficulty;
    }
  }

  return best;
}
