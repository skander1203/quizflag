import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { fetchTopLeaderboard } from '../lib/leaderboardApi';
import { PlayerAvatar } from '../components/PlayerAvatar';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/scoring';

interface DisplayEntry {
  playerName: string;
  score: number;
  difficulty: Difficulty;
  avatarUrl?: string | null;
}

type LeaderboardTabId =
  | 'global'
  | 'facile'
  | 'normal'
  | 'difficile'
  | 'extreme'
  | 'impossible';

interface LeaderboardTab {
  id: LeaderboardTabId;
  label: string;
  difficulty: Difficulty | null;
  subtitle: string;
}

const LEADERBOARD_TABS: LeaderboardTab[] = [
  { id: 'global', label: '🌍 Global', difficulty: null, subtitle: 'Top 20 mondial' },
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

function localEntries(
  entries: DisplayEntry[],
  limit: number,
  difficulty: Difficulty | null,
): DisplayEntry[] {
  const filtered = difficulty
    ? entries.filter((e) => e.difficulty === difficulty)
    : entries;
  return [...filtered].sort((a, b) => b.score - a.score).slice(0, limit);
}

export function Leaderboard() {
  const { isGuest } = useAuth();
  const { state } = useQuiz();
  const playerName = state.player.name.trim();
  const [activeTabId, setActiveTabId] = useState<LeaderboardTabId>('global');
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const activeTab =
    LEADERBOARD_TABS.find((tab) => tab.id === activeTabId) ?? LEADERBOARD_TABS[0];

  const loadLocalFallback = useCallback(
    (difficulty: Difficulty | null) => {
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
        const rows = await fetchTopLeaderboard(20, tab.difficulty ?? undefined);
        setEntries(
          rows.map((r) => ({
            playerName: r.player_name,
            score: r.score,
            difficulty: r.difficulty,
            avatarUrl: r.avatar_url,
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
    if (isGuest) return;
    loadLeaderboard(activeTab);
  }, [activeTab, loadLeaderboard, isGuest]);

  if (isGuest) {
    return (
      <div className="space-y-6 pb-2 text-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Classement
        </h1>
        <p className="glass-card p-6 text-white/70 text-sm font-semibold">
          Créez un compte pour apparaître dans le classement
        </p>
        <Link to="/" className="btn-gradient-cyan block text-center">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const subtitle = usingLocalFallback
    ? '10 dernières parties (local)'
    : activeTab.subtitle;

  return (
    <div className="space-y-5 pb-2">
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
              onClick={() => setActiveTabId(tab.id)}
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
          onClick={() => loadLeaderboard(activeTab)}
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
            const highlight = !!playerName && entry.playerName === playerName;
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
                <PlayerAvatar
                  name={entry.playerName}
                  avatarUrl={entry.avatarUrl}
                  size="xs"
                />
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
