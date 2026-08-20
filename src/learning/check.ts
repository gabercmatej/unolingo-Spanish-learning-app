import { checkAnswer } from '@/learning/answer-check';
import type { Exercise } from '@/learning/exercise';
import { gradeFor, verdictFor, type AnswerError, type Verdict } from '@/learning/grading';
import type { Grade, Settings } from '@/learning/types';

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
      const { verdict, error, grade, note } = checkAnswer(answer, exercise.accepted, {
        formIsTarget: settings.strictAccents,
        language: 'es',
      });
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
      const { verdict, error, grade, note, best } = checkAnswer(answer, exercise.accepted, {
        formIsTarget: settings.strictAccents,
        language: exercise.language,
      });
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
      const { verdict, error, grade, note, best } = checkAnswer(answer, exercise.accepted, {
        formIsTarget: settings.strictAccents,
        language: 'es',
      });
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
