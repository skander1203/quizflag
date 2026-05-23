import type { Difficulty } from '../types';
import { getCountryCount } from '../data/countries';

export interface DifficultyOption {
  id: Difficulty;
  emoji: string;
  label: string;
  description: string;
  countryCount: number;
  gradientClass: string;
  glowColor: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'facile',
    emoji: '😊',
    label: 'Facile',
    description: 'Les pays les plus connus',
    countryCount: getCountryCount('facile'),
    gradientClass: 'from-[#22c55e] to-[#16a34a]',
    glowColor: 'rgba(34, 197, 94, 0.5)',
  },
  {
    id: 'normal',
    emoji: '🌍',
    label: 'Normal',
    description: 'Tour du monde classique',
    countryCount: getCountryCount('normal'),
    gradientClass: 'from-[#3b82f6] to-[#1d4ed8]',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'difficile',
    emoji: '🔥',
    label: 'Difficile',
    description: 'Pour les vrais géographes',
    countryCount: getCountryCount('difficile'),
    gradientClass: 'from-[#f97316] to-[#ea580c]',
    glowColor: 'rgba(249, 115, 22, 0.5)',
  },
  {
    id: 'extreme',
    emoji: '⚡',
    label: 'Extrême',
    description: 'Micro-nations et îles perdues',
    countryCount: getCountryCount('extreme'),
    gradientClass: 'from-[#ef4444] to-[#b91c1c]',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'impossible',
    emoji: '💀',
    label: 'Impossible',
    description: 'Seuls les légendes survivent',
    countryCount: getCountryCount('impossible'),
    gradientClass: 'from-[#7c3aed] to-[#1a0533]',
    glowColor: 'rgba(124, 58, 237, 0.55)',
  },
];
