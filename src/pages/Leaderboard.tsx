import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { DIFFICULTY_LABELS } from '../utils/scoring';

export function Leaderboard() {
  const { state } = useQuiz();
  const playerName = state.player.name;
  const playerScores = state.leaderboard
    .filter((e) => e.playerName === playerName)
    .map((e) => e.score);
  const bestScore = playerScores.length ? Math.max(...playerScores) : 0;

  return (
    <div className="space-y-5 pb-2">
      <div className="text-center shrink-0">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Classement
        </h1>
        <p className="text-white/60 text-sm mt-1 font-semibold">10 dernières parties</p>
      </div>

      {state.leaderboard.length === 0 ? (
        <p className="glass-card p-6 text-center text-white/60 text-sm">
          Aucune partie enregistrée. Lancez une partie !
        </p>
      ) : (
        <ol className="space-y-2">
          {state.leaderboard.map((entry, i) => {
            const highlight =
              !!playerName &&
              entry.playerName === playerName &&
              entry.score === bestScore;
            return (
              <motion.li
                key={entry.timestamp}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card flex items-center gap-3 p-3 min-h-[48px] ${
                  highlight ? 'border-pink-400/50 bg-pink-500/15' : ''
                }`}
              >
                <span className="font-extrabold text-cyan-300 w-6 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {entry.playerName}
                    {highlight && (
                      <span className="text-pink-300 text-xs font-semibold ml-1">
                        (vous)
                      </span>
                    )}
                  </p>
                  <p className="text-white/50 text-xs font-semibold">
                    {DIFFICULTY_LABELS[entry.difficulty]}
                  </p>
                </div>
                <span className="font-extrabold text-yellow-300 tabular-nums shrink-0">
                  {entry.score}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}

      <Link to="/" className="btn-gradient-cyan block text-center">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
