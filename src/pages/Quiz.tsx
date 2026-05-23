import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useTimer } from '../hooks/useTimer';
import { useSounds } from '../hooks/useSounds';
import { FlagDisplay } from '../components/FlagDisplay';
import { Timer } from '../components/Timer';
import { Confetti } from '../components/Confetti';
import { getSpeedTier, remainingFromElapsed, TIMER_SECONDS } from '../utils/scoring';
import type { FlagQuestion } from '../types';

/** Figé au moment de la réponse — le reducer avance l’index avant la fin du feedback. */
interface AnswerSnapshot {
  question: FlagQuestion;
  questionNum: number;
  lastCorrectAnswer: string;
}

interface FloatingBonus {
  id: number;
  label: string;
  color: string;
  textShadow: string;
}

function glowForPoints(points: number): string {
  if (points === 150) {
    return '0 0 10px rgba(251, 191, 36, 0.9), 0 0 22px rgba(251, 191, 36, 0.5)';
  }
  if (points === 120) {
    return '0 0 8px rgba(250, 204, 21, 0.75), 0 0 18px rgba(250, 204, 21, 0.4)';
  }
  return '0 0 8px rgba(74, 222, 128, 0.75), 0 0 18px rgba(74, 222, 128, 0.4)';
}

export function Quiz() {
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const { playCorrect, playWrong, playTimerWarning, withClick } = useSounds();
  const session = state.session;
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerSnapshot, setAnswerSnapshot] = useState<AnswerSnapshot | null>(null);
  const [floatingBonus, setFloatingBonus] = useState<FloatingBonus | null>(null);

  const question = session?.questions[session.currentIndex];
  const questionNum = session ? session.currentIndex + 1 : 0;
  const total = session?.questions.length ?? 10;

  const showingFeedback = Boolean(state.feedback);
  const display = showingFeedback && answerSnapshot ? answerSnapshot : null;
  const displayQuestion = display?.question ?? question;
  const displayQuestionNum = display?.questionNum ?? questionNum;
  const lastCorrectAnswer = display?.lastCorrectAnswer ?? question?.correctAnswer ?? '';

  const lockSnapshot = useCallback(
    (q: FlagQuestion, num: number) => {
      setAnswerSnapshot({
        question: q,
        questionNum: num,
        lastCorrectAnswer: q.correctAnswer,
      });
    },
    [],
  );

  const onExpire = useCallback(() => {
    if (!locked && session && !session.finished && question) {
      setLocked(true);
      lockSnapshot(question, questionNum);
      dispatch({ type: 'TIMEOUT' });
    }
  }, [locked, session, question, questionNum, lockSnapshot, dispatch]);

  const timerActive = Boolean(
    session && question && !session.finished && !locked && !state.feedback,
  );

  const { remaining, progress, reset } = useTimer(TIMER_SECONDS, timerActive, onExpire);

  useEffect(() => {
    if (!session) navigate('/');
  }, [session, navigate]);

  useEffect(() => {
    if (session?.finished) {
      const t = setTimeout(() => navigate('/results'), 800);
      return () => clearTimeout(t);
    }
  }, [session?.finished, navigate]);

  useEffect(() => {
    if (state.feedback) return;
    setAnswerSnapshot(null);
    setLocked(false);
    reset();
  }, [session?.currentIndex, question?.id, reset, state.feedback]);

  useEffect(() => {
    if (state.feedback === 'correct') {
      setShowConfetti(true);
      playCorrect();
      const t = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(t);
    }
    if (state.feedback === 'wrong') {
      playWrong();
    }
  }, [state.feedback, playCorrect, playWrong]);

  useEffect(() => {
    if (!timerActive || remaining >= 3 || remaining <= 0) return;
    playTimerWarning();
  }, [remaining, timerActive, playTimerWarning]);

  useEffect(() => {
    if (!state.feedback) return;
    const t = setTimeout(() => {
      dispatch({ type: 'CLEAR_FEEDBACK' });
      setLocked(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [state.feedback, dispatch]);

  if (!session || !displayQuestion) return null;

  const handleAnswer = (answer: string) => {
    if (locked || state.feedback || !question) return;
    setLocked(true);
    lockSnapshot(question, questionNum);
    const elapsedMs = Date.now() - session.questionStartedAt;
    if (answer === question.correctAnswer) {
      const tier = getSpeedTier(remainingFromElapsed(elapsedMs));
      setFloatingBonus({
        id: Date.now(),
        label: tier.label,
        color: tier.color,
        textShadow: glowForPoints(tier.points),
      });
    }
    dispatch({ type: 'ANSWER', payload: { answer, elapsedMs } });
  };

  const feedbackLabel =
    state.feedback === 'correct'
      ? 'Bonne réponse !'
      : state.feedback === 'wrong'
        ? 'Mauvaise réponse !'
        : null;

  return (
    <div className="flex flex-col h-full min-h-0 -mx-4">
      <Confetti active={showConfetti} count={28} />

      {/* En-tête fin */}
      <header className="shrink-0 px-4 py-2 bg-transparent">
        <div className="flex items-center justify-between gap-2 min-h-[40px]">
          <div className="relative">
            <span className="text-cyan-300 font-extrabold tabular-nums text-sm">
              {session.score} pts
            </span>
            <AnimatePresence>
              {floatingBonus && (
                <motion.span
                  key={floatingBonus.id}
                  className="absolute left-0 top-0 text-3xl font-black pointer-events-none whitespace-nowrap"
                  style={{
                    color: floatingBonus.color,
                    textShadow: floatingBonus.textShadow,
                  }}
                  initial={{ scale: 1.5, opacity: 1, y: 0 }}
                  animate={{
                    scale: [1.5, 1, 1],
                    opacity: [1, 1, 0],
                    y: [0, -20, -60],
                  }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  onAnimationComplete={() => setFloatingBonus(null)}
                >
                  {floatingBonus.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-white/80 font-bold text-sm tabular-nums">
            {displayQuestionNum} / {total}
          </span>
          <button
            type="button"
            className="text-white/50 text-xs font-semibold tap-target px-2"
            onClick={withClick(() => {
              dispatch({ type: 'CLEAR_SESSION' });
              navigate('/');
            })}
          >
            Quitter
          </button>
        </div>
        <div className="mt-2">
          <Timer progress={progress} remaining={remaining} />
        </div>
      </header>

      {/* Zone drapeau ~40 % */}
      <div className="shrink-0 px-4 mb-2 mt-7">
        <FlagDisplay
          isoCode={displayQuestion.country.iso_code}
          flagEmoji={displayQuestion.country.flag_emoji}
          countryName={displayQuestion.country.name_fr}
          variant="quiz"
        />
      </div>

      {/* Question + réponses */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 flex flex-col gap-3">
        <p className="text-center text-white font-extrabold text-base sm:text-lg shrink-0 px-1 mt-2">
          🏳️ À quel pays appartient ce drapeau ?
        </p>

        <div
          className="min-h-12 shrink-0 flex flex-col items-center justify-center text-center px-2"
          role="status"
          aria-live="polite"
        >
          <p
            className={`font-extrabold text-base leading-tight transition-opacity duration-200 ${
              feedbackLabel
                ? state.feedback === 'correct'
                  ? 'text-green-400 opacity-100'
                  : 'text-red-400 opacity-100'
                : 'opacity-0'
            }`}
          >
            {feedbackLabel ?? '\u00A0'}
          </p>
          <p
            className={`text-sm text-white/60 font-semibold leading-tight mt-0.5 transition-opacity duration-200 ${
              state.feedback === 'wrong' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {state.feedback === 'wrong'
              ? `C'était : ${lastCorrectAnswer}`
              : '\u00A0'}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5" role="listbox" aria-label="Réponses possibles">
          {displayQuestion.options.map((opt) => (
            <motion.li key={opt} role="option" whileTap={!locked ? { scale: 0.98 } : {}}>
              <button
                type="button"
                disabled={locked || !!state.feedback}
                onClick={() => handleAnswer(opt)}
                className={`answer-btn ${
                  state.feedback && opt === lastCorrectAnswer
                    ? 'bg-green-500/35 border-green-400 text-white'
                    : 'glass-card border-white/25 text-white hover:border-cyan-400/50 hover:bg-white/15'
                } disabled:opacity-70`}
              >
                {opt}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
