import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { useSounds } from '../hooks/useSounds';
import { Confetti } from '../components/Confetti';
import { supabase } from '../lib/supabase';
import { updateUserStatsAfterGame } from '../lib/statsApi';
import {
  MAX_DISPLAY_SCORE,
  starRating,
  DIFFICULTY_LABELS,
} from '../utils/scoring';

export function Results() {
  const navigate = useNavigate();
  const { isGuest, user } = useAuth();
  const { state, dispatch, startGame } = useQuiz();
  const { playVictory, withClick } = useSounds();
  const session = state.session;
  const savedToSupabaseRef = useRef<string | null>(null);
  const victoryPlayedRef = useRef(false);

  useEffect(() => {
    if (!session?.finished) {
      navigate('/', { replace: true });
    }
    // Guard only on mount — avoid redirecting when buttons clear/restart the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session?.finished || isGuest || !user || session.score <= 0) return;

    const key = `${user.id}-${session.score}-${session.correctCount}-${session.wrongCount}-${session.difficulty}`;
    if (savedToSupabaseRef.current === key) return;
    savedToSupabaseRef.current = key;

    updateUserStatsAfterGame(user.id, {
      difficulty: session.difficulty,
      score: session.score,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
    }).catch((err) => {
      console.log('[stats] save failed', err);
    });

    void (async () => {
      const finalScore = session.score;
      const gameDifficulty = session.difficulty;

      console.log('[leaderboard] game finished, fetching profile', { userId: user.id, finalScore, gameDifficulty });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('[leaderboard] profile fetch error', profileError);
        return;
      }

      const profileUsername = profile?.username?.trim();
      console.log('[leaderboard] profile username', profileUsername);

      if (!profileUsername) {
        console.log('[leaderboard] no username, skipping save');
        return;
      }

      console.log('[leaderboard] upserting score', {
        player_name: profileUsername,
        score: finalScore,
        difficulty: gameDifficulty,
      });

      const { error: upsertError } = await supabase.from('leaderboard').upsert(
        { player_name: profileUsername, score: finalScore, difficulty: gameDifficulty },
        { onConflict: 'player_name,difficulty' },
      );

      if (upsertError) {
        console.log('[leaderboard] upsert error', upsertError);
        return;
      }

      console.log('[leaderboard] save success', {
        player_name: profileUsername,
        score: finalScore,
        difficulty: gameDifficulty,
      });
    })();
  }, [session, isGuest, user]);

  useEffect(() => {
    if (!session?.finished || session.score <= 700 || victoryPlayedRef.current) return;
    victoryPlayedRef.current = true;
    playVictory();
  }, [session, playVictory]);

  if (!session) return null;

  const stars = starRating(session.score);
  const showConfetti = session.score > 700;

  return (
    <div className="space-y-6 text-center pb-4">
      <Confetti active={showConfetti} count={60} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <h1 className="text-2xl font-extrabold text-white mb-2">Partie terminée !</h1>
        <p className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
          {session.score}
          <span className="text-xl text-white/50"> / {MAX_DISPLAY_SCORE}</span>
        </p>
        <p className="text-white/60 text-sm mt-1 font-semibold">points</p>
      </motion.div>

      <div className="flex justify-center gap-2 text-3xl" aria-label={`${stars} étoiles sur 3`}>
        {[1, 2, 3].map((s) => (
          <motion.span
            key={s}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: s * 0.12, type: 'spring', stiffness: 400 }}
          >
            {s <= stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </div>

      <div className="glass-card p-4 space-y-2.5 text-left">
        <Row label="Bonnes réponses" value={`${session.correctCount} / ${session.questions.length}`} good />
        <Row label="Mauvaises réponses" value={String(session.wrongCount)} />
        <Row label="Bonus vitesse" value={`+${session.speedBonuses} pts`} />
        <Row label="Difficulté" value={DIFFICULTY_LABELS[session.difficulty]} />
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          type="button"
          className="btn-gradient-pink"
          whileTap={{ scale: 0.95 }}
          onClick={withClick(() => {
            startGame(session.difficulty);
            navigate('/quiz', { replace: true });
          })}
        >
          Rejouer
        </motion.button>
        <button
          type="button"
          className="btn-gradient-indigo"
          onClick={withClick(() => {
            dispatch({ type: 'CLEAR_SESSION' });
            navigate('/', { replace: true });
          })}
        >
          Aller au menu
        </button>
        <button
          type="button"
          className="btn-gradient-cyan"
          onClick={withClick(() => {
            dispatch({ type: 'CLEAR_SESSION' });
            navigate('/difficulty', { replace: true });
          })}
        >
          Changer la difficulté
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm gap-2">
      <span className="text-white/60 font-semibold">{label}</span>
      <span className={`font-extrabold shrink-0 ${good ? 'text-green-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
