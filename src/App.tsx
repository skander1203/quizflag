import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { Layout } from './components/Layout';
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

export default function App() {
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
