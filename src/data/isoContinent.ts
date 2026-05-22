/** Continent par code ISO (pays du jeu). */
const EUROPE = new Set([
  'FR', 'DE', 'GB', 'IT', 'ES', 'PT', 'GR', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI',
  'PL', 'CZ', 'RO', 'HU', 'SK', 'HR', 'RS', 'BG', 'LT', 'LV', 'EE', 'IE', 'UA', 'RU', 'TR',
  'IS', 'LU', 'LI', 'MC', 'AD', 'VA', 'SM', 'MT', 'BY', 'MD', 'AL', 'MK', 'BA', 'ME', 'SI',
  'XK', 'CY', 'FO', 'GI', 'IM', 'JE', 'GG',
]);

const ASIA = new Set([
  'CN', 'JP', 'IN', 'KR', 'KP', 'VN', 'TH', 'PH', 'PK', 'IR', 'IL', 'SA', 'AE', 'KW', 'QA',
  'OM', 'YE', 'SY', 'IQ', 'JO', 'LB', 'PS', 'TR', 'KZ', 'UZ', 'AZ', 'GE', 'AM', 'BD', 'LK',
  'MY', 'SG', 'ID', 'MN', 'AF', 'KH', 'LA', 'MM', 'NP', 'BT', 'MV', 'BN', 'TL', 'TM', 'TJ',
  'KG', 'HK', 'MO', 'TW',
]);

const AFRICA = new Set([
  'ZA', 'EG', 'NG', 'MA', 'KE', 'DZ', 'TN', 'ET', 'GH', 'SN', 'CI', 'CD', 'TZ', 'UG', 'MG',
  'MU', 'BW', 'NA', 'ZM', 'ZW', 'MZ', 'AO', 'CM', 'CF', 'ML', 'BF', 'NE', 'TD', 'BJ', 'TG',
  'GN', 'SL', 'LR', 'GM', 'GW', 'GQ', 'GA', 'CG', 'LS', 'SZ', 'MW', 'MR', 'CV', 'KM', 'SC',
  'RW', 'BI', 'SD', 'SS', 'ER', 'DJ', 'SO', 'LY', 'EH',
]);

const AMERICAS = new Set([
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'CU', 'GT',
  'HN', 'CR', 'PA', 'DO', 'JM', 'BZ', 'SV', 'NI', 'HT', 'TT', 'BB', 'BS', 'KN', 'GD', 'VC',
  'LC', 'DM', 'AG', 'SR', 'GY', 'PR', 'GF', 'AW', 'CW', 'FK', 'GL', 'BM', 'KY', 'TC', 'AI',
  'MS', 'VI', 'GU',
]);

const OCEANIA = new Set([
  'AU', 'NZ', 'FJ', 'WS', 'TO', 'TV', 'NR', 'PW', 'KI', 'PG', 'SB', 'VU', 'FM', 'MH', 'PF',
  'NC', 'AQ',
]);

export function getContinent(iso: string): string {
  const code = iso.toUpperCase();
  if (EUROPE.has(code)) return 'Europe';
  if (ASIA.has(code)) return 'Asie';
  if (AFRICA.has(code)) return 'Afrique';
  if (AMERICAS.has(code)) return 'Amérique';
  if (OCEANIA.has(code)) return 'Océanie';
  return 'Autre';
}
