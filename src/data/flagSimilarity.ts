import type { Country, Difficulty } from '../types';
import { getContinent } from './isoContinent';

/**
 * Drapeaux visuellement proches (codes ISO minuscules).
 * Clé = pays correct ; valeurs = distracteurs plausibles.
 */
export const SIMILAR_FLAGS: Record<string, readonly string[]> = {
  fr: ['nl', 'ru', 'hr', 'si', 'sk', 'lu', 'is', 'no', 'rs', 'cz'],
  nl: ['fr', 'ru', 'hr', 'lu', 'rs', 'be', 'de'],
  ru: ['fr', 'nl', 'hr', 'si', 'sk', 'rs', 'cz', 'lv', 'by', 'ua'],
  it: ['mx', 'hu', 'bg', 'ir', 'ng', 'by', 'ci'],
  mx: ['it', 'hu', 'bg', 'ir', 'ng', 'by'],
  de: ['be', 'ye', 'ee', 'ao', 'at', 'nl'],
  be: ['de', 'ye', 'ee', 'ao', 'nl', 'fr'],
  ie: ['ci', 'ng', 'it', 'mx', 'gb'],
  ro: ['td', 'bg', 'md', 'ad', 'hu'],
  td: ['ro', 'bg', 'md', 'ad', 'ne'],
  no: ['is', 'dk', 'fi', 'se', 'fr', 'nl', 'is'],
  dk: ['no', 'se', 'fi', 'is', 'ch'],
  se: ['no', 'dk', 'fi', 'is', 'ua'],
  fi: ['no', 'se', 'dk', 'is', 'ee'],
  ch: ['dk', 'ge', 'gb', 'to', 'at'],
  nz: ['au', 'fj', 'tv', 'ws'],
  au: ['nz', 'fj', 'tv', 'gb', 'ws'],
  in: ['ng', 'it', 'mx', 'ie', 'bd'],
  ng: ['in', 'ie', 'it', 'mx', 'gh'],
  cm: ['sn', 'ml', 'gn', 'gh'],
  sn: ['ml', 'gn', 'cm', 'gh', 'ci'],
  tz: ['ug', 'ke', 'rw', 'et'],
  co: ['ve', 'ec', 'pe'],
  ve: ['co', 'ec', 'pe'],
  ec: ['co', 've', 'pe'],
  ar: ['uy', 'ni', 'gt', 'hn', 'sv'],
  uy: ['ar', 'ni', 'gt', 'py'],
  sa: ['ye', 'jo', 'ps', 'ae', 'iq'],
  ye: ['sa', 'jo', 'ps', 'sy', 'de', 'be'],
  ae: ['kw', 'jo', 'ps', 'ye', 'sa'],
  kw: ['ae', 'sa', 'jo', 'ps'],
  my: ['id', 'us', 'lr', 'sg'],
  id: ['my', 'mc', 'pl', 'sg'],
  mc: ['id', 'pl', 'sg', 'fr'],
  pl: ['mc', 'id', 'sg', 'at', 'cz'],
  jp: ['bd', 'tr', 'ge', 'la'],
  bd: ['jp', 'tr', 'pk', 'in'],
  tr: ['jp', 'bd', 'pk', 'dz'],
  cn: ['kp', 'vn', 'la', 'kr'],
  kp: ['cn', 'vn', 'la', 'kr'],
  kr: ['kp', 'cn', 'vn'],
  ua: ['se', 'kz', 'pw', 'ba', 'ru'],
  kz: ['ua', 'se', 'pw', 'ru'],
  hr: ['fr', 'nl', 'ru', 'si', 'sk', 'rs'],
  si: ['fr', 'nl', 'ru', 'hr', 'sk'],
  sk: ['fr', 'nl', 'ru', 'hr', 'si', 'cz'],
  cz: ['fr', 'nl', 'ru', 'sk', 'pl'],
  lu: ['fr', 'nl', 'be', 'de'],
  is: ['no', 'dk', 'fi', 'se'],
  rs: ['fr', 'nl', 'ru', 'hr', 'ba'],
  hu: ['it', 'mx', 'bg', 'ro'],
  bg: ['it', 'mx', 'hu', 'ro'],
  by: ['it', 'mx', 'ru', 'ua'],
  ir: ['it', 'mx', 'ng'],
  ci: ['ie', 'ng', 'it', 'gh'],
  ml: ['sn', 'gn', 'cm'],
  gn: ['sn', 'ml', 'cm'],
  gh: ['cm', 'sn', 'et', 'ng'],
  ug: ['tz', 'ke', 'rw'],
  ke: ['tz', 'ug', 'et'],
  pe: ['co', 've', 'ec'],
  ni: ['ar', 'uy', 'gt', 'hn'],
  gt: ['ar', 'uy', 'hn', 'sv'],
  hn: ['ar', 'gt', 'sv', 'ni'],
  sv: ['ar', 'gt', 'hn'],
  jo: ['sa', 'ye', 'ps', 'ae'],
  ps: ['sa', 'ye', 'jo', 'ae'],
  sy: ['ye', 'jo', 'iq', 'lb'],
  at: ['de', 'pl', 'ch', 'si'],
  ge: ['ch', 'am', 'az', 'tr'],
  gb: ['ie', 'au', 'nz', 'ch'],
  us: ['my', 'lr', 'ca', 'mx'],
  lr: ['us', 'my'],
  lv: ['ru', 'ee', 'lt'],
  ee: ['fi', 'de', 'be', 'lv'],
  ao: ['de', 'be', 'mz'],
  md: ['ro', 'td', 'ua'],
  ad: ['ro', 'td', 'es', 'fr'],
  ba: ['hr', 'rs', 'si', 'ua'],
  pw: ['ua', 'kz', 'mh'],
  la: ['cn', 'vn', 'kh', 'th'],
  vn: ['cn', 'la', 'kh', 'th'],
  pk: ['bd', 'tr', 'in', 'af'],
  dz: ['tr', 'ma', 'tn'],
  ma: ['dz', 'tn', 'es'],
  eg: ['sa', 'ly', 'sd'],
  za: ['na', 'bw', 'zw'],
  br: ['ar', 'uy', 'py'],
  es: ['pt', 'ad', 'mx'],
  pt: ['es', 'br'],
  gr: ['cy', 'tr', 'bg'],
  ca: ['us', 'gb', 'fr'],
  il: ['jo', 'ps', 'lb'],
  lb: ['jo', 'il', 'sy'],
  iq: ['sa', 'sy', 'ir'],
  et: ['ke', 'tz', 'gh', 'ug'],
  cd: ['cg', 'ao', 'tz'],
  bo: ['pe', 'py', 'ar'],
  py: ['ar', 'uy', 'bo'],
  th: ['la', 'vn', 'kh', 'my'],
  ph: ['my', 'id', 'sg'],
  sg: ['my', 'id', 'mc'],
  lk: ['in', 'bd', 'mv'],
  am: ['ge', 'az', 'tr'],
  az: ['ge', 'am', 'tr'],
  mn: ['kz', 'cn', 'ru'],
  af: ['pk', 'ir', 'tj'],
  kh: ['la', 'th', 'vn'],
  mm: ['th', 'la', 'bd'],
  np: ['in', 'bt', 'bd'],
  bt: ['np', 'in', 'bd'],
  mv: ['lk', 'in', 'bd'],
  fj: ['au', 'nz', 'ws'],
  ws: ['fj', 'au', 'nz'],
  tv: ['au', 'nz', 'fj'],
  to: ['fj', 'ws', 'nz'],
  rw: ['ug', 'tz', 'bi', 'ke'],
  bi: ['rw', 'tz', 'ug'],
};

/** Alias historiques / territoires → ISO du pool. */
const ISO_ALIASES: Record<string, string> = {
  'gb-eng': 'GB',
  yu: 'RS',
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function normalizeSimilarIso(code: string): string {
  const lower = code.toLowerCase();
  const aliased = ISO_ALIASES[lower] ?? lower;
  return aliased.toUpperCase();
}

function findInPool(pool: Country[], isoLike: string): Country | undefined {
  const target = normalizeSimilarIso(isoLike);
  return pool.find((c) => c.iso_code.toUpperCase() === target);
}

function getSimilarCandidates(correct: Country, pool: Country[]): Country[] {
  const key = correct.iso_code.toLowerCase();
  const similarIsos = SIMILAR_FLAGS[key] ?? [];
  const seen = new Set<string>([correct.iso_code.toUpperCase()]);
  const result: Country[] = [];

  for (const iso of similarIsos) {
    const country = findInPool(pool, iso);
    if (country && !seen.has(country.iso_code.toUpperCase())) {
      result.push(country);
      seen.add(country.iso_code.toUpperCase());
    }
  }

  return result;
}

function sameContinentCandidates(
  correct: Country,
  pool: Country[],
  excludeIsos: Set<string>,
): Country[] {
  const continent = getContinent(correct.iso_code);
  return pool.filter(
    (c) =>
      !excludeIsos.has(c.iso_code.toUpperCase()) &&
      getContinent(c.iso_code) === continent,
  );
}

function randomFromPool(
  pool: Country[],
  exclude: Set<string>,
  n: number,
): Country[] {
  const available = shuffle(
    pool.filter((c) => !exclude.has(c.iso_code.toUpperCase())),
  );
  return available.slice(0, n);
}

function fillSlots(
  picked: Country[],
  correct: Country,
  pool: Country[],
  need: number,
): Country[] {
  const exclude = new Set([
    correct.iso_code.toUpperCase(),
    ...picked.map((c) => c.iso_code.toUpperCase()),
  ]);

  if (picked.length >= need) return picked.slice(0, need);

  const continentFill = shuffle(sameContinentCandidates(correct, pool, exclude));
  for (const c of continentFill) {
    if (picked.length >= need) break;
    picked.push(c);
    exclude.add(c.iso_code.toUpperCase());
  }

  if (picked.length >= need) return picked.slice(0, need);

  const randomFill = randomFromPool(pool, exclude, need - picked.length);
  picked.push(...randomFill);

  return picked.slice(0, need);
}

/**
 * Choisit 3 mauvaises réponses selon la difficulté et la carte de similarité.
 */
export function pickSimilarWrongCountries(
  correct: Country,
  pool: Country[],
  difficulty: Difficulty,
): Country[] {
  const similar = getSimilarCandidates(correct, pool);

  if (difficulty === 'facile') {
    const fromSimilar = shuffle(similar).slice(0, Math.min(2, similar.length));
    return fillSlots(fromSimilar, correct, pool, 3);
  }

  if (difficulty === 'normal') {
    const similarCount =
      similar.length >= 3 ? 3 : similar.length >= 2 ? 2 : similar.length;
    const fromSimilar = shuffle(similar).slice(0, similarCount);
    return fillSlots(fromSimilar, correct, pool, 3);
  }

  // Difficile, Extrême, Impossible : 3 réponses depuis le groupe de similarité
  const fromSimilar = shuffle(similar).slice(0, 3);
  return fillSlots(fromSimilar, correct, pool, 3);
}
