import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  Difficulty,
  GameSession,
  LeaderboardEntry,
  PlayerData,
} from '../types';
import { generateFlagQuestions } from '../data/countries';
import { pointsForAnswer, speedBonusPoints, QUESTIONS_PER_GAME } from '../utils/scoring';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';

const STORAGE_LEADERBOARD = 'quizflag_leaderboard';
const MAX_LEADERBOARD = 10;

type QuizState = {
  player: PlayerData;
  difficulty: Difficulty;
  session: GameSession | null;
  leaderboard: LeaderboardEntry[];
  feedback: 'idle' | 'correct' | 'wrong' | null;
};

type Action =
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'START_GAME' }
  | { type: 'RESTART_GAME'; payload: Difficulty }
  | {
      type: 'ANSWER';
      payload: { answer: string; elapsedMs: number };
    }
  | { type: 'TIMEOUT' }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'CLEAR_SESSION' }
  | { type: 'LOAD_LEADERBOARD'; payload: LeaderboardEntry[] };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_PLAYER_NAME':
      return {
        ...state,
        player: { ...state.player, name: action.payload },
      };
    case 'LOAD_LEADERBOARD':
      return { ...state, leaderboard: action.payload };
    case 'START_GAME':
      return {
        ...state,
        session: {
          difficulty: state.difficulty,
          questions: generateFlagQuestions(state.difficulty, QUESTIONS_PER_GAME),
          currentIndex: 0,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          speedBonuses: 0,
          questionStartedAt: Date.now(),
          finished: false,
        },
        feedback: null,
      };
    case 'RESTART_GAME':
      return {
        ...state,
        difficulty: action.payload,
        session: {
          difficulty: action.payload,
          questions: generateFlagQuestions(action.payload, QUESTIONS_PER_GAME),
          currentIndex: 0,
          score: 0,
          correctCount: 0,
          wrongCount: 0,
          speedBonuses: 0,
          questionStartedAt: Date.now(),
          finished: false,
        },
        feedback: null,
      };
    case 'ANSWER':
    case 'TIMEOUT': {
      const session = state.session;
      if (!session || session.finished) return state;
      const q = session.questions[session.currentIndex];
      const correct =
        action.type === 'ANSWER' &&
        action.payload.answer === q.correctAnswer;
      const elapsedMs =
        action.type === 'ANSWER'
          ? action.payload.elapsedMs
          : TIMER_ELAPSED_MAX;
      const pts = pointsForAnswer(elapsedMs, correct);
      const bonusPts = speedBonusPoints(elapsedMs, correct);
      const nextIndex = session.currentIndex + 1;
      const finished = nextIndex >= session.questions.length;

      return {
        ...state,
        feedback: correct ? 'correct' : 'wrong',
        session: {
          ...session,
          score: session.score + pts,
          correctCount: session.correctCount + (correct ? 1 : 0),
          wrongCount: session.wrongCount + (correct ? 0 : 1),
          speedBonuses: session.speedBonuses + bonusPts,
          currentIndex: finished ? session.currentIndex : nextIndex,
          finished,
          questionStartedAt: Date.now(),
        },
      };
    }
    case 'CLEAR_FEEDBACK':
      return { ...state, feedback: null };
    case 'CLEAR_SESSION':
      return { ...state, session: null, feedback: null };
    default:
      return state;
  }
}

const TIMER_ELAPSED_MAX = 10000;

const QuizContext = createContext<{
  state: QuizState;
  dispatch: Dispatch<Action>;
  startGame: (difficulty: Difficulty) => void;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const { username, isGuest } = useAuth();
  const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardEntry[]>(
    STORAGE_LEADERBOARD,
    [],
  );

  const [state, dispatch] = useReducer(reducer, {
    player: { name: username },
    difficulty: 'facile',
    session: null,
    leaderboard,
    feedback: null,
  });

  useEffect(() => {
    if (username && state.player.name !== username) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: username });
    }
  }, [username]);

  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    dispatch({ type: 'LOAD_LEADERBOARD', payload: leaderboard });
  }, [leaderboard.length]);

  useEffect(() => {
    const session = state.session;
    if (!session?.finished || isGuest) return;
    const key = `${session.score}-${session.correctCount}`;
    if (savedRef.current === key) return;
    savedRef.current = key;

    const entry: LeaderboardEntry = {
      playerName: state.player.name || username || 'Joueur',
      score: session.score,
      difficulty: session.difficulty,
      correctCount: session.correctCount,
      totalQuestions: session.questions.length,
      timestamp: Date.now(),
    };

    const next = [entry, ...leaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD);
    setLeaderboard(next);
    dispatch({ type: 'LOAD_LEADERBOARD', payload: next });
  }, [state.session?.finished]);

  const startGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'RESTART_GAME', payload: difficulty });
  }, []);

  return (
    <QuizContext.Provider
      value={{
        state: {
          ...state,
          player: {
            name: state.player.name || username,
          },
          leaderboard,
        },
        dispatch,
        startGame,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
