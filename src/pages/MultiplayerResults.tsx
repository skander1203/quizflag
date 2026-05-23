import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Confetti } from '../components/Confetti';
import { PlayerAvatar } from '../components/PlayerAvatar';
import {
  fetchPlayers,
  fetchRoom,
  type GamePlayer,
} from '../lib/multiplayerApi';
import {
  clearMultiplayerSession,
  getMultiplayerSession,
} from '../lib/multiplayerSession';

const PODIUM_HEIGHTS = [128, 176, 96] as const;
const PODIUM_COLORS = [
  'from-yellow-400 to-amber-600',
  'from-gray-300 to-gray-500',
  'from-amber-700 to-amber-900',
] as const;
const PODIUM_ORDER = [1, 0, 2] as const;

export function MultiplayerResults() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const playerName = session?.playerName ?? '';

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    const load = async () => {
      const room = await fetchRoom(code);
      if (!room) {
        navigate('/multiplayer', { replace: true });
        return;
      }
      const data = await fetchPlayers(code);
      setPlayers([...data].sort((a, b) => b.score - a.score));
      setLoading(false);
    };

    void load();
  }, [code, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

  const top3 = players.slice(0, 3);
  const winner = players[0];
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
          {PODIUM_ORDER.map((rankIndex) => {
            const player = top3[rankIndex];
            if (!player) return <div key={rankIndex} className="w-24" />;

            const isFirst = rankIndex === 0;
            const medal = rankIndex === 0 ? '🥇' : rankIndex === 1 ? '🥈' : '🥉';

            return (
              <div
                key={player.id}
                className="flex flex-col items-center w-24 sm:w-28"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + rankIndex * 0.15 }}
                  className="text-center mb-2 flex flex-col items-center"
                >
                  {isFirst && (
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
                  className={`w-full rounded-t-2xl bg-gradient-to-t ${PODIUM_COLORS[rankIndex]} border-2 border-white/20 flex items-start justify-center pt-3 shadow-lg`}
                  initial={{ height: 0 }}
                  animate={{ height: PODIUM_HEIGHTS[rankIndex] }}
                  transition={{
                    delay: 0.5 + rankIndex * 0.2,
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
          {players.map((player, i) => (
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
