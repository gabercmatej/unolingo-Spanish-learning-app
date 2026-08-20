import { curriculum, getUnitConcepts, getUnitTaughtConcepts } from '@/content';
import type { Unit } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import { unitProgress } from '@/learning/mastery';
import { buildPracticeSession, buildSession, buildSmartReview, completedLessonId } from '@/learning/session';
import { createConceptState, introduce, mastery, masteryBand, review } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * Only evidence may move mastery.
 *
 * Reported from dogfooding: open a unit's review, leave without answering, and
 * the unit's mastery percentage had fallen. It was not a rendering glitch and
 * not time decay — it was a genuine write, and the cause was one line.
 *
 * `introduce` incremented `timesSeen`. `averageMastery` counts every concept
 * with `timesSeen > 0`. A unit revisit opens with teaching cards for the
 * concepts the lessons had not reached yet, and *displaying* a card called
 * `markIntroduced` — so five cards moved five concepts into the denominator
 * each carrying a mastery of zero, and a unit sitting at 64% over five
 * practised concepts reported 32% over ten. The learner had done nothing but
 * scroll.
 *
 * The distinction that fixes it is between having been **encountered** (the
 * course has shown you this: it belongs in review queues and in "words met")
 * and having been **retrieved** (you produced it from memory: it counts as
 * evidence). Introduction is the first and never the second.
 */

const NOW = Date.UTC(2026, 2, 1);
const DAY = 86_400_000;

const unit: Unit = curriculum
  .flatMap((stage) => stage.units)
  .find(
    (candidate) =>
      candidate.lessons.some((lesson) => !lesson.optional) &&
      getUnitTaughtConcepts(candidate).length >= 8,
  )!;

/** Half the unit practised properly, half never met — the state a revisit finds. */
function halfLearnedUnit(): LearnerState {
  const taught = getUnitTaughtConcepts(unit);
  const concepts: LearnerState['concepts'] = {};
  const completedLessons: LearnerState['completedLessons'] = {};
  for (const lesson of unit.lessons.filter((l) => !l.optional)) {
    completedLessons[lesson.id] = { at: NOW - DAY, accuracy: 0.85, times: 1 };
  }
  for (const id of taught.slice(0, Math.floor(taught.length / 2))) {
    concepts[id] = {
      ...createConceptState(id, NOW - 5 * DAY),
      introduced: true,
      timesSeen: 5,
      strength: 0.8,
      depth: 3,
      stability: 6,
      lastReviewed: NOW - DAY,
      dueAt: NOW + 4 * DAY,
    };
  }
  return makeLearner({ concepts, completedLessons });
}

/** Several units' worth of practised material, for the longer-session cases. */
function broadLearner(): LearnerState {
  const concepts: LearnerState['concepts'] = {};
  const someUnits = curriculum.flatMap((stage) => stage.units).slice(0, 6);
  for (const candidate of someUnits) {
    for (const id of getUnitConcepts(candidate)) {
      concepts[id] = {
        ...createConceptState(id, NOW - 10 * DAY),
        introduced: true,
        timesSeen: 4,
        strength: 0.55,
        depth: 2,
        dueAt: NOW - DAY,
      };
    }
  }
  return makeLearner({ concepts });
}

describe('introduction is exposure, not evidence', () => {
  it('does not count a teaching card as a retrieval', () => {
    const fresh = createConceptState('v.test', NOW);
    const seen = introduce(fresh, NOW);

    expect(seen.introduced).toBe(true);
    expect(seen.timesSeen).toBe(0);
    // Scheduled, though — the concept is now known to the course and belongs in
    // the queue. Progression may move; mastery may not.
    expect(seen.dueAt).toBeGreaterThan(NOW);
  });

  it('leaves mastery at zero rather than manufacturing a number', () => {
    const seen = introduce(createConceptState('v.test', NOW), NOW);
    expect(mastery(seen, NOW)).toBe(0);
  });

  it('reports an introduced concept as learning, not as new', () => {
    const fresh = createConceptState('v.test', NOW);
    expect(masteryBand(fresh, NOW)).toBe('new');
    expect(masteryBand(introduce(fresh, NOW), NOW)).toBe('learning');
  });

  it('does not let a card age a concept towards mastery', () => {
    /**
     * `masteryBand` gates `mastered` on `lastReviewed - firstSeen`, so touching
     * `lastReviewed` here would let a concept satisfy the "across more than one
     * sitting" clause by being *looked at* on two different days.
     */
    const first = createConceptState('v.test', NOW);
    const later = introduce(first, NOW + 3 * DAY);
    expect(later.lastReviewed).toBe(first.lastReviewed);
  });

  it('still counts a real answer', () => {
    const answered = review(introduce(createConceptState('v.test', NOW), NOW), {
      grade: 'correct',
      difficulty: 3,
      kind: 'fillBlank',
      now: NOW,
    });
    expect(answered.timesSeen).toBe(1);
    expect(mastery(answered, NOW)).toBeGreaterThan(0);
  });
});

describe('opening a review cannot lower mastery', () => {
  it('is unchanged by introducing every concept the unit has not reached', () => {
    const learner = halfLearnedUnit();
    const before = unitProgress(unit, learner, NOW).mastery;
    expect(before).toBeGreaterThan(0.4); // the fixture is meaningful

    /**
     * Exactly what a revisit does: shows a card for everything unmet. Before
     * the fix this halved the figure.
     */
    const concepts = { ...learner.concepts };
    for (const id of getUnitConcepts(unit)) {
      concepts[id] = introduce(concepts[id] ?? createConceptState(id, NOW), NOW);
    }
    const after = unitProgress(unit, { ...learner, concepts }, NOW).mastery;

    expect(after).toBeCloseTo(before, 10);
  });

  it('is unchanged by building any session at all', () => {
    /**
     * Generation is a pure read of the learner. Worth asserting across every
     * entry point rather than trusting it: the screens call these during render,
     * and a builder that mutated would corrupt progress simply by being looked
     * at.
     */
    const learner = halfLearnedUnit();
    const snapshot = JSON.stringify(learner);

    buildSmartReview({ learner, now: NOW, seed: 1 });
    buildPracticeSession('vocabulary', { learner, now: NOW, seed: 2 });
    buildPracticeSession('unitSmart', { learner, now: NOW, seed: 3, source: unit.id });
    buildSession('mistakes', 'mistakes', { learner, now: NOW, seed: 4 });
    buildSession('lesson', unit.lessons[0].id, { learner, now: NOW, seed: 5 });

    expect(JSON.stringify(learner)).toBe(snapshot);
  });

  it('is unchanged by abandoning a session part-way', () => {
    /**
     * Answering three of ten questions must commit three answers and nothing
     * else. The seven unanswered exercises were generated, displayed and
     * discarded, and none of that is evidence about anything.
     */
    // A broader learner, so the session is long enough for "part-way" to mean
    // something: the half-learned unit alone yields only three answerables.
    const learner = broadLearner();
    const plan = buildSmartReview({ learner, now: NOW, seed: 6, targetLength: 14 });
    const answerable = plan.exercises.filter((exercise) => exercise.form !== 'presentation');
    expect(answerable.length).toBeGreaterThan(6);

    const concepts = { ...learner.concepts };
    for (const exercise of answerable.slice(0, 3)) {
      for (const id of exercise.conceptIds) {
        concepts[id] = review(concepts[id] ?? createConceptState(id, NOW), {
          grade: 'correct',
          difficulty: exercise.difficulty,
          kind: exercise.kind,
          now: NOW,
        });
      }
    }
    const answered = { ...learner, concepts };

    const touched = new Set(answerable.slice(0, 3).flatMap((e) => e.conceptIds));
    const untouched = answerable.slice(3).flatMap((e) => e.conceptIds).filter((id) => !touched.has(id));

    for (const id of untouched) {
      expect(answered.concepts[id]).toEqual(learner.concepts[id]);
    }
  });
});

describe('encountered and retrieved stay separate downstream', () => {
  it('offers an introduced-but-never-answered concept for review', () => {
    /**
     * The other half of the change. A word shown on a card and never reached
     * again is the single most neglected thing in a learner's record, and while
     * `timesSeen` was the test for "encountered" it was invisible to every
     * review queue the moment introduction stopped inflating it.
     */
    const learner = halfLearnedUnit();
    const unmet = getUnitTaughtConcepts(unit).find((id) => !learner.concepts[id])!;
    const concepts = {
      ...learner.concepts,
      [unmet]: introduce(createConceptState(unmet, NOW - DAY), NOW - DAY),
    };

    const plan = buildSmartReview({
      learner: { ...learner, concepts },
      now: NOW,
      seed: 9,
      targetLength: 30,
    });
    const targets = new Set(plan.exercises.flatMap((exercise) => exercise.conceptIds));
    expect(targets.has(unmet)).toBe(true);
  });
});

/**
 * Answering is not finishing.
 *
 * The session screen banks a session on unmount so that leaving mid-lesson does
 * not throw away the XP — every answer is already committed by `recordAnswer`,
 * but the session record and the reward are written once, at the end. That part
 * was right. What it also wrote was `lessonId`, and the lesson tick is a
 * different claim from the reward: it says the lesson was *walked*.
 *
 * So one answered exercise followed by the close button marked the lesson
 * complete. Measured against the curriculum, 36 of the course's 63 units carry
 * exactly one required lesson — so for more than half the course, answering a
 * single question and leaving finished the unit's teaching and moved the
 * "units done" counter on the Learn tab. The same applied to an arc phase,
 * which could be ticked off without being played.
 */
describe('a lesson is finished by reaching the end of it', () => {
  it('marks the lesson complete when the queue was played out', () => {
    expect(completedLessonId({ kind: 'lesson', source: 'l.1', reachedEnd: true })).toBe('l.1');
  });

  it('marks nothing complete when the learner left partway', () => {
    expect(completedLessonId({ kind: 'lesson', source: 'l.1', reachedEnd: false })).toBeUndefined();
  });

  it('holds for every kind that writes into completedLessons', () => {
    for (const kind of ['lesson', 'conversation', 'story', 'checkpoint', 'unitArc'] as const) {
      expect(completedLessonId({ kind, source: 'x', reachedEnd: true })).toBe('x');
      expect(completedLessonId({ kind, source: 'x', reachedEnd: false })).toBeUndefined();
    }
  });

  it('never completes a lesson from a session that is not one', () => {
    // Smart Review reaching its end is not a lesson being finished, and its
    // `source` is a concept id or a unit id rather than a lesson id.
    for (const kind of ['smartReview', 'mistakes', 'unitSmart', 'quickPractice'] as const) {
      expect(completedLessonId({ kind, source: 'x', reachedEnd: true })).toBeUndefined();
    }
  });
});
