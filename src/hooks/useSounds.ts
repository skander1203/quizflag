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
  gain.gain.setValueAtTime(volume, now);
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
    playSweep(440, 880, 0.3, 'sine', 0.28);
    vibrate(50);
  }, []);

  const playWrong = useCallback(() => {
    playSweep(300, 150, 0.3, 'sawtooth', 0.2);
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
    playClick,
    withClick,
  };
}
