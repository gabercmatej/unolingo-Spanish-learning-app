import { curriculum } from '@/content';
import type { Lesson, Unit } from '@/content/types';
import { newlyUnlocked } from '@/learning/achievements';
import { checkExercise } from '@/learning/check';
import type { Exercise } from '@/learning/exercise';
import { estimateProficiency, unitProgress } from '@/learning/mastery';
import {
  adjustAbility,
  applyPlacement,
  nextPlacementQuestion,
  scorePlacement,
  type PlacementAnswer,
} from '@/learning/placement';
import { buildSession, isLessonUnlocked, type SessionPlan } from '@/learning/session';
import { createConceptState, introduce, mastery, review } from '@/learning/srs';
import type { Grade, LearnerState, MistakeRecord } from '@/learning/types';
import { cumulativeXp, levelInfo, xpForAnswer } from '@/learning/xp';
import { DEFAULT_SETTINGS_FOR_TEST, makeLearner } from './helpers';

/**
 * One walk through the whole app, in the order a person actually does it:
 * placement → lesson → a wrong answer → the review that follows it → finishing
 * a unit → an optional story → Smart Review → the checkpoint → closing and
 * reopening the app → carrying on.
 *
 * Every link in that chain already has its own test. The chain does not, and
 * this codebase has been bitten by exactly that before: the conjugation system
 * was tested part by part and was dead end to end for months. So this walks the
 * path rather than testing another part of it.
 *
 * It reimplements what `LearnerContext` does on each answer — `review` over the
 * exercise's concepts, a mistake record on a wrong one — because those
 * transitions are pure and the context is a thin React wrapper over them.
 */

// --- The bits of LearnerContext this journey needs, without React -----------

interface Store {
  learner: LearnerState;
}

function answer(store: Store, exercise: Exercise, response: string, now: number): Grade {
  const result = checkExercise(exercise, response, store.learner.settings);
  const concepts = { ...store.learner.concepts };

  for (const conceptId of exercise.conceptIds) {
    const existing = concepts[conceptId] ?? createConceptState(conceptId, now);
    concepts[conceptId] = review(existing, {
      grade: result.grade,
      difficulty: exercise.difficulty,
      kind: exercise.kind,
      now,
    });
  }

  const mistakes: MistakeRecord[] =
    result.grade === 'incorrect'
      ? [
          ...store.learner.mistakes,
          {
            id: `${exercise.id}:${now}`,
            at: now,
            conceptIds: exercise.conceptIds,
            kind: exercise.kind,
            prompt: exercise.instruction,
            given: response,
            expected: result.expected,
          },
        ]
      : store.learner.mistakes;

  store.learner = {
    ...store.learner,
    concepts,
    mistakes,
    xp:
      store.learner.xp +
      xpForAnswer({
        kind: exercise.kind,
        grade: result.grade,
        hardMode: store.learner.settings.hardMode,
        mastery: 0,
      }),
  };
  return result.grade;
}

/** What a learner who knows the material would type or tap. */
function correctResponse(exercise: Exercise): string {
  switch (exercise.form) {
    case 'presentation':
      return '';
    case 'choice':
      return String(exercise.answerIndex);
    case 'match':
      return 'perfect';
    case 'speak':
      return 'said';
    case 'wordBank':
      return exercise.answer;
    case 'typed':
      return exercise.accepted[0];
    case 'conversation':
      return exercise.options
        ? String(exercise.options.findIndex((option) => option.natural))
        : exercise.accepted[0];
  }
}

/** A confidently wrong answer, in whatever form the exercise takes. */
function wrongResponse(exercise: Exercise): string {
  switch (exercise.form) {
    case 'choice':
      // Any option that is not the right one.
      return String(exercise.answerIndex === 0 ? 1 : 0);
    case 'conversation':
      return exercise.options
        ? String(exercise.options.findIndex((option) => !option.natural))
        : 'esto no es la respuesta';
    default:
      return 'esto no es la respuesta';
  }
}

/** Plays a whole session correctly, marking presentation cards as introduced. */
function play(store: Store, plan: SessionPlan, now: number): { answered: number; graded: Grade[] } {
  const graded: Grade[] = [];
  for (const exercise of plan.exercises) {
    if (exercise.form === 'presentation') {
      const concepts = { ...store.learner.concepts };
      for (const id of exercise.conceptIds) {
        concepts[id] = introduce(concepts[id] ?? createConceptState(id, now), now);
      }
      store.learner = { ...store.learner, concepts };
      continue;
    }
    graded.push(answer(store, exercise, correctResponse(exercise), now));
  }
  return { answered: graded.length, graded };
}

/** The record `completeSession` writes — a timestamp, best accuracy and a count. */
function markComplete(learner: LearnerState, lessonId: string, now: number) {
  const previous = learner.completedLessons[lessonId];
  return { at: now, accuracy: previous ? Math.max(previous.accuracy, 1) : 1, times: (previous?.times ?? 0) + 1 };
}

function completeLesson(store: Store, lesson: Lesson, now: number, seed = 3): SessionPlan {
  const plan = buildSession('lesson', lesson.id, { learner: store.learner, now, seed })!;
  expect(plan).not.toBeNull();
  play(store, plan, now);
  store.learner = {
    ...store.learner,
    completedLessons: {
      ...store.learner.completedLessons,
      [lesson.id]: markComplete(store.learner, lesson.id, now),
    },
  };
  return plan;
}

/** What AsyncStorage does to the state, and what hydration does on the way back. */
function closeAndReopen(learner: LearnerState): LearnerState {
  const persisted = JSON.parse(JSON.stringify(learner)) as LearnerState;
  return {
    ...learner,
    ...persisted,
    settings: { ...DEFAULT_SETTINGS_FOR_TEST, ...persisted.settings },
  };
}

// ---------------------------------------------------------------------------

describe('a learner walks the whole app', () => {
  const now = Date.UTC(2026, 0, 12, 9, 0, 0);
  const firstStage = curriculum[0];
  const firstUnit = firstStage.units[0];

  it('takes the placement test and lands somewhere sensible', () => {
    const answers: PlacementAnswer[] = [];
    const asked: string[] = [];
    let ability = 0;

    // Answers the easy half right and the hard half wrong — a real A1 learner.
    for (let i = 0; i < 12; i += 1) {
      const question = nextPlacementQuestion(asked, ability, answers);
      if (!question) break;
      const correct = i < 6;
      asked.push(question.id);
      answers.push({ question, correct });
      ability = adjustAbility(ability, correct, answers.length);
    }

    expect(answers.length).toBeGreaterThan(0);
    const score = scorePlacement(answers);
    const placed = applyPlacement(makeLearner({ createdAt: now }), score, answers, now);

    expect(placed.placement).not.toBeNull();
    // Placement seeds concept knowledge; it does not fabricate a whole course.
    expect(Object.keys(placed.concepts).length).toBeGreaterThan(0);
  });

  it('runs the full path from first lesson to checkpoint and survives a restart', () => {
    const store: Store = { learner: makeLearner({ createdAt: now }) };
    let clock = now;

    // --- 1. The first lesson -----------------------------------------------
    const firstLesson = firstUnit.lessons[0];
    expect(isLessonUnlocked(firstLesson, store.learner)).toBe(true);

    const plan = buildSession('lesson', firstLesson.id, { learner: store.learner, now: clock, seed: 1 })!;
    expect(plan.exercises.length).toBeGreaterThan(6);
    play(store, plan, clock);
    store.learner = {
      ...store.learner,
      completedLessons: {
        ...store.learner.completedLessons,
        [firstLesson.id]: markComplete(store.learner, firstLesson.id, clock),
      },
    };
    expect(store.learner.xp).toBeGreaterThan(0);

    // --- 2. A wrong answer, and what it does -------------------------------
    clock += 60_000;
    const later = buildSession('lesson', firstLesson.id, { learner: store.learner, now: clock, seed: 9 })!;
    // Whatever the session offers, answer one of them wrong. A real learner does
    // not get to choose which exercise they fail.
    const failable = later.exercises.find(
      (e) =>
        e.form !== 'presentation' &&
        e.form !== 'match' &&
        e.form !== 'speak' &&
        // Pick one whose concept the first lesson already taught, so there is a
        // "before" to compare the damage against.
        store.learner.concepts[e.conceptIds[0]] !== undefined,
    );
    expect(failable).toBeDefined();

    const target = failable!.conceptIds[0];
    const before = store.learner.concepts[target]!;
    const grade = answer(store, failable!, wrongResponse(failable!), clock);
    const after = store.learner.concepts[target]!;

    expect(grade).toBe('incorrect');
    expect(store.learner.mistakes).toHaveLength(1);
    // A wrong answer shortens the interval and never blocks anything.
    expect(after.dueAt).toBeLessThanOrEqual(before.dueAt);
    expect(mastery(after, clock)).toBeLessThanOrEqual(mastery(before, clock));

    // --- 3. Smart Review picks the damage up -------------------------------
    clock += 2 * 86400_000;
    const smart = buildSession('smartReview', 'smartReview', { learner: store.learner, now: clock, seed: 4 });
    expect(smart).not.toBeNull();
    expect(smart!.exercises.length).toBeGreaterThan(0);
    play(store, smart!, clock);

    // Answering it right again pulls the concept back up.
    expect(mastery(store.learner.concepts[target]!, clock)).toBeGreaterThan(0);

    // --- 4. Finish the unit's required lessons -----------------------------
    const required = firstUnit.lessons.filter((lesson) => !lesson.optional);
    for (const lesson of required.slice(1)) {
      clock += 86400_000;
      expect(isLessonUnlocked(lesson, store.learner)).toBe(true);
      completeLesson(store, lesson, clock);
    }

    const unit = unitProgress(firstUnit, store.learner, clock);
    expect(unit.state).toBe('complete');

    // --- 5. Skipping the optional lessons must not have blocked anything ----
    const optional = firstUnit.lessons.filter((lesson) => lesson.optional);
    for (const lesson of optional) {
      expect(store.learner.completedLessons[lesson.id]).toBeUndefined();
    }
    const nextUnit = firstStage.units[1];
    expect(isLessonUnlocked(nextUnit.lessons[0], store.learner)).toBe(true);

    // --- 6. Close the app, reopen it ---------------------------------------
    const reopened = closeAndReopen(store.learner);
    expect(Object.keys(reopened.concepts)).toEqual(Object.keys(store.learner.concepts));
    expect(reopened.mistakes).toHaveLength(store.learner.mistakes.length);
    expect(reopened.xp).toBe(store.learner.xp);
    expect(unitProgress(firstUnit, reopened, clock).state).toBe('complete');
    store.learner = reopened;

    // --- 7. Carry on: an optional story, then the checkpoint ---------------
    const story = findLesson(curriculum[0].units, (l) => l.kind === 'story');
    if (story) {
      clock += 86400_000;
      const storyPlan = buildSession('lesson', story.id, { learner: store.learner, now: clock, seed: 2 });
      expect(storyPlan).not.toBeNull();
      expect(storyPlan!.exercises.length).toBeGreaterThan(0);
      play(store, storyPlan!, clock);
    }

    const checkpoint = findLesson(curriculum[0].units, (l) => l.kind === 'checkpoint')!;
    clock += 86400_000;
    const checkpointPlan = buildSession('checkpoint', checkpoint.id, {
      learner: store.learner,
      now: clock,
      seed: 5,
    })!;
    expect(checkpointPlan.exercises.length).toBeGreaterThan(8);
    const played = play(store, checkpointPlan, clock);
    // Answering a checkpoint correctly must not report failures.
    expect(played.graded.filter((g) => g === 'incorrect')).toHaveLength(0);

    // --- 8. And the estimate is a number, not a crash ----------------------
    const estimate = estimateProficiency(store.learner, clock);
    expect(estimate.level).toBeDefined();
    expect(store.learner.xp).toBeGreaterThan(50);
  });
});

function findLesson(units: Unit[], predicate: (lesson: Lesson) => boolean): Lesson | undefined {
  for (const unit of units) {
    const found = unit.lessons.find(predicate);
    if (found) return found;
  }
  return undefined;
}

describe('the session tells you what just happened', () => {
  const now = Date.UTC(2026, 0, 12, 9, 0, 0);

  it('reports an achievement the moment it is crossed, and only once', () => {
    // Achievements are derived, so "new" is a diff — there is no stored flag to
    // get out of sync, and equally nothing to stop a naive implementation from
    // re-announcing the same trophy every session.
    const before = makeLearner({ xp: 90 });
    const after = makeLearner({ xp: 900 });

    const first = newlyUnlocked(before, after, now);
    expect(first.length).toBeGreaterThan(0);
    expect(first.every((a) => a.unlocked)).toBe(true);

    // The same state twice unlocks nothing.
    expect(newlyUnlocked(after, after, now)).toEqual([]);
    // And going further does not re-announce what was already announced.
    const later = newlyUnlocked(after, makeLearner({ xp: 1200 }), now);
    expect(later.map((a) => a.id)).not.toEqual(expect.arrayContaining(first.map((a) => a.id)));
  });

  it('crosses a level exactly when the XP curve says so', () => {
    // The celebration is driven by levelBefore !== levelAfter, so an off-by-one
    // here is a party that never happens or one that happens twice.
    const boundary = cumulativeXp(2);
    expect(levelInfo(boundary - 1).level).toBe(1);
    expect(levelInfo(boundary).level).toBe(2);
  });
});
