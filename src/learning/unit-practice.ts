import { getUnitTaughtConcepts } from '@/content';
import type { Unit } from '@/content/types';
import { isRequired } from '@/learning/progression';
import { mastery } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * Optional practice, offered once a unit's lessons are done.
 *
 * ## What this is not, any more
 *
 * These three sessions began life as a unit's "guided arc" — a sequence the
 * learner had to walk *before the unit counted as taught*. The intent was
 * right: 36 of the course's 63 units have exactly one required lesson, so
 * finishing a unit meant meeting nine words, answering twelve questions, and
 * landing near 22% mastery with nothing to do but replay the same lesson.
 *
 * The execution put it in the wrong place. The steps were stored as
 * pseudo-lessons, chained so each unlocked the next, and counted *into the
 * unit's progress figure* — so a unit with every lesson ticked rendered `2/5`
 * with "Next: Active recall" under it. Completion and mastery were two
 * different questions being answered through one number, and the number was
 * unreadable as either.
 *
 * So the sequence survives and the gating does not:
 *
 *   **Lessons are progression. Practice is optional mastery.**
 *
 * A unit is complete when its required lessons are complete. Full stop. These
 * sessions then become available, in any order, as many times as the learner
 * likes. They move mastery. They can never move completion, and they never
 * appear as unfinished lessons or count toward `2/5`.
 *
 * The three still differ in what they demand, which is the part worth keeping:
 *
 *   • `mixed`       — this unit interleaved with earlier material
 *   • `recall`      — retrieval without the props: recall, gap-fill, production
 *   • `consolidate` — the whole unit, weakest first, "can I actually use this?"
 *
 * ## The already-met escape hatch
 *
 * A step still reports `satisfied` when the learner's record already
 * demonstrates what it exists to produce. That mattered more when it gated
 * completion, but it is still worth showing: a learner who already retrieves
 * every concept under pressure should be able to see that recall practice has
 * nothing to offer them, rather than being nudged at it forever.
 */

export type PracticePhase = 'mixed' | 'recall' | 'consolidate';

export interface PracticeStep {
  /**
   * Recorded in `completedLessons` under this id when finished.
   *
   * `completedLessons` is a `Record<string, …>` keyed by lesson id, and nothing
   * requires those keys to name a lesson in the curriculum — so practice stores
   * its history there and needs no new persisted field and no `STATE_VERSION`
   * bump. The `arc:` prefix is kept verbatim: it is a storage key that existing
   * records already contain, and renaming it would orphan every learner's
   * practice history to rename a string nobody sees.
   */
  id: string;
  phase: PracticePhase;
  title: string;
  subtitle: string;
  estMinutes: number;
  /** Played at least once. */
  played: boolean;
  /** Never played, but the learner's record already demonstrates its goal. */
  satisfied: boolean;
  /** Played or already demonstrated — what the tick reflects. */
  done: boolean;
}

export interface UnitPractice {
  unit: Unit;
  steps: PracticeStep[];
  /**
   * Whether practice is offered at all: every required lesson is complete.
   *
   * This is the *only* relationship practice has to lessons, and it runs one
   * way. Lessons decide when practice appears; practice never decides anything
   * about lessons.
   */
  unlocked: boolean;
  /** Practice steps done — never mixed with lesson counts. */
  done: number;
  /** Practice steps offered. Not a denominator for unit progress. */
  total: number;
  /** A suggested next step, purely as a recommendation. Steps are unordered. */
  suggested: PracticeStep | null;
  /** Every practice step done. Does not gate anything. */
  complete: boolean;
}

const PHASE_COPY: Record<PracticePhase, { title: string; subtitle: string }> = {
  mixed: {
    title: 'Mixed practice',
    subtitle: 'This unit alongside what you already knew',
  },
  recall: {
    title: 'Active recall',
    subtitle: 'Without the word banks this time',
  },
  consolidate: {
    title: 'Consolidate',
    subtitle: 'The whole unit — can you use it?',
  },
};

/** Roughly six minutes each, which is what makes three of them a sitting apiece. */
const PHASE_MINUTES = 6;

/**
 * How much of a unit has to satisfy a step's goal before it counts as already
 * achieved.
 *
 * Not all of it. A unit always has a straggler or two — a word that appears in
 * one sentence, a paradigm with one person — and requiring every concept would
 * mean nothing was ever satisfied and the escape hatch would never open.
 */
const SATISFIED_FRACTION = 0.8;

/** Retrieved under pressure at least once: the evidence `recall` exists to create. */
const RECALL_DEPTH = 3;

/** Unit mastery at which consolidation has demonstrably happened. */
const CONSOLIDATED_MASTERY = 0.8;

/**
 * Which practice steps a unit offers.
 *
 * A unit that already runs two or three lessons has done its own mixed
 * practice — the later lessons interleave the earlier ones by construction — so
 * it goes straight to retrieval. A one-lesson unit gets all three. Small units
 * get fewer, because a unit teaching four words does not need half an hour and
 * padding it would be exactly the mindless repetition to avoid.
 */
export function phasesFor(unit: Unit): PracticePhase[] {
  const required = unit.lessons.filter(isRequired);
  if (required.length === 0) return [];

  const taught = getUnitTaughtConcepts(unit).length;
  if (taught === 0) return [];
  // Barely any material: one consolidation pass is the honest amount.
  if (taught <= 4) return ['consolidate'];

  const minutes = required.reduce((sum, lesson) => sum + lesson.estMinutes, 0);
  if (required.length >= 3 || minutes >= 22) return ['recall', 'consolidate'];
  return ['mixed', 'recall', 'consolidate'];
}

export function practiceStepId(unitId: string, phase: PracticePhase): string {
  return `arc:${unitId}:${phase}`;
}

/** The unit id a practice step belongs to, or null if this is not one. */
export function unitIdForPracticeStep(stepId: string): string | null {
  const parts = stepId.split(':');
  return parts[0] === 'arc' && parts.length === 3 ? parts[1] : null;
}

export function practicePhaseOf(stepId: string): PracticePhase | null {
  const parts = stepId.split(':');
  if (parts[0] !== 'arc' || parts.length !== 3) return null;
  const phase = parts[2];
  return phase === 'mixed' || phase === 'recall' || phase === 'consolidate' ? phase : null;
}

/**
 * Whether the learner's record already demonstrates what a step would teach.
 *
 * Each test names the evidence the step exists to produce, so satisfying it
 * without playing it is not a loophole — it is the same claim, arrived at
 * another way.
 */
function goalMet(
  phase: PracticePhase,
  taught: string[],
  learner: LearnerState,
  now: number,
): boolean {
  if (taught.length === 0) return true;
  const need = Math.ceil(taught.length * SATISFIED_FRACTION);

  switch (phase) {
    case 'mixed':
      // Retrieved more than once, so it is no longer a first impression.
      return taught.filter((id) => (learner.concepts[id]?.timesSeen ?? 0) >= 2).length >= need;
    case 'recall':
      // Retrieved in something demanding — not merely recognised in a list.
      return (
        taught.filter((id) => (learner.concepts[id]?.depth ?? 1) >= RECALL_DEPTH).length >= need
      );
    case 'consolidate':
    default: {
      const states = taught
        .map((id) => learner.concepts[id])
        .filter((state) => !!state && state.timesSeen > 0);
      if (states.length < need) return false;
      const value =
        states.reduce((sum, state) => sum + mastery(state!, now), 0) / states.length;
      return value >= CONSOLIDATED_MASTERY;
    }
  }
}

export function unitPractice(unit: Unit, learner: LearnerState, now = Date.now()): UnitPractice {
  const required = unit.lessons.filter(isRequired);
  const lessons = required.length > 0 ? required : unit.lessons;
  /**
   * Practice opens when the unit is complete, and completion means required
   * lessons. A unit built entirely of enrichment is itself the optional thing,
   * so it is measured against all of its lessons — otherwise it would offer
   * practice before it had been opened.
   */
  const unlocked = lessons.length > 0 && lessons.every((lesson) => !!learner.completedLessons[lesson.id]);

  const taught = getUnitTaughtConcepts(unit);

  const steps: PracticeStep[] = phasesFor(unit).map((phase) => {
    const id = practiceStepId(unit.id, phase);
    const played = !!learner.completedLessons[id];
    const satisfied = !played && goalMet(phase, taught, learner, now);
    return {
      id,
      phase,
      ...PHASE_COPY[phase],
      estMinutes: PHASE_MINUTES,
      played,
      satisfied,
      done: played || satisfied,
    };
  });

  const done = steps.filter((step) => step.done).length;

  return {
    unit,
    steps,
    unlocked,
    done,
    total: steps.length,
    // A recommendation, not a gate: every step is openable whenever practice is.
    suggested: unlocked ? (steps.find((step) => !step.done) ?? null) : null,
    complete: steps.every((step) => step.done),
  };
}
