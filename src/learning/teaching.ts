import { conceptLabel, getConcept, getGrammar, isVocabConcept, levelIndex } from '@/content';
import type { CefrLevel } from '@/content/types';
import type { Exercise } from '@/learning/exercise';
import type { ExerciseResult } from '@/learning/check';
import { KIND_DEMAND } from '@/learning/eligibility';
import type { Grade } from '@/learning/types';

/**
 * What to say after an answer.
 *
 * "Correct ✓" is a scoreboard, not a lesson. A learner who picks the right
 * waveform out of four in a listening exercise has proved they can hear the
 * difference and proved nothing about what the sentence meant — and the app
 * moving straight on leaves that gap exactly where it found it.
 *
 * So every answered exercise gets at most one extra thing: the line it came
 * from with its meaning, or one compact note about the concept under test.
 * *One* — the rule here is a single reinforcement, because a paragraph after
 * every answer is a paragraph nobody reads.
 *
 * Whether the meaning is shown is level-sensitive, which is the other half of
 * the point. Translating everything forever prevents the moment where Spanish
 * starts carrying its own weight; withholding it at A1 just produces a learner
 * who has memorised sounds.
 */

export interface NewConcept {
  label: string;
  meaning: string | undefined;
}

export interface Teaching {
  /** The Spanish line the exercise came from, when it is worth re-showing. */
  es?: string;
  /** Its meaning, when the level policy says to show it. */
  en?: string;
  /** One short reinforcement — a gloss, a rule, a register note. */
  note?: string;
  /** Concepts that appeared here which the learner has not been taught. */
  newToYou: NewConcept[];
  /**
   * True when the learner met something the course had not introduced.
   *
   * The feedback bar says so rather than letting a wrong answer read as
   * forgetting. Being tested on untaught material is a fault in the course, and
   * telling the learner that is more honest than a red banner.
   */
  untaught: boolean;
}

/**
 * Levels at which the English meaning is shown as a matter of course.
 *
 * Through A2 it always appears: at that level a Spanish gloss of a Spanish
 * sentence explains nothing. From B1 it appears where the exercise gave the
 * learner no sight of the meaning at all — a dictation or a "what did you
 * hear?" — and on anything they got wrong. From B2 the default flips: immersion
 * is worth more than the translation, so it comes only when the answer was
 * wrong, or when genuinely new material turned up.
 */
const ALWAYS_TRANSLATE_BELOW: CefrLevel = 'B1';

/** Exercise kinds where the learner never saw the meaning while answering. */
const MEANING_HIDDEN = new Set(['listenSelect', 'dictation', 'speak']);

export interface TeachingContext {
  /** The learner's demonstrated level — decides how much English is shown. */
  level: CefrLevel;
  /** Resolves a concept id the learner has not met, for the "new to you" line. */
  isKnown?: (conceptId: string) => boolean;
}

export function shouldShowMeaning(
  exercise: Exercise,
  grade: Grade,
  level: CefrLevel,
): boolean {
  if (grade !== 'correct') return true;
  if (levelIndex(level) < levelIndex(ALWAYS_TRANSLATE_BELOW)) return true;
  // B1: only where answering revealed nothing about meaning.
  if (levelIndex(level) === levelIndex(ALWAYS_TRANSLATE_BELOW)) {
    return MEANING_HIDDEN.has(exercise.kind);
  }
  return false;
}

/**
 * The teaching line for this answer, or null when there is nothing worth
 * adding. Pure, so the feedback bar renders a decision rather than making one.
 */
export function teachingFor(
  exercise: Exercise,
  result: ExerciseResult,
  ctx: TeachingContext,
): Teaching | null {
  if (exercise.form === 'presentation') return null;

  const source = exercise.source;
  const showMeaning = shouldShowMeaning(exercise, result.grade, ctx.level);

  /**
   * Re-show the Spanish whenever the learner has not just been staring at it.
   * A translation *into* Spanish already ends with the model answer on screen,
   * so repeating it underneath would be noise.
   */
  const alreadyShown =
    KIND_DEMAND[exercise.kind] === 'output' && result.grade !== 'correct';
  const es = source && !alreadyShown ? source.es : undefined;
  const en = source && showMeaning ? source.en : undefined;

  const newToYou = (exercise.supportIds ?? [])
    .filter((id) => !ctx.isKnown?.(id))
    .map((id) => {
      const concept = getConcept(id);
      if (!concept) return null;
      return {
        label: conceptLabel(concept),
        meaning: isVocabConcept(concept) ? concept.en : getGrammar(id)?.short,
      };
    })
    .filter((entry): entry is NewConcept => entry !== null)
    .slice(0, 2);

  /**
   * The most specific note wins. The grader's note is about *this answer* (an
   * accent slip, the wrong option's explanation); the exercise's is about the
   * sentence; the concept's is the general fact. Anything more than one of them
   * is a paragraph, and a paragraph after every answer is a paragraph nobody
   * reads.
   */
  const note = result.note ?? exercise.note ?? conceptNote(exercise);

  if (!es && !en && !note && newToYou.length === 0) return null;
  return { es, en, note, newToYou, untaught: newToYou.length > 0 };
}

/**
 * A one-line reinforcement drawn from the concept under test, used when the
 * exercise itself carried no note. Vocabulary gets its gloss, grammar gets its
 * one-sentence summary — the compact version, never the deep dive.
 */
function conceptNote(exercise: Exercise): string | undefined {
  for (const id of exercise.conceptIds) {
    const grammar = getGrammar(id);
    if (grammar) return grammar.short;
  }
  for (const id of exercise.conceptIds) {
    const concept = getConcept(id);
    if (concept && isVocabConcept(concept) && concept.note) return concept.note;
    if (concept && isVocabConcept(concept)) return `${concept.es} — ${concept.en}`;
  }
  return undefined;
}
