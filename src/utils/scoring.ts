export const QUESTIONS_PER_GAME = 10;
export const POINTS_CORRECT = 100;
export const POINTS_SPEED_BONUS = 50;
export const SPEED_BONUS_THRESHOLD_SEC = 3;
export const MAX_DISPLAY_SCORE = 1000;
export const TIMER_SECONDS = 10;

export function pointsForAnswer(elapsedMs: number, correct: boolean): number {
  if (!correct) return 0;
  const speedBonus =
    elapsedMs < SPEED_BONUS_THRESHOLD_SEC * 1000 ? POINTS_SPEED_BONUS : 0;
  return POINTS_CORRECT + speedBonus;
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
