/** Generates src/data/countries.ts — run: node scripts/generate-countries.mjs */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const s1 =
  'fr de us jp br it gb ca au es cn in mx kr ar ru sa tr id za'.split(' ');
const s2 =
  'pt nl be ch at se no dk fi pl cz hu ro gr ua co ve cl pe cu ma eg ng ke gh et dz tn sn cm ir iq il pk bd th vn ph my sg nz ie hr rs sk si bg lt lv ee'.split(
    ' ',
  );
const s3 =
  'jo lb sy ye om qa bh kw ae ly sd ml gn ci mz tz ug rw ao zm zw mg bo py uy ec gt hn sv ni cr pa do jm tt ge am az kz uz by md al mk xk ba me cy mt is lu kh la mm np lk mn af tm kg tj pg fj sb vu ws to ht bz gy sr bs'.split(
    ' ',
  );
const s4 =
  'ad mc sm va li mv bt tl bn pw fm mh ki nr tv km st cv gw gq ga cg cd cf td ne bf bj tg sl lr gm mr dj er so bi mw ls sz na bw sc mu dm lc vc gd bb ag kn tw ps'.split(
    ' ',
  );

const NAMES = {
  fr: 'France',
  de: 'Allemagne',
  us: 'USA',
  jp: 'Japon',
  br: 'Brésil',
  it: 'Italie',
  gb: 'Royaume-Uni',
  ca: 'Canada',
  au: 'Australie',
  es: 'Espagne',
  cn: 'Chine',
  in: 'Inde',
  mx: 'Mexique',
  kr: 'Corée du Sud',
  ar: 'Argentine',
  ru: 'Russie',
  sa: 'Arabie Saoudite',
  tr: 'Turquie',
  id: 'Indonésie',
  za: 'Afrique du Sud',
  pt: 'Portugal',
  nl: 'Pays-Bas',
  be: 'Belgique',
  ch: 'Suisse',
  at: 'Autriche',
  se: 'Suède',
  no: 'Norvège',
  dk: 'Danemark',
  fi: 'Finlande',
  pl: 'Pologne',
  cz: 'République Tchèque',
  hu: 'Hongrie',
  ro: 'Roumanie',
  gr: 'Grèce',
  ua: 'Ukraine',
  co: 'Colombie',
  ve: 'Venezuela',
  cl: 'Chili',
  pe: 'Pérou',
  cu: 'Cuba',
  ma: 'Maroc',
  eg: 'Égypte',
  ng: 'Nigeria',
  ke: 'Kenya',
  gh: 'Ghana',
  et: 'Éthiopie',
  dz: 'Algérie',
  tn: 'Tunisie',
  sn: 'Sénégal',
  cm: 'Cameroun',
  ir: 'Iran',
  iq: 'Irak',
  il: 'Israël',
  pk: 'Pakistan',
  bd: 'Bangladesh',
  th: 'Thaïlande',
  vn: 'Vietnam',
  ph: 'Philippines',
  my: 'Malaisie',
  sg: 'Singapour',
  nz: 'Nouvelle-Zélande',
  ie: 'Irlande',
  hr: 'Croatie',
  rs: 'Serbie',
  sk: 'Slovaquie',
  si: 'Slovénie',
  bg: 'Bulgarie',
  lt: 'Lituanie',
  lv: 'Lettonie',
  ee: 'Estonie',
  jo: 'Jordanie',
  lb: 'Liban',
  sy: 'Syrie',
  ye: 'Yémen',
  om: 'Oman',
  qa: 'Qatar',
  bh: 'Bahreïn',
  kw: 'Koweït',
  ae: 'Émirats arabes unis',
  ly: 'Libye',
  sd: 'Soudan',
  ml: 'Mali',
  gn: 'Guinée',
  ci: "Côte d'Ivoire",
  mz: 'Mozambique',
  tz: 'Tanzanie',
  ug: 'Ouganda',
  rw: 'Rwanda',
  ao: 'Angola',
  zm: 'Zambie',
  zw: 'Zimbabwe',
  mg: 'Madagascar',
  bo: 'Bolivie',
  py: 'Paraguay',
  uy: 'Uruguay',
  ec: 'Équateur',
  gt: 'Guatemala',
  hn: 'Honduras',
  sv: 'Salvador',
  ni: 'Nicaragua',
  cr: 'Costa Rica',
  pa: 'Panama',
  do: 'République Dominicaine',
  jm: 'Jamaïque',
  tt: 'Trinité-et-Tobago',
  ge: 'Géorgie',
  am: 'Arménie',
  az: 'Azerbaïdjan',
  kz: 'Kazakhstan',
  uz: 'Ouzbékistan',
  by: 'Biélorussie',
  md: 'Moldavie',
  al: 'Albanie',
  mk: 'Macédoine du Nord',
  xk: 'Kosovo',
  ba: 'Bosnie',
  me: 'Monténégro',
  cy: 'Chypre',
  mt: 'Malte',
  is: 'Islande',
  lu: 'Luxembourg',
  kh: 'Cambodge',
  la: 'Laos',
  mm: 'Myanmar',
  np: 'Népal',
  lk: 'Sri Lanka',
  mn: 'Mongolie',
  af: 'Afghanistan',
  tm: 'Turkménistan',
  kg: 'Kirghizistan',
  tj: 'Tadjikistan',
  pg: 'Papouasie-Nouvelle-Guinée',
  fj: 'Fidji',
  sb: 'Îles Salomon',
  vu: 'Vanuatu',
  ws: 'Samoa',
  to: 'Tonga',
  ht: 'Haïti',
  bz: 'Belize',
  gy: 'Guyana',
  sr: 'Suriname',
  bs: 'Bahamas',
  ad: 'Andorre',
  mc: 'Monaco',
  sm: 'Saint-Marin',
  va: 'Vatican',
  li: 'Liechtenstein',
  mv: 'Maldives',
  bt: 'Bhoutan',
  tl: 'Timor Oriental',
  bn: 'Brunei',
  pw: 'Palau',
  fm: 'Micronésie',
  mh: 'Îles Marshall',
  ki: 'Kiribati',
  nr: 'Nauru',
  tv: 'Tuvalu',
  km: 'Comores',
  st: 'São Tomé-et-Príncipe',
  cv: 'Cap-Vert',
  gw: 'Guinée-Bissau',
  gq: 'Guinée équatoriale',
  ga: 'Gabon',
  cg: 'Congo',
  cd: 'RDC',
  cf: 'Centrafrique',
  td: 'Tchad',
  ne: 'Niger',
  bf: 'Burkina Faso',
  bj: 'Bénin',
  tg: 'Togo',
  sl: 'Sierra Leone',
  lr: 'Libéria',
  gm: 'Gambie',
  mr: 'Mauritanie',
  dj: 'Djibouti',
  er: 'Érythrée',
  so: 'Somalie',
  bi: 'Burundi',
  mw: 'Malawi',
  ls: 'Lesotho',
  sz: 'Eswatini',
  na: 'Namibie',
  bw: 'Botswana',
  sc: 'Seychelles',
  mu: 'Maurice',
  dm: 'Dominique',
  lc: 'Sainte-Lucie',
  vc: 'Saint-Vincent',
  gd: 'Grenade',
  bb: 'Barbade',
  ag: 'Antigua',
  kn: 'Saint-Kitts',
  tw: 'Taïwan',
  ps: 'Palestine',
};

function flagEmoji(iso) {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function buildDifficultyMap() {
  const map = {};
  for (const iso of s1) map[iso] = 1;

  for (const iso of s2.slice(0, 30)) map[iso] = 2;

  for (const iso of s2.slice(30)) map[iso] = 3;
  for (const iso of s3.slice(0, 10)) map[iso] = 3;

  const tier4Candidates = [...s3.slice(10), ...s4.filter((c) => !map[c])];
  for (const iso of tier4Candidates.slice(0, 50)) map[iso] = 4;

  return map;
}

const difficultyMap = buildDifficultyMap();
const allIsos = [...new Set([...s1, ...s2, ...s3, ...s4])].sort();

function assignDifficulty(iso) {
  return difficultyMap[iso] ?? 5;
}

if (allIsos.length !== 195) {
  console.error('Expected 195 countries, got', allIsos.length);
  process.exit(1);
}

for (const iso of allIsos) {
  if (!NAMES[iso]) {
    console.error('Missing French name for', iso);
    process.exit(1);
  }
}

const byDiff = { 1: [], 2: [], 3: [], 4: [], 5: [] };
for (const iso of allIsos) {
  const d = assignDifficulty(iso);
  byDiff[d].push(iso);
}

for (let d = 1; d <= 5; d++) {
  const cum = Object.entries(byDiff)
    .filter(([k]) => Number(k) <= d)
    .reduce((n, [, arr]) => n + arr.length, 0);
  console.log(`Tier ${d}: ${byDiff[d].length} (cumulative ${cum})`);
}

const lines = allIsos.map((iso) => {
  const d = assignDifficulty(iso);
  return `  { name_fr: '${NAMES[iso].replace(/'/g, "\\'")}', iso_code: '${iso}', flag_emoji: '${flagEmoji(iso)}', difficulty: ${d} },`;
});

const content = `import type { Country, Difficulty } from '../types';
import { pickSimilarWrongCountries } from './flagSimilarity';
import { DIFFICULTY_TIER } from '../utils/scoring';
import { isValidIsoCode } from '../utils/flags';

/** 195 pays · Tier 1 (20) · Tier 2 (+30 → 50) · Tier 3 (+30 → 80) · Tier 4 (+50 → 130) · Tier 5 (+65 → 195) */
export const COUNTRIES: Country[] = [
${lines.join('\n')}
];

export function getPoolForDifficulty(difficulty: Difficulty): Country[] {
  const maxTier = DIFFICULTY_TIER[difficulty];
  return COUNTRIES.filter((c) => c.difficulty <= maxTier);
}

export function getCountryCount(difficulty: Difficulty): number {
  return getPoolForDifficulty(difficulty).length;
}

function uid(): string {
  return \`\${Date.now()}-\${Math.random().toString(36).slice(2, 9)}\`;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateFlagQuestions(
  difficulty: Difficulty,
  count: number = 10,
): import('../types').FlagQuestion[] {
  const pool = getPoolForDifficulty(difficulty);
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  const questions: import('../types').FlagQuestion[] = [];

  for (const country of selected) {
    const wrongCountries = pickSimilarWrongCountries(country, pool, difficulty);
    const wrong = wrongCountries.map((c) => c.name_fr);
    const options = shuffle([country.name_fr, ...wrong]);
    questions.push({
      id: uid(),
      country,
      options,
      correctAnswer: country.name_fr,
    });
  }

  return shuffle(questions);
}

/** Vérifie que chaque pays a un code ISO 3166-1 alpha-2 valide (2 lettres). */
COUNTRIES.forEach((c) => {
  if (!isValidIsoCode(c.iso_code)) {
    throw new Error(\`Code ISO invalide pour \${c.name_fr}: "\${c.iso_code}"\`);
  }
});
`;

writeFileSync(join(__dirname, '../src/data/countries.ts'), content, 'utf8');
console.log('Wrote src/data/countries.ts');
