import { curriculum, getUnit, getUnitConcepts, getUnitTaughtConcepts, isVocabConcept, getConcept, isGrammarConcept } from '@/content';
import type { Unit } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import { selectTargets, type ReviewScope } from '@/learning/scope';
import { buildPracticeSession, buildSmartReview } from '@/learning/session';
import { createConceptState } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * Where a review is allowed to look.
 *
 * The rule, stated once: **a review's targets come from its scope.** Starting a
 * review inside a unit means "help me with this unit"; starting one from the
 * home or practice screens means "help me with everything I have learned".
 * Supporting language from anywhere already met may still appear inside the
 * sentences — that is the spiral the course is built on — but the concept being
 * *practised* must belong to the scope.
 *
 * This was mostly true before, by convention: each screen passed a concept list
 * and `buildPracticeSession` intersected it. These tests exist because "mostly,
 * by convention, at each call site" is the kind of correctness that decays the
 * first time somebody adds a button.
 */

const NOW = Date.UTC(2026, 0, 15);
const DAY = 86_400_000;

/** The first few real units, which every learner walks through in order. */
const units: Unit[] = curriculum.flatMap((stage) => stage.units).filter((unit) => unit.lessons.length > 0);
const [unitOne, unitTwo, unitThree] = units;

/** A learner who has encountered everything these units teach, and nothing later. */
function learnerThrough(through: Unit[], overrides: Partial<LearnerState> = {}): LearnerState {
  const concepts: LearnerState['concepts'] = {};
  for (const unit of through) {
    for (const id of getUnitConcepts(unit)) {
      concepts[id] = {
        ...createConceptState(id, NOW - 7 * DAY),
        introduced: true,
        timesSeen: 3,
        strength: 0.6,
        dueAt: NOW - DAY,
      };
    }
  }
  return makeLearner({ concepts, ...overrides });
}

describe('global scope', () => {
  it('may draw from every unit the learner has encountered', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const targets = new Set(selectTargets({ type: 'global' }, 'smart', learner, NOW));

    for (const unit of [unitOne, unitTwo, unitThree]) {
      const taught = getUnitTaughtConcepts(unit).filter((id) => learner.concepts[id]);
      expect(taught.some((id) => targets.has(id))).toBe(true);
    }
  });

  it('never reaches material the learner has not encountered', () => {
    /**
     * "Everything I have met" means exactly that — not "everything before my
     * position in the curriculum", which would sweep in optional lessons that
     * were skipped and units never opened, and would reintroduce the
     * untaught-material leak by a different door.
     */
    const learner = learnerThrough([unitOne, unitTwo]);
    const targets = selectTargets({ type: 'global' }, 'smart', learner, NOW);

    for (const id of targets) expect(learner.concepts[id]).toBeDefined();

    const laterOnly = getUnitTaughtConcepts(unitThree).filter((id) => !learner.concepts[id]);
    expect(laterOnly.length).toBeGreaterThan(0); // the fixture is meaningful
    for (const id of laterOnly) expect(targets).not.toContain(id);
  });

  it('is what the home page Smart Review builds', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const plan = buildSmartReview({ learner, now: NOW, seed: 4 });
    expect(plan.exercises.length).toBeGreaterThan(0);
    expect(plan.subtitle).toMatch(/closest to forgetting/i);
  });
});

describe('unit scope', () => {
  const scope: ReviewScope = { type: 'unit', unitId: unitTwo?.id ?? '' };

  it('targets only concepts belonging to that unit', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const targets = selectTargets(scope, 'smart', learner, NOW);
    const owned = new Set(getUnitConcepts(unitTwo));

    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) expect(owned.has(id)).toBe(true);
  });

  it('does not leak in another unit’s overdue material', () => {
    /**
     * The failure this guards. Every concept in units one and three is made
     * badly overdue and very weak — exactly what a *global* smart review would
     * reach for first — while unit two is comparatively healthy. A unit review
     * must still be about unit two.
     */
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    for (const unit of [unitOne, unitThree]) {
      for (const id of getUnitConcepts(unit)) {
        learner.concepts[id] = {
          ...learner.concepts[id],
          strength: 0.05,
          dueAt: NOW - 60 * DAY,
        };
      }
    }

    const targets = selectTargets(scope, 'smart', learner, NOW);
    const foreign = new Set([...getUnitConcepts(unitOne), ...getUnitConcepts(unitThree)]);
    const owned = new Set(getUnitConcepts(unitTwo));

    for (const id of targets) {
      // A concept shared between units legitimately belongs to both.
      if (!owned.has(id)) expect(foreign.has(id)).toBe(false);
    }
  });

  it('reaches the session builder, so a unit review really is one', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const plan = buildPracticeSession('concept', { learner, now: NOW, seed: 8, scope });
    const owned = new Set(getUnitConcepts(unitTwo));

    expect(plan.exercises.length).toBeGreaterThan(0);
    for (const exercise of plan.exercises) {
      /**
       * The *target* must belong to the unit. `conceptIds` may legitimately
       * carry supporting words from earlier units — a café sentence reusing
       * "hola" is good spiral learning, and forbidding it would make unit
       * reviews stilted.
       */
      const target = exercise.targetId ?? exercise.conceptIds[0];
      expect(owned.has(target)).toBe(true);
    }
  });

  it('only offers concepts the learner has actually encountered', () => {
    // A unit opened but barely started: its untouched concepts are not review
    // material, they are lesson material.
    const learner = learnerThrough([unitOne]);
    const targets = selectTargets({ type: 'unit', unitId: unitOne.id }, 'full', learner, NOW);
    for (const id of targets) expect(learner.concepts[id]).toBeDefined();
  });
});

describe('smart versus full, inside the same unit', () => {
  const scope: ReviewScope = { type: 'unit', unitId: unitTwo?.id ?? '' };

  it('full review covers the whole unit, including what is already solid', () => {
    const learner = learnerThrough([unitOne, unitTwo]);
    // Make everything in unit two thoroughly known, so nothing is "due".
    for (const id of getUnitConcepts(unitTwo)) {
      learner.concepts[id] = {
        ...learner.concepts[id],
        strength: 0.95,
        depth: 4,
        timesSeen: 9,
        dueAt: NOW + 30 * DAY,
      };
    }

    const full = selectTargets(scope, 'full', learner, NOW);
    const encountered = getUnitConcepts(unitTwo).filter((id) => learner.concepts[id]);
    expect(full).toHaveLength(encountered.length);
  });

  it('a unit’s smart review is adaptive, and its full review is not', () => {
    const learner = learnerThrough([unitOne, unitTwo]);
    const owned = getUnitTaughtConcepts(unitTwo).filter((id) => learner.concepts[id]);
    expect(owned.length).toBeGreaterThan(2);

    // One concept made conspicuously the weakest thing in the unit.
    const worst = owned[owned.length - 1];
    learner.concepts[worst] = {
      ...learner.concepts[worst],
      strength: 0.02,
      dueAt: NOW - 90 * DAY,
    };

    const smart = selectTargets(scope, 'smart', learner, NOW);
    expect(smart.slice(0, 3)).toContain(worst);
  });
});

describe('unit vocabulary and grammar are the unit’s own', () => {
  it('lists only vocabulary the unit owns, not the whole course', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const scope: ReviewScope = { type: 'unit', unitId: unitTwo.id };
    const vocabTargets = selectTargets(scope, 'vocabulary', learner, NOW);
    const owned = new Set(getUnitConcepts(unitTwo));

    expect(vocabTargets.length).toBeGreaterThan(0);
    for (const id of vocabTargets) {
      expect(owned.has(id)).toBe(true);
      const concept = getConcept(id);
      expect(concept && isVocabConcept(concept)).toBe(true);
    }

    // And the global list is genuinely larger, or this proves nothing.
    const globalVocab = selectTargets({ type: 'global' }, 'vocabulary', learner, NOW);
    expect(globalVocab.length).toBeGreaterThan(vocabTargets.length);
  });

  it('lists only grammar the unit owns', () => {
    const learner = learnerThrough(units.slice(0, 8));
    const withGrammar = units
      .slice(0, 8)
      .find((unit) =>
        getUnitConcepts(unit).some((id) => {
          const concept = getConcept(id);
          return !!concept && (isGrammarConcept(concept) || concept.kind === 'verbform');
        }),
      );
    expect(withGrammar).toBeDefined();

    const targets = selectTargets({ type: 'unit', unitId: withGrammar!.id }, 'grammar', learner, NOW);
    const owned = new Set(getUnitConcepts(withGrammar!));
    for (const id of targets) {
      expect(owned.has(id)).toBe(true);
      const concept = getConcept(id);
      expect(concept && (isGrammarConcept(concept) || concept.kind === 'verbform')).toBe(true);
    }
  });
});

describe('practice-page modes stay global', () => {
  it('draws vocabulary and grammar from every encountered unit', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const vocab = new Set(selectTargets({ type: 'global' }, 'vocabulary', learner, NOW));

    const contributing = [unitOne, unitTwo, unitThree].filter((unit) =>
      getUnitConcepts(unit).some((id) => vocab.has(id)),
    );
    expect(contributing).toHaveLength(3);
  });

  it('builds a global session when no scope is passed', () => {
    const learner = learnerThrough([unitOne, unitTwo, unitThree]);
    const plan = buildPracticeSession('vocabulary', { learner, now: NOW, seed: 2 });
    expect(plan.exercises.length).toBeGreaterThan(0);
    const touched = new Set(plan.exercises.flatMap((exercise) => exercise.conceptIds));
    // More than one unit represented — a global session that only ever reached
    // one unit would pass every assertion above and still be wrong.
    const spread = [unitOne, unitTwo, unitThree].filter((unit) =>
      getUnitConcepts(unit).some((id) => touched.has(id)),
    );
    expect(spread.length).toBeGreaterThan(1);
  });
});

describe('mistakes are not a pool', () => {
  it('is never ranked by `selectTargets` — it has its own builder', () => {
    const learner = learnerThrough([unitOne]);
    expect(selectTargets({ type: 'mistakes' }, 'smart', learner, NOW)).toEqual([]);
  });
});

describe('the fixture units are real and distinct', () => {
  it('names three units with material of their own', () => {
    for (const unit of [unitOne, unitTwo, unitThree]) {
      expect(getUnit(unit.id)).toBeDefined();
      expect(getUnitTaughtConcepts(unit).length).toBeGreaterThan(0);
    }
    expect(new Set([unitOne.id, unitTwo.id, unitThree.id]).size).toBe(3);
  });
});
