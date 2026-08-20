import { getSentence, getSentencesForConcept, vocabConcepts } from '@/content';
import { conceptsCovering, sentenceLexis, unknownWords } from '@/content/lexicon';
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

/**
 * Text made of words no concept in the course covers, so the *word* gate stays
 * neutral and these cases test the concept rule on its own.
 *
 * This matters more than it looks. The fixture used to read "Hola.", which the
 * lexicon covers via `v.hola` — a concept none of these fictional learners
 * knows — so every one of these assertions would have been decided by an
 * unknown word rather than by the rule it names. Two gates in one function need
 * fixtures that isolate each of them; the word gate has its own describe block
 * below, with real sentences.
 */
const sentence = (over: Partial<Sentence> = {}): Sentence => ({
  id: 's.test',
  es: 'Qqq wwwx zzzk.',
  en: 'Placeholder.',
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
    // At the ceiling, one unknown concept is comprehensible input.
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.x'], level: 'A1' }), 'listenComprehend', known, ['v.a']),
    ).toBe(true);
    // A level above, only a sentence made entirely of known material qualifies.
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.b'], level: 'A2' }), 'listenComprehend', known, ['v.a']),
    ).toBe(true);
    expect(
      sentenceEligible(sentence({ concepts: ['v.a', 'v.x'], level: 'A2' }), 'listenComprehend', known, ['v.a']),
    ).toBe(false);
  });

  it('refuses production above the ceiling even when every concept is known', () => {
    const s = sentence({ concepts: ['v.a'], level: 'B1' });
    expect(sentenceEligible(s, 'translateToEs', known, ['v.a'])).toBe(false);
    // One level of headroom for input, and no more.
    expect(sentenceEligible(sentence({ concepts: ['v.a'], level: 'A2' }), 'listenComprehend', known, ['v.a'])).toBe(true);
    expect(sentenceEligible(s, 'listenComprehend', known, ['v.a'])).toBe(false);
  });

  /**
   * Typing the English is a comprehension exercise, and comprehension is not
   * the easy direction — the learner has to have understood every word to
   * render the line at all. So it gets the vocabulary room of a guided exercise
   * and none of the level headroom that multiple-choice input enjoys, where the
   * options themselves carry an unread word.
   */
  it('gives free English translation no level headroom, unlike scaffolded input', () => {
    const above = sentence({ concepts: ['v.a'], level: 'A2' });
    expect(sentenceEligible(above, 'listenComprehend', known, ['v.a'])).toBe(true);
    expect(sentenceEligible(above, 'translateToEn', known, ['v.a'])).toBe(false);
    // At the ceiling it is available again — the restriction is the stretch,
    // not the kind.
    const at = sentence({ concepts: ['v.a'], level: 'A1' });
    expect(sentenceEligible(at, 'translateToEn', known, ['v.a'])).toBe(true);
  });

  it('preserves spiral reuse — an old concept is eligible forever', () => {
    // Every concept known, sentence at the ceiling: nothing about *when* it was
    // taught may exclude it.
    const s = sentence({ concepts: ['v.a', 'v.b', 'v.c', 'v.d'], level: 'A1' });
    expect(sentenceEligible(s, 'translateToEs', known)).toBe(true);
    expect(sentenceEligible(s, 'buildResponse', known)).toBe(true);
  });
});

/**
 * The gate the tag list cannot provide.
 *
 * Every case here uses a *real* sentence, because the whole point is that the
 * declared concepts under-report what the sentence asks for. A synthetic
 * fixture would have to state the gap it is meant to detect, which is the one
 * thing the real corpus does for free.
 */
describe('unknown words, not merely unknown tags', () => {
  const OFFENDER = 's.m105';

  it('counts the words a sentence contains, not the ones it declares', () => {
    const found = getSentence(OFFENDER)!;
    // Three tags, six content words: the shortfall is the bug.
    expect(found.concepts).toHaveLength(2);
    const lexis = sentenceLexis(found);
    expect(lexis.words).toEqual(
      expect.arrayContaining(['vecinos', 'visto', 'partido', 'bar', 'abajo']),
    );
  });

  it('refuses free production of a sentence whose untagged words are unknown', () => {
    /**
     * A learner given every concept the sentence *declares* — so the tag gate
     * is fully satisfied and reports nothing — plus a B2 ceiling, so the level
     * gate is satisfied too. Both of the old gates pass. The sentence is still
     * unaskable, because `partido` is a word nobody has taught them.
     */
    const declared: Knowledge = { known: new Set(['v.ver', 'g.present-perfect']), ceiling: 'B2' };
    const found = getSentence(OFFENDER)!;

    expect(unknownConcepts(found, declared)).toHaveLength(0);
    expect(unknownWords(found, declared.known)).toContain('partido');

    for (const kind of ['translateToEs', 'wordBank', 'dictation', 'speak'] as ExerciseKind[]) {
      expect(sentenceEligible(found, kind, declared)).toBe(false);
    }
  });

  it('accepts the same sentence once those words have been taught', () => {
    const found = getSentence(OFFENDER)!;
    const missing = unknownWords(found, new Set(['v.ver', 'g.present-perfect']));
    const covering = missing.flatMap(conceptsCovering);
    const full: Knowledge = {
      known: new Set(['v.ver', 'g.present-perfect', ...covering]),
      ceiling: 'B2',
    };
    expect(unknownWords(found, full.known)).toHaveLength(0);
    expect(sentenceEligible(found, 'translateToEs', full)).toBe(true);
  });

  it('never counts function words or words the course does not track', () => {
    const found = getSentence(OFFENDER)!;
    const lexis = sentenceLexis(found);
    // Structural words are learned by exposure and arrive in lesson one.
    expect(lexis.words).not.toContain('el');
    expect(lexis.words).not.toContain('en');
    // "vecinos" has no concept anywhere in this course, so refusing every
    // sentence containing it would measure the vocabulary files, not the
    // learner. It is reported to the audit instead.
    expect(lexis.untracked).toContain('vecinos');
    expect(unknownWords(found, new Set())).not.toContain('vecinos');
  });

  it('reads an inflected form through its headword', () => {
    // Knowing `ver` is enough to read "visto" — the paradigm is a separate
    // question, asked separately.
    expect(conceptsCovering('visto')).toContain('v.ver');
    expect(conceptsCovering('viendo')).toContain('v.ver');
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
  it('classifies typing English as comprehension and assembling Spanish as output', () => {
    expect(KIND_DEMAND.translateToEn).toBe('comprehension');
    expect(KIND_DEMAND.wordBank).toBe('output');
    expect(KIND_DEMAND.translateToEs).toBe('output');
    // Choosing from options is the scaffolded end — that is what earns the
    // extra room, not the language the answer happens to be in.
    expect(KIND_DEMAND.listenComprehend).toBe('input');
  });
});
