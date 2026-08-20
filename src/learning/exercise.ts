import type {
  ConversationScene,
  CultureNote,
  ExampleLine,
  GrammarConcept,
  VocabConcept,
} from '@/content/types';
import type { Difficulty, ExerciseKind } from '@/learning/types';

/**
 * A generated exercise.
 *
 * `kind` is the pedagogical type (what it trains, what it is worth, how it
 * affects the memory record). `form` is how it is rendered. Several kinds share
 * a form — a listening comprehension and a reading question are both a
 * `choice` — which keeps the renderer count small while the exercise mix stays
 * varied.
 */

export type ExerciseForm =
  | 'presentation'
  | 'choice'
  | 'wordBank'
  | 'typed'
  | 'match'
  | 'conversation'
  | 'speak';

interface ExerciseBase {
  id: string;
  kind: ExerciseKind;
  form: ExerciseForm;
  /** Concepts this exercise updates on answer. */
  conceptIds: string[];
  difficulty: Difficulty;
  xp: number;
  instruction: string;
  /** Teaching note revealed after answering. */
  note?: string;
  /**
   * The sentence this exercise was built from.
   *
   * Carried so the feedback moment can *teach*: a listening exercise the
   * learner got right is proof they recognised the sounds and no proof at all
   * that they knew what it meant, and "Correct ✓" alone leaves that gap exactly
   * where it was. Present only for sentence-derived exercises.
   */
  source?: { es: string; en: string };
  /**
   * The id of that sentence.
   *
   * Carried alongside the text so a wrong answer can be *rebuilt* later rather
   * than merely described. Without it a mistake review can only ask the
   * generator for something about the same concepts, which is how "review my
   * mistakes" turned into "review something vaguely adjacent to my mistakes".
   */
  sourceId?: string;
  /**
   * The concept this exercise was built to practise, as opposed to the ones its
   * sentence happens to carry. `conceptIds` is the scoring list; this is the
   * reason the exercise exists.
   */
  targetId?: string;
  /**
   * Concepts the exercise needs that the learner has not been introduced to.
   *
   * Kept out of `conceptIds` on purpose. `conceptIds` is what gets scored and
   * scheduled, and scoring an unmet concept both marks it as taught and records
   * a failure against a memory that was never formed. These are shown as new
   * instead — the reason an input exercise is allowed a little unknown material
   * at all.
   */
  supportIds?: string[];
}

// --- Presentation ----------------------------------------------------------

export interface TeachExercise extends ExerciseBase {
  form: 'presentation';
  kind: 'teach';
  concept: VocabConcept;
  examples: ExampleLine[];
}

export interface GrammarCardExercise extends ExerciseBase {
  form: 'presentation';
  kind: 'grammarCard';
  grammar: GrammarConcept;
}

export interface CultureCardExercise extends ExerciseBase {
  form: 'presentation';
  kind: 'cultureCard';
  culture: CultureNote;
}

// --- Answerable ------------------------------------------------------------

export interface ChoiceOption {
  text: string;
  /** Secondary line, e.g. the English gloss under a Spanish option. */
  sub?: string;
  /** Explanation revealed after answering — used by "choose the natural one". */
  note?: string;
}

export interface ChoiceExercise extends ExerciseBase {
  form: 'choice';
  prompt: string;
  promptSub?: string;
  /** Render the prompt in the larger Spanish type style. */
  promptIsSpanish?: boolean;
  /** Reading passage shown above the question. */
  passage?: { speaker?: string; text: string }[];
  /** Spanish to speak. `hideText` keeps it audio-only until the learner asks. */
  audio?: { text: string; hideText: boolean };
  options: ChoiceOption[];
  answerIndex: number;
}

export interface WordBankExercise extends ExerciseBase {
  form: 'wordBank';
  prompt: string;
  promptSub?: string;
  audio?: { text: string; hideText: boolean };
  /** Shuffled tokens including distractors. */
  tokens: string[];
  /** The canonical sentence, used for display after answering. */
  answer: string;
  accepted: string[];
}

export interface TypedExercise extends ExerciseBase {
  form: 'typed';
  prompt: string;
  promptSub?: string;
  promptIsSpanish?: boolean;
  audio?: { text: string; hideText: boolean };
  /** Sentence with `___` marking the gap, for fill-in-the-blank. */
  template?: string;
  accepted: string[];
  language: 'es' | 'en';
  /** Optional word bank shown as tappable hints (suppressed in hard mode). */
  hints?: string[];
  placeholder?: string;
}

export interface MatchPair {
  es: string;
  en: string;
}

export interface MatchExercise extends ExerciseBase {
  form: 'match';
  pairs: MatchPair[];
}

export interface ConversationExercise extends ExerciseBase {
  form: 'conversation';
  scene: Pick<ConversationScene, 'id' | 'title' | 'icon' | 'setting' | 'partner'>;
  /** Lines already spoken, shown as chat history. */
  history: { speaker: 'partner' | 'you'; es: string; en?: string }[];
  instructionEs?: string;
  /** Guided mode: pick a reply. Free mode: type one. */
  options?: (ChoiceOption & { natural: boolean })[];
  accepted: string[];
  hints?: string[];
}

export interface SpeakExercise extends ExerciseBase {
  form: 'speak';
  kind: 'speak';
  text: string;
  translation: string;
}

export type Exercise =
  | TeachExercise
  | GrammarCardExercise
  | CultureCardExercise
  | ChoiceExercise
  | WordBankExercise
  | TypedExercise
  | MatchExercise
  | ConversationExercise
  | SpeakExercise;

export function isPresentation(exercise: Exercise): boolean {
  return exercise.form === 'presentation';
}
