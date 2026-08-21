import { act } from 'react';
import TestRenderer, { type ReactTestInstance } from 'react-test-renderer';

import { ChoiceView } from '@/components/exercises/choice';
import { DEFAULT_SETTINGS_FOR_TEST } from '@/learning/__tests__/helpers';
import type { ChoiceExercise } from '@/learning/exercise';

/**
 * Choosing an option is not answering the question.
 *
 * Every option's press handler called `onAnswer` and then `onSubmit` in the
 * same tick, which made a selection an irrevocable commit — and made it a
 * *wrong* one. `submit` closes over the answer from the render it was created
 * in, so the first tap submitted `null` and did nothing, and the second tap
 * submitted the option chosen by the first. Changing your mind between two
 * options therefore graded the one you had just rejected.
 *
 * Selection sets the selection. `Check` grades it.
 */

const question: ChoiceExercise = {
  id: 'q1',
  kind: 'multipleChoice',
  form: 'choice',
  conceptIds: ['v.hola'],
  difficulty: 2,
  xp: 5,
  instruction: 'Which one means "hello"?',
  prompt: 'hello',
  options: [{ text: 'adiós' }, { text: 'hola' }],
  answerIndex: 1,
};

function render(answer: string | null, onAnswer: jest.Mock, onSubmit: jest.Mock) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ChoiceView
        exercise={question}
        answer={answer}
        onAnswer={onAnswer}
        result={null}
        settings={DEFAULT_SETTINGS_FOR_TEST}
        onSubmit={onSubmit}
      />,
    );
  });
  return tree;
}

function option(tree: TestRenderer.ReactTestRenderer, text: string): ReactTestInstance {
  const matches = tree.root.findAll(
    (node) => node.props?.accessibilityLabel === text && typeof node.props?.onPress === 'function',
  );
  if (matches.length === 0) throw new Error(`no option labelled "${text}"`);
  return matches[0];
}

test('choosing an option reports it and grades nothing', () => {
  const onAnswer = jest.fn();
  const onSubmit = jest.fn();
  const tree = render(null, onAnswer, onSubmit);

  act(() => option(tree, 'adiós').props.onPress());

  expect(onAnswer).toHaveBeenCalledWith('0');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('changing your mind changes the selection and still grades nothing', () => {
  const onAnswer = jest.fn();
  const onSubmit = jest.fn();
  // The parent has already recorded the wrong pick — this is the second tap.
  const tree = render('0', onAnswer, onSubmit);

  act(() => option(tree, 'hola').props.onPress());

  expect(onAnswer).toHaveBeenCalledWith('1');
  expect(onSubmit).not.toHaveBeenCalled();
});
