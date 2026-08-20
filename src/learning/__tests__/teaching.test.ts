import type { ExerciseResult } from '@/learning/check';
import type { Exercise } from '@/learning/exercise';
import { shouldShowMeaning, teachingFor } from '@/learning/teaching';
import { KIND_DIFFICULTY, KIND_XP, type ExerciseKind } from '@/learning/types';

function choice(kind: ExerciseKind, over: Partial<Exercise> = {}): Exercise {
  return {
    id: `x-${kind}`,
    kind,
    form: 'choice',
    conceptIds: ['v.quedar'],
    difficulty: KIND_DIFFICULTY[kind],
    xp: KIND_XP[kind],
    instruction: 'What did you hear?',
    prompt: '',
    options: [{ text: 'a' }, { text: 'b' }],
    answerIndex: 0,
    source: { es: '¿A qué hora habéis quedado?', en: 'What time have you arranged to meet?' },
    ...over,
  } as Exercise;
}

const graded = (grade: ExerciseResult['grade'], over: Partial<ExerciseResult> = {}): ExerciseResult => ({
  grade,
  expected: 'a',
  given: 'a',
  ...over,
});

describe('listening feedback teaches meaning, not just sound', () => {
  it('reveals what a correctly identified sentence meant, for a beginner', () => {
    const teaching = teachingFor(choice('listenSelect'), graded('correct'), { level: 'A1' });
    expect(teaching?.es).toBe('¿A qué hora habéis quedado?');
    expect(teaching?.en).toBe('What time have you arranged to meet?');
  });

  it('still reveals it at B1, because answering revealed nothing about meaning', () => {
    expect(shouldShowMeaning(choice('listenSelect'), 'correct', 'B1')).toBe(true);
    expect(shouldShowMeaning(choice('dictation'), 'correct', 'B1')).toBe(true);
  });

  it('stops volunteering the English at B1 where the exercise already showed it', () => {
    // A "listen — what does it mean?" question ends with the meaning on screen
    // as the chosen option. Repeating it is noise.
    expect(shouldShowMeaning(choice('listenComprehend'), 'correct', 'B1')).toBe(false);
  });

  it('prefers immersion from B2 up, but never on a wrong answer', () => {
    expect(shouldShowMeaning(choice('listenSelect'), 'correct', 'B2')).toBe(false);
    expect(shouldShowMeaning(choice('listenSelect'), 'incorrect', 'C1')).toBe(true);
  });
});

describe('a correct answer still teaches something', () => {
  it('carries one compact reinforcement', () => {
    const teaching = teachingFor(
      choice('multipleChoice', { note: 'Me apetece is especially common in Spain.' }),
      graded('correct', { note: 'Me apetece is especially common in Spain.' }),
      { level: 'A1' },
    );
    expect(teaching?.note).toBe('Me apetece is especially common in Spain.');
  });

  it('falls back to the concept gloss when the exercise carried no note', () => {
    const teaching = teachingFor(
      choice('multipleChoice', { conceptIds: ['v.hola'], note: undefined }),
      graded('correct'),
      { level: 'A1' },
    );
    expect(teaching?.note).toBeTruthy();
  });

  it('adds nothing at all when there is nothing to add', () => {
    const bare = choice('match', { source: undefined, note: undefined, conceptIds: [] });
    expect(teachingFor(bare, graded('correct'), { level: 'A1' })).toBeNull();
  });
});

describe('a wrong answer is not a punishment for untaught material', () => {
  it('names the concepts the course had not introduced', () => {
    const exercise = choice('translateToEn', { supportIds: ['v.piso'] });
    const teaching = teachingFor(exercise, graded('incorrect'), {
      level: 'A1',
      isKnown: () => false,
    });
    expect(teaching?.untaught).toBe(true);
    expect(teaching?.newToYou.map((entry) => entry.label)).toContain('el piso');
  });

  it('says nothing about concepts the learner has in fact met', () => {
    const exercise = choice('translateToEn', { supportIds: ['v.piso'] });
    const teaching = teachingFor(exercise, graded('incorrect'), {
      level: 'A1',
      isKnown: () => true,
    });
    expect(teaching?.untaught).toBe(false);
    expect(teaching?.newToYou).toHaveLength(0);
  });
});

describe('what not to repeat', () => {
  it('does not re-show the Spanish under a failed translation into Spanish', () => {
    // The model answer is already on screen as the answer; printing the same
    // line again under it is two identical sentences and one wasted glance.
    const exercise = choice('translateToEs', {
      form: 'typed',
      accepted: ['¿A qué hora habéis quedado?'],
      language: 'es',
    } as Partial<Exercise>);
    const teaching = teachingFor(exercise, graded('incorrect', {
      expected: '¿A qué hora habéis quedado?',
      given: 'a que hora quedado',
    }), { level: 'A1' });
    expect(teaching?.es).toBeUndefined();
    // …but the meaning is still worth having.
    expect(teaching?.en).toBe('What time have you arranged to meet?');
  });

  it('says nothing about a presentation card', () => {
    const card = {
      ...choice('teach'),
      form: 'presentation',
    } as unknown as Exercise;
    expect(teachingFor(card, graded('correct'), { level: 'A1' })).toBeNull();
  });
});
