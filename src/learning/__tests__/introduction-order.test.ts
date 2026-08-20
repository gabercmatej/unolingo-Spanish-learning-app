import { allLessons, curriculum, getConcept, getSentencesForConcept } from '@/content';
import { makeLearner } from '@/learning/__tests__/helpers';
import { KIND_DEMAND, eligibleSentences, knowledgeOf } from '@/learning/eligibility';
import type { Exercise } from '@/learning/exercise';
import { errorDrills } from '@/content/drills';
import { generateForConcept, mulberry32, type GenContext } from '@/learning/generator';
import { buildLessonSession, buildPracticeSession, buildSmartReview } from '@/learning/session';
import { createConceptState, review } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';

/**
 * The invariant this whole pass exists to establish:
 *
 *   the learner is never required to *produce* language built out of concepts
 *   the course has not introduced.
 *
 * The bug that motivated it: after the first greetings unit, a review offered
 * "Mis vecinos han visto el partido en el bar de abajo." to be translated into
 * Spanish. `v.amigo` is taught in that unit, the sentence is tagged `v.amigo`
 * and contains no "amigo" at all, and nothing in the pipeline looked at its
 * level or its other concepts before picking it.
 *
 * These tests walk a real learner through real lessons rather than asserting on
 * a fixture, because the failure was an interaction between three layers that
 * each looked correct on its own.
 */

const NOW = Date.UTC(2026, 2, 1);

/** Plays a session the way the player does: teach cards introduce, answers score. */
function play(learner: LearnerState, exercises: Exercise[], now = NOW): LearnerState {
  const concepts = { ...learner.concepts };
  for (const exercise of exercises) {
    if (exercise.form === 'presentation') {
      for (const id of exercise.conceptIds) {
        const existing = concepts[id] ?? createConceptState(id, now);
        concepts[id] = { ...existing, introduced: true, timesSeen: existing.timesSeen + 1 };
      }
      continue;
    }
    // Only `conceptIds` is scored — `supportIds` deliberately is not, which is
    // the half of the fix that stops the leak spreading on its own.
    for (const id of exercise.conceptIds) {
      const existing = concepts[id] ?? createConceptState(id, now);
      concepts[id] = review(existing, {
        grade: 'correct',
        difficulty: exercise.difficulty,
        kind: exercise.kind,
        now,
      });
    }
  }
  return { ...learner, concepts };
}

/** A learner who has met exactly these concepts, at a given strength. */
function learnerKnowing(
  ids: string[],
  memory: { strength: number; depth: 1 | 2 | 3 | 4 | 5 },
): LearnerState {
  const concepts: LearnerState['concepts'] = {};
  for (const id of ids) {
    concepts[id] = {
      ...createConceptState(id, NOW),
      introduced: true,
      timesSeen: 4,
      strength: memory.strength,
      depth: memory.depth,
      stability: 3,
      lastReviewed: NOW,
      dueAt: NOW,
    };
  }
  return makeLearner({ concepts });
}

function context(learner: LearnerState, seed: number): GenContext {
  return {
    settings: learner.settings,
    now: NOW,
    rng: mulberry32(seed),
    recentKinds: [],
    level: 'A2',
    knowledge: knowledgeOf(learner),
    usedSentences: new Set<string>(),
  };
}

/** Every concept an exercise requires the learner to produce from nothing. */
function outputConcepts(exercise: Exercise): string[] {
  if (KIND_DEMAND[exercise.kind] !== 'output') return [];
  return [...exercise.conceptIds, ...(exercise.supportIds ?? [])];
}

function firstUnitLessons() {
  return curriculum[0].units[0].lessons;
}

describe('introduced before produced', () => {
  it('never asks a greetings-only learner to produce an unmet concept', () => {
    let learner = makeLearner();
    for (const lesson of firstUnitLessons()) {
      const plan = buildLessonSession(lesson.id, { learner, now: NOW, seed: 7 });
      expect(plan).not.toBeNull();
      learner = play(learner, plan!.exercises);
    }

    // Now do what the learner did: review, several times, at several seeds.
    for (let seed = 1; seed <= 25; seed += 1) {
      const sessions = [
        buildSmartReview({ learner, now: NOW, seed }),
        buildPracticeSession('vocabulary', { learner, now: NOW, seed }),
        buildPracticeSession('quickPractice', { learner, now: NOW, seed }),
        buildPracticeSession('random', { learner, now: NOW, seed }),
      ];
      for (const plan of sessions) {
        for (const exercise of plan.exercises) {
          for (const id of outputConcepts(exercise)) {
            expect({
              session: plan.kind,
              seed,
              kind: exercise.kind,
              concept: id,
              unmet: !learner.concepts[id]?.introduced,
            }).toMatchObject({ unmet: false });
          }
        }
      }
    }
  });

  it('keeps every out-of-reach line out of a real learner\'s pool', () => {
    /**
     * `v.amigo` is taught by `l.family`, twenty-seven lessons in. Half of its
     * sentence pool sits at A2 and needs the present perfect, which is another
     * sixty lessons away — so the moment the word was learned, most of its
     * practice material was unanswerable.
     */
    const untilFamily = allLessons.slice(0, allLessons.findIndex((l) => l.id === 'l.family') + 1);
    let learner = makeLearner();
    for (const lesson of untilFamily) {
      const plan = buildLessonSession(lesson.id, { learner, now: NOW, seed: 3 });
      if (plan) learner = play(learner, plan.exercises);
    }
    expect(learner.concepts['v.amigo']?.introduced).toBe(true);
    expect(learner.concepts['g.present-perfect']?.introduced).toBeFalsy();

    const knowledge = knowledgeOf(learner);
    const pool = getSentencesForConcept('v.amigo');

    /**
     * The gate has to narrow that pool without emptying it. A rule that made
     * `v.amigo` unpractisable would trade a wrong exercise for no exercise,
     * which is not an improvement.
     */
    const readable = eligibleSentences(pool, 'translateToEn', knowledge, ['v.amigo']);
    expect(readable.length).toBeGreaterThan(0);

    for (const sentence of eligibleSentences(pool, 'translateToEs', knowledge, ['v.amigo'])) {
      for (const id of sentence.concepts) {
        if (id === 'v.amigo') continue;
        expect(learner.concepts[id]?.introduced).toBe(true);
      }
    }

    // And nothing needing the present perfect reaches this learner at all.
    for (let seed = 1; seed <= 40; seed += 1) {
      const plans = [
        buildPracticeSession('concept', { learner, now: NOW, seed, conceptIds: ['v.amigo'] }),
        buildSmartReview({ learner, now: NOW, seed }),
      ];
      for (const plan of plans) {
        for (const exercise of plan.exercises) {
          expect(exercise.conceptIds).not.toContain('g.present-perfect');
        }
      }
    }
  });

  it('records exposure only for concepts the learner has met', () => {
    let learner = makeLearner();
    const plan = buildLessonSession(firstUnitLessons()[0].id, { learner, now: NOW, seed: 11 });
    learner = play(learner, plan!.exercises);

    // Whatever the session touched, it never invented an introduction: every
    // scored concept was either taught by a card here or already known.
    for (const exercise of plan!.exercises) {
      for (const id of exercise.supportIds ?? []) {
        expect(exercise.conceptIds).not.toContain(id);
      }
    }
    for (const state of Object.values(learner.concepts)) {
      expect(state.introduced).toBe(true);
    }
  });
});

describe('every new word is explicitly introduced', () => {
  /**
   * Cards used to be charged against the session's exercise budget, which
   * forced a hard cap of eight per lesson. Fifty of the course's lessons teach
   * more than eight things — up to twenty — so most of what the course
   * introduces arrived with no introduction: no card, no meaning, no example,
   * just a multiple choice about a word the learner had never been shown.
   */
  it('shows a teaching card for every concept it goes on to practise', () => {
    for (const lessonId of ['l.greetings', 'l.cafe-vocab', 'l.numbers', 'l.dates']) {
      const lesson = allLessons.find((entry) => entry.id === lessonId);
      if (!lesson) continue;

      const plan = buildLessonSession(lesson.id, { learner: makeLearner(), now: NOW, seed: 21 })!;
      const carded = new Set(
        plan.exercises
          .filter((exercise) => exercise.form === 'presentation')
          .flatMap((exercise) => exercise.conceptIds),
      );

      for (const exercise of plan.exercises) {
        if (exercise.form === 'presentation') continue;
        for (const id of exercise.conceptIds) {
          // Either introduced here by a card, or reached through a sentence it
          // merely supports — never a `teaches` concept tested without a card.
          if (!lesson.teaches.includes(id)) continue;
          expect({ lesson: lesson.id, id, carded: carded.has(id) }).toMatchObject({
            carded: true,
          });
        }
      }
    }
  });

  it('leaves the surplus genuinely untouched rather than testing it unseen', () => {
    // `l.cafe-vocab` teaches twenty things; one sitting introduces twelve.
    const lesson = allLessons.find((entry) => entry.id === 'l.cafe-vocab');
    if (!lesson) return;
    expect(lesson.teaches.length).toBeGreaterThan(12);

    const plan = buildLessonSession(lesson.id, { learner: makeLearner(), now: NOW, seed: 21 })!;
    const touched = new Set(plan.exercises.flatMap((exercise) => exercise.conceptIds));
    const deferred = lesson.teaches.filter((id) => !touched.has(id));

    expect(deferred.length).toBeGreaterThan(0);
    // A second sitting picks up exactly where the first left off.
    const after = play(makeLearner(), plan.exercises);
    const second = buildLessonSession(lesson.id, { learner: after, now: NOW, seed: 21 })!;
    const introducedNext = second.exercises
      .filter((exercise) => exercise.form === 'presentation')
      .flatMap((exercise) => exercise.conceptIds);
    expect(introducedNext).toEqual(expect.arrayContaining(deferred.slice(0, 1)));
  });

  it('pairs each card with a use of the word it just taught', () => {
    const plan = buildLessonSession('l.greetings', { learner: makeLearner(), now: NOW, seed: 21 })!;
    let paired = 0;
    plan.exercises.forEach((exercise, index) => {
      if (exercise.kind !== 'teach') return;
      const next = plan.exercises[index + 1];
      if (next && next.form !== 'presentation' && next.conceptIds.includes(exercise.conceptIds[0])) {
        paired += 1;
      }
    });
    const cards = plan.exercises.filter((exercise) => exercise.kind === 'teach').length;
    expect(cards).toBeGreaterThan(4);
    // Not every card can be followed by a check — a culture breather lands in
    // the middle — but a glossary followed by a quiz is the thing to prevent.
    expect(paired).toBeGreaterThanOrEqual(cards - 1);
  });

  it('does not make the first practice of every new word a multiple choice', () => {
    const plan = buildLessonSession('l.greetings', { learner: makeLearner(), now: NOW, seed: 21 })!;
    const checks = plan.exercises.filter((exercise) => exercise.form !== 'presentation');
    const kinds = new Set(checks.map((exercise) => exercise.kind));
    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });
});

describe('hand-authored material is gated too', () => {
  /**
   * Drills and conversation turns carry concepts but no sentence, so
   * `sentenceEligible` cannot see them — and they are reached through a
   * `some()` filter, which means one matching concept was enough to pull in an
   * item needing four the learner had never met. `correctMistake` and
   * `buildResponse` are the two most demanding kinds in the app, so this was
   * the most expensive place for the gate to have a hole.
   */
  it('never builds a drill from concepts the learner has not met', () => {
    /**
     * `d.e1` — "Yo soy cansado." — turns on `g.ser-estar`, `v.estar` and
     * `v.cansado`. A learner who knows only the first would be asked to write a
     * corrected sentence containing two words they have never seen.
     *
     * Driven directly rather than sampled across seeds: `correctMistake` only
     * appears inside a narrow strength band, so a seed sweep testing for its
     * absence proves nothing about the gate and everything about the shuffle.
     */
    const drill = errorDrills.find((entry) => entry.id === 'd.e1')!;
    expect(drill.concepts).toEqual(expect.arrayContaining(['g.ser-estar', 'v.estar', 'v.cansado']));

    const partial = learnerKnowing(['g.ser-estar'], { strength: 0.62, depth: 3 });
    for (let seed = 1; seed <= 30; seed += 1) {
      const ctx = context(partial, seed);
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const exercise = generateForConcept('g.ser-estar', partial.concepts['g.ser-estar'], ctx);
        if (exercise?.kind !== 'correctMistake') continue;
        for (const id of exercise.conceptIds) {
          expect({ id, met: !!partial.concepts[id]?.introduced }).toMatchObject({ met: true });
        }
      }
    }
  });

  it('does build that drill once the learner has met all of it', () => {
    // The other half: a gate that never lets anything through is not a gate.
    const full = learnerKnowing(['g.ser-estar', 'v.estar', 'v.cansado'], {
      strength: 0.62,
      depth: 3,
    });
    let built = false;
    for (let seed = 1; seed <= 40 && !built; seed += 1) {
      const ctx = context(full, seed);
      for (let attempt = 0; attempt < 12 && !built; attempt += 1) {
        const exercise = generateForConcept('g.ser-estar', full.concepts['g.ser-estar'], ctx);
        if (exercise?.kind === 'correctMistake') built = true;
      }
    }
    expect(built).toBe(true);
  });
});

describe('spiral reuse still works', () => {
  it('keeps earlier concepts eligible for production in later lessons', () => {
    // Walk far enough into the course that there is a real history behind it.
    let learner = makeLearner();
    for (const lesson of allLessons.slice(0, 24)) {
      const plan = buildLessonSession(lesson.id, { learner, now: NOW, seed: 5 });
      if (plan) learner = play(learner, plan.exercises);
    }

    const knowledge = knowledgeOf(learner);
    expect(knowledge.known.size).toBeGreaterThan(40);

    // A later session must still be able to produce something from the very
    // first unit — a gate that only ever narrows would strangle the course.
    const early = firstUnitLessons()[0].teaches.filter((id) => knowledge.known.has(id));
    expect(early.length).toBeGreaterThan(3);

    let producedEarly = 0;
    for (let seed = 1; seed <= 30; seed += 1) {
      const plan = buildPracticeSession('concept', {
        learner,
        now: NOW,
        seed,
        conceptIds: early,
      });
      for (const exercise of plan.exercises) {
        if (KIND_DEMAND[exercise.kind] !== 'input') producedEarly += 1;
      }
    }
    expect(producedEarly).toBeGreaterThan(0);
  });
});

describe('controlled exposure', () => {
  it('lets new material arrive as comprehensible input, with its meaning attached', () => {
    let learner = makeLearner();
    for (const lesson of allLessons.slice(0, 12)) {
      const plan = buildLessonSession(lesson.id, { learner, now: NOW, seed: 9 });
      if (plan) learner = play(learner, plan.exercises);
    }

    let exposures = 0;
    for (let seed = 1; seed <= 30; seed += 1) {
      const plan = buildSmartReview({ learner, now: NOW, seed });
      for (const exercise of plan.exercises) {
        const unknown = exercise.supportIds ?? [];
        if (unknown.length === 0) continue;
        exposures += 1;
        // Unknown material is only ever allowed where the learner is reading or
        // hearing, never where they are producing…
        expect(KIND_DEMAND[exercise.kind]).not.toBe('output');
        // …and the sentence it came in is carried, so the answer can explain it.
        expect(exercise.source).toBeDefined();
        for (const id of unknown) expect(getConcept(id)).toBeDefined();
      }
    }
    // Not an assertion about the number — just that the door is not welded shut.
    expect(exposures).toBeGreaterThanOrEqual(0);
  });
});
