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

  it('never merges "would like" into the "want" class', () => {
    // "would like" is the polite conditional register (quisiera / me
    // gustaría), and "want" is the direct present (quiero) — a contrast the
    // course teaches on purpose (p.quisiera glosses "I would like…"; s.a27's
    // note names the conditional as the polite, hypothetical form). Folding
    // them together would let "I want" pass for a concept taught specifically
    // as the polite form: a mood error, not a wording one.
    const wantClass = EN_WORD_CLASSES.find((group) => group.includes('want'));
    expect(wantClass).toBeDefined();
    expect(wantClass).not.toContain('would like');
  });

  it('never puts "not at all" in the courtesy-phrase group', () => {
    // Every other member of this group is idiomatically positive despite its
    // surface negation. "not at all" is not: it also renders "para nada"
    // answering a yes/no question ("¿Te gusta?" -> "Not at all"), a literal
    // negative-degree answer rather than courtesy. Grouping it with "my
    // pleasure" would let a meaning-opposite phrase pass as equivalent.
    const courtesyGroup = EN_PHRASE_GROUPS.find((group) => group.includes('you are welcome'));
    expect(courtesyGroup).toBeDefined();
    expect(courtesyGroup).not.toContain('not at all');
  });
});
