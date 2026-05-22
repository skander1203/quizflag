import type { Rank, RankId } from '../types';

export const RANKS: Rank[] = [
  { id: 'explorateur', label: 'Explorateur', emoji: '🌍', minCorrect: 0 },
  { id: 'geographe', label: 'Géographe', emoji: '🌟', minCorrect: 500 },
  { id: 'maestro', label: 'Maestro des Drapeaux', emoji: '👑', minCorrect: 2000 },
];

export function getRank(totalCorrect: number): Rank {
  if (totalCorrect >= 2000) return RANKS[2];
  if (totalCorrect >= 500) return RANKS[1];
  return RANKS[0];
}

export function getRankId(totalCorrect: number): RankId {
  return getRank(totalCorrect).id;
}
