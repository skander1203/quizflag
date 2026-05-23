import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type SplashScreenProps = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('out'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#1a0533' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'in' ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (phase === 'out') onComplete();
      }}
      aria-hidden={phase === 'out'}
    >
      <motion.h1
        className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        QuizFlag
      </motion.h1>
      <motion.span
        className="text-5xl"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        🏆
      </motion.span>
    </motion.div>
  );
}
