import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useSounds } from '../hooks/useSounds';
import { DIFFICULTY_OPTIONS } from '../utils/difficultyConfig';
import { QUESTION_COUNT_OPTIONS, type QuestionCount } from '../context/QuizContext';
import type { Difficulty } from '../types';

export function DifficultySelect() {
  const navigate = useNavigate();
  const { dispatch } = useQuiz();
  const { withClick } = useSounds();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);

  const startGame = () => {
    if (!selectedDifficulty) return;
    dispatch({ type: 'SET_DIFFICULTY', payload: selectedDifficulty });
    dispatch({ type: 'SET_QUESTION_COUNT', payload: questionCount });
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
            ? 'Choisissez le nombre de questions'
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
              key="question-count"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="pt-2"
            >
              <h2 className="text-lg font-extrabold text-white text-center mb-3">
                Nombre de questions
              </h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {QUESTION_COUNT_OPTIONS.map((count) => {
                  const isSelected = questionCount === count;

                  return (
                    <motion.button
                      key={count}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={withClick(() => setQuestionCount(count))}
                      className={`rounded-2xl py-3 text-base font-extrabold text-white tap-target transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-transparent shadow-md shadow-pink-500/25'
                          : 'bg-transparent border-2 border-white/25 hover:border-white/40'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {count}
                    </motion.button>
                  );
                })}
              </div>
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
