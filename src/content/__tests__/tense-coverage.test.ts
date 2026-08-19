import { readFileSync } from 'node:fs';

import { verbs } from '@/content';
import { TENSE_LABELS, type Person, type TenseId } from '@/content/types';
import { buildVerb, personsWithForms, type VerbSeed } from '@/content/verb-utils';

/**
 * That every tense the type declares is actually carried by the course, and
 * that a tense the engine cannot build fails loudly instead of quietly
 * producing a different tense.
 *
 * Both halves come from the same defect. `TenseId` declared eight tenses;
 * `presentSubjunctive` and `imperative` had no paradigm on any verb, so they
 * were absent from the coverage percentage's numerator *and* denominator —
 * the audit reported "134 of 134 paradigms taught (100%)" and was telling the
 * truth about the wrong set. Meanwhile `buildVerb`'s `default:` branch handled
 * both by falling through to present-indicative endings, so the first verb to
 * declare a subjunctive would have been handed "hablo, hablas, habla" and the
 * course would have taught the indicative under a subjunctive label.
 *
 * A percentage computed over the rows that exist can never report an empty
 * category. These tests are computed over the *declared domain* instead.
 */

/** Tenses knowingly left unconjugated. Must match audit.ts's own list. */
const DELIBERATELY_UNCONJUGATED: Partial<Record<TenseId, string>> = {};

const seed = (over: Partial<VerbSeed> = {}): VerbSeed => ({
  id: 'test',
  infinitive: 'hablar',
  en: 'to speak',
  level: 'A1',
  tenses: ['present'],
  ...over,
});

describe('declared tenses are carried', () => {
  it('gives every declared TenseId real paradigms, or an explicit exception', () => {
    const counted = new Map<TenseId, number>();
    for (const verb of verbs) {
      for (const tense of Object.keys(verb.tenses) as TenseId[]) {
        counted.set(tense, (counted.get(tense) ?? 0) + 1);
      }
    }
    const uncarried = (Object.keys(TENSE_LABELS) as TenseId[])
      .filter((tense) => (counted.get(tense) ?? 0) === 0)
      .filter((tense) => !DELIBERATELY_UNCONJUGATED[tense]);
    expect(uncarried).toEqual([]);
  });

  it('keeps the audit’s exception list and this one in step', () => {
    // Both lists being empty is the healthy state; if one gains an entry and
    // the other does not, the audit and the test disagree about what is fine.
    const auditSource = readFileSync('src/content/audit.ts', 'utf8');
    const declaredHere = Object.keys(DELIBERATELY_UNCONJUGATED);
    for (const tense of declaredHere) expect(auditSource).toContain(tense);
    expect(auditSource).toContain('DELIBERATELY_UNCONJUGATED');
  });
});

describe('a tense the engine cannot build fails loudly', () => {
  /**
   * The regression that matters most. Before the fix this call returned
   * present-indicative forms and no error, which is worse than a crash: the
   * app would have shipped and taught the wrong mood.
   */
  it('refuses an unknown tense instead of falling through to the present', () => {
    const bogus = 'pluperfectSubjunctive' as TenseId;
    expect(() => buildVerb(seed({ tenses: ['present', bogus] }))).toThrow(
      /No conjugation rule for tense/,
    );
  });

  it('refuses a subjunctive it cannot derive rather than inventing one', () => {
    // ser's yo form is "soy"; stripping a final -o gives nothing usable, and
    // guessing would produce "soya".
    const ser = seed({
      id: 'ser-test',
      infinitive: 'ser',
      tenses: ['present', 'presentSubjunctive'],
      overrides: { present: { yo: 'soy' } },
    });
    expect(() => buildVerb(ser)).toThrow(/Cannot derive the present subjunctive/);
  });

  it('refuses a reflexive imperative, whose pronoun does not go in front', () => {
    const levantarse = seed({
      id: 'levantarse-test',
      infinitive: 'levantarse',
      reflexive: true,
      tenses: ['present', 'imperative'],
    });
    expect(() => buildVerb(levantarse)).toThrow(/pronoun attaches to the end/);
  });

  it('accepts the same subjunctive once the override is supplied', () => {
    const ser = seed({
      id: 'ser-test',
      infinitive: 'ser',
      tenses: ['present', 'presentSubjunctive'],
      overrides: {
        present: { yo: 'soy' },
        presentSubjunctive: {
          yo: 'sea', tu: 'seas', el: 'sea', nosotros: 'seamos', vosotros: 'seáis', ellos: 'sean',
        },
      },
    });
    expect(buildVerb(ser).tenses.presentSubjunctive?.forms.nosotros).toBe('seamos');
  });
});

describe('the derived paradigms are real Spanish', () => {
  /**
   * The subjunctive stem is the present-tense yo form minus its -o. Checking a
   * regular verb only would pass with a naive "infinitive stem" rule too, so
   * every case here is a verb where the two rules disagree.
   */
  it.each([
    ['tener', 'tenga', 'tengamos'],
    ['decir', 'diga', 'digamos'],
    ['salir', 'salga', 'salgamos'],
    ['poner', 'ponga', 'pongamos'],
    ['hacer', 'haga', 'hagamos'],
  ])('builds %s’s subjunctive from its yo form, not its infinitive', (id, yo, nosotros) => {
    const forms = verbs.find((v) => v.id === id)!.tenses.presentSubjunctive!.forms;
    expect(forms.yo).toBe(yo);
    expect(forms.nosotros).toBe(nosotros);
  });

  it('reverts -ar and -er stem changes in nosotros and vosotros', () => {
    const querer = verbs.find((v) => v.id === 'querer')!.tenses.presentSubjunctive!.forms;
    expect(querer.yo).toBe('quiera');
    expect(querer.nosotros).toBe('queramos');
    expect(querer.vosotros).toBe('queráis');
  });

  it('respells -gar so the stem keeps its sound', () => {
    const pagar = buildVerb(
      seed({ id: 'pagar-t', infinitive: 'pagar', tenses: ['present', 'presentSubjunctive'] }),
    );
    expect(pagar.tenses.presentSubjunctive?.forms.yo).toBe('pague');
  });

  it('builds the imperative from three different sources', () => {
    const decir = verbs.find((v) => v.id === 'decir')!.tenses.imperative!.forms;
    expect(decir.tu).toBe('di'); // one of the eight irregulars
    expect(decir.vosotros).toBe('decid'); // infinitive, -r → -d
    expect(decir.el).toBe('diga'); // borrowed from the subjunctive
  });

  it('gives ir the nosotros command people actually say', () => {
    expect(verbs.find((v) => v.id === 'ir')!.tenses.imperative!.forms.nosotros).toBe('vamos');
  });

  /**
   * The imperative has no first-person singular. Typing `forms` as total made
   * that gap a `string` that was really `undefined`, so the paradigm looked
   * complete to the compiler and broke at the call site instead.
   */
  it('has no yo in any imperative, and a yo everywhere else', () => {
    for (const verb of verbs) {
      for (const [tense, conjugation] of Object.entries(verb.tenses)) {
        const persons = personsWithForms(conjugation);
        if (tense === 'imperative') {
          expect(persons).not.toContain('yo');
          expect(persons).toHaveLength(5);
        } else {
          expect(persons).toHaveLength(6);
        }
      }
    }
  });

  it('never emits an empty or whitespace-only form', () => {
    const bad: string[] = [];
    for (const verb of verbs) {
      for (const [tense, conjugation] of Object.entries(verb.tenses)) {
        for (const person of personsWithForms(conjugation)) {
          const form = conjugation.forms[person as Person]!;
          if (form.trim().length === 0) bad.push(`${verb.id}.${tense}.${person}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
