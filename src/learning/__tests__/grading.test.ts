import { ERROR_POLICY, gradeFor, verdictFor, type AnswerError } from '@/learning/grading';

describe('ERROR_POLICY', () => {
  const ALL: AnswerError[] = [
    'none', 'accent', 'accentContrast', 'punctuation', 'spelling',
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
    for (const error of ['spelling', 'accentContrast'] as AnswerError[]) {
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
