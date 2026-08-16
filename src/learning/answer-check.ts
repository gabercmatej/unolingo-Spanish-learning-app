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
 *   4. otherwise wrong.
 *
 * Spanish drops subject pronouns freely, so "Voy a comer ahora" and "Yo voy a
 * comer ahora" are both accepted — but only when the pronoun actually agrees
 * with the verb. Silently accepting "tú tengo un perro" would teach the wrong
 * thing, which is worse than rejecting it.
 */

export interface CheckOptions {
  /** Marks accent slips wrong rather than accepting them with a note. */
  strictAccents?: boolean;
  language?: 'es' | 'en';
}

export interface CheckResult {
  grade: Grade;
  /** Shown under the feedback banner when the answer was not perfect. */
  note?: string;
  /** The accepted answer closest to what was typed — shown as the model answer. */
  best: string;
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
  [/\bcan't\b/g, 'cannot'],
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
  if (bare.endsWith('a') || bare.endsWith('e')) return pronoun === 'el' || pronoun === 'yo';
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
}

/** Every accepted answer, plus its pronoun-less form when it has one. */
export function buildCandidates(accepted: string[], language: 'es' | 'en'): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];

  const add = (variant: string, display: string) => {
    if (variant.length === 0 || seen.has(variant)) return;
    seen.add(variant);
    out.push({ variant, display });
  };

  for (const answer of accepted) {
    const normalized = normalize(answer, language);
    add(normalized, answer);
    if (language === 'es') add(stripSubjectPronoun(normalized), answer);
  }
  return out;
}

/** Edit distance tolerated before an answer stops counting as a typo. */
function typoTolerance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 10) return 1;
  return 2;
}

/**
 * Words that carry no meaning for a comprehension check. Dropping them lets
 * "and you?" match "and you" and "the coffee" match "coffee".
 */
const EN_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'do', 'does', 'did', 'to', 'of', 'that', 'it', 'its',
  'some', 'any', 'so', 'just', 'really', 'quite', 'at', 'in', 'on',
]);

/**
 * English words that mean the same thing here. Translating into English is a
 * *comprehension* check — if the learner shows they understood, quibbling over
 * "well" versus "good" teaches nothing about Spanish.
 */
const EN_SYNONYMS: Record<string, string> = {
  well: 'good',
  fine: 'good',
  great: 'good',
  hi: 'hello',
  hey: 'hello',
  movie: 'film',
  movies: 'film',
  films: 'film',
  flat: 'apartment',
  mum: 'mother',
  mom: 'mother',
  dad: 'father',
  photo: 'picture',
  cash: 'money',
  mate: 'friend',
  buddy: 'friend',
  guy: 'man',
  kid: 'child',
  children: 'child',
  kids: 'child',
  wanna: 'want',
  gonna: 'going',
  shall: 'will',
  cannot: 'can',
  'can not': 'can',
  tired: 'tired',
  house: 'home',
  automobile: 'car',
  underground: 'metro',
  subway: 'metro',
  tube: 'metro',
  lunch: 'lunch',
  bill: 'check',
  holiday: 'vacation',
  autumn: 'fall',
  lift: 'elevator',
  queue: 'line',
};

/** Content words of an English answer, normalised for comparison. */
function contentWords(text: string): string[] {
  return deaccent(text)
    .split(' ')
    .filter(Boolean)
    .map((word) => EN_SYNONYMS[word] ?? word)
    .filter((word) => !EN_STOPWORDS.has(word))
    .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word))
    .sort();
}

/**
 * Do two English answers say the same thing? Compares content words as a
 * multiset, so word order and filler differences do not matter but a genuinely
 * different meaning still fails.
 */
function sameEnglishMeaning(a: string, b: string): boolean {
  const left = contentWords(a);
  const right = contentWords(b);
  if (left.length === 0 || right.length === 0) return false;
  if (Math.abs(left.length - right.length) > 1) return false;

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

export function checkAnswer(
  input: string,
  accepted: string[],
  options: CheckOptions = {},
): CheckResult {
  const language = options.language ?? 'es';
  const candidates = buildCandidates(accepted, language);
  const fallback = accepted[0] ?? '';

  const raw = normalize(input, language);
  if (raw.length === 0) return { grade: 'incorrect', best: fallback };

  // Compare both as typed and with a leading pronoun removed, so an added
  // "yo" is fine but a mismatched "tú" is not.
  const forms = language === 'es' ? [raw, stripSubjectPronoun(raw)] : [raw];
  const givenForms = [...new Set(forms)];
  const bareForms = givenForms.map(deaccent);

  let accentOnlyMatch: string | null = null;
  let closest: { answer: string; distance: number } | null = null;

  for (const candidate of candidates) {
    if (givenForms.includes(candidate.variant)) {
      return { grade: 'correct', best: candidate.display };
    }

    const candidateBare = deaccent(candidate.variant);
    if (bareForms.includes(candidateBare)) {
      accentOnlyMatch ??= candidate.display;
      continue;
    }

    for (const bare of bareForms) {
      const distance = levenshtein(bare, candidateBare);
      if (!closest || distance < closest.distance) {
        closest = { answer: candidate.display, distance };
      }
    }
  }

  if (accentOnlyMatch !== null) {
    const note = `Right meaning — remember the accents: ${accentOnlyMatch}`;
    return options.strictAccents
      ? { grade: 'almost', note, best: accentOnlyMatch }
      : { grade: 'correct', note, best: accentOnlyMatch };
  }

  if (closest && closest.distance <= typoTolerance(bareForms[0].length)) {
    return {
      grade: 'almost',
      note: `Almost — check the spelling: ${closest.answer}`,
      best: closest.answer,
    };
  }

  // Translating *into English* is a comprehension check, so accept any phrasing
  // that carries the same meaning. This never applies to Spanish answers, where
  // the exact form is the thing being taught.
  if (language === 'en') {
    for (const candidate of candidates) {
      if (sameEnglishMeaning(raw, candidate.variant)) {
        return { grade: 'correct', best: candidate.display };
      }
    }
  }

  return { grade: 'incorrect', best: closest?.answer ?? fallback };
}

/**
 * Word-bank and multiple-choice answers are exact by construction, but still go
 * through normalize so a stray space can never fail a correct selection.
 */
export function checkExact(input: string, expected: string): boolean {
  return normalize(input) === normalize(expected);
}
