import { blankLearnerState } from '@/learning/defaults';
import { MIGRATIONS, migrateState } from '@/learning/migrate';
import { makeLearner } from './helpers';

/**
 * These are tests about not losing anything.
 *
 * The failure they exist to prevent is not a crash — it is an app that opens
 * cheerfully to a blank slate and then saves that blank slate over eight months
 * of work. Every `ok: false` below is therefore also an assertion that the
 * caller is *told*, because the only safe response to an unreadable record is to
 * leave it exactly where it is.
 */

const CURRENT = 1;

function saved(overrides: Record<string, unknown> = {}) {
  return { ...makeLearner({ xp: 9000, longestStreak: 30 }), ...overrides };
}

describe('reading a record this build understands', () => {
  it('carries every field through unchanged', () => {
    const before = makeLearner({
      xp: 9000,
      longestStreak: 30,
      concepts: { 'v.hola': { id: 'v.hola', timesSeen: 4 } as never },
      completedLessons: { 'l.greetings': { at: 5, accuracy: 1, times: 1 } },
      favourites: ['v.hola'],
      totalSeconds: 4242,
    });
    const result = migrateState(before, CURRENT);
    if (!result.ok) throw new Error(result.reason);

    expect(result.migrated).toBe(false);
    expect(result.state.xp).toBe(9000);
    expect(result.state.longestStreak).toBe(30);
    expect(result.state.concepts['v.hola']).toEqual({ id: 'v.hola', timesSeen: 4 });
    expect(result.state.completedLessons['l.greetings'].accuracy).toBe(1);
    expect(result.state.favourites).toEqual(['v.hola']);
    expect(result.state.totalSeconds).toBe(4242);
    expect(result.state.createdAt).toBe(before.createdAt);
  });

  it('fills in a setting added since the record was written, and says which', () => {
    const record = saved();
    delete (record.settings as unknown as Record<string, unknown>).slowAudioDefault;

    const result = migrateState(record, CURRENT);
    if (!result.ok) throw new Error(result.reason);

    expect(result.state.settings.slowAudioDefault).toBe(false);
    expect(result.repaired).toContain('settings.slowAudioDefault');
    // This is why adding an optional setting needs no version bump.
    expect(result.state.xp).toBe(9000);
  });

  it('fills in a whole collection added since the record was written', () => {
    const record = saved();
    delete (record as Record<string, unknown>).favourites;

    const result = migrateState(record, CURRENT);
    if (!result.ok) throw new Error(result.reason);
    expect(result.state.favourites).toEqual([]);
    expect(result.repaired).toContain('favourites');
  });

  it('keeps a null that means something rather than treating it as missing', () => {
    const result = migrateState(saved({ lastStudyDate: null, placement: null }), CURRENT);
    if (!result.ok) throw new Error(result.reason);
    expect(result.state.lastStudyDate).toBeNull();
    expect(result.state.placement).toBeNull();
    expect(result.repaired).not.toContain('lastStudyDate');
  });
});

describe('reading a record from an older build', () => {
  afterEach(() => {
    for (const key of Object.keys(MIGRATIONS)) delete MIGRATIONS[Number(key)];
  });

  it('walks the chain and stamps the result with the current version', () => {
    MIGRATIONS[1] = (state) => ({ ...state, xp: (state.xp as number) + 1, version: 2 });
    MIGRATIONS[2] = (state) => ({ ...state, xp: (state.xp as number) + 1, version: 3 });

    const result = migrateState(saved({ version: 1 }), 3);
    if (!result.ok) throw new Error(result.reason);

    expect(result.migrated).toBe(true);
    expect(result.from).toBe(1);
    expect(result.state.version).toBe(3);
    expect(result.state.xp).toBe(9002); // both steps ran, in order
  });

  it('refuses rather than guessing when a step is missing', () => {
    // The whole point: a gap in the chain must stop the read, because the
    // caller's response to a refusal is to leave the record alone. Guessing
    // here is how a migration becomes a corruption.
    const result = migrateState(saved({ version: 1 }), 4);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain('version 1 to 2');
  });
});

describe('refusing what cannot be trusted', () => {
  const refuses = (raw: unknown, fragment: string) => {
    const result = migrateState(raw, CURRENT);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain(fragment);
  };

  it('refuses a record from a newer build instead of stripping it down', () => {
    refuses(saved({ version: CURRENT + 1 }), 'newer version');
  });

  it('refuses a record that does not say who wrote it', () => {
    refuses(saved({ version: undefined }), 'which version');
    refuses(saved({ version: 'one' }), 'which version');
  });

  it('refuses a truncated record rather than opening it half-empty', () => {
    refuses(saved({ concepts: undefined }), 'word records');
    refuses(saved({ completedLessons: undefined }), 'lesson history');
    refuses(saved({ mistakes: undefined }), 'mistake list');
    refuses(saved({ sessions: undefined }), 'session history');
  });

  it('refuses anything that is not a record at all', () => {
    refuses(null, 'readable shape');
    refuses('a string', 'readable shape');
    refuses([], 'readable shape');
    refuses(42, 'readable shape');
  });

  it('never answers a refusal with a blank learner', () => {
    // An empty state is indistinguishable from a bad write, so the migrator is
    // not allowed to produce one as a fallback.
    for (const bad of [null, 'x', [], saved({ version: 99 }), saved({ concepts: undefined })]) {
      const result = migrateState(bad, CURRENT);
      expect(result.ok).toBe(false);
      expect(result).not.toHaveProperty('state');
    }
  });
});

describe('a brand-new learner', () => {
  it('is not something the migrator invents', () => {
    // blankLearnerState is version 0 on purpose: it is not a saved record, and
    // handing it to the migrator should fail rather than look like an upgrade.
    const blank = blankLearnerState(1_700_000_000_000);
    expect(blank.version).toBe(0);
    expect(blank.xp).toBe(0);
    expect(blank.onboarded).toBe(false);
  });
});
