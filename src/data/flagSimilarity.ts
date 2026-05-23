import type { Country, Difficulty } from '../types';
import { getContinent } from './isoContinent';

/**
 * Drapeaux visuellement proches (codes ISO minuscules).
 * Clé = pays correct ; valeurs = distracteurs plausibles (ordre = similarité décroissante).
 */
export const flagSimilarity: Record<string, readonly string[]> = {
  fr: ['nl', 'ru', 'hr', 'si', 'sk', 'lu', 'rs', 'cz'],
  nl: ['fr', 'ru', 'hr', 'lu', 'rs', 'py'],
  ru: ['fr', 'nl', 'hr', 'si', 'sk', 'rs', 'cz', 'lv', 'by'],
  de: ['be', 'ye', 'ee', 'ao'],
  be: ['de', 'ye', 'ee', 'ao'],
  it: ['mx', 'hu', 'bg', 'ir', 'ng', 'by', 'ci', 'ie'],
  mx: ['it', 'hu', 'bg', 'ir', 'ng', 'by', 'ci', 'ie'],
  ie: ['it', 'mx', 'ci', 'ng'],
  ci: ['ie', 'it', 'mx', 'ng'],
  ng: ['it', 'mx', 'ie', 'ci'],
  ro: ['td', 'bg', 'md', 'ad'],
  td: ['ro', 'bg', 'md', 'ad'],
  md: ['ro', 'td', 'bg', 'ad'],
  no: ['is', 'dk', 'fi', 'se'],
  dk: ['no', 'se', 'fi', 'is', 'ch'],
  se: ['no', 'dk', 'fi', 'is'],
  fi: ['no', 'se', 'dk', 'is', 'ee'],
  ch: ['dk', 'ge', 'to'],
  in: ['ng', 'it', 'ie', 'mx'],
  au: ['nz', 'fj', 'tv', 'gb'],
  nz: ['au', 'fj', 'tv', 'gb'],
  ar: ['uy', 'ni', 'gt', 'hn', 'sv'],
  uy: ['ar', 'ni', 'gt'],
  gr: ['cy', 'uy', 'fi'],
  sa: ['ye', 'jo', 'ps', 'ae'],
  ye: ['sa', 'jo', 'ps', 'sy', 'de', 'be'],
  ae: ['kw', 'jo', 'ps', 'ye', 'sa'],
  kw: ['ae', 'sa', 'jo', 'ps'],
  jo: ['sa', 'ye', 'ae', 'ps'],
  my: ['us', 'lr', 'pr'],
  us: ['my', 'lr', 'pr', 'ca'],
  lr: ['my', 'us'],
  jp: ['bd', 'tr', 'ge', 'pl'],
  bd: ['jp', 'tr', 'ge', 'pl'],
  cn: ['kp', 'vn', 'la'],
  kp: ['cn', 'vn', 'la', 'kr'],
  vn: ['cn', 'kp', 'la'],
  ua: ['se', 'kz', 'pw', 'ba'],
  kz: ['ua', 'se', 'pw'],
  id: ['mc', 'pl', 'sg', 'my'],
  mc: ['id', 'pl', 'sg'],
  pl: ['mc', 'id', 'sg', 'at', 'pe'],
  at: ['pl', 'pe', 'lv', 'ca'],
  ca: ['at', 'pe', 'lv', 'us'],
  pe: ['at', 'pl', 'ca', 'lv'],
  lv: ['at', 'pe', 'ca', 'au'],
  cm: ['sn', 'ml', 'gn', 'gh', 'et'],
  sn: ['ml', 'gn', 'cm', 'gh'],
  ml: ['sn', 'gn', 'cm', 'gh', 'et'],
  gn: ['ml', 'sn', 'cm', 'gh'],
  gh: ['ml', 'sn', 'gn', 'cm'],
  et: ['ml', 'cm', 'gn', 'sn'],
  co: ['ve', 'ec', 'pe'],
  ve: ['co', 'ec', 'pe'],
  ec: ['co', 've', 'pe'],
  tr: ['jp', 'bd', 'pk', 'dz', 'az'],
  pk: ['tr', 'bd', 'dz', 'az', 'tm'],
  dz: ['tr', 'pk', 'az', 'tm'],
  az: ['tr', 'pk', 'dz', 'tm'],
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
  kr: ['kp', 'cn', 'vn'],
  gb: ['ie', 'au', 'nz', 'ch'],
  br: ['ar', 'uy', 'py'],
  es: ['pt', 'ad', 'mx'],
  pt: ['es', 'br'],
  cy: ['gr', 'tr', 'bg'],
  ps: ['sa', 'ye', 'jo', 'ae'],
  sy: ['ye', 'jo', 'iq', 'lb'],
  lb: ['jo', 'il', 'sy'],
  il: ['jo', 'ps', 'lb'],
  iq: ['sa', 'sy', 'ir'],
  eg: ['sa', 'ly', 'sd'],
  za: ['na', 'bw', 'zw'],
  tz: ['ug', 'ke', 'rw', 'et'],
  ug: ['tz', 'ke', 'rw'],
  ke: ['tz', 'ug', 'et'],
  rw: ['ug', 'tz', 'bi', 'ke'],
  bi: ['rw', 'tz', 'ug'],
  ni: ['ar', 'uy', 'gt', 'hn'],
  gt: ['ar', 'uy', 'hn', 'sv'],
  hn: ['ar', 'gt', 'sv', 'ni'],
  sv: ['ar', 'gt', 'hn'],
  ge: ['ch', 'am', 'az', 'tr'],
  am: ['ge', 'az', 'tr'],
  ba: ['hr', 'rs', 'si', 'ua'],
  pw: ['ua', 'kz', 'mh'],
  la: ['cn', 'vn', 'kh', 'th'],
  th: ['la', 'vn', 'kh', 'my'],
  ph: ['my', 'id', 'sg'],
  sg: ['my', 'id', 'mc'],
  lk: ['in', 'bd', 'mv'],
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
  cd: ['cg', 'ao', 'tz'],
  bo: ['pe', 'py', 'ar'],
  py: ['ar', 'uy', 'bo', 'nl'],
  ma: ['dz', 'tn', 'es'],
  ee: ['fi', 'de', 'be', 'lv'],
  ao: ['de', 'be', 'mz'],
  ad: ['ro', 'td', 'es', 'fr'],
  ne: ['td', 'ro', 'bf'],
  bf: ['ne', 'td', 'ml'],
  bj: ['ng', 'gh', 'tg'],
  tg: ['gh', 'bj', 'sn'],
  sl: ['lr', 'ng', 'gh'],
  gm: ['sn', 'gw', 'lr'],
  gw: ['gn', 'sn', 'gm'],
  gq: ['gn', 'cm', 'ga'],
  ga: ['gq', 'cm', 'cg'],
  cg: ['cd', 'ga', 'ao'],
  cf: ['td', 'ro', 'ne'],
  mw: ['tz', 'zm', 'zw'],
  ls: ['za', 'sz', 'bw'],
  sz: ['za', 'ls', 'bw'],
  na: ['za', 'bw', 'ao'],
  bw: ['za', 'na', 'zw'],
  zm: ['zw', 'mw', 'tz'],
  zw: ['zm', 'za', 'bw'],
  mz: ['ao', 'tz', 'za'],
  mu: ['sc', 'mg', 'za'],
  sc: ['mu', 'mg', 'km'],
  km: ['mg', 'mu', 'tz'],
  mg: ['km', 'mu', 'tz'],
  mr: ['ma', 'dz', 'sn'],
  dj: ['et', 'so', 'er'],
  er: ['et', 'dj', 'sd'],
  so: ['et', 'dj', 'ke'],
  sd: ['eg', 'ly', 'et'],
  ss: ['sd', 'ke', 'et'],
  ly: ['eg', 'sd', 'tn'],
  tn: ['dz', 'ma', 'ly'],
  om: ['ae', 'ye', 'sa'],
  qa: ['bh', 'ae', 'kw'],
  bh: ['qa', 'kw', 'ae'],
  tm: ['az', 'pk', 'tr'],
  tj: ['af', 'uz', 'kg'],
  kg: ['kz', 'uz', 'tj'],
  uz: ['kz', 'tj', 'tm'],
  xk: ['al', 'rs', 'mk'],
  mk: ['xk', 'al', 'gr'],
  al: ['xk', 'mk', 'me'],
  me: ['rs', 'ba', 'al'],
  mt: ['it', 'cy', 'gr'],
  li: ['ch', 'at', 'de'],
  sm: ['it', 'va', 'ch'],
  va: ['it', 'sm', 'ch'],
  bn: ['my', 'id', 'sg'],
  tl: ['id', 'pg', 'au'],
  pg: ['au', 'id', 'fj'],
  sb: ['fj', 'vu', 'pg'],
  vu: ['fj', 'sb', 'au'],
  ht: ['do', 'cu', 'fr'],
  do: ['ht', 'cu', 'pr'],
  cu: ['do', 'ht', 'mx'],
  cr: ['co', 'ni', 'hn'],
  pa: ['co', 'cr', 've'],
  jm: ['ht', 'tt', 'bs'],
  tt: ['jm', 'ht', 'bb'],
  bb: ['tt', 'jm', 'lc'],
  bs: ['us', 'cu', 'jm'],
  bz: ['gt', 'hn', 'sv'],
  gy: ['sr', 've', 'br'],
  sr: ['gy', 've', 'br'],
  dm: ['lc', 'vc', 'gd'],
  lc: ['vc', 'dm', 'gd'],
  vc: ['lc', 'dm', 'gd'],
  gd: ['vc', 'lc', 'dm'],
  ag: ['kn', 'bb', 'tt'],
  kn: ['ag', 'lc', 'bb'],
  tw: ['cn', 'jp', 'kr'],
  st: ['cv', 'gw', 'ao'],
  cv: ['st', 'gw', 'pt'],
  nr: ['au', 'fj', 'tv'],
  ki: ['au', 'fj', 'tv'],
  fm: ['mh', 'pw', 'pg'],
  mh: ['fm', 'pw', 'us'],
  pr: ['us', 'cu', 'do'],
};

/** Alias historiques / territoires → ISO du pool. */
const ISO_ALIASES: Record<string, string> = {
  'gb-eng': 'gb',
  yu: 'rs',
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

function getSimilarCandidates(
  correct: Country,
  pool: Country[],
  shuffleResults: boolean,
): Country[] {
  const key = correct.iso_code.toLowerCase();
  const similarIsos = flagSimilarity[key] ?? [];
  const seen = new Set<string>([correct.iso_code.toUpperCase()]);
  const result: Country[] = [];

  const ordered = shuffleResults ? shuffle([...similarIsos]) : similarIsos;

  for (const iso of ordered) {
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
  const working = [...picked];
  const exclude = new Set([
    correct.iso_code.toUpperCase(),
    ...working.map((c) => c.iso_code.toUpperCase()),
  ]);

  if (working.length >= need) return working.slice(0, need);

  const continentFill = shuffle(sameContinentCandidates(correct, pool, exclude));
  for (const c of continentFill) {
    if (working.length >= need) break;
    working.push(c);
    exclude.add(c.iso_code.toUpperCase());
  }

  if (working.length >= need) return working.slice(0, need);

  const randomFill = randomFromPool(pool, exclude, need - working.length);
  working.push(...randomFill);

  return working.slice(0, need);
}

/**
 * Choisit 3 mauvaises réponses selon la difficulté et la carte de similarité.
 */
export function pickSimilarWrongCountries(
  correct: Country,
  pool: Country[],
  difficulty: Difficulty,
): Country[] {
  if (difficulty === 'facile') {
    const similar = getSimilarCandidates(correct, pool, true);
    const fromSimilar = similar.slice(0, Math.min(1, similar.length));
    const sameTierPool = pool.filter(
      (c) =>
        c.difficulty === correct.difficulty &&
        c.iso_code.toUpperCase() !== correct.iso_code.toUpperCase(),
    );
    const exclude = new Set([
      correct.iso_code.toUpperCase(),
      ...fromSimilar.map((c) => c.iso_code.toUpperCase()),
    ]);
    const randomFromTier = shuffle(
      sameTierPool.filter((c) => !exclude.has(c.iso_code.toUpperCase())),
    ).slice(0, 3 - fromSimilar.length);
    return fillSlots([...fromSimilar, ...randomFromTier], correct, pool, 3);
  }

  if (difficulty === 'normal') {
    const similar = getSimilarCandidates(correct, pool, true);
    const fromSimilar = similar.slice(0, Math.min(2, similar.length));
    return fillSlots(fromSimilar, correct, pool, 3);
  }

  if (difficulty === 'difficile') {
    const similar = getSimilarCandidates(correct, pool, true);
    const target =
      similar.length >= 3 ? 3 : similar.length >= 2 ? 2 + Math.round(Math.random()) : similar.length;
    const fromSimilar = similar.slice(0, Math.min(target, similar.length));
    return fillSlots(fromSimilar, correct, pool, 3);
  }

  if (difficulty === 'extreme') {
    const similar = getSimilarCandidates(correct, pool, true);
    const fromSimilar = similar.slice(0, 3);
    return fillSlots(fromSimilar, correct, pool, 3);
  }

  // Impossible : 3 drapeaux très similaires (ordre de similarité préservé)
  const similar = getSimilarCandidates(correct, pool, false);
  const fromSimilar = similar.slice(0, 3);
  return fillSlots(fromSimilar, correct, pool, 3);
}
