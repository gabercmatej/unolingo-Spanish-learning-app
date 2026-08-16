import {
  createConceptState,
  DAY_MS,
  isDue,
  mastery,
  masteryBand,
  retrievability,
  review,
  urgency,
} from '@/learning/srs';
import type { ConceptState } from '@/learning/types';

const NOW = 1_700_000_000_000;

function seen(overrides: Partial<ConceptState> = {}): ConceptState {
  return { ...createConceptState('v.test', NOW), ...overrides };
}

describe('retrievability', () => {
  it('is 1 immediately after review and decays over time', () => {
    const state = seen({ stability: 10, lastReviewed: NOW });
    expect(retrievability(state, NOW)).toBeCloseTo(1, 5);
    expect(retrievability(state, NOW + 5 * DAY_MS)).toBeLessThan(1);
    expect(retrievability(state, NOW + 30 * DAY_MS)).toBeLessThan(
      retrievability(state, NOW + 5 * DAY_MS),
    );
  });

  it('hits the review threshold exactly one stability period out', () => {
    const state = seen({ stability: 7, lastReviewed: NOW });
    expect(retrievability(state, NOW + 7 * DAY_MS)).toBeCloseTo(0.9, 5);
  });
});

describe('review', () => {
  it('lengthens the interval after a correct answer', () => {
    const before = seen({ stability: 1 });
    const after = review(before, { grade: 'correct', difficulty: 3, kind: 'fillBlank', now: NOW });
    expect(after.stability).toBeGreaterThan(before.stability);
    expect(after.dueAt).toBeGreaterThan(NOW);
    expect(after.correct).toBe(1);
    expect(after.streak).toBe(1);
  });

  it('shortens the interval sharply after a wrong answer', () => {
    const before = seen({ stability: 20, strength: 0.8 });
    const after = review(before, {
      grade: 'incorrect',
      difficulty: 3,
      kind: 'fillBlank',
      now: NOW,
    });
    expect(after.stability).toBeLessThan(before.stability);
    expect(after.incorrect).toBe(1);
    expect(after.streak).toBe(0);
    expect(after.lapses).toBe(1); // it was known, so this counts as forgetting
  });

  it('does not count a lapse for something never really learned', () => {
    const before = seen({ stability: 1, strength: 0.2 });
    const after = review(before, { grade: 'incorrect', difficulty: 2, kind: 'multipleChoice', now: NOW });
    expect(after.lapses).toBe(0);
  });

  it('rewards harder exercises with a longer interval', () => {
    const before = seen({ stability: 2 });
    const easy = review(before, { grade: 'correct', difficulty: 1, kind: 'multipleChoice', now: NOW });
    const hard = review(before, { grade: 'correct', difficulty: 5, kind: 'buildResponse', now: NOW });
    expect(hard.stability).toBeGreaterThan(easy.stability);
  });

  it('raises strength faster for harder exercises', () => {
    const before = seen({ timesSeen: 5, strength: 0.5 });
    const easy = review(before, { grade: 'correct', difficulty: 1, kind: 'multipleChoice', now: NOW });
    const hard = review(before, { grade: 'correct', difficulty: 5, kind: 'buildResponse', now: NOW });
    expect(hard.strength).toBeGreaterThan(easy.strength);
  });

  it('records the deepest difficulty passed', () => {
    let state = seen();
    state = review(state, { grade: 'correct', difficulty: 4, kind: 'translateToEs', now: NOW });
    expect(state.depth).toBe(4);
    // A later easy success must not reduce the recorded depth.
    state = review(state, { grade: 'correct', difficulty: 1, kind: 'multipleChoice', now: NOW });
    expect(state.depth).toBe(4);
  });

  it('treats "almost" as partial credit', () => {
    const before = seen({ stability: 4, strength: 0.5, timesSeen: 4 });
    const almost = review(before, { grade: 'almost', difficulty: 3, kind: 'fillBlank', now: NOW });
    const wrong = review(before, { grade: 'incorrect', difficulty: 3, kind: 'fillBlank', now: NOW });
    expect(almost.stability).toBeGreaterThan(wrong.stability);
    expect(almost.strength).toBeGreaterThan(wrong.strength);
    expect(almost.incorrect).toBe(0);
  });

  it('never lets the interval run away or collapse to zero', () => {
    let state = seen();
    for (let i = 0; i < 40; i += 1) {
      state = review(state, {
        grade: 'correct',
        difficulty: 5,
        kind: 'buildResponse',
        now: NOW + i * DAY_MS,
      });
    }
    expect(state.stability).toBeLessThanOrEqual(400);

    for (let i = 0; i < 20; i += 1) {
      state = review(state, { grade: 'incorrect', difficulty: 1, kind: 'multipleChoice', now: NOW });
    }
    expect(state.stability).toBeGreaterThan(0);
  });
});

describe('mastery', () => {
  it('is zero for an unseen concept', () => {
    expect(mastery(seen(), NOW)).toBe(0);
  });

  it('rises with successful reviews', () => {
    let state = seen();
    const first = review(state, { grade: 'correct', difficulty: 2, kind: 'wordBank', now: NOW });
    state = review(first, { grade: 'correct', difficulty: 3, kind: 'fillBlank', now: NOW });
    expect(mastery(state, NOW)).toBeGreaterThan(mastery(first, NOW));
  });

  it('decays as time passes without review', () => {
    const state = review(seen(), { grade: 'correct', difficulty: 3, kind: 'fillBlank', now: NOW });
    expect(mastery(state, NOW + 90 * DAY_MS)).toBeLessThan(mastery(state, NOW));
  });
});

describe('masteryBand', () => {
  it('labels an unseen concept as new', () => {
    expect(masteryBand(undefined, NOW)).toBe('new');
    expect(masteryBand(seen(), NOW)).toBe('new');
  });

  it('labels early exposures as learning', () => {
    const state = review(seen(), { grade: 'correct', difficulty: 1, kind: 'multipleChoice', now: NOW });
    expect(masteryBand(state, NOW)).toBe('learning');
  });
});

describe('urgency and due dates', () => {
  it('marks an item due once its interval has elapsed', () => {
    const state = review(seen(), { grade: 'correct', difficulty: 2, kind: 'wordBank', now: NOW });
    expect(isDue(state, NOW)).toBe(false);
    expect(isDue(state, state.dueAt + 1)).toBe(true);
  });

  it('ranks a shaky overdue concept above a solid one', () => {
    const shaky = seen({ strength: 0.2, stability: 1, lastReviewed: NOW - 5 * DAY_MS, dueAt: NOW - DAY_MS });
    const solid = seen({ strength: 0.9, stability: 1, lastReviewed: NOW - 5 * DAY_MS, dueAt: NOW - DAY_MS });
    expect(urgency(shaky, NOW)).toBeGreaterThan(urgency(solid, NOW));
  });
});
