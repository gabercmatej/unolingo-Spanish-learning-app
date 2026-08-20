import { getUnitTaughtConcepts } from '@/content';
import type { Unit } from '@/content/types';
import { mastery } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * The guided arc a unit walks the learner through before it calls itself done.
 *
 * The problem this solves, measured: **36 of the course's 63 units have exactly
 * one required lesson**, and the median unit carries 13 minutes of required
 * content. So the shape of a unit was: meet nine new words, answer about twelve
 * questions, see a tick, and arrive at a mastery figure around 22% with nothing
 * to do about it but tap the same lesson again. That is not a unit; it is an
 * introduction with a tick on it, and it pushed the entire job of establishing
 * the memory onto the learner's own judgement.
 *
 * The fix is *not* more lessons in `curriculum.ts`. Lessons in this codebase
 * declare material, not exercises — `session.ts` builds the exercises, which is
 * what lets the same lesson be gentle on a first pass and demanding on a later
 * one. So the arc is generated from the material the unit already has, and adds
 * no content at all. What it adds is a **sequence**:
 *
 *   1. the unit's own lessons — meeting the material, heavily scaffolded
 *   2. `mixed`       — current unit interleaved with earlier material,
 *                      scaffolding starting to come off
 *   3. `recall`      — retrieval without the props: recall, gap-fill, production
 *   4. `consolidate` — the whole unit, weakest first, "can I actually use this?"
 *
 * Three to five short sittings, twenty to thirty minutes, which is roughly what
 * it takes for nine new words to stop being nine new words. After that the unit
 * is complete and spaced repetition takes over — which is the point at which
 * mastery becomes SRS's job rather than the learner's.
 *
 * **A phase is complete when it has been done *or* when its goal is already
 * met.** That second clause is what stops this becoming the Duolingo failure
 * the brief warns about: a learner who already retrieves every concept in the
 * unit under pressure has nothing to gain from a `recall` session, and making
 * them sit through one to earn a tick would be the app manufacturing work. It
 * also means a unit finished before this existed does not suddenly reopen if
 * the learner genuinely knows it.
 */

export type ArcPhase = 'mixed' | 'recall' | 'consolidate';

export interface ArcStep {
  /**
   * Recorded in `completedLessons` under this id when finished.
   *
   * `completedLessons` is a `Record<string, …>` keyed by lesson id, and nothing
   * requires those keys to name a lesson in the curriculum — so the arc stores
   * its progress there and needs no new persisted field and no `STATE_VERSION`
   * bump. Content drift is already handled: an id that no longer resolves
   * orphans an entry rather than breaking a screen.
   */
  id: string;
  phase: ArcPhase;
  title: string;
  subtitle: string;
  estMinutes: number;
  /** Finished, or its goal already demonstrated. */
  done: boolean;
  /** True when it was never played but the learner's record already satisfies it. */
  satisfied: boolean;
  /** Every earlier step in the arc is done. */
  unlocked: boolean;
}

export interface UnitArc {
  unit: Unit;
  steps: ArcStep[];
  /** Required lessons plus arc steps. */
  stepCount: number;
  stepsDone: number;
  /** The next thing to do, or null when the arc is finished. */
  next: ArcStep | null;
  /** Every required lesson and every arc step is done. */
  complete: boolean;
}

const PHASE_COPY: Record<ArcPhase, { title: string; subtitle: string }> = {
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
 * How much of a unit has to satisfy a phase's goal before the phase counts as
 * already achieved.
 *
 * Not all of it. A unit always has a straggler or two — a word that appears in
 * one sentence, a paradigm with one person — and requiring every concept would
 * mean no phase was ever satisfied and the escape hatch would never open.
 */
const SATISFIED_FRACTION = 0.8;

/** Retrieved under pressure at least once: the evidence `recall` exists to create. */
const RECALL_DEPTH = 3;

/** Unit mastery at which consolidation has demonstrably happened. */
const CONSOLIDATED_MASTERY = 0.8;

/**
 * Which phases a unit needs.
 *
 * A unit that already runs two or three lessons has done its own mixed
 * practice — the later lessons interleave the earlier ones by construction —
 * so it goes straight to retrieval. A one-lesson unit gets the full three.
 * Small units get fewer, because a unit teaching four words does not need
 * half an hour and padding it would be the repetition this pass is meant to
 * avoid.
 */
export function phasesFor(unit: Unit): ArcPhase[] {
  const required = unit.lessons.filter((lesson) => !lesson.optional);
  if (required.length === 0) return [];

  const taught = getUnitTaughtConcepts(unit).length;
  if (taught === 0) return [];
  // Barely any material: one consolidation pass is the honest amount.
  if (taught <= 4) return ['consolidate'];

  const minutes = required.reduce((sum, lesson) => sum + lesson.estMinutes, 0);
  if (required.length >= 3 || minutes >= 22) return ['recall', 'consolidate'];
  return ['mixed', 'recall', 'consolidate'];
}

export function arcStepId(unitId: string, phase: ArcPhase): string {
  return `arc:${unitId}:${phase}`;
}

/** The unit id an arc step belongs to, or null if this is not an arc step. */
export function unitIdForArcStep(stepId: string): string | null {
  const parts = stepId.split(':');
  return parts[0] === 'arc' && parts.length === 3 ? parts[1] : null;
}

export function arcPhaseOf(stepId: string): ArcPhase | null {
  const parts = stepId.split(':');
  if (parts[0] !== 'arc' || parts.length !== 3) return null;
  const phase = parts[2];
  return phase === 'mixed' || phase === 'recall' || phase === 'consolidate' ? phase : null;
}

/**
 * Whether the learner's record already demonstrates what a phase would teach.
 *
 * Each test names the evidence the phase exists to produce, so satisfying it
 * without playing it is not a loophole — it is the same claim, arrived at
 * another way.
 */
function goalMet(
  phase: ArcPhase,
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

export function unitArc(unit: Unit, learner: LearnerState, now = Date.now()): UnitArc {
  const required = unit.lessons.filter((lesson) => !lesson.optional);
  const lessons = required.length > 0 ? required : unit.lessons;
  const lessonsDone = lessons.filter((lesson) => !!learner.completedLessons[lesson.id]).length;
  const teachingDone = lessons.length > 0 && lessonsDone === lessons.length;

  const taught = getUnitTaughtConcepts(unit);
  const phases = phasesFor(unit);

  const steps: ArcStep[] = [];
  let previousDone = teachingDone;

  for (const phase of phases) {
    const id = arcStepId(unit.id, phase);
    const played = !!learner.completedLessons[id];
    const satisfied = !played && goalMet(phase, taught, learner, now);
    const done = played || satisfied;

    steps.push({
      id,
      phase,
      ...PHASE_COPY[phase],
      estMinutes: PHASE_MINUTES,
      done,
      satisfied,
      /**
       * The arc is a sequence, so a step opens when the one before it closed —
       * and the whole arc waits on the unit's lessons, because there is nothing
       * to consolidate before the material has been met.
       */
      unlocked: teachingDone && previousDone,
    });
    previousDone = done;
  }

  const stepsDone = lessonsDone + steps.filter((step) => step.done).length;
  const stepCount = lessons.length + steps.length;

  return {
    unit,
    steps,
    stepCount,
    stepsDone,
    next: steps.find((step) => !step.done && step.unlocked) ?? null,
    complete: teachingDone && steps.every((step) => step.done),
  };
}
