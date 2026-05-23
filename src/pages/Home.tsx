import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlagParade } from '../components/FlagParade';
import { CreditsModal } from '../components/CreditsModal';
import { UserMenu } from '../components/UserMenu';
import { useSounds } from '../hooks/useSounds';
import { useState } from 'react';

export function Home() {
  const navigate = useNavigate();
  const { enabled: soundsEnabled, toggleEnabled, playClick, withClick } = useSounds();
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      <CreditsModal
        open={creditsOpen}
        onClose={() => setCreditsOpen(false)}
        onOpenPrivacy={withClick(() => {
          setCreditsOpen(false);
          navigate('/privacy');
        })}
      />

      <button
        type="button"
        className="absolute top-2 left-4 z-10 w-7 h-7 rounded-full glass-card border border-white/30 flex items-center justify-center text-xs shadow-md hover:border-cyan-400/50 transition-colors"
        aria-label={soundsEnabled ? 'Couper le son' : 'Activer le son'}
        onClick={toggleEnabled}
      >
        <span className="leading-none" aria-hidden="true">
          {soundsEnabled ? '🔊' : '🔇'}
        </span>
      </button>

      <button
        type="button"
        className="absolute bottom-4 right-4 z-10 w-7 h-7 rounded-full glass-card border border-white/30 flex items-center justify-center text-xs shadow-md hover:border-cyan-400/50 transition-colors"
        aria-label="Crédits"
        onClick={withClick(() => setCreditsOpen(true))}
      >
        <span className="leading-none" aria-hidden="true">
          ℹ️
        </span>
      </button>

      <div className="flex flex-col h-full min-h-0 gap-4 sm:gap-5 pb-16">
        <div className="relative shrink-0 pt-2 sm:pt-4">
          <UserMenu />
          <motion.header
            className="text-center"
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
        </div>

        <FlagParade bleedClass="-mx-4 sm:-mx-5" />

        <div className="flex-1 flex flex-col justify-center gap-4 shrink-0 py-2">
          <motion.button
            type="button"
            className="btn-gradient-pink"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            onClick={withClick(() => navigate('/difficulty'))}
          >
            Jouer
          </motion.button>

          <motion.button
            type="button"
            className="btn-gradient-cyan"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            onClick={withClick(() => navigate('/multiplayer'))}
          >
            Multijoueur
          </motion.button>
        </div>

        <Link
          to="/leaderboard"
          onClick={() => playClick()}
          className="text-center text-cyan-300 font-bold text-sm sm:text-base py-3 tap-target shrink-0 hover:text-cyan-200"
        >
          Classement
        </Link>
      </div>
    </div>
  );
}
