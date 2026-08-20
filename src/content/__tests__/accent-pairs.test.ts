import { ACCENT_AMBIGUOUS, accentCarriesMeaning } from '@/content/accent-pairs';

describe('accent-pairs', () => {
  it('flags the diacritical pairs, where the accent is the whole distinction', () => {
    for (const word of ['que', 'el', 'si', 'mi', 'se', 'te', 'de', 'como', 'donde', 'cuando'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags demonstrative against verb', () => {
    for (const word of ['esta', 'estas', 'este']) expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags present yo against preterite él — the reported case', () => {
    for (const word of ['hablo', 'trabajo', 'cambio', 'llego', 'paso'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags subjunctive against preterite yo', () => {
    for (const word of ['hable', 'llegue', 'quede', 'deje'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('leaves ordinary orthography alone, which is the half that matters most', () => {
    // Every one of these is a word a learner will type without the diacritic on
    // a phone, and every one of them is unambiguous. Downgrading them would be
    // the feature doing more harm than the bug it fixes.
    for (const word of ['cafe', 'anos', 'espanol', 'manana', 'nino', 'jardin', 'opinion', 'comeis'])
      expect(accentCarriesMeaning(word)).toBe(false);
  });

  it('is keyed by the deaccented form, so it answers for either spelling', () => {
    expect(accentCarriesMeaning('está')).toBe(true);
    expect(accentCarriesMeaning('ESTA')).toBe(true);
    expect(accentCarriesMeaning('café')).toBe(false);
  });

  it('derives a set of a plausible size — a collapse to zero is a broken walk', () => {
    expect(ACCENT_AMBIGUOUS.size).toBeGreaterThan(40);
    expect(ACCENT_AMBIGUOUS.size).toBeLessThan(200);
  });

  it('never contains a group built from a single spelling', () => {
    // The set stores deaccented keys; a key only earns its place when two
    // distinct surface forms collapse onto it.
    for (const key of ACCENT_AMBIGUOUS) expect(key).toBe(key.normalize('NFD').replace(/[̀-ͯ]/g, ''));
  });
});
