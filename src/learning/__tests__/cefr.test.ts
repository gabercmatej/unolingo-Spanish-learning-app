import { allConcepts, getStageConcepts, curriculum } from '@/content';
import type { CefrLevel } from '@/content/types';
import { curriculumLevel, estimateProficiency, skillBalance } from '@/learning/mastery';
import { buildSession } from '@/learning/session';
import type { ConceptState, ExerciseKind, LearnerState } from '@/learning/types';
import { makeLearner } from './helpers';

/**
 * The CEFR claim, tested as a claim.
 *
 * "This learner is B1" is the only assertion Unolingo makes about a person, so
 * it has to be the assertion that is hardest to earn by accident. Before the
 * skill gate it was the easiest: `estimateLevel` counted strong concepts, and a
 * concept gets strong from any exercise kind at all — so a learner who only ever
 * pressed multiple-choice buttons was handed the same B1 as one who could take
 * dictation and produce a sentence.
 */

const LISTENING: ExerciseKind[] = ['listenSelect', 'dictation', 'listenComprehend'];
const PRODUCTION: ExerciseKind[] = ['translateToEs', 'conversation', 'buildResponse', 'speak'];
const RECOGNITION: ExerciseKind[] = ['multipleChoice', 'match', 'translateToEn'];

function strongState(id: string, kinds: ExerciseKind[], now: number): ConceptState {
  return {
    id,
    firstSeen: now - 60 * 86400_000,
    lastReviewed: now,
    timesSeen: 12,
    correct: 12,
    incorrect: 0,
    lapses: 0,
    streak: 12,
    strength: 0.95,
    stability: 90,
    ease: 2.6,
    dueAt: now + 30 * 86400_000,
    depth: 4,
    kinds,
    introduced: true,
  };
}

/** A learner who knows every concept up to `level`, practised only in `kinds`. */
function learnerThrough(level: CefrLevel, kinds: ExerciseKind[], now: number): LearnerState {
  const order: CefrLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const ceiling = order.indexOf(level);
  const concepts: Record<string, ConceptState> = {};
  for (const concept of allConcepts) {
    if (order.indexOf(concept.level) > ceiling) continue;
    concepts[concept.id] = strongState(concept.id, kinds, now);
  }
  return makeLearner({ concepts });
}

describe('proficiency is gated by demonstrated skill', () => {
  const now = Date.now();

  it('does not award a level to a learner who has only ever done recognition', () => {
    const recogniser = learnerThrough('B1', RECOGNITION, now);
    const rounded = learnerThrough('B1', [...RECOGNITION, ...LISTENING, ...PRODUCTION], now);

    const held = estimateProficiency(recogniser, now);
    const earned = estimateProficiency(rounded, now);

    // Identical concept knowledge, different evidence, different answer.
    expect(earned.level).toBe('B1');
    expect(held.level).not.toBe('B1');
    expect(held.heldBackBy.sort()).toEqual(['listening', 'production']);
  });

  it('reports the "+" when concepts are there and only one skill is missing', () => {
    const noListening = learnerThrough('B1', [...RECOGNITION, ...PRODUCTION], now);
    const estimate = estimateProficiency(noListening, now);

    expect(estimate.plus).toBe(true);
    expect(estimate.heldBackBy).toEqual(['listening']);
  });

  it('carries no "+" once every skill supports the level', () => {
    const rounded = learnerThrough('B1', [...RECOGNITION, ...LISTENING, ...PRODUCTION], now);
    const estimate = estimateProficiency(rounded, now);

    expect(estimate.plus).toBe(false);
    expect(estimate.heldBackBy).toEqual([]);
  });

  it('does not gate a learner who has barely started, on a sample of nothing', () => {
    // Three concepts is not a failed listening test; it is no listening test.
    const beginner = makeLearner({
      concepts: Object.fromEntries(
        allConcepts.slice(0, 3).map((c) => [c.id, strongState(c.id, RECOGNITION, now)]),
      ),
    });
    const estimate = estimateProficiency(beginner, now);
    expect(estimate.heldBackBy).toEqual([]);
    // …and says so, rather than reading as a clean bill of health. These two
    // states produce the same empty heldBackBy and mean opposite things.
    expect(estimate.measured).toBe(false);
  });

  it('marks a well-evidenced learner as measured', () => {
    const rounded = learnerThrough('B1', [...RECOGNITION, ...LISTENING, ...PRODUCTION], now);
    expect(estimateProficiency(rounded, now).measured).toBe(true);
  });

  it('separates how far you have walked from what you can do', () => {
    // Curriculum position is lessons finished; proficiency is evidence given.
    // They are allowed to disagree, and for the recognition-only learner they must.
    const recogniser = learnerThrough('B1', RECOGNITION, now);
    expect(curriculumLevel(recogniser, now)).toBe(null);
    expect(estimateProficiency(recogniser, now).level).toBeDefined();
  });
});

describe('a checkpoint tests the skill the learner is worst at', () => {
  const now = Date.now();

  /**
   * The learner this exists for: experienced in every skill, and weak at two of
   * them. That combination defeats both of the generator's usual safeguards —
   * freshness has nothing to offer, because every kind has been seen; and
   * `skillBalance` marks listening and production as lagging, which makes
   * `rankForLearner` step the *demanding* kinds back inside them.
   *
   * Stepping back is right in a lesson: meeting a struggling learner at a
   * difficulty they can manage is the only way the skill improves. In a
   * checkpoint it is exactly backwards, and measurably so — before the floor,
   * this learner got 0–2 production exercises out of 18 in every stage, at every
   * seed. The certification was routing around the weakness it exists to find.
   *
   * Production collapses further than listening for a structural reason worth
   * recording: every production kind is difficulty 4 or 5, so "demote the
   * demanding ones" demotes the entire skill. Listening keeps `listenSelect`,
   * which is gentle, and so survives.
   */
  function weakButExperienced(stageId: string): LearnerState {
    const concepts: Record<string, ConceptState> = {};
    getStageConcepts(stageId).forEach((id, index) => {
      const state =
        index % 3 === 0
          ? strongState(id, [...RECOGNITION, ...LISTENING, ...PRODUCTION], now)
          : strongState(id, RECOGNITION, now);
      if (index % 3 === 0) {
        // Seen often, answered badly: experience without competence.
        state.strength = 0.35;
        state.stability = 3;
        state.streak = 0;
        state.correct = 7;
        state.incorrect = 13;
        state.dueAt = now + 3 * 86400_000;
      }
      concepts[id] = state;
    });
    return makeLearner({ concepts });
  }

  const checkpoints = curriculum.flatMap((stage) =>
    stage.units.flatMap((unit) =>
      unit.lessons
        .filter((lesson) => lesson.kind === 'checkpoint')
        .map((lesson) => [lesson.id, stage.id] as const),
    ),
  );

  it('finds a checkpoint in every stage', () => {
    expect(checkpoints.length).toBe(curriculum.length);
  });

  it.each(checkpoints)('%s still tests listening and production', (lessonId, stageId) => {
    const learner = weakButExperienced(stageId);

    // The premise of the test: this learner really is diagnosed as lagging.
    expect(skillBalance(learner, now).lagging.sort()).toEqual(['listening', 'production']);

    for (const seed of [1, 7, 42]) {
      const plan = buildSession('checkpoint', lessonId, { learner, now, seed });
      expect(plan).not.toBeNull();

      const kinds = plan!.exercises.map((exercise) => exercise.kind);
      expect(kinds.filter((k) => LISTENING.includes(k)).length).toBeGreaterThanOrEqual(3);
      expect(kinds.filter((k) => PRODUCTION.includes(k)).length).toBeGreaterThanOrEqual(3);
    }
  });
});
