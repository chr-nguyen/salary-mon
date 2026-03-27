export const ATTRIBUTE_KEYS = ['efficiency', 'marketing', 'energy', 'research', 'talent'] as const;

export type SalaryMonAttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export type SalaryMonAttributes = Record<SalaryMonAttributeKey, number>;

export type SalaryMonStatus = 'idle' | 'working' | 'resting';

export type SalaryMonPalette = 'classic' | 'ocean' | 'forest' | 'plasma' | 'sunset';

export interface SalaryMonAppearance {
  palette: SalaryMonPalette;
}

export interface SalaryMon {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  availableXp: number;
  spentXp: number;
  status: SalaryMonStatus;
  attributes: SalaryMonAttributes;
  appearance: SalaryMonAppearance;
}

export const ATTRIBUTE_LABELS: Record<SalaryMonAttributeKey, string> = {
  efficiency: 'Efficiency',
  marketing: 'Marketing',
  energy: 'Energy',
  research: 'Research',
  talent: 'Talent',
};

export const ATTRIBUTE_DESCRIPTIONS: Record<SalaryMonAttributeKey, string> = {
  efficiency: 'Finish more work in fewer focused sessions.',
  marketing: 'Grow your social edge and future battle buffs.',
  energy: 'Keep longer streaks and stronger recovery options.',
  research: 'Unlock smarter tactics and support skills later.',
  talent: 'Your all-around flair and rare move potential.',
};

export const PALETTE_LABELS: Record<SalaryMonPalette, string> = {
  classic: 'Classic',
  ocean: 'Ocean',
  forest: 'Forest',
  plasma: 'Plasma',
  sunset: 'Sunset',
};
