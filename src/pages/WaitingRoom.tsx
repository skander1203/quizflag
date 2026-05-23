import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  fetchPlayers,
  fetchRoom,
  startGame,
  subscribeToRoom,
  unsubscribeFromRoom,
  type GamePlayer,
  type GameRoom,
} from '../lib/multiplayerApi';
import {
  clearMultiplayerSession,
  getMultiplayerSession,
} from '../lib/multiplayerSession';
import { PlayerAvatar } from '../components/PlayerAvatar';

export function WaitingRoom() {
  const { code: codeParam } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = getMultiplayerSession();
  const code = (codeParam ?? session?.roomCode ?? '').toUpperCase();
  const isHost = session?.isHost ?? false;

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const mpSession = getMultiplayerSession();
    if (!code || !mpSession) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    const init = async () => {
      const [roomData, playersData] = await Promise.all([
        fetchRoom(code),
        fetchPlayers(code),
      ]);

      console.log('[multiplayer] waiting room init', {
        code,
        status: roomData?.status,
        playerCount: playersData.length,
        players: playersData.map((p) => p.player_name),
        isHost,
      });

      if (!roomData) {
        navigate('/multiplayer', { replace: true });
        return;
      }

      setRoom(roomData);
      setPlayers(playersData);

      if (roomData.status === 'playing') {
        navigate(`/multiplayer/quiz/${code}`, { replace: true });
        return;
      }
      if (roomData.status === 'finished') {
        navigate(`/multiplayer/results/${code}`, { replace: true });
        return;
      }

      channelRef.current = subscribeToRoom(code, {
        onRoomUpdate: (updated) => {
          console.log('[multiplayer] waiting room status', {
            code,
            status: updated.status,
            playerCount: players.length,
          });
          setRoom(updated);
          if (updated.status === 'playing') {
            navigate(`/multiplayer/quiz/${code}`, { replace: true });
          } else if (updated.status === 'finished') {
            navigate(`/multiplayer/results/${code}`, { replace: true });
          }
        },
        onPlayersUpdate: (updatedPlayers) => {
          console.log('[multiplayer] waiting room players', {
            code,
            playerCount: updatedPlayers.length,
            players: updatedPlayers.map((p) => p.player_name),
          });
          setPlayers(updatedPlayers);
        },
      });
    };

    void init();

    return () => {
      if (channelRef.current) {
        unsubscribeFromRoom(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [code, navigate, isHost]);

  const handleStart = async () => {
    console.log('[multiplayer] start clicked', {
      code,
      isHost,
      playerCount: players.length,
      roomStatus: room?.status,
    });
    if (!isHost || players.length < 2) return;
    setStarting(true);
    setError(null);
    try {
      await startGame(code);
      navigate(`/multiplayer/quiz/${code}`, { replace: true });
    } catch (err) {
      console.log('[multiplayer] start failed', err);
      setError('Impossible de démarrer la partie.');
      setStarting(false);
    }
  };

  const handleLeave = () => {
    clearMultiplayerSession();
    navigate('/');
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 font-semibold">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-2">
        <button
          type="button"
          onClick={handleLeave}
          className="text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          ← Quitter
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center gap-6 pb-6 overflow-y-auto">
        <div className="text-center">
          <p className="text-white/60 text-sm font-semibold mb-2">Code de la partie</p>
          <motion.p
            className="text-5xl sm:text-6xl font-black tracking-[0.25em] bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {code}
          </motion.p>
          <p className="text-white/50 text-xs mt-2 font-semibold">
            Partagez ce code avec vos amis
          </p>
        </div>

        <div className="w-full glass-card p-4">
          <h2 className="text-white/70 text-sm font-bold mb-3">
            Joueurs ({players.length})
          </h2>
          <ul className="space-y-2">
            {players.map((player, i) => (
              <motion.li
                key={player.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5"
              >
                <PlayerAvatar
                  name={player.player_name}
                  isGuest={player.player_name === 'Invité'}
                  size="sm"
                />
                <span className="font-bold text-white flex-1 truncate">
                  {player.player_name}
                  {player.player_name === room.host_name && (
                    <span className="text-white/50 text-xs ml-2">(hôte)</span>
                  )}
                </span>
                {player.player_name === room.host_name && (
                  <span className="text-lg" aria-hidden="true">
                    👑
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="text-red-400 text-sm font-semibold" role="alert">
            {error}
          </p>
        )}

        {isHost ? (
          <motion.button
            type="button"
            className="btn-gradient-pink w-full mt-auto"
            whileTap={{ scale: 0.95 }}
            disabled={players.length < 2 || starting}
            onClick={() => void handleStart()}
          >
            {starting
              ? 'Démarrage…'
              : players.length < 2
                ? 'En attente de joueurs…'
                : 'Démarrer'}
          </motion.button>
        ) : (
          <p className="text-white/60 text-sm font-semibold text-center mt-auto animate-pulse">
            En attente que l&apos;hôte démarre la partie…
          </p>
        )}
      </div>
    </div>
  );
}
