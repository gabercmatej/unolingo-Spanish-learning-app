import {
  getConcept,
  getUnit,
  getUnitConcepts,
  getUnitTaughtConcepts,
  isGrammarConcept,
  isVocabConcept,
} from '@/content';
import {
  atRiskConcepts,
  dueConcepts,
  encounteredIds,
  hasEncountered,
  weakAreas,
} from '@/learning/mastery';
import { mastery } from '@/learning/srs';
import { unresolvedMistakes } from '@/learning/mistakes';
import type { LearnerState } from '@/learning/types';

/**
 * Where a review is allowed to draw from, and what it is trying to achieve.
 *
 * These are two independent questions and the app had been answering them with
 * one: every practice button passed a `SessionKind` and, if it remembered, a
 * list of concept ids, and the meaning of the session came out of whichever
 * combination happened to arrive. It mostly worked — and "mostly, by
 * convention, at each call site" is exactly the kind of correctness that decays
 * the first time somebody adds a button.
 *
 * So scope and intent are separate types, and the pair is what a session is
 * built from:
 *
 *   scope `global` + intent `smart`  — everything I have met, ranked by SRS
 *   scope `unit`   + intent `smart`  — this unit's weak points only
 *   scope `unit`   + intent `full`   — a broad pass over this whole unit
 *
 * The rule that makes the distinction real: **a review's targets come from its
 * scope.** Supporting language from anywhere the learner has already met is
 * free to appear inside the sentences — that is the spiral the course is built
 * on — but the concept being *practised* must belong to the scope. A café
 * sentence must not become a vehicle for drilling an unrelated B1 grammar point
 * merely because the sentence contains café vocabulary.
 */

export type ReviewScope =
  | { type: 'global' }
  | { type: 'unit'; unitId: string }
  /** An explicit list — a weak area, one grammar point, one word. */
  | { type: 'concepts'; conceptIds: string[] }
  /**
   * Mistakes are a scope in the vocabulary of the app, and deliberately never
   * reach `selectTargets`: they are not a pool to be ranked but a queue to be
   * replayed, and `learning/mistakes.ts` owns them. Merging the two selection
   * policies is precisely the bug that made "Review mistakes" serve random
   * practice, so the separation is structural rather than a convention.
   */
  | { type: 'mistakes' };

export type SelectionIntent =
  /** Adaptive: what most needs attention right now. */
  | 'smart'
  /** Comprehensive: a broad pass, including material that is already solid. */
  | 'full'
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  /** The learner's weakest areas, wherever they are. */
  | 'weak'
  /** A short session, whatever it contains. */
  | 'quick'
  /** Deliberately unranked variety. */
  | 'random'
  /** Full production, no scaffolding. */
  | 'hard';

export function describeScope(scope: ReviewScope): string {
  switch (scope.type) {
    case 'unit':
      return getUnit(scope.unitId)?.title ?? 'this unit';
    case 'concepts':
      return 'selected concepts';
    case 'mistakes':
      return 'your mistakes';
    default:
      return 'everything you have learned';
  }
}

/**
 * Every concept the scope permits as a *target*, before intent narrows it.
 *
 * The two unit cases are different on purpose. `getUnitConcepts` sweeps in
 * every concept the unit's sentences happen to mention, which is the right set
 * for measuring what a unit exercises and the wrong one for deciding what it
 * *owns*: it would let "Unit 4 vocabulary" list words from the sentences' spiral
 * material that unit four never taught. Targets come from what the unit
 * teaches; the wider set is only used to keep a full review from being thin.
 */
function scopedConcepts(scope: ReviewScope, learner: LearnerState, broad: boolean): string[] {
  switch (scope.type) {
    case 'unit': {
      const unit = getUnit(scope.unitId);
      if (!unit) return [];
      const taught = getUnitTaughtConcepts(unit);
      /**
       * A full review may reach past the taught list into the unit's sentence
       * material, but only as far as concepts the learner has already met —
       * never into anything the course has not shown them.
       */
      const ids = broad ? [...new Set([...taught, ...getUnitConcepts(unit)])] : taught;
      return ids.filter((id) => hasEncountered(learner.concepts[id]));
    }
    case 'concepts':
      return scope.conceptIds.filter((id) => hasEncountered(learner.concepts[id]));
    case 'mistakes':
      return [];
    default:
      /**
       * "Everything I have encountered" means exactly that — introduced or
       * practised. Not "everything before my current position in the
       * curriculum", which would include optional lessons the learner skipped
       * and units they have not opened, and would reintroduce the untaught-
       * material leak by a different door.
       */
      return encounteredIds(learner);
  }
}

/**
 * The ordered target concepts for a scope and an intent.
 *
 * Ordering is the policy. Every intent returns concepts from the same scoped
 * pool; what differs is which of them come first and which are filtered out —
 * and that is deliberately explicit here rather than emergent from a shared
 * "generate whatever seems useful" path.
 */
export function selectTargets(
  scope: ReviewScope,
  intent: SelectionIntent,
  learner: LearnerState,
  now = Date.now(),
): string[] {
  const broad = intent === 'full' || intent === 'random';
  const pool = scopedConcepts(scope, learner, broad);
  if (pool.length === 0) return [];
  const inScope = new Set(pool);

  const weakestFirst = (a: string, b: string) => {
    const stateA = learner.concepts[a];
    const stateB = learner.concepts[b];
    return (stateA ? mastery(stateA, now) : 0) - (stateB ? mastery(stateB, now) : 0);
  };

  switch (intent) {
    case 'smart': {
      /**
       * The adaptive order, and the only intent that consults the scheduler.
       * Every input is filtered back through the scope, which is what makes a
       * unit's Smart Review a unit review rather than a global one that happens
       * to have been started from a unit screen.
       */
      const mistaken = unresolvedMistakes(learner)
        .flatMap((mistake) => mistake.conceptIds)
        .filter((id) => inScope.has(id));
      const due = dueConcepts(learner, now)
        .map((state) => state.id)
        .filter((id) => inScope.has(id));
      const risky = atRiskConcepts(learner, now, 40)
        .map((state) => state.id)
        .filter((id) => inScope.has(id));
      const weak = weakAreas(learner, now, 6)
        .flatMap((area) => area.conceptIds)
        .filter((id) => inScope.has(id));
      /** Introduced and never once retrieved — the most neglected state there is. */
      const untested = pool.filter((id) => (learner.concepts[id]?.timesSeen ?? 0) === 0);

      return dedupe([...mistaken, ...untested, ...due, ...risky, ...weak, ...pool.sort(weakestFirst)]);
    }

    case 'full':
      /**
       * Breadth, not urgency. A full review is the learner asking to go over
       * the whole thing, so every concept in scope appears and the weakest
       * simply come first — sorting is a courtesy here, not a filter.
       */
      return [...pool].sort(weakestFirst);

    case 'vocabulary':
      return pool
        .filter((id) => {
          const concept = getConcept(id);
          return !!concept && isVocabConcept(concept);
        })
        .sort(weakestFirst);

    case 'grammar':
      return pool
        .filter((id) => {
          const concept = getConcept(id);
          return !!concept && (isGrammarConcept(concept) || concept.kind === 'verbform');
        })
        .sort(weakestFirst);

    case 'listening':
      // Every concept can carry audio; the rotation in `session.ts` is what
      // makes this a listening session, not the selection.
      return [...pool].sort(weakestFirst);

    case 'weak':
      return dedupe([
        ...weakAreas(learner, now, 8)
          .flatMap((area) => area.conceptIds)
          .filter((id) => inScope.has(id)),
        ...[...pool].sort(weakestFirst),
      ]);

    case 'quick':
      return dedupe([
        ...dueConcepts(learner, now)
          .map((state) => state.id)
          .filter((id) => inScope.has(id)),
        ...pool,
      ]);

    case 'hard':
      return [...pool].sort(weakestFirst);

    case 'random':
    default:
      return pool;
  }
}

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)];
}
