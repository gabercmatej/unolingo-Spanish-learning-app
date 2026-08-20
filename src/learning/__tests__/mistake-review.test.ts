import { getSentence } from '@/content';
import { makeLearner } from '@/learning/__tests__/helpers';
import { KIND_DEMAND } from '@/learning/eligibility';
import {
  applyAnswerToMistakes,
  mistakeQueue,
  retryKinds,
  unresolvedMistakes,
} from '@/learning/mistakes';
import { buildExact } from '@/learning/generator';
import { buildMistakeSession, buildRetry } from '@/learning/session';
import { createConceptState } from '@/learning/srs';
import type { ExerciseKind, LearnerState, MistakeRecord } from '@/learning/types';

/**
 * "Review Mistakes" must review the mistakes.
 *
 * The behaviour these lock down was reported from dogfooding: opening Review
 * Mistakes served a session of unrelated exercises with the actual mistakes
 * mixed in somewhere. The cause was structural rather than a bug in the queue —
 * there was no queue. `buildPracticeSession` flattened every unresolved mistake
 * to its `conceptIds` and handed the list to the general generator, so the
 * mistake itself was discarded at the first step and everything downstream was
 * working from concepts alone.
 */

const NOW = Date.UTC(2026, 0, 10);
const DAY = 86_400_000;

/** A concept the learner has genuinely met, so the generator will build for it. */
function met(id: string, over: Partial<ReturnType<typeof createConceptState>> = {}) {
  return { ...createConceptState(id, NOW - 5 * DAY), introduced: true, timesSeen: 3, ...over };
}

function mistake(over: Partial<MistakeRecord> = {}): MistakeRecord {
  return {
    id: `m.${over.targetId ?? 'x'}.${over.at ?? 1}`,
    at: NOW - DAY,
    conceptIds: [over.targetId ?? 'v.hola'],
    kind: 'translateToEs',
    prompt: 'Translate this',
    given: 'wrong',
    expected: 'right',
    ...over,
  };
}

/**
 * Three real concepts with real sentences behind them, so the session builder
 * has something to work with. Chosen from the first unit, which every learner
 * meets, and asserted to exist so the fixture cannot rot silently.
 */
const A = 'v.hola';
const B = 'v.gracias';
const C = 'v.adios';

function learnerWithMistakes(records: MistakeRecord[]): LearnerState {
  const concepts: LearnerState['concepts'] = {};
  for (const id of [A, B, C, 'v.amigo', 'v.casa']) concepts[id] = met(id);
  return makeLearner({ concepts, mistakes: records });
}

describe('A — the session contains the mistakes and nothing else', () => {
  it('builds exactly one exercise per unresolved mistake', () => {
    const learner = learnerWithMistakes([
      mistake({ targetId: A, at: NOW - 3 * DAY }),
      mistake({ targetId: B, at: NOW - 2 * DAY }),
      mistake({ targetId: C, at: NOW - DAY }),
    ]);

    const plan = buildMistakeSession({ learner, now: NOW, seed: 3 });

    expect(plan.exercises).toHaveLength(3);
    /**
     * Every exercise targets a mistake. Before the rewrite this failed in both
     * directions at once: too many exercises (one per concept on each mistake's
     * sentence) and the wrong ones (drawn from those concepts' whole sentence
     * pools).
     */
    const targets = plan.exercises.map((exercise) => exercise.targetId);
    expect(new Set(targets)).toEqual(new Set([A, B, C]));
  });

  it('does not add due, weak or at-risk material to pad the session', () => {
    /**
     * A learner with one mistake and a great deal else that is overdue. Smart
     * Review would legitimately serve all of it; mistake review must not.
     */
    const learner = learnerWithMistakes([mistake({ targetId: A })]);
    for (const id of [B, C, 'v.amigo', 'v.casa']) {
      learner.concepts[id] = met(id, { dueAt: NOW - 10 * DAY, strength: 0.1 });
    }

    const plan = buildMistakeSession({ learner, now: NOW, seed: 7 });

    expect(plan.exercises).toHaveLength(1);
    expect(plan.exercises[0].targetId).toBe(A);
  });

  it('never scores a concept the mistake was not about', () => {
    /**
     * The specific mechanism behind "random questions". A mistake made on a
     * sentence tagged with four concepts used to produce four exercises, three
     * of them about words that were never the problem — and each one scored and
     * rescheduled a concept on the strength of a mistake it had no part in.
     */
    const learner = learnerWithMistakes([
      mistake({ targetId: A, conceptIds: [A, B, C, 'v.amigo'] }),
    ]);

    const plan = buildMistakeSession({ learner, now: NOW, seed: 5 });
    expect(plan.exercises).toHaveLength(1);
    expect(plan.exercises[0].targetId).toBe(A);
  });
});

describe('B — no mistakes means no session', () => {
  it('produces nothing rather than inventing practice', () => {
    const learner = learnerWithMistakes([]);
    const plan = buildMistakeSession({ learner, now: NOW, seed: 1 });
    expect(plan.exercises).toHaveLength(0);
    expect(plan.subtitle).toMatch(/fixed them all/i);
  });

  it('treats a resolved mistake as gone', () => {
    const learner = learnerWithMistakes([mistake({ targetId: A, resolvedAt: NOW - 60_000 })]);
    expect(buildMistakeSession({ learner, now: NOW, seed: 1 }).exercises).toHaveLength(0);
  });
});

describe('C — a partial session updates only what was answered', () => {
  it('resolves the retries that were completed and leaves the rest pending', () => {
    const records = [
      mistake({ targetId: A, at: NOW - 3 * DAY }),
      mistake({ targetId: B, at: NOW - 2 * DAY }),
      mistake({ targetId: C, at: NOW - DAY }),
    ];
    let mistakes: MistakeRecord[] = records;

    // The learner fixes two, then leaves.
    mistakes = applyAnswerToMistakes(mistakes, { conceptIds: [A], targetId: A, grade: 'correct' }, NOW);
    mistakes = applyAnswerToMistakes(mistakes, { conceptIds: [B], targetId: B, grade: 'correct' }, NOW);

    const open = unresolvedMistakes(makeLearner({ mistakes }));
    expect(open).toHaveLength(1);
    expect(open[0].targetId).toBe(C);
  });

  it('does not resolve a mistake on an `almost`', () => {
    /**
     * An `almost` is worth 0.75 and *lengthens* the review interval, so treating
     * it as a correction would hide the mistake for longer than getting it
     * right would have. Closure needs the answer to actually be right.
     */
    const mistakes = applyAnswerToMistakes(
      [mistake({ targetId: A })],
      { conceptIds: [A], targetId: A, grade: 'almost' },
      NOW,
    );
    expect(mistakes[0].resolvedAt).toBeUndefined();
    // It still counts as an attempt, which is what steps the scaffolding back.
    expect(mistakes[0].attempts).toBe(1);
  });

  it('does not resolve a mistake because a bystander concept was answered', () => {
    /**
     * The old rule: any correct answer sharing any concept with the mistake
     * closed it. A mistake recorded against a four-concept sentence was cleared
     * by a multiple choice about one of the other three, so the queue emptied
     * itself without a single mistake being confronted.
     */
    const record = mistake({ targetId: A, conceptIds: [A, B, C] });
    const mistakes = applyAnswerToMistakes(
      [record],
      { conceptIds: [B], targetId: B, grade: 'correct' },
      NOW,
    );
    expect(mistakes[0].resolvedAt).toBeUndefined();
  });
});

describe('D — opening and leaving without answering changes nothing', () => {
  it('leaves the queue and the concept states exactly as they were', () => {
    const learner = learnerWithMistakes([
      mistake({ targetId: A }),
      mistake({ targetId: B }),
    ]);
    const before = JSON.stringify(learner);

    // Build the session — the whole act of "opening Review Mistakes".
    const plan = buildMistakeSession({ learner, now: NOW, seed: 2 });
    expect(plan.exercises.length).toBeGreaterThan(0);

    /**
     * Generation is a pure read. This is the same property that had been broken
     * for unit mastery, where building a revisit displayed teaching cards and
     * the act of displaying one incremented `timesSeen` — so a learner could
     * open a review, answer nothing, leave, and watch the percentage fall.
     */
    expect(JSON.stringify(learner)).toBe(before);
    expect(unresolvedMistakes(learner)).toHaveLength(2);
  });
});

describe('E — a failed hard production may be retried more gently, on the same target', () => {
  it('offers a scaffolded kind first, then the original', () => {
    const kinds = retryKinds(mistake({ targetId: A, kind: 'translateToEs' }));
    expect(kinds[0]).toBe('wordBank');
    expect(kinds).toContain('translateToEs');
    // The step is in support, never in subject.
    expect(KIND_DEMAND.wordBank).toBe('output');
  });

  it('stops scaffolding once the learner has already had a supported go', () => {
    const kinds = retryKinds(mistake({ targetId: A, kind: 'translateToEs', attempts: 1 }));
    expect(kinds[0]).toBe('translateToEs');
  });

  it('does not scaffold a kind that was never the difficulty', () => {
    // Getting a multiple choice wrong is not evidence that multiple choice was
    // too hard, so there is nothing to step down from.
    expect(retryKinds(mistake({ targetId: A, kind: 'multipleChoice' }))).toEqual([
      'multipleChoice',
    ]);
  });

  it('keeps the target concept when it scaffolds', () => {
    const learner = learnerWithMistakes([
      mistake({ targetId: A, kind: 'translateToEs' }),
    ]);
    const plan = buildMistakeSession({ learner, now: NOW, seed: 11 });
    expect(plan.exercises).toHaveLength(1);
    expect(plan.exercises[0].targetId).toBe(A);
  });
});

describe('rebuilding the exact item', () => {
  it('re-asks the same sentence when the record names one', () => {
    const sentence = getSentence('s.m105')!;
    const learner = learnerWithMistakes([
      {
        ...mistake({ targetId: 'v.ver', kind: 'translateToEn' }),
        conceptIds: ['v.ver'],
        sentenceId: sentence.id,
      },
    ]);
    learner.concepts['v.ver'] = met('v.ver');

    const plan = buildMistakeSession({ learner, now: NOW, seed: 4 });
    expect(plan.exercises).toHaveLength(1);
    /**
     * The same line, not merely the same concept. Eligibility is deliberately
     * not re-consulted here: the learner has demonstrably already been shown
     * this exact item, so refusing to show it again would be the gate answering
     * a question nobody asked.
     */
    expect(plan.exercises[0].sourceId).toBe(sentence.id);
  });

  it('still produces something for a record written before sentences were stored', () => {
    // Older records carry no `sentenceId`; the retry falls back to the concept
    // rather than dropping the mistake.
    const learner = learnerWithMistakes([mistake({ targetId: A, kind: 'translateToEs' })]);
    const plan = buildMistakeSession({ learner, now: NOW, seed: 6 });
    expect(plan.exercises).toHaveLength(1);
  });
});

describe('the queue itself', () => {
  it('is ordered oldest first, so it visibly shortens', () => {
    const learner = learnerWithMistakes([
      mistake({ targetId: C, at: NOW - DAY }),
      mistake({ targetId: A, at: NOW - 5 * DAY }),
      mistake({ targetId: B, at: NOW - 3 * DAY }),
    ]);
    expect(mistakeQueue(learner).map((entry) => entry.conceptId)).toEqual([A, B, C]);
  });

  it('asks about a repeatedly-failed concept once per sitting, not three times', () => {
    /**
     * Three failures on the same word in one lesson are one thing to fix. The
     * other records stay unresolved and come back another day if the retry does
     * not stick — which is the difference between spaced practice and nagging.
     */
    const learner = learnerWithMistakes([
      mistake({ targetId: A, at: NOW - 3 * DAY, id: 'm1' }),
      mistake({ targetId: A, at: NOW - 2 * DAY, id: 'm2' }),
      mistake({ targetId: A, at: NOW - DAY, id: 'm3' }),
    ]);
    expect(mistakeQueue(learner)).toHaveLength(1);
    expect(unresolvedMistakes(learner)).toHaveLength(3);
  });

  it('caps one sitting without dropping the overflow', () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      mistake({ targetId: `v.made-up-${i}`, at: NOW - i * 1000, id: `m${i}` }),
    );
    const learner = learnerWithMistakes(many);
    expect(mistakeQueue(learner, 5)).toHaveLength(5);
    expect(unresolvedMistakes(learner)).toHaveLength(20);
  });
});

describe('the in-session retry steps down the same ladder', () => {
  it('re-asks a failed translation as a word bank on the same sentence', () => {
    const learner = learnerWithMistakes([]);
    learner.concepts['v.ver'] = met('v.ver');

    const ctx = { learner, now: NOW, seed: 2 };
    const original = buildExact('s.m105', 'translateToEs', 'v.ver', {
      settings: learner.settings,
      now: NOW,
      rng: () => 0.5,
      recentKinds: [],
      usedSentences: new Set<string>(),
    })!;
    expect(original.kind).toBe('translateToEs');

    const retry = buildRetry(original, ctx);
    /**
     * The step is in support, never in subject. Re-queueing the identical
     * exercise meant a learner who could not produce a sentence from nothing
     * was asked to produce it from nothing again twenty questions later.
     */
    expect(retry.kind).toBe('wordBank');
    expect(retry.sourceId).toBe(original.sourceId);
    expect(retry.targetId).toBe('v.ver');
  });

  it('returns the original where there is no gentler rung', () => {
    const learner = learnerWithMistakes([]);
    learner.concepts[A] = met(A);
    const plan = buildMistakeSession({
      learner: learnerWithMistakes([mistake({ targetId: A, kind: 'multipleChoice' })]),
      now: NOW,
      seed: 1,
    });
    const original = plan.exercises[0];
    // A recognition exercise has nothing below it; a second look is still worth
    // having, so it comes back unchanged rather than being dropped.
    expect(buildRetry(original, { learner, now: NOW }).kind).toBe(original.kind);
  });
});

describe('the fixture concepts are real', () => {
  it('names concepts that exist, so these tests cannot pass vacuously', () => {
    const learner = learnerWithMistakes([mistake({ targetId: A })]);
    const plan = buildMistakeSession({ learner, now: NOW, seed: 1 });
    expect(plan.exercises.length).toBeGreaterThan(0);
    for (const kind of plan.exercises.map((e) => e.kind)) {
      expect(KIND_DEMAND[kind as ExerciseKind]).toBeDefined();
    }
  });
});
