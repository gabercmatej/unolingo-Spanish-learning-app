import { EN_EQUIVALENCES, EN_PHRASE_GROUPS, EN_WORD_CLASSES } from '@/content/equivalences';
import type { Equivalences } from '@/learning/grading';

// The data must satisfy the consumer-side contract without content importing learning.
const _shapeCheck: Equivalences = EN_EQUIVALENCES;

describe('English equivalences', () => {
  it('satisfies the consumer-side Equivalences contract', () => {
    expect(_shapeCheck.word.size).toBeGreaterThan(0);
  });

  it('maps every member of a class to the same representative', () => {
    for (const group of EN_WORD_CLASSES) {
      const reps = new Set(group.map((word) => EN_EQUIVALENCES.word.get(word)));
      expect(reps.size).toBe(1);
      expect([...reps][0]).toBeDefined();
    }
  });

  it('never puts a word in two classes, which would make the mapping order-dependent', () => {
    const seen = new Set<string>();
    for (const group of EN_WORD_CLASSES) {
      for (const word of group) {
        expect(seen.has(word)).toBe(false);
        seen.add(word);
      }
    }
  });

  it('never puts a phrase in two groups', () => {
    const seen = new Set<string>();
    for (const group of EN_PHRASE_GROUPS) {
      for (const phrase of group) {
        expect(seen.has(phrase)).toBe(false);
        seen.add(phrase);
      }
    }
  });

  it('carries the reported greeting family', () => {
    const rep = EN_EQUIVALENCES.phrase.get('nice to meet you');
    expect(rep).toBeDefined();
    for (const phrase of ['pleased to meet you', 'delighted to meet you', 'lovely to meet you'])
      expect(EN_EQUIVALENCES.phrase.get(phrase)).toBe(rep);
  });

  it('stores phrases already normalised — lower case, no punctuation', () => {
    for (const phrase of EN_EQUIVALENCES.phrase.keys()) {
      expect(phrase).toBe(phrase.toLowerCase());
      expect(phrase).not.toMatch(/[.,!?;:'"]/);
      expect(phrase.trim()).toBe(phrase);
    }
  });

  it('keeps polarity out of the classes entirely', () => {
    // A class containing a negation word would let "not" be swapped for a
    // synonym and quietly defeat the polarity guard in answer-check.
    const polarity = ['not', 'no', 'never', 'none', 'nobody', 'nothing', 'without', 'cannot'];
    for (const group of EN_WORD_CLASSES)
      for (const word of group) expect(polarity).not.toContain(word);
  });
});
