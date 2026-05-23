import { useEffect, useState } from 'react';

export function useSyncedTimer(
  startTimeIso: string | null,
  totalSeconds: number,
  active: boolean,
) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active || !startTimeIso) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [active, startTimeIso]);

  if (!active || !startTimeIso) {
    return { remaining: totalSeconds, progress: 100, expired: false };
  }

  const startMs = new Date(startTimeIso).getTime();
  const elapsedSec = (now - startMs) / 1000;
  const remaining = Math.max(0, totalSeconds - elapsedSec);
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return {
    remaining,
    progress,
    expired: remaining <= 0,
  };
}
