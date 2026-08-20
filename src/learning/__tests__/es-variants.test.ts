import { spanishVariants } from '@/learning/es-variants';

const has = (input: string, expected: string) =>
  expect(spanishVariants(input)).toContain(expected);

describe('spanishVariants', () => {
  it('always includes the input itself', () => {
    has('tengo un perro', 'tengo un perro');
  });

  it('contracts and expands al', () => {
    has('voy al cine', 'voy a el cine');
    has('voy a el cine', 'voy al cine');
  });

  it('contracts and expands del', () => {
    has('la casa del profesor', 'la casa de el profesor');
    has('la casa de el profesor', 'la casa del profesor');
  });

  it('climbs a clitic off an infinitive', () => {
    has('quiero verte', 'te quiero ver');
    has('voy a comprarlo', 'lo voy a comprar');
  });

  it('lowers a climbed clitic back onto the infinitive', () => {
    has('te quiero ver', 'quiero verte');
  });

  it('does not climb off a word that merely ends in ar, er or ir', () => {
    // "lugar" ends in -ar and "se" is not attached to it; nothing may move.
    expect(spanishVariants('busco un lugar')).toEqual(['busco un lugar']);
    expect(spanishVariants('el mar')).toEqual(['el mar']);
  });

  it('does not invent a variant where the pattern does not appear', () => {
    expect(spanishVariants('hola que tal')).toEqual(['hola que tal']);
  });

  it('never returns duplicates', () => {
    const out = spanishVariants('voy al cine');
    expect(new Set(out).size).toBe(out.length);
  });

  it('does not climb a clitic across "en" — pensar en, quedar en do not license it', () => {
    // "te pienso en ver" is not grammatical Spanish; "a", "de" and "que" are
    // genuine periphrasis links but "en" is not one of them.
    expect(spanishVariants('pienso en verte')).not.toContain('te pienso en ver');
  });
});
