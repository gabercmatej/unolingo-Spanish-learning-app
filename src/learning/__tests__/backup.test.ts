import {
  BACKUP_FORMAT,
  backupFilename,
  buildBackup,
  compareForRestore,
  parseBackup,
  stateFromBackup,
  pushSnapshot,
  shouldSnapshot,
  summarise,
} from '@/learning/backup';
import type { LearnerState } from '@/learning/types';
import { DEFAULT_SETTINGS_FOR_TEST, makeLearner } from './helpers';

/**
 * Restore is the only action in the app that can destroy a year of work in one
 * tap, so these are mostly tests of *refusal*: the file has to prove it is a
 * backup before anything is overwritten.
 */

function busyLearner(): LearnerState {
  return makeLearner({
    xp: 12400,
    longestStreak: 41,
    concepts: {
      'v.hola': { id: 'v.hola' } as never,
      'v.ser': { id: 'v.ser' } as never,
    },
    completedLessons: { 'l.greetings': { at: 1, accuracy: 1, times: 1 } },
    mistakes: [{ id: 'm1' } as never],
  });
}

describe('a backup describes itself', () => {
  it('summarises what is inside without opening the state', () => {
    const file = buildBackup(busyLearner(), 1_700_000_000_000);
    expect(file.summary).toEqual({
      xp: 12400,
      concepts: 2,
      lessons: 1,
      streak: 41,
      mistakes: 1,
      stateVersion: 1,
    });
    expect(file.app).toBe('unolingo');
    expect(file.format).toBe(BACKUP_FORMAT);
  });

  it('names the file so a folder of them sorts chronologically', () => {
    expect(backupFilename(Date.UTC(2026, 2, 9, 14, 5))).toBe('unolingo-backup-2026-03-09-14-05.json');
  });

  it('round-trips through JSON, which is all a file ever is', () => {
    const learner = busyLearner();
    const text = JSON.stringify(buildBackup(learner));
    const parsed = parseBackup(text, 1);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(summarise(parsed.file.state)).toEqual(summarise(learner));
  });
});

describe('restore refuses anything it cannot vouch for', () => {
  const reject = (text: string, version = 1) => {
    const result = parseBackup(text, version);
    expect(result.ok).toBe(false);
    return result.ok ? '' : result.reason;
  };

  it('rejects text that is not JSON at all', () => {
    expect(reject('not a file')).toMatch(/not valid JSON/);
  });

  it('rejects a JSON file that belongs to something else', () => {
    expect(reject(JSON.stringify({ app: 'duolingo', state: {} }))).toMatch(/not a Unolingo/);
  });

  it('rejects a backup from a newer app rather than guessing at its shape', () => {
    const future = { ...buildBackup(busyLearner()), format: BACKUP_FORMAT + 1 };
    expect(reject(JSON.stringify(future))).toMatch(/newer version/);
  });

  it('rejects a newer state version even when the envelope is familiar', () => {
    const file = buildBackup(makeLearner({ version: 99 }));
    expect(reject(JSON.stringify(file), 1)).toMatch(/newer version/);
  });

  it('rejects a truncated file rather than restoring half of it', () => {
    // The realistic corruption: a download cut off mid-array.
    const file = buildBackup(busyLearner());
    const broken = { ...file, state: { ...file.state, mistakes: undefined } };
    expect(reject(JSON.stringify(broken))).toMatch(/incomplete|truncated/);
  });

  it('rejects a backup with no word records', () => {
    const file = buildBackup(busyLearner());
    const broken = { ...file, state: { ...file.state, concepts: undefined } };
    expect(reject(JSON.stringify(broken))).toMatch(/word records/);
  });
});

describe('restore says what it is about to cost', () => {
  it('flags a backup that is behind the device, and by how much', () => {
    const older = makeLearner({ xp: 400, concepts: {}, completedLessons: {} });
    const comparison = compareForRestore(older, busyLearner());
    expect(comparison.losing).toBe(true);
    expect(comparison.xpLost).toBe(12000);
  });

  it('does not cry wolf when the backup is ahead', () => {
    const comparison = compareForRestore(busyLearner(), makeLearner({ xp: 10 }));
    expect(comparison.losing).toBe(false);
    expect(comparison.xpLost).toBe(0);
  });

  it('keeps this device’s settings — a phone backup must not redecorate a laptop', () => {
    const file = buildBackup(makeLearner({ settings: { ...DEFAULT_SETTINGS_FOR_TEST, appearance: 'dark' } }));
    const local = { ...DEFAULT_SETTINGS_FOR_TEST, appearance: 'light' as const };
    expect(stateFromBackup(file, local).settings.appearance).toBe('light');
  });
});

describe('snapshots are taken on a cadence, and never eat themselves', () => {
  const now = Date.UTC(2026, 0, 1, 12);
  const full = busyLearner();
  const ring = (at: number, concepts: number) => [
    { at, summary: { ...summarise(full), concepts }, state: full },
  ];

  it('takes the first one immediately', () => {
    expect(shouldSnapshot([], full, now)).toBe(true);
  });

  it('declines a second one an hour later', () => {
    expect(shouldSnapshot(ring(now - 3600_000, 2), full, now)).toBe(false);
  });

  it('takes one after twelve hours', () => {
    expect(shouldSnapshot(ring(now - 13 * 3600_000, 2), full, now)).toBe(true);
  });

  it('refuses to let a wiped state displace a real one', () => {
    // Otherwise the snapshot taken just after a reset consumes a slot, and three
    // cycles later there is nothing left to go back to.
    const wiped = makeLearner({ concepts: {} });
    expect(shouldSnapshot(ring(now - 13 * 3600_000, 2), wiped, now)).toBe(false);
  });

  it('keeps three and drops the fourth-oldest', () => {
    let snapshots = pushSnapshot([], full, now);
    snapshots = pushSnapshot(snapshots, full, now + 1);
    snapshots = pushSnapshot(snapshots, full, now + 2);
    snapshots = pushSnapshot(snapshots, full, now + 3);
    expect(snapshots).toHaveLength(3);
    expect(snapshots.map((s) => s.at)).toEqual([now + 3, now + 2, now + 1]);
  });
});
