import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { truncateUsername } from '../utils/username';
import { avatarGradientClass } from '../utils/avatarColor';

export function UserMenu() {
  const navigate = useNavigate();
  const { username, avatarUrl, isGuest, signOut, uploadAvatar, leaveGuestForAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = truncateUsername(username);
  const initial = username.charAt(0).toUpperCase() || '?';
  const showPhoto = Boolean(avatarUrl) && !imgError && !isGuest;

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

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
        <span
          className={`relative z-0 w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20 flex items-center justify-center ${
            isGuest
              ? 'bg-white/15'
              : showPhoto
                ? ''
                : `bg-gradient-to-br ${avatarGradientClass(username)}`
          }`}
          aria-hidden="true"
        >
          {isGuest ? (
            <User className="w-[55%] h-[55%] text-white/70" strokeWidth={2.5} />
          ) : showPhoto ? (
            <img
              src={avatarUrl!}
              alt=""
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-[50%]"
            />
          ) : (
            <span className="font-extrabold text-white leading-none">{initial}</span>
          )}
        </span>
        <span
          className="text-white text-sm font-bold max-w-[100px]"
          title={username.length > 10 ? username : undefined}
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
