import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { FlagDisplay } from '../components/FlagDisplay';
import { Timer } from '../components/Timer';
import { Confetti } from '../components/Confetti';
import { useSyncedTimer } from '../hooks/useSyncedTimer';
import {
  advanceQuestion,
  fetchPlayers,
  fetchRoom,
  submitAnswer,
  subscribeToRoom,
  unsubscribeFromRoom,
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
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingBonus, setFloatingBonus] = useState<FloatingBonus | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const advancingRef = useRef(false);
  const answeredIndexRef = useRef<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const questions = room?.questions ?? [];
  const currentIndex = room?.current_question ?? 0;
  const question = questions[currentIndex] as FlagQuestion | undefined;
  const total = room?.question_count ?? questions.length;
  const myPlayer = players.find((p) => p.player_name === playerName);
  const canAnswer = Boolean(
    room?.status === 'playing' && question && !locked && !feedback && !myPlayer?.answered,
  );

  const timerActive = Boolean(canAnswer && room?.start_time);

  const { remaining, progress, expired } = useSyncedTimer(
    room?.start_time ?? null,
    TIMER_SECONDS,
    timerActive,
  );

  const answeredCount = players.filter((p) => p.answered).length;

  useEffect(() => {
    const mpSession = getMultiplayerSession();
    if (!code || !mpSession) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    const init = async () => {
      const roomData = await fetchRoom(code);
      if (!roomData) {
        navigate('/multiplayer', { replace: true });
        return;
      }

      console.log('[multiplayer] quiz init', {
        code,
        status: roomData.status,
        currentQuestion: roomData.current_question,
        questionCount: roomData.questions?.length ?? 0,
        startTime: roomData.start_time,
      });

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
      setPlayers(playersData);

      channelRef.current = subscribeToRoom(code, {
        onRoomUpdate: (updated) => {
          console.log('[multiplayer] quiz room update', {
            code,
            status: updated.status,
            currentQuestion: updated.current_question,
            startTime: updated.start_time,
          });
          setRoom(updated);
          if (updated.status === 'finished') {
            navigate(`/multiplayer/results/${code}`, { replace: true });
          }
        },
        onPlayersUpdate: setPlayers,
      });
    };

    void init();

    return () => {
      if (channelRef.current) {
        unsubscribeFromRoom(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [code, navigate]);

  useEffect(() => {
    setLocked(false);
    setFeedback(null);
    answeredIndexRef.current = null;
    advancingRef.current = false;
  }, [currentIndex]);

  useEffect(() => {
    if (feedback === 'correct') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 1200);
    return () => clearTimeout(t);
  }, [feedback]);

  const doSubmit = useCallback(
    async (answer: string, elapsedMs: number) => {
      if (!question || !room) {
        console.log('[multiplayer] doSubmit blocked — missing question or room');
        return;
      }
      if (answeredIndexRef.current === currentIndex) {
        console.log('[multiplayer] doSubmit blocked — already answered question', currentIndex);
        return;
      }

      answeredIndexRef.current = currentIndex;
      const isCorrect = answer === question.correctAnswer;
      const points = pointsForAnswer(elapsedMs, isCorrect);

      console.log('[multiplayer] doSubmit', {
        answer,
        currentIndex,
        isCorrect,
        points,
        elapsedMs,
      });

      setFeedback(isCorrect ? 'correct' : 'wrong');
      setLocked(true);
      if (isCorrect) {
        const tier = getSpeedTier(remainingFromElapsed(elapsedMs));
        setFloatingBonus({
          id: Date.now(),
          label: tier.label,
          color: tier.color,
          textShadow: glowForPoints(tier.points),
        });
      }

      setPlayers((prev) =>
        prev.map((p) =>
          p.player_name === playerName
            ? { ...p, score: p.score + points, answered: true }
            : p,
        ),
      );

      try {
        await submitAnswer(code, playerName, currentIndex, isCorrect, elapsedMs, points);
      } catch (err) {
        console.log('[multiplayer] doSubmit error', err);
      }
    },
    [question, room, code, playerName, currentIndex],
  );

  const handleAnswer = (answer: string) => {
    console.log('Answer clicked:', answer);
    console.log('[multiplayer] handleAnswer state', {
      locked,
      feedback,
      hasQuestion: Boolean(question),
      currentIndex,
      startTime: room?.start_time,
      canAnswer,
      alreadyAnswered: myPlayer?.answered,
    });

    if (locked || feedback || myPlayer?.answered) return;
    if (!question || !room) return;

    const startMs = room.start_time
      ? new Date(room.start_time).getTime()
      : Date.now();
    const elapsedMs = room.start_time
      ? Math.max(0, Date.now() - startMs)
      : 0;

    void doSubmit(answer, elapsedMs);
  };

  useEffect(() => {
    if (!expired || locked || feedback || !question || myPlayer?.answered) return;
    if (answeredIndexRef.current === currentIndex) return;

    console.log('[multiplayer] timer expired — auto submit', { currentIndex });
    const elapsedMs = TIMER_SECONDS * 1000;
    void doSubmit('', elapsedMs);
  }, [expired, locked, feedback, question, myPlayer?.answered, currentIndex, doSubmit]);

  useEffect(() => {
    if (!isHost || !room || room.status !== 'playing') return;
    if (advancingRef.current) return;

    const allAnswered = players.length > 0 && players.every((p) => p.answered);

    if (allAnswered) {
      advancingRef.current = true;
      const t = setTimeout(() => {
        void advanceQuestion(code, currentIndex, total).catch(() => {
          advancingRef.current = false;
        });
      }, 1500);
      return () => clearTimeout(t);
    }

    if (!expired) return;

    advancingRef.current = true;
    const t = setTimeout(() => {
      void advanceQuestion(code, currentIndex, total).catch(() => {
        advancingRef.current = false;
      });
    }, 2000);

    return () => clearTimeout(t);
  }, [isHost, room, players, expired, code, currentIndex, total]);

  if (!room || !question) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

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
          <Timer progress={progress} remaining={Math.ceil(remaining)} />
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
            <motion.li key={opt} role="option" whileTap={canAnswer ? { scale: 0.98 } : {}}>
              <button
                type="button"
                disabled={!canAnswer}
                onClick={() => handleAnswer(opt)}
                className={`answer-btn ${
                  feedback && opt === question.correctAnswer
                    ? 'bg-green-500/35 border-green-400 text-white'
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
