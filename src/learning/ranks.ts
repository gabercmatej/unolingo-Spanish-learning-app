import { cumulativeXp, levelInfo } from '@/learning/xp';

/**
 * Unolingo ranks.
 *
 * A level number on its own says nothing. A rank says what the number means and
 * what the next one is worth reaching. This is deliberately **not** CEFR: CEFR
 * measures how good your Spanish is, a rank measures how far you have walked.
 * You can be a Hablante with shaky B1 grammar, and that is the honest picture —
 * effort and ability are different axes and the profile shows both.
 *
 * Every rank name is an invariable Spanish noun (principiante, aprendiz,
 * hablante…), so the app never has to guess the learner's gender to address
 * them.
 */

export interface Rank {
  id: string;
  /** Spanish name shown as the title. */
  name: string;
  /** One line: what reaching this rank says about you. */
  tagline: string;
  /** First level in the band. */
  from: number;
  /** Last level in the band, or null for the final open-ended rank. */
  to: number | null;
  /** Palette key for the avatar ring and rank accents. */
  tone: 'textTertiary' | 'tint' | 'listening' | 'story' | 'grammar' | 'accent' | 'success';
  /** Ionicons name, from the app's single icon vocabulary. */
  icon: string;
}

export const RANKS: Rank[] = [
  {
    id: 'principiante',
    name: 'Principiante',
    tagline: 'Your first words in Spanish.',
    from: 1,
    to: 4,
    tone: 'textTertiary',
    icon: 'leaf-outline',
  },
  {
    id: 'aprendiz',
    name: 'Aprendiz',
    tagline: 'Sentences are starting to stick.',
    from: 5,
    to: 9,
    tone: 'tint',
    icon: 'school-outline',
  },
  {
    id: 'hablante',
    name: 'Hablante',
    tagline: 'You can hold your own in a conversation.',
    from: 10,
    to: 19,
    tone: 'listening',
    icon: 'chatbubbles-outline',
  },
  {
    id: 'cronista',
    name: 'Cronista',
    tagline: 'You can tell the whole story, not just the headline.',
    from: 20,
    to: 29,
    tone: 'story',
    icon: 'book-outline',
  },
  {
    id: 'interprete',
    name: 'Intérprete',
    tagline: 'You catch the nuance, not only the words.',
    from: 30,
    to: 39,
    tone: 'grammar',
    icon: 'swap-horizontal-outline',
  },
  {
    id: 'poliglota',
    name: 'Políglota',
    tagline: 'Spanish has stopped being a subject.',
    from: 40,
    to: 49,
    tone: 'accent',
    icon: 'earth-outline',
  },
  {
    id: 'leyenda',
    name: 'Leyenda',
    tagline: 'Nothing left to prove.',
    from: 50,
    to: null,
    tone: 'success',
    icon: 'ribbon-outline',
  },
];

export function rankForLevel(level: number): Rank {
  // Walk backwards so the open-ended final rank catches everything above it.
  for (let i = RANKS.length - 1; i >= 0; i -= 1) {
    if (level >= RANKS[i].from) return RANKS[i];
  }
  return RANKS[0];
}

export function nextRank(level: number): Rank | undefined {
  return RANKS.find((rank) => rank.from > level);
}

/**
 * A level that changes your rank. These are the ones worth a bigger
 * celebration — every other level-up is a step, these are a threshold.
 */
export function isMilestoneLevel(level: number): boolean {
  return RANKS.some((rank) => rank.from === level);
}

export interface RankProgress {
  level: number;
  rank: Rank;
  next?: Rank;
  /** XP into the current level. */
  into: number;
  /** XP the current level costs in total. */
  needed: number;
  /** 0..1 through the current level. */
  progress: number;
  /** XP still to earn before the next level. */
  toNextLevel: number;
  /** XP still to earn before the next rank, or undefined at the final rank. */
  toNextRank?: number;
  /** How far through the current rank band, 0..1. Undefined at the final rank. */
  rankProgress?: number;
}

export function rankProgress(totalXp: number): RankProgress {
  const { level, into, needed, progress } = levelInfo(totalXp);
  const rank = rankForLevel(level);
  const next = nextRank(level);

  const base: RankProgress = {
    level,
    rank,
    next,
    into,
    needed,
    progress,
    toNextLevel: Math.max(0, needed - into),
  };

  if (!next) return base;

  const rankStartXp = cumulativeXp(rank.from);
  const rankEndXp = cumulativeXp(next.from);
  const span = rankEndXp - rankStartXp;

  return {
    ...base,
    toNextRank: Math.max(0, rankEndXp - totalXp),
    rankProgress: span > 0 ? Math.min(1, Math.max(0, (totalXp - rankStartXp) / span)) : 0,
  };
}

/** Total XP needed to first reach a rank — used by the rank journey list. */
export function xpToReachRank(rank: Rank): number {
  return cumulativeXp(rank.from);
}
