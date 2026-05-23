import { useEffect, useState } from 'react';
import { fetchAvatarsByUsernames } from '../lib/profilesApi';

export function usePlayerAvatars(playerNames: string[]) {
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const names = [...new Set(playerNames.map((n) => n.trim()).filter(Boolean))];
    if (names.length === 0) {
      setAvatars({});
      return;
    }

    let cancelled = false;

    fetchAvatarsByUsernames(names).then((map) => {
      if (!cancelled) setAvatars(map);
    });

    return () => {
      cancelled = true;
    };
  }, [playerNames.join('\0')]);

  return avatars;
}
