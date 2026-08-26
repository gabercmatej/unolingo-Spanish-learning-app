import { act } from 'react';
import TestRenderer, { type ReactTestInstance } from 'react-test-renderer';

import type { RecordAnswerInput } from '@/context/LearnerContext';

/**
 * The session player, driven the way a learner drives it.
 *
 * Both bugs below lived in this screen rather than in the logic underneath it,
 * and both would pass a test of that logic on its own — which is why these
 * press the actual buttons.
 *
 * ---
 *
 * Finishing a lesson means reaching the end of it.
 *
 * `completedLessonId` has always known this — it takes how the session ended
 * and refuses to name a lesson unless the queue actually ran out. What it could
 * not defend against was the screen asking it from two places: the unmount
 * commit asked honestly, and the close button routed through `finish()`, which
 * answered `reachedEnd: true` unconditionally. So one correct answer and a tap
 * on the X ticked the lesson off — and 36 of the course's 63 units carry
 * exactly one required lesson, so for more than half the course that finished
 * the unit's teaching outright.
 *
 * These drive the real screen, because the bug was never in the decision. It
 * was in which of the two callers reached it, and a test of the decision alone
 * passes with the bug still in place.
 */

const mockCompleteSession = jest.fn();
const mockRecordAnswer = jest.fn((_input: RecordAnswerInput) => ({ xp: 5 }));
const mockBack = jest.fn();
const mockConfirm = { answer: true };

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: () => mockBack(),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({ kind: 'lesson', source: 'l.greetings' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/components/ui/confirm', () => ({
  useConfirm: () => () => Promise.resolve(mockConfirm.answer),
}));

jest.mock('@/context/LearnerContext', () => ({
  useLearner: () => {
    const { makeLearner, DEFAULT_SETTINGS_FOR_TEST } = jest.requireActual(
      '@/learning/__tests__/helpers',
    );
    return {
      learner: makeLearner(),
      settings: DEFAULT_SETTINGS_FOR_TEST,
      recordAnswer: mockRecordAnswer,
      markIntroduced: jest.fn(),
      completeSession: mockCompleteSession,
      beginLesson: jest.fn(),
      abandonLesson: jest.fn(),
    };
  },
}));

/** Every cue is a no-op here; which one fired is the ladder's own test. */
const mockSilence = () => new Proxy({}, { get: () => () => {} });

jest.mock('@/lib/sound', () => ({ sound: mockSilence(), primeSounds: () => {} }));
jest.mock('@/lib/speech', () => ({ speakSpanish: () => {}, stopSpeaking: () => {} }));
jest.mock('@/lib/feedback', () => ({ feedback: mockSilence() }));

/**
 * A two-question queue, so "answered one" and "answered every one" are
 * distinguishable states rather than the same tap. The screen is what is under
 * test here; the generator has its own suite.
 */
jest.mock('@/learning/session', () => {
  const actual = jest.requireActual('@/learning/session');
  const question = (id: string) => ({
    id,
    kind: 'multipleChoice',
    form: 'choice',
    conceptIds: ['v.hola'],
    difficulty: 2,
    xp: 5,
    instruction: 'Which one means "hello"?',
    prompt: 'hello',
    options: [{ text: 'adiós' }, { text: 'hola' }],
    answerIndex: 1,
  });
  return {
    ...actual,
    buildSession: () => ({
      id: 'test',
      kind: 'lesson',
      source: 'l.greetings',
      title: 'Greetings',
      subtitle: '',
      exercises: [question('q1'), question('q2')],
    }),
  };
});

// --- driving the screen ----------------------------------------------------

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  const matches: ReactTestInstance[] = tree.root.findAll(
    (node) => node.props?.accessibilityLabel === label && typeof node.props?.onPress === 'function',
  );
  if (matches.length === 0) throw new Error(`no pressable labelled "${label}"`);
  act(() => {
    matches[0].props.onPress();
  });
}

/** Select the right option and grade it — one whole question. */
function answerOne(tree: TestRenderer.ReactTestRenderer) {
  press(tree, 'hola');
  press(tree, 'Check');
}

let rendered: TestRenderer.ReactTestRenderer | null = null;

function renderSession() {
  // Required lazily so the mocks above are in place before the module loads.
  // A static import is hoisted above the jest.mock calls, which is the one
  // thing this must not be: the screen has to load with the mocks in place.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SessionScreen = require('@/app/session').default;
  act(() => {
    rendered = TestRenderer.create(<SessionScreen />);
  });
  return rendered!;
}

/**
 * The results screen counts its totals up on a timer, and a timer that outlives
 * the test keeps calling `setState` on a tree nobody is holding — which React
 * reports through `window.dispatchEvent`, a thing this environment does not
 * have, taking the worker down with it. Unmounting stops the clock.
 */
afterEach(() => {
  act(() => {
    rendered?.unmount();
  });
  rendered = null;
});

/**
 * Let the screen settle until the thing being waited on has happened.
 *
 * `confirmExit` awaits a dialog, so the commit lands a microtask after the
 * press rather than during it. Flushing a fixed number of turns and hoping is
 * how a suite starts failing once every few dozen runs; this polls the
 * condition instead, and the assertion that follows still reports honestly if
 * it never arrives.
 */
async function settleUntil(done: () => boolean) {
  for (let turn = 0; turn < 20 && !done(); turn += 1) {
    await act(async () => {});
  }
}

beforeEach(() => {
  mockCompleteSession.mockClear();
  mockRecordAnswer.mockClear();
  mockBack.mockClear();
  mockConfirm.answer = true;
});

test('answering one exercise and quitting does not complete the lesson', async () => {
  const tree = renderSession();

  answerOne(tree);
  press(tree, 'Close session');
  await settleUntil(() => mockCompleteSession.mock.calls.length > 0);

  expect(mockCompleteSession).toHaveBeenCalledTimes(1);
  const committed = mockCompleteSession.mock.calls[0][0];
  // The work is banked — leaving must not cost the learner what they earned.
  expect(committed.xp).toBeGreaterThan(0);
  expect(committed.total).toBe(1);
  // But the lesson was not walked, so it is not ticked.
  expect(committed.lessonId).toBeUndefined();
});

test('reaching the end of the queue completes the lesson', async () => {
  const tree = renderSession();

  answerOne(tree);
  press(tree, 'Continue');
  answerOne(tree);
  press(tree, 'See results');
  await settleUntil(() => mockCompleteSession.mock.calls.length > 0);

  expect(mockCompleteSession).toHaveBeenCalledTimes(1);
  const committed = mockCompleteSession.mock.calls[0][0];
  expect(committed.total).toBe(2);
  expect(committed.lessonId).toBe('l.greetings');
});

test('grades the option selected when Check was pressed, not the one before it', () => {
  const tree = renderSession();

  // Pick the wrong one, think better of it, then check.
  press(tree, 'adiós');
  press(tree, 'hola');
  press(tree, 'Check');

  // Grading happened once, and on the answer that was on screen.
  expect(mockRecordAnswer).toHaveBeenCalledTimes(1);
  expect(mockRecordAnswer.mock.calls[0][0].grade).toBe('correct');
});

test('selecting an option grades nothing until Check is pressed', () => {
  const tree = renderSession();

  press(tree, 'adiós');
  press(tree, 'hola');

  expect(mockRecordAnswer).not.toHaveBeenCalled();
});
