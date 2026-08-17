import { sentences } from '@/content';
import { verbs } from '@/content/verbs';
import { PERSONS, type Person, type Sentence, type TenseId } from '@/content/types';

/**
 * Which sentences actually contain each conjugated form.
 *
 * Verb paradigms are the one concept kind that is *derived* rather than
 * authored, and they are practised by finding a sentence that contains the
 * exact conjugated form — not by a `concepts: [...]` tag like everything else.
 * That left a blind spot with real consequences: a paradigm could be taught,
 * reachable, and healthy by every concept-pool measure while being drillable
 * only as a bare conjugation table, because nothing anywhere recorded whether
 * the corpus supported it.
 *
 * The fix is an index, not a tagging convention. Asking authors to annotate
 * sentences with `f.comer.preterite` would be busywork and would rot instantly:
 * the information is already in the text, so it should be *derived* from the
 * text. This module is that derivation, and both the generator and
 * `audit:content` read it, so the exercise the learner gets and the number the
 * audit reports can never disagree.
 */

const PUNCTUATION = /[¿?¡!.,;:«»"“”]/g;
const REFLEXIVE_PRONOUNS = new Set(['me', 'te', 'se', 'nos', 'os']);

function bare(token: string): string {
  return token.replace(PUNCTUATION, '').toLowerCase();
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean).map(bare).filter(Boolean);
}

/**
 * The token of a form that carries its person, and therefore the one worth
 * blanking. This is why compound and reflexive paradigms used to be
 * unpractisable in context: a multi-word form matches no single token, so the
 * old scan silently found nothing for every present perfect and every
 * reflexive.
 *
 *   simple      hablo          → hablo
 *   compound    he comido      → he        (the auxiliary inflects, not the participle)
 *   reflexive   me levanto     → levanto   (the pronoun is fixed by the person, the verb is the work)
 *   both        me he levantado→ he
 */
export function personBearingToken(form: string): string {
  const parts = form.split(/\s+/).filter(Boolean).map(bare);
  const withoutPronoun = parts.length > 1 && REFLEXIVE_PRONOUNS.has(parts[0]) ? parts.slice(1) : parts;
  // A remaining multi-word form is a compound tense: person lives in the auxiliary.
  return withoutPronoun[0];
}

/** True when `needle` appears as a contiguous run of tokens inside `haystack`. */
function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  outer: for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

export interface ParadigmUsage {
  /** Sentence ids containing this person's form, per person. */
  byPerson: Record<Person, string[]>;
  /** Distinct sentences supporting any person of this paradigm. */
  sentenceIds: string[];
  /** How many of the six persons the corpus can illustrate. */
  personsCovered: number;
}

/** Tokenised once — the index is O(sentences × forms) and runs at module load. */
const sentenceTokens = new Map<string, string[]>();
for (const sentence of sentences) sentenceTokens.set(sentence.id, tokens(sentence.es));

const index = new Map<string, ParadigmUsage>();

function emptyByPerson(): Record<Person, string[]> {
  return { yo: [], tu: [], el: [], nosotros: [], vosotros: [], ellos: [] };
}

for (const verb of verbs) {
  for (const tense of Object.keys(verb.tenses) as TenseId[]) {
    const conjugation = verb.tenses[tense];
    if (!conjugation) continue;

    const byPerson = emptyByPerson();
    const all = new Set<string>();

    for (const person of PERSONS) {
      const needle = tokens(conjugation.forms[person]);
      for (const sentence of sentences) {
        const haystack = sentenceTokens.get(sentence.id)!;
        if (containsSequence(haystack, needle)) {
          byPerson[person].push(sentence.id);
          all.add(sentence.id);
        }
      }
    }

    index.set(`f.${verb.id}.${tense}`, {
      byPerson,
      sentenceIds: [...all],
      personsCovered: PERSONS.filter((p) => byPerson[p].length > 0).length,
    });
  }
}

const sentenceById = new Map(sentences.map((s) => [s.id, s]));

export function paradigmUsage(conceptId: string): ParadigmUsage | undefined {
  return index.get(conceptId);
}

/** Sentences illustrating a specific person of a paradigm. */
export function sentencesForForm(conceptId: string, person: Person): Sentence[] {
  const usage = index.get(conceptId);
  if (!usage) return [];
  return usage.byPerson[person]
    .map((id) => sentenceById.get(id))
    .filter((s): s is Sentence => !!s);
}

/** Persons of this paradigm the corpus can actually illustrate. */
export function supportedPersons(conceptId: string): Person[] {
  const usage = index.get(conceptId);
  if (!usage) return [];
  return PERSONS.filter((person) => usage.byPerson[person].length > 0);
}

export interface VerbCorpusReport {
  /** Paradigms derived from `verbs.ts`, whether or not a lesson teaches them. */
  paradigms: number;
  /** Paradigms a lesson introduces, so the learner can actually reach them. */
  taught: number;
  /** Of the taught ones, how many any sentence can illustrate. */
  withSentenceSupport: number;
  /**
   * Taught, supported, and still resting on a single sentence — reachable but
   * barely practised, which no other measure distinguishes from healthy.
   */
  barelyPractised: string[];
  /** Taught paradigms the corpus cannot illustrate at all. */
  unsupported: string[];
  /** Distinct sentence–form hits per tense, for taught paradigms. */
  exposureByTense: Record<string, number>;
  /** The same per grammatical person — where `vosotros` shows up or does not. */
  exposureByPerson: Record<Person, number>;
  /** Taught paradigms illustrating this many of six persons, bucketed. */
  personsCoveredHistogram: Record<number, number>;
}

/**
 * `isTaught` is injected rather than imported so this module stays free of the
 * curriculum: the index is about text, and only the report needs to know which
 * paradigms the course actually reaches.
 */
export function reportVerbCorpus(isTaught: (conceptId: string) => boolean): VerbCorpusReport {
  const exposureByTense: Record<string, number> = {};
  const exposureByPerson: Record<Person, number> = {
    yo: 0,
    tu: 0,
    el: 0,
    nosotros: 0,
    vosotros: 0,
    ellos: 0,
  };
  const personsCoveredHistogram: Record<number, number> = {};
  const barelyPractised: string[] = [];
  const unsupported: string[] = [];
  let taught = 0;
  let withSentenceSupport = 0;

  for (const [conceptId, usage] of index) {
    if (!isTaught(conceptId)) continue;
    taught += 1;

    const tense = conceptId.split('.').slice(2).join('.');
    for (const person of PERSONS) {
      const hits = usage.byPerson[person].length;
      exposureByPerson[person] += hits;
      exposureByTense[tense] = (exposureByTense[tense] ?? 0) + hits;
    }

    personsCoveredHistogram[usage.personsCovered] =
      (personsCoveredHistogram[usage.personsCovered] ?? 0) + 1;

    if (usage.sentenceIds.length === 0) unsupported.push(conceptId);
    else {
      withSentenceSupport += 1;
      if (usage.sentenceIds.length === 1) barelyPractised.push(conceptId);
    }
  }

  return {
    paradigms: index.size,
    taught,
    withSentenceSupport,
    barelyPractised,
    unsupported,
    exposureByTense,
    exposureByPerson,
    personsCoveredHistogram,
  };
}
