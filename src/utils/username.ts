export const HEADER_USERNAME_MAX = 6;

export function truncateUsername(name: string, max = HEADER_USERNAME_MAX): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max)}...`;
}
