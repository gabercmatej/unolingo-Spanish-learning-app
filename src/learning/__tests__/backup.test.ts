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
import { migrateState } from '@/learning/migrate';
import { STATE_VERSION } from '@/learning/schema';
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

/**
 * The whole journey, as a learner actually takes it: study for months, export,
 * lose the phone, install on a new one, import.
 *
 * The existing round-trip above compares `summarise()`, which is six numbers —
 * enough to prove the file parses, not enough to prove the *progress* survived.
 * A backup that restored every count correctly while dropping every concept's
 * stability would pass it and lose the spaced repetition entirely.
 */
describe('a backup survives a reinstall', () => {
  const NOW = Date.UTC(2026, 4, 1, 9);

  function monthsOfWork(): LearnerState {
    return makeLearner({
      xp: 41_250,
      streak: 12,
      longestStreak: 63,
      lastStudyDate: '2026-04-30',
      totalSeconds: 187_400,
      onboarded: true,
      createdAt: Date.UTC(2025, 8, 14),
      placement: { level: 'A2', at: Date.UTC(2025, 8, 14) } as never,
      favourites: ['v.quedar', 'g.subjunctive-present'],
      concepts: {
        'v.quedar': {
          id: 'v.quedar', firstSeen: 1, lastReviewed: NOW - 86_400_000, timesSeen: 31,
          correct: 26, incorrect: 5, lapses: 2, streak: 4, strength: 0.74,
          stability: 18.5, ease: 2.31, dueAt: NOW + 86_400_000, depth: 3,
          kinds: ['translateToEs', 'listenSelect', 'buildResponse'], introduced: true,
        } as never,
        'f.tener.conditional': {
          id: 'f.tener.conditional', firstSeen: 2, lastReviewed: NOW, timesSeen: 7,
          correct: 5, incorrect: 2, lapses: 1, streak: 1, strength: 0.42,
          stability: 2.1, ease: 1.85, dueAt: NOW, depth: 2,
          kinds: ['fillBlank'], introduced: true,
        } as never,
      },
      completedLessons: {
        'l.greetings': { at: 100, accuracy: 0.95, times: 3 },
        'l.b1.opinions': { at: 200, accuracy: 0.81, times: 1 },
      },
      mistakes: [
        { id: 'm1', at: 50, conceptIds: ['v.quedar'], kind: 'translateToEs',
          prompt: 'p', given: 'g', expected: 'e' } as never,
      ],
      sessions: [
        { id: 's1', at: 60, source: 'l.greetings', label: 'Greetings', xp: 40,
          correct: 9, total: 10, duration: 300, newConcepts: 4 } as never,
      ],
      daily: [{ date: '2026-04-30', xp: 220, seconds: 900, exercises: 40 }],
    });
  }

  /** Export, wipe the device, import — exactly the path the Profile screen runs. */
  function reinstall(learner: LearnerState) {
    const onDisk = JSON.stringify(buildBackup(learner), null, 2);
    const parsed = parseBackup(onDisk, STATE_VERSION);
    if (!parsed.ok) throw new Error(parsed.reason);
    // A brand-new install: nothing but this device's own settings.
    const fresh = makeLearner({ settings: { ...DEFAULT_SETTINGS_FOR_TEST, appearance: 'dark' } });
    const restored = stateFromBackup(parsed.file, fresh.settings);
    const migrated = migrateState(restored, STATE_VERSION);
    if (!migrated.ok) throw new Error(migrated.reason);
    return migrated.state;
  }

  it('brings back the spaced-repetition record, not just the totals', () => {
    const after = reinstall(monthsOfWork());
    const quedar = after.concepts['v.quedar'];

    // These five fields *are* the memory model. Restoring the counts without
    // them would put every concept back at day one while showing the same XP.
    expect(quedar.stability).toBeCloseTo(18.5);
    expect(quedar.ease).toBeCloseTo(2.31);
    expect(quedar.strength).toBeCloseTo(0.74);
    expect(quedar.dueAt).toBe(NOW + 86_400_000);
    expect(quedar.lastReviewed).toBe(NOW - 86_400_000);
    expect(quedar.kinds).toEqual(['translateToEs', 'listenSelect', 'buildResponse']);
  });

  it('brings back everything the profile and the path are built from', () => {
    const before = monthsOfWork();
    const after = reinstall(before);

    expect(after.xp).toBe(41_250);
    expect(after.streak).toBe(12);
    expect(after.longestStreak).toBe(63);
    expect(after.lastStudyDate).toBe('2026-04-30');
    expect(after.totalSeconds).toBe(187_400);
    expect(after.createdAt).toBe(Date.UTC(2025, 8, 14));
    expect(after.onboarded).toBe(true);
    expect(after.placement).toEqual(before.placement);
    expect(after.favourites).toEqual(['v.quedar', 'g.subjunctive-present']);
    expect(after.completedLessons).toEqual(before.completedLessons);
    expect(after.mistakes).toEqual(before.mistakes);
    expect(after.sessions).toEqual(before.sessions);
    expect(after.daily).toEqual(before.daily);
    expect(Object.keys(after.concepts)).toEqual(Object.keys(before.concepts));
  });

  it('keeps the new device’s settings rather than the old device’s', () => {
    // Everything else moves; the appearance you chose on *this* screen stays.
    expect(reinstall(monthsOfWork()).settings.appearance).toBe('dark');
  });

  it('leaves the restored record readable by the next launch', () => {
    // The bug this pins: a restore used to write the *backup's* version into the
    // live record. The restore looked fine, and the next launch found a version
    // it did not recognise and discarded everything.
    const after = reinstall(monthsOfWork());
    expect(after.version).toBe(STATE_VERSION);
    expect(migrateState(after, STATE_VERSION).ok).toBe(true);
  });
});

describe('an empty backup is still a backup, and still has to be chosen', () => {
  it('reports the full cost of restoring a blank file over real progress', () => {
    const blank = makeLearner();
    const real = makeLearner({ xp: 41_250, concepts: { 'v.a': {} as never }, completedLessons: { l: {} as never } });
    const comparison = compareForRestore(blank, real);

    // The restore is not blocked — it is the learner's file and their choice —
    // but it can never happen without this number being shown first.
    expect(comparison.losing).toBe(true);
    expect(comparison.xpLost).toBe(41_250);
    expect(comparison.incoming.concepts).toBe(0);
    expect(comparison.current.concepts).toBe(1);
  });
});
