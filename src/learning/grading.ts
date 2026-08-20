import type { AnswerError, Grade, Verdict } from '@/learning/types';

/**
 * What was wrong with an answer, and what that is worth.
 *
 * The brief asked for three outcomes and for the error types behind them not to
 * all affect mastery identically. The danger in satisfying both is ending up
 * with two scoring systems that drift apart — one for the banner, one for the
 * scheduler. So there is exactly one thing the checker decides (`AnswerError`),
 * and both the learner-facing verdict and the SRS-facing grade are derived from
 * it by the one table below. Change the table and every consumer changes with
 * it; there is nowhere else to disagree.
 *
 * This file imports nothing but a type, on purpose: `answer-check.ts` imports
 * it and is required to stay free of `@/content`.
 */

export type { AnswerError, Verdict } from '@/learning/types';

/**
 * The only mapping from error to consequence in the codebase.
 *
 * `correctWithFeedback` is always successful retrieval: `review()` in `srs.ts`
 * treats only `incorrect` as failure, so neither row below resets stability,
 * breaks the streak, or writes a mistake record. The split between the two rows
 * is what the answer cost — `accent` and `paraphrase` are free because a
 * learner who writes "cafe" plainly knows the word, while a slipped key or a
 * meaning-bearing accent is worth a slightly shorter interval and half the XP.
 */
export const ERROR_POLICY: Record<AnswerError, { verdict: Verdict; grade: Grade }> = {
  none: { verdict: 'correct', grade: 'correct' },

  accent: { verdict: 'correctWithFeedback', grade: 'correct' },
  punctuation: { verdict: 'correctWithFeedback', grade: 'correct' },
  paraphrase: { verdict: 'correctWithFeedback', grade: 'correct' },
  preferred: { verdict: 'correctWithFeedback', grade: 'correct' },

  accentContrast: { verdict: 'correctWithFeedback', grade: 'almost' },
  spelling: { verdict: 'correctWithFeedback', grade: 'almost' },
  partial: { verdict: 'correctWithFeedback', grade: 'almost' },

  form: { verdict: 'incorrect', grade: 'incorrect' },
  grammar: { verdict: 'incorrect', grade: 'incorrect' },
  negation: { verdict: 'incorrect', grade: 'incorrect' },
  meaning: { verdict: 'incorrect', grade: 'incorrect' },
};

export function verdictFor(error: AnswerError): Verdict {
  return ERROR_POLICY[error].verdict;
}

export function gradeFor(error: AnswerError): Grade {
  return ERROR_POLICY[error].grade;
}

/** English words and phrases that mean the same thing for a comprehension check. */
export interface Equivalences {
  /** Lower-case word to the representative of its class. */
  word: ReadonlyMap<string, string>;
  /** Normalised multi-word phrase to the representative of its group. */
  phrase: ReadonlyMap<string, string>;
}

/**
 * What this task is actually testing, which decides how much slack an answer
 * gets. Assembled in one place (`check.ts`) so no screen and no builder ever
 * composes a tolerance by hand — the same reasoning that moved review scoping
 * into `scope.ts` after "mostly right, by convention, at each call site"
 * stopped being true.
 */
export interface GradingProfile {
  language: 'es' | 'en';
  /**
   * The exact written form is the thing under test — a dictation, a conjugation
   * drill, or a learner who has switched strict accents on. Here an accent that
   * distinguishes two real forms is a `form` error and fails.
   */
  formIsTarget: boolean;
  paraphrase: 'none' | 'english' | 'spanish' | 'spanishFree';
  /**
   * Corpus knowledge, injected because this module may not import `@/content`.
   *
   * Undefined means "do not distinguish", which makes the pure function
   * permissive by default and the app precise — the same seam `eligibility.ts`
   * uses when `knowledge` is undefined. Unit tests that want the distinction
   * inject the real predicate; the app always does, via `check.ts`.
   */
  accentCarriesMeaning?: (bare: string) => boolean;
  equivalences?: Equivalences;
}
