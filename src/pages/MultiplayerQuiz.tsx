import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { FlagDisplay } from '../components/FlagDisplay';
import { Timer } from '../components/Timer';
import { Confetti } from '../components/Confetti';
import {
  advanceQuestion,
  countAnswersForQuestion,
  fetchPlayers,
  fetchRoom,
  removeSubscription,
  submitAnswer,
  subscribeToGamePlayers,
  subscribeToGameRoom,
  type GamePlayer,
  type GameRoom,
} from '../lib/multiplayerApi';
import { getMultiplayerSession } from '../lib/multiplayerSession';
import {
  getSpeedTier,
  pointsForAnswer,
  remainingFromElapsed,
  TIMER_SECONDS,
} from '../utils/scoring';
import type { FlagQuestion } from '../types';

interface FloatingBonus {
  id: number;
  label: string;
  color: string;
  textShadow: string;
}

function glowForPoints(points: number): string {
  if (points === 150) {
    return '0 0 10px rgba(251, 191, 36, 0.9), 0 0 22px rgba(251, 191, 36, 0.5)';
  }
  if (points === 120) {
    return '0 0 8px rgba(250, 204, 21, 0.75), 0 0 18px rgba(250, 204, 21, 0.4)';
  }
  return '0 0 8px rgba(74, 222, 128, 0.75), 0 0 18px rgba(74, 222, 128, 0.4)';
}

export function MultiplayerQuiz() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const playerName = session?.playerName ?? '';
  const isHost = session?.isHost ?? false;

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingBonus, setFloatingBonus] = useState<FloatingBonus | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);

  const roomSubRef = useRef<RealtimeChannel | null>(null);
  const playersSubRef = useRef<RealtimeChannel | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const remainingRef = useRef(TIMER_SECONDS);
  const questionStartedAtRef = useRef(Date.now());
  const answeredIndexRef = useRef<number | null>(null);
  const isAnsweringRef = useRef(false);
  const advancingRef = useRef(false);
  const hostAdvanceIndexRef = useRef<number | null>(null);
  const playersRef = useRef<GamePlayer[]>([]);
  const currentIndexRef = useRef(0);
  const roomRef = useRef<GameRoom | null>(null);
  const totalRef = useRef(0);

  const questions = room?.questions ?? [];
  const currentIndex = room?.current_question ?? 0;
  const question = questions[currentIndex] as FlagQuestion | undefined;
  const total = room?.question_count ?? questions.length;
  const myPlayer = players.find((p) => p.player_name === playerName);
  const answeredCount = players.filter((p) => p.answered).length;
  const progress = (remaining / TIMER_SECONDS) * 100;

  playersRef.current = players;
  currentIndexRef.current = currentIndex;
  roomRef.current = room;
  totalRef.current = total;

  const handleRoomChange = useCallback(
    (updated: GameRoom) => {
      setRoom(updated);

      if (updated.status === 'waiting') {
        navigate(`/multiplayer/waiting/${code}`, { replace: true });
        return;
      }
      if (updated.status === 'finished') {
        navigate(`/multiplayer/results/${code}`, { replace: true });
        return;
      }

      if (updated.current_question !== currentIndexRef.current) {
        advancingRef.current = false;
        hostAdvanceIndexRef.current = null;
      }
    },
    [code, navigate],
  );

  useEffect(() => {
    const mpSession = getMultiplayerSession();
    if (!code || !mpSession) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    let cancelled = false;

    const init = async () => {
      const roomData = await fetchRoom(code);
      if (cancelled) return;

      if (!roomData) {
        navigate('/multiplayer', { replace: true });
        return;
      }

      if (roomData.status === 'waiting') {
        navigate(`/multiplayer/waiting/${code}`, { replace: true });
        return;
      }
      if (roomData.status === 'finished') {
        navigate(`/multiplayer/results/${code}`, { replace: true });
        return;
      }

      setRoom(roomData);
      const playersData = await fetchPlayers(code);
      if (cancelled) return;
      setPlayers(playersData);

      roomSubRef.current = subscribeToGameRoom(code, handleRoomChange);
      playersSubRef.current = subscribeToGamePlayers(code, setPlayers);
    };

    void init();

    return () => {
      cancelled = true;
      if (roomSubRef.current) {
        removeSubscription(roomSubRef.current);
        roomSubRef.current = null;
      }
      if (playersSubRef.current) {
        removeSubscription(playersSubRef.current);
        playersSubRef.current = null;
      }
    };
  }, [code, navigate, handleRoomChange]);

  useEffect(() => {
    setRemaining(TIMER_SECONDS);
    remainingRef.current = TIMER_SECONDS;
    setSelectedAnswer(null);
    setIsAnswering(false);
    isAnsweringRef.current = false;
    setFeedback(null);
    answeredIndexRef.current = null;
    advancingRef.current = false;
    hostAdvanceIndexRef.current = null;
    questionStartedAtRef.current = Date.now();

    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!room || room.status !== 'playing' || !question) {
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 0) {
          remainingRef.current = 0;
          return 0;
        }
        const next = prev - 1;
        remainingRef.current = next;
        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentIndex, room?.start_time, room?.status, question?.id]);

  useEffect(() => {
    if (feedback === 'correct') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!question || !room || room.status !== 'playing') return;
      if (isAnsweringRef.current || answeredIndexRef.current === currentIndexRef.current) return;

      isAnsweringRef.current = true;
      setIsAnswering(true);
      setSelectedAnswer(answer);
      answeredIndexRef.current = currentIndexRef.current;

      const elapsedMs = Math.max(0, Date.now() - questionStartedAtRef.current);
      const isCorrect = answer === question.correctAnswer;
      const points = pointsForAnswer(elapsedMs, isCorrect);

      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        const tier = getSpeedTier(remainingFromElapsed(elapsedMs));
        setFloatingBonus({
          id: Date.now(),
          label: tier.label,
          color: tier.color,
          textShadow: glowForPoints(tier.points),
        });
      }

      try {
        await submitAnswer(
          code,
          playerName,
          currentIndexRef.current,
          isCorrect,
          elapsedMs,
          points,
        );
      } catch {
        answeredIndexRef.current = null;
        setSelectedAnswer(null);
        setFeedback(null);
      } finally {
        isAnsweringRef.current = false;
        setIsAnswering(false);
      }
    },
    [question, room, code, playerName],
  );

  const tryAdvance = useCallback(async () => {
    if (!isHost) return;

    const activeRoom = roomRef.current;
    if (!activeRoom || activeRoom.status !== 'playing') return;

    const questionIndex = activeRoom.current_question;
    if (advancingRef.current) return;
    if (hostAdvanceIndexRef.current === questionIndex) return;

    const playerCount = playersRef.current.length;
    if (playerCount === 0) return;

    const timerDone = remainingRef.current === 0;
    let answerCount = 0;

    try {
      answerCount = await countAnswersForQuestion(code, questionIndex);
    } catch {
      return;
    }

    const allAnswered = answerCount >= playerCount;
    if (!timerDone && !allAnswered) return;

    advancingRef.current = true;
    hostAdvanceIndexRef.current = questionIndex;

    try {
      await advanceQuestion(code, questionIndex, totalRef.current);
    } catch {
      advancingRef.current = false;
      hostAdvanceIndexRef.current = null;
    }
  }, [isHost, code]);

  useEffect(() => {
    if (!isHost || remaining !== 0 || !room || room.status !== 'playing') return;
    void tryAdvance();
  }, [isHost, remaining, room?.status, tryAdvance]);

  useEffect(() => {
    if (!isHost || !room || room.status !== 'playing') return;

    const id = window.setInterval(() => {
      if (remainingRef.current === 0) return;
      void tryAdvance();
    }, 1000);

    return () => window.clearInterval(id);
  }, [isHost, room?.status, currentIndex, tryAdvance]);

  if (!room || !question) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

  const hasAnswered = selectedAnswer !== null;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const feedbackLabel =
    feedback === 'correct'
      ? 'Bonne réponse !'
      : feedback === 'wrong'
        ? 'Mauvaise réponse !'
        : null;

  return (
    <div className="flex flex-col h-full min-h-0 -mx-4">
      <Confetti active={showConfetti} count={28} />

      <header className="shrink-0 px-4 py-2 bg-transparent">
        <div className="flex items-center justify-between gap-2 min-h-[40px]">
          <div className="relative">
            <span className="text-cyan-300 font-extrabold tabular-nums text-sm">
              {myPlayer?.score ?? 0} pts
            </span>
            <AnimatePresence>
              {floatingBonus && (
                <motion.span
                  key={floatingBonus.id}
                  className="absolute left-0 top-0 text-3xl font-black pointer-events-none whitespace-nowrap"
                  style={{
                    color: floatingBonus.color,
                    textShadow: floatingBonus.textShadow,
                  }}
                  initial={{ scale: 1.5, opacity: 1, y: 0 }}
                  animate={{
                    scale: [1.5, 1, 1],
                    opacity: [1, 1, 0],
                    y: [0, -20, -60],
                  }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  onAnimationComplete={() => setFloatingBonus(null)}
                >
                  {floatingBonus.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-center">
            <span className="text-white/80 font-bold text-sm tabular-nums block">
              {currentIndex + 1} / {total}
            </span>
            <span className="text-white/50 text-xs font-semibold">
              👥 {players.length} · ✓ {answeredCount}/{players.length}
            </span>
          </div>
          <button
            type="button"
            className="text-white/50 text-xs font-semibold tap-target px-2"
            onClick={() => setLeaderboardOpen((o) => !o)}
          >
            {leaderboardOpen ? '▾' : '▴'} Cls
          </button>
        </div>
        <div className="mt-2">
          <Timer progress={progress} remaining={remaining} />
        </div>
      </header>

      <AnimatePresence>
        {leaderboardOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 px-4 overflow-hidden"
          >
            <div className="glass-card p-2 mb-2">
              <p className="text-white/50 text-xs font-bold mb-1.5 px-1">Classement live</p>
              <ul className="space-y-1 max-h-24 overflow-y-auto scrollbar-hidden">
                {sortedPlayers.map((p, i) => (
                  <li
                    key={p.id}
                    className={`flex justify-between text-xs font-bold px-2 py-1 rounded-lg ${
                      p.player_name === playerName ? 'bg-cyan-500/20 text-cyan-200' : 'text-white/80'
                    }`}
                  >
                    <span>
                      {i + 1}. {p.player_name}
                      {p.answered ? ' ✓' : ''}
                    </span>
                    <span className="tabular-nums">{p.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shrink-0 px-4 mb-2">
        <FlagDisplay
          isoCode={question.country.iso_code}
          flagEmoji={question.country.flag_emoji}
          countryName={question.country.name_fr}
          variant="quiz"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 flex flex-col gap-3">
        <p className="text-center text-white font-extrabold text-base sm:text-lg shrink-0 px-1 mt-2">
          🏳️ À quel pays appartient ce drapeau ?
        </p>

        <div
          className="min-h-12 shrink-0 flex flex-col items-center justify-center text-center px-2"
          role="status"
          aria-live="polite"
        >
          <p
            className={`font-extrabold text-base leading-tight transition-opacity duration-200 ${
              feedbackLabel
                ? feedback === 'correct'
                  ? 'text-green-400 opacity-100'
                  : 'text-red-400 opacity-100'
                : 'opacity-0'
            }`}
          >
            {feedbackLabel ?? '\u00A0'}
          </p>
          <p
            className={`text-sm text-white/60 font-semibold leading-tight mt-0.5 transition-opacity duration-200 ${
              feedback === 'wrong' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {feedback === 'wrong'
              ? `C'était : ${question.correctAnswer}`
              : '\u00A0'}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5" role="listbox" aria-label="Réponses possibles">
          {question.options.map((opt) => (
            <motion.li key={opt} role="option" whileTap={!hasAnswered ? { scale: 0.98 } : {}}>
              <button
                type="button"
                disabled={hasAnswered || isAnswering}
                onClick={() => void handleAnswer(opt)}
                className={`answer-btn ${
                  feedback && opt === question.correctAnswer
                    ? 'bg-green-500/35 border-green-400 text-white'
                    : selectedAnswer === opt
                      ? feedback === 'correct'
                        ? 'bg-green-500/35 border-green-400 text-white'
                        : 'bg-red-500/25 border-red-400/60 text-white'
                      : 'glass-card border-white/25 text-white hover:border-cyan-400/50 hover:bg-white/15'
                } disabled:opacity-70`}
              >
                {opt}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
