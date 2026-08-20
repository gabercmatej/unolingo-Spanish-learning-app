import {
  conversations,
  getConcept,
  getCultureNote,
  getGrammar,
  getSentencesForConcept,
  getVerb,
  isGrammarConcept,
  isVocabConcept,
  levelIndex,
  sentences as allSentences,
  stories,
  vocabConcepts,
} from '@/content';
import { errorDrills, naturalDrills } from '@/content/drills';
import {
  personBearingToken,
  sentencesForForm,
  supportedPersons,
} from '@/content/verb-corpus';
import { personsWithForms } from '@/content/verb-utils';
import {
  CEFR_LEVELS,
  PERSON_LABELS,
  type CefrLevel,
  type Sentence,
  type VocabConcept,
} from '@/content/types';
import type {
  ChoiceExercise,
  ChoiceOption,
  ConversationExercise,
  Exercise,
  MatchExercise,
  TypedExercise,
  WordBankExercise,
} from '@/learning/exercise';
import {
  eligibleSentences,
  unknownConcepts,
  type Knowledge,
} from '@/learning/eligibility';
import { mastery } from '@/learning/srs';
import {
  KIND_DIFFICULTY,
  KIND_SKILL,
  KIND_XP,
  type ConceptState,
  type ExerciseKind,
  type Settings,
} from '@/learning/types';
import type { SkillBalance } from '@/learning/mastery';

/**
 * Turns a concept plus the learner's memory of it into an exercise.
 *
 * Two rules drive everything here:
 *
 *   • **Progressive production.** A concept first appears as recognition, then
 *     as reconstruction, then as free production. `pickKind` reads the concept's
 *     strength and depth and returns the shallowest kind that is still
 *     challenging — so you are neither drilling something you own nor being
 *     asked to produce something you have only just met.
 *   • **Never repeat the frame.** Kinds already used recently for a concept are
 *     down-weighted, so the same word comes back wearing a different hat.
 */

export interface GenContext {
  settings: Settings;
  now: number;
  rng: () => number;
  /** Kinds to avoid because they were just used. */
  recentKinds?: ExerciseKind[];
  /**
   * The learner's demonstrated CEFR level. From B2 the exercise mix shifts
   * towards production — see `candidateKinds`.
   */
  level?: CefrLevel;
  /**
   * Which skills sit ahead of and behind this learner's own average. The
   * overall level decides *how hard* the mix is; this decides how that hardness
   * is distributed, so a B2 reader who produces at A2 is not handed B2
   * production. See `candidateKinds`.
   */
  skills?: SkillBalance;
  /**
   * What the learner has been introduced to, and how far they may be pushed.
   *
   * Undefined means "do not gate" — the placement test and the content audit
   * both generate for a learner who has no history at all, and gating those
   * would produce nothing. Every session built from a real learner passes it.
   */
  knowledge?: Knowledge;
  /**
   * Sentences already used in this session.
   *
   * Repetition is how a word sticks; repeating the *same line* is how a learner
   * memorises one sentence and learns nothing. The generator mutates this as it
   * goes, so a concept that comes back later in the session comes back in a
   * different context as well as a different exercise kind.
   */
  usedSentences?: Set<string>;
}

// --- Randomness -------------------------------------------------------------

/** Deterministic PRNG so a generated session can be reproduced in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(items: T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

function sample<T>(items: T[], count: number, rng: () => number): T[] {
  return shuffle(items, rng).slice(0, count);
}

let idCounter = 0;
function exerciseId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

// --- Confusable forms -------------------------------------------------------

/**
 * Word pairs learners genuinely mix up. Used to build "grammar challenge"
 * exercises straight from any sentence containing one of them, and to pick
 * distractors that teach rather than pad.
 */
const CONFUSION_SETS: string[][] = [
  ['soy', 'estoy'],
  ['eres', 'estás'],
  ['es', 'está'],
  ['somos', 'estamos'],
  ['sois', 'estáis'],
  ['son', 'están'],
  ['ser', 'estar'],
  ['por', 'para'],
  ['hay', 'está'],
  ['muy', 'mucho'],
  ['gusta', 'gustan'],
  ['apetece', 'apetecen'],
  ['fui', 'iba'],
  ['fue', 'era'],
  ['estuve', 'estaba'],
  ['tuve', 'tenía'],
  ['hice', 'hacía'],
  ['comí', 'comía'],
  ['hablé', 'hablaba'],
  ['vivía', 'viví'],
  ['sé', 'conozco'],
  ['sabes', 'conoces'],
  ['tengo', 'soy'],
  ['tengo', 'estoy'],
  ['pero', 'porque'],
  ['porque', 'por qué'],
  ['billete', 'entrada'],
  ['coger', 'tomar'],
  ['he', 'ha'],
  ['has', 'ha'],
  ['hemos', 'habéis'],
  ['me', 'te'],
  ['te', 'os'],
  ['nos', 'os'],
  ['vengas', 'vienes'],
  ['guste', 'gusta'],
  ['este', 'esta'],
  ['un', 'una'],
  ['el', 'la'],
];

function confusablesFor(word: string): string[] | null {
  const lower = word.toLowerCase();
  for (const set of CONFUSION_SETS) {
    if (set.includes(lower)) return set.filter((w) => w !== lower);
  }
  return null;
}

// --- Text helpers -----------------------------------------------------------

const PUNCTUATION = /[¿?¡!.,;:«»"]/g;

function bareWord(token: string): string {
  return token.replace(PUNCTUATION, '').toLowerCase();
}

function tokenize(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

/**
 * Dialogue dashes, as Spanish punctuates a two-speaker exchange.
 *
 * They are typography, not language. In a word bank they became a tile the
 * learner had to place — "— " sitting in the bank between "hola" and "gracias",
 * carrying no meaning and testing nothing except whether you had noticed the
 * app wanted it. Where the dash is attached to the next word it is worse: the
 * tile reads "—¿Qué" and the word underneath is hidden inside the punctuation.
 *
 * `normalize` in `answer-check.ts` has always stripped these before comparing,
 * so removing them from what the learner has to assemble changes nothing about
 * grading — it only stops the app asking for a keystroke it was never going to
 * check.
 */
const DIALOGUE_DASH = /[—–]/g;

/**
 * The sentence as the learner has to reconstruct it: same words, no dialogue
 * dashes. Used for word banks and typed hints, never for display or audio —
 * the dash is right in both of those.
 */
export function practiceText(sentence: string): string {
  return sentence.replace(DIALOGUE_DASH, ' ').replace(/\s+/g, ' ').trim();
}

/** Tokens for a word bank: the reconstructable sentence, split. */
function practiceTokens(sentence: string): string[] {
  return tokenize(practiceText(sentence));
}

/** Replaces the first occurrence of `word` with a gap, preserving punctuation. */
function blankOut(sentence: string, word: string): { template: string; answer: string } | null {
  const tokens = tokenize(sentence);
  const target = bareWord(word);
  const index = tokens.findIndex((token) => bareWord(token) === target);
  if (index === -1) return null;

  const original = tokens[index];
  const leading = original.match(/^[¿¡"«]*/)?.[0] ?? '';
  const trailing = original.match(/[?!.,;:»"]*$/)?.[0] ?? '';
  const core = original.slice(leading.length, original.length - trailing.length);

  tokens[index] = `${leading}___${trailing}`;
  return { template: tokens.join(' '), answer: core };
}

/** The word in a sentence that carries a given vocabulary concept, if any. */
function conceptWordIn(sentence: Sentence, concept: VocabConcept): string | null {
  const headwords = concept.es
    .split('/')
    .map((part) => part.trim().replace(/^(el|la|los|las|un|una)\s+/i, ''))
    .filter(Boolean);

  const tokens = tokenize(sentence.es);
  for (const headword of headwords) {
    // Multi-word expressions: only usable if present verbatim.
    if (headword.includes(' ')) {
      if (sentence.es.toLowerCase().includes(headword.toLowerCase())) return headword;
      continue;
    }
    const match = tokens.find((token) => bareWord(token) === headword.toLowerCase());
    if (match) return bareWord(match);
  }
  return null;
}

// --- Distractors ------------------------------------------------------------

function englishDistractors(
  concept: VocabConcept,
  count: number,
  rng: () => number,
): string[] {
  const confusable = (concept.confusableWith ?? [])
    .map((id) => getConcept(id))
    .filter((c): c is VocabConcept => !!c && isVocabConcept(c))
    .map((c) => c.en);

  const sameKind = vocabConcepts.filter(
    (c) =>
      c.id !== concept.id &&
      c.en !== concept.en &&
      c.pos === concept.pos &&
      Math.abs(levelIndex(c.level) - levelIndex(concept.level)) <= 1,
  );

  const pool = [...confusable, ...sample(sameKind, count * 3, rng).map((c) => c.en)];
  const seen = new Set<string>([concept.en]);
  const out: string[] = [];
  for (const option of pool) {
    if (seen.has(option)) continue;
    seen.add(option);
    out.push(option);
    if (out.length === count) break;
  }

  // Last resort: any vocabulary at all, so an exercise is never malformed.
  if (out.length < count) {
    for (const c of shuffle(vocabConcepts, rng)) {
      if (seen.has(c.en)) continue;
      seen.add(c.en);
      out.push(c.en);
      if (out.length === count) break;
    }
  }
  return out;
}

function spanishDistractors(concept: VocabConcept, count: number, rng: () => number): string[] {
  const confusable = (concept.confusableWith ?? [])
    .map((id) => getConcept(id))
    .filter((c): c is VocabConcept => !!c && isVocabConcept(c))
    .map((c) => c.es);

  const sameKind = vocabConcepts.filter(
    (c) => c.id !== concept.id && c.pos === concept.pos && c.es !== concept.es,
  );

  const pool = [...confusable, ...sample(sameKind, count * 3, rng).map((c) => c.es)];
  const seen = new Set<string>([concept.es]);
  const out: string[] = [];
  for (const option of pool) {
    if (seen.has(option)) continue;
    seen.add(option);
    out.push(option);
    if (out.length === count) break;
  }

  // Rare parts of speech can exhaust the same-kind pool; fall back to anything
  // so a multiple choice is never generated with a single option.
  if (out.length < count) {
    for (const other of shuffle(vocabConcepts, rng)) {
      if (seen.has(other.es)) continue;
      seen.add(other.es);
      out.push(other.es);
      if (out.length === count) break;
    }
  }
  return out;
}

// --- Kind selection ---------------------------------------------------------

const RECOGNITION: ExerciseKind[] = ['multipleChoice', 'listenSelect', 'match'];
const RECONSTRUCTION: ExerciseKind[] = ['wordBank', 'translateToEn', 'grammarChoice', 'fillBlank'];
const PRODUCTION: ExerciseKind[] = ['translateToEs', 'dictation', 'correctMistake', 'chooseNatural'];
const FREE: ExerciseKind[] = [
  'buildResponse',
  'translateToEs',
  'dictation',
  'listenComprehend',
  'speak',
];

/**
 * Recognition where the discriminating *is* the skill — telling apart two
 * registers, hearing a minimal pair, picking the phrasing a native would
 * actually use. These stay first-class at every level.
 */
const DISCRIMINATION: ExerciseKind[] = ['chooseNatural', 'grammarChoice', 'listenSelect'];

/**
 * Recognition that is only ever easier than producing the answer. Still
 * available at advanced levels, but demoted so it is reached when nothing else
 * has the material rather than offered as a soft option.
 */
const PLAIN_RECOGNITION: ExerciseKind[] = ['multipleChoice', 'match'];

/**
 * Picks the exercise depth for a concept. The learner should spend most of
 * their time just past what they can already do comfortably.
 */
export function candidateKinds(state: ConceptState | undefined, ctx: GenContext): ExerciseKind[] {
  const hard = ctx.settings.hardMode;
  /**
   * From B2 the experience itself changes: picking the right answer from four
   * buttons stops being evidence of anything at that level, so recognition is
   * reserved for genuinely new material and everything else moves up a tier.
   */
  const advanced = ctx.level ? CEFR_LEVELS.indexOf(ctx.level) >= CEFR_LEVELS.indexOf('B2') : false;

  /**
   * A concept met moments ago, in the lesson that introduced it.
   *
   * This branch used to `return` outright, which skipped the freshness and
   * recency pass at the bottom of this function — so the order was always
   * exactly `RECOGNITION`, `multipleChoice` always came first, and it always
   * had the material it needed. A lesson introducing eight new words produced
   * eight teaching cards followed by eight multiple choices in a row: correct
   * by every test in the suite, and the dullest possible way to meet a word.
   * The tiers are still the gentle ones; only the ordering is now shared.
   */
  const unseen = !state || state.timesSeen === 0;

  let tiers: ExerciseKind[];

  if (unseen) {
    tiers = hard
      ? [...RECONSTRUCTION]
      : advanced
        ? [...RECONSTRUCTION.slice(0, 3), 'translateToEn']
        : [...RECOGNITION, 'translateToEn'];
  } else {
    const strength = mastery(state, ctx.now);

    if (strength < 0.3) tiers = [...RECOGNITION, 'translateToEn', 'wordBank'];
    else if (strength < 0.55) tiers = [...RECONSTRUCTION, 'listenSelect'];
    else if (strength < 0.78) tiers = [...PRODUCTION, ...RECONSTRUCTION.slice(0, 2)];
    else tiers = [...FREE, ...PRODUCTION];

    if (advanced && !hard) {
      // Shift one tier up rather than removing recognition outright — a B2
      // learner meeting a brand-new word still deserves a gentle first pass,
      // which is why this sits inside the `unseen` else-branch.
      if (strength >= 0.3 && strength < 0.55) tiers = [...PRODUCTION, ...RECONSTRUCTION.slice(0, 2)];
      else if (strength >= 0.55) tiers = [...FREE, ...PRODUCTION];
      // Keep the discriminating kinds in play — at C1 choosing between two
      // registers is harder than translating a sentence, not easier. Plain
      // recognition stays on the end as a genuine fallback for concepts with
      // nothing else to build from.
      tiers = [...tiers, ...DISCRIMINATION, ...PLAIN_RECOGNITION];
    }
  }

  if (hard) {
    // Hard mode removes anything with a word bank or a list to choose from.
    const stripped = tiers.filter(
      (kind) => !['multipleChoice', 'match', 'wordBank', 'listenSelect'].includes(kind),
    );
    tiers = stripped.length > 0 ? stripped : ['translateToEs', 'dictation'];
  }

  if (!ctx.settings.speakingExercises) tiers = tiers.filter((kind) => kind !== 'speak');

  // Prefer kinds this concept has not been tested with yet, then anything not
  // used in the last few exercises.
  const attempted = state?.kinds ?? [];
  const fresh = tiers.filter((kind) => !attempted.includes(kind));
  const notRecent = (list: ExerciseKind[]) =>
    list.filter((kind) => !(ctx.recentKinds ?? []).includes(kind));

  const ordered = [...new Set([...notRecent(fresh), ...notRecent(tiers), ...fresh, ...tiers])];

  /**
   * Applied last, after the freshness shuffle, or a never-used multipleChoice
   * would jump the queue on novelty alone. At advanced levels plain recognition
   * becomes the fallback rather than the offer — never a stand-in for producing
   * the answer, but still there when a concept has nothing else to build from.
   *
   * The same pass calibrates per skill. Ability is not uniform: a learner can
   * read at B2 and produce at A2, and one overall estimate would hand them B2
   * production. So within a lagging skill the *demanding* kinds step back and
   * the gentler ones come forward, and within a leading skill the reverse.
   * Nothing is ever removed — a lagging skill still gets practised, just at a
   * difficulty the learner can actually meet, which is the only way it stops
   * lagging.
   */
  return rankForLearner(ordered, ctx, advanced && !hard && !unseen);
}

/**
 * Difficulty at which a kind stops being a gentle way into its skill. Below it,
 * a kind is scaffolding; at or above, it is a demand.
 */
const DEMANDING = 4;

function rankForLearner(
  kinds: ExerciseKind[],
  ctx: GenContext,
  demotePlainRecognition: boolean,
): ExerciseKind[] {
  const lagging = new Set(ctx.skills?.lagging ?? []);
  const leading = new Set(ctx.skills?.leading ?? []);

  const rank = (kind: ExerciseKind): number => {
    let score = 0;
    // Plain recognition outranked by everything else, as before.
    if (demotePlainRecognition && PLAIN_RECOGNITION.includes(kind)) score += 4;

    const skill = KIND_SKILL[kind];
    if (skill && KIND_DIFFICULTY[kind] >= DEMANDING) {
      if (lagging.has(skill)) score += 2;
      else if (leading.has(skill)) score -= 1;
    }
    return score;
  };

  // Sort is stable, so kinds of equal rank keep the freshness order above.
  return [...kinds].sort((a, b) => rank(a) - rank(b));
}

// --- Builders ---------------------------------------------------------------

function base(kind: ExerciseKind, conceptIds: string[]) {
  return {
    id: exerciseId(kind),
    kind,
    conceptIds,
    difficulty: KIND_DIFFICULTY[kind],
    xp: KIND_XP[kind],
  };
}

function audioFor(sentence: Sentence, hideText: boolean) {
  if (sentence.noAudio) return undefined;
  return { text: sentence.es, hideText };
}

export function buildTeachCard(concept: VocabConcept, ctx?: GenContext): Exercise {
  const pool = getSentencesForConcept(concept.id);
  /**
   * Examples the learner can actually read come first. A card introducing
   * "quedar" whose only illustration is a C1 sentence has taught the word and
   * demonstrated nothing — the example is supposed to be the moment the meaning
   * lands. Anything eligible is preferred; the rest still show up behind them,
   * because a card with no example at all is worse than a hard one.
   */
  const readable = eligibleSentences(pool, 'translateToEn', ctx?.knowledge, [concept.id]);
  const ordered = [...readable, ...pool.filter((s) => !readable.includes(s))];
  const examples = ordered
    .slice(0, 3)
    .map((sentence) => ({ es: sentence.es, en: sentence.en, note: sentence.note }));

  return {
    ...base('teach', [concept.id]),
    form: 'presentation',
    kind: 'teach',
    instruction: 'New word',
    concept,
    examples,
  };
}

export function buildGrammarCard(grammarId: string): Exercise | null {
  const grammar = getGrammar(grammarId);
  if (!grammar) return null;
  return {
    ...base('grammarCard', [grammar.id]),
    form: 'presentation',
    kind: 'grammarCard',
    instruction: 'Grammar',
    grammar,
  };
}

export function buildCultureCard(cultureId: string): Exercise | null {
  const culture = getCultureNote(cultureId);
  if (!culture) return null;
  return {
    ...base('cultureCard', []),
    form: 'presentation',
    kind: 'cultureCard',
    instruction: 'Culture',
    culture,
  };
}

function buildMultipleChoice(
  concept: VocabConcept,
  ctx: GenContext,
  reverse: boolean,
): ChoiceExercise {
  const distractors = reverse
    ? spanishDistractors(concept, 3, ctx.rng)
    : englishDistractors(concept, 3, ctx.rng);

  const correct: ChoiceOption = { text: reverse ? concept.es : concept.en };
  const options = shuffle(
    [correct, ...distractors.map((text) => ({ text }))],
    ctx.rng,
  );

  return {
    ...base('multipleChoice', [concept.id]),
    form: 'choice',
    instruction: reverse ? 'How do you say this?' : 'What does this mean?',
    prompt: reverse ? concept.en : concept.es,
    promptIsSpanish: !reverse,
    promptSub: reverse ? undefined : undefined,
    audio: reverse ? undefined : { text: concept.es, hideText: false },
    options,
    answerIndex: options.indexOf(correct),
    note: concept.note,
  };
}

function buildListenSelect(sentence: Sentence, ctx: GenContext, conceptIds: string[]): ChoiceExercise | null {
  if (sentence.noAudio) return null;
  const pool = allSentences.filter(
    (other) =>
      other.id !== sentence.id &&
      Math.abs(other.es.length - sentence.es.length) < 18 &&
      Math.abs(levelIndex(other.level) - levelIndex(sentence.level)) <= 1,
  );
  const distractors = sample(pool, 3, ctx.rng);
  if (distractors.length < 2) return null;

  const correct: ChoiceOption = { text: sentence.es };
  const options = shuffle([correct, ...distractors.map((s) => ({ text: s.es }))], ctx.rng);

  return {
    ...base('listenSelect', conceptIds),
    form: 'choice',
    instruction: 'What did you hear?',
    prompt: '',
    audio: { text: sentence.es, hideText: true },
    options,
    answerIndex: options.indexOf(correct),
    note: sentence.note,
  };
}

function buildListenComprehend(
  sentence: Sentence,
  ctx: GenContext,
  conceptIds: string[],
): ChoiceExercise | null {
  if (sentence.noAudio) return null;
  const pool = allSentences.filter(
    (other) => other.id !== sentence.id && other.en !== sentence.en,
  );
  const distractors = sample(pool, 3, ctx.rng);
  if (distractors.length < 2) return null;

  const correct: ChoiceOption = { text: sentence.en };
  const options = shuffle([correct, ...distractors.map((s) => ({ text: s.en }))], ctx.rng);

  return {
    ...base('listenComprehend', conceptIds),
    form: 'choice',
    instruction: 'Listen. What does it mean?',
    prompt: '',
    audio: { text: sentence.es, hideText: true },
    options,
    answerIndex: options.indexOf(correct),
    note: sentence.note,
  };
}

function buildWordBank(sentence: Sentence, ctx: GenContext, conceptIds: string[]): WordBankExercise {
  const answer = practiceText(sentence.es);
  const answerTokens = practiceTokens(sentence.es);
  const distractorPool = allSentences
    .filter((other) => other.id !== sentence.id)
    .flatMap((other) => practiceTokens(other.es))
    .filter((token) => !answerTokens.some((t) => bareWord(t) === bareWord(token)));

  const extraCount = answerTokens.length > 6 ? 2 : 3;
  const distractors = [...new Set(sample(distractorPool, extraCount * 3, ctx.rng))].slice(
    0,
    extraCount,
  );

  return {
    ...base('wordBank', conceptIds),
    form: 'wordBank',
    instruction: 'Build the Spanish sentence',
    prompt: sentence.en,
    tokens: shuffle([...answerTokens, ...distractors], ctx.rng),
    answer,
    // Graded against the authored sentence, dashes and all: `normalize` strips
    // them, so the answer the learner builds and the answer the author wrote
    // compare equal without either being rewritten to suit the other.
    accepted: [sentence.es, ...(sentence.altEs ?? [])],
    note: sentence.note,
  };
}

function buildTranslateToEn(sentence: Sentence, conceptIds: string[]): TypedExercise {
  return {
    ...base('translateToEn', conceptIds),
    form: 'typed',
    instruction: 'Translate into English',
    prompt: sentence.es,
    promptIsSpanish: true,
    audio: audioFor(sentence, false),
    accepted: [sentence.en, ...(sentence.altEn ?? [])],
    language: 'en',
    placeholder: 'Type in English',
    note: sentence.note,
  };
}

function buildTranslateToEs(
  sentence: Sentence,
  ctx: GenContext,
  conceptIds: string[],
): TypedExercise {
  const words = practiceTokens(sentence.es);
  const hints = ctx.settings.hardMode
    ? undefined
    : sample(words, Math.min(4, words.length), ctx.rng);

  return {
    ...base('translateToEs', conceptIds),
    form: 'typed',
    instruction: 'Translate into Spanish',
    prompt: sentence.en,
    accepted: [sentence.es, ...(sentence.altEs ?? [])],
    language: 'es',
    hints,
    placeholder: 'Escribe en español',
    note: sentence.note,
  };
}

function buildDictation(sentence: Sentence, conceptIds: string[]): TypedExercise | null {
  if (sentence.noAudio) return null;
  return {
    ...base('dictation', conceptIds),
    form: 'typed',
    instruction: 'Type exactly what you hear',
    prompt: '',
    audio: { text: sentence.es, hideText: true },
    accepted: [sentence.es],
    language: 'es',
    placeholder: 'Escribe lo que oyes',
    note: sentence.note,
  };
}

function buildFillBlank(
  sentence: Sentence,
  word: string,
  ctx: GenContext,
  conceptIds: string[],
): TypedExercise | null {
  const blanked = blankOut(sentence.es, word);
  if (!blanked) return null;

  return {
    ...base('fillBlank', conceptIds),
    form: 'typed',
    instruction: 'Fill in the gap',
    prompt: blanked.template,
    promptSub: sentence.en,
    promptIsSpanish: true,
    template: blanked.template,
    audio: audioFor(sentence, true),
    accepted: [blanked.answer],
    language: 'es',
    placeholder: 'Una palabra',
    note: sentence.note,
  };
}

function buildGrammarChoice(
  sentence: Sentence,
  ctx: GenContext,
  conceptIds: string[],
): ChoiceExercise | null {
  const tokens = tokenize(sentence.es);
  const candidates = tokens
    .map((token) => ({ token, alternatives: confusablesFor(bareWord(token)) }))
    .filter((entry) => entry.alternatives !== null);

  const chosen = pick(candidates, ctx.rng);
  if (!chosen || !chosen.alternatives) return null;

  const blanked = blankOut(sentence.es, chosen.token);
  if (!blanked) return null;

  const correct: ChoiceOption = { text: blanked.answer };
  const alternatives = chosen.alternatives.slice(0, 3).map((text) => ({ text }));
  const options = shuffle([correct, ...alternatives], ctx.rng);

  return {
    ...base('grammarChoice', conceptIds),
    form: 'choice',
    instruction: 'Choose the correct form',
    prompt: blanked.template,
    promptSub: sentence.en,
    promptIsSpanish: true,
    options,
    answerIndex: options.indexOf(correct),
    note: sentence.note,
  };
}

function buildCorrectMistake(conceptIds: string[], ctx: GenContext): TypedExercise | null {
  const relevant = errorDrills.filter(
    (drill) =>
      drill.concepts.some((id) => conceptIds.includes(id)) &&
      // Fixing a sentence means writing it, so every concept it turns on has to
      // be one the learner has met — the same rule the sentence pool follows,
      // applied to the hand-authored drills, which reach the learner through a
      // `some()` filter and would otherwise sail past the gate entirely.
      knownConcepts(drill.concepts, conceptIds, ctx),
  );
  const drill = pick(relevant, ctx.rng);
  if (!drill) return null;

  return {
    ...base('correctMistake', drill.concepts),
    form: 'typed',
    instruction: 'This sentence has a mistake. Fix it.',
    prompt: drill.wrong,
    promptIsSpanish: true,
    accepted: drill.accepted,
    language: 'es',
    placeholder: 'Escribe la frase corregida',
    note: drill.explanation,
  };
}

function buildChooseNatural(conceptIds: string[], ctx: GenContext): ChoiceExercise | null {
  const relevant = naturalDrills.filter(
    (drill) =>
      drill.concepts.some((id) => conceptIds.includes(id)) &&
      // Choosing between two phrasings is recognition, so one unmet concept is
      // survivable — the options are on screen with their glosses.
      knownConcepts(drill.concepts, conceptIds, ctx, 1),
  );
  const drill = pick(relevant, ctx.rng);
  if (!drill) return null;

  const options = shuffle(drill.options, ctx.rng);
  const answerIndex = options.findIndex((option) => option.natural);

  return {
    ...base('chooseNatural', drill.concepts),
    form: 'choice',
    instruction: 'Which sounds natural in Spain?',
    prompt: drill.situation,
    options: options.map((option) => ({ text: option.es, sub: option.en, note: option.note })),
    answerIndex,
    note: options[answerIndex]?.note,
  };
}

function buildMatch(concept: VocabConcept, ctx: GenContext): MatchExercise | null {
  const related = vocabConcepts.filter(
    (other) =>
      other.id !== concept.id &&
      other.topics.some((topic) => concept.topics.includes(topic)) &&
      Math.abs(levelIndex(other.level) - levelIndex(concept.level)) <= 1,
  );

  /**
   * A match grid scores every pair in it, so the words filling it out are not
   * decoration — they are four concepts credited from one answer. Drawing them
   * from anywhere meant a grid built around a word the lesson had just taught
   * could quietly mark three the learner had never seen as practised, which is
   * `mergeIds`' bug wearing a different shape. Met concepts first; anything
   * unmet that has to fill a gap is carried as support and never scored.
   */
  const known = ctx.knowledge;
  const met = known ? related.filter((other) => known.known.has(other.id)) : related;
  const others = met.length >= 3 ? sample(met, 3, ctx.rng) : sample(related, 3, ctx.rng);
  if (others.length < 3) return null;

  const unmet = known ? others.filter((other) => !known.known.has(other.id)) : [];

  const pairs = shuffle(
    [concept, ...others].map((c) => ({ es: c.es, en: c.en })),
    ctx.rng,
  );

  const unmetIds = new Set(unmet.map((other) => other.id));
  return {
    ...base('match', [concept.id, ...others.map((c) => c.id).filter((id) => !unmetIds.has(id))]),
    form: 'match',
    instruction: 'Match the pairs',
    pairs,
    supportIds: unmet.length > 0 ? [...unmetIds] : undefined,
  };
}

/**
 * A standalone "build a response" drawn from a conversation turn — the same
 * authored material the conversation lessons use, reused as free production.
 */
function buildResponse(conceptIds: string[], ctx: GenContext): TypedExercise | null {
  const turns = conversations.flatMap((scene) =>
    scene.turns
      .filter(
        (turn) =>
          turn.speaker === 'you' &&
          turn.instruction &&
          turn.accepted &&
          turn.accepted.length > 0 &&
          (turn.concepts ?? []).some((id) => conceptIds.includes(id)) &&
          // The single most demanding kind in the app: the learner writes a
          // reply from nothing. Everything it turns on must have been taught.
          knownConcepts(turn.concepts ?? [], conceptIds, ctx),
      )
      .map((turn) => ({ scene, turn })),
  );

  const chosen = pick(turns, ctx.rng);
  if (!chosen) return null;

  return {
    ...base('buildResponse', chosen.turn.concepts ?? conceptIds),
    form: 'typed',
    instruction: chosen.scene.setting,
    prompt: chosen.turn.instruction!,
    accepted: chosen.turn.accepted!,
    language: 'es',
    hints: ctx.settings.hardMode ? undefined : chosen.turn.hints,
    placeholder: 'Escribe tu respuesta',
    note: chosen.turn.note,
  };
}

/** Conjugation practice, always inside a sentence rather than a bare table. */
function buildVerbForm(
  verbId: string,
  tense: string,
  conceptId: string,
  ctx: GenContext,
): TypedExercise | ChoiceExercise | null {
  const verb = getVerb(verbId);
  const conjugation = verb?.tenses[tense as keyof typeof verb.tenses];
  if (!verb || !conjugation) return null;

  /**
   * Prefer a person the corpus can actually illustrate, so conjugation is
   * practised inside a sentence rather than as a bare table. `supportedPersons`
   * comes from the derived corpus index, which is also what `audit:content`
   * reports — the exercise the learner gets and the number the audit prints
   * cannot drift apart.
   *
   * A quarter of the time we still take any person at random, so the explicit
   * person → form drill keeps appearing and every person stays reachable even
   * where the corpus is thin.
   */
  const supported = supportedPersons(conceptId);
  const preferContext = supported.length > 0 && ctx.rng() > 0.25;
  /**
   * Only persons this paradigm actually has. The imperative has no first-person
   * singular, so a blind `?? 'yo'` fallback would ask the learner to produce a
   * form that does not exist in the language.
   */
  const available = personsWithForms(conjugation);
  if (available.length === 0) return null;
  const person =
    (preferContext ? pick(supported, ctx.rng) : pick(available, ctx.rng)) ?? available[0];
  const answer = conjugation.forms[person];
  if (!answer) return null;

  if (preferContext) {
    const sentence = pick(sentencesForForm(conceptId, person), ctx.rng);
    if (sentence) {
      /**
       * Blank the token that carries the person, not the whole form. A compound
       * or reflexive form spans several tokens, so blanking the lot matched no
       * single token and silently produced nothing — which is why every present
       * perfect and every reflexive was table-only before this.
       */
      const blanked = blankOut(sentence.es, personBearingToken(answer));
      if (blanked) {
        const compound = answer.split(/\s+/).length > 1;
        return {
          ...base('fillBlank', [conceptId]),
          form: 'typed',
          instruction: compound
            ? `Fill the gap — ${verb.infinitive}, ${PERSON_LABELS[person].split(' /')[0]}`
            : `Fill the gap — ${verb.infinitive}`,
          prompt: blanked.template,
          promptSub: sentence.en,
          promptIsSpanish: true,
          template: blanked.template,
          accepted: [blanked.answer],
          language: 'es',
          placeholder: 'Una palabra',
          note: sentence.note,
        };
      }
    }
  }

  /**
   * Spanish paradigms are syncretic: in the imperfect, the conditional and the
   * present subjunctive, `yo` and `él` share a form, and other persons collide
   * in individual verbs. Filtering only forms equal to the answer therefore
   * still leaves duplicate *distractors*, which would offer the same option
   * twice — and if the collision is with the answer, two correct answers.
   * Dedupe against the answer and against each other.
   */
  const wrongForms = [
    ...new Set(
      available.filter((p) => p !== person).map((p) => conjugation.forms[p]),
    ),
  ].filter((form): form is string => !!form && form !== answer);

  // A paradigm too syncretic to offer a real choice (haber, say) is not a
  // multiple-choice question at all. Let the caller try another kind.
  if (wrongForms.length < 2) return null;

  const options = shuffle(
    [{ text: answer }, ...sample(wrongForms, 3, ctx.rng).map((text) => ({ text }))],
    ctx.rng,
  );

  return {
    ...base('grammarChoice', [conceptId]),
    form: 'choice',
    instruction: `${verb.infinitive} — which form goes with "${PERSON_LABELS[person].split(' /')[0]}"?`,
    prompt: `${PERSON_LABELS[person].split(' /')[0]} ___`,
    promptIsSpanish: true,
    options,
    answerIndex: options.findIndex((option) => option.text === answer),
    note: verb.irregularityNote,
  };
}

/** Reading comprehension pulled from an authored story scene. */
export function buildReading(ctx: GenContext, maxLevel: number): ChoiceExercise | null {
  const eligible = stories
    .filter((story) => levelIndex(story.level) <= maxLevel)
    .flatMap((story) => story.scenes.filter((scene) => scene.question).map((scene) => ({ story, scene })));

  const chosen = pick(eligible, ctx.rng);
  if (!chosen?.scene.question) return null;

  const question = chosen.scene.question;
  const correct: ChoiceOption = { text: question.options[question.answer] };
  const options = shuffle(
    question.options.map((text) => ({ text })),
    ctx.rng,
  );

  return {
    ...base('reading', chosen.story.concepts),
    form: 'choice',
    instruction: chosen.story.title,
    prompt: question.question,
    passage: chosen.scene.lines.map((line) => ({ speaker: line.speaker, text: line.es })),
    options,
    answerIndex: options.findIndex((option) => option.text === correct.text),
    note: question.explanation,
  };
}

/** One turn of a scripted conversation. */
export function buildConversationTurn(
  sceneId: string,
  turnIndex: number,
  guided: boolean,
  ctx: GenContext,
): ConversationExercise | null {
  const scene = conversations.find((s) => s.id === sceneId);
  if (!scene) return null;

  const turn = scene.turns[turnIndex];
  if (!turn || turn.speaker !== 'you' || !turn.accepted) return null;

  const history = scene.turns.slice(0, turnIndex).map((previous) => ({
    speaker: previous.speaker,
    es: previous.speaker === 'partner' ? (previous.es ?? '') : (previous.accepted?.[0] ?? ''),
    en: previous.speaker === 'partner' ? previous.en : undefined,
  }));

  const options =
    guided && turn.options
      ? shuffle(
          turn.options.map((option) => ({
            text: option.es,
            sub: option.en,
            note: option.note,
            natural: option.natural,
          })),
          ctx.rng,
        )
      : undefined;

  return {
    ...base('conversation', turn.concepts ?? []),
    form: 'conversation',
    instruction: turn.instruction ?? 'Reply naturally',
    scene: {
      id: scene.id,
      title: scene.title,
      icon: scene.icon,
      setting: scene.setting,
      partner: scene.partner,
    },
    history,
    options,
    accepted: turn.accepted,
    hints: ctx.settings.hardMode ? undefined : turn.hints,
    note: turn.note,
  };
}

// --- Entry point ------------------------------------------------------------

/**
 * Builds the best available exercise for a concept, walking down the candidate
 * kinds until one has the material it needs. Returns null only when a concept
 * has no usable content at all.
 */
export function generateForConcept(
  conceptId: string,
  state: ConceptState | undefined,
  ctx: GenContext,
): Exercise | null {
  const concept = getConcept(conceptId);
  if (!concept) return null;

  // Verb paradigms have their own dedicated builder.
  if (concept.kind === 'verbform') {
    return buildVerbForm(concept.verbId, concept.tense, concept.id, ctx);
  }

  if (isGrammarConcept(concept)) {
    if (!state?.introduced) return buildGrammarCard(concept.id);
    return generateGrammarPractice(concept.id, state, ctx);
  }

  if (!isVocabConcept(concept)) return null;

  if (!state?.introduced) return buildTeachCard(concept, ctx);

  const pool = getSentencesForConcept(concept.id);

  for (const kind of candidateKinds(state, ctx)) {
    const exercise = attemptKind(kind, concept, pool, state, ctx);
    if (exercise) return exercise;
  }

  // Guaranteed fallback — recognition always has the material it needs.
  return buildMultipleChoice(concept, ctx, ctx.rng() < 0.5);
}

/**
 * Generate for a concept restricted to particular exercise kinds.
 *
 * `generateForConcept` deliberately lets the learner's own history choose the
 * mix, which is right for a lesson and wrong for a checkpoint: a checkpoint has
 * to *test* listening and production whether or not the learner's history would
 * have offered them. This is the escape hatch, and it is the only caller that
 * gets to override the ranking.
 */
export function generateOfKind(
  conceptId: string,
  state: ConceptState | undefined,
  ctx: GenContext,
  kinds: ExerciseKind[],
): Exercise | null {
  const concept = getConcept(conceptId);
  if (!concept || !isVocabConcept(concept) || !state?.introduced) return null;
  const pool = getSentencesForConcept(concept.id);
  for (const kind of kinds) {
    const exercise = attemptKind(kind, concept, pool, state, ctx);
    if (exercise) return exercise;
  }
  return null;
}

function attemptKind(
  kind: ExerciseKind,
  concept: VocabConcept,
  pool: Sentence[],
  state: ConceptState,
  ctx: GenContext,
): Exercise | null {
  const ids = [concept.id];
  /**
   * The pool is narrowed *before* the draw, per kind. Drawing at random and
   * rejecting afterwards would fall through to the next kind on a bad draw, so
   * a concept with one ineligible sentence in five would lose production four
   * times in five — adaptivity indistinguishable from a bug.
   */
  const sentence = usesSentence(kind) ? pickSentence(pool, kind, ids, ctx) : undefined;
  const built = buildOfKind(kind, concept, sentence, ids, ctx);
  return sentence && built ? annotate(built, sentence, ids, ctx) : built;
}

/**
 * Kinds actually built from a sentence.
 *
 * `multipleChoice`, `match` and the three drill-backed kinds ignore the pool
 * entirely — they work from the concept or from hand-authored material. Drawing
 * a sentence for them and attaching it anyway gave the feedback bar an
 * unrelated line to reveal ("¡Bien!" followed by a sentence the learner never
 * saw), and consumed the session's one use of that line into the bargain.
 */
const SENTENCE_KINDS = new Set<ExerciseKind>([
  'listenSelect',
  'listenComprehend',
  'wordBank',
  'translateToEn',
  'translateToEs',
  'dictation',
  'fillBlank',
  'grammarChoice',
  'speak',
]);

function usesSentence(kind: ExerciseKind): boolean {
  return SENTENCE_KINDS.has(kind);
}

/**
 * Draws an eligible sentence, preferring one this session has not used yet.
 *
 * Falls back to a repeat rather than returning nothing: a concept with a single
 * eligible sentence should still be practisable twice in a session, just with a
 * different exercise wrapped around it.
 */
function pickSentence(
  pool: readonly Sentence[],
  kind: ExerciseKind,
  ids: string[],
  ctx: GenContext,
): Sentence | undefined {
  const eligible = eligibleSentences(pool, kind, ctx.knowledge, ids);
  const used = ctx.usedSentences;
  const unused = used ? eligible.filter((sentence) => !used.has(sentence.id)) : eligible;
  const chosen = pick(unused.length > 0 ? unused : eligible, ctx.rng);
  if (chosen && used) used.add(chosen.id);
  return chosen;
}

/**
 * Attaches the two things every sentence-derived exercise needs after the fact:
 * the source line, so the feedback moment can teach the meaning rather than
 * only saying "correct", and the unknown supporting concepts, so they can be
 * flagged as new instead of silently scored.
 */
function annotate(
  exercise: Exercise,
  sentence: Sentence,
  ids: string[],
  ctx: GenContext,
): Exercise {
  return {
    ...exercise,
    source: { es: sentence.es, en: sentence.en },
    supportIds: supportIds(ids, sentence, ctx),
  };
}

function buildOfKind(
  kind: ExerciseKind,
  concept: VocabConcept,
  sentence: Sentence | undefined,
  ids: string[],
  ctx: GenContext,
): Exercise | null {
  switch (kind) {
    case 'multipleChoice':
      return buildMultipleChoice(concept, ctx, ctx.rng() < 0.4);
    case 'match':
      return buildMatch(concept, ctx);
    case 'listenSelect':
      return sentence ? buildListenSelect(sentence, ctx, mergeIds(ids, sentence, ctx)) : null;
    case 'listenComprehend':
      return sentence ? buildListenComprehend(sentence, ctx, mergeIds(ids, sentence, ctx)) : null;
    case 'wordBank':
      return sentence ? buildWordBank(sentence, ctx, mergeIds(ids, sentence, ctx)) : null;
    case 'translateToEn':
      return sentence ? buildTranslateToEn(sentence, mergeIds(ids, sentence, ctx)) : null;
    case 'translateToEs':
      return sentence ? buildTranslateToEs(sentence, ctx, mergeIds(ids, sentence, ctx)) : null;
    case 'dictation':
      return sentence ? buildDictation(sentence, mergeIds(ids, sentence, ctx)) : null;
    case 'fillBlank': {
      if (!sentence) return null;
      const word =
        sentence.blanks?.find((blank) => sentence.es.includes(blank)) ??
        conceptWordIn(sentence, concept);
      return word ? buildFillBlank(sentence, word, ctx, mergeIds(ids, sentence, ctx)) : null;
    }
    case 'grammarChoice':
      return sentence ? buildGrammarChoice(sentence, ctx, mergeIds(ids, sentence, ctx)) : null;
    case 'correctMistake':
      return buildCorrectMistake(ids, ctx);
    case 'chooseNatural':
      return buildChooseNatural(ids, ctx);
    case 'buildResponse':
      return buildResponse(ids, ctx);
    case 'speak':
      return sentence ? buildSpeak(sentence, mergeIds(ids, sentence, ctx)) : null;
    default:
      return null;
  }
}

function buildSpeak(sentence: Sentence, conceptIds: string[]): Exercise | null {
  if (sentence.noAudio) return null;
  return {
    ...base('speak', conceptIds),
    form: 'speak',
    kind: 'speak',
    instruction: 'Say this out loud',
    text: sentence.es,
    translation: sentence.en,
    note: sentence.note,
  };
}

/**
 * The concepts an exercise built from this sentence is allowed to *score*.
 *
 * The concept under test, plus every other concept in the sentence the learner
 * has already met — answering "Los viernes salgo con mis amigos" really is
 * retrieval practice for `v.salir` as well as `v.amigo`, and dropping that
 * would throw away most of the spiral.
 *
 * What it deliberately excludes is anything the learner has *not* met. This is
 * the second half of the untaught-production bug: `recordAnswer` runs `review()`
 * over every id here and `review()` sets `introduced: true`, so merging the
 * whole tag list meant one exercise could silently mark four unseen concepts as
 * taught — and next session those were eligible for production themselves. The
 * leak spread on its own. Unknown concepts go to `supportIds` instead, where
 * they can be shown to the learner as new without ever being scored.
 */
function mergeIds(ids: string[], sentence: Sentence, ctx: GenContext): string[] {
  const known = ctx.knowledge;
  const support = known
    ? sentence.concepts.filter((id) => known.known.has(id))
    : sentence.concepts;
  return [...new Set([...ids, ...support])];
}

/** Concepts the sentence needs that the learner has not met — shown, never scored. */
/**
 * Whether a hand-authored item's concepts are within reach.
 *
 * Drills and conversation turns are keyed to concepts by id and reached through
 * a `some()` filter, which means one matching concept was enough to pull in an
 * item that also needed four the learner had never met. They carry no sentence,
 * so `sentenceEligible` cannot see them — this is the same rule stated for the
 * material that has concepts but no text.
 */
function knownConcepts(
  concepts: readonly string[],
  exempt: readonly string[],
  ctx: GenContext,
  tolerance = 0,
): boolean {
  const known = ctx.knowledge;
  if (!known) return true;
  const unmet = concepts.filter((id) => !known.known.has(id) && !exempt.includes(id));
  return unmet.length <= tolerance;
}

function supportIds(ids: string[], sentence: Sentence, ctx: GenContext): string[] | undefined {
  if (!ctx.knowledge) return undefined;
  const unknown = unknownConcepts(sentence, ctx.knowledge, ids);
  return unknown.length > 0 ? unknown : undefined;
}

function generateGrammarPractice(
  grammarId: string,
  state: ConceptState,
  ctx: GenContext,
): Exercise | null {
  const pool = getSentencesForConcept(grammarId);
  const strength = mastery(state, ctx.now);

  const order: ExerciseKind[] =
    strength < 0.4
      ? ['grammarChoice', 'fillBlank', 'wordBank', 'translateToEn']
      : strength < 0.7
        ? ['correctMistake', 'fillBlank', 'grammarChoice', 'translateToEs']
        : ['chooseNatural', 'correctMistake', 'translateToEs', 'buildResponse'];

  const notRecent = order.filter((kind) => !(ctx.recentKinds ?? []).includes(kind));

  for (const kind of [...notRecent, ...order]) {
    // Same gate as the vocabulary path: a grammar rule is not a licence to hand
    // the learner any sentence that happens to use it. `g.present` is taught in
    // unit three and tagged on sentences all the way up to C1.
    const sentence = usesSentence(kind) ? pickSentence(pool, kind, [grammarId], ctx) : undefined;
    let exercise: Exercise | null = null;

    switch (kind) {
      case 'grammarChoice':
        exercise = sentence ? buildGrammarChoice(sentence, ctx, mergeIds([grammarId], sentence, ctx)) : null;
        break;
      case 'fillBlank': {
        if (!sentence) break;
        const word = sentence.blanks?.[0];
        exercise = word ? buildFillBlank(sentence, word, ctx, mergeIds([grammarId], sentence, ctx)) : null;
        break;
      }
      case 'wordBank':
        exercise = sentence ? buildWordBank(sentence, ctx, mergeIds([grammarId], sentence, ctx)) : null;
        break;
      case 'translateToEn':
        exercise = sentence ? buildTranslateToEn(sentence, mergeIds([grammarId], sentence, ctx)) : null;
        break;
      case 'translateToEs':
        exercise = sentence ? buildTranslateToEs(sentence, ctx, mergeIds([grammarId], sentence, ctx)) : null;
        break;
      case 'correctMistake':
        exercise = buildCorrectMistake([grammarId], ctx);
        break;
      case 'chooseNatural':
        exercise = buildChooseNatural([grammarId], ctx);
        break;
      case 'buildResponse':
        exercise = buildResponse([grammarId], ctx);
        break;
      default:
        break;
    }

    if (exercise) return sentence ? annotate(exercise, sentence, [grammarId], ctx) : exercise;
  }

  return null;
}
