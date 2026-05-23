const AVATAR_COLORS = [
  '#7c3aed',
  '#ec4899',
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#ef4444',
] as const;

export function getAvatarColor(name: string): string {
  const char = name.trim().charAt(0) || '?';
  const index = char.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
