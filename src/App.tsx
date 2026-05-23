import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { Layout } from './components/Layout';
import { AuthScreen } from './components/AuthScreen';
import { PhoneShell } from './components/PhoneShell';
import { Home } from './pages/Home';
import { DifficultySelect } from './pages/DifficultySelect';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { Leaderboard } from './pages/Leaderboard';
import { MultiplayerMenu } from './pages/MultiplayerMenu';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { WaitingRoom } from './pages/WaitingRoom';
import { MultiplayerQuiz } from './pages/MultiplayerQuiz';
import { MultiplayerResults } from './pages/MultiplayerResults';

function AuthLoading() {
  return (
    <PhoneShell>
      <div className="flex flex-col h-full min-h-0 items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-pink-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Chargement"
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
      </div>
    </PhoneShell>
  );
}

function AppContent() {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user && !isGuest) {
    return (
      <PhoneShell>
        <main className="flex-1 min-h-0 w-full max-w-full overflow-y-auto px-4 sm:px-5 py-4 sm:py-5">
          <AuthScreen />
        </main>
      </PhoneShell>
    );
  }

  return (
    <QuizProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/difficulty" element={<DifficultySelect />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/multiplayer" element={<MultiplayerMenu />} />
            <Route path="/multiplayer/create" element={<CreateGame />} />
            <Route path="/multiplayer/join" element={<JoinGame />} />
            <Route path="/multiplayer/waiting/:code" element={<WaitingRoom />} />
            <Route path="/multiplayer/quiz/:code" element={<MultiplayerQuiz />} />
            <Route path="/multiplayer/results/:code" element={<MultiplayerResults />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QuizProvider>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <AnimatePresence>
        {!splashDone && (
          <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />
        )}
      </AnimatePresence>
      {splashDone && <AppContent />}
    </AuthProvider>
  );
}
