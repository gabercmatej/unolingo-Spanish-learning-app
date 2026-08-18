import { pushSnapshot, shouldSnapshot, type Snapshot } from '@/learning/backup';
import { storage, StorageKeys } from '@/lib/storage';
import type { LearnerState } from '@/learning/types';

/**
 * Storage for the snapshot ring. The rules about when to take one and how many
 * to keep live in `@/learning/backup`, which is pure and tested; this file is
 * only the part that has to touch AsyncStorage.
 *
 * They sit under their own key so a learner record that fails to parse cannot
 * take its own backups down with it.
 */

export type { Snapshot };

export async function listSnapshots(): Promise<Snapshot[]> {
  const saved = await storage.get<Snapshot[]>(StorageKeys.snapshots);
  return Array.isArray(saved) ? saved : [];
}

/** Records a snapshot if the cadence and the safety rule both allow it. */
export async function maybeSnapshot(state: LearnerState, now = Date.now()): Promise<Snapshot[]> {
  const snapshots = await listSnapshots();
  if (!shouldSnapshot(snapshots, state, now)) return snapshots;
  const next = pushSnapshot(snapshots, state, now);
  await storage.set(StorageKeys.snapshots, next);
  return next;
}

/**
 * Forces a snapshot regardless of cadence — used immediately before anything
 * destructive, which is the one moment a copy is worth more than any schedule.
 */
export async function snapshotNow(state: LearnerState, now = Date.now()): Promise<Snapshot[]> {
  const next = pushSnapshot(await listSnapshots(), state, now);
  await storage.set(StorageKeys.snapshots, next);
  return next;
}
