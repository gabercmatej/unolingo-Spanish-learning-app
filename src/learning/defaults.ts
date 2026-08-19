import type { LearnerState, Settings } from '@/learning/types';

/**
 * The shape of a learner who has just installed the app.
 *
 * This lives in the learning layer rather than beside the React store because
 * two things that are not React need it: the migrator, which fills in fields a
 * saved record predates, and the tests. It is policy — what a learner *is* —
 * and policy does not belong in a provider.
 */

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  appearance: 'system',
  haptics: true,
  sounds: true,
  autoPlayAudio: true,
  strictAccents: false,
  hardMode: false,
  speakingExercises: true,
  slowAudioDefault: false,
  showTranslations: true,
  dailyGoal: 10,
};

/**
 * A brand-new learner record.
 *
 * `version` is stamped by the caller that knows the current schema, so this
 * file never has to import the store it is trying to stay independent of.
 */
export function blankLearnerState(now = Date.now()): LearnerState {
  return {
    version: 0,
    settings: DEFAULT_SETTINGS,
    concepts: {},
    completedLessons: {},
    mistakes: [],
    sessions: [],
    daily: [],
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    placement: null,
    onboarded: false,
    favourites: [],
    totalSeconds: 0,
    createdAt: now,
  };
}
