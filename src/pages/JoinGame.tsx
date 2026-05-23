import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { joinRoom } from '../lib/multiplayerApi';
import { setMultiplayerSession } from '../lib/multiplayerSession';

export function JoinGame() {
  const navigate = useNavigate();
  const { state } = useQuiz();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Code invalide');
      return;
    }

    const playerName = state.player.name.trim();
    setJoining(true);
    setError(null);
    try {
      const room = await joinRoom(trimmed, playerName);
      setMultiplayerSession({
        roomCode: room.code,
        playerName,
        isHost: false,
      });
      navigate(`/multiplayer/waiting/${room.code}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CODE') {
        setError('Code invalide');
      } else if (err instanceof Error && err.message === 'ROOM_FULL') {
        setError('Cette partie est complète');
      } else {
        setError('Impossible de rejoindre la partie.');
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-4">
        <button
          type="button"
          onClick={() => navigate('/multiplayer')}
          className="text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          ← Retour
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
          Rejoindre une partie
        </h1>
        <p className="text-white/60 text-sm text-center mt-1">
          Entrez le code à 6 lettres
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5 pb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6));
            setError(null);
          }}
          placeholder="ABCDEF"
          maxLength={6}
          className="w-full text-center text-3xl font-extrabold tracking-[0.3em] uppercase glass-card border-2 border-white/25 rounded-2xl py-5 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60"
          aria-label="Code de la partie"
          autoComplete="off"
          autoCapitalize="characters"
        />

        {error && (
          <p className="text-red-400 text-sm font-semibold text-center" role="alert">
            {error}
          </p>
        )}

        <motion.button
          type="button"
          className="btn-gradient-cyan"
          whileTap={{ scale: 0.95 }}
          disabled={joining || code.length !== 6}
          onClick={() => void handleJoin()}
        >
          {joining ? 'Connexion…' : 'Rejoindre'}
        </motion.button>
      </div>
    </div>
  );
}
