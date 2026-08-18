import { sentences, vocabConcepts } from '@/content';
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

/** Where `needle` appears as a contiguous run of tokens in `haystack`, or -1. */
function sequenceIndex(haystack: string[], needle: string[]): number {
  if (needle.length === 0) return -1;
  outer: for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Ambiguity, which a purely textual index gets wrong in three ways.
 *
 * Matching surface forms is the right approach — the information is in the text
 * — but Spanish surfaces collide, and a naive match silently credits a paradigm
 * with evidence belonging to something else. Measured on this corpus, all three
 * were real: `f.ser.preterite` claimed 32 sentences of which most were `ir`
 * ("Ayer fui al cine"), `f.venir.preterite` counted four glasses of wine, and
 * `f.comer.present` counted the conjunction in "tan grande como el tuyo".
 *
 * The disambiguator is the author's own tagging, which costs nothing extra:
 * "Ayer fui al cine" is already tagged `v.ir`, and the wine sentence is already
 * tagged `v.vino` rather than `v.venir`. So for a form that is genuinely
 * ambiguous, the sentence must corroborate with the verb's own vocabulary
 * concept. Unambiguous forms — the overwhelming majority — still need no tag.
 */

/** verbId → the vocabulary concept that names it, used as the corroborator. */
const vocabForVerb = new Map<string, string>();
for (const concept of vocabConcepts) {
  if (concept.verbId) vocabForVerb.set(concept.verbId, concept.id);
}

/** The bare headword of every vocabulary concept, to catch noun homographs. */
const vocabHeadword = new Map<string, string>();
for (const concept of vocabConcepts) {
  for (const part of concept.es.split('/')) {
    const word = bare(part.trim().replace(/^(el|la|los|las|un|una)\s+/i, ''));
    if (word && !word.includes(' ') && !vocabHeadword.has(word)) {
      vocabHeadword.set(word, concept.id);
    }
  }
}

/** Which verbs produce each single-token form, to catch cross-verb collisions. */
const formOwners = new Map<string, Set<string>>();
for (const verb of verbs) {
  for (const tense of Object.keys(verb.tenses) as TenseId[]) {
    const conjugation = verb.tenses[tense];
    if (!conjugation) continue;
    for (const person of PERSONS) {
      const parts = conjugation.forms[person].split(/\s+/);
      if (parts.length > 1) continue;
      const form = bare(parts[0]);
      const owners = formOwners.get(form) ?? new Set<string>();
      owners.add(verb.id);
      formOwners.set(form, owners);
    }
  }
}

/**
 * Forms that collide with a common function word rather than with a noun or
 * another paradigm, so neither of the automatic checks above sees them. Kept
 * deliberately short and evidence-led: each one was found by the regression
 * suite, not guessed at.
 */
const FUNCTION_WORD_FORMS = new Set(['como', 'sobre', 'para', 'vale', 'salvo', 'entre']);

function isAmbiguous(form: string, verbId: string): boolean {
  // Multi-word forms (compound, reflexive) are effectively never ambiguous.
  if (form.includes(' ')) return false;
  if (FUNCTION_WORD_FORMS.has(form)) return true;
  if ((formOwners.get(form)?.size ?? 0) > 1) return true;
  const owner = vocabHeadword.get(form);
  return !!owner && owner !== vocabForVerb.get(verbId);
}

/**
 * Tokens that mark the next word as a noun. A finite verb is never directly
 * preceded by a determiner, and in Spanish essentially never by a bare
 * preposition either — anything of the sort goes through `que`. So this cheaply
 * rejects "del trabajo", "un vino", "la paga" without touching real verb uses.
 */
const NOUN_MARKERS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'del', 'al',
  'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra', 'vuestro', 'vuestra',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  'otro', 'otra', 'otros', 'otras', 'mucho', 'mucha', 'muchos', 'muchas',
  'poco', 'poca', 'todo', 'toda', 'todos', 'todas', 'tanto', 'tanta',
  'de', 'con', 'sin', 'en', 'por', 'sobre', 'hasta', 'desde',
]);

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
      const form = conjugation.forms[person];
      const needle = tokens(form);
      const ambiguous = isAmbiguous(bare(form), verb.id);
      const corroborator = vocabForVerb.get(verb.id);

      for (const sentence of sentences) {
        const haystack = sentenceTokens.get(sentence.id)!;
        const at = sequenceIndex(haystack, needle);
        if (at === -1) continue;

        // "del trabajo", "un vino" — the token is a noun here, not a verb.
        if (at > 0 && NOUN_MARKERS.has(haystack[at - 1])) continue;

        // A genuinely ambiguous surface needs the author's own tag to confirm
        // which word it is. Everything else is taken at face value.
        if (ambiguous && !(corroborator && sentence.concepts.includes(corroborator))) continue;

        byPerson[person].push(sentence.id);
        all.add(sentence.id);
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
  /**
   * Exposures per person, counting only forms that are *unique* within their
   * paradigm. Spanish is syncretic — `era` is both yo and él, and so are the
   * whole imperfect, conditional and present subjunctive — so crediting one
   * sentence to every person sharing the surface doubles the count and tells an
   * author that `yo` is well covered when the evidence is really third-person
   * narration. Ambiguous hits are counted once, in `sharedFormExposures`.
   */
  exposureByPerson: Record<Person, number>;
  /** Hits on a form that several persons of the same paradigm share. */
  sharedFormExposures: number;
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
  let sharedFormExposures = 0;

  for (const [conceptId, usage] of index) {
    if (!isTaught(conceptId)) continue;
    taught += 1;

    const tense = conceptId.split('.').slice(2).join('.');
    // A form shared by several persons is one piece of evidence, not several.
    const verb = verbs.find((v) => v.id === conceptId.split('.')[1]);
    const forms = verb?.tenses[tense as TenseId]?.forms;
    const shareCount = new Map<string, number>();
    if (forms) {
      for (const person of PERSONS) {
        const key = bare(forms[person]);
        shareCount.set(key, (shareCount.get(key) ?? 0) + 1);
      }
    }

    const countedShared = new Set<string>();
    for (const person of PERSONS) {
      const hits = usage.byPerson[person].length;
      exposureByTense[tense] = (exposureByTense[tense] ?? 0) + hits;
      const key = forms ? bare(forms[person]) : person;
      if ((shareCount.get(key) ?? 1) > 1) {
        // Credit the shared surface once, not once per person wearing it.
        if (!countedShared.has(key)) {
          sharedFormExposures += hits;
          countedShared.add(key);
        }
        continue;
      }
      exposureByPerson[person] += hits;
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
    sharedFormExposures,
    personsCoveredHistogram,
  };
}
