import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Tab = 'login' | 'register';
type LoginView = 'form' | 'forgot';

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

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export function AuthScreen() {
  const { signUp, signIn, resetPassword, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loginView, setLoginView] = useState<LoginView>('form');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setLoginView('form');
    clearMessages();
  };

  const openForgotPassword = () => {
    setLoginView('forgot');
    setForgotEmail(loginEmail);
    clearMessages();
  };

  const backToLogin = () => {
    setLoginView('form');
    clearMessages();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!forgotEmail.trim()) {
      setError('Veuillez entrer une adresse email.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(forgotEmail.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess('Un lien de réinitialisation a été envoyé à votre email');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

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
            loginView === 'forgot' ? (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={(e) => void handleForgotPassword(e)}
                className="space-y-4"
              >
                <p className="text-white/80 text-sm font-semibold text-center">
                  Réinitialiser le mot de passe
                </p>
                <div>
                  <label htmlFor="forgot-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm font-semibold text-center" role="alert">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-400 text-sm font-semibold text-center" role="status">
                    {success}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-gradient-pink w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : 'Envoyer le lien'}
                </button>
                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-white/50 text-sm font-semibold hover:text-white/70 transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </motion.form>
            ) : (
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
                  <PasswordField
                    id="login-password"
                    label="Mot de passe"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="mt-2 text-white/50 text-xs font-semibold hover:text-white/70 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
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
            )
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
              <PasswordField
                id="register-password"
                label="Mot de passe"
                value={registerPassword}
                onChange={setRegisterPassword}
                placeholder="Mot de passe (min. 6 caractères)"
                autoComplete="new-password"
              />
              <PasswordField
                id="register-confirm"
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmer le mot de passe"
                autoComplete="new-password"
              />
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

      <button
        type="button"
        onClick={continueAsGuest}
        className="mt-6 text-center text-white/40 text-sm font-semibold hover:text-white/60 transition-colors w-full max-w-sm mx-auto"
      >
        Continuer sans compte →
      </button>
    </div>
  );
}
