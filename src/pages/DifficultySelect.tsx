import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useSounds } from '../hooks/useSounds';
import { DIFFICULTY_OPTIONS } from '../utils/difficultyConfig';
import type { Difficulty } from '../types';

export function DifficultySelect() {
  const navigate = useNavigate();
  const { dispatch } = useQuiz();
  const { withClick } = useSounds();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const startGame = () => {
    if (!selectedDifficulty) return;
    dispatch({ type: 'SET_DIFFICULTY', payload: selectedDifficulty });
    dispatch({ type: 'START_GAME' });
    navigate('/quiz');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-3">
        <button
          type="button"
          onClick={withClick(() => navigate('/'))}
          className="text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          ← Retour
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
          Choisir la difficulté
        </h1>
        <p className="text-white/60 text-sm sm:text-base text-center mt-1">
          {selectedDifficulty
            ? '10 questions — prêt à jouer ?'
            : 'Touchez une carte pour continuer'}
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pb-6 -mx-1 px-1 scrollbar-hidden">
        {DIFFICULTY_OPTIONS.map((opt, i) => {
          const isSelected = selectedDifficulty === opt.id;

          return (
            <li key={opt.id}>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.97 }}
                onClick={withClick(() => setSelectedDifficulty(opt.id))}
                className={`difficulty-card w-full text-left rounded-3xl p-5 min-h-[120px] bg-gradient-to-br ${opt.gradientClass} border-2 relative overflow-hidden tap-target ${
                  isSelected ? 'border-white/80 ring-2 ring-white/40' : 'border-white/25'
                }`}
                style={{ '--glow-color': opt.glowColor } as CSSProperties}
                aria-label={`${opt.label} — ${opt.description}, ${opt.countryCount} pays`}
                aria-pressed={isSelected}
              >
                <div className="relative z-10 flex items-start gap-4">
                  <span className="text-4xl shrink-0" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-sm">
                      {opt.label}
                    </h2>
                    <p className="text-white/90 text-sm font-semibold mt-1">
                      {opt.description}
                    </p>
                    <p className="text-white/75 text-xs font-bold mt-2">
                      {opt.countryCount} pays
                    </p>
                  </div>
                  <span className="text-white/80 text-xl font-bold shrink-0">›</span>
                </div>
              </motion.button>
            </li>
          );
        })}

        <AnimatePresence>
          {selectedDifficulty && (
            <motion.li
              key="start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="pt-2"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={withClick(startGame)}
                className="btn-gradient-pink w-full"
              >
                Commencer
              </motion.button>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
