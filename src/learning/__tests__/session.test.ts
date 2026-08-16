import { allLessons, getConcept, levelIndex, vocabConcepts } from '@/content';
import { checkExercise } from '@/learning/check';
import { DEFAULT_SETTINGS_FOR_TEST, makeLearner } from '@/learning/__tests__/helpers';
import type { Exercise } from '@/learning/exercise';
import { candidateKinds, generateForConcept, mulberry32 } from '@/learning/generator';
import {
  adjustAbility,
  adjustLevel,
  applyPlacement,
  nextPlacementQuestion,
  PLACEMENT_LENGTH,
  scorePlacement,
  stepSize,
  type PlacementAnswer,
} from '@/learning/placement';
import { skillBalance } from '@/learning/mastery';
import { buildLessonSession, buildSmartReview, nextLesson } from '@/learning/session';
import { createConceptState, review } from '@/learning/srs';
import { KIND_SKILL, PRESENTATION_KINDS } from '@/learning/types';
import { cumulativeXp, levelInfo, xpForAnswer } from '@/learning/xp';

/** Every exercise the app can produce must be answerable and well-formed. */
function assertWellFormed(exercise: Exercise) {
  expect(exercise.id).toBeTruthy();
  expect(exercise.instruction).toBeTruthy();
  expect(exercise.difficulty).toBeGreaterThanOrEqual(1);

  switch (exercise.form) {
    case 'choice':
      expect(exercise.options.length).toBeGreaterThan(1);
      expect(exercise.answerIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.answerIndex).toBeLessThan(exercise.options.length);
      // Options must be distinct, or the question has more than one right answer.
      expect(new Set(exercise.options.map((o) => o.text)).size).toBe(exercise.options.length);
      break;
    case 'wordBank':
      expect(exercise.tokens.length).toBeGreaterThan(1);
      expect(exercise.accepted.length).toBeGreaterThan(0);
      // Every word of the answer must be available in the bank.
      for (const word of exercise.answer.split(/\s+/)) {
        expect(exercise.tokens).toContain(word);
      }
      break;
    case 'typed':
      expect(exercise.accepted.length).toBeGreaterThan(0);
      expect(exercise.accepted[0].length).toBeGreaterThan(0);
      break;
    case 'match':
      expect(exercise.pairs.length).toBeGreaterThan(2);
      break;
    case 'conversation':
      expect(exercise.accepted.length).toBeGreaterThan(0);
      break;
    case 'speak':
      expect(exercise.text.length).toBeGreaterThan(0);
      break;
    case 'presentation':
      break;
  }
}

describe('exercise generation', () => {
  const ctx = {
    settings: DEFAULT_SETTINGS_FOR_TEST,
    now: Date.now(),
    rng: mulberry32(42),
    recentKinds: [],
  };

  it('produces a teaching card the first time a word is met', () => {
    const exercise = generateForConcept('v.hola', undefined, ctx);
    expect(exercise?.kind).toBe('teach');
  });

  it('produces a grammar card the first time a rule is met', () => {
    const exercise = generateForConcept('g.ser-estar', undefined, ctx);
    expect(exercise?.kind).toBe('grammarCard');
  });

  it('produces a well-formed exercise for every vocabulary concept', () => {
    for (const concept of vocabConcepts) {
      const state = { ...createConceptState(concept.id), introduced: true, timesSeen: 1 };
      const exercise = generateForConcept(concept.id, state, {
        ...ctx,
        rng: mulberry32(concept.id.length + 7),
      });
      expect(exercise).not.toBeNull();
      assertWellFormed(exercise!);
    }
  });

  it('moves from recognition to production as a concept strengthens', () => {
    let state = { ...createConceptState('v.tener'), introduced: true };
    const early = generateForConcept('v.tener', state, { ...ctx, rng: mulberry32(1) })!;
    expect(early.difficulty).toBeLessThanOrEqual(3);

    for (let i = 0; i < 8; i += 1) {
      state = review(state, { grade: 'correct', difficulty: 4, kind: 'translateToEs' });
    }
    const late = generateForConcept('v.tener', state, { ...ctx, rng: mulberry32(1) })!;
    expect(late.difficulty).toBeGreaterThanOrEqual(early.difficulty);
  });

  it('never offers a word bank or multiple choice in hard mode', () => {
    const hardCtx = {
      ...ctx,
      settings: { ...DEFAULT_SETTINGS_FOR_TEST, hardMode: true },
    };
    let offeredEasy = 0;
    for (const concept of vocabConcepts.slice(0, 60)) {
      let state = { ...createConceptState(concept.id), introduced: true };
      state = review(state, { grade: 'correct', difficulty: 3, kind: 'fillBlank' });
      const exercise = generateForConcept(concept.id, state, {
        ...hardCtx,
        rng: mulberry32(concept.id.length),
      });
      if (exercise && ['wordBank', 'match', 'listenSelect'].includes(exercise.kind)) {
        offeredEasy += 1;
      }
    }
    expect(offeredEasy).toBe(0);
  });

  it('generates exercises whose own correct answer passes the checker', () => {
    for (const concept of vocabConcepts.slice(0, 80)) {
      const state = { ...createConceptState(concept.id), introduced: true, timesSeen: 2 };
      const exercise = generateForConcept(concept.id, state, {
        ...ctx,
        rng: mulberry32(concept.id.length * 3),
      })!;
      if (PRESENTATION_KINDS.includes(exercise.kind)) continue;

      let answer: string;
      switch (exercise.form) {
        case 'choice':
          answer = String(exercise.answerIndex);
          break;
        case 'wordBank':
          answer = exercise.answer;
          break;
        case 'typed':
          answer = exercise.accepted[0];
          break;
        case 'conversation':
          answer = exercise.accepted[0];
          break;
        case 'match':
          answer = 'perfect';
          break;
        default:
          continue;
      }

      const result = checkExercise(exercise, answer, DEFAULT_SETTINGS_FOR_TEST);
      expect(result.grade).toBe('correct');
    }
  });
});

describe('lesson sessions', () => {
  it('builds a playable session for every lesson in the course', () => {
    const learner = makeLearner();
    for (const lesson of allLessons) {
      const plan = buildLessonSession(lesson.id, { learner, seed: 7 });
      expect(plan).not.toBeNull();
      expect(plan!.exercises.length).toBeGreaterThan(0);
      for (const exercise of plan!.exercises) assertWellFormed(exercise);
    }
  });

  it('teaches a concept before testing it', () => {
    const learner = makeLearner();
    const lesson = allLessons.find((l) => l.teaches.length > 2 && l.kind === 'core')!;
    const plan = buildLessonSession(lesson.id, { learner, seed: 3 })!;

    const firstTestIndex = plan.exercises.findIndex((e) => e.form !== 'presentation');
    const firstTeachIndex = plan.exercises.findIndex((e) => e.kind === 'teach' || e.kind === 'grammarCard');
    if (firstTeachIndex >= 0 && firstTestIndex >= 0) {
      expect(firstTeachIndex).toBeLessThan(firstTestIndex);
    }
  });

  it('does not put two exercises of the same kind back to back', () => {
    const learner = makeLearner();
    const lesson = allLessons.find((l) => l.kind === 'core' && l.teaches.length > 4)!;
    const plan = buildLessonSession(lesson.id, { learner, seed: 11 })!;

    let adjacentRepeats = 0;
    for (let i = 1; i < plan.exercises.length; i += 1) {
      const previous = plan.exercises[i - 1];
      const current = plan.exercises[i];
      if (previous.form === 'presentation' || current.form === 'presentation') continue;
      if (previous.kind === current.kind && previous.conceptIds[0] === current.conceptIds[0]) {
        adjacentRepeats += 1;
      }
    }
    expect(adjacentRepeats).toBe(0);
  });
});

describe('smart review', () => {
  it('is empty for a brand new learner', () => {
    const plan = buildSmartReview({ learner: makeLearner(), seed: 5 });
    expect(plan.exercises).toHaveLength(0);
  });

  it('prioritises overdue and failed concepts', () => {
    const learner = makeLearner();
    const now = Date.now();

    // One concept answered wrong and overdue, one answered right and fresh.
    learner.concepts['v.tener'] = review(
      { ...createConceptState('v.tener', now - 10 * 86_400_000), introduced: true },
      { grade: 'incorrect', difficulty: 3, kind: 'fillBlank', now: now - 10 * 86_400_000 },
    );
    learner.concepts['v.hola'] = review(
      { ...createConceptState('v.hola', now), introduced: true },
      { grade: 'correct', difficulty: 3, kind: 'fillBlank', now },
    );

    const plan = buildSmartReview({ learner, seed: 5 });
    expect(plan.exercises.length).toBeGreaterThan(0);
    expect(plan.exercises[0].conceptIds).toContain('v.tener');
  });
});

describe('progression', () => {
  it('offers the first lesson to a new learner', () => {
    const learner = makeLearner();
    const lesson = nextLesson(learner);
    expect(lesson?.id).toBe(allLessons[0].id);
  });

  it('advances once a lesson is completed', () => {
    const learner = makeLearner();
    learner.completedLessons[allLessons[0].id] = { at: Date.now(), accuracy: 1, times: 1 };
    expect(nextLesson(learner)?.id).toBe(allLessons[1].id);
  });

  it('does not unlock a lesson whose prerequisites are unmet', () => {
    const learner = makeLearner();
    const gated = allLessons.find((lesson) => (lesson.requires ?? []).length > 0)!;
    expect(nextLesson(learner)?.id).not.toBe(gated.id);
  });
});

describe('placement', () => {
  it('moves difficulty up on a correct answer and down on a wrong one', () => {
    expect(adjustLevel(1, true)).toBe(2);
    expect(adjustLevel(1, false)).toBe(0);
    expect(adjustLevel(0, false)).toBe(0); // clamped
    expect(adjustLevel(6, true)).toBe(6); // clamped at C2
  });

  it('places a learner who answers A1 correctly and B1 wrongly at A1', () => {
    const a1 = { level: 'A1' as const, area: 'present' as const, form: 'choice' as const, id: 'x', prompt: '', concepts: [] };
    const b1 = { ...a1, id: 'y', level: 'B1' as const };
    const score = scorePlacement([
      { question: a1, correct: true },
      { question: { ...a1, id: 'a2' }, correct: true },
      { question: b1, correct: false },
      { question: { ...b1, id: 'b2' }, correct: false },
    ]);
    expect(score.level).toBe('A1');
  });

  it('seeds the learner model and unlocks the right starting lesson', () => {
    const learner = makeLearner();
    const question = {
      id: 'q',
      level: 'A1' as const,
      area: 'serEstar' as const,
      form: 'choice' as const,
      prompt: '',
      concepts: ['g.ser-estar'],
    };
    const score = scorePlacement([{ question, correct: false }]);
    const placed = applyPlacement(learner, { ...score, level: 'A2' }, [
      { question, correct: false },
    ]);

    // Concepts below the placement level count as met…
    expect(Object.keys(placed.concepts).length).toBeGreaterThan(0);
    // …but the one they got wrong is shaky and due now.
    expect(placed.concepts['g.ser-estar'].strength).toBeLessThan(0.4);
    expect(placed.concepts['g.ser-estar'].dueAt).toBeLessThanOrEqual(Date.now() + 2000);
    expect(placed.placement?.level).toBe('A2');
    expect(placed.onboarded).toBe(true);

    // The path opens somewhere past the very first lesson.
    const next = nextLesson(placed);
    expect(next).not.toBeNull();
    expect(getConcept(next!.teaches[0] ?? 'v.hola')).toBeDefined();
  });
});

describe('xp', () => {
  it('pays more for production than recognition', () => {
    const easy = xpForAnswer({ kind: 'multipleChoice', grade: 'correct' });
    const hard = xpForAnswer({ kind: 'buildResponse', grade: 'correct' });
    expect(hard).toBeGreaterThan(easy);
  });

  it('pays nothing for a wrong answer and half for "almost"', () => {
    expect(xpForAnswer({ kind: 'translateToEs', grade: 'incorrect' })).toBe(0);
    const full = xpForAnswer({ kind: 'translateToEs', grade: 'correct' });
    const almost = xpForAnswer({ kind: 'translateToEs', grade: 'almost' });
    expect(almost).toBeLessThan(full);
    expect(almost).toBeGreaterThan(0);
  });

  it('caps easy drills on mastered concepts so XP cannot be farmed', () => {
    expect(xpForAnswer({ kind: 'multipleChoice', grade: 'correct', mastery: 0.95 })).toBe(1);
    expect(xpForAnswer({ kind: 'listenSelect', grade: 'correct', mastery: 0.95 })).toBe(1);
    // Hard production still pays fully even when mastered.
    expect(xpForAnswer({ kind: 'buildResponse', grade: 'correct', mastery: 0.95 })).toBeGreaterThan(1);
  });

  it('rewards hard mode', () => {
    const normal = xpForAnswer({ kind: 'translateToEs', grade: 'correct' });
    const hard = xpForAnswer({ kind: 'translateToEs', grade: 'correct', hardMode: true });
    expect(hard).toBe(normal + 1);
  });

  it('computes levels monotonically', () => {
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(cumulativeXp(2)).level).toBe(2);
    expect(levelInfo(cumulativeXp(5)).level).toBe(5);
    expect(levelInfo(cumulativeXp(5) - 1).level).toBe(4);

    let previous = 0;
    for (let xp = 0; xp < 20000; xp += 137) {
      const level = levelInfo(xp).level;
      expect(level).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });
});

describe('placement seeding details', () => {
  it('still teaches concepts the learner got wrong', () => {
    const question = {
      id: 'q',
      level: 'A1' as const,
      area: 'serEstar' as const,
      form: 'choice' as const,
      prompt: '',
      concepts: ['g.ser-estar'],
    };
    const answers = [{ question, correct: false }];
    const placed = applyPlacement(makeLearner(), scorePlacement(answers), answers);

    // Failed => not "introduced", so the app still shows its teaching card.
    expect(placed.concepts['g.ser-estar'].introduced).toBe(false);
    expect(placed.concepts['g.ser-estar'].dueAt).toBeLessThanOrEqual(Date.now() + 50);
  });

  it('marks concepts the learner proved as already met', () => {
    const question = {
      id: 'q',
      level: 'A1' as const,
      area: 'present' as const,
      form: 'choice' as const,
      prompt: '',
      concepts: ['v.hablar'],
    };
    const answers = [{ question, correct: true }];
    const placed = applyPlacement(makeLearner(), scorePlacement(answers), answers);
    expect(placed.concepts['v.hablar'].introduced).toBe(true);
  });
});

describe('adaptive placement staircase', () => {
  it('converges: early answers move far, later answers move little', () => {
    expect(stepSize(0)).toBeGreaterThan(stepSize(15));
    expect(stepSize(15)).toBeGreaterThan(stepSize(29));
    expect(stepSize(29)).toBeGreaterThan(0);
  });

  it('climbs to the right region within a few answers for a strong learner', () => {
    let ability = 1.2;
    for (let i = 0; i < 6; i += 1) ability = adjustAbility(ability, true, i);
    expect(ability).toBeGreaterThan(3); // past B1 in six correct answers
  });

  /**
   * Simulates a learner with a fixed true level answering the questions the
   * algorithm actually picks: near-certain below their level, near-chance above
   * it. This is the only test that says anything about *accuracy* — an
   * alternating-outcome sequence ignores that difficulty adapts to the answers.
   */
  function simulate(trueLevel: number, seed: number) {
    const rng = mulberry32(seed);
    const asked: string[] = [];
    const answers: PlacementAnswer[] = [];
    let ability = 1.2;

    for (let i = 0; i < PLACEMENT_LENGTH; i += 1) {
      const question = nextPlacementQuestion(asked, ability, answers);
      if (!question) break;
      const gap = trueLevel - levelIndex(question.level);
      // Logistic response curve, with a 25% floor for four-option guessing.
      const p = 0.25 + 0.75 / (1 + Math.exp(-2.2 * gap));
      const correct = rng() < p;
      asked.push(question.id);
      answers.push({ question, correct });
      ability = adjustAbility(ability, correct, i + 1);
    }
    return { ability, score: scorePlacement(answers), answers };
  }

  it('lands within one level of a simulated learner’s true level', () => {
    for (const trueLevel of [0, 1, 2, 3, 4]) {
      let hits = 0;
      for (let seed = 1; seed <= 12; seed += 1) {
        const { score } = simulate(trueLevel, seed * 977);
        if (Math.abs(levelIndex(score.level) - trueLevel) <= 1) hits += 1;
      }
      // Allow the odd unlucky run, but the estimate must be broadly right.
      expect(hits).toBeGreaterThanOrEqual(9);
    }
  });

  it('separates a beginner from an advanced learner', () => {
    const low = simulate(0, 4242).score;
    const high = simulate(4, 4242).score;
    expect(levelIndex(high.level)).toBeGreaterThan(levelIndex(low.level));
  });

  it('never proposes a question that was already asked', () => {
    const asked: string[] = [];
    const answers: PlacementAnswer[] = [];
    let ability = 1.2;
    for (let i = 0; i < PLACEMENT_LENGTH; i += 1) {
      const question = nextPlacementQuestion(asked, ability, answers);
      expect(question).not.toBeNull();
      expect(asked).not.toContain(question!.id);
      asked.push(question!.id);
      answers.push({ question: question!, correct: i % 3 !== 0 });
      ability = adjustAbility(ability, i % 3 !== 0, i);
    }
    expect(new Set(asked).size).toBe(PLACEMENT_LENGTH);
  });

  it('samples several skill areas over a full test', () => {
    const asked: string[] = [];
    const answers: PlacementAnswer[] = [];
    let ability = 1.2;
    for (let i = 0; i < PLACEMENT_LENGTH; i += 1) {
      const question = nextPlacementQuestion(asked, ability, answers)!;
      asked.push(question.id);
      answers.push({ question, correct: true });
      ability = adjustAbility(ability, true, i);
    }
    const areas = new Set(answers.map((a) => a.question.area));
    expect(areas.size).toBeGreaterThanOrEqual(5);
  });
});

describe('checkpoints', () => {
  it('builds a playable checkpoint even before its stage has been studied', () => {
    const plan = buildLessonSession('l.checkpoint-a1', { learner: makeLearner(), seed: 4 });
    expect(plan).not.toBeNull();
    expect(plan!.exercises.length).toBeGreaterThan(4);
  });
});

describe('B2 raises the floor on production', () => {
  const settings = { ...DEFAULT_SETTINGS_FOR_TEST };
  const base = { settings, now: Date.now(), rng: () => 0.5 };
  const seen = { timesSeen: 6, kinds: [], stability: 4, lastSeen: Date.now(), due: Date.now() };
  const state = { ...seen, id: 'v.hola' } as never;

  const PLAIN = ['multipleChoice', 'match'];
  const DISCRIMINATING = ['chooseNatural', 'grammarChoice', 'listenSelect'];

  it('demotes plain recognition rather than banning it', () => {
    const kinds = candidateKinds(state, { ...base, level: 'B2' });
    const plain = kinds.filter((k) => PLAIN.includes(k));
    // Still reachable as a fallback...
    expect(plain.length).toBeGreaterThan(0);
    // ...but never ahead of something that asks for more.
    const firstPlain = kinds.findIndex((k) => PLAIN.includes(k));
    const lastOther = kinds.map((k) => PLAIN.includes(k)).lastIndexOf(false);
    expect(firstPlain).toBeGreaterThan(lastOther - 1);
    expect(firstPlain).toBeGreaterThan(0);
  });

  it('keeps discriminating recognition first-class, because that is the hard skill', () => {
    const kinds = candidateKinds(state, { ...base, level: 'C1' });
    const firstDiscriminating = kinds.findIndex((k) => DISCRIMINATING.includes(k));
    const firstPlain = kinds.findIndex((k) => PLAIN.includes(k));
    expect(firstDiscriminating).toBeGreaterThanOrEqual(0);
    expect(firstDiscriminating).toBeLessThan(firstPlain);
  });

  it('still offers recognition freely at A2', () => {
    const kinds = candidateKinds(state, { ...base, level: 'A2' });
    expect(kinds.length).toBeGreaterThan(0);
  });

  it('gives a B2 learner a gentler first pass on genuinely new material', () => {
    const fresh = candidateKinds(undefined, { ...base, level: 'B2' });
    expect(fresh.length).toBeGreaterThan(0);
    expect(fresh).toContain('translateToEn');
  });
});

/**
 * Modality is a property of the *generator*, not of the timetable.
 *
 * The course also ships dedicated listening, reading and conversation lessons,
 * and it would be easy to read those as the only place those skills live — which
 * would make an ordinary vocabulary lesson a silent, text-only affair. It is not:
 * every sentence can become audio, so listening and production are generated
 * inside ordinary lessons too. This locks that in, because a change to
 * `candidateKinds` could remove it without any other test noticing.
 */
describe('modality inside ordinary lessons', () => {
  const learnerWhoHasMetEverything = () => {
    const concepts: Record<string, ReturnType<typeof createConceptState>> = {};
    for (const lesson of allLessons) {
      for (const id of [...lesson.teaches, ...(lesson.grammar ?? [])]) {
        concepts[id] = {
          ...createConceptState(id),
          introduced: true,
          timesSeen: 5,
          strength: 0.6,
          depth: 3,
          lastReviewed: Date.now(),
          stability: 10,
        };
      }
    }
    return makeLearner({ concepts });
  };

  it('puts listening and production inside core and grammar lessons, not only dedicated ones', () => {
    const learner = learnerWhoHasMetEverything();
    const ordinary = allLessons.filter((l) => l.kind === 'core' || l.kind === 'grammar');
    expect(ordinary.length).toBeGreaterThan(20);

    let withListening = 0;
    let withProduction = 0;
    for (const lesson of ordinary) {
      const plan = buildLessonSession(lesson.id, { learner, seed: lesson.id.length * 13 });
      const skills = new Set(
        (plan?.exercises ?? []).map((e) => KIND_SKILL[e.kind]).filter(Boolean),
      );
      if (skills.has('listening')) withListening += 1;
      if (skills.has('production')) withProduction += 1;
    }

    // Deliberately a floor, not the observed value: the generator is random, and
    // the claim being protected is "most ordinary lessons", not an exact ratio.
    expect(withListening / ordinary.length).toBeGreaterThan(0.8);
    expect(withProduction / ordinary.length).toBeGreaterThan(0.8);
  });
});

/**
 * Ability is not one number. A learner can read at B2 and produce at A2, and a
 * single CEFR estimate would hand them B2 production. These lock the behaviour
 * that keeps the mix hard where the learner is strong without over-reaching
 * where they are not.
 */
describe('per-skill adaptation', () => {
  const settings = { ...DEFAULT_SETTINGS_FOR_TEST };
  const now = Date.now();
  const base = { settings, now, rng: () => 0.5, level: 'B2' as const };
  const strong = {
    timesSeen: 8,
    stability: 40,
    strength: 0.95,
    depth: 4,
    dueAt: now + 1e9,
    lastReviewed: now,
  };
  const state = { ...strong, id: 'v.hola', kinds: [] } as never;

  const DEMANDING_PRODUCTION = ['translateToEs', 'buildResponse', 'speak', 'conversation'];

  it('pushes demanding production back when production lags the learner’s other skills', () => {
    const balanced = candidateKinds(state, { ...base, skills: { lagging: [], leading: [] } });
    const lagging = candidateKinds(state, {
      ...base,
      skills: { lagging: ['production'], leading: ['vocabulary'] },
    });

    const firstDemanding = (kinds: readonly string[]) =>
      kinds.findIndex((k) => DEMANDING_PRODUCTION.includes(k));

    expect(firstDemanding(lagging)).toBeGreaterThan(firstDemanding(balanced));
  });

  it('never removes a lagging skill — that is the only way it stops lagging', () => {
    const lagging = candidateKinds(state, {
      ...base,
      skills: { lagging: ['production', 'listening'], leading: [] },
    });
    expect(lagging.some((k) => DEMANDING_PRODUCTION.includes(k))).toBe(true);
  });

  it('brings demanding work forward in a skill the learner is ahead in', () => {
    const balanced = candidateKinds(state, { ...base, skills: { lagging: [], leading: [] } });
    const leading = candidateKinds(state, {
      ...base,
      skills: { lagging: [], leading: ['production'] },
    });
    const firstDemanding = (kinds: readonly string[]) =>
      kinds.findIndex((k) => DEMANDING_PRODUCTION.includes(k));

    expect(firstDemanding(leading)).toBeLessThanOrEqual(firstDemanding(balanced));
  });

  it('still demotes plain recognition ahead of any per-skill reordering', () => {
    const kinds = candidateKinds(state, {
      ...base,
      skills: { lagging: ['production'], leading: [] },
    });
    const firstPlain = kinds.findIndex((k) => ['multipleChoice', 'match'].includes(k));
    const lastOther = kinds.map((k) => ['multipleChoice', 'match'].includes(k)).lastIndexOf(false);
    expect(firstPlain).toBeGreaterThan(lastOther - 1);
  });

  it('reports no per-skill profile until there is enough evidence to have one', () => {
    // One exercise in one skill is a sample, not a profile.
    const learner = makeLearner({
      concepts: {
        'v.hola': { ...strong, id: 'v.hola', kinds: ['translateToEs'] } as never,
      },
    });
    expect(skillBalance(learner, now)).toEqual({ lagging: [], leading: [] });
  });

  it('detects a real gap between two well-sampled skills', () => {
    const concepts: Record<string, unknown> = {};
    // Both skills need to clear the minimum sample, or the guard above correctly
    // refuses to draw a profile at all.
    const vocabIds = vocabConcepts.slice(0, 24).map((c) => c.id);
    vocabIds.forEach((id, i) => {
      // Half the sample has been listened to and answered well; the other half
      // has been produced and answered badly.
      const listening = i % 2 === 0;
      concepts[id] = {
        ...strong,
        id,
        strength: listening ? 0.95 : 0.15,
        depth: listening ? 4 : 1,
        kinds: listening ? ['listenSelect'] : ['translateToEs'],
      };
    });

    const balance = skillBalance(makeLearner({ concepts: concepts as never }), now);
    expect(balance.lagging).toContain('production');
    expect(balance.leading).toContain('listening');
  });
});
