import { sentences, verbFormConceptId, vocabConcepts } from '@/content';
import { verbs } from '@/content/verbs';
import { PERSONS, type Sentence, type TenseId } from '@/content/types';

/**
 * Which *words* a sentence actually asks the learner to know.
 *
 * The eligibility gate reads `sentence.concepts`, and tags under-count. That is
 * not a tagging failure to be fixed by tagging harder — it is structural. A tag
 * list records what a sentence is *for*, and authors tag the two or three
 * concepts a sentence exercises, not the eleven words it happens to contain.
 * "Estaban viendo el partido abajo en el bar." declares the imperfect and
 * little else, and contains `viendo`, `partido`, `abajo` and `bar`, none of
 * them tagged. So the concept check waves it through, and a learner who has met
 * none of those four is asked to translate it.
 *
 * This module closes that gap the way `verb-corpus.ts` closed the equivalent
 * one for conjugations: by *deriving* the information that is already in the
 * sentence text rather than asking anyone to annotate it. The index is built
 * once at module load, and both the runtime gate and `audit:content` read it,
 * so what the learner is shown and what the audit reports cannot drift apart.
 *
 * Three kinds of token come out of a sentence, and the distinction is the whole
 * design:
 *
 *   • **function words** — `el`, `en`, `de`, `que`, `se`. Structural, learned
 *     by exposure rather than taught as vocabulary, and present in the very
 *     first lesson. They never count against anybody.
 *   • **covered** — a token some vocabulary concept or verb paradigm in this
 *     course accounts for. These are the ones worth counting: if the learner
 *     knows the concept, they can read the word; if not, they cannot.
 *   • **untracked** — a content word no concept in the course covers. Deliberately
 *     *not* counted as unknown. The course does not claim to teach it, so
 *     refusing every sentence containing one would reject most of the corpus and
 *     make eligibility a measure of vocabulary-file completeness rather than of
 *     what the learner knows. `audit:content` reports them instead, where a
 *     human can decide whether the word deserves teaching.
 */

const PUNCTUATION = /[¿?¡!.,;:«»"“”()—–…]/g;

function bare(token: string): string {
  return token.replace(PUNCTUATION, '').toLowerCase().trim();
}

export function lexTokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean).map(bare).filter(Boolean);
}

/**
 * Words that carry structure rather than meaning.
 *
 * Kept deliberately generous. A false entry here costs a little sensitivity on
 * one word; a missing entry costs a *false refusal* on every sentence
 * containing it, and a gate that refuses good sentences degrades the course
 * silently — the learner just sees fewer production exercises and no reason
 * why. Every item is either a closed-class word (article, preposition,
 * pronoun, conjunction, determiner) or a number, all of which arrive in the
 * first unit and recur constantly.
 */
const FUNCTION_WORDS = new Set([
  // articles and determiners
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'esto', 'eso', 'aquello',
  'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
  'vuestro', 'vuestra', 'vuestros', 'vuestras',
  'otro', 'otra', 'otros', 'otras', 'todo', 'toda', 'todos', 'todas',
  'cada', 'alguno', 'alguna', 'algunos', 'algunas', 'algún',
  'ninguno', 'ninguna', 'ningún', 'cualquier',
  // pronouns
  'yo', 'tú', 'él', 'ella', 'usted', 'ustedes', 'nosotros', 'nosotras',
  'vosotros', 'vosotras', 'ellos', 'ellas',
  'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'conmigo', 'contigo',
  'mí', 'ti', 'sí', 'quien', 'quienes', 'cuyo', 'cuya',
  // prepositions and conjunctions
  'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'durante', 'en',
  'entre', 'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'sobre', 'tras',
  'y', 'e', 'o', 'u', 'ni', 'que', 'como', 'si', 'pero', 'porque', 'pues',
  'aunque', 'cuando', 'donde', 'mientras', 'sino',
  // interrogatives
  'qué', 'quién', 'quiénes', 'cuál', 'cuáles', 'cómo', 'cuándo', 'dónde',
  'cuánto', 'cuánta', 'cuántos', 'cuántas', 'por qué', 'adónde',
  // very high-frequency adverbs and particles
  'no', 'sí', 'más', 'menos', 'muy', 'ya', 'también', 'tampoco', 'solo', 'sólo',
  'hay', 'es', 'son', 'está', 'están', 'ser', 'estar',
  // numbers
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'veinte',
  'treinta', 'cien', 'ciento', 'mil',
]);

export function isFunctionWord(token: string): boolean {
  return FUNCTION_WORDS.has(token) || /^\d+$/.test(token);
}

/**
 * The stem used to match an inflected token back to its headword.
 *
 * Spanish inflects on the end — `amigo`/`amigos`/`amiga`/`amigas`,
 * `pequeño`/`pequeñas` — so a prefix of the word is a good key. Five characters
 * is the same length `audit:content` already uses for the same job; below that
 * the prefixes collide (`ser`/`serio`, `casa`/`casar`) and the index starts
 * claiming coverage it does not have, which is the dangerous direction: a
 * falsely covered word is a word the gate thinks the learner can read.
 */
const STEM_LENGTH = 5;

function stemOf(token: string): string | null {
  return token.length >= STEM_LENGTH ? token.slice(0, STEM_LENGTH) : null;
}

/** Strips a leading article from a headword: "el móvil" → "móvil". */
const LEADING_ARTICLE = /^(el|la|los|las|un|una|unos|unas)\s+/;

/**
 * Every surface form a concept would let the learner read, exact matches first.
 *
 * A headword may be several words ("por favor"), may offer alternatives
 * separated by a slash, and may carry a plural. All of them count: knowing
 * `v.amigo` is knowing "amigos".
 */
function formsOfVocab(es: string, plural?: string): string[] {
  const out: string[] = [];
  for (const variant of es.split('/')) {
    const cleaned = variant.trim().toLowerCase().replace(LEADING_ARTICLE, '');
    out.push(...lexTokens(cleaned));
  }
  if (plural) out.push(...lexTokens(plural.toLowerCase().replace(LEADING_ARTICLE, '')));
  return out.filter((token) => token.length > 0);
}

/** token → concept ids that account for it exactly. */
const exact = new Map<string, Set<string>>();
/** five-letter stem → concept ids, for inflected forms. */
const byStem = new Map<string, Set<string>>();

function register(token: string, conceptId: string) {
  if (!token || isFunctionWord(token)) return;
  const set = exact.get(token);
  if (set) set.add(conceptId);
  else exact.set(token, new Set([conceptId]));

  const stem = stemOf(token);
  if (!stem) return;
  const stems = byStem.get(stem);
  if (stems) stems.add(conceptId);
  else byStem.set(stem, new Set([conceptId]));
}

for (const concept of vocabConcepts) {
  for (const form of formsOfVocab(concept.es, concept.plural)) {
    register(form, concept.id);
  }
}

/**
 * Verb forms map back to the verb's own vocabulary concept, not to the paradigm.
 *
 * Deliberate: the question this index answers is "can the learner read this
 * word?", and reading `comíamos` needs to know *comer*, which is what `v.comer`
 * records. Requiring `f.comer.imperfect` as well would make every sentence in a
 * tense the learner has not formally studied ineligible, which is precisely the
 * spiral this course is built on. The paradigm gate is a separate question,
 * asked separately.
 */
for (const verb of verbs) {
  const owner = vocabConcepts.find((concept) => concept.verbId === verb.id);
  if (!owner) continue;
  register(bare(verb.infinitive), owner.id);
  register(bare(verb.gerund), owner.id);
  register(bare(verb.participle), owner.id);
  for (const [tense, conjugation] of Object.entries(verb.tenses)) {
    if (!conjugation) continue;
    /**
     * Registered against the paradigm as well as the verb, because either one
     * is enough to read the word. "Han visto" is legible to somebody who knows
     * *ver*, and equally to somebody who has studied the present perfect — the
     * auxiliary `han` belongs to neither headword on its own, and counting it
     * unknown for a learner mid-way through the present-perfect unit would
     * refuse them every sentence in the tense they were being taught.
     */
    const paradigm = verbFormConceptId(verb.id, tense as TenseId);
    for (const person of PERSONS) {
      const form = conjugation.forms[person];
      if (!form) continue;
      // Multi-word forms ("he comido", "me levanto") contribute each of their
      // tokens; the pronouns fall out as function words.
      for (const token of lexTokens(form)) {
        register(token, owner.id);
        register(token, paradigm);
      }
    }
  }
}

/** Concept ids that could account for `token`, or an empty array. */
export function conceptsCovering(token: string): string[] {
  const direct = exact.get(token);
  if (direct) return [...direct];
  const stem = stemOf(token);
  if (!stem) return [];
  const stems = byStem.get(stem);
  return stems ? [...stems] : [];
}

export interface SentenceLexis {
  /** Content tokens, deduped, in the order they appear. */
  words: string[];
  /** Content tokens some concept in this course accounts for. */
  covered: string[];
  /** Content tokens nothing in this course accounts for. */
  untracked: string[];
}

/**
 * Keyed on the text, not the id.
 *
 * The lexis is a function of `es` alone, so the text is the honest key — and
 * keying on the id would make this cache lie in exactly one situation, which
 * test fixtures reproduce constantly: two different sentences sharing an id.
 * Production ids are unique and a test enforces it, but a cache that is correct
 * only because of an invariant enforced somewhere else is a cache waiting to be
 * wrong.
 */
const lexisCache = new Map<string, SentenceLexis>();

export function sentenceLexis(sentence: Sentence): SentenceLexis {
  const cached = lexisCache.get(sentence.es);
  if (cached) return cached;

  const words = [...new Set(lexTokens(sentence.es))].filter((token) => !isFunctionWord(token));
  const covered: string[] = [];
  const untracked: string[] = [];
  for (const word of words) {
    if (conceptsCovering(word).length > 0) covered.push(word);
    else untracked.push(word);
  }

  const lexis: SentenceLexis = { words, covered, untracked };
  lexisCache.set(sentence.es, lexis);
  return lexis;
}

/**
 * Content words in the sentence that the learner has no way to read.
 *
 * A word counts as readable if *any* concept covering it is known — `visto` is
 * readable to somebody who knows `v.ver`, whether or not they have met the
 * present perfect. Untracked words never count, for the reason in the header.
 *
 * `exempt` is the concept the exercise is teaching: its words are the point of
 * the exercise, so they are not an obstacle to it.
 */
export function unknownWords(
  sentence: Sentence,
  known: ReadonlySet<string>,
  exempt: readonly string[] = [],
): string[] {
  const { covered } = sentenceLexis(sentence);
  const exemptSet = new Set(exempt);
  return covered.filter((word) => {
    const covering = conceptsCovering(word);
    return !covering.some((id) => known.has(id) || exemptSet.has(id));
  });
}

/** Sentences whose content words are largely untracked — an authoring signal. */
export function untrackedReport(minimum = 2): { sentence: Sentence; words: string[] }[] {
  const out: { sentence: Sentence; words: string[] }[] = [];
  for (const sentence of sentences) {
    const { untracked } = sentenceLexis(sentence);
    if (untracked.length >= minimum) out.push({ sentence, words: untracked });
  }
  return out.sort((a, b) => b.words.length - a.words.length);
}
