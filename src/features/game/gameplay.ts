import {
  ATTRIBUTE_KEYS,
  type SalaryMonAppearance,
  type SalaryMon,
  type SalaryMonAttributeKey,
  type SalaryMonAttributes,
  type SalaryMonPalette,
  type SalaryMonStatus,
} from './types';

export const XP_PER_MINUTE = 10;
export const LEVEL_MULTIPLIER = 1000;
export const BASE_UPGRADE_COST = 60;
export const UPGRADE_STEP_COST = 15;

type RawSalaryMon = Partial<SalaryMon> & {
  attributes?: Partial<SalaryMonAttributes>;
  appearance?: Partial<SalaryMonAppearance>;
  status?: SalaryMonStatus | 'hungry' | 'fed' | 'sleeping';
};

export function createDefaultAttributes(): SalaryMonAttributes {
  return {
    efficiency: 0,
    marketing: 0,
    energy: 0,
    research: 0,
    talent: 0,
  };
}

export function createDefaultAppearance(): SalaryMonAppearance {
  return {
    palette: 'classic',
  };
}

function createStarterName(preferredName?: string | null) {
  if (!preferredName) {
    return 'Mon-mon';
  }

  const seed = preferredName.trim().split(/\s+/)[0];

  if (!seed) {
    return 'Mon-mon';
  }

  return `${seed.slice(0, 12)}-mon`;
}

export function calculateLevel(experience: number) {
  let level = 1;

  while (experience >= level * LEVEL_MULTIPLIER) {
    level += 1;
  }

  return level;
}

export function getLevelProgress(experience: number, level: number) {
  const currentLevelFloor = (level - 1) * LEVEL_MULTIPLIER;
  const nextLevelXp = level * LEVEL_MULTIPLIER;
  const currentXp = experience - currentLevelFloor;
  const requiredXp = nextLevelXp - currentLevelFloor;
  const percentage = Math.min(100, Math.max(0, (currentXp / requiredXp) * 100));

  return {
    currentLevelFloor,
    nextLevelXp,
    currentXp,
    requiredXp,
    percentage,
  };
}

export function getUpgradeCost(attributeValue: number) {
  return BASE_UPGRADE_COST + attributeValue * UPGRADE_STEP_COST;
}

function mapLegacyStatus(status?: RawSalaryMon['status']): SalaryMonStatus {
  if (status === 'working') {
    return 'working';
  }

  if (status === 'resting' || status === 'fed' || status === 'sleeping') {
    return 'resting';
  }

  return 'idle';
}

function estimateSpentXp(attributes: SalaryMonAttributes) {
  return ATTRIBUTE_KEYS.reduce((total, key) => total + attributes[key], 0);
}

export function createStarterSalaryMon(userId: string, preferredName?: string | null): SalaryMon {
  return {
    id: userId,
    userId,
    name: createStarterName(preferredName),
    level: 1,
    experience: 0,
    availableXp: 0,
    spentXp: 0,
    status: 'idle',
    attributes: createDefaultAttributes(),
    appearance: createDefaultAppearance(),
  };
}

export function normalizeSalaryMon(
  userId: string,
  raw?: RawSalaryMon,
  preferredName?: string | null,
): SalaryMon {
  const starter = createStarterSalaryMon(userId, preferredName);
  const attributes = {
    ...starter.attributes,
    ...raw?.attributes,
  };
  const appearance = {
    ...starter.appearance,
    ...raw?.appearance,
  };

  const experience = typeof raw?.experience === 'number' ? raw.experience : 0;
  const spentXp =
    typeof raw?.spentXp === 'number' ? raw.spentXp : estimateSpentXp(attributes);
  const availableXp =
    typeof raw?.availableXp === 'number'
      ? raw.availableXp
      : Math.max(0, experience - spentXp);

  return {
    id: raw?.id || starter.id,
    userId: raw?.userId || userId,
    name: raw?.name || starter.name,
    level:
      typeof raw?.level === 'number' && raw.level > 0
        ? raw.level
        : calculateLevel(experience),
    experience,
    availableXp,
    spentXp,
    status: mapLegacyStatus(raw?.status),
    attributes,
    appearance,
  };
}

export function getMigrationPatch(raw: RawSalaryMon | undefined, normalized: SalaryMon) {
  if (!raw) {
    return normalized;
  }

  const patch: Partial<SalaryMon> = {};

  if (raw.id !== normalized.id) {
    patch.id = normalized.id;
  }

  if (raw.userId !== normalized.userId) {
    patch.userId = normalized.userId;
  }

  if (raw.name !== normalized.name) {
    patch.name = normalized.name;
  }

  if (raw.level !== normalized.level) {
    patch.level = normalized.level;
  }

  if (raw.experience !== normalized.experience) {
    patch.experience = normalized.experience;
  }

  if (raw.availableXp !== normalized.availableXp) {
    patch.availableXp = normalized.availableXp;
  }

  if (raw.spentXp !== normalized.spentXp) {
    patch.spentXp = normalized.spentXp;
  }

  if (mapLegacyStatus(raw.status) !== normalized.status) {
    patch.status = normalized.status;
  }

  if (
    !raw.attributes ||
    ATTRIBUTE_KEYS.some((key) => raw.attributes?.[key] !== normalized.attributes[key])
  ) {
    patch.attributes = normalized.attributes;
  }

  if (!raw.appearance || raw.appearance.palette !== normalized.appearance.palette) {
    patch.appearance = normalized.appearance;
  }

  return patch;
}

export function buildPetRename(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return null;
  }

  return {
    name: trimmed.slice(0, 24),
  };
}

export function buildPaletteUpdate(palette: SalaryMonPalette) {
  return {
    appearance: {
      palette,
    },
  };
}

export function buildAttributeUpgrade(pet: SalaryMon, attribute: SalaryMonAttributeKey) {
  const cost = getUpgradeCost(pet.attributes[attribute]);

  if (pet.availableXp < cost) {
    return null;
  }

  return {
    availableXp: pet.availableXp - cost,
    spentXp: pet.spentXp + cost,
    attributes: {
      ...pet.attributes,
      [attribute]: pet.attributes[attribute] + 1,
    },
  };
}

export function awardSessionXp(pet: SalaryMon, durationMinutes: number) {
  const safeDuration = Math.max(0, durationMinutes);
  const xpEarned = safeDuration * XP_PER_MINUTE;
  const experience = pet.experience + xpEarned;

  return {
    xpEarned,
    patch: {
      experience,
      availableXp: pet.availableXp + xpEarned,
      level: calculateLevel(experience),
      status: 'resting' as SalaryMonStatus,
    },
  };
}
