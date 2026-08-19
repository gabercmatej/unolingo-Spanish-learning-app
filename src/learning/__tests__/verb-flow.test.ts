import {
  allLessons,
  getLessonThatIntroduces,
  getVerb,
  verbFormConceptId,
  verbFormConcepts,
} from '@/content';
import { paradigmUsage } from '@/content/verb-corpus';
import type { TenseId } from '@/content/types';
import { checkExercise } from '@/learning/check';
import { hasMetVerbTense, metVerbTenses } from '@/learning/mastery';
import { buildLessonSession } from '@/learning/session';
import { createConceptState, mastery, review } from '@/learning/srs';
import { DEFAULT_SETTINGS_FOR_TEST, makeLearner } from '@/learning/__tests__/helpers';
import type { LearnerState } from '@/learning/types';

/**
 * The verb-conjugation pathway, end to end.
 *
 * Every stage of this chain existed and was individually correct, and the chain
 * as a whole was dead: no lesson introduced any paradigm, so no paradigm entered
 * a learner's state, so the conjugation builder never ran and the Library's verb
 * pages showed only the present tense — for every verb, permanently. Type checks
 * passed, content validation passed, and 119 unit tests passed throughout.
 *
 * The lesson is that each link was tested and the *composition* was not. So this
 * walks the whole path in one test:
 *
 *   verb introduced → tense introduced → paradigm reachable → conjugation
 *   exercise generated → answer graded → mastery updates → Library exposes it
 *
 * If any single link breaks, this fails, even when every unit test still passes.
 */

/** Marks a lesson's concepts as introduced, the way completing it would. */
function introduce(learner: LearnerState, lessonId: string): LearnerState {
  const lesson = allLessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error(`no lesson ${lessonId}`);
  const concepts = { ...learner.concepts };
  for (const id of [...lesson.teaches, ...(lesson.grammar ?? [])]) {
    concepts[id] = { ...createConceptState(id), introduced: true, timesSeen: 1 };
  }
  return { ...learner, concepts };
}

describe('verb conjugation pathway', () => {
  it('carries one paradigm from unreachable to practised and displayed', () => {
    // A paradigm with real corpus support, so the contextual branch is exercised.
    const conceptId = verbFormConceptId('tener', 'present');
    const tense: TenseId = 'present';
    const usage = paradigmUsage(conceptId);
    expect(usage && usage.sentenceIds.length).toBeGreaterThan(0);

    // 1. Some lesson must introduce it, or nothing downstream can ever happen.
    const lessonId = getLessonThatIntroduces(conceptId);
    expect(lessonId).toBeTruthy();

    // 2. Before that lesson, the Library hides the tense and mastery is absent.
    let learner = makeLearner();
    expect(hasMetVerbTense('tener', tense, learner)).toBe(false);
    expect(metVerbTenses('tener', learner)).toEqual([]);

    // 3. Completing the lesson brings the paradigm into the learner's state.
    learner = introduce(learner, lessonId!);
    expect(hasMetVerbTense('tener', tense, learner)).toBe(true);

    // 4. …and the Library now exposes exactly that tense, not the others.
    expect(metVerbTenses('tener', learner)).toContain(tense);
    const verb = getVerb('tener')!;
    const everyTense = Object.keys(verb.tenses) as TenseId[];
    expect(metVerbTenses('tener', learner).length).toBeLessThan(everyTense.length);

    // 5. The lesson session actually generates an exercise for the paradigm.
    const plan = buildLessonSession(lessonId!, { learner, seed: 21 });
    expect(plan).not.toBeNull();
    const exercise = plan!.exercises.find((e) => e.conceptIds.includes(conceptId));
    expect(exercise).toBeDefined();

    // 6. Its own correct answer is accepted by the grader.
    const answer =
      exercise!.form === 'choice'
        ? String(exercise!.answerIndex)
        : exercise!.form === 'typed'
          ? exercise!.accepted[0]
          : null;
    expect(answer).not.toBeNull();
    expect(checkExercise(exercise!, answer!, DEFAULT_SETTINGS_FOR_TEST).grade).toBe('correct');

    // 7. Answering it moves mastery off the floor.
    const before = learner.concepts[conceptId];
    expect(mastery(before)).toBe(0);
    const after = review(before, {
      grade: 'correct',
      difficulty: exercise!.difficulty,
      kind: exercise!.kind,
    });
    expect(after.timesSeen).toBeGreaterThan(before.timesSeen);
    expect(mastery(after)).toBeGreaterThan(0);

    // 8. And the Library still exposes the tense, now with progress to show.
    const practised = { ...learner, concepts: { ...learner.concepts, [conceptId]: after } };
    expect(hasMetVerbTense('tener', tense, practised)).toBe(true);
    expect(mastery(practised.concepts[conceptId])).toBeGreaterThan(0);
  });

  it('generates a conjugation exercise for every taught paradigm', () => {
    // The composition check above, applied across the whole verb inventory: a
    // paradigm the course teaches but cannot turn into an exercise is a dead end.
    const dead: string[] = [];
    for (const concept of verbFormConcepts) {
      const lessonId = getLessonThatIntroduces(concept.id);
      if (!lessonId) continue;
      const learner = introduce(makeLearner(), lessonId);
      const found = [7, 13, 29].some((seed) => {
        const plan = buildLessonSession(lessonId, { learner, seed });
        return plan?.exercises.some((e) => e.conceptIds.includes(concept.id));
      });
      if (!found) dead.push(concept.id);
    }
    expect(dead).toEqual([]);
  });

  it('practises compound and reflexive paradigms inside a sentence, not only as a table', () => {
    /**
     * These were the paradigms the old scan could never place in a sentence: a
     * multi-word form ("he comido", "me levanto") matches no single token, so
     * every present perfect and every reflexive silently fell back to the bare
     * conjugation table. The corpus index blanks the token that carries the
     * person instead, which is what makes them practisable at all.
     */
    const compound = verbFormConcepts.filter((c) => c.tense === 'presentPerfect');
    expect(compound.length).toBeGreaterThan(5);

    const supported = compound.filter((c) => (paradigmUsage(c.id)?.sentenceIds.length ?? 0) > 0);
    expect(supported.length).toBe(compound.length);

    const reflexive = verbFormConcepts.filter((c) => c.verbId.endsWith('se'));
    expect(reflexive.length).toBeGreaterThan(0);
    for (const concept of reflexive) {
      expect(paradigmUsage(concept.id)?.sentenceIds.length ?? 0).toBeGreaterThan(0);
    }
  });
});

/**
 * The two moods that were declared and never carried.
 *
 * These walk the same chain as the test above, but they are the reason the
 * chain is worth walking twice: the conjugation engine, the corpus index, the
 * generator and the curriculum all had to change together, and any one of them
 * reverting alone leaves a subjunctive that is taught but unpractisable, or an
 * imperative that asks the learner to produce a form Spanish does not have.
 */
describe('subjunctive and imperative pathways', () => {
  const answerOf = (exercise: { form: string; answerIndex?: number; accepted?: string[] }) =>
    exercise.form === 'choice'
      ? String(exercise.answerIndex)
      : exercise.form === 'typed'
        ? exercise.accepted![0]
        : null;

  it('carries a subjunctive paradigm from lesson to graded exercise', () => {
    const conceptId = verbFormConceptId('tener', 'presentSubjunctive');
    expect(paradigmUsage(conceptId)!.sentenceIds.length).toBeGreaterThan(1);

    const lessonId = getLessonThatIntroduces(conceptId);
    expect(lessonId).toBeTruthy();

    let learner = makeLearner();
    expect(hasMetVerbTense('tener', 'presentSubjunctive', learner)).toBe(false);
    learner = introduce(learner, lessonId!);
    expect(metVerbTenses('tener', learner)).toContain('presentSubjunctive');

    const plan = buildLessonSession(lessonId!, { learner, seed: 7 });
    const exercise = plan!.exercises.find((e) => e.conceptIds.includes(conceptId));
    expect(exercise).toBeDefined();
    const answer = answerOf(exercise!);
    expect(checkExercise(exercise!, answer!, DEFAULT_SETTINGS_FOR_TEST).grade).toBe('correct');
  });

  it('never asks for a first-person singular imperative', () => {
    /**
     * The imperative has no `yo`. The generator used to fall back to
     * `pick([...PERSONS]) ?? 'yo'`, which for this paradigm would have asked the
     * learner to produce a form that does not exist — and, because `forms` was
     * typed as total, would have rendered `undefined` rather than failing.
     */
    const imperatives = verbFormConcepts.filter((c) => c.id.endsWith('.imperative'));
    expect(imperatives.length).toBeGreaterThan(0);

    for (const concept of imperatives) {
      const lessonId = getLessonThatIntroduces(concept.id);
      expect(lessonId).toBeTruthy();
      const learner = introduce(makeLearner(), lessonId!);
      for (let seed = 0; seed < 12; seed += 1) {
        const plan = buildLessonSession(lessonId!, { learner, seed });
        for (const exercise of plan?.exercises ?? []) {
          if (!exercise.conceptIds.includes(concept.id)) continue;
          // Only what the exercise *asks*. A verb's irregularity note may
          // mention its yo form ("irregular yo form (tengo)") without the
          // exercise ever requesting one.
          const asked = exercise as { instruction?: string; prompt?: string };
          const text = `${asked.instruction ?? ''} ${asked.prompt ?? ''}`;
          expect(text).not.toMatch(/\byo\b/);
          expect(text).not.toContain('undefined');
        }
      }
    }
  });

  it('teaches every imperative and subjunctive paradigm it derives', () => {
    // A paradigm no lesson introduces never enters a learner's state, so it is
    // derived, invisible and dead — the exact shape of the original defect.
    const stranded = verbFormConcepts
      .filter((c) => c.id.endsWith('.imperative') || c.id.endsWith('.presentSubjunctive'))
      .filter((c) => !getLessonThatIntroduces(c.id))
      .map((c) => c.id);
    expect(stranded).toEqual([]);
  });

  it('supports every imperative with five persons of corpus evidence', () => {
    // Five, not six: the missing one is `yo`, and it is missing on purpose.
    const thin = verbFormConcepts
      .filter((c) => c.id.endsWith('.imperative'))
      .map((c) => ({ id: c.id, covered: paradigmUsage(c.id)?.personsCovered ?? 0 }))
      .filter((row) => row.covered < 5);
    expect(thin).toEqual([]);
  });
});
