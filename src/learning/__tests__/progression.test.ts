import { allLessons, curriculum, getLessonIndex, getUnitForLesson } from '@/content';
import type { Lesson, Unit } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import { unitProgress } from '@/learning/mastery';
import {
  continueTarget,
  lessonReach,
  requiredLessons,
  requiredLessonsDone,
  skipForwardPatch,
  wasSkipped,
} from '@/learning/progression';
import { completedLessonId } from '@/learning/session';
import type { LearnerState } from '@/learning/types';

/**
 * Progression: what "completed" may mean, and what may cause it.
 *
 * Three states, never conflated: **in progress**, **abandoned**, **completed**.
 * Completion is never inferred from answers submitted or XP earned — only from
 * reaching the real end of a session, which `completedLessonId` gates.
 *
 * And one rule for moving faster than the path: **successfully completing a
 * lesson at position X auto-completes every unfinished required lesson before
 * X, and nothing else, ever.** Opening a future unit does nothing. Starting a
 * future lesson and quitting does nothing. Only finishing counts, because only
 * finishing is a deliberate act rather than a glance.
 */

const NOW = Date.UTC(2026, 1, 1);
const DAY = 86_400_000;

const required = requiredLessons();

function complete(learner: LearnerState, lessons: Lesson[], at = NOW - DAY): LearnerState {
  const completedLessons = { ...learner.completedLessons };
  for (const lesson of lessons) {
    completedLessons[lesson.id] = { at, accuracy: 0.85, times: 1 };
  }
  return { ...learner, completedLessons };
}

/** Applies a skip patch the way `LearnerContext.completeSession` does. */
function applyCompletion(learner: LearnerState, lessonId: string, now = NOW): LearnerState {
  const patch = skipForwardPatch(learner, lessonId, now);
  const completedLessons = { ...learner.completedLessons };
  for (const id of patch.lessonIds) {
    completedLessons[id] = { at: now, accuracy: 0, times: 0, skipped: true };
  }
  completedLessons[lessonId] = { at: now, accuracy: 0.9, times: 1 };
  return { ...learner, completedLessons, concepts: { ...learner.concepts, ...patch.concepts } };
}

// ---------------------------------------------------------------------------

describe('the Continue target', () => {
  it('is the first required lesson for a learner who has done nothing', () => {
    expect(continueTarget(makeLearner())?.id).toBe(required[0].id);
  });

  it('is the lesson immediately after the furthest one completed', () => {
    const learner = complete(makeLearner(), required.slice(0, 5));
    expect(continueTarget(learner)?.id).toBe(required[5].id);
  });

  it('never points at an optional lesson', () => {
    /**
     * Enrichment is reachable from its unit, and Continue is the spine. Being
     * handed a story by the button labelled "continue learning" reads as being
     * told to do it, which is exactly what `optional` means it is not.
     */
    const learner = complete(makeLearner(), required.slice(0, 20));
    expect(continueTarget(learner)?.optional).toBeFalsy();
  });

  it('is null once every required lesson is done', () => {
    expect(continueTarget(complete(makeLearner(), required))).toBeNull();
  });
});

describe('opening and abandoning change nothing', () => {
  const far = required[30];

  it('is unmoved by opening a lesson far ahead', () => {
    // Opening is not an event this module can even observe, which is the point:
    // nothing writes on open, so nothing here can move.
    const learner = complete(makeLearner(), required.slice(0, 5));
    expect(continueTarget(learner)?.id).toBe(required[5].id);
    expect(lessonReach(far, learner)).toBe('ahead');
  });

  it('is unmoved by a session that was left before the end', () => {
    /**
     * `completedLessonId` returns undefined without `reachedEnd`, so no lesson
     * id ever reaches the store and no skip can be computed. Answering
     * questions and quitting banks the XP and the memory updates — it does not
     * bank the tick.
     */
    const learner = complete(makeLearner(), required.slice(0, 5));
    const written = completedLessonId({ kind: 'lesson', source: far.id, reachedEnd: false });
    expect(written).toBeUndefined();
    expect(skipForwardPatch(learner, written ?? '', NOW).lessonIds).toEqual([]);
    expect(continueTarget(learner)?.id).toBe(required[5].id);
  });

  it('treats an in-progress marker as no evidence of anything', () => {
    const learner: LearnerState = {
      ...complete(makeLearner(), required.slice(0, 5)),
      activeLesson: { lessonId: far.id, at: NOW },
    };
    expect(continueTarget(learner)?.id).toBe(required[5].id);
    expect(requiredLessonsDone(learner)).toBe(5);
  });
});

describe('completing a lesson ahead back-fills, and only backwards', () => {
  it('marks every unfinished required lesson before it complete', () => {
    const learner = complete(makeLearner(), required.slice(0, 5));
    const target = required[9];
    const after = applyCompletion(learner, target.id);

    for (const lesson of required.slice(5, 9)) {
      expect(after.completedLessons[lesson.id]).toBeDefined();
      expect(wasSkipped(after, lesson.id)).toBe(true);
    }
    expect(after.completedLessons[target.id]).toBeDefined();
    expect(wasSkipped(after, target.id)).toBe(false);
  });

  it('touches nothing after the lesson reached', () => {
    const learner = complete(makeLearner(), required.slice(0, 5));
    const after = applyCompletion(learner, required[9].id);
    for (const lesson of required.slice(10, 20)) {
      expect(after.completedLessons[lesson.id]).toBeUndefined();
    }
  });

  it('moves Continue to the lesson after the one reached', () => {
    const learner = complete(makeLearner(), required.slice(0, 5));
    const after = applyCompletion(learner, required[9].id);
    expect(continueTarget(after)?.id).toBe(required[10].id);
  });

  it('never auto-completes optional lessons', () => {
    /**
     * A skipped-over story stays unplayed. It is enrichment: nothing downstream
     * needs it, and ticking it would claim the learner had read something they
     * have not.
     */
    const learner = makeLearner();
    const target = required[40];
    const after = applyCompletion(learner, target.id);
    const optionalBefore = allLessons.filter(
      (lesson) => lesson.optional && getLessonIndex(lesson.id) < getLessonIndex(target.id),
    );
    expect(optionalBefore.length).toBeGreaterThan(0);
    for (const lesson of optionalBefore) {
      expect(after.completedLessons[lesson.id]).toBeUndefined();
    }
  });

  it('is a no-op when finishing the lesson the learner was already on', () => {
    const learner = complete(makeLearner(), required.slice(0, 5));
    expect(skipForwardPatch(learner, required[5].id, NOW).lessonIds).toEqual([]);
  });

  it('is a no-op for a practice session id', () => {
    /**
     * Practice stores its history in `completedLessons` under
     * `arc:<unit>:<phase>`. It is not a lesson, it is not on the spine, and
     * finishing one must never advance the course.
     */
    const learner = complete(makeLearner(), required.slice(0, 5));
    const unit = getUnitForLesson(required[0].id)!;
    expect(skipForwardPatch(learner, `arc:${unit.id}:recall`, NOW).lessonIds).toEqual([]);
  });
});

describe('a skipped unit unlocks its knowledge without inventing evidence', () => {
  /**
   * The two halves of this are equally load-bearing. A skipped unit has to give
   * the learner everything a played one gives — Library entries, verb
   * paradigms, grammar, eligibility for production, a place in the review queue
   * — or declaring "I know this" would cost them the rest of the course's model
   * of them. But a declaration is not recall, so it may not move a single
   * number that claims to measure memory.
   */
  const learner = complete(makeLearner(), required.slice(0, 3));
  const target = required[12];
  const after = applyCompletion(learner, target.id);
  const skippedConceptIds = required
    .slice(3, 12)
    .flatMap((lesson) => [...lesson.teaches, ...(lesson.grammar ?? [])]);

  it('introduces every concept the skipped lessons taught', () => {
    expect(skippedConceptIds.length).toBeGreaterThan(0);
    for (const id of skippedConceptIds) {
      expect(after.concepts[id]?.introduced).toBe(true);
    }
  });

  it('schedules them for review', () => {
    for (const id of skippedConceptIds) {
      expect(after.concepts[id]!.dueAt).toBeGreaterThan(0);
    }
  });

  it('records no retrieval evidence whatsoever', () => {
    for (const id of skippedConceptIds) {
      const state = after.concepts[id]!;
      expect(state.timesSeen).toBe(0);
      expect(state.strength).toBe(0);
      expect(state.correct).toBe(0);
      expect(state.depth).toBe(1);
    }
  });

  it('leaves a genuinely practised concept exactly as it was', () => {
    const practised = required[4].teaches[0];
    if (!practised) return;
    const withHistory: LearnerState = {
      ...learner,
      concepts: {
        ...learner.concepts,
        [practised]: {
          id: practised,
          firstSeen: NOW - 10 * DAY,
          lastReviewed: NOW - DAY,
          timesSeen: 7,
          correct: 6,
          incorrect: 1,
          lapses: 0,
          streak: 4,
          strength: 0.82,
          stability: 12,
          ease: 2.4,
          dueAt: NOW + 5 * DAY,
          depth: 4,
          kinds: ['translateToEs'],
          introduced: true,
        },
      },
    };
    const result = applyCompletion(withHistory, target.id);
    expect(result.concepts[practised]).toEqual(withHistory.concepts[practised]);
  });
});

describe('unit state follows its required lessons and nothing else', () => {
  /** A unit with at least two required lessons, so "half done" is expressible. */
  const unit: Unit = curriculum
    .flatMap((stage) => stage.units)
    .find((entry) => entry.lessons.filter((lesson) => !lesson.optional).length >= 2)!;
  const unitRequired = unit.lessons.filter((lesson) => !lesson.optional);

  it('is in progress while a required lesson remains', () => {
    const learner = complete(makeLearner(), unitRequired.slice(0, 1));
    expect(unitProgress(unit, learner, NOW).state).toBe('current');
  });

  it('is complete the moment the last required lesson is done', () => {
    const learner = complete(makeLearner(), unitRequired);
    const progress = unitProgress(unit, learner, NOW);
    expect(progress.state).toBe('complete');
    expect(progress.lessonsDone).toBe(progress.lessonCount);
  });

  it('stays complete with its optional lessons untouched', () => {
    const withOptional = curriculum
      .flatMap((stage) => stage.units)
      .find(
        (entry) =>
          entry.lessons.some((lesson) => lesson.optional) &&
          entry.lessons.some((lesson) => !lesson.optional),
      );
    if (!withOptional) return;
    const learner = complete(
      makeLearner(),
      withOptional.lessons.filter((lesson) => !lesson.optional),
    );
    expect(unitProgress(withOptional, learner, NOW).state).toBe('complete');
  });

  it('is completed by a skip exactly as by playing it', () => {
    const learner = makeLearner();
    const last = unitRequired[unitRequired.length - 1];
    const beyond = required[getLessonIndex(last.id) === -1 ? 0 : required.findIndex((l) => l.id === last.id) + 1];
    if (!beyond) return;
    const after = applyCompletion(learner, beyond.id);
    expect(unitProgress(unit, after, NOW).state).toBe('complete');
  });

  it('reports the units a skip closed', () => {
    const learner = makeLearner();
    const patch = skipForwardPatch(learner, required[12].id, NOW);
    expect(patch.units.length).toBeGreaterThan(0);
    for (const closed of patch.units) {
      const closedRequired = closed.lessons.filter((lesson) => !lesson.optional);
      expect(closedRequired.length).toBeGreaterThan(0);
    }
  });
});

describe('the contiguous-prefix invariant', () => {
  /**
   * `continueTarget` is a one-line lookup only because completed required
   * lessons can never have a hole in them: placement completes a prefix, and a
   * skip back-fills. If that ever stops being true, Continue silently starts
   * pointing at a lesson *behind* the learner, and nothing else in the app
   * would notice — so it is asserted directly.
   */
  const holds = (learner: LearnerState) => {
    const flags = required.map((lesson) => !!learner.completedLessons[lesson.id]);
    const firstOpen = flags.indexOf(false);
    return firstOpen === -1 || !flags.slice(firstOpen).includes(true);
  };

  it('holds after completing lessons in order', () => {
    let learner = makeLearner();
    for (const lesson of required.slice(0, 8)) {
      learner = applyCompletion(learner, lesson.id);
      expect(holds(learner)).toBe(true);
    }
  });

  it('holds after jumping far ahead', () => {
    const learner = applyCompletion(complete(makeLearner(), required.slice(0, 4)), required[35].id);
    expect(holds(learner)).toBe(true);
  });

  it('holds after jumping ahead twice, then filling in behind', () => {
    let learner = complete(makeLearner(), required.slice(0, 2));
    learner = applyCompletion(learner, required[20].id);
    learner = applyCompletion(learner, required[45].id);
    // Replaying something long behind must not disturb it either.
    learner = applyCompletion(learner, required[3].id);
    expect(holds(learner)).toBe(true);
    expect(continueTarget(learner)?.id).toBe(required[46].id);
  });

  it('holds for a learner placed partway into the course', () => {
    const learner = complete(makeLearner(), required.slice(0, 24));
    expect(holds(learner)).toBe(true);
    expect(continueTarget(learner)?.id).toBe(required[24].id);
  });
});

describe('revising a completed unit never changes its completion', () => {
  const unit: Unit = curriculum
    .flatMap((stage) => stage.units)
    .find((entry) => entry.lessons.filter((lesson) => !lesson.optional).length >= 1)!;

  it('leaves state, counts and progress untouched when practice is played', () => {
    const learner = complete(
      makeLearner(),
      unit.lessons.filter((lesson) => !lesson.optional),
    );
    const before = unitProgress(unit, learner, NOW);
    expect(before.state).toBe('complete');

    const revised: LearnerState = {
      ...learner,
      completedLessons: {
        ...learner.completedLessons,
        [`arc:${unit.id}:recall`]: { at: NOW, accuracy: 0.9, times: 1 },
        [`arc:${unit.id}:consolidate`]: { at: NOW, accuracy: 0.9, times: 1 },
      },
    };
    const after = unitProgress(unit, revised, NOW);

    expect(after.state).toBe('complete');
    expect(after.lessonsDone).toBe(before.lessonsDone);
    expect(after.lessonCount).toBe(before.lessonCount);
    expect(after.progress).toBe(before.progress);
  });

  it('does not let practice ids leak into the required-lesson count', () => {
    const learner: LearnerState = {
      ...makeLearner(),
      completedLessons: {
        [`arc:${unit.id}:recall`]: { at: NOW, accuracy: 0.9, times: 1 },
      },
    };
    expect(requiredLessonsDone(learner)).toBe(0);
    expect(continueTarget(learner)?.id).toBe(required[0].id);
  });
});
