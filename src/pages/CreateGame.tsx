import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { DIFFICULTY_OPTIONS } from '../utils/difficultyConfig';
import { createRoom } from '../lib/multiplayerApi';
import { setMultiplayerSession } from '../lib/multiplayerSession';
import type { Difficulty } from '../types';

const QUESTION_COUNTS = [10, 20, 30, 50] as const;

export function CreateGame() {
  const navigate = useNavigate();
  const { state } = useQuiz();
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const hostName = state.player.name.trim();
    setCreating(true);
    setError(null);
    try {
      const room = await createRoom(hostName, difficulty, questionCount);
      setMultiplayerSession({
        roomCode: room.code,
        playerName: hostName,
        isHost: true,
      });
      navigate(`/multiplayer/waiting/${room.code}`);
    } catch {
      setError('Impossible de créer la partie. Réessayez.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-3">
        <button
          type="button"
          onClick={() => navigate('/multiplayer')}
          className="text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          ← Retour
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
          Créer une partie
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-5 pb-6 -mx-1 px-1 scrollbar-hidden">
        <section>
          <h2 className="text-white/70 text-sm font-bold mb-3 px-1">Difficulté</h2>
          <ul className="space-y-3">
            {DIFFICULTY_OPTIONS.map((opt, i) => (
              <li key={opt.id}>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDifficulty(opt.id)}
                  className={`difficulty-card w-full text-left rounded-3xl p-4 min-h-[100px] bg-gradient-to-br ${opt.gradientClass} border-2 relative overflow-hidden tap-target ${
                    difficulty === opt.id
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/25'
                  }`}
                  style={{ '--glow-color': opt.glowColor } as CSSProperties}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="text-3xl shrink-0" aria-hidden="true">
                      {opt.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-extrabold text-white">{opt.label}</h3>
                      <p className="text-white/85 text-xs font-semibold">{opt.description}</p>
                    </div>
                  </div>
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-white/70 text-sm font-bold mb-3 px-1">Nombre de questions</h2>
          <div className="grid grid-cols-4 gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`tap-target min-h-[52px] rounded-2xl font-extrabold text-lg border-2 transition-colors ${
                  questionCount === count
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-white text-white'
                    : 'glass-card border-white/25 text-white/80 hover:border-cyan-400/50'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm font-semibold text-center" role="alert">
            {error}
          </p>
        )}

        <motion.button
          type="button"
          className="btn-gradient-pink w-full"
          whileTap={{ scale: 0.95 }}
          disabled={creating}
          onClick={() => void handleCreate()}
        >
          {creating ? 'Création…' : 'Créer la partie'}
        </motion.button>
      </div>
    </div>
  );
}
