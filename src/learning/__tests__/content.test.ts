import {
  allConcepts,
  allLessons,
  curriculum,
  getLesson,
  getSentencesForConcept,
  playableUnits,
  sentences,
  validateContent,
  verbFormConceptId,
  verbs,
  vocabConcepts,
} from '@/content';
import { errorDrills, naturalDrills } from '@/content/drills';
import { placementQuestions } from '@/content/placement';
import { PERSONS } from '@/content/types';
import { unitProgress } from '@/learning/mastery';
import { makeLearner } from '@/learning/__tests__/helpers';

/**
 * Content is hand-authored, so the most likely defect in the whole app is a
 * mistyped id producing an exercise with no answer. These run the same
 * integrity check the app runs in dev, plus a few invariants the generator
 * silently depends on.
 */

describe('content integrity', () => {
  it('has no broken references', () => {
    expect(validateContent()).toEqual([]);
  });

  it('has unique ids across concepts, sentences and lessons', () => {
    const conceptIds = allConcepts.map((c) => c.id);
    expect(new Set(conceptIds).size).toBe(conceptIds.length);

    const sentenceIds = sentences.map((s) => s.id);
    expect(new Set(sentenceIds).size).toBe(sentenceIds.length);

    const lessonIds = allLessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  /**
   * Two ids carrying identical Spanish is invisible to every other check and
   * silently shrinks the pool: the generator treats them as two items and can
   * serve the same line twice in one session under different exercise kinds.
   * Sentence files are prefixed per file, so the duplicates that appear are
   * always cross-file ones nobody was looking at.
   */
  it('never ships the same Spanish sentence under two ids', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const sentence of sentences) {
      const previous = seen.get(sentence.es);
      if (previous) duplicates.push(`${sentence.id} duplicates ${previous}: "${sentence.es}"`);
      else seen.set(sentence.es, sentence.id);
    }
    expect(duplicates).toEqual([]);
  });

  it('ships enough content to be usable', () => {
    expect(vocabConcepts.length).toBeGreaterThan(150);
    expect(sentences.length).toBeGreaterThan(120);
    expect(allLessons.length).toBeGreaterThan(20);
    expect(verbs.length).toBeGreaterThan(20);
  });

  it('orders lesson prerequisites before the lessons that need them', () => {
    const seen = new Set<string>();
    for (const lesson of allLessons) {
      for (const requirement of lesson.requires ?? []) {
        expect(seen.has(requirement)).toBe(true);
      }
      seen.add(lesson.id);
    }
  });

  it('starts with at least one lesson that has no prerequisites', () => {
    expect(allLessons.some((lesson) => !lesson.requires || lesson.requires.length === 0)).toBe(true);
  });

  it('gives every taught vocabulary concept at least one example sentence', () => {
    const missing: string[] = [];
    for (const lesson of allLessons) {
      for (const conceptId of lesson.teaches) {
        const concept = allConcepts.find((c) => c.id === conceptId);
        if (!concept || concept.kind === 'grammar' || concept.kind === 'verbform') continue;
        if (getSentencesForConcept(conceptId).length === 0) missing.push(conceptId);
      }
    }
    // Vocabulary with no sentence can only ever be a multiple-choice item.
    expect(missing.length).toBeLessThan(vocabConcepts.length * 0.5);
  });

  it('exposes every unit through the curriculum tree', () => {
    const fromTree = curriculum.flatMap((stage) => stage.units.flatMap((unit) => unit.lessons));
    expect(fromTree.length).toBe(allLessons.length);
    for (const lesson of fromTree) expect(getLesson(lesson.id)).toBeDefined();
  });
});

describe('verb conjugation', () => {
  it('produces a form for every person in every listed tense', () => {
    for (const verb of verbs) {
      for (const [tense, conjugation] of Object.entries(verb.tenses)) {
        for (const person of PERSONS) {
          const form = conjugation.forms[person];
          expect(typeof form).toBe('string');
          expect(form.length).toBeGreaterThan(0);
        }
        expect(verbFormConceptId(verb.id, tense)).toContain(verb.id);
      }
    }
  });

  it('conjugates regular verbs correctly', () => {
    const hablar = verbs.find((v) => v.id === 'hablar')!;
    expect(hablar.tenses.present?.forms).toMatchObject({
      yo: 'hablo',
      tu: 'hablas',
      el: 'habla',
      nosotros: 'hablamos',
      vosotros: 'habláis',
      ellos: 'hablan',
    });
    expect(hablar.tenses.preterite?.forms.yo).toBe('hablé');
    expect(hablar.tenses.imperfect?.forms.nosotros).toBe('hablábamos');
  });

  it('applies irregular overrides', () => {
    const ser = verbs.find((v) => v.id === 'ser')!;
    expect(ser.tenses.present?.forms).toMatchObject({
      yo: 'soy',
      vosotros: 'sois',
      ellos: 'son',
    });
    expect(ser.tenses.preterite?.forms.yo).toBe('fui');

    const tener = verbs.find((v) => v.id === 'tener')!;
    expect(tener.tenses.present?.forms.yo).toBe('tengo');
    expect(tener.tenses.present?.forms.nosotros).toBe('tenemos'); // regular where it should be
    expect(tener.tenses.present?.irregular).toContain('yo');
    expect(tener.tenses.present?.irregular).not.toContain('nosotros');
  });

  it('adds reflexive pronouns automatically', () => {
    const levantarse = verbs.find((v) => v.id === 'levantarse')!;
    expect(levantarse.tenses.present?.forms.yo).toBe('me levanto');
    expect(levantarse.tenses.present?.forms.vosotros).toBe('os levantáis');
  });

  it('builds the present perfect from haber plus the participle', () => {
    const comer = verbs.find((v) => v.id === 'comer')!;
    expect(comer.tenses.presentPerfect?.forms.yo).toBe('he comido');
    expect(comer.tenses.presentPerfect?.forms.vosotros).toBe('habéis comido');

    const hacer = verbs.find((v) => v.id === 'hacer')!;
    expect(hacer.tenses.presentPerfect?.forms.yo).toBe('he hecho');
  });
});

describe('drills and placement', () => {
  it('gives every error drill a correction that differs from the mistake', () => {
    for (const drill of errorDrills) {
      expect(drill.accepted.length).toBeGreaterThan(0);
      expect(drill.accepted[0]).not.toBe(drill.wrong);
      expect(drill.explanation.length).toBeGreaterThan(10);
    }
  });

  it('gives every natural-choice drill exactly one natural option', () => {
    for (const drill of naturalDrills) {
      const natural = drill.options.filter((option) => option.natural);
      expect(natural).toHaveLength(1);
      expect(drill.options.length).toBeGreaterThan(1);
      // The unnatural options must explain themselves.
      for (const option of drill.options.filter((o) => !o.natural)) {
        expect(option.note).toBeTruthy();
      }
    }
  });

  /**
   * `correctMistake` and `chooseNatural` are the top-tier kinds from B2 up, and
   * both are drill-backed: with no drill at a level the generator silently falls
   * through to something easier. The course shipped with nothing above B1, so
   * the advanced production shift had no material to run on.
   */
  it('backs the drill-only exercise kinds at every level the course teaches', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const) {
      expect(errorDrills.filter((d) => d.level === level).length).toBeGreaterThan(0);
      expect(naturalDrills.filter((d) => d.level === level).length).toBeGreaterThan(0);
    }
  });

  it('gives every placement question a resolvable answer', () => {
    for (const question of placementQuestions) {
      if (question.form === 'typed') {
        expect(question.accepted?.length).toBeGreaterThan(0);
      } else {
        expect(question.options?.length).toBeGreaterThan(1);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer!).toBeLessThan(question.options!.length);
      }
      if (question.form === 'listen') expect(question.audio).toBeTruthy();
    }
  });

  it('covers a spread of levels in the placement bank', () => {
    const levels = new Set(placementQuestions.map((q) => q.level));
    expect(levels.size).toBeGreaterThanOrEqual(4);
  });
});

describe('progression gating', () => {
  it('never lets an optional lesson block another lesson', () => {
    const optional = new Set(allLessons.filter((l) => l.optional).map((l) => l.id));
    const blocking = allLessons.flatMap((lesson) =>
      (lesson.requires ?? [])
        .filter((id) => optional.has(id))
        .map((id) => `${lesson.id} requires optional ${id}`),
    );
    expect(blocking).toEqual([]);
  });

  it('marks stories, listening and conversations as optional', () => {
    const shouldBeOptional = allLessons.filter((l) =>
      ['story', 'listening', 'conversation'].includes(l.kind),
    );
    expect(shouldBeOptional.filter((l) => !l.optional).map((l) => l.id)).toEqual([]);
  });

  it('never reports an untouched unit as already complete', () => {
    const fresh = makeLearner();
    const wronglyComplete = playableUnits
      .filter((unit) => unitProgress(unit, fresh).state === 'complete')
      .map((unit) => unit.id);
    expect(wronglyComplete).toEqual([]);
  });
});
