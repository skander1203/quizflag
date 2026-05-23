export interface MultiplayerSession {
  roomCode: string;
  playerName: string;
  isHost: boolean;
}

const STORAGE_KEY = 'quizflag_mp';

export function getMultiplayerSession(): MultiplayerSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MultiplayerSession;
  } catch {
    return null;
  }
}

export function setMultiplayerSession(session: MultiplayerSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearMultiplayerSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
