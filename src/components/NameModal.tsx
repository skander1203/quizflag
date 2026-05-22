import { useState } from 'react';
import { motion } from 'framer-motion';

interface NameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

export function NameModal({ open, onSubmit }: NameModalProps) {
  const [name, setName] = useState('');

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/90 backdrop-blur-sm rounded-[inherit]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-modal-title"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="glass-card w-full max-w-sm p-6 border-2 border-pink-400/50"
      >
        <h2 id="name-modal-title" className="text-xl font-bold text-white text-center mb-2">
          Bienvenue sur QuizFlag ! 🚩
        </h2>
        <p className="text-white/70 text-center text-sm mb-4">
          Comment doit-on vous appeler ?
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          placeholder="Votre prénom..."
          maxLength={24}
          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-cyan-400/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
          autoFocus
          aria-label="Votre nom"
        />
        <button
          type="button"
          className="btn-gradient-pink w-full"
          disabled={!name.trim()}
          onClick={() => onSubmit(name.trim())}
        >
          Commencer
        </button>
      </motion.div>
    </div>
  );
}
