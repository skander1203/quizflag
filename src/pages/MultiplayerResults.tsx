import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Confetti } from '../components/Confetti';
import { PlayerAvatar } from '../components/PlayerAvatar';
import {
  fetchPlayers,
  fetchRoom,
  removeSubscription,
  subscribeToGamePlayers,
  subscribeToGameRoom,
  type GamePlayer,
} from '../lib/multiplayerApi';
import {
  clearMultiplayerSession,
  getMultiplayerSession,
} from '../lib/multiplayerSession';

const PODIUM_HEIGHT_BY_PLACE = {
  1: 160,
  2: 120,
  3: 90,
} as const;

const PODIUM_COLORS = [
  'from-yellow-400 to-amber-600',
  'from-gray-300 to-gray-500',
  'from-amber-700 to-amber-900',
] as const;

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'] as const;

/** Left = 2nd, center = 1st, right = 3rd — same on every client */
const PODIUM_LAYOUT = [
  { place: 2 as const, rankIndex: 1 },
  { place: 1 as const, rankIndex: 0 },
  { place: 3 as const, rankIndex: 2 },
] as const;

function sortPlayersByScore(list: GamePlayer[]): GamePlayer[] {
  return [...list].sort((a, b) => {
    const scoreDiff = Number(b.score) - Number(a.score);
    if (scoreDiff !== 0) return scoreDiff;
    return a.player_name.localeCompare(b.player_name);
  });
}

export function MultiplayerResults() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const playerName = session?.playerName ?? '';

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const roomSubRef = useRef<RealtimeChannel | null>(null);
  const playersSubRef = useRef<RealtimeChannel | null>(null);

  const sortPlayers = useCallback((list: GamePlayer[]) => {
    setPlayers(sortPlayersByScore(list));
  }, []);

  useEffect(() => {
    if (!code) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    let cancelled = false;

    const init = async () => {
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

      sortPlayers(data);
      setLoading(false);

      roomSubRef.current = subscribeToGameRoom(code, (updated) => {
        if (updated.status === 'playing') {
          navigate(`/multiplayer/quiz/${code}`, { replace: true });
        } else if (updated.status === 'waiting') {
          navigate(`/multiplayer/waiting/${code}`, { replace: true });
        }
      });
      playersSubRef.current = subscribeToGamePlayers(code, sortPlayers);
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
  }, [code, navigate, sortPlayers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

  const rankedPlayers = useMemo(() => sortPlayersByScore(players), [players]);
  const top3 = rankedPlayers.slice(0, 3);
  const winner = rankedPlayers[0];
  const isWinner = winner?.player_name === playerName;

  const handleMenu = () => {
    clearMultiplayerSession();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-6 -mx-1 px-1">
      <Confetti active={isWinner} count={60} />

      <motion.div
        className="text-center shrink-0 pt-2 pb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-white">Partie terminée !</h1>
        {isWinner && (
          <p className="text-yellow-300 font-bold text-sm mt-1">🎉 Vous avez gagné !</p>
        )}
      </motion.div>

      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-2 mb-6 min-h-[220px]">
          {PODIUM_LAYOUT.map(({ place, rankIndex }) => {
            const player = top3[rankIndex];
            if (!player) {
              return <div key={`podium-empty-${place}`} className="w-24 sm:w-28" />;
            }

            const height = PODIUM_HEIGHT_BY_PLACE[place];
            const colorClass = PODIUM_COLORS[place - 1];
            const medal = PODIUM_MEDALS[place - 1];
            const isFirstPlace = place === 1;

            return (
              <div
                key={`podium-${place}-${player.id}`}
                className="flex flex-col items-center w-24 sm:w-28"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (3 - place) * 0.05 }}
                  className="text-center mb-2 flex flex-col items-center"
                >
                  {isFirstPlace && (
                    <span className="text-3xl block mb-1" aria-hidden="true">
                      👑
                    </span>
                  )}
                  <PlayerAvatar
                    name={player.player_name}
                    isGuest={player.player_name === 'Invité'}
                    size="md"
                    className="mb-1"
                  />
                  <p className="font-extrabold text-white text-sm truncate max-w-full px-1">
                    {player.player_name}
                  </p>
                  <p className="text-cyan-300 font-bold text-xs tabular-nums">
                    {player.score} pts
                  </p>
                </motion.div>

                <motion.div
                  className={`w-full rounded-t-2xl bg-gradient-to-t ${colorClass} border-2 border-white/20 flex items-start justify-center pt-3 shadow-lg`}
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{
                    delay: 0.5 + (3 - place) * 0.05,
                    type: 'spring',
                    stiffness: 200,
                    damping: 18,
                  }}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {medal}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-card p-4 mb-6">
        <h2 className="text-white/70 text-sm font-bold mb-3">Classement complet</h2>
        <ul className="space-y-2">
          {rankedPlayers.map((player, i) => (
            <motion.li
              key={player.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.06 }}
              className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                player.player_name === playerName
                  ? 'bg-cyan-500/20 border border-cyan-400/30'
                  : 'bg-white/5'
              }`}
            >
              <span className="text-white/50 w-6 shrink-0 font-bold text-sm">
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
      </div>

      <motion.button
        type="button"
        className="btn-gradient-pink w-full shrink-0"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={handleMenu}
      >
        Retour au menu
      </motion.button>
    </div>
  );
}
