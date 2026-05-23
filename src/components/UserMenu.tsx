import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PlayerAvatar } from './PlayerAvatar';
import { HEADER_USERNAME_MAX, truncateUsername } from '../utils/username';

export function UserMenu() {
  const navigate = useNavigate();
  const { username, avatarUrl, isGuest, signOut, uploadAvatar, leaveGuestForAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = truncateUsername(username);

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

  const handleGuestAuth = (tab: 'login' | 'register') => {
    setOpen(false);
    leaveGuestForAuth(tab);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  return (
    <div ref={containerRef} className="absolute top-0 right-0 z-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 glass-card border border-white/25 rounded-full pl-1 pr-3 py-1 tap-target hover:border-pink-400/50 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <PlayerAvatar
          name={username}
          avatarUrl={avatarUrl}
          size="sm"
          isGuest={isGuest}
        />
        <span
          className="text-white text-sm font-bold max-w-[72px] truncate"
          title={username.length > HEADER_USERNAME_MAX ? username : undefined}
        >
          {displayName}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 z-30 border border-white/25 rounded-2xl overflow-hidden shadow-lg ${
              isGuest ? 'w-52 p-3 space-y-2' : 'w-48'
            }`}
            style={{ backgroundColor: '#2d1b4e' }}
            role="menu"
          >
            {isGuest ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleGuestAuth('register')}
                  className="btn-gradient-pink w-full text-sm min-h-[44px] px-4 py-2.5"
                >
                  Créer un compte
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleGuestAuth('login')}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm font-extrabold text-white rounded-full border-2 border-white/35 hover:bg-white/10 transition-colors"
                >
                  Se connecter
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleChangePhoto}
                  disabled={uploading}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Téléversement…' : 'Changer la photo'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate('/stats');
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                >
                  Mes Stats
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
