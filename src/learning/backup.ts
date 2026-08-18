import type { LearnerState } from '@/learning/types';

/**
 * Backup, restore and the checks that make restore safe.
 *
 * Unolingo keeps everything on the device and asks for no account, which is the
 * right trade for a personal app right up until the moment the device is lost.
 * Hundreds of hours of spaced repetition is not the kind of thing to keep in
 * exactly one place, so this is the seam that gets it out — and, just as
 * importantly, the seam that gets it *back in* without letting a truncated or
 * foreign file overwrite a year of work.
 *
 * The rule throughout: never trust the file. Everything here is pure so the
 * validation can be tested without a filesystem, a picker or a browser.
 */

export const BACKUP_FORMAT = 1;

export interface BackupFile {
  app: 'unolingo';
  /** Format of the envelope, not of the learner state inside it. */
  format: number;
  exportedAt: number;
  /** Summary duplicated outside the state so a file can be described cheaply. */
  summary: BackupSummary;
  state: LearnerState;
}

export interface BackupSummary {
  xp: number;
  concepts: number;
  lessons: number;
  streak: number;
  mistakes: number;
  /** State version, so a restore can refuse a file from a future app. */
  stateVersion: number;
}

export function summarise(state: LearnerState): BackupSummary {
  return {
    xp: state.xp ?? 0,
    concepts: Object.keys(state.concepts ?? {}).length,
    lessons: Object.keys(state.completedLessons ?? {}).length,
    streak: state.longestStreak ?? 0,
    mistakes: (state.mistakes ?? []).length,
    stateVersion: state.version ?? 0,
  };
}

export function buildBackup(state: LearnerState, now = Date.now()): BackupFile {
  return {
    app: 'unolingo',
    format: BACKUP_FORMAT,
    exportedAt: now,
    summary: summarise(state),
    state,
  };
}

/** A filename that sorts chronologically and says what it is. */
export function backupFilename(now = Date.now()): string {
  const iso = new Date(now).toISOString().slice(0, 16).replace(/[:T]/g, '-');
  return `unolingo-backup-${iso}.json`;
}

export type ParseResult =
  | { ok: true; file: BackupFile }
  | { ok: false; reason: string };

/**
 * The shape checks a restore has to pass.
 *
 * These are deliberately specific rather than a blanket try/catch: "that file
 * isn't a Unolingo backup" and "that backup is from a newer version of the app"
 * are different problems with different answers, and a learner staring at a
 * restore dialog deserves to be told which one they have.
 */
export function parseBackup(text: string, currentStateVersion: number): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'That file is not valid JSON — it may have been truncated.' };
  }

  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'That file does not contain a backup.' };
  }
  const file = raw as Partial<BackupFile>;

  if (file.app !== 'unolingo') {
    return { ok: false, reason: 'That is not a Unolingo backup file.' };
  }
  if (typeof file.format !== 'number' || file.format > BACKUP_FORMAT) {
    return { ok: false, reason: 'That backup was made by a newer version of Unolingo.' };
  }

  const state = file.state;
  if (!state || typeof state !== 'object') {
    return { ok: false, reason: 'That backup has no progress in it.' };
  }
  if (typeof state.version !== 'number') {
    return { ok: false, reason: 'That backup is missing its version and cannot be trusted.' };
  }
  if (state.version > currentStateVersion) {
    return { ok: false, reason: 'That backup was made by a newer version of Unolingo.' };
  }
  if (!state.concepts || typeof state.concepts !== 'object') {
    return { ok: false, reason: 'That backup is missing its word records.' };
  }
  if (!state.completedLessons || typeof state.completedLessons !== 'object') {
    return { ok: false, reason: 'That backup is missing its lesson history.' };
  }
  if (!Array.isArray(state.mistakes) || !Array.isArray(state.sessions)) {
    return { ok: false, reason: 'That backup is incomplete — it may have been truncated.' };
  }

  return { ok: true, file: { ...(file as BackupFile), summary: summarise(state) } };
}

/**
 * Everything a learner should be told before a restore overwrites what they
 * have. `losing` is the point: a restore is not additive, and an older backup
 * silently replacing newer progress is the one unrecoverable mistake this
 * feature could cause.
 */
export interface RestoreComparison {
  incoming: BackupSummary;
  current: BackupSummary;
  /** True when the file on disk is behind what is on the device. */
  losing: boolean;
  /** XP the learner gives up by restoring, when that is a positive number. */
  xpLost: number;
}

export function compareForRestore(
  incoming: LearnerState,
  current: LearnerState,
): RestoreComparison {
  const a = summarise(incoming);
  const b = summarise(current);
  return {
    incoming: a,
    current: b,
    losing: a.xp < b.xp || a.concepts < b.concepts || a.lessons < b.lessons,
    xpLost: Math.max(0, b.xp - a.xp),
  };
}

/**
 * The state actually written back on restore.
 *
 * Settings stay local on purpose: appearance, voice and haptics belong to the
 * device you are holding, not to the progress you are moving onto it. Restoring
 * a backup made on a phone should not force dark mode onto a laptop.
 */
export function stateFromBackup(file: BackupFile, localSettings: LearnerState['settings']): LearnerState {
  return { ...file.state, settings: { ...localSettings } };
}

// --- Rolling snapshots ------------------------------------------------------

/**
 * On-device snapshots, and the two rules that decide when one is taken.
 *
 * A file export protects you from losing the device. Snapshots protect you from
 * the two failures that happen far more often and that an export cannot help
 * with, because by the time you notice them the export is already stale: a bad
 * write, and meaning "Reset all progress" for about four seconds.
 *
 * The policy lives here rather than next to AsyncStorage because it is a
 * judgement about learning data, not about storage: how much history is worth
 * keeping, and when a copy is worth taking.
 */
export const MAX_SNAPSHOTS = 3;

/** Three snapshots at this cadence covers roughly a day and a half of mistakes. */
export const SNAPSHOT_INTERVAL_MS = 12 * 60 * 60 * 1000;

export interface Snapshot {
  at: number;
  summary: BackupSummary;
  state: LearnerState;
}

/**
 * Whether a snapshot is due.
 *
 * The second condition is the one that matters: an empty state must never
 * displace a full one. Without it, the snapshot taken in the moments after a
 * reset would consume a slot, and three cycles later there would be nothing to
 * go back to — the backup system quietly eating the backups.
 */
export function shouldSnapshot(snapshots: Snapshot[], state: LearnerState, now: number): boolean {
  const newest = snapshots[0];
  if (newest && now - newest.at < SNAPSHOT_INTERVAL_MS) return false;
  if (newest && newest.summary.concepts > 0 && Object.keys(state.concepts ?? {}).length === 0) {
    return false;
  }
  return true;
}

/** Adds a snapshot to the front of the ring and drops anything past the cap. */
export function pushSnapshot(snapshots: Snapshot[], state: LearnerState, now: number): Snapshot[] {
  return [{ at: now, summary: summarise(state), state }, ...snapshots].slice(0, MAX_SNAPSHOTS);
}
