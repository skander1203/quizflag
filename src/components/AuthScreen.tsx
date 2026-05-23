import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

type Tab = 'login' | 'register';

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white/10 border border-cyan-400/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400';

export function AuthScreen() {
  const { signUp, signIn } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (authError) {
      setError(authError);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Veuillez entrer un nom d\'utilisateur.');
      return;
    }
    if (!registerEmail.trim()) {
      setError('Veuillez entrer une adresse email.');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      registerEmail.trim(),
      registerPassword,
      username.trim(),
    );
    setLoading(false);

    if (authError) {
      setError(authError);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 justify-center px-1">
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="text-center shrink-0 mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <span>QuizFlag</span>
          <span aria-hidden="true">🏆</span>
        </h1>
        <p className="text-white/70 mt-1 text-sm sm:text-base font-semibold">
          Devinez les drapeaux du monde !
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.05 }}
        className="glass-card w-full max-w-sm mx-auto p-6 border-2 border-pink-400/50"
      >
        <div className="flex rounded-full bg-white/10 p-1 mb-5 relative">
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-md"
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              width: 'calc(50% - 4px)',
              left: tab === 'login' ? '4px' : 'calc(50%)',
            }}
          />
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-extrabold rounded-full transition-colors ${
              tab === 'login' ? 'text-white' : 'text-white/60'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-extrabold rounded-full transition-colors ${
              tab === 'register' ? 'text-white' : 'text-white/60'
            }`}
          >
            Inscription
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={(e) => void handleLogin(e)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm font-semibold text-center" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-gradient-pink w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Se connecter'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={(e) => void handleRegister(e)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="register-username" className="sr-only">
                  Nom d'utilisateur
                </label>
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  maxLength={24}
                  autoComplete="username"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="register-email" className="sr-only">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="register-password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Mot de passe (min. 6 caractères)"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="register-confirm" className="sr-only">
                  Confirmer le mot de passe
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm font-semibold text-center" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-gradient-pink w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Spinner /> : "S'inscrire"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
