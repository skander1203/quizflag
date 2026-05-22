import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { DifficultySelect } from './pages/DifficultySelect';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { Leaderboard } from './pages/Leaderboard';

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
          </Routes>
        </Layout>
      </BrowserRouter>
    </QuizProvider>
  );
}
