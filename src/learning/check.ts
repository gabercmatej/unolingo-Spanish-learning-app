import { accentCarriesMeaning } from '@/content/accent-pairs';
import { EN_EQUIVALENCES } from '@/content/equivalences';
import { checkAnswer } from '@/learning/answer-check';
import type { Exercise } from '@/learning/exercise';
import { gradeFor, verdictFor, type AnswerError, type GradingProfile, type Verdict } from '@/learning/grading';
import type { ExerciseKind, Grade, Settings } from '@/learning/types';

export interface ExerciseResult {
  verdict: Verdict;
  error: AnswerError;
  grade: Grade;
  /** The model answer to show. */
  expected: string;
  /** Explanation shown in the feedback banner. */
  note?: string;
  /** What the learner gave, normalised for the mistake notebook. */
  given: string;
}

/** Builds a result from its classification, so grade and verdict cannot drift. */
function fromError(error: AnswerError, expected: string, given: string, note?: string): ExerciseResult {
  return { verdict: verdictFor(error), error, grade: gradeFor(error), expected, note, given };
}

/** Kinds where the exact written form is what is being examined. */
const FORM_IS_TARGET = new Set<ExerciseKind>(['dictation']);

/** Kinds whose answer is a whole free utterance rather than a rendering of one. */
const FREE_PRODUCTION = new Set<ExerciseKind>(['conversation', 'buildResponse']);

/** Kinds where a single word is the answer and there is nothing to paraphrase. */
const NO_PARAPHRASE = new Set<ExerciseKind>(['fillBlank', 'dictation']);

/**
 * What this exercise is actually asking for.
 *
 * Assembled here because `check.ts` is the one place that sees the exercise and
 * the settings together, and because a tolerance composed at the call site is
 * the kind of correctness that decays the first time somebody adds a button.
 */
export function profileFor(exercise: Exercise, settings: Settings): GradingProfile {
  /**
   * `kind`, not the `TypedExercise`-only `language` field: every exercise form
   * carries a `kind`, so this needs no narrowing, and `translateToEn` is the
   * only kind the generator ever builds with an English answer — the field
   * and the kind already agree everywhere they coexist, so deriving from the
   * one that is always present is strictly safer, not a different rule.
   */
  const language: 'es' | 'en' = exercise.kind === 'translateToEn' ? 'en' : 'es';

  /**
   * A verb-paradigm target means the exercise exists to test that exact form,
   * whatever kind it was rendered as. `f.hablar.preterite` asking for `habló`
   * cannot accept `hablo`, because `hablo` is the thing it is distinguishing
   * from. Derived from the id rather than declared, the way the rest of the
   * paradigm machinery works.
   */
  const testsAParadigm = exercise.targetId?.startsWith('f.') ?? false;

  const paraphrase: GradingProfile['paraphrase'] = NO_PARAPHRASE.has(exercise.kind)
    ? 'none'
    : language === 'en'
      ? 'english'
      : FREE_PRODUCTION.has(exercise.kind)
        ? 'spanishFree'
        : 'spanish';

  return {
    language,
    formIsTarget: FORM_IS_TARGET.has(exercise.kind) || testsAParadigm || settings.strictAccents,
    paraphrase,
    accentCarriesMeaning,
    equivalences: EN_EQUIVALENCES,
  };
}

/**
 * Single entry point for grading. Keeping this out of the components means the
 * player, the mistake notebook and the tests all agree on what "correct" means.
 */
export function checkExercise(
  exercise: Exercise,
  answer: string,
  settings: Settings,
): ExerciseResult {
  switch (exercise.form) {
    case 'choice': {
      const index = Number.parseInt(answer, 10);
      const chosen = exercise.options[index];
      const correctOption = exercise.options[exercise.answerIndex];
      const correct = index === exercise.answerIndex;
      const note = correct ? (correctOption?.note ?? exercise.note) : (chosen?.note ?? exercise.note);
      return correct
        ? fromError('none', correctOption?.text ?? '', chosen?.text ?? '', note)
        : fromError('meaning', correctOption?.text ?? '', chosen?.text ?? '', note);
    }

    case 'wordBank': {
      const { verdict, error, grade, note } = checkAnswer(answer, exercise.accepted, profileFor(exercise, settings));
      return {
        verdict,
        error,
        grade,
        expected: exercise.answer,
        note: note ?? exercise.note,
        given: answer,
      };
    }

    case 'typed': {
      /**
       * `exercise.accepted` only — never a concept's `altEn` spliced in here.
       * `translateToEn` is always built from a *sentence*
       * (`accepted: [sentence.en, ...sentence.altEn]` in the generator), and a
       * concept's `altEn` glosses one word or phrase *inside* that sentence,
       * not the sentence itself. Splicing it into the accepted list let a
       * fragment satisfy a whole-sentence translation: for s.f7 ("Encantada,
       * yo soy Marta." tagged `p.encantado`) the answer "pleased to meet you"
       * graded `preferred`/`correct` even though "I'm Marta" was never
       * attempted. `p.encantado.altEn` still exists — it documents intent and
       * is part of the content model — but a concept gloss reaching a
       * sentence-level answer has to come from the sentence's own
       * `altEn`/phrase equivalences, the way every other sentence works.
       */
      const { verdict, error, grade, note, best } = checkAnswer(answer, exercise.accepted, profileFor(exercise, settings));
      return {
        verdict,
        error,
        grade,
        expected: best,
        note: note ?? exercise.note,
        given: answer,
      };
    }

    case 'conversation': {
      if (exercise.options) {
        const index = Number.parseInt(answer, 10);
        const chosen = exercise.options[index];
        const natural = chosen?.natural ?? false;
        const model = exercise.options.find((option) => option.natural)?.text ?? exercise.accepted[0];
        return natural
          ? fromError('none', model, chosen?.text ?? '', chosen?.note ?? exercise.note)
          : fromError('meaning', model, chosen?.text ?? '', chosen?.note ?? exercise.note);
      }
      const { verdict, error, grade, note, best } = checkAnswer(answer, exercise.accepted, profileFor(exercise, settings));
      return {
        verdict,
        error,
        grade,
        expected: best,
        note: note ?? exercise.note,
        given: answer,
      };
    }

    case 'match': {
      // The component reports whether the grid was completed without errors.
      // Not a spelling error — the grid was assembled, just not cleanly — so
      // this is the catch-all `partial` classification rather than a specific
      // one that would misdescribe the mistake if it were ever shown or saved.
      const perfect = answer === 'perfect';
      return perfect
        ? fromError('none', '', answer)
        : fromError('partial', '', answer, 'A couple of those took more than one go.');
    }

    case 'speak': {
      // Self-assessed until on-device speech recognition is wired in. A skip
      // is not a spelling error either — the learner simply did not attempt
      // it — so it takes the same catch-all classification as an imperfect
      // match grid.
      return answer === 'skip'
        ? fromError('partial', exercise.text, answer, exercise.note)
        : fromError('none', exercise.text, answer, exercise.note);
    }

    case 'presentation':
    default:
      return fromError('none', '', '');
  }
}
