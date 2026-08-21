import type { Equivalences } from '@/learning/grading';

/**
 * Did the learner say the same thing?
 *
 * Free conversation turns carry four hand-authored model answers, each a full
 * natural sentence. Graded by exact match, a learner essentially cannot pass
 * one — measured across the course, 107 turns are in that state. The exercise
 * looks well-formed from every call site, which is why it survived so long.
 *
 * So a free turn is scored on *coverage*: how much of the model's meaning the
 * learner's answer carries, against the closest of the models. Not a similarity
 * score in the abstract — an asymmetric one. The model's content words are what
 * must be covered, and padding the answer does not help, so "I want a coffee and
 * a toast and a juice and the paper" does not score full marks against "I want a
 * coffee" by containing it.
 *
 * Polarity is absolute rather than weighted. Two sentences that differ only in
 * a negation are opposites however much else they share, and letting that count
 * as 90% coverage would be the single worst thing this module could do.
 */

/**
 * Words that carry no meaning for a comprehension check — split by language,
 * not merged.
 *
 * They used to be one shared set, and it silently broke English: Spanish's
 * object/reflexive clitics (`me`, `te`, `se`, `lo`, `le`, `les`, `nos`, `os`)
 * are legitimately droppable for the Spanish free-turn coverage check
 * (`meaningCoverage`, which tolerates a dropped clitic the way the app
 * already tolerates a dropped subject pronoun) — but the same spelling,
 * `me`, is also an ordinary English object pronoun that carries real
 * content: "he didn't believe me" and "he didn't believe it" are different
 * claims. A shared set meant `sameEnglishMeaning` dropped English "me" as
 * filler too, which let the mutation corpus swap it for "zebra" for free —
 * "I told him the truth and he didn't believe zebra" graded as a paraphrase
 * of "...he didn't believe me" — because a lone "me" then registered as no
 * content lost at all, and `sameEnglishMeaning` already tolerates one
 * unmatched word. This was one of two causes behind a measured +22 false
 * acceptances on a corpus-wide last-word-swap mutation; the other was `be`
 * and `been`, added here as English stopwords with no such collision but the
 * same effect on a sentence that ends "...there may not be." — neither word
 * was in the pre-branch stopword list, and this drops both back out of it.
 */
const EN_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'do', 'does', 'did', 'to', 'of', 'that',
  'it', 'its', 'some', 'any', 'so', 'just', 'really', 'quite', 'at', 'in', 'on', 'and',
]);

/** Function words for the Spanish free-turn coverage check — see `EN_STOPWORDS`. */
const ES_STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'que', 'y', 'o',
  'es', 'son', 'se', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os',
]);

/**
 * Words that flip a sentence rather than colouring it.
 *
 * These are why coverage cannot simply tolerate one unmatched word: "I do not
 * like coffee" and "I like coffee" differ by exactly one, and it is the only
 * one that matters. Both languages, because this module scores both.
 */
const POLARITY = new Set([
  'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nor', 'without',
  'nowhere', 'cannot', 'except', 'unless',
  'nunca', 'nadie', 'nada', 'ni', 'tampoco', 'sin', 'jamas', 'ningun', 'ninguna', 'ninguno',
]);

function deaccent(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Punctuation stripped before tokenising, mirroring `answer-check.ts`'s
 * `normalize`. Every internal call into this module already goes through
 * `normalize` first, so on that path this is a no-op — but `contentWords`,
 * `polarityOf` and `meaningCoverage` are exported and used directly by the
 * corpus tests (and by anything else that reasons about a raw authored
 * sentence rather than a normalized answer). Without this, a model answer
 * ending "…de que el cliente ya sabe que hay trabas" tokenised "trabas" fine,
 * but "no, gracias" tokenised to `["no,", "gracias"]` — a comma-fused "no,"
 * that matches neither the stopword-free content word "no" nor, worse, the
 * polarity word "no": two sentences differing only by a trailing comma on
 * their negation could silently stop being recognised as opposites at all,
 * which is exactly the failure this module exists to prevent. Splitting on
 * punctuation the same way `normalize` does removes the mismatch instead of
 * relying on every caller to pre-clean its input first.
 */
function stripPunctuation(input: string): string {
  return input.replace(/[¿?¡!.,;:"'«»()\-–—]/g, ' ');
}

/**
 * The meaning-bearing words of an answer, normalised for comparison. Sorted, so
 * word order does not matter — a comprehension check is about content, and
 * "in the morning I work" is not a different claim from "I work in the morning".
 *
 * `language` defaults to `'en'` because every direct caller outside this
 * module (the English comprehension check, the corpus tests) reasons about
 * English; `meaningCoverage` below is the one caller that means Spanish and
 * says so explicitly.
 */
export function contentWords(
  text: string,
  equivalences?: Equivalences,
  language: 'es' | 'en' = 'en',
): string[] {
  const stopwords = language === 'es' ? ES_STOPWORDS : EN_STOPWORDS;
  return stripPunctuation(deaccent(text.toLowerCase()))
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => equivalences?.word.get(word) ?? word)
    .filter((word) => !stopwords.has(word))
    .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word))
    .sort();
}

/**
 * How many polarity words a phrase carries. Two cancel; one does not.
 *
 * Not exported. `contentWords`' `-s`-stripping folds `jamas` and `unless`
 * down to `jama` and `unles` — useful for an ordinary plural, ruinous for the
 * two words this count exists to catch — so a caller handed already-stripped
 * tokens gets a guard that silently never fires. That happened twice: once
 * inside this module, when `meaningCoverage` ran the answer through
 * `contentWords` and the model through its own unstripped inline split, and
 * again in `answer-check.ts`'s `sameEnglishMeaning`, which called this
 * function directly on `contentWords`' output and let "I will call you
 * unless" pass as "I will call you". Keeping `polarity` private removes the
 * footgun rather than documenting around it again: the only way to count
 * polarity from outside this module is `polarityOf`, which tokenises for
 * itself and can't be handed pre-stripped words by mistake.
 */
function polarity(words: string[]): number {
  return words.filter((word) => POLARITY.has(word)).length;
}

/**
 * Polarity count for a whole phrase, deaccented and equivalence-folded but
 * deliberately *not* run through `contentWords`' `-s` stripping. The one
 * exported way to count polarity — see `polarity` above for why the
 * array-taking form stays private.
 */
export function polarityOf(text: string, equivalences?: Equivalences): number {
  const words = stripPunctuation(deaccent(text.toLowerCase()))
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => equivalences?.word.get(word) ?? word);
  return polarity(words);
}

/**
 * Calibrated by the corpus tests in Task 13 and Task 14, not chosen by feel:
 * the lowest value at which every authored model still passes its own turn, and
 * the highest at which no mutated answer passes. If those bounds ever cross,
 * coverage alone is insufficient for that turn — report it rather than nudging
 * this number, which would be trading one failure mode for the other.
 */
export const COVERAGE_THRESHOLD = 0.6;

/**
 * How much of `model`'s meaning `given` carries, 0..1. Asymmetric on purpose:
 * the model is what has to be covered, and extra words in the answer dilute
 * rather than help.
 */
export function meaningCoverage(
  given: string,
  model: string,
  equivalences?: Equivalences,
): number {
  // Free conversation turns are always Spanish — this is the one caller that
  // needs `ES_STOPWORDS` rather than `contentWords`' English default.
  const answer = contentWords(given, equivalences, 'es');
  const target = contentWords(model, equivalences, 'es');
  if (answer.length === 0 || target.length === 0) return 0;

  // Opposites are not near misses.
  if (polarityOf(given, equivalences) !== polarityOf(model, equivalences)) return 0;

  const pool = [...answer];
  let matched = 0;
  for (const word of target) {
    const index = pool.indexOf(word);
    if (index === -1) continue;
    pool.splice(index, 1);
    matched += 1;
  }

  const recall = matched / target.length;
  // Padding is not free: an answer much longer than the model is diluted in
  // proportion, so containing the model is not the same as being it.
  const precision = matched / answer.length;
  if (precision >= recall) return recall;
  return (recall + precision) / 2;
}
