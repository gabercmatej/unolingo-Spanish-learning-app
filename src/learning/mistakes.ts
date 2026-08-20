import { KIND_DEMAND } from '@/learning/eligibility';
import type { ExerciseKind, LearnerState, MistakeRecord } from '@/learning/types';

/**
 * What "review my mistakes" means.
 *
 * The feature existed and did not do this. `buildPracticeSession` took the
 * unresolved mistakes, flattened them to `conceptIds`, threw everything else
 * away, and handed the list to the ordinary generator — which then chose
 * whatever exercise the learner's history made freshest for each concept. Three
 * consequences, none of them visible from the call site:
 *
 *   1. **The mistake was not retried.** A failed "Translate: I am tired" came
 *      back as a multiple choice about `v.cansado`, which the learner would get
 *      right without ever confronting *soy* versus *estoy*.
 *   2. **One mistake became several exercises.** `conceptIds` is the whole
 *      exercise's scoring list, so a sentence tagged with four concepts spawned
 *      four items — three of them about words that were never the problem.
 *   3. **Unrelated material joined in.** Those concepts pulled their own
 *      sentence pools, so the session filled up with lines the learner had
 *      never got wrong.
 *
 * So this module owns the queue and the retry policy, and `session.ts` builds
 * the session strictly from what it returns. Selection policy is not shared
 * with Smart Review — the two answer different questions and merging their
 * generators is what produced the bug.
 */

/** A mistake, plus how it should be re-asked. */
export interface MistakeRetry {
  mistake: MistakeRecord;
  /** The concept the retry must target. */
  conceptId: string;
  /** The sentence to rebuild from, when the record knows it. */
  sentenceId?: string;
  /**
   * Kinds to try, in order. The first is the *scaffolded* form when the
   * original was too hard to be worth repeating verbatim; the original kind is
   * always in the list, because closure means meeting the thing you failed.
   */
  kinds: ExerciseKind[];
}

/**
 * Stepping a failed exercise down one rung.
 *
 * Repeating an exercise somebody has just failed, unchanged, is not tutoring —
 * it is asking the same impossible question louder. But dropping the target is
 * not tutoring either, so the step is always sideways in *support*, never in
 * subject: same concept, same sentence, less to supply from nothing.
 *
 *   translateToEs  → wordBank      the words are on the table, the order is the work
 *   buildResponse  → wordBank
 *   dictation      → listenSelect  hear it and pick it before transcribing it
 *   speak          → listenSelect
 *   conversation   → wordBank
 *   correctMistake → grammarChoice the contrast, as a choice between two forms
 *   fillBlank      → grammarChoice
 *   translateToEn  → listenComprehend
 *
 * Recognition kinds have nowhere to step down to and are simply repeated.
 */
const SCAFFOLD_DOWN: Partial<Record<ExerciseKind, ExerciseKind>> = {
  translateToEs: 'wordBank',
  buildResponse: 'wordBank',
  conversation: 'wordBank',
  dictation: 'listenSelect',
  speak: 'listenSelect',
  correctMistake: 'grammarChoice',
  fillBlank: 'grammarChoice',
  translateToEn: 'listenComprehend',
  wordBank: 'fillBlank',
};

/**
 * How many retries a mistake is scaffolded for before it is asked straight.
 *
 * One. The support exists to get the learner over the thing they could not do,
 * not to become the way they always meet it — and a mistake that is only ever
 * re-asked with a word bank is a mistake that never gets properly closed.
 */
const SCAFFOLD_FOR_ATTEMPTS = 1;

/**
 * The gentler form of an exercise kind, or null where there is no rung below.
 *
 * Exported so the in-session retry and the mistake queue step down the same
 * ladder. Two copies of this table would drift, and the drift would be
 * invisible — both halves would still "work", just differently.
 */
export function scaffoldKindFor(kind: ExerciseKind): ExerciseKind | null {
  return SCAFFOLD_DOWN[kind] ?? null;
}

export function isUnresolved(mistake: MistakeRecord): boolean {
  return !mistake.resolvedAt;
}

export function unresolvedMistakes(learner: LearnerState): MistakeRecord[] {
  return learner.mistakes.filter(isUnresolved);
}

/**
 * The concept a mistake is actually about.
 *
 * Older records have no `targetId`, so they fall back to the first concept in
 * the list — which is what the generator puts the target at. Not perfect for a
 * record written before this existed, and much better than treating all four as
 * equally the problem.
 */
export function targetOf(mistake: MistakeRecord): string | undefined {
  return mistake.targetId ?? mistake.conceptIds[0];
}

/**
 * The retry queue: oldest unresolved first, one entry per mistake.
 *
 * Oldest first because a mistake that has been sitting unresolved is the one
 * most likely to have hardened into a habit, and because it makes the queue
 * *finite and predictable* — the learner can see it shorten. Deliberately not
 * ranked by SRS urgency: that is Smart Review's question, and answering it here
 * is how the two features blurred together in the first place.
 *
 * `limit` caps a single sitting. Anything beyond it stays in the queue rather
 * than being dropped, so a bad week does not produce a fifty-item session.
 */
export function mistakeQueue(learner: LearnerState, limit = 12): MistakeRetry[] {
  const seen = new Set<string>();
  const out: MistakeRetry[] = [];

  for (const mistake of [...unresolvedMistakes(learner)].sort((a, b) => a.at - b.at)) {
    if (out.length >= limit) break;
    const conceptId = targetOf(mistake);
    if (!conceptId) continue;

    /**
     * One entry per concept per session. Three failures on the same word in one
     * lesson are one thing to fix, and asking about it three times running is
     * the "punishment" shape this pass exists to remove — the other records
     * stay unresolved and come back another day if the retry does not stick.
     */
    if (seen.has(conceptId)) continue;
    seen.add(conceptId);

    out.push({
      mistake,
      conceptId,
      sentenceId: mistake.sentenceId,
      kinds: retryKinds(mistake),
    });
  }

  return out;
}

/**
 * The kinds to try for one mistake, most preferred first.
 *
 * The original kind is always present. What changes is whether a gentler form
 * is offered *ahead* of it, and that depends on how hard the original was and
 * how many times this has already been attempted.
 */
export function retryKinds(mistake: MistakeRecord): ExerciseKind[] {
  const original = mistake.kind;
  const attempts = mistake.attempts ?? 0;
  const scaffold = SCAFFOLD_DOWN[original];

  /**
   * Only demanding kinds are worth scaffolding. Getting a multiple choice wrong
   * is not evidence that multiple choice was too hard, so stepping it down
   * would remove support that was never the problem.
   */
  const demanding = KIND_DEMAND[original] === 'output';

  if (scaffold && demanding && attempts < SCAFFOLD_FOR_ATTEMPTS) {
    return [scaffold, original];
  }
  return scaffold ? [original, scaffold] : [original];
}

/**
 * Whether an answer closes a mistake.
 *
 * Deliberately narrow, and narrower than what the store used to do. The old
 * rule resolved *any* open mistake sharing *any* concept with *any* correct
 * answer — so a mistake made on a four-concept sentence was cleared by getting
 * a multiple choice right about one of the other three, and the queue emptied
 * itself without a single mistake being confronted. Now:
 *
 *   • the answer must be **correct**, not `almost` — an `almost` on the exact
 *     thing you just got wrong is not closure, and `almost` is worth 0.75 and
 *     *lengthens* the interval, so treating it as a fix would hide the mistake
 *     for longer than getting it right would have;
 *   • it must be an answer to the mistake's **target** concept, not to
 *     something that merely shared a sentence with it.
 */
export function resolves(
  mistake: MistakeRecord,
  answered: { conceptIds: string[]; targetId?: string; grade: string },
): boolean {
  if (mistake.resolvedAt) return false;
  if (answered.grade !== 'correct') return false;
  const target = targetOf(mistake);
  if (!target) return false;
  // Answering the exact target closes it; so does a retry explicitly aimed at
  // it, which is the same thing said from the exercise's side.
  return answered.targetId === target || answered.conceptIds[0] === target;
}

/**
 * Whether an answer was an *attempt* at this mistake, resolved or not.
 *
 * Counting attempts is what lets the scaffolding step back down after one go —
 * a mistake retried once with a word bank and still not fixed is asked straight
 * the next time rather than being propped up for ever. A failed retry is
 * evidence too, just not the kind that closes anything.
 */
export function isRetryOf(
  mistake: MistakeRecord,
  answered: { conceptIds: string[]; targetId?: string },
): boolean {
  if (mistake.resolvedAt) return false;
  const target = targetOf(mistake);
  return !!target && (answered.targetId === target || answered.conceptIds[0] === target);
}

/** What the store knows about an answer, as far as the mistake queue cares. */
export interface AnsweredExercise {
  conceptIds: string[];
  targetId?: string;
  grade: string;
}

/**
 * The mistake list after one answer.
 *
 * Pure, and deliberately not left inside the store. The old version of this
 * rule lived in a `setLearner` callback in `LearnerContext`, which meant the
 * one policy most likely to be wrong — when does a mistake stop counting? — was
 * the one policy no test could reach without a renderer. That is the same split
 * that moved the snapshot rules out of `lib/snapshots.ts`.
 */
export function applyAnswerToMistakes(
  mistakes: readonly MistakeRecord[],
  answered: AnsweredExercise,
  now: number,
): MistakeRecord[] {
  return mistakes.map((mistake) => {
    if (resolves(mistake, answered)) return { ...mistake, resolvedAt: now, lastAttemptAt: now };
    if (isRetryOf(mistake, answered)) {
      return { ...mistake, attempts: (mistake.attempts ?? 0) + 1, lastAttemptAt: now };
    }
    return mistake;
  });
}

export interface MistakeOutcome {
  reviewed: number;
  corrected: number;
  stillOpen: number;
}

/**
 * What a mistake session achieved, for the results screen.
 *
 * Compares two learner records rather than counting answers, because "this
 * mistake is now resolved" is a property of the record and "I answered
 * something correctly" is not.
 */
export function mistakeOutcome(before: LearnerState, after: LearnerState): MistakeOutcome {
  const openBefore = new Set(unresolvedMistakes(before).map((m) => m.id));
  const openAfter = new Set(unresolvedMistakes(after).map((m) => m.id));
  const corrected = [...openBefore].filter((id) => !openAfter.has(id)).length;
  return {
    reviewed: openBefore.size,
    corrected,
    stillOpen: [...openBefore].filter((id) => openAfter.has(id)).length,
  };
}
