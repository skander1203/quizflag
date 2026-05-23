import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  createProfile,
  fetchUsername,
  isUsernameTaken,
  emailExists,
} from '../lib/profilesApi';

const USERNAME_TAKEN_ERROR = 'Ce pseudo est déjà pris, choisissez-en un autre';

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (lower.includes('user already registered')) {
    return 'Un compte existe déjà avec cet email.';
  }
  if (lower.includes('password') && lower.includes('6')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (lower.includes('valid email')) {
    return 'Veuillez entrer une adresse email valide.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter.';
  }
  return message;
}

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  username: string;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null; success: boolean }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsername = useCallback(async (userId: string) => {
    const name = await fetchUsername(userId);
    setUsername(name);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        void loadUsername(currentSession.user.id);
      } else {
        setUsername('');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadUsername(nextSession.user.id);
      } else {
        setUsername('');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUsername]);

  const signUp = useCallback(
    async (email: string, password: string, usernameInput: string) => {
      const trimmedUsername = usernameInput.trim();

      try {
        if (await isUsernameTaken(trimmedUsername)) {
          return { error: USERNAME_TAKEN_ERROR };
        }
      } catch {
        return { error: 'Impossible de vérifier le pseudo. Réessayez.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: trimmedUsername },
        },
      });

      if (error) {
        return { error: translateAuthError(error.message) };
      }

      const userId = data.user?.id;
      if (!userId) {
        return { error: 'Inscription impossible. Réessayez.' };
      }

      const { error: profileError } = await createProfile(userId, trimmedUsername);
      if (profileError) {
        await supabase.auth.signOut();
        return { error: profileError };
      }

      setUsername(trimmedUsername);
      return { error: null };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: translateAuthError(error.message) };
    }
    if (data.user) {
      await loadUsername(data.user.id);
    }
    return { error: null };
  }, [loadUsername]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUsername('');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { error: 'Veuillez entrer une adresse email.', success: false };
    }

    try {
      const exists = await emailExists(trimmed);
      if (!exists) {
        return { error: 'Aucun compte trouvé avec cet email.', success: false };
      }
    } catch {
      return { error: 'Impossible de vérifier l\'email. Réessayez.', success: false };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin,
    });

    if (error) {
      return { error: translateAuthError(error.message), success: false };
    }

    return { error: null, success: true };
  }, []);

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        username,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
