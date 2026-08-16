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

const FUTURE = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const CONDITIONAL = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const HABER = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];

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

export function buildVerb(seed: VerbSeed): Verb {
  const reflexive = seed.reflexive ?? false;
  const base = reflexive ? seed.infinitive.replace(/se$/, '') : seed.infinitive;
  const group = groupOf(seed.infinitive, reflexive);
  const stem = base.slice(0, -2);
  const participle = seed.participle ?? `${stem}${group === 'ar' ? 'ado' : 'ido'}`;
  const gerund = seed.gerund ?? `${stem}${group === 'ar' ? 'ando' : 'iendo'}`;

  const tenses: Partial<Record<TenseId, Conjugation>> = {};

  for (const tense of seed.tenses) {
    const tenseStem = seed.stems?.[tense] ?? stem;
    let forms: Record<Person, string>;

    switch (tense) {
      case 'present':
        forms = fromEndings(tenseStem, PRESENT[group]);
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
      default:
        // presentSubjunctive / imperative are supplied wholesale via overrides.
        forms = fromEndings(tenseStem, PRESENT[group]);
        break;
    }

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
    if (seed.stems?.[tense] && tense !== 'future' && tense !== 'conditional') {
      // A replaced stem makes the whole paradigm irregular.
      for (const person of PERSONS) {
        if (!irregularPersons.includes(person)) irregularPersons.push(person);
      }
    }

    if (reflexive) {
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
