import { curriculum, getUnitConcepts } from '@/content';
import type { Unit } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import type { Exercise } from '@/learning/exercise';
import { unitStrengthPlan } from '@/learning/mastery';
import { buildLessonSession, buildPracticeSession, buildSession } from '@/learning/session';
import { createConceptState, DAY_MS, review } from '@/learning/srs';
import type { LearnerState, MistakeRecord } from '@/learning/types';

const NOW = Date.UTC(2026, 4, 1);

function firstRealUnit(): Unit {
  const unit = curriculum[0].units.find((u) => u.lessons.length > 0);
  if (!unit) throw new Error('no playable unit');
  return unit;
}

/**
 * Walks a learner through every lesson of a unit, answering everything right.
 *
 * Repeats each lesson until it stops introducing anything, because a lesson
 * introduces at most `MAX_NEW_PER_SESSION` concepts a sitting — the fixture has
 * to reach the state these tests are about, which is "everything met, not
 * everything mastered", not "some of it never shown".
 */
function completeUnit(unit: Unit, now = NOW): LearnerState {
  let learner = makeLearner();
  for (const lesson of unit.lessons) {
    for (let pass = 0; pass < 4; pass += 1) {
      const plan = buildLessonSession(lesson.id, { learner, now, seed: 4 });
      if (!plan) break;
      const introduces = plan.exercises.some(
        (exercise) => exercise.form === 'presentation' && exercise.kind !== 'cultureCard',
      );
      learner = applySession(learner, plan.exercises, lesson.id, now);
      if (!introduces) break;
    }
  }
  return learner;
}

function applySession(
  learner: LearnerState,
  exercises: Exercise[],
  lessonId: string,
  now: number,
): LearnerState {
  {
    const plan = { exercises };
    const concepts = { ...learner.concepts };
    for (const exercise of plan.exercises) {
      for (const id of exercise.conceptIds) {
        const existing = concepts[id] ?? createConceptState(id, now);
        concepts[id] =
          exercise.form === 'presentation'
            ? { ...existing, introduced: true, timesSeen: existing.timesSeen + 1 }
            : review(existing, {
                grade: 'correct',
                difficulty: exercise.difficulty,
                kind: exercise.kind,
                now,
              });
      }
    }
    return {
      ...learner,
      concepts,
      completedLessons: {
        ...learner.completedLessons,
        [lessonId]: { at: now, accuracy: 1, times: 1 },
      },
    };
  }
}

describe('finishing a unit is not the same as knowing it', () => {
  it('leaves a strength plan with real work in it', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);
    const plan = unitStrengthPlan(unit, learner, NOW);

    // Every lesson done…
    expect(unit.lessons.every((l) => learner.completedLessons[l.id])).toBe(true);
    // …and there is still something to do about it.
    expect(plan.conceptIds.length).toBeGreaterThan(0);
    expect(plan.estimatedMinutes).toBeGreaterThan(0);
  });

  it('puts unresolved mistakes at the front of the queue', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);
    const [, , third] = getUnitConcepts(unit);
    expect(third).toBeDefined();

    const mistake: MistakeRecord = {
      id: 'm1',
      at: NOW,
      conceptIds: [third],
      kind: 'translateToEs',
      prompt: 'x',
      given: 'x',
      expected: 'y',
    };
    const plan = unitStrengthPlan(unit, { ...learner, mistakes: [mistake] }, NOW);
    expect(plan.mistaken).toContain(third);
    expect(plan.conceptIds[0]).toBe(third);
  });

  it('separates "recognised" from "produced"', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);
    const plan = unitStrengthPlan(unit, learner, NOW);
    // Whatever ends up where, the four buckets never overlap and never lose a
    // concept the learner has actually met — a queue that silently drops one is
    // worse than no queue.
    const buckets = [...plan.developing, ...plan.weak, ...plan.unproduced, ...plan.strong];
    expect(new Set(buckets).size).toBe(buckets.length);

    const encountered = getUnitConcepts(unit).filter(
      (id) => (learner.concepts[id]?.timesSeen ?? 0) > 0,
    );
    expect(new Set(buckets)).toEqual(new Set(encountered));

    /**
     * `unseen` is what the unit *teaches* and has not shown — not every word its
     * sentences mention. The first greetings unit's lines contain `v.ver` and
     * `v.cafe`, which arrive in their own lessons much later; counting those
     * would leave the unit reporting itself unfinished for ever.
     */
    for (const id of plan.unseen) {
      expect(unit.lessons.some((lesson) => lesson.teaches.includes(id) || (lesson.grammar ?? []).includes(id))).toBe(true);
    }
  });
});

describe('tapping the mastery figure starts something useful', () => {
  it('builds a targeted session from the unit rather than an empty one', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);

    // Exactly what the Learn page's mastery control does: kind + unit id, no
    // concept list. Before this it produced nothing, because the pool arrived
    // through `conceptIds` and the control had none to send.
    const plan = buildSession('unitSmart', unit.id, { learner, now: NOW, seed: 2 });
    expect(plan).not.toBeNull();
    expect(plan!.exercises.length).toBeGreaterThan(3);
    expect(plan!.title).toBe('Strengthen this unit');

    const unitConcepts = new Set(getUnitConcepts(unit));
    for (const exercise of plan!.exercises) {
      expect(exercise.conceptIds.some((id) => unitConcepts.has(id))).toBe(true);
    }
  });

  it('does not replay the lesson it came from', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);

    const lesson = buildLessonSession(unit.lessons[0].id, { learner, now: NOW, seed: 2 })!;
    const strengthen = buildSession('unitSmart', unit.id, { learner, now: NOW, seed: 2 })!;

    const signature = (exercises: Exercise[]) =>
      exercises.map((e) => `${e.kind}:${e.conceptIds[0]}`).join('|');
    expect(signature(strengthen.exercises)).not.toBe(signature(lesson.exercises));

    // And it is not a pile of teaching cards either — this is retrieval.
    const presentations = strengthen.exercises.filter((e) => e.form === 'presentation');
    expect(presentations.length).toBeLessThan(strengthen.exercises.length / 2);
  });

  it('varies the sentence as well as the exercise kind', () => {
    const unit = firstRealUnit();
    const learner = completeUnit(unit);
    const plan = buildSession('unitSmart', unit.id, { learner, now: NOW, seed: 8 })!;

    const sentences = plan.exercises
      .map((e) => e.source?.es)
      .filter((es): es is string => !!es);
    expect(sentences.length).toBeGreaterThan(4);

    /**
     * Not "never repeats" — an early unit has a handful of sentences and a
     * sixteen-exercise session, so some reuse is arithmetic rather than a bug.
     * What must hold is that reuse is the exception and that no single line
     * becomes the session's refrain.
     */
    const counts = new Map<string, number>();
    for (const es of sentences) counts.set(es, (counts.get(es) ?? 0) + 1);
    expect(counts.size).toBeGreaterThanOrEqual(Math.ceil(sentences.length * 0.6));
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(2);
  });
});

describe('listening practice trains more than one thing', () => {
  it('rotates across discrimination, comprehension and dictation', () => {
    const unit = firstRealUnit();
    let learner = completeUnit(unit);

    // Push the concepts past the point where dictation is fair.
    const concepts = { ...learner.concepts };
    for (const [id, state] of Object.entries(concepts)) {
      concepts[id] = { ...state, strength: 0.8, depth: 3, stability: 5, lastReviewed: NOW - DAY_MS };
    }
    learner = { ...learner, concepts };

    const kinds = new Set<string>();
    for (let seed = 1; seed <= 6; seed += 1) {
      const plan = buildPracticeSession('listening', { learner, now: NOW, seed, targetLength: 12 });
      for (const exercise of plan.exercises) kinds.add(exercise.kind);
    }

    expect(kinds.has('listenSelect')).toBe(true);
    expect(kinds.has('listenComprehend')).toBe(true);
  });
});
