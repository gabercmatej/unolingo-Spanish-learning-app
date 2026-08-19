import {
  PERSONS,
  type Conjugation,
  type ExampleLine,
  type Person,
  type TenseId,
  type Verb,
  type CefrLevel,
} from '@/content/types';

/**
 * Regular Spanish conjugation is fully mechanical, so it is generated rather
 * than typed out. Authors only supply the forms that actually deviate — which
 * means a new regular verb costs four lines and cannot contain a typo in the
 * predictable parts.
 */

type Group = 'ar' | 'er' | 'ir';

const PRESENT: Record<Group, string[]> = {
  ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
  er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
};

const PRETERITE: Record<Group, string[]> = {
  ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
  er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
};

const IMPERFECT: Record<Group, string[]> = {
  ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
  er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
};

/**
 * The subjunctive takes the "opposite" vowel: -ar verbs borrow the -er endings
 * and vice versa. That is the easy half. The hard half is the stem — see
 * `subjunctiveStem`.
 */
const PRESENT_SUBJUNCTIVE: Record<Group, string[]> = {
  ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
  er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
};

const FUTURE = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const CONDITIONAL = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const HABER = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

/**
 * The eight affirmative tú imperatives that are not simply the third-person
 * present. There are exactly eight in the language, so this list is complete
 * rather than a sample — anything not here follows the rule.
 */
const IMPERATIVE_TU_IRREGULAR: Record<string, string> = {
  decir: 'di',
  hacer: 'haz',
  ir: 've',
  poner: 'pon',
  salir: 'sal',
  ser: 'sé',
  tener: 'ten',
  venir: 'ven',
};

const REFLEXIVE_PRONOUNS: Record<Person, string> = {
  yo: 'me',
  tu: 'te',
  el: 'se',
  nosotros: 'nos',
  vosotros: 'os',
  ellos: 'se',
};

function fromEndings(stem: string, endings: string[]): Record<Person, string> {
  const out = {} as Record<Person, string>;
  PERSONS.forEach((person, index) => {
    out[person] = stem + endings[index];
  });
  return out;
}

/**
 * Spelling changes that keep the *sound* of the stem when the subjunctive vowel
 * flips. Only -ar verbs need them, because only they take endings in -e:
 * pagar → pague, buscar → busque, empezar → empiece. The -er/-ir equivalents
 * (coger → coja, seguir → siga, conducir → conduzca) fall out of the yo-form
 * rule for free and need nothing here.
 */
function respell(stem: string, group: Group): string {
  if (group !== 'ar') return stem;
  if (stem.endsWith('c')) return `${stem.slice(0, -1)}qu`;
  if (stem.endsWith('g')) return `${stem}u`;
  if (stem.endsWith('z')) return `${stem.slice(0, -1)}c`;
  return stem;
}

/**
 * The present subjunctive is built from the *yo form of the present
 * indicative*, minus its -o. This is not a mnemonic, it is the rule, and it is
 * why tengo → tenga, digo → diga, conozco → conozca and salgo → salga all come
 * out right without a single hand-written form.
 *
 * Where a verb's yo form does not end in -o, the rule has nothing to work with
 * — and those are exactly the six verbs whose subjunctive is genuinely
 * suppletive (soy → sea, estoy → esté, voy → vaya, sé → sepa, doy → dé). So the
 * precondition failing *is* the signal that an override is required, and we
 * throw rather than guess. Guessing here would produce "soya", which is a bean.
 */
function subjunctiveStem(presentYo: string, group: Group, infinitive: string): string {
  if (!presentYo.endsWith('o')) {
    throw new Error(
      `Cannot derive the present subjunctive of "${infinitive}": its present-tense yo form ` +
        `is "${presentYo}", which does not end in -o. Supply a complete ` +
        `overrides.presentSubjunctive for this verb.`,
    );
  }
  return respell(presentYo.slice(0, -1), group);
}

export interface VerbSeed {
  id: string;
  infinitive: string;
  en: string;
  level: CefrLevel;
  irregular?: boolean;
  irregularityNote?: string;
  /** Reflexive verbs list forms without the pronoun; it is added automatically. */
  reflexive?: boolean;
  gerund?: string;
  participle?: string;
  /** Which tenses to expose. Order here is the order shown in the verb sheet. */
  tenses: TenseId[];
  /**
   * Deviations from the regular pattern, keyed by tense then person. Any person
   * listed here is automatically flagged as irregular in the UI.
   */
  overrides?: Partial<Record<TenseId, Partial<Record<Person, string>>>>;
  /** Replaces the whole stem for a tense, e.g. tener → tuv- in the preterite. */
  stems?: Partial<Record<TenseId, string>>;
  patterns?: { pattern: string; en: string; example: ExampleLine }[];
}

function groupOf(infinitive: string, reflexive: boolean): Group {
  const base = reflexive ? infinitive.replace(/se$/, '') : infinitive;
  const ending = base.slice(-2);
  if (ending === 'ar') return 'ar';
  if (ending === 'er') return 'er';
  return 'ir';
}

/** Persons this tense actually has a form for. The imperative has no `yo`. */
export function personsWithForms(conjugation: Conjugation): Person[] {
  return PERSONS.filter((person) => !!conjugation.forms[person]);
}

export function buildVerb(seed: VerbSeed): Verb {
  const reflexive = seed.reflexive ?? false;
  const base = reflexive ? seed.infinitive.replace(/se$/, '') : seed.infinitive;
  const group = groupOf(seed.infinitive, reflexive);
  const stem = base.slice(0, -2);
  const participle = seed.participle ?? `${stem}${group === 'ar' ? 'ado' : 'ido'}`;
  const gerund = seed.gerund ?? `${stem}${group === 'ar' ? 'ando' : 'iendo'}`;

  const applyOverrides = (
    forms: Record<Person, string>,
    tense: TenseId,
  ): { forms: Record<Person, string>; irregularPersons: Person[] } => {
    const overrides = seed.overrides?.[tense];
    const irregularPersons: Person[] = [];
    if (overrides) {
      for (const person of PERSONS) {
        const value = overrides[person];
        if (value !== undefined) {
          forms[person] = value;
          irregularPersons.push(person);
        }
      }
    }
    return { forms, irregularPersons };
  };

  /**
   * The present indicative and the present subjunctive are computed whether or
   * not the seed exposes them, because two other paradigms are *derived* from
   * them: the subjunctive needs the indicative's yo form, and the imperative
   * needs the subjunctive for usted/nosotros/ustedes. Building them on demand
   * would make a verb's imperative depend on the order of its `tenses` array,
   * which is the kind of coupling that produces a bug nobody can reproduce.
   */
  const presentIndicative = applyOverrides(
    fromEndings(seed.stems?.present ?? stem, PRESENT[group]),
    'present',
  ).forms;

  const buildSubjunctive = (): { forms: Record<Person, string>; irregularPersons: Person[] } => {
    const explicit = seed.overrides?.presentSubjunctive;
    const complete = explicit && PERSONS.every((p) => explicit[p] !== undefined);
    // A complete override needs no stem, which is what lets ser/estar/ir/saber/dar
    // opt out of a rule their yo form cannot feed.
    const derived = complete
      ? ({} as Record<Person, string>)
      : fromEndings(
          subjunctiveStem(presentIndicative.yo, group, seed.infinitive),
          PRESENT_SUBJUNCTIVE[group],
        );
    return applyOverrides({ ...derived } as Record<Person, string>, 'presentSubjunctive');
  };

  const buildImperative = (): { forms: Record<Person, string>; irregularPersons: Person[] } => {
    if (reflexive) {
      throw new Error(
        `The imperative of the reflexive verb "${seed.infinitive}" cannot be generated: its ` +
          `pronoun attaches to the end of the verb (levántate, levantaos, levantémonos) rather ` +
          `than sitting in front of it. Supply a complete overrides.imperative, or drop ` +
          `'imperative' from this verb's tenses.`,
      );
    }
    const subjunctive = buildSubjunctive().forms;
    const forms = {} as Record<Person, string>;
    // tú: the bare third-person present, bar the eight irregulars.
    forms.tu = IMPERATIVE_TU_IRREGULAR[seed.infinitive] ?? presentIndicative.el;
    // usted / nosotros / ustedes borrow the subjunctive wholesale.
    forms.el = subjunctive.el;
    forms.nosotros = subjunctive.nosotros;
    forms.ellos = subjunctive.ellos;
    // vosotros: infinitive, -r → -d. Exceptionless in the affirmative.
    forms.vosotros = `${base.slice(0, -1)}d`;
    return applyOverrides(forms, 'imperative');
  };

  const tenses: Partial<Record<TenseId, Conjugation>> = {};

  for (const tense of seed.tenses) {
    const tenseStem = seed.stems?.[tense] ?? stem;
    let forms: Record<Person, string>;
    let extraIrregular: Person[] = [];

    switch (tense) {
      case 'present':
        forms = { ...presentIndicative };
        break;
      case 'preterite':
        forms = fromEndings(tenseStem, PRETERITE[group]);
        break;
      case 'imperfect':
        forms = fromEndings(tenseStem, IMPERFECT[group]);
        break;
      case 'future':
        forms = fromEndings(seed.stems?.future ?? base, FUTURE);
        break;
      case 'conditional':
        forms = fromEndings(seed.stems?.conditional ?? base, CONDITIONAL);
        break;
      case 'presentPerfect':
        forms = fromEndings('', HABER);
        PERSONS.forEach((person) => {
          forms[person] = `${forms[person]} ${participle}`;
        });
        break;
      case 'presentSubjunctive': {
        const built = buildSubjunctive();
        forms = built.forms;
        extraIrregular = built.irregularPersons;
        break;
      }
      case 'imperative': {
        const built = buildImperative();
        forms = built.forms;
        extraIrregular = built.irregularPersons;
        break;
      }
      default: {
        /**
         * No silent fallback. This branch used to generate present-indicative
         * endings for any tense it did not recognise, which meant a verb that
         * declared `presentSubjunctive` was handed "hablo, hablas, habla" and
         * the course taught the indicative under a subjunctive label. A tense
         * with no builder is a bug in this file, and it should read as one.
         */
        const unreachable: never = tense;
        throw new Error(
          `No conjugation rule for tense "${String(unreachable)}" on verb "${seed.infinitive}". ` +
            `Add a case to buildVerb rather than letting it fall through to another tense.`,
        );
      }
    }

    const withOverrides =
      tense === 'presentSubjunctive' || tense === 'imperative'
        ? { forms, irregularPersons: extraIrregular }
        : applyOverrides(forms, tense);
    forms = withOverrides.forms;
    const irregularPersons = [...withOverrides.irregularPersons];

    if (seed.stems?.[tense] && tense !== 'future' && tense !== 'conditional') {
      // A replaced stem makes the whole paradigm irregular.
      for (const person of PERSONS) {
        if (!irregularPersons.includes(person)) irregularPersons.push(person);
      }
    }

    /**
     * The reflexive pronoun sits *before* a finite verb but attaches to the end
     * of an imperative, so the imperative is excluded here and must be supplied
     * whole — `buildImperative` refuses reflexives outright for the same reason.
     */
    if (reflexive && tense !== 'imperative') {
      for (const person of PERSONS) {
        forms[person] = `${REFLEXIVE_PRONOUNS[person]} ${forms[person]}`;
      }
    }

    tenses[tense] = {
      forms,
      irregular: irregularPersons.length > 0 ? irregularPersons : undefined,
    };
  }

  return {
    id: seed.id,
    infinitive: seed.infinitive,
    en: seed.en,
    group,
    irregular: seed.irregular ?? false,
    irregularityNote: seed.irregularityNote,
    level: seed.level,
    gerund: reflexive ? `${gerund}se` : gerund,
    participle,
    tenses,
    patterns: seed.patterns,
  };
}
