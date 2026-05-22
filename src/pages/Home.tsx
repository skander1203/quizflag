import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { FlagParade } from '../components/FlagParade';
import { NameModal } from '../components/NameModal';
import { CreditsModal } from '../components/CreditsModal';
import { getRank } from '../utils/ranks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_PLAYER } from '../context/QuizContext';
import type { PlayerData } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [, setStoredPlayer] = useLocalStorage<PlayerData>(STORAGE_PLAYER, {
    name: '',
    totalCorrect: 0,
  });
  const rank = getRank(state.player.totalCorrect);

  const play = () => {
    if (!state.player.name.trim()) {
      dispatch({ type: 'REQUEST_NAME' });
      return;
    }
    navigate('/difficulty');
  };

  const handleName = (name: string) => {
    setStoredPlayer({ name, totalCorrect: state.player.totalCorrect });
    dispatch({ type: 'SET_PLAYER_NAME', payload: name });
    navigate('/difficulty');
  };

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      <NameModal open={state.showNameModal} onSubmit={handleName} />
      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />

      <button
        type="button"
        className="absolute bottom-4 right-4 z-10 w-7 h-7 rounded-full glass-card border border-white/30 flex items-center justify-center text-xs shadow-md hover:border-cyan-400/50 transition-colors"
        aria-label="Crédits"
        onClick={() => setCreditsOpen(true)}
      >
        <span className="leading-none" aria-hidden="true">
          ℹ️
        </span>
      </button>

      <div className="flex flex-col h-full min-h-0 gap-4 sm:gap-5 pb-16">
        <motion.header
          className="text-center shrink-0 pt-2 sm:pt-4"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <span>QuizFlag</span>
            <span aria-hidden="true">🏆</span>
          </h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base font-semibold px-2">
            Devinez les drapeaux du monde !
          </p>
        </motion.header>

        {/* -mx-4 sm:-mx-5 cancels Layout's px-4 sm:px-5 so the parade is edge-to-edge */}
        <FlagParade bleedClass="-mx-4 sm:-mx-5" />

        <motion.div
          className="glass-card flex items-center gap-3 px-4 py-3 mx-auto w-full shrink-0"
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-3xl sm:text-4xl" aria-hidden="true">
            {rank.emoji}
          </span>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs sm:text-sm text-white/50 font-semibold">Votre rang</p>
            <p className="font-extrabold text-white text-sm sm:text-base truncate">
              {rank.label}
            </p>
          </div>
          <span className="text-white/50 text-xs sm:text-sm font-bold shrink-0">
            {state.player.totalCorrect} ✓
          </span>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center gap-4 shrink-0 py-2">
          <motion.button
            type="button"
            className="btn-gradient-pink"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            onClick={play}
          >
            Jouer
          </motion.button>
        </div>

        <Link
          to="/leaderboard"
          className="text-center text-cyan-300 font-bold text-sm sm:text-base py-3 tap-target shrink-0 hover:text-cyan-200"
        >
          Classement
        </Link>
      </div>
    </div>
  );
}
