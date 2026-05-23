import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function UserMenu() {
  const { username, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = username.charAt(0).toUpperCase() || '?';

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div ref={containerRef} className="absolute top-0 right-0 z-20">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 glass-card border border-white/25 rounded-full pl-1 pr-3 py-1 tap-target hover:border-pink-400/50 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-extrabold text-white shrink-0"
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="text-white text-sm font-bold max-w-[100px] truncate">{username}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 glass-card border border-white/25 rounded-2xl overflow-hidden shadow-lg"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
            >
              Se déconnecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
