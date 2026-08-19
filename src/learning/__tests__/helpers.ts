import type { LearnerState, Settings } from '@/learning/types';

/** Test doubles for the learner store, kept out of the React layer. */

export const DEFAULT_SETTINGS_FOR_TEST: Settings = {
  name: 'Test',
  appearance: 'system',
  haptics: false,
  sounds: false,
  autoPlayAudio: false,
  strictAccents: false,
  hardMode: false,
  speakingExercises: true,
  slowAudioDefault: false,
  showTranslations: true,
  dailyGoal: 10,
};

export function makeLearner(overrides: Partial<LearnerState> = {}): LearnerState {
  return {
    version: 1,
    settings: DEFAULT_SETTINGS_FOR_TEST,
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
    onboarded: true,
    favourites: [],
    totalSeconds: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}
