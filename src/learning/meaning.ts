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

/** Words that carry no meaning for a comprehension check. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'be', 'been', 'do', 'does', 'did', 'to', 'of', 'that',
  'it', 'its', 'some', 'any', 'so', 'just', 'really', 'quite', 'at', 'in', 'on', 'and',
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
 * The meaning-bearing words of an answer, normalised for comparison. Sorted, so
 * word order does not matter — a comprehension check is about content, and
 * "in the morning I work" is not a different claim from "I work in the morning".
 */
export function contentWords(text: string, equivalences?: Equivalences): string[] {
  return deaccent(text.toLowerCase())
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => equivalences?.word.get(word) ?? word)
    .filter((word) => !STOPWORDS.has(word))
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
  const words = deaccent(text.toLowerCase())
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
  const answer = contentWords(given, equivalences);
  const target = contentWords(model, equivalences);
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
