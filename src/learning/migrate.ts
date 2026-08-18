import { DEFAULT_SETTINGS, blankLearnerState } from '@/learning/defaults';
import type { LearnerState } from '@/learning/types';

/**
 * Opening a saved record written by a different version of the app.
 *
 * This is the file standing between a schema change and a year of spaced
 * repetition. It exists because the original hydration did the most dangerous
 * possible thing with a record it did not recognise: nothing. A state whose
 * version did not match was skipped, the app carried on with a blank learner,
 * and four hundred milliseconds later the debounced save wrote that blank
 * learner over the record it had just declined to read.
 *
 * So the rule here is that **refusing to read a record must never lead to
 * overwriting it.** Every outcome below is either a state we are confident in,
 * or an explicit refusal that the caller has to handle — there is no path that
 * quietly returns an empty learner, because an empty learner is exactly what a
 * bad write looks like.
 */

/**
 * Steps that carry a record from one schema version to the next, keyed by the
 * version they migrate *from*.
 *
 * Empty today, and deliberately so: the schema has only ever been version 1, and
 * inventing migrations for structures that do not exist yet would be testing
 * fiction. What matters now is that the seam exists, that the chain is walked,
 * and that a *missing* step refuses rather than guesses — so the first real
 * migration has somewhere to go and cannot be forgotten.
 */
export const MIGRATIONS: Record<number, (state: Record<string, unknown>) => Record<string, unknown>> =
  {};

export type MigrationResult =
  | { ok: true; state: LearnerState; from: number; migrated: boolean; repaired: string[] }
  | { ok: false; reason: string; from: number | null };

/**
 * Fields added since a record was written.
 *
 * Hydration has always merged defaults, which is why adding an optional setting
 * needs no version bump. Naming what it filled turns that from a silent
 * convenience into something a test can assert and a diagnostic can report.
 */
function fillDefaults(state: Record<string, unknown>): { state: LearnerState; repaired: string[] } {
  const blank = blankLearnerState(
    typeof state.createdAt === 'number' ? state.createdAt : Date.now(),
  );
  const repaired: string[] = [];

  const merged = { ...blank } as Record<string, unknown>;
  for (const key of Object.keys(blank) as (keyof LearnerState)[]) {
    const value = state[key];
    if (value === undefined || value === null) {
      if (key !== 'lastStudyDate' && key !== 'placement') repaired.push(key);
      continue;
    }
    merged[key] = value;
  }
  // A null here is meaningful ("never studied", "never placed"), not missing.
  if ('lastStudyDate' in state) merged.lastStudyDate = state.lastStudyDate;
  if ('placement' in state) merged.placement = state.placement;

  // Settings belong to the device, so a missing one takes this build's default
  // rather than blocking the restore.
  const saved = (state.settings ?? {}) as Record<string, unknown>;
  merged.settings = { ...DEFAULT_SETTINGS, ...saved };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!(key in saved)) repaired.push(`settings.${key}`);
  }

  return { state: merged as unknown as LearnerState, repaired };
}

/**
 * The shape a record must have before we will call it a learner.
 *
 * Deliberately the same four collections `parseBackup` insists on, because a
 * record read off the device and a record read out of a file are the same thing
 * arriving by different routes, and it would be strange for one to be trusted
 * more than the other.
 */
function structurallySound(state: Record<string, unknown>): string | null {
  if (!state.concepts || typeof state.concepts !== 'object') return 'its word records are missing';
  if (!state.completedLessons || typeof state.completedLessons !== 'object') {
    return 'its lesson history is missing';
  }
  if (!Array.isArray(state.mistakes)) return 'its mistake list is missing';
  if (!Array.isArray(state.sessions)) return 'its session history is missing';
  return null;
}

/**
 * Brings a saved record up to the current schema, or explains why it cannot.
 *
 * `migrated` distinguishes "this came from an older build and was upgraded"
 * from "this was already current", which the diagnostics report and which is
 * the difference between a successful update and a no-op.
 */
export function migrateState(raw: unknown, currentVersion: number): MigrationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'The saved progress is not in a readable shape.', from: null };
  }

  const state = { ...(raw as Record<string, unknown>) };
  const from = state.version;
  if (typeof from !== 'number' || !Number.isFinite(from)) {
    return { ok: false, reason: 'The saved progress does not say which version wrote it.', from: null };
  }
  if (from > currentVersion) {
    return {
      ok: false,
      reason: 'The saved progress was written by a newer version of Unolingo.',
      from,
    };
  }

  const damage = structurallySound(state);
  if (damage) {
    return { ok: false, reason: `The saved progress is incomplete — ${damage}.`, from };
  }

  let working = state;
  for (let version = from; version < currentVersion; version += 1) {
    const step = MIGRATIONS[version];
    if (!step) {
      // Guessing is how a migration turns into a corruption. Refuse, and let the
      // caller keep the original bytes untouched.
      return {
        ok: false,
        reason: `No way to upgrade progress from version ${version} to ${version + 1}.`,
        from,
      };
    }
    working = step(working);
  }

  const { state: filled, repaired } = fillDefaults(working);
  return {
    ok: true,
    state: { ...filled, version: currentVersion },
    from,
    migrated: from !== currentVersion,
    repaired,
  };
}
