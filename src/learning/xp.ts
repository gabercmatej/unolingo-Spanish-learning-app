import { KIND_DIFFICULTY, KIND_XP, type ExerciseKind, type Grade } from '@/learning/types';

/**
 * XP tracks effort, not activity. Recognising a word you already own pays 1;
 * producing a sentence from scratch pays 5. Repeating trivial exercises on
 * mastered concepts is explicitly capped so grinding cannot inflate the number.
 */

export interface XpInput {
  kind: ExerciseKind;
  grade: Grade;
  hardMode?: boolean;
  /** Current mastery of the concept being tested, 0..1. */
  mastery?: number;
}

export function xpForAnswer({ kind, grade, hardMode, mastery = 0 }: XpInput): number {
  if (grade === 'incorrect') return 0;

  let xp = KIND_XP[kind] ?? 1;
  if (grade === 'almost') xp = Math.ceil(xp / 2);
  if (hardMode) xp += 1;

  // Easy drills on well-mastered concepts stop being worth much.
  if (mastery >= 0.85 && KIND_DIFFICULTY[kind] <= 2) xp = Math.min(xp, 1);

  return xp;
}

/** XP required to go from `level` to `level + 1`. */
export function xpForNextLevel(level: number): number {
  return 100 + 40 * (level - 1);
}

/** Cumulative XP required to reach `level`. */
export function cumulativeXp(level: number): number {
  const steps = level - 1;
  if (steps <= 0) return 0;
  return 100 * steps + 40 * ((steps * (steps - 1)) / 2);
}

export interface LevelInfo {
  level: number;
  /** XP earned since reaching this level. */
  into: number;
  /** XP needed to reach the next level. */
  needed: number;
  progress: number;
}

export function levelInfo(totalXp: number): LevelInfo {
  let level = 1;
  while (cumulativeXp(level + 1) <= totalXp) level += 1;

  const base = cumulativeXp(level);
  const needed = xpForNextLevel(level);
  const into = totalXp - base;
  return { level, into, needed, progress: needed > 0 ? into / needed : 0 };
}
