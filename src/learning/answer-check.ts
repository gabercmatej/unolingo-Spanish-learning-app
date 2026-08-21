import { spanishVariants } from '@/learning/es-variants';
import { gradeFor, verdictFor, type AnswerError, type Equivalences, type GradingProfile, type Verdict } from '@/learning/grading';
import { COVERAGE_THRESHOLD, contentWords, meaningCoverage, polarityOf } from '@/learning/meaning';
import type { Grade } from '@/learning/types';

/**
 * Answer checking.
 *
 * A language has more than one right answer, and a phone keyboard makes accents
 * a chore. So the checker works in layers:
 *
 *   1. exact match against any accepted answer (case and punctuation ignored);
 *   2. match once accents are stripped — accepted, with a note naming the
 *      accents, because "como estas" plainly shows you understood;
 *   3. match within a small edit distance — graded "almost", so one typo does
 *      not wipe out a concept's memory record;
 *   4. a paraphrase layer: a mechanically derived Spanish variant (al/del,
 *      clitic climbing), an equivalent English wording for a comprehension
 *      check, or — for a free conversation turn — how much of a model's
 *      meaning the answer covers;
 *   5. otherwise wrong.
 *
 * Spanish drops subject pronouns freely, so "Voy a comer ahora" and "Yo voy a
 * comer ahora" are both accepted — but only when the pronoun actually agrees
 * with the verb. Silently accepting "tú tengo un perro" would teach the wrong
 * thing, which is worse than rejecting it.
 *
 * This module imports from `@/learning/*` only, never `@/content/*`. Every
 * piece of corpus knowledge (which accents distinguish real words, which
 * English wordings are equivalent) arrives through the `profile` argument
 * instead, so the pure grading rule and the data it is calibrated against
 * cannot drift apart the way `verb-corpus.ts` exists to prevent for verbs.
 */

export interface CheckResult {
  /** What the learner is told. */
  verdict: Verdict;
  /** What was wrong, if anything. The one thing this module decides. */
  error: AnswerError;
  /** What the scheduler is told. Always `gradeFor(error)` — never set by hand. */
  grade: Grade;
  /** Shown under the feedback banner when the answer was not exactly right. */
  note?: string;
  /** The accepted answer closest to what was typed — shown as the model answer. */
  best: string;
}

/** Builds a result from its classification, so grade and verdict cannot drift. */
function outcome(error: AnswerError, best: string, note?: string): CheckResult {
  return { verdict: verdictFor(error), error, grade: gradeFor(error), note, best };
}

type PronounKey = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos';

const SUBJECT_PRONOUNS: Record<string, PronounKey> = {
  yo: 'yo',
  tú: 'tu',
  tu: 'tu',
  él: 'el',
  el: 'el',
  ella: 'el',
  usted: 'el',
  nosotros: 'nosotros',
  nosotras: 'nosotros',
  vosotros: 'vosotros',
  vosotras: 'vosotros',
  ellos: 'ellos',
  ellas: 'ellos',
  ustedes: 'ellos',
};

/** Irregular present forms whose ending does not reveal the person. */
const IRREGULAR_PERSON: Record<string, PronounKey> = {
  soy: 'yo',
  estoy: 'yo',
  voy: 'yo',
  sé: 'yo',
  se: 'yo',
  he: 'yo',
  doy: 'yo',
  eres: 'tu',
  vas: 'tu',
  has: 'tu',
  es: 'el',
  va: 'el',
  ha: 'el',
  está: 'el',
  esta: 'el',
  somos: 'nosotros',
  vamos: 'nosotros',
  hemos: 'nosotros',
  sois: 'vosotros',
  vais: 'vosotros',
  habéis: 'vosotros',
  son: 'ellos',
  van: 'ellos',
  han: 'ellos',
  están: 'ellos',
};

const ENGLISH_CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bcan't\b/g, 'can not'],
  [/\bcannot\b/g, 'can not'],
  [/\bwon't\b/g, 'will not'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\byou're\b/g, 'you are'],
  [/\bi've\b/g, 'i have'],
  [/\bi'd\b/g, 'i would'],
  [/\bi'll\b/g, 'i will'],
  [/\blet's\b/g, 'let us'],
];

/** Case, punctuation and spacing removed; accents preserved. */
export function normalize(input: string, language: 'es' | 'en' = 'es'): string {
  let text = input
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"');

  if (language === 'en') {
    for (const [pattern, replacement] of ENGLISH_CONTRACTIONS) {
      text = text.replace(pattern, replacement);
    }
  }

  return text
    .replace(/[¿?¡!.,;:"'«»()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same as `normalize`, with accents and ñ folded away. */
export function deaccent(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[b.length];
}

/**
 * Does this subject pronoun match this verb form? Used to decide whether an
 * added pronoun in the learner's answer is correct Spanish or a person error.
 * Returns true when the form is unrecognisable, so unusual sentences are never
 * rejected for a rule we could not evaluate.
 */
export function pronounAgrees(pronoun: PronounKey, verb: string): boolean {
  const bare = deaccent(verb);
  const irregular = IRREGULAR_PERSON[verb] ?? IRREGULAR_PERSON[bare];
  if (irregular) return irregular === pronoun;

  // Reflexive and object pronouns hide the verb; do not guess.
  if (['me', 'te', 'se', 'nos', 'os', 'lo', 'la', 'le', 'les', 'no'].includes(bare)) return true;

  if (bare.endsWith('mos')) return pronoun === 'nosotros';
  if (bare.endsWith('is')) return pronoun === 'vosotros';
  if (bare.endsWith('n')) return pronoun === 'ellos';
  if (bare.endsWith('s')) return pronoun === 'tu';
  if (bare.endsWith('o')) return pronoun === 'yo';
  if (bare.endsWith('a') || bare.endsWith('e')) {
    if (pronoun === 'el') return true;
    // yo and él genuinely share the imperfect (hablaba, comía) and the
    // conditional (hablaría) — but not the present. Without this the checker
    // stripped the pronoun from "yo habla" and marked it a near miss.
    return pronoun === 'yo' && (bare.endsWith('aba') || bare.endsWith('ia'));
  }
  return true;
}

/**
 * Strips a leading subject pronoun when it agrees with what follows.
 * Returns the text unchanged when there is no pronoun or it does not agree.
 */
function stripSubjectPronoun(normalized: string): string {
  const words = normalized.split(' ');
  if (words.length < 2) return normalized;
  const pronoun = SUBJECT_PRONOUNS[words[0]];
  if (!pronoun) return normalized;
  if (!pronounAgrees(pronoun, words[1])) return normalized;
  return words.slice(1).join(' ');
}

interface Candidate {
  /** Normalized text to compare against. */
  variant: string;
  /** The author-written answer to show the learner. */
  display: string;
  /**
   * True only for variants derived from `accepted[0]`. An exact match against
   * a non-canonical candidate is still fully correct — it is graded as
   * retrieval, not a lesser thing — but the form shown back is the canonical
   * one, so precision keeps getting taught even when it was not required.
   */
  canonical: boolean;
}

/**
 * Every accepted answer, plus its pronoun-less form and, for Spanish, every
 * mechanically derived variant (al/del contractions, clitic climbing) — all
 * pointing at the same author-written `display`. Deriving these here rather
 * than authoring "Voy al cine" and "Voy a el cine" as two separate accepted
 * answers is what lets `spanishVariants` cover every sentence in the corpus
 * without anyone touching content.
 */
export function buildCandidates(accepted: string[], language: 'es' | 'en'): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];

  const add = (variant: string, display: string, canonical: boolean) => {
    if (variant.length === 0 || seen.has(variant)) return;
    seen.add(variant);
    out.push({ variant, display, canonical });
  };

  accepted.forEach((answer, index) => {
    const canonical = index === 0;
    const normalized = normalize(answer, language);
    const forms =
      language === 'es'
        ? [...new Set(spanishVariants(normalized).flatMap((v) => [v, stripSubjectPronoun(v)]))]
        : [normalized];
    for (const form of forms) add(form, answer, canonical);
  });
  return out;
}

/** Characters two words still share at the end. */
function sharedSuffix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n += 1;
  return n;
}

/**
 * Is this a slipped key, or a different word?
 *
 * The rule here used to be edit distance across the whole answer, with two
 * characters of slack on anything long. But every grammatical error in Spanish
 * is one or two characters — hablo/habla, un/una, rojo/rojos, lo/la, por/para —
 * so a tolerance meant to forgive a typo was forgiving the entire morphology of
 * the language. Measured against fifty adversarial answers, nineteen were
 * accepted as "almost", among them "Soy cansado" for "Estoy cansado",
 * "la problema" for "el problema" and "Quiero que hablas" for "hables".
 * "Almost" is worth 0.75 and *lengthens* the review interval, so each of those
 * taught the mistake and then hid it for longer.
 *
 * What separates the two cases is position, not size. A typo is a mis-keying
 * *inside* a word; Spanish inflection lives at the *end* of one. So a near miss
 * is: the same number of words, exactly one of them different, one edit apart,
 * and the two words still sharing their last two characters. That final clause
 * is the whole rule — it is what keeps "pero" for "perro" a typo while making
 * "habla" for "hablo" an error.
 */
function isTypo(given: string, candidate: string): boolean {
  const a = given.split(' ');
  const b = candidate.split(' ');
  if (a.length !== b.length) return false;

  let differing = -1;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) continue;
    // Two words wrong is not a slip of the finger.
    if (differing >= 0) return false;
    differing = i;
  }
  if (differing < 0) return false;

  const left = a[differing];
  const right = b[differing];
  // Short words carry too much meaning per character to guess at: at four
  // letters or fewer, one edit is usually a different word (casa/cosa, un/una).
  if (Math.min(left.length, right.length) < 4) return false;
  if (levenshtein(left, right) !== 1) return false;
  return sharedSuffix(left, right) >= 2;
}

/**
 * Do two English answers say the same thing? Compares content words as a
 * multiset, so word order and filler differences do not matter but a genuinely
 * different meaning still fails.
 *
 * `contentWords` and `polarityOf` live in `@/learning/meaning` rather than
 * here — a second private copy of "what counts as a content word" is exactly
 * how the app's own stopword and polarity lists could drift from the ones
 * `meaningCoverage` uses for a free turn. The polarity check below calls
 * `polarityOf` on the raw strings, not `contentWords`' output: this function
 * used to run `contentWords`' `-s`-stripped tokens through `polarity`
 * directly, which silently turned "unless" into "unles" and let "I will call
 * you unless" pass as "I will call you". `polarityOf` tokenises for itself
 * for exactly this reason — see `meaning.ts` for why the array-taking form
 * is no longer exported.
 */
function sameEnglishMeaning(a: string, b: string, equivalences?: Equivalences): boolean {
  // 'en' passed explicitly, not relied on as `contentWords`' default — this
  // is the one place a Spanish clitic like "me" must NOT be dropped as
  // filler, because in English it is an object pronoun with real content.
  const left = contentWords(a, equivalences, 'en');
  const right = contentWords(b, equivalences, 'en');
  if (left.length === 0 || right.length === 0) return false;
  if (Math.abs(left.length - right.length) > 1) return false;
  // Negation is never the word we let slide. Counted from the raw strings,
  // not from `left`/`right` — see the doc comment above.
  if (polarityOf(a, equivalences) !== polarityOf(b, equivalences)) return false;

  // Every content word in the shorter list must appear in the longer one.
  const longer = left.length >= right.length ? [...left] : [...right];
  const shorter = left.length >= right.length ? right : left;
  for (const word of shorter) {
    const index = longer.indexOf(word);
    if (index === -1) return false;
    longer.splice(index, 1);
  }
  // At most one unmatched word left over.
  return longer.length <= 1;
}

/** Words that differ between two equal-length normalised forms. */
function differingWords(a: string, b: string): [string, string][] {
  const left = a.split(' ');
  const right = b.split(' ');
  if (left.length !== right.length) return [];
  const out: [string, string][] = [];
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) out.push([left[i], right[i]]);
  }
  return out;
}

/**
 * Spanish opens a question and an exclamation as well as closing it, and
 * `normalize` strips both marks before comparing — so the app has always
 * accepted the omission and never once mentioned it. That is a keystroke the
 * course asks for and then ignores, which is the same shape as the dialogue
 * dash. The difference is that the dash carries nothing and the opening mark is
 * real Spanish, so the fix is opposite: teach it rather than stop asking.
 *
 * Only reported when the answer is otherwise exactly right. A missing ¿ beside
 * a wrong verb is not what the learner needs to hear about.
 */
function missingOpeningMark(input: string, expected: string): '¿' | '¡' | null {
  if (expected.includes('¿') && !input.includes('¿')) return '¿';
  if (expected.includes('¡') && !input.includes('¡')) return '¡';
  return null;
}

/**
 * Function words whose swap is a grammar error rather than a different idea:
 * ser against estar, por against para, an article of the wrong gender.
 */
const FUNCTION_WORDS = new Set([
  'soy', 'eres', 'es', 'somos', 'sois', 'son', 'ser',
  'estoy', 'estas', 'esta', 'estamos', 'estais', 'estan', 'estar',
  'por', 'para', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'lo', 'le', 'les', 'me', 'te', 'se', 'nos', 'os', 'mi', 'tu', 'su',
  'muy', 'mucho', 'hay', 'de', 'a', 'en', 'con', 'sin',
]);

/** Letters two words share from the start. */
function sharedPrefix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

/**
 * What kind of wrong this is.
 *
 * Not a softening — every value returned here maps to `incorrect`. It exists
 * because "wrong" is the least useful thing the app can record about an answer
 * it has just analysed in detail, and because a mistake queue that knows a
 * tense error from a vocabulary error can scaffold the retry differently.
 *
 * The separation is positional, the same insight that separates a typo from a
 * grammar error. Spanish inflection lives at the end of a word, so two words
 * sharing a long prefix and differing at the end are the same word in a
 * different form (hablo/hablas, rojo/rojos). Two words sharing nothing are
 * different words — and if one of them is a function word, the error is
 * grammatical rather than semantic.
 */
function classifyFailure(given: string, expected: string): AnswerError {
  const left = given.split(' ');
  const right = expected.split(' ');

  if (polarityOf(given) !== polarityOf(expected)) return 'negation';

  if (left.length === right.length) {
    const differing: [string, string][] = [];
    for (let i = 0; i < left.length; i += 1) {
      if (deaccent(left[i]) !== deaccent(right[i])) differing.push([left[i], right[i]]);
    }

    if (differing.length > 0 && differing.length <= 2) {
      const [a, b] = differing[0];
      const bareA = deaccent(a);
      const bareB = deaccent(b);

      // Same word, different ending: person, tense, number, gender, mood.
      if (sharedPrefix(bareA, bareB) >= 3 && bareA !== bareB) return 'form';

      // A closed-class swap: ser for estar, por for para, el for la.
      if (FUNCTION_WORDS.has(bareA) || FUNCTION_WORDS.has(bareB)) return 'grammar';
    }
  }

  return 'meaning';
}

export function checkAnswer(
  input: string,
  accepted: string[],
  profile: Partial<GradingProfile> = {},
): CheckResult {
  const language = profile.language ?? 'es';
  const formIsTarget = profile.formIsTarget ?? false;
  const candidates = buildCandidates(accepted, language);
  const fallback = accepted[0] ?? '';

  const raw = normalize(input, language);
  if (raw.length === 0) return outcome('meaning', fallback);

  // Compare as typed, with a leading pronoun removed, and across every
  // mechanically derived Spanish variant — so an added "yo" is fine, a
  // mismatched "tú" is not, and "Te quiero ver" matches "Quiero verte" without
  // either being authored as a second accepted answer.
  const forms =
    language === 'es'
      ? [...new Set(spanishVariants(raw).flatMap((v) => [v, stripSubjectPronoun(v)]))]
      : [raw];
  const givenForms = [...new Set(forms)];
  const bareForms = givenForms.map(deaccent);

  let accentMatch: { display: string; differing: [string, string][] } | null = null;
  let typoMatch: string | null = null;
  // Tracks the candidate object itself, not just its display string: several
  // candidates can share a display (a canonical answer and its pronoun-
  // stripped or contraction-derived variants all show the same author-written
  // text), so looking the closest one back up by display after the loop would
  // find whichever shares that text lists first, not the variant that was
  // actually nearest.
  let closest: { candidate: Candidate; distance: number } | null = null;

  for (const candidate of candidates) {
    if (givenForms.includes(candidate.variant)) {
      // A missing ¿/¡ on the very form the learner produced is the more
      // concrete teachable moment, so it is checked first and wins outright —
      // "preferred" only fires once the matched form's own punctuation is
      // clean. Task 8's check is otherwise untouched.
      const mark = missingOpeningMark(input, candidate.display);
      if (mark !== null) {
        return outcome('punctuation', candidate.display, `Spanish opens it too: ${candidate.display}`);
      }
      return candidate.canonical
        ? outcome('none', candidate.display)
        : outcome('preferred', accepted[0], `Also right. The usual way to say it: ${accepted[0]}`);
    }

    const candidateBare = deaccent(candidate.variant);
    const matchIndex = bareForms.indexOf(candidateBare);
    if (matchIndex !== -1) {
      accentMatch ??= {
        display: candidate.display,
        differing: differingWords(givenForms[matchIndex], candidate.variant),
      };
      continue;
    }

    for (const bare of bareForms) {
      if (typoMatch === null && isTypo(bare, candidateBare)) typoMatch = candidate.display;
      // Tracked whatever the grade, so a wrong answer can still be shown the
      // model answer it came closest to.
      const distance = levenshtein(bare, candidateBare);
      if (!closest || distance < closest.distance) {
        closest = { candidate, distance };
      }
    }
  }

  if (accentMatch !== null) {
    const pair = accentMatch.differing.find(([, expected]) =>
      profile.accentCarriesMeaning?.(expected) ?? false,
    );

    if (pair === undefined) {
      // No accent in this answer distinguishes two real words: café, jardín,
      // años — a phone keyboard, not an error. Strict accents still asks for
      // the mark, though, or the setting would only ever fire on the minority
      // of words that are genuinely ambiguous and would do nothing for the
      // rest of what a learner types.
      const note = `Remember the accents: ${accentMatch.display}`;
      return formIsTarget
        ? outcome('accentContrast', accentMatch.display, note)
        : outcome('accent', accentMatch.display, note);
    }

    /**
     * The accent is the word. `está` is a verb and `esta` is "this"; `habló`
     * is the preterite and `hablo` is the present. Which of those two facts
     * matters depends on what the exercise was asking: inside a conjugation
     * drill, a dictation, or with strict accents on, it is the entire point
     * and the answer is wrong; in ordinary free production the learner
     * produced the whole sentence and slipped on one mark, which is "almost"
     * rather than wrong.
     */
    const note = `${pair[1]} and ${pair[0]} are different words. The accent is the difference.`;
    return formIsTarget
      ? outcome('form', accentMatch.display, note)
      : outcome('accentContrast', accentMatch.display, note);
  }

  if (typoMatch !== null) {
    return outcome('spelling', typoMatch, `Almost — check the spelling: ${typoMatch}`);
  }

  // A profile may declare its own paraphrase mode (a free conversation turn is
  // 'spanishFree' even though its language is 'es'); otherwise it follows from
  // the language, which is why plain Spanish translation defaults to none of
  // this and stays exact.
  const mode = profile.paraphrase ?? (language === 'en' ? 'english' : 'spanish');

  if (mode === 'english') {
    for (const candidate of candidates) {
      // Whole-phrase equivalence first: "a pleasure to meet you" relates to
      // "nice to meet you" as a unit and by no word-level mapping at all.
      const givenPhrase = profile.equivalences?.phrase.get(raw);
      const candidatePhrase = profile.equivalences?.phrase.get(candidate.variant);
      if (givenPhrase !== undefined && givenPhrase === candidatePhrase) {
        return outcome('paraphrase', candidate.display);
      }
      if (sameEnglishMeaning(raw, candidate.variant, profile.equivalences)) {
        return outcome('paraphrase', candidate.display);
      }
    }
  }

  if (mode === 'spanishFree') {
    /**
     * A free conversation turn. Exact matching against four long authored
     * sentences is a test the learner cannot pass, so the question here is
     * whether they said the same thing — and the closest model becomes the
     * answer shown, so they see the natural phrasing they did not quite reach.
     */
    let best: { display: string; score: number } | null = null;
    for (const candidate of candidates) {
      const score = meaningCoverage(raw, candidate.variant, profile.equivalences);
      if (!best || score > best.score) best = { display: candidate.display, score };
    }
    if (best && best.score >= COVERAGE_THRESHOLD) {
      return outcome('paraphrase', best.display, `Natural version: ${best.display}`);
    }
  }

  return outcome(
    classifyFailure(deaccent(raw), deaccent(closest?.candidate.variant ?? normalize(fallback, language))),
    closest?.candidate.display ?? fallback,
  );
}

/**
 * Word-bank and multiple-choice answers are exact by construction, but still go
 * through normalize so a stray space can never fail a correct selection.
 */
export function checkExact(input: string, expected: string): boolean {
  return normalize(input) === normalize(expected);
}
