import { ChoiceView } from '@/components/exercises/choice';
import { ConversationView } from '@/components/exercises/conversation';
import { MatchView } from '@/components/exercises/match';
import { CultureCard, GrammarCard, TeachCard } from '@/components/exercises/presentation';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { SpeakView } from '@/components/exercises/speak';
import { TypedView } from '@/components/exercises/typed';
import { WordBankView } from '@/components/exercises/word-bank';

/**
 * Single dispatch point from an exercise to its renderer. Adding an exercise
 * type means adding a `kind` to the generator and, only if it needs a new
 * interaction, a `form` here.
 */
export function ExerciseView(props: ExerciseViewProps) {
  const { exercise } = props;

  /**
   * Keying the interactive views on the exercise id is what resets them between
   * questions. They used to do it themselves, in an effect that called four
   * setStates on every change of `exercise.id` — one render to show the previous
   * question's tokens, then another to clear them. Letting React remount is both
   * correct and a frame faster.
   */
  switch (exercise.form) {
    case 'presentation':
      if (exercise.kind === 'teach') return <TeachCard exercise={exercise} />;
      if (exercise.kind === 'grammarCard') return <GrammarCard exercise={exercise} />;
      return <CultureCard exercise={exercise} />;

    case 'choice':
      return <ChoiceView {...props} exercise={exercise} />;

    case 'wordBank':
      return <WordBankView key={exercise.id} {...props} exercise={exercise} />;

    case 'typed':
      return <TypedView {...props} exercise={exercise} />;

    case 'match':
      return <MatchView key={exercise.id} {...props} exercise={exercise} />;

    case 'conversation':
      return <ConversationView {...props} exercise={exercise} />;

    case 'speak':
      return <SpeakView {...props} exercise={exercise} />;

    default:
      return null;
  }
}

export type { ExerciseViewProps };
