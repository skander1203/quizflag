import { motion } from 'framer-motion';

const COLORS = ['#FF6B9D', '#00D4FF', '#FFE66D', '#A855F7', '#22D3EE', '#F472B6'];

interface ConfettiProps {
  active: boolean;
  count?: number;
}

export function Confetti({ active, count = 40 }: ConfettiProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const size = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: -20,
              width: size,
              height: size * 1.4,
              backgroundColor: color,
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
              x: (Math.random() - 0.5) * 200,
            }}
            transition={{
              duration: 2 + Math.random(),
              delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}
    </div>
  );
}
