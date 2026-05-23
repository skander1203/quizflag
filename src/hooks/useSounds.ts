import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'quizflag-sounds-enabled';

let soundsEnabled = readSoundsEnabled();
const listeners = new Set<(enabled: boolean) => void>();

function readSoundsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : (JSON.parse(raw) as boolean);
  } catch {
    return true;
  }
}

function writeSoundsEnabled(value: boolean) {
  soundsEnabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* quota */
  }
  listeners.forEach((fn) => fn(value));
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function playSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.25,
) {
  const ctx = getAudioContext();
  if (!ctx || !soundsEnabled) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.linearRampToValueAtTime(endFreq, now + duration);

  const fadeOut = Math.min(0.1, duration * 0.25);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.setValueAtTime(volume, now + duration - fadeOut);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playTone(freq: number, start: number, duration: number, volume = 0.22) {
  const ctx = getAudioContext();
  if (!ctx || !soundsEnabled) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

function playDrumRoll(durationSec = 1) {
  const ctx = getAudioContext();
  if (!ctx || !soundsEnabled) return;

  const now = ctx.currentTime;
  const tapCount = Math.max(8, Math.floor(durationSec * 14));

  for (let i = 0; i < tapCount; i++) {
    const t = now + (i / tapCount) * durationSec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vol = 0.04 + (i / tapCount) * 0.14;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + i * 10, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }
}

export function useSounds() {
  const [enabled, setEnabledState] = useState(soundsEnabled);

  useEffect(() => {
    const listener = (value: boolean) => setEnabledState(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    writeSoundsEnabled(value);
  }, []);

  const toggleEnabled = useCallback(() => {
    writeSoundsEnabled(!soundsEnabled);
  }, []);

  const playCorrect = useCallback(() => {
    playSweep(520, 620, 0.3, 'sine', 0.15);
    vibrate(50);
  }, []);

  const playWrong = useCallback(() => {
    playSweep(350, 250, 0.4, 'sine', 0.15);
    vibrate([100, 50, 100]);
  }, []);

  const playTimerWarning = useCallback(() => {
    if (!soundsEnabled) {
      vibrate([50, 50, 50]);
      return;
    }

    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        playTone(880, now + i * 0.12, 0.08, 0.14);
      }
    }
    vibrate([50, 50, 50]);
  }, []);

  const playVictory = useCallback(() => {
    if (!soundsEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      playTone(freq, now + i * 0.15, 0.18, 0.24);
    });
  }, []);

  const playDrumRollSuspense = useCallback((durationSec = 1) => {
    playDrumRoll(durationSec);
  }, []);

  const playClick = useCallback(() => {
    if (!soundsEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }, []);

  const withClick = useCallback(
    (fn: () => void) => () => {
      playClick();
      fn();
    },
    [playClick],
  );

  return {
    enabled,
    setEnabled,
    toggleEnabled,
    playCorrect,
    playWrong,
    playTimerWarning,
    playVictory,
    playDrumRollSuspense,
    playClick,
    withClick,
  };
}
