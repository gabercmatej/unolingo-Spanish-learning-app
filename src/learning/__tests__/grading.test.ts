import { profileFor } from '@/learning/check';
import { DEFAULT_SETTINGS } from '@/learning/defaults';
import type { Exercise } from '@/learning/exercise';
import { ERROR_POLICY, gradeFor, verdictFor, type AnswerError } from '@/learning/grading';

describe('ERROR_POLICY', () => {
  const ALL: AnswerError[] = [
    'none', 'accent', 'accentContrast', 'punctuation', 'spelling', 'partial',
    'paraphrase', 'preferred', 'form', 'grammar', 'negation', 'meaning',
  ];

  it('covers every error with no gaps', () => {
    for (const error of ALL) expect(ERROR_POLICY[error]).toBeDefined();
    expect(Object.keys(ERROR_POLICY).sort()).toEqual([...ALL].sort());
  });

  it('treats understanding-with-a-slip as successful retrieval', () => {
    // The whole point: none of these may reach the SRS as a failure.
    for (const error of ['accent', 'punctuation', 'paraphrase', 'preferred'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('correctWithFeedback');
      expect(gradeFor(error)).toBe('correct');
    }
  });

  it('charges a small price for a slipped key or a meaning-bearing accent', () => {
    for (const error of ['spelling', 'accentContrast', 'partial'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('correctWithFeedback');
      expect(gradeFor(error)).toBe('almost');
    }
  });

  it('fails only when the meaning or the tested form is wrong', () => {
    for (const error of ['form', 'grammar', 'negation', 'meaning'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('incorrect');
      expect(gradeFor(error)).toBe('incorrect');
    }
  });

  it('says nothing extra when the answer was exactly right', () => {
    expect(verdictFor('none')).toBe('correct');
    expect(gradeFor('none')).toBe('correct');
  });

  it('never reports an incorrect verdict with a passing grade', () => {
    for (const [error, policy] of Object.entries(ERROR_POLICY)) {
      if (policy.verdict === 'incorrect') expect(policy.grade).toBe('incorrect');
      if (policy.grade === 'incorrect') expect(policy.verdict).toBe('incorrect');
      expect(error).toBeTruthy();
    }
  });
});

const exercise = (patch: Partial<Exercise>) =>
  ({ id: 'x', kind: 'translateToEs', form: 'typed', conceptIds: [], difficulty: 3, xp: 10,
     instruction: '', ...patch }) as Exercise;

describe('profileFor', () => {
  it('makes a dictation about the exact written form', () => {
    expect(profileFor(exercise({ kind: 'dictation' }), DEFAULT_SETTINGS).formIsTarget).toBe(true);
  });

  it('makes a conjugation exercise about the form, whatever its kind', () => {
    const p = profileFor(exercise({ kind: 'fillBlank', targetId: 'f.hablar.preterite' }), DEFAULT_SETTINGS);
    expect(p.formIsTarget).toBe(true);
  });

  it('leaves an ordinary translation free of form-testing', () => {
    const p = profileFor(exercise({ kind: 'translateToEs', targetId: 'v.casa' }), DEFAULT_SETTINGS);
    expect(p.formIsTarget).toBe(false);
  });

  it('honours the learner’s own strict-accent setting everywhere', () => {
    const p = profileFor(exercise({ kind: 'translateToEs' }), { ...DEFAULT_SETTINGS, strictAccents: true });
    expect(p.formIsTarget).toBe(true);
  });

  it('gives English comprehension the English paraphrase layer', () => {
    const p = profileFor(exercise({ kind: 'translateToEn' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('english');
    expect(p.language).toBe('en');
  });

  it('gives a free conversation turn meaning coverage', () => {
    const p = profileFor(exercise({ kind: 'conversation', form: 'conversation' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('spanishFree');
  });

  it('gives a gap-fill no paraphrase at all — one word is the answer', () => {
    const p = profileFor(exercise({ kind: 'fillBlank' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('none');
  });

  it('always injects the corpus knowledge, so the app is never the permissive default', () => {
    const p = profileFor(exercise({}), DEFAULT_SETTINGS);
    expect(p.accentCarriesMeaning?.('esta')).toBe(true);
    expect(p.accentCarriesMeaning?.('cafe')).toBe(false);
    expect(p.equivalences).toBeDefined();
  });
});
