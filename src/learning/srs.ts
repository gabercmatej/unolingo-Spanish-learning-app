import type { ConceptState, Difficulty, ExerciseKind, Grade } from '@/learning/types';

/**
 * Spaced repetition.
 *
 * Rather than a fixed ladder of intervals, each concept carries a `stability`:
 * the number of days until its predicted retrievability decays to the review
 * threshold. That gives two things a simple interval table cannot:
 *
 *   • a *continuous* "how likely am I to still know this" score, which is what
 *     ranks the Smart Review queue and detects concepts at risk of being lost;
 *   • intervals that respond to how hard the exercise was. Recalling a word by
 *     typing it in a sentence extends the interval further than recognising it
 *     in a multiple choice, because it is stronger evidence of knowing it.
 */

export const DAY_MS = 86_400_000;

/** Retrievability at which an item becomes due. */
const REVIEW_THRESHOLD = 0.9;

const MIN_STABILITY = 0.01; // ~15 minutes
const MAX_STABILITY = 400;
const INITIAL_STABILITY = 0.4; // due tomorrow

/**
 * The early phase: how many successful retrievals a concept needs before the
 * scheduler is allowed to send it away for a week.
 *
 * Three correct answers inside one session is not evidence of memory, it is
 * evidence of a working short-term buffer — and the multiplicative interval
 * happily reads it as the former. A concept met on Monday and answered well
 * three times reached a 2.5-day interval, so the first genuine retrieval
 * attempt happened on Wednesday at the earliest, by which point most of it is
 * gone. Capping the interval until the concept has come back on a *later day*
 * is what makes "learn it properly today, meet it again tomorrow" the default
 * without degenerating into "everything returns tomorrow".
 */
const EARLY_PHASE_REPS = 4;
const EARLY_PHASE_MAX_STABILITY = 1.4;
/** Strength below which a concept is still being learned, however often it has been seen. */
const EARLY_PHASE_STRENGTH = 0.5;
const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const INITIAL_EASE = 2.0;

const GRADE_SCORE: Record<Grade, number> = { correct: 1, almost: 0.75, incorrect: 0 };

export function createConceptState(id: string, now: number = Date.now()): ConceptState {
  return {
    id,
    firstSeen: now,
    lastReviewed: now,
    timesSeen: 0,
    correct: 0,
    incorrect: 0,
    lapses: 0,
    streak: 0,
    strength: 0,
    stability: INITIAL_STABILITY,
    ease: INITIAL_EASE,
    dueAt: now,
    depth: 1,
    kinds: [],
    introduced: false,
  };
}

/**
 * Predicted probability of recalling the concept right now, 0..1.
 * Decays from 1 at the moment of review, passing REVIEW_THRESHOLD exactly when
 * `stability` days have elapsed.
 */
export function retrievability(state: ConceptState, now: number = Date.now()): number {
  const elapsedDays = Math.max(0, (now - state.lastReviewed) / DAY_MS);
  const stability = Math.max(state.stability, MIN_STABILITY);
  return Math.pow(REVIEW_THRESHOLD, elapsedDays / stability);
}

export function isDue(state: ConceptState, now: number = Date.now()): boolean {
  return state.dueAt <= now;
}

/**
 * How badly this concept needs review right now. Higher is more urgent.
 * Combines forgetting risk with how well established the concept is, so a
 * shaky item outranks a solid one that happens to be overdue by the same margin.
 */
export function urgency(state: ConceptState, now: number = Date.now()): number {
  const r = retrievability(state, now);
  const forgettingRisk = 1 - r;
  // Concepts that are barely learned matter more than mature ones.
  const fragility = 1 - state.strength * 0.6;
  const overdueBoost = state.dueAt <= now ? 1 : 0.25;
  return forgettingRisk * fragility * overdueBoost;
}

export interface ReviewInput {
  grade: Grade;
  difficulty: Difficulty;
  kind: ExerciseKind;
  now?: number;
}

/**
 * Applies one answer to a concept's memory record and returns the new state.
 * Pure — the store simply swaps the result in.
 */
export function review(state: ConceptState, input: ReviewInput): ConceptState {
  const now = input.now ?? Date.now();
  const { grade, difficulty, kind } = input;
  const score = GRADE_SCORE[grade];
  const failed = grade === 'incorrect';

  // --- Strength: difficulty-weighted moving average ------------------------
  // A correct answer on a hard exercise is stronger evidence than an easy one,
  // so the value it moves towards is higher.
  const observed = score === 0 ? 0 : score * (0.72 + 0.056 * difficulty);
  const alpha = failed ? 0.45 : state.timesSeen < 3 ? 0.4 : 0.25;
  const strength = clamp01(state.strength + alpha * (observed - state.strength));

  // --- Ease and stability --------------------------------------------------
  let ease = state.ease;
  let stability = state.stability;

  if (failed) {
    ease = Math.max(MIN_EASE, ease - 0.2);
    stability = Math.max(MIN_STABILITY, stability * 0.3);
  } else if (grade === 'almost') {
    ease = Math.max(MIN_EASE, ease - 0.05);
    stability = stability * (1 + (ease - 1) * 0.45);
  } else {
    // Harder exercises earn more ease and a longer interval.
    ease = Math.min(MAX_EASE, ease + (difficulty >= 3 ? 0.09 : 0.05));
    const difficultyBonus = 0.85 + 0.07 * difficulty;
    stability = Math.max(INITIAL_STABILITY, stability * ease * difficultyBonus);
  }
  stability = clamp(stability, MIN_STABILITY, MAX_STABILITY);

  /**
   * Hold a freshly met concept inside the early phase.
   *
   * Deliberately *not* a flat "everything comes back tomorrow": the cap only
   * binds while the concept is young or still shaky, and the ordinary
   * multiplicative schedule takes over the moment it is neither. What it
   * prevents is a single hard exercise answered well on day one buying a
   * week-long absence.
   */
  const stillLearning =
    state.timesSeen + 1 < EARLY_PHASE_REPS || strength < EARLY_PHASE_STRENGTH;
  if (stillLearning && !failed) {
    stability = Math.min(stability, EARLY_PHASE_MAX_STABILITY);
  }

  // A concept that was well known and is now wrong counts as a lapse.
  const lapsed = failed && state.strength >= 0.6;

  const depth: Difficulty =
    !failed && difficulty > state.depth ? (difficulty as Difficulty) : state.depth;

  const kinds = state.kinds.includes(kind) ? state.kinds : [...state.kinds, kind].slice(-12);

  return {
    ...state,
    timesSeen: state.timesSeen + 1,
    correct: state.correct + (failed ? 0 : 1),
    incorrect: state.incorrect + (failed ? 1 : 0),
    lapses: state.lapses + (lapsed ? 1 : 0),
    streak: failed ? 0 : state.streak + 1,
    strength,
    stability,
    ease,
    lastReviewed: now,
    dueAt: now + stability * DAY_MS,
    depth,
    kinds,
    introduced: true,
  };
}

/** Marks a concept as taught without scoring it (the teaching card). */
export function introduce(state: ConceptState, now: number = Date.now()): ConceptState {
  return {
    ...state,
    introduced: true,
    lastReviewed: now,
    timesSeen: state.timesSeen + 1,
    // Comes back inside the same session, then tomorrow.
    stability: Math.max(state.stability, 0.02),
    dueAt: now + 0.02 * DAY_MS,
  };
}

/**
 * Mastery as shown to the learner: what they know, discounted by how much of
 * it has probably decayed since they last saw it.
 */
export function mastery(state: ConceptState, now: number = Date.now()): number {
  if (state.timesSeen === 0) return 0;
  const retention = retrievability(state, now);
  const depthBonus = (state.depth - 1) / 4; // 0 at recognition, 1 at free production
  const core = state.strength * 0.75 + depthBonus * 0.25;
  // Decay can cost at most 35% — knowledge fades, it does not vanish.
  return clamp01(core * (0.65 + 0.35 * retention));
}

/**
 * How well a concept is known, as five named states rather than a percentage.
 *
 * The ladder is the point: nothing jumps from unseen to mastered because it was
 * answered correctly twice.
 *
 *   • **new** — never met.
 *   • **learning** — introduced, still needs the support of a word bank or a
 *     list of options.
 *   • **familiar** — recalled reasonably well, but not yet under pressure.
 *   • **strong** — retrieved successfully in a demanding exercise.
 *   • **mastered** — retrieved repeatedly, in demanding kinds, *and across more
 *     than one day*.
 *
 * That last clause is what stops a single good session certifying a word.
 * `lastReviewed - firstSeen` already records it, so the distinction costs no
 * new persisted field and no `STATE_VERSION` bump — the data was there and
 * nothing was reading it.
 */
export type MasteryBand = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered';

/** Deepest exercise difficulty that counts as retrieval rather than recognition. */
const RETRIEVAL_DEPTH = 3;
/** Successful encounters before a concept can be called mastered. */
const MASTERY_REPS = 6;
/** Mastery must have survived at least this long since the first encounter. */
const MASTERY_SPAN_MS = 0.9 * DAY_MS;

export function masteryBand(state: ConceptState | undefined, now: number = Date.now()): MasteryBand {
  if (!state || state.timesSeen === 0) return 'new';
  const value = mastery(state, now);
  if (state.timesSeen < 3) return 'learning';
  if (value < 0.5) return 'familiar';

  const retrieved = state.depth >= RETRIEVAL_DEPTH;
  if (value < 0.8 || !retrieved) return 'strong';

  const overTime = state.lastReviewed - state.firstSeen >= MASTERY_SPAN_MS;
  return state.timesSeen >= MASTERY_REPS && overTime ? 'mastered' : 'strong';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}
