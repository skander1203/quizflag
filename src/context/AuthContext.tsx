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
  isUsernameTaken,
  emailExists,
  uploadAvatar as uploadAvatarApi,
} from '../lib/profilesApi';

const USERNAME_TAKEN_ERROR = 'Ce pseudo est déjà pris, choisissez-en un autre';
const GUEST_STORAGE_KEY = 'quizflag_guest';
const GUEST_USERNAME = 'Invité';

function emailPrefix(user: User): string {
  return user.email?.split('@')[0]?.trim() ?? 'Joueur';
}

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
  avatarUrl: string | null;
  isGuest: boolean;
  loading: boolean;
  authRedirectTab: 'login' | 'register' | null;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  leaveGuestForAuth: (tab: 'login' | 'register') => void;
  clearAuthRedirectTab: () => void;
  uploadAvatar: (file: File) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null; success: boolean }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem(GUEST_STORAGE_KEY) === 'true',
  );
  const [authRedirectTab, setAuthRedirectTab] = useState<'login' | 'register' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', authUser.id)
      .single();

    const profileUsername = !error && data?.username ? data.username.trim() : '';
    setUsername(profileUsername || emailPrefix(authUser));
    setAvatarUrl(!error && data?.avatar_url ? data.avatar_url : null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (nextSession?.user) {
        sessionStorage.removeItem(GUEST_STORAGE_KEY);
        setIsGuest(false);
        await loadProfile(nextSession.user);
      } else if (sessionStorage.getItem(GUEST_STORAGE_KEY) === 'true') {
        setIsGuest(true);
        setUsername(GUEST_USERNAME);
        setAvatarUrl(null);
      } else {
        setUsername('');
        setAvatarUrl(null);
        setIsGuest(false);
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!cancelled) {
        void applySession(currentSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

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

      sessionStorage.removeItem(GUEST_STORAGE_KEY);
      setIsGuest(false);
      setUsername(trimmedUsername);
      setAvatarUrl(null);
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
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
      setIsGuest(false);
      await loadProfile(data.user);
    }
    return { error: null };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    await supabase.auth.signOut();
    setUsername('');
    setAvatarUrl(null);
  }, []);

  const continueAsGuest = useCallback(() => {
    sessionStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setIsGuest(true);
    setUsername(GUEST_USERNAME);
    setAvatarUrl(null);
  }, []);

  const leaveGuestForAuth = useCallback((tab: 'login' | 'register') => {
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setUsername('');
    setAvatarUrl(null);
    setAuthRedirectTab(tab);
  }, []);

  const clearAuthRedirectTab = useCallback(() => {
    setAuthRedirectTab(null);
  }, []);

  const uploadAvatar = useCallback(
    async (file: File) => {
      const userId = session?.user?.id;
      if (!userId || isGuest) {
        return { error: 'Connexion requise pour changer la photo.' };
      }

      const { url, error } = await uploadAvatarApi(userId, file);
      if (error) {
        return { error };
      }

      if (url) {
        setAvatarUrl(url);
      }
      return { error: null };
    },
    [session?.user?.id, isGuest],
  );

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
  const displayUsername = isGuest ? GUEST_USERNAME : username;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        username: displayUsername,
        avatarUrl: isGuest ? null : avatarUrl,
        isGuest,
        loading,
        authRedirectTab,
        signUp,
        signIn,
        signOut,
        continueAsGuest,
        leaveGuestForAuth,
        clearAuthRedirectTab,
        uploadAvatar,
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
