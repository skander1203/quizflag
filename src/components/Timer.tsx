interface TimerProps {
  progress: number;
  remaining: number;
}

export function Timer({ progress, remaining }: TimerProps) {
  return (
    <div className="w-full" role="timer" aria-live="polite" aria-label={`${remaining} secondes restantes`}>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={remaining}
          aria-valuemin={0}
          aria-valuemax={10}
        />
      </div>
    </div>
  );
}
