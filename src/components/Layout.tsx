import { Link, useLocation } from 'react-router-dom';
import { PhoneShell } from './PhoneShell';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isQuiz = location.pathname === '/quiz';
  const isHome = location.pathname === '/';
  const showHeader = !isQuiz && !isHome && location.pathname !== '/difficulty';

  return (
    <PhoneShell>
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {showHeader && (
          <header className="shrink-0 px-4 py-3 border-b border-white/10">
            <Link
              to="/"
              className="text-lg font-extrabold bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent tap-target inline-block"
            >
              QuizFlag 🚩
            </Link>
          </header>
        )}
        <main
          className={`flex-1 min-h-0 w-full max-w-full ${
            isQuiz ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
          } px-4 sm:px-5 ${isQuiz ? 'py-0' : 'py-4 sm:py-5 pb-6'}`}
        >
          {children}
        </main>
      </div>
    </PhoneShell>
  );
}
