export type Difficulty = 'facile' | 'normal' | 'difficile' | 'extreme' | 'impossible';

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export interface Country {
  name_fr: string;
  iso_code: string;
  flag_emoji: string;
  difficulty: DifficultyTier;
}

export interface FlagQuestion {
  id: string;
  country: Country;
  options: string[];
  correctAnswer: string;
}

export interface GameSession {
  difficulty: Difficulty;
  questions: FlagQuestion[];
  currentIndex: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  speedBonuses: number;
  questionStartedAt: number;
  finished: boolean;
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  difficulty: Difficulty;
  correctCount: number;
  totalQuestions: number;
  timestamp: number;
}

export interface PlayerData {
  name: string;
}
