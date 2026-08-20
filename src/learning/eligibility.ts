import { getConcept, levelIndex } from '@/content';
import { CEFR_LEVELS, type CefrLevel, type Sentence } from '@/content/types';
import type { ExerciseKind, LearnerState } from '@/learning/types';

/**
 * What the learner is allowed to be asked to do with a sentence.
 *
 * The course teaches by spiralling: a concept met in unit two should keep
 * turning up in unit nine, and a sentence is free to reuse anything already
 * introduced. What it must never do is run the other way — asking the learner
 * to *produce* language built out of material the course has not shown them
 * yet. That is not a hard exercise; it is an unanswerable one, and the grader
 * records it as a failure of memory rather than a gap in the syllabus.
 *
 * The bug this module exists to close: `s.m105` ("Mis vecinos han visto el
 * partido en el bar de abajo.", A2) is tagged `v.amigo`, which the first
 * greetings unit teaches — and contains no "amigo" at all. Any practice
 * touching `v.amigo` could pick it out of the pool and ask for a translation
 * into Spanish. Nothing in the pipeline looked at the sentence's level or at
 * its *other* concepts before doing so.
 *
 * So eligibility is decided per exercise kind, because the same sentence is a
 * fair listening item and an unfair typing item:
 *
 *   • **output** — the learner writes or says the Spanish. Every concept the
 *     sentence declares must already be introduced, and the sentence may not
 *     sit above the learner's production ceiling. No tolerance: one unknown
 *     word is the difference between recalling a sentence and inventing one.
 *   • **guided** — the Spanish is on screen and only part of it is missing
 *     (fill the gap, choose the form). One unknown concept is survivable
 *     because the rest of the sentence carries it.
 *   • **input** — the learner reads or hears the Spanish and answers about its
 *     meaning. This is where new material is *supposed* to arrive, so a couple
 *     of unknowns are allowed and the level ceiling is one step looser. The
 *     reveal after answering is what turns that exposure into teaching.
 */

export type Demand = 'output' | 'guided' | 'input';

/**
 * Which demand each exercise kind places on the learner.
 *
 * Read it as "what does the learner have to produce from nothing?" — `wordBank`
 * counts as output even though the words are on screen, because the learner is
 * still assembling a Spanish sentence and a word they have never met is an
 * unlabelled tile. `translateToEn` counts as input even though it is typed,
 * because what is being typed is English.
 */
export const KIND_DEMAND: Record<ExerciseKind, Demand> = {
  teach: 'input',
  grammarCard: 'input',
  cultureCard: 'input',
  multipleChoice: 'input',
  listenSelect: 'input',
  listenComprehend: 'input',
  match: 'input',
  translateToEn: 'input',
  reading: 'input',
  chooseNatural: 'input',
  fillBlank: 'guided',
  grammarChoice: 'guided',
  wordBank: 'output',
  translateToEs: 'output',
  dictation: 'output',
  correctMistake: 'output',
  conversation: 'output',
  buildResponse: 'output',
  speak: 'output',
};

/** Unknown *declared* concepts a sentence may carry, per demand. */
const UNKNOWN_TOLERANCE: Record<Demand, number> = { output: 0, guided: 1, input: 1 };

/** How far above the production ceiling a sentence may sit, per demand. */
const LEVEL_HEADROOM: Record<Demand, number> = { output: 0, guided: 0, input: 1 };

/**
 * What the learner has been shown, and how far they may be pushed.
 *
 * Deliberately a plain value rather than the whole `LearnerState`: the
 * generator asks this question once per exercise and the set is built once per
 * session, and passing the learner around would invite call sites to start
 * reading other things out of it.
 */
export interface Knowledge {
  /** Concept ids the learner has actually been introduced to. */
  known: ReadonlySet<string>;
  /** Highest sentence level eligible for production. */
  ceiling: CefrLevel;
}

/**
 * Enough introduced concepts at a level before the learner is asked to produce
 * sentences written for it. One stray concept from a level is a spiral
 * appearance, not a foothold in it.
 */
const CEILING_MIN_CONCEPTS = 6;

/**
 * The highest level the learner may be asked to produce at.
 *
 * Derived from what has been *introduced* rather than from the CEFR estimate,
 * because the estimate measures demonstrated ability and this measures
 * exposure — and the question here is "has the course shown them this yet?",
 * not "how good are they?". A placement result still sets the floor: a learner
 * who tested into B1 has not met these concepts in this app, but the course has
 * agreed to start them there.
 */
export function productionCeiling(learner: LearnerState): CefrLevel {
  const counts = new Map<CefrLevel, number>();
  for (const state of Object.values(learner.concepts)) {
    if (!state.introduced) continue;
    const concept = getConcept(state.id);
    if (!concept) continue;
    counts.set(concept.level, (counts.get(concept.level) ?? 0) + 1);
  }

  let reached = 0;
  for (let i = 0; i < CEFR_LEVELS.length; i += 1) {
    if ((counts.get(CEFR_LEVELS[i]) ?? 0) >= CEILING_MIN_CONCEPTS) reached = i;
  }

  const floor = learner.placement ? levelIndex(learner.placement.level) : 0;
  return CEFR_LEVELS[Math.max(reached, floor)];
}

export function knowledgeOf(learner: LearnerState): Knowledge {
  const known = new Set<string>();
  for (const state of Object.values(learner.concepts)) {
    if (state.introduced) known.add(state.id);
  }
  return { known, ceiling: productionCeiling(learner) };
}

/**
 * The concepts a sentence declares that the learner has not met.
 *
 * `exempt` is the concept the exercise is deliberately practising — it is the
 * reason the sentence was chosen, so it never counts against it. Everything
 * else in the sentence is support, and support the learner cannot read is what
 * makes an exercise unanswerable.
 */
export function unknownConcepts(
  sentence: Sentence,
  knowledge: Knowledge,
  exempt: readonly string[] = [],
): string[] {
  return sentence.concepts.filter((id) => !knowledge.known.has(id) && !exempt.includes(id));
}

/**
 * Whether this sentence may be used for this kind of exercise right now.
 *
 * Note what is *not* here: no check that the sentence belongs to the current
 * unit, and no check that its concepts were taught recently. Past material
 * spiralling forward is the point of the course. Only the direction is
 * constrained.
 */
export function sentenceEligible(
  sentence: Sentence,
  kind: ExerciseKind,
  knowledge: Knowledge,
  exempt: readonly string[] = [],
): boolean {
  const demand = KIND_DEMAND[kind];
  const level = levelIndex(sentence.level);
  const ceiling = levelIndex(knowledge.ceiling);
  if (level > ceiling + LEVEL_HEADROOM[demand]) return false;

  const unknown = unknownConcepts(sentence, knowledge, exempt).length;

  /**
   * A sentence may stretch the learner on its level or on its vocabulary, and
   * not on both at once.
   *
   * Without this clause the two tolerances multiply, and the result was exactly
   * the sentence that started this: "Mis vecinos han visto el partido en el bar
   * de abajo." is one level above a learner who has just met `v.amigo`, and
   * needs two things they have not seen — each within its own allowance,
   * together an unanswerable line. The tag list also *under*-counts, because
   * "vecinos", "partido", "bar" and "abajo" are not tagged at all, so treating
   * two unknown tags as mild is generous before the level gap is even counted.
   */
  if (level > ceiling) return unknown === 0;
  return unknown <= UNKNOWN_TOLERANCE[demand];
}

/**
 * The eligible sentences, in pool order.
 *
 * Filtering the pool rather than testing after `pick` matters: picking at
 * random and rejecting would fall through to the next exercise kind on a bad
 * draw, so a concept with one ineligible sentence out of five would lose
 * production four times in five for no reason the learner could see.
 */
export function eligibleSentences(
  pool: readonly Sentence[],
  kind: ExerciseKind,
  knowledge: Knowledge | undefined,
  exempt: readonly string[] = [],
): Sentence[] {
  if (!knowledge) return [...pool];
  return pool.filter((sentence) => sentenceEligible(sentence, kind, knowledge, exempt));
}
