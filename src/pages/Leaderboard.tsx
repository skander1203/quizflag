import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useSounds } from '../hooks/useSounds';
import { fetchTopLeaderboard } from '../lib/leaderboardApi';
import { PlayerAvatar } from '../components/PlayerAvatar';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/scoring';

interface DisplayEntry {
  playerName: string;
  score: number;
  difficulty: Difficulty;
}

type LeaderboardTabId = 'facile' | 'normal' | 'difficile' | 'extreme' | 'impossible';

interface LeaderboardTab {
  id: LeaderboardTabId;
  label: string;
  difficulty: Difficulty;
  subtitle: string;
}

const LEADERBOARD_TABS: LeaderboardTab[] = [
  { id: 'facile', label: '😊 Facile', difficulty: 'facile', subtitle: 'Top 20 Facile' },
  { id: 'normal', label: '🌍 Normal', difficulty: 'normal', subtitle: 'Top 20 Normal' },
  {
    id: 'difficile',
    label: '🔥 Difficile',
    difficulty: 'difficile',
    subtitle: 'Top 20 Difficile',
  },
  { id: 'extreme', label: '⚡ Extrême', difficulty: 'extreme', subtitle: 'Top 20 Extrême' },
  {
    id: 'impossible',
    label: '💀 Impossible',
    difficulty: 'impossible',
    subtitle: 'Top 20 Impossible',
  },
];

function localEntries(entries: DisplayEntry[], limit: number, difficulty: Difficulty): DisplayEntry[] {
  return [...entries]
    .filter((e) => e.difficulty === difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function Leaderboard() {
  const { isGuest } = useAuth();
  const { state } = useQuiz();
  const { playClick, withClick } = useSounds();
  const playerName = state.player.name.trim();
  const [activeTabId, setActiveTabId] = useState<LeaderboardTabId>('facile');
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const activeTab =
    LEADERBOARD_TABS.find((tab) => tab.id === activeTabId) ?? LEADERBOARD_TABS[0];

  const loadLocalFallback = useCallback(
    (difficulty: Difficulty) => {
      const local: DisplayEntry[] = state.leaderboard.map((e) => ({
        playerName: e.playerName,
        score: e.score,
        difficulty: e.difficulty,
      }));
      setEntries(localEntries(local, 20, difficulty));
      setUsingLocalFallback(true);
    },
    [state.leaderboard],
  );

  const loadLeaderboard = useCallback(
    async (tab: LeaderboardTab) => {
      setLoading(true);
      try {
        const rows = await fetchTopLeaderboard(20, tab.difficulty);
        setEntries(
          rows.map((r) => ({
            playerName: r.player_name,
            score: r.score,
            difficulty: r.difficulty,
          })),
        );
        setUsingLocalFallback(false);
      } catch {
        loadLocalFallback(tab.difficulty);
      } finally {
        setLoading(false);
      }
    },
    [loadLocalFallback],
  );

  useEffect(() => {
    loadLeaderboard(activeTab);
  }, [activeTab, loadLeaderboard]);

  const subtitle = usingLocalFallback
    ? '10 dernières parties (local)'
    : activeTab.subtitle;

  return (
    <div className="space-y-5 pb-2">
      {isGuest && (
        <p className="glass-card px-3 py-2 text-white/60 text-xs font-semibold text-center border border-cyan-400/20">
          👤 Connectez-vous pour apparaître dans le classement
        </p>
      )}

      <div className="text-center shrink-0">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Classement
        </h1>
        <p className="text-white/60 text-sm mt-1 font-semibold">{subtitle}</p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
        role="tablist"
        aria-label="Filtres de difficulté"
      >
        {LEADERBOARD_TABS.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={withClick(() => setActiveTabId(tab.id))}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25'
                  : 'bg-transparent text-white/45 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-bold text-cyan-300 hover:text-cyan-200 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10"
          onClick={withClick(() => void loadLeaderboard(activeTab))}
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
              !isGuest && !!playerName && entry.playerName === playerName;
            return (
              <motion.li
                key={`${entry.playerName}-${entry.score}-${entry.difficulty}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card flex items-center gap-3 p-3 min-h-[48px] ${
                  highlight
                    ? 'border-2 border-pink-400/60 border-purple-500/50 bg-pink-500/15'
                    : ''
                }`}
              >
                <span className="font-extrabold text-cyan-300 w-6 shrink-0">
                  {i + 1}
                </span>
                <PlayerAvatar name={entry.playerName} size="xs" />
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

      <Link to="/" onClick={() => playClick()} className="btn-gradient-cyan block text-center">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
