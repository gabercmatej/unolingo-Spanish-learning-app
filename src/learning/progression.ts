import { allLessons, getLesson, getLessonIndex, getUnitForLesson } from '@/content';
import type { Lesson, Unit } from '@/content/types';
import { createConceptState, introduce } from '@/learning/srs';
import type { ConceptState, LearnerState } from '@/learning/types';

/**
 * Where the learner is in the course, and nothing else.
 *
 * This module owns exactly one question — *what has been progressed through* —
 * and deliberately knows nothing about how well any of it is remembered. That
 * separation is the whole point of this file existing. A unit used to describe
 * itself through three overlapping state machines at once: `UnitState` read off
 * required lessons, `UnitPhase` read off mastery, and a generated `UnitArc`
 * whose revision steps were stored as pseudo-lessons and then *rendered as the
 * unit's progress counter*. Each was internally correct. Together they produced
 * a unit that had every lesson ticked and still said `2/5`, which is how
 * "completed" and "mastered" came to look like the same broken claim.
 *
 * So, stated once:
 *
 *   **Lessons are progression. Practice is optional mastery.**
 *
 * Every lesson in a unit's spine is required, and all of them done means the
 * unit is complete — full stop. Mixed practice, active recall, consolidation,
 * strengthening and Smart Review all happen *after* that, improve mastery, and
 * can never change whether the unit is completed. The two never share a
 * counter, a progress bar or a list.
 */

/** Whether a lesson sits on the course's required spine. */
export function isRequired(lesson: Lesson): boolean {
  return !lesson.optional;
}

/**
 * The course's required spine, in curriculum order.
 *
 * Optional lessons — stories, listening, conversation enrichment — are excluded
 * everywhere in this module. They never gate progression, they are never
 * auto-completed by a skip, and Continue never points at one. Skipping a story
 * must not wall off the rest of the course, and being handed one must not feel
 * like being told to do it.
 */
export function requiredLessons(): Lesson[] {
  return allLessons.filter(isRequired);
}

/**
 * How far ahead of the learner a lesson sits.
 *
 * `ahead` is a *soft* lock. The course still guides order — ahead content is
 * dimmed and visibly off the recommended path — but it stays openable, because
 * finishing something ahead is now the sanctioned way to say "I already know
 * the material before this". See `skipForwardPatch`.
 */
export type LessonReach = 'done' | 'next' | 'ahead';

export function lessonReach(lesson: Lesson, learner: LearnerState): LessonReach {
  if (learner.completedLessons[lesson.id]) return 'done';
  return continueTarget(learner)?.id === lesson.id ? 'next' : 'ahead';
}

/**
 * The lesson the Continue button opens: the first incomplete required lesson.
 *
 * That one line is only correct because of an invariant this module maintains
 * rather than assumes: **the completed required lessons always form a
 * contiguous prefix of the course.** Placement completes a prefix, and
 * `skipForwardPatch` back-fills every gap behind anything finished ahead — so
 * a hole can never open in the middle. "The furthest lesson fully completed"
 * and "the first lesson not completed" are therefore the same boundary,
 * approached from opposite sides, and Continue needs no session history, no
 * recency heuristic and no scan of what the learner has been poking at.
 *
 * The invariant is load-bearing enough to have its own regression test. If it
 * ever breaks, this function silently starts pointing at a lesson behind the
 * learner rather than in front of them.
 */
export function continueTarget(learner: LearnerState): Lesson | null {
  return requiredLessons().find((lesson) => !learner.completedLessons[lesson.id]) ?? null;
}

/** How many required lessons have been completed. */
export function requiredLessonsDone(learner: LearnerState): number {
  return requiredLessons().filter((lesson) => !!learner.completedLessons[lesson.id]).length;
}

/**
 * Whether a lesson was ticked by skipping past it rather than by being played.
 *
 * `skipped` is an optional field on an object that already exists in the
 * record, so recording it needs **no `STATE_VERSION` bump** — the same shape as
 * the reproduction fields on `MistakeRecord`, and a record written by an older
 * build simply comes back without it.
 */
export function wasSkipped(learner: LearnerState, lessonId: string): boolean {
  return learner.completedLessons[lessonId]?.skipped === true;
}

export interface SkipPatch {
  /** Lesson ids marked complete because the learner finished something after them. */
  lessonIds: string[];
  /** Concept states to merge, each introduced but deliberately unscored. */
  concepts: Record<string, ConceptState>;
  /** Units that became complete as a result — the results screen names these. */
  units: Unit[];
}

const EMPTY_PATCH: SkipPatch = { lessonIds: [], concepts: {}, units: [] };

/**
 * What finishing a lesson ahead of the learner's position implies about
 * everything behind it.
 *
 * The rule, stated exactly: **successfully completing required lesson X
 * auto-completes every unfinished required lesson before X.** Nothing else,
 * ever. Opening a future unit does nothing. Opening a future lesson does
 * nothing. Starting one and quitting does nothing. Being killed by the OS
 * halfway through does nothing. Only reaching the real end of a session — which
 * `completedLessonId` already gates on — counts as proof of intent, because
 * only that is a deliberate act rather than a glance.
 *
 * Nothing *after* the reached lesson is touched, optional lessons are never
 * auto-completed, and practice sessions are not lessons and are out of scope
 * entirely.
 *
 * ## Why the concepts are introduced but not scored
 *
 * A skipped unit has to unlock its knowledge exactly like a played one: its
 * words, verbs, grammar and expressions must appear in the Library, become
 * eligible for production, and enter the review queue. Otherwise "I know this
 * already" costs the learner the entire rest of the course's model of them.
 *
 * But a skip is a *declaration*, not evidence of recall — so every concept goes
 * through `introduce()`, which sets `introduced` and schedules `dueAt` while
 * deliberately leaving `timesSeen`, `strength`, `depth` and `lastReviewed`
 * alone. That is the codebase's existing **encountered vs retrieved**
 * distinction, and honouring it here is what keeps the invariant that *only
 * evidence may move mastery*. Seeding strength instead would inflate every
 * average in the app on the say-so of a button press, and the mastery figure
 * would stop meaning anything the moment it was most needed.
 */
export function skipForwardPatch(
  learner: LearnerState,
  lessonId: string,
  now: number = Date.now(),
): SkipPatch {
  const target = getLesson(lessonId);
  // Practice ids (`arc:<unit>:<phase>`) and anything else that is not a lesson
  // on the spine can never trigger a skip. Optional lessons cannot either:
  // finishing a story says nothing about the grammar lessons before it.
  if (!target || !isRequired(target)) return EMPTY_PATCH;

  const targetIndex = getLessonIndex(lessonId);
  if (targetIndex < 0) return EMPTY_PATCH;

  const behind = requiredLessons().filter(
    (lesson) =>
      getLessonIndex(lesson.id) < targetIndex && !learner.completedLessons[lesson.id],
  );
  if (behind.length === 0) return EMPTY_PATCH;

  const concepts: Record<string, ConceptState> = {};
  for (const lesson of behind) {
    for (const conceptId of [...lesson.teaches, ...(lesson.grammar ?? [])]) {
      const existing =
        concepts[conceptId] ?? learner.concepts[conceptId] ?? createConceptState(conceptId, now);
      // Already met through normal study? Leave it exactly as it is — a skip
      // must never overwrite real evidence with a weaker claim.
      concepts[conceptId] = existing.introduced ? existing : introduce(existing, now);
    }
  }

  const lessonIds = behind.map((lesson) => lesson.id);
  const closed = new Set(lessonIds);

  /**
   * Units that this skip finishes off.
   *
   * A unit counts as closed only if it was *not* already complete and every one
   * of its required lessons is now accounted for — either previously done or
   * filled in by this patch. Reported so the results screen can say which units
   * were skipped past, rather than leaving the learner to notice three ticks
   * appearing somewhere behind them.
   */
  const units: Unit[] = [];
  const seen = new Set<string>();
  for (const lesson of behind) {
    const unit = getUnitForLesson(lesson.id);
    if (!unit || seen.has(unit.id)) continue;
    seen.add(unit.id);

    const required = unit.lessons.filter(isRequired);
    if (required.length === 0) continue;
    const wasComplete = required.every((entry) => !!learner.completedLessons[entry.id]);
    const nowComplete = required.every(
      (entry) => !!learner.completedLessons[entry.id] || closed.has(entry.id),
    );
    if (!wasComplete && nowComplete) units.push(unit);
  }

  return { lessonIds, concepts, units };
}
