const GRADIENTS = [
  'from-pink-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-green-500 to-emerald-600',
  'from-violet-500 to-indigo-600',
  'from-rose-500 to-red-600',
] as const;

export function avatarGradientClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
