import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FlagParade } from './FlagParade';

const CREDITS_TRANSITION = { duration: 0.25, ease: 'easeInOut' as const };
const CREDITS_PANEL_EXIT = {
  y: '100%' as const,
  transition: { duration: 0.25, ease: [1, 0, 1, 1] as const },
};

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export function CreditsModal({ open, onClose, onOpenPrivacy }: CreditsModalProps) {
  const phoneScreen =
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>('.phone-screen')
      : null;

  if (!phoneScreen) return null;

  return createPortal(
    <AnimatePresence mode="sync">
      {open && (
        <>
          <motion.div
            key="credits-backdrop"
            className="credits-backdrop absolute inset-0 z-50 m-0 p-0 overflow-hidden"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CREDITS_TRANSITION}
            onClick={onClose}
          />

          <motion.div
            key="credits-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            className="absolute bottom-0 left-0 right-0 z-[60] w-full max-w-full m-0 p-0 max-h-[85dvh] flex flex-col overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={CREDITS_PANEL_EXIT}
            transition={CREDITS_TRANSITION}
            style={{ willChange: 'transform' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full m-0 px-0 overflow-hidden overflow-x-hidden rounded-t-3xl rounded-b-none bg-[#1a0533] border-t-2 border-pink-400/40">
              <div className="px-6 pt-6 pb-8 overflow-y-auto overflow-x-hidden max-h-[85dvh]">
                <h2
                  id="credits-title"
                  className="text-2xl font-extrabold text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  QuizFlag
                </h2>
                <p className="text-center text-white/50 text-sm font-semibold mt-1">
                  Version 1.0.0
                </p>

                <div className="my-5 w-full max-w-full overflow-hidden rounded-xl">
                  <FlagParade compact />
                </div>

                <p className="text-center text-white/80 text-sm font-semibold">
                  Créé avec ❤️ par
                </p>
                <p className="text-center mt-2 text-2xl sm:text-3xl font-extrabold credits-name-gradient">
                  Skander Ben Aissa
                </p>
                <p className="text-center text-white/50 text-xs font-semibold mt-3">
                  Tous droits réservés © 2025
                </p>

                {onOpenPrivacy && (
                  <button
                    type="button"
                    className="block mx-auto mt-4 text-white/40 text-xs font-semibold underline underline-offset-2 hover:text-white/60 transition-colors"
                    onClick={onOpenPrivacy}
                  >
                    Politique de confidentialité
                  </button>
                )}

                <button
                  type="button"
                  className="btn-gradient-cyan w-full mt-6 min-h-[48px]"
                  onClick={onClose}
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    phoneScreen,
  );
}
