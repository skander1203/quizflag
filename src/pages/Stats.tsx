import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Gamepad2,
  Heart,
  Star,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSounds } from '../hooks/useSounds';
import { AnimatedNumber } from '../components/AnimatedNumber';
import {
  EMPTY_STATS,
  favoriteDifficulty,
  fetchUserStats,
  globalAccuracy,
  type UserStats,
} from '../lib/statsApi';
import { DIFFICULTY_OPTIONS } from '../utils/difficultyConfig';
import { DIFFICULTY_LABELS } from '../utils/scoring';
import type { Difficulty } from '../types';

const ALL_DIFFICULTIES: Difficulty[] = [
  'facile',
  'normal',
  'difficile',
  'extreme',
  'impossible',
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  facile: 'from-green-400 to-green-600',
  normal: 'from-blue-400 to-blue-600',
  difficile: 'from-orange-400 to-orange-600',
  extreme: 'from-red-400 to-red-600',
  impossible: 'from-purple-400 to-purple-700',
};

const DIFFICULTY_BAR_COLORS: Record<Difficulty, string> = {
  facile: 'bg-green-400',
  normal: 'bg-blue-400',
  difficile: 'bg-orange-400',
  extreme: 'bg-red-400',
  impossible: 'bg-purple-400',
};

export function Stats() {
  const navigate = useNavigate();
  const { isGuest, user, leaveGuestForAuth } = useAuth();
  const { withClick } = useSounds();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(!isGuest);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserStats(user.id);
      setStats(
        data ?? {
          id: user.id,
          ...EMPTY_STATS,
          updated_at: new Date().toISOString(),
        },
      );
    } catch {
      setStats({
        id: user.id,
        ...EMPTY_STATS,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isGuest || !user) return;
    void loadStats();
  }, [isGuest, user, loadStats]);

  if (isGuest) {
    return (
      <div className="space-y-6 pb-4">
        <RetourButton onClick={withClick(() => navigate('/'))} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 pt-8"
        >
          <div className="flex justify-center">
            <div className="glass-card p-5 rounded-full border border-white/20">
              <BarChart3 className="w-10 h-10 text-pink-400" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Mes Stats
          </h1>
          <p className="glass-card p-5 text-white/70 text-sm font-semibold leading-relaxed">
            Créez un compte pour voir vos statistiques
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              className="btn-gradient-pink"
              onClick={withClick(() => leaveGuestForAuth('register'))}
            >
              Créer un compte
            </button>
            <button
              type="button"
              className="btn-gradient-cyan"
              onClick={withClick(() => leaveGuestForAuth('login'))}
            >
              Se connecter
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 pb-4">
        <RetourButton onClick={withClick(() => navigate('/'))} />
        <div className="flex justify-center py-16" aria-busy="true" aria-label="Chargement">
          <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-pink-400 animate-spin" />
        </div>
      </div>
    );
  }

  const accuracy = globalAccuracy(stats);
  const favorite = favoriteDifficulty(stats.stats_per_difficulty);
  const maxGamesPlayed = Math.max(
    1,
    ...ALL_DIFFICULTIES.map((d) => stats.stats_per_difficulty[d]?.games_played ?? 0),
  );

  return (
    <div className="space-y-5 pb-4">
      <RetourButton onClick={withClick(() => navigate('/'))} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent">
          Mes Stats
        </h1>
        <p className="text-white/50 text-sm mt-1 font-semibold">
          {stats.games_played === 0
            ? 'Jouez votre première partie !'
            : `${stats.games_played} partie${stats.games_played > 1 ? 's' : ''} au total`}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Gamepad2 className="w-5 h-5 text-cyan-300" strokeWidth={2.5} />}
          label="Parties jouées"
          value={stats.games_played}
          delay={0.05}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-green-400" strokeWidth={2.5} />}
          label="Bonnes réponses"
          value={stats.correct_answers}
          delay={0.1}
          valueClass="text-green-400"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-400" strokeWidth={2.5} />}
          label="Mauvaises réponses"
          value={stats.wrong_answers}
          delay={0.15}
          valueClass="text-red-300"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-300" strokeWidth={2.5} />}
          label="Précision globale"
          value={accuracy}
          decimals={1}
          suffix="%"
          delay={0.2}
          valueClass="text-yellow-300"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-amber-300" strokeWidth={2.5} />}
          label="Meilleur score"
          value={stats.best_score}
          delay={0.25}
          valueClass="text-amber-300"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-pink-300" strokeWidth={2.5} />}
          label="Points totaux"
          value={stats.total_points}
          delay={0.3}
          valueClass="text-pink-300"
        />
      </div>

      {favorite && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 flex items-center gap-3 border border-pink-400/20"
        >
          <div className="shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-400" fill="currentColor" strokeWidth={0} />
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold">Difficulté favorite</p>
            <p className="text-white font-extrabold text-lg">
              {DIFFICULTY_LABELS[favorite]}{' '}
              <span className="text-white/50 text-sm font-bold">
                ({stats.stats_per_difficulty[favorite]?.games_played ?? 0} parties)
              </span>
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-300" strokeWidth={2.5} />
          <h2 className="text-sm font-extrabold text-white">Meilleur score par difficulté</h2>
        </div>
        <div className="space-y-2">
          {ALL_DIFFICULTIES.map((difficulty, i) => {
            const diffStats = stats.stats_per_difficulty[difficulty];
            const bestScore = diffStats?.best_score ?? 0;
            const option = DIFFICULTY_OPTIONS.find((o) => o.id === difficulty)!;

            return (
              <motion.div
                key={difficulty}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-base shrink-0 w-6 text-center">{option.emoji}</span>
                <span className="text-white/70 text-xs font-bold w-16 shrink-0">
                  {option.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${DIFFICULTY_COLORS[difficulty]}`}
                    initial={{ width: 0 }}
                    animate={{ width: bestScore > 0 ? `${(bestScore / 1500) * 100}%` : '0%' }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-white font-extrabold text-sm tabular-nums w-10 text-right shrink-0">
                  {bestScore > 0 ? bestScore : '—'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-300" strokeWidth={2.5} />
          <h2 className="text-sm font-extrabold text-white">Parties par difficulté</h2>
        </div>
        <div className="flex items-end gap-2 h-32 pt-2">
          {ALL_DIFFICULTIES.map((difficulty, i) => {
            const games = stats.stats_per_difficulty[difficulty]?.games_played ?? 0;
            const heightPct = (games / maxGamesPlayed) * 100;
            const option = DIFFICULTY_OPTIONS.find((o) => o.id === difficulty)!;

            return (
              <div key={difficulty} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <span className="text-white/80 text-[10px] font-extrabold tabular-nums">
                  {games > 0 ? games : ''}
                </span>
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    className={`w-full rounded-t-lg ${DIFFICULTY_BAR_COLORS[difficulty]} opacity-90`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ delay: 0.6 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                    style={{ minHeight: games > 0 ? 4 : 0 }}
                  />
                </div>
                <span className="text-[10px] font-bold text-white/50 truncate w-full text-center">
                  {option.emoji}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          {ALL_DIFFICULTIES.map((difficulty) => (
            <span
              key={difficulty}
              className="flex-1 text-[9px] font-bold text-white/40 text-center truncate"
            >
              {DIFFICULTY_LABELS[difficulty].slice(0, 4)}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function RetourButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white transition-colors tap-target -ml-1"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
      Retour
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  decimals,
  suffix,
  delay,
  valueClass = 'text-white',
}: {
  icon: ReactNode;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delay: number;
  valueClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-3.5 space-y-2 border border-white/10"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white/50 text-[11px] font-bold leading-tight">{label}</span>
      </div>
      <p className={`text-xl font-extrabold tabular-nums ${valueClass}`}>
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </p>
    </motion.div>
  );
}
