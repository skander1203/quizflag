import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(totalSeconds: number, active: boolean, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (active) setRemaining(totalSeconds);
  }, [active, totalSeconds]);

  useEffect(() => {
    if (!active || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          queueMicrotask(() => onExpireRef.current?.());
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, remaining > 0]);

  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return { remaining, progress, reset };
}
