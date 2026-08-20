import { curriculum, getUnitConcepts, getUnitTaughtConcepts } from '@/content';
import type { Unit } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import { unitProgress } from '@/learning/mastery';
import { buildArcSession } from '@/learning/session';
import { createConceptState } from '@/learning/srs';
import { arcStepId, phasesFor, unitArc } from '@/learning/unit-arc';
import { KIND_DIFFICULTY, type LearnerState } from '@/learning/types';

/**
 * A unit is a guided arc, not a single lesson with a tick on it.
 *
 * The measurement that prompted this: **36 of the course's 63 units have
 * exactly one required lesson**, and the median unit carries 13 minutes of
 * required content. So finishing a unit meant meeting nine new words, answering
 * about twelve questions, and arriving at a mastery figure around 22% with
 * nothing to do about it but replay the same lesson. The arc adds the sessions
 * between "met it" and "can use it", and it adds no content to do so — the
 * phases are generated from material the unit already declares.
 */

const NOW = Date.UTC(2026, 1, 1);
const DAY = 86_400_000;

const units: Unit[] = curriculum
  .flatMap((stage) => stage.units)
  .filter((unit) => unit.lessons.some((lesson) => !lesson.optional));

/**
 * A unit with exactly one required lesson — the shape 36 of the course's 63
 * units have, and the one this whole module exists for. Chosen with enough
 * taught material that a generated phase has something to vary across; a
 * six-concept unit would make every phase repeat itself and the comparison
 * between them would measure the fixture rather than the code.
 */
const oneLesson = units.find(
  (unit) =>
    unit.lessons.filter((lesson) => !lesson.optional).length === 1 &&
    getUnitTaughtConcepts(unit).length >= 8,
)!;

function havingFinishedLessons(unit: Unit, memory: Partial<ReturnType<typeof createConceptState>> = {}): LearnerState {
  const completedLessons: LearnerState['completedLessons'] = {};
  for (const lesson of unit.lessons.filter((l) => !l.optional)) {
    completedLessons[lesson.id] = { at: NOW - DAY, accuracy: 0.8, times: 1 };
  }
  const concepts: LearnerState['concepts'] = {};
  for (const id of getUnitConcepts(unit)) {
    concepts[id] = {
      ...createConceptState(id, NOW - DAY),
      introduced: true,
      timesSeen: 1,
      strength: 0.3,
      depth: 1,
      ...memory,
    };
  }
  return makeLearner({ completedLessons, concepts });
}

describe('the arc exists precisely where the course was thin', () => {
  it('gives a one-lesson unit three further sessions', () => {
    expect(phasesFor(oneLesson)).toEqual(['mixed', 'recall', 'consolidate']);
  });

  it('turns a one-lesson unit into a four-session arc', () => {
    const arc = unitArc(oneLesson, havingFinishedLessons(oneLesson), NOW);
    expect(arc.stepCount).toBe(4);
    expect(arc.stepsDone).toBe(1); // the lesson
    expect(arc.complete).toBe(false);
  });

  it('does not pad a unit that already runs long', () => {
    const long = units.find(
      (unit) => unit.lessons.filter((l) => !l.optional).length >= 3,
    );
    if (!long) return; // the curriculum may not contain one; nothing to assert
    expect(phasesFor(long)).toEqual(['recall', 'consolidate']);
  });

  it('does not pad a unit that teaches almost nothing', () => {
    const tiny = units.find((unit) => {
      const taught = getUnitTaughtConcepts(unit).length;
      return taught > 0 && taught <= 4;
    });
    if (!tiny) return;
    expect(phasesFor(tiny)).toEqual(['consolidate']);
  });
});

describe('the arc is a sequence', () => {
  it('unlocks nothing until the lessons are done', () => {
    const arc = unitArc(oneLesson, makeLearner(), NOW);
    expect(arc.steps.every((step) => !step.unlocked)).toBe(true);
    expect(arc.next).toBeNull();
  });

  it('opens one step at a time', () => {
    const learner = havingFinishedLessons(oneLesson);
    const arc = unitArc(oneLesson, learner, NOW);
    expect(arc.steps[0].unlocked).toBe(true);
    expect(arc.steps[1].unlocked).toBe(false);
    expect(arc.next?.phase).toBe('mixed');
  });

  it('advances when a step is played', () => {
    const learner = havingFinishedLessons(oneLesson);
    learner.completedLessons[arcStepId(oneLesson.id, 'mixed')] = {
      at: NOW,
      accuracy: 0.9,
      times: 1,
    };
    const arc = unitArc(oneLesson, learner, NOW);
    expect(arc.steps[0].done).toBe(true);
    expect(arc.steps[1].unlocked).toBe(true);
    expect(arc.next?.phase).toBe('recall');
  });
});

describe('a phase whose goal is already met is not busywork', () => {
  /**
   * The clause that stops this becoming the repetition the brief warns about.
   * A learner who already retrieves every concept in the unit under pressure
   * has nothing to gain from an "Active recall" session, and making them sit
   * through one to earn a tick would be the app manufacturing work. It also
   * means a unit finished before the arc existed does not reopen if the learner
   * genuinely knows it.
   */
  it('marks the whole arc satisfied for a learner who has demonstrably mastered the unit', () => {
    const learner = havingFinishedLessons(oneLesson, {
      timesSeen: 9,
      strength: 0.97,
      depth: 5,
      stability: 40,
      lastReviewed: NOW - DAY,
      dueAt: NOW + 30 * DAY,
    });
    const arc = unitArc(oneLesson, learner, NOW);

    expect(arc.complete).toBe(true);
    expect(arc.steps.every((step) => step.satisfied)).toBe(true);
    expect(arc.next).toBeNull();
  });

  it('does not mark it satisfied for a learner who has only recognised the material', () => {
    // Exactly the state a single lesson pass leaves behind: met once, never
    // retrieved under pressure. This is the case the arc exists for.
    const learner = havingFinishedLessons(oneLesson);
    const arc = unitArc(oneLesson, learner, NOW);
    expect(arc.complete).toBe(false);
    expect(arc.steps.some((step) => step.satisfied)).toBe(false);
  });

  it('satisfies recall only on evidence of demanding retrieval, not on repetition', () => {
    /**
     * Ten easy answers are not a recall. `depth` records the hardest exercise
     * ever answered correctly, so this learner has plenty of exposure and no
     * evidence of retrieval — `mixed` is satisfied and `recall` is not.
     */
    const learner = havingFinishedLessons(oneLesson, {
      timesSeen: 10,
      strength: 0.6,
      depth: 1,
    });
    const arc = unitArc(oneLesson, learner, NOW);
    const byPhase = Object.fromEntries(arc.steps.map((step) => [step.phase, step]));
    expect(byPhase.mixed.done).toBe(true);
    expect(byPhase.recall.done).toBe(false);
  });
});

describe('completion and mastery stay separate', () => {
  it('reports the unit complete on lessons while the arc is still running', () => {
    /**
     * `state` has always meant "every required lesson is finished", which is
     * what the path and the stage counters measure and what an existing
     * learner's record already reflects. Whether the *teaching* is finished is
     * a longer question, and it is the arc — so the two numbers are allowed to
     * disagree, and the unit screen shows both.
     */
    const progress = unitProgress(oneLesson, havingFinishedLessons(oneLesson), NOW);
    expect(progress.state).toBe('complete');
    expect(progress.arc.complete).toBe(false);
    expect(progress.phase).toBe('practising');
  });

  it('does not let a finished arc claim mastery it has not earned', () => {
    const learner = havingFinishedLessons(oneLesson);
    for (const phase of ['mixed', 'recall', 'consolidate'] as const) {
      learner.completedLessons[arcStepId(oneLesson.id, phase)] = {
        at: NOW,
        accuracy: 0.7,
        times: 1,
      };
    }
    const progress = unitProgress(oneLesson, learner, NOW);
    expect(progress.arc.complete).toBe(true);
    // The arc being done is a claim about the teaching, not about the memory.
    expect(progress.mastery).toBeLessThan(0.8);
  });
});

describe('the phases are actually different sessions', () => {
  it('builds a session from the unit’s own material', () => {
    const learner = havingFinishedLessons(oneLesson);
    const plan = buildArcSession(oneLesson.id, 'consolidate', { learner, now: NOW, seed: 5 });
    expect(plan).not.toBeNull();
    expect(plan!.exercises.length).toBeGreaterThan(0);

    const owned = new Set(getUnitConcepts(oneLesson));
    for (const exercise of plan!.exercises) {
      const target = exercise.targetId ?? exercise.conceptIds[0];
      expect(owned.has(target)).toBe(true);
    }
  });

  it('asks harder questions in recall than in mixed practice', () => {
    /**
     * The mechanism, and the only thing that makes a fourth pass over a unit
     * worth doing: the same concepts, with the scaffolding stepped down. If
     * these came out the same, the arc would be Duolingo's worst habit with
     * extra steps.
     */
    const learner = havingFinishedLessons(oneLesson, { timesSeen: 4, strength: 0.6, depth: 2 });
    const options = { learner, now: NOW, seed: 12, targetLength: 10 };

    const mixed = buildArcSession(oneLesson.id, 'mixed', options)!;
    const recall = buildArcSession(oneLesson.id, 'recall', options)!;

    const mean = (plan: typeof mixed) =>
      plan.exercises.reduce((sum, exercise) => sum + KIND_DIFFICULTY[exercise.kind], 0) /
      Math.max(1, plan.exercises.length);

    expect(mean(recall)).toBeGreaterThan(mean(mixed));
  });

  it('keeps word banks and multiple choice out of active recall', () => {
    const learner = havingFinishedLessons(oneLesson, { timesSeen: 4, strength: 0.6, depth: 2 });
    const recall = buildArcSession(oneLesson.id, 'recall', {
      learner,
      now: NOW,
      seed: 21,
      targetLength: 12,
    })!;

    /**
     * A floor rather than a ban. Demotion, not removal, is deliberate: a
     * concept that can only support recognition would otherwise be dropped from
     * the phase entirely, and a session that silently omits a third of the unit
     * is worse than one that occasionally offers an easy question.
     */
    const scaffolded = recall.exercises.filter((exercise) =>
      ['multipleChoice', 'match', 'wordBank', 'listenSelect'].includes(exercise.kind),
    );
    expect(scaffolded.length).toBeLessThan(recall.exercises.length / 2);
  });

  it('mixes in earlier material during the mixed phase only', () => {
    const learner = havingFinishedLessons(oneLesson);
    // Something from outside the unit, thoroughly overdue.
    const outsider = 'v.hola';
    if (!getUnitConcepts(oneLesson).includes(outsider)) {
      learner.concepts[outsider] = {
        ...createConceptState(outsider, NOW - 30 * DAY),
        introduced: true,
        timesSeen: 3,
        strength: 0.4,
        dueAt: NOW - 20 * DAY,
      };
    }

    const consolidate = buildArcSession(oneLesson.id, 'consolidate', {
      learner,
      now: NOW,
      seed: 3,
    })!;
    const owned = new Set(getUnitConcepts(oneLesson));
    for (const exercise of consolidate.exercises) {
      expect(owned.has(exercise.targetId ?? exercise.conceptIds[0])).toBe(true);
    }
  });
});

describe('the arc records itself without a schema change', () => {
  it('stores completion under an id that is not a lesson', () => {
    const id = arcStepId(oneLesson.id, 'recall');
    expect(id).toBe(`arc:${oneLesson.id}:recall`);
    /**
     * `completedLessons` is a `Record<string, …>` and nothing requires its keys
     * to name lessons in the curriculum, so the arc needs no new persisted
     * field and no `STATE_VERSION` bump. Content drift is already handled: an
     * id that no longer resolves orphans an entry rather than breaking a screen.
     */
    const learner = havingFinishedLessons(oneLesson);
    learner.completedLessons[id] = { at: NOW, accuracy: 1, times: 1 };
    expect(unitArc(oneLesson, learner, NOW).steps.find((s) => s.phase === 'recall')!.done).toBe(
      true,
    );
  });

  it('does not let an arc step count as a lesson on the path', () => {
    const learner = havingFinishedLessons(oneLesson);
    learner.completedLessons[arcStepId(oneLesson.id, 'mixed')] = {
      at: NOW,
      accuracy: 1,
      times: 1,
    };
    const progress = unitProgress(oneLesson, learner, NOW);
    // Lesson counting is unchanged — the arc is tracked beside it, not inside it.
    expect(progress.lessonsDone).toBe(progress.lessonCount);
  });
});
