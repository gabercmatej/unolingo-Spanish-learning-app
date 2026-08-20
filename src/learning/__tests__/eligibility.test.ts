import { getSentence, getSentencesForConcept, vocabConcepts } from '@/content';
import type { Sentence } from '@/content/types';
import { makeLearner } from '@/learning/__tests__/helpers';
import {
  KIND_DEMAND,
  eligibleSentences,
  knowledgeOf,
  productionCeiling,
  sentenceEligible,
  unknownConcepts,
  type Knowledge,
} from '@/learning/eligibility';
import { createConceptState } from '@/learning/srs';
import type { ExerciseKind, LearnerState } from '@/learning/types';

const NOW = Date.UTC(2026, 0, 1);

function learnerKnowing(ids: string[], overrides: Partial<LearnerState> = {}): LearnerState {
  const concepts: LearnerState['concepts'] = {};
  for (const id of ids) {
    concepts[id] = { ...createConceptState(id, NOW), introduced: true, timesSeen: 2 };
  }
  return makeLearner({ concepts, ...overrides });
}

function knowledge(ids: string[], overrides: Partial<LearnerState> = {}): Knowledge {
  return knowledgeOf(learnerKnowing(ids, overrides));
}

/**
 * A knowledge set stated outright, for the unit tests of the rule itself.
 * `knowledge()` derives the ceiling from real course concepts, which is right
 * for the integration cases above and unhelpful here, where the concept ids are
 * deliberately fictional so the rule is tested and not the content.
 */
function at(ceiling: Knowledge['ceiling'], ids: string[]): Knowledge {
  return { known: new Set(ids), ceiling };
}

const sentence = (over: Partial<Sentence> = {}): Sentence => ({
  id: 's.test',
  es: 'Hola.',
  en: 'Hello.',
  concepts: ['v.hola'],
  level: 'A1',
  topics: ['greetings'],
  ...over,
});

/** A learner a couple of units in: enough A1 behind them to have a real ceiling. */
function earlyA1Learner(extra: string[] = []): Knowledge {
  const a1 = vocabConcepts.filter((c) => c.level === 'A1').slice(0, 20).map((c) => c.id);
  return knowledge([...a1, ...extra]);
}

describe('the untaught-production bug', () => {
  /**
   * The sentence that started this. It is tagged `v.amigo` — taught in the
   * first greetings unit — and contains no "amigo" at all. Before the
   * eligibility gate, any practice touching `v.amigo` could pick it out of the
   * pool and ask for it in Spanish.
   */
  const OFFENDER = 's.m105';

  it('no longer carries the tag that put it in reach', () => {
    // The content half of the fix: the sentence is about neighbours and was
    // tagged with the word for friend, which is what put an A2 present-perfect
    // line into the pool of a word taught in the first Family unit.
    const found = getSentence(OFFENDER);
    expect(found).toBeDefined();
    expect(found!.concepts).not.toContain('v.amigo');
    expect(getSentencesForConcept('v.amigo').map((s) => s.id)).not.toContain(OFFENDER);
  });

  it('would still be refused if the tag came back', () => {
    /**
     * The mis-tag is fixed, and fixing one sentence is not a fix. This asserts
     * the *rule*: the same line, tagged the same wrong way, is still refused —
     * so a future mis-tag cannot reach the learner even before the audit
     * catches it.
     */
    const found = getSentence(OFFENDER)!;
    const asTagged = { ...found, concepts: [...found.concepts, 'v.amigo'] };
    const greetings = earlyA1Learner(['v.amigo']);

    for (const kind of ['translateToEs', 'wordBank', 'dictation', 'speak'] as ExerciseKind[]) {
      expect(sentenceEligible(asTagged, kind, greetings, ['v.amigo'])).toBe(false);
    }
    expect(sentenceEligible(asTagged, 'translateToEn', greetings, ['v.amigo'])).toBe(false);
  });

  it('is never offered as production to a learner who has not met its grammar', () => {
    const greetings = earlyA1Learner(['v.ver']);
    const found = getSentence(OFFENDER)!;
    expect(greetings.known.has('g.present-perfect')).toBe(false);

    for (const kind of ['translateToEs', 'wordBank', 'dictation', 'speak'] as ExerciseKind[]) {
      expect(sentenceEligible(found, kind, greetings, ['v.ver'])).toBe(false);
    }
  });

  it('is not offered for comprehension either', () => {
    // A level above the ceiling *and* an unmet concept: nothing qualifies it.
    const greetings = earlyA1Learner(['v.ver']);
    const pool = getSentencesForConcept('v.ver');
    const usable = eligibleSentences(pool, 'translateToEn', greetings, ['v.ver']);
    expect(usable.map((s) => s.id)).not.toContain(OFFENDER);
  });
});

describe('sentenceEligible', () => {
  const known = at('A1', ['v.a', 'v.b', 'v.c', 'v.d', 'v.e', 'v.f']);

  it('allows production when every supporting concept is introduced', () => {
    const s = sentence({ concepts: ['v.a', 'v.b'], level: 'A1' });
    expect(sentenceEligible(s, 'translateToEs', known, ['v.a'])).toBe(true);
  });

  it('refuses production with a single unknown supporting concept', () => {
    const s = sentence({ concepts: ['v.a', 'v.unknown'], level: 'A1' });
    expect(sentenceEligible(s, 'translateToEs', known, ['v.a'])).toBe(false);
    expect(sentenceEligible(s, 'wordBank', known, ['v.a'])).toBe(false);
  });

  it('allows one unknown in a guided exercise, where the sentence is on screen', () => {
    const s = sentence({ concepts: ['v.a', 'v.unknown'], level: 'A1' });
    expect(sentenceEligible(s, 'fillBlank', known, ['v.a'])).toBe(true);
    const two = sentence({ concepts: ['v.a', 'v.x', 'v.y'], level: 'A1' });
    expect(sentenceEligible(two, 'fillBlank', known, ['v.a'])).toBe(false);
  });

  it('allows controlled exposure through comprehension', () => {
    const s = sentence({ concepts: ['v.a', 'v.x'], level: 'A1' });
    expect(sentenceEligible(s, 'listenComprehend', known, ['v.a'])).toBe(true);
    expect(sentenceEligible(s, 'translateToEn', known, ['v.a'])).toBe(true);
    const two = sentence({ concepts: ['v.a', 'v.x', 'v.y'], level: 'A1' });
    expect(sentenceEligible(two, 'listenComprehend', known, ['v.a'])).toBe(false);
  });

  it('will stretch the level or the vocabulary, but never both at once', () => {
    // At the ceiling, one unknown word is comprehensible input.
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.x'], level: 'A1' }), 'translateToEn', known, ['v.a']),
    ).toBe(true);
    // A level above, only a sentence made entirely of known material qualifies.
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.b'], level: 'A2' }), 'translateToEn', known, ['v.a']),
    ).toBe(true);
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.x'], level: 'A2' }), 'translateToEn', known, ['v.a']),
    ).toBe(false);
  });

  it('refuses production above the ceiling even when every concept is known', () => {
    const s = sentence({ concepts: ['v.a'], level: 'B1' });
    expect(sentenceEligible(s, 'translateToEs', known, ['v.a'])).toBe(false);
    // One level of headroom for input, and no more.
    expect(sentenceEligible(sentence({ concepts: ['v.a'], level: 'A2' }), 'translateToEn', known, ['v.a'])).toBe(true);
    expect(sentenceEligible(s, 'translateToEn', known, ['v.a'])).toBe(false);
  });

  it('preserves spiral reuse — an old concept is eligible forever', () => {
    // Every concept known, sentence at the ceiling: nothing about *when* it was
    // taught may exclude it.
    const s = sentence({ concepts: ['v.a', 'v.b', 'v.c', 'v.d'], level: 'A1' });
    expect(sentenceEligible(s, 'translateToEs', known)).toBe(true);
    expect(sentenceEligible(s, 'buildResponse', known)).toBe(true);
  });
});

describe('productionCeiling', () => {
  it('starts at A0 for a learner who has met nothing', () => {
    expect(productionCeiling(makeLearner())).toBe('A0');
  });

  it('does not climb on a handful of stray concepts from a level', () => {
    // Two A2 words is a spiral appearance, not a foothold in A2.
    expect(productionCeiling(learnerKnowing(['v.piso', 'v.tiempo']))).toBe('A0');
  });

  it('climbs once a level has been met properly', () => {
    const a1 = vocabConcepts.filter((c) => c.level === 'A1').slice(0, 12).map((c) => c.id);
    expect(a1.length).toBeGreaterThanOrEqual(6);
    expect(productionCeiling(learnerKnowing(a1))).toBe('A1');
  });

  it('respects a placement result as a floor', () => {
    const placed = learnerKnowing([], {
      placement: {
        level: 'B1',
        label: 'B1',
        strengths: [],
        weaknesses: [],
        takenAt: NOW,
        startLesson: 'l.greetings',
      },
    });
    expect(productionCeiling(placed)).toBe('B1');
  });
});

describe('unknownConcepts', () => {
  it('never counts the concept the exercise is about', () => {
    const s = sentence({ concepts: ['v.target', 'v.known'] });
    const k = at('A1', ['v.known']);
    expect(unknownConcepts(s, k)).toEqual(['v.target']);
    expect(unknownConcepts(s, k, ['v.target'])).toEqual([]);
  });
});

describe('KIND_DEMAND', () => {
  it('classifies typing English as input and assembling Spanish as output', () => {
    expect(KIND_DEMAND.translateToEn).toBe('input');
    expect(KIND_DEMAND.wordBank).toBe('output');
    expect(KIND_DEMAND.translateToEs).toBe('output');
  });
});
