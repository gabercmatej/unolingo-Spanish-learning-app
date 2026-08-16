import type { Exercise } from '@/learning/exercise';
import type { ExerciseResult } from '@/learning/check';
import type { Settings } from '@/learning/types';

/**
 * Every exercise renderer is controlled: it reports the current answer upward
 * and renders a locked state once `result` arrives. The player owns the Check
 * button, the grading and the feedback banner, so behaviour stays identical
 * across exercise types.
 */
export interface ExerciseViewProps<E extends Exercise = Exercise> {
  exercise: E;
  answer: string | null;
  onAnswer: (answer: string | null) => void;
  /** Null until the learner has checked. */
  result: ExerciseResult | null;
  settings: Settings;
  /** Commits the answer immediately — used by taps that are self-evidently final. */
  onSubmit?: () => void;
}
