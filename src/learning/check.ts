import { checkAnswer } from '@/learning/answer-check';
import type { Exercise } from '@/learning/exercise';
import type { Grade, Settings } from '@/learning/types';

export interface ExerciseResult {
  grade: Grade;
  /** The model answer to show. */
  expected: string;
  /** Explanation shown in the feedback banner. */
  note?: string;
  /** What the learner gave, normalised for the mistake notebook. */
  given: string;
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
      return {
        grade: correct ? 'correct' : 'incorrect',
        expected: correctOption?.text ?? '',
        note: correct ? (correctOption?.note ?? exercise.note) : (chosen?.note ?? exercise.note),
        given: chosen?.text ?? '',
      };
    }

    case 'wordBank': {
      const result = checkAnswer(answer, exercise.accepted, {
        strictAccents: settings.strictAccents,
        language: 'es',
      });
      return {
        grade: result.grade,
        expected: exercise.answer,
        note: result.note ?? exercise.note,
        given: answer,
      };
    }

    case 'typed': {
      const result = checkAnswer(answer, exercise.accepted, {
        strictAccents: settings.strictAccents,
        language: exercise.language,
      });
      return {
        grade: result.grade,
        expected: result.best,
        note: result.note ?? exercise.note,
        given: answer,
      };
    }

    case 'conversation': {
      if (exercise.options) {
        const index = Number.parseInt(answer, 10);
        const chosen = exercise.options[index];
        const natural = chosen?.natural ?? false;
        const model = exercise.options.find((option) => option.natural)?.text ?? exercise.accepted[0];
        return {
          grade: natural ? 'correct' : 'incorrect',
          expected: model,
          note: chosen?.note ?? exercise.note,
          given: chosen?.text ?? '',
        };
      }
      const result = checkAnswer(answer, exercise.accepted, {
        strictAccents: settings.strictAccents,
        language: 'es',
      });
      return {
        grade: result.grade,
        expected: result.best,
        note: result.note ?? exercise.note,
        given: answer,
      };
    }

    case 'match': {
      // The component reports whether the grid was completed without errors.
      const perfect = answer === 'perfect';
      return {
        grade: perfect ? 'correct' : 'almost',
        expected: '',
        note: perfect ? undefined : 'A couple of those took more than one go.',
        given: answer,
      };
    }

    case 'speak': {
      // Self-assessed until on-device speech recognition is wired in.
      return {
        grade: answer === 'skip' ? 'almost' : 'correct',
        expected: exercise.text,
        note: exercise.note,
        given: answer,
      };
    }

    case 'presentation':
    default:
      return { grade: 'correct', expected: '', given: '' };
  }
}
