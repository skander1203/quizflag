import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { fetchTopLeaderboard } from '../lib/leaderboardApi';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/scoring';

interface DisplayEntry {
  playerName: string;
  score: number;
  difficulty: Difficulty;
}

function localEntries(entries: DisplayEntry[], limit: number): DisplayEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function Leaderboard() {
  const { state } = useQuiz();
  const playerName = state.player.name.trim();
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const loadLocalFallback = useCallback(() => {
    const local: DisplayEntry[] = state.leaderboard.map((e) => ({
      playerName: e.playerName,
      score: e.score,
      difficulty: e.difficulty,
    }));
    setEntries(localEntries(local, 20));
    setUsingLocalFallback(true);
  }, [state.leaderboard]);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchTopLeaderboard(20);
      setEntries(
        rows.map((r) => ({
          playerName: r.player_name,
          score: r.score,
          difficulty: r.difficulty,
        })),
      );
      setUsingLocalFallback(false);
    } catch {
      loadLocalFallback();
    } finally {
      setLoading(false);
    }
  }, [loadLocalFallback]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="space-y-5 pb-2">
      <div className="text-center shrink-0">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Classement
        </h1>
        <p className="text-white/60 text-sm mt-1 font-semibold">
          {usingLocalFallback ? '10 dernières parties (local)' : 'Top 20 mondial'}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-bold text-cyan-300 hover:text-cyan-200 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10"
          onClick={() => loadLeaderboard()}
          disabled={loading}
          aria-label="Actualiser le classement"
        >
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12" aria-busy="true" aria-label="Chargement">
          <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-cyan-400 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="glass-card p-6 text-center text-white/60 text-sm">
          Aucune partie enregistrée. Lancez une partie !
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => {
            const highlight =
              !!playerName && entry.playerName === playerName;
            return (
              <motion.li
                key={`${entry.playerName}-${entry.score}-${i}`}
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
                  <span className="inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-white/15 text-white/80 border border-white/20">
                    {DIFFICULTY_LABELS[entry.difficulty]}
                  </span>
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
