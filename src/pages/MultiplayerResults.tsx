import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
const PODIUM_MEDAL = { 1: '👑', 2: '🥈', 3: '🥉' } as const;

/** 2nd (left) · 1st (center) · 3rd (right) — identical on every client */
const PODIUM_SLOTS = [
  { place: 2 as const, rankIndex: 1 },
  { place: 1 as const, rankIndex: 0 },
  { place: 3 as const, rankIndex: 2 },
] as const;

function sortByScore(list: GamePlayer[]): GamePlayer[] {
  return [...list].sort((a, b) => {
    const diff = Number(b.score) - Number(a.score);
    if (diff !== 0) return diff;
    return a.player_name.localeCompare(b.player_name);
  });
}

export function MultiplayerResults() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const playerName = session?.playerName ?? '';
  const isHost = session?.isHost ?? false;
  const { playVictory } = useSounds();

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);

  const roomSubRef = useRef<RealtimeChannel | null>(null);
  const playersSubRef = useRef<RealtimeChannel | null>(null);
  const victoryPlayedRef = useRef(false);

  const rankedPlayers = useMemo(() => sortByScore(players), [players]);
  const top3 = rankedPlayers.slice(0, 3);
  const winner = rankedPlayers[0];
  const isWinner = winner?.player_name === playerName;

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
    if (loading || !isWinner || victoryPlayedRef.current) return;
    victoryPlayedRef.current = true;
    playVictory();
  }, [loading, isWinner, playVictory]);

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

  if (error) {
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

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-6 -mx-1 px-1">
      <Confetti active={isWinner} count={60} />

      <motion.header
        className="text-center shrink-0 pt-2 pb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-white">Partie terminée !</h1>
        {isWinner && (
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
                  transition={{ delay: 0.2 + (3 - place) * 0.08 }}
                >
                  {isFirst && (
                    <span className="text-2xl sm:text-3xl mb-1" aria-hidden="true">
                      {PODIUM_MEDAL[1]}
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
                  className="w-full rounded-t-xl sm:rounded-t-2xl border-2 border-white/25 flex items-start justify-center pt-2 sm:pt-3 shadow-lg"
                  style={{ backgroundColor: blockColor }}
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{
                    delay: 0.35 + (3 - place) * 0.08,
                    type: 'spring',
                    stiffness: 220,
                    damping: 20,
                  }}
                >
                  {!isFirst && (
                    <span className="text-xl sm:text-2xl" aria-hidden="true">
                      {PODIUM_MEDAL[place]}
                    </span>
                  )}
                </motion.div>
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
              transition={{ delay: 0.6 + i * 0.05 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            disabled={replaying}
            onClick={() => void handleReplay()}
          >
            {replaying ? 'Relance…' : '🔄 Rejouer une partie'}
          </motion.button>
        )}

        <motion.button
          type="button"
          className="btn-gradient-pink w-full"
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isHost ? 1 : 0.9 }}
          onClick={handleMenu}
        >
          🏠 Retour au menu
        </motion.button>
      </div>
    </div>
  );
}
