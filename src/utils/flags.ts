/** Codes ISO 3166-1 alpha-2 utilisés par flagcdn.com (minuscules dans l’URL). */
const FLAGCDN_ALIASES: Record<string, string> = {
  UK: 'gb',
};

export type FlagCdnWidth = 80 | 160 | 320;

export function normalizeIsoCode(iso: string): string {
  const upper = iso.trim().toUpperCase();
  const aliased = FLAGCDN_ALIASES[upper] ?? upper;
  return aliased.toLowerCase();
}

export function flagImageUrl(iso: string, width: FlagCdnWidth = 320): string {
  const code = normalizeIsoCode(iso);
  return `https://flagcdn.com/w${width}/${code}.png`;
}

export function isValidIsoCode(iso: string): boolean {
  return /^[A-Za-z]{2}$/.test(iso.trim());
}
