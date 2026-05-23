import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Confetti } from '../components/Confetti';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useSounds } from '../hooks/useSounds';
import {
  fetchPlayers,
  fetchRoom,
  removeSubscription,
  replayGame,
  subscribeToGamePlayers,
  subscribeToGameRoom,
  type GamePlayer,
} from '../lib/multiplayerApi';
import {
  clearMultiplayerSession,
  getMultiplayerSession,
} from '../lib/multiplayerSession';

const PODIUM_HEIGHT = { 1: 160, 2: 120, 3: 90 } as const;
const PODIUM_COLOR = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' } as const;

const PODIUM_SLOTS = [
  { place: 2 as const, rankIndex: 1 },
  { place: 1 as const, rankIndex: 0 },
  { place: 3 as const, rankIndex: 2 },
] as const;

type RevealPhase =
  | 'intro'
  | 'third-suspense'
  | 'third-reveal'
  | 'second-suspense'
  | 'second-reveal'
  | 'first-suspense'
  | 'first-reveal'
  | 'complete';

interface RevealStep {
  phase: RevealPhase;
  durationMs: number;
  onEnter?: () => void;
}

function sortByScore(list: GamePlayer[]): GamePlayer[] {
  return [...list].sort((a, b) => {
    const diff = Number(b.score) - Number(a.score);
    if (diff !== 0) return diff;
    return a.player_name.localeCompare(b.player_name);
  });
}

function buildRevealSteps(
  top3: GamePlayer[],
  onDrumRoll: () => void,
  onFirstReveal: () => void,
): RevealStep[] {
  const steps: RevealStep[] = [{ phase: 'intro', durationMs: 1500 }];

  if (top3[2]) {
    steps.push({
      phase: 'third-suspense',
      durationMs: 1000,
      onEnter: onDrumRoll,
    });
    steps.push({ phase: 'third-reveal', durationMs: 2000 });
  }
  if (top3[1]) {
    steps.push({
      phase: 'second-suspense',
      durationMs: 1000,
      onEnter: onDrumRoll,
    });
    steps.push({ phase: 'second-reveal', durationMs: 2000 });
  }
  if (top3[0]) {
    steps.push({
      phase: 'first-suspense',
      durationMs: 1500,
      onEnter: onDrumRoll,
    });
    steps.push({
      phase: 'first-reveal',
      durationMs: 2000,
      onEnter: onFirstReveal,
    });
  }

  steps.push({ phase: 'complete', durationMs: 0 });
  return steps;
}

function RevealPlayerCard({
  player,
  place,
  dramatic,
}: {
  player: GamePlayer;
  place: 1 | 2 | 3;
  dramatic?: boolean;
}) {
  const color = PODIUM_COLOR[place];
  const label = place === 1 ? '1ère place' : place === 2 ? '2ème place' : '3ème place';

  return (
    <motion.div
      key={`reveal-${place}-${player.id}`}
      initial={dramatic ? { opacity: 0, scale: 0, y: 40 } : { opacity: 0, y: 50 }}
      animate={
        dramatic
          ? { opacity: 1, scale: [0, 1.2, 1], y: 0 }
          : { opacity: 1, y: 0 }
      }
      transition={
        dramatic
          ? { duration: 0.65, times: [0, 0.65, 1], ease: 'easeOut' }
          : { duration: 0.5, ease: 'easeOut' }
      }
      className="flex flex-col items-center text-center px-4 w-full max-w-xs"
    >
      {dramatic && (
        <motion.span
          className="text-4xl sm:text-5xl mb-3 block"
          initial={{ scale: 0, y: -24 }}
          animate={{ scale: [0, 1.35, 1], y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 14, delay: 0.15 }}
          aria-hidden="true"
        >
          👑
        </motion.span>
      )}
      <PlayerAvatar
        name={player.player_name}
        isGuest={player.player_name === 'Invité'}
        size="lg"
        className="mb-3 ring-2 ring-white/30"
      />
      <p
        className="text-xs font-bold uppercase tracking-widest mb-1"
        style={{ color }}
      >
        {label}
      </p>
      <p
        className="text-2xl sm:text-3xl font-black text-white mb-1 truncate max-w-full"
        style={
          dramatic
            ? {
                color,
                textShadow: `0 0 24px ${color}99, 0 0 48px ${color}55`,
              }
            : undefined
        }
      >
        {player.player_name}
      </p>
      <p
        className="text-lg font-extrabold tabular-nums"
        style={{ color }}
      >
        {player.score} pts
      </p>
    </motion.div>
  );
}

export function MultiplayerResults() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const playerName = session?.playerName ?? '';
  const isHost = session?.isHost ?? false;
  const { playVictory, playDrumRollSuspense } = useSounds();

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('intro');
  const [showConfetti, setShowConfetti] = useState(false);

  const roomSubRef = useRef<RealtimeChannel | null>(null);
  const playersSubRef = useRef<RealtimeChannel | null>(null);
  const revealStartedRef = useRef(false);

  const rankedPlayers = useMemo(() => sortByScore(players), [players]);
  const top3 = rankedPlayers.slice(0, 3);
  const isRevealComplete = revealPhase === 'complete';

  const applyPlayers = useCallback((list: GamePlayer[]) => {
    setPlayers(sortByScore(list));
  }, []);

  useEffect(() => {
    if (!code) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const room = await fetchRoom(code);
        if (cancelled) return;

        if (!room) {
          navigate('/multiplayer', { replace: true });
          return;
        }

        if (room.status === 'playing') {
          navigate(`/multiplayer/quiz/${code}`, { replace: true });
          return;
        }
        if (room.status === 'waiting') {
          navigate(`/multiplayer/waiting/${code}`, { replace: true });
          return;
        }

        const data = await fetchPlayers(code);
        if (cancelled) return;

        applyPlayers(data);
        setLoading(false);

        roomSubRef.current = subscribeToGameRoom(code, (updated) => {
          if (updated.status === 'playing') {
            navigate(`/multiplayer/quiz/${code}`, { replace: true });
          } else if (updated.status === 'waiting') {
            navigate(`/multiplayer/waiting/${code}`, { replace: true });
          }
        });
        playersSubRef.current = subscribeToGamePlayers(code, applyPlayers);
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les résultats.');
          setLoading(false);
        }
      }
    };

    void load();

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
  }, [code, navigate, applyPlayers]);

  useEffect(() => {
    if (loading || revealStartedRef.current) return;
    revealStartedRef.current = true;

    const snapshot = sortByScore(players).slice(0, 3);
    const timeouts: number[] = [];

    const onDrumRoll = () => playDrumRollSuspense(1);
    const onFirstReveal = () => {
      setShowConfetti(true);
      playVictory();
    };

    const steps = buildRevealSteps(snapshot, onDrumRoll, onFirstReveal);

    const runStep = (index: number) => {
      const step = steps[index];
      setRevealPhase(step.phase);
      step.onEnter?.();

      if (step.durationMs <= 0 || index >= steps.length - 1) return;

      timeouts.push(
        window.setTimeout(() => {
          runStep(index + 1);
        }, step.durationMs),
      );
    };

    runStep(0);

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [loading, players, playDrumRollSuspense, playVictory]);

  const handleMenu = () => {
    clearMultiplayerSession();
    navigate('/');
  };

  const handleReplay = async () => {
    if (!isHost || replaying) return;
    setReplaying(true);
    setError(null);
    try {
      await replayGame(code);
    } catch {
      setError('Impossible de relancer la partie.');
      setReplaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

  if (error && !isRevealComplete && rankedPlayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-red-400 font-semibold text-center" role="alert">
          {error}
        </p>
        <button type="button" className="btn-gradient-pink" onClick={handleMenu}>
          Retour au menu
        </button>
      </div>
    );
  }

  const suspenseText =
    revealPhase === 'third-suspense'
      ? '3ème place…'
      : revealPhase === 'second-suspense'
        ? '2ème place…'
        : revealPhase === 'first-suspense'
          ? 'Et le grand gagnant est…'
          : null;

  const revealPlayer =
    revealPhase === 'third-reveal'
      ? top3[2]
      : revealPhase === 'second-reveal'
        ? top3[1]
        : revealPhase === 'first-reveal'
          ? top3[0]
          : null;

  const revealPlace: 1 | 2 | 3 | null =
    revealPhase === 'third-reveal'
      ? 3
      : revealPhase === 'second-reveal'
        ? 2
        : revealPhase === 'first-reveal'
          ? 1
          : null;

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-y-auto pb-6 -mx-1 px-1">
      <Confetti active={showConfetti} count={60} />

      <AnimatePresence>
        {!isRevealComplete && (
          <motion.div
            key="reveal-overlay"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0220]/95 px-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {revealPhase === 'intro' && (
                <motion.h1
                  key="intro"
                  className="text-3xl sm:text-4xl font-black text-white text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  🏆 Résultats
                </motion.h1>
              )}

              {suspenseText && (
                <motion.p
                  key={suspenseText}
                  className="text-xl sm:text-2xl font-extrabold text-white/80 text-center animate-pulse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  {suspenseText}
                </motion.p>
              )}

              {revealPlayer && revealPlace && (
                <RevealPlayerCard
                  key={`${revealPhase}-${revealPlayer.id}`}
                  player={revealPlayer}
                  place={revealPlace}
                  dramatic={revealPlace === 1}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRevealComplete && (
          <motion.div
            key="results-content"
            className="flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.header
              className="text-center shrink-0 pt-2 pb-4"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-extrabold text-white">Partie terminée !</h1>
              {top3[0]?.player_name === playerName && (
                <p className="text-yellow-300 font-bold text-sm mt-1">🎉 Vous avez gagné !</p>
              )}
            </motion.header>

            {top3.length > 0 && (
              <section
                className="flex items-end justify-center gap-2 sm:gap-3 px-2 mb-6 min-h-[240px]"
                aria-label="Podium"
              >
                {PODIUM_SLOTS.map(({ place, rankIndex }) => {
                  const player = top3[rankIndex];
                  const height = PODIUM_HEIGHT[place];
                  const blockColor = PODIUM_COLOR[place];
                  const isFirst = place === 1;

                  if (!player) {
                    return (
                      <div
                        key={`empty-${place}`}
                        className="w-[72px] sm:w-24"
                        style={{ height }}
                        aria-hidden="true"
                      />
                    );
                  }

                  return (
                    <div
                      key={player.id}
                      className="flex flex-col items-center w-[72px] sm:w-28"
                    >
                      <motion.div
                        className="flex flex-col items-center text-center mb-2 w-full"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + (3 - place) * 0.08 }}
                      >
                        {isFirst && (
                          <span className="text-2xl sm:text-3xl mb-1" aria-hidden="true">
                            👑
                          </span>
                        )}
                        <PlayerAvatar
                          name={player.player_name}
                          isGuest={player.player_name === 'Invité'}
                          size="md"
                          className="mb-1 ring-2 ring-white/20"
                        />
                        <p className="font-extrabold text-white text-xs sm:text-sm truncate w-full px-0.5">
                          {player.player_name}
                        </p>
                        <p className="text-cyan-300 font-bold text-[10px] sm:text-xs tabular-nums">
                          {player.score} pts
                        </p>
                      </motion.div>

                      <motion.div
                        className="w-full rounded-t-xl sm:rounded-t-2xl border-2 border-white/25 shadow-lg"
                        style={{ backgroundColor: blockColor }}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{
                          delay: 0.25 + (3 - place) * 0.08,
                          type: 'spring',
                          stiffness: 220,
                          damping: 20,
                        }}
                      />
                    </div>
                  );
                })}
              </section>
            )}

            <section className="glass-card p-4 mb-6">
              <h2 className="text-white/70 text-sm font-bold mb-3">Classement complet</h2>
              <ul className="space-y-2">
                {rankedPlayers.map((player, i) => (
                  <motion.li
                    key={player.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                      player.player_name === playerName
                        ? 'bg-cyan-500/20 border border-cyan-400/30'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className="text-white/50 w-6 shrink-0 font-bold text-sm tabular-nums">
                      {i + 1}.
                    </span>
                    <PlayerAvatar
                      name={player.player_name}
                      isGuest={player.player_name === 'Invité'}
                      size="xs"
                    />
                    <span className="font-bold text-white text-sm flex-1 truncate">
                      {player.player_name}
                    </span>
                    <span className="font-extrabold text-cyan-300 tabular-nums text-sm shrink-0">
                      {player.score} pts
                    </span>
                  </motion.li>
                ))}
              </ul>
            </section>

            {error && (
              <p className="text-red-400 text-sm font-semibold text-center mb-4" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 shrink-0">
              {isHost && (
                <motion.button
                  type="button"
                  className="btn-gradient-cyan w-full"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  disabled={replaying}
                  onClick={() => void handleReplay()}
                >
                  {replaying ? 'Relance…' : 'Rejouer une partie'}
                </motion.button>
              )}

              <motion.button
                type="button"
                className="btn-gradient-pink w-full"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isHost ? 0.6 : 0.5 }}
                onClick={handleMenu}
              >
                Retour au menu
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
