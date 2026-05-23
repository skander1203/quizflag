export function truncateUsername(name: string, max = 10): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max)}...`;
}
