export const QUESTIONS_PER_GAME = 10;
export const MAX_DISPLAY_SCORE = 1500;
export const TIMER_SECONDS = 10;

export interface SpeedTier {
  points: number;
  label: string;
  color: string;
}

export function remainingFromElapsed(elapsedMs: number): number {
  return Math.max(0, TIMER_SECONDS - elapsedMs / 1000);
}

export function getSpeedTier(remainingSec: number): SpeedTier {
  if (remainingSec > 7) {
    return { points: 150, label: '+150 ⚡', color: '#fbbf24' };
  }
  if (remainingSec >= 4) {
    return { points: 120, label: '+120 ⚡', color: '#facc15' };
  }
  return { points: 100, label: '+100', color: '#4ade80' };
}

export function pointsForAnswer(elapsedMs: number, correct: boolean): number {
  if (!correct) return 0;
  return getSpeedTier(remainingFromElapsed(elapsedMs)).points;
}

export function speedBonusPoints(elapsedMs: number, correct: boolean): number {
  if (!correct) return 0;
  const pts = pointsForAnswer(elapsedMs, correct);
  return Math.max(0, pts - 100);
}

export function starRating(score: number): 1 | 2 | 3 {
  if (score >= 700) return 3;
  if (score >= 400) return 2;
  return 1;
}

export const DIFFICULTY_LABELS: Record<
  import('../types').Difficulty,
  string
> = {
  facile: 'Facile',
  normal: 'Normal',
  difficile: 'Difficile',
  extreme: 'Extrême',
  impossible: 'Impossible',
};

export const DIFFICULTY_TIER: Record<
  import('../types').Difficulty,
  import('../types').DifficultyTier
> = {
  facile: 1,
  normal: 2,
  difficile: 3,
  extreme: 4,
  impossible: 5,
};
