import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MultiplayerMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          ← Retour
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
          Multijoueur
        </h1>
        <p className="text-white/60 text-sm sm:text-base text-center mt-1">
          Jouez avec vos amis en temps réel
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 pb-6">
        <motion.button
          type="button"
          className="btn-gradient-pink text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          onClick={() => navigate('/multiplayer/create')}
        >
          🎮 Créer une partie
        </motion.button>

        <motion.button
          type="button"
          className="btn-gradient-cyan text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          onClick={() => navigate('/multiplayer/join')}
        >
          🔗 Rejoindre une partie
        </motion.button>
      </div>
    </div>
  );
}
