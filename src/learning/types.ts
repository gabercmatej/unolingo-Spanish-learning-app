import type { CefrLevel } from '@/content/types';

/** How hard an exercise is to produce, 1 (recognise) … 5 (free production). */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ExerciseKind =
  | 'teach' // presentation card, not scored
  | 'grammarCard' // grammar explanation, not scored
  | 'cultureCard' // culture note, not scored
  | 'multipleChoice'
  | 'listenSelect'
  | 'match'
  | 'wordBank'
  | 'grammarChoice'
  | 'chooseNatural'
  | 'fillBlank'
  | 'translateToEn'
  | 'translateToEs'
  | 'dictation'
  | 'correctMistake'
  | 'conversation'
  | 'listenComprehend'
  | 'reading'
  | 'buildResponse'
  | 'speak';

/** Kinds that carry no answer — they teach, then move on. */
export const PRESENTATION_KINDS: ExerciseKind[] = ['teach', 'grammarCard', 'cultureCard'];

export const KIND_DIFFICULTY: Record<ExerciseKind, Difficulty> = {
  teach: 1,
  grammarCard: 1,
  cultureCard: 1,
  multipleChoice: 1,
  listenSelect: 2,
  match: 1,
  wordBank: 2,
  grammarChoice: 2,
  chooseNatural: 3,
  fillBlank: 3,
  translateToEn: 2,
  translateToEs: 4,
  dictation: 4,
  correctMistake: 4,
  conversation: 4,
  listenComprehend: 3,
  reading: 3,
  buildResponse: 5,
  speak: 4,
};

/** XP reflects effort, so recognition pays least and free production most. */
export const KIND_XP: Record<ExerciseKind, number> = {
  teach: 0,
  grammarCard: 0,
  cultureCard: 0,
  multipleChoice: 1,
  match: 1,
  listenSelect: 2,
  wordBank: 2,
  grammarChoice: 2,
  translateToEn: 2,
  chooseNatural: 3,
  fillBlank: 3,
  listenComprehend: 3,
  reading: 3,
  dictation: 3,
  translateToEs: 3,
  correctMistake: 4,
  conversation: 4,
  speak: 4,
  buildResponse: 5,
};

export const KIND_LABELS: Record<ExerciseKind, string> = {
  teach: 'New word',
  grammarCard: 'Grammar',
  cultureCard: 'Culture',
  multipleChoice: 'Multiple choice',
  listenSelect: 'Listening',
  match: 'Matching',
  wordBank: 'Word bank',
  grammarChoice: 'Grammar choice',
  chooseNatural: 'Natural Spanish',
  fillBlank: 'Fill the gap',
  translateToEn: 'Spanish → English',
  translateToEs: 'English → Spanish',
  dictation: 'Dictation',
  correctMistake: 'Correct the mistake',
  conversation: 'Conversation',
  listenComprehend: 'Listening',
  reading: 'Reading',
  buildResponse: 'Build a response',
  speak: 'Speaking',
};

/** The four trackable skills, used for mastery breakdowns. */
export type Skill = 'vocabulary' | 'grammar' | 'listening' | 'production';

export const KIND_SKILL: Record<ExerciseKind, Skill | null> = {
  teach: null,
  grammarCard: null,
  cultureCard: null,
  multipleChoice: 'vocabulary',
  match: 'vocabulary',
  translateToEn: 'vocabulary',
  listenSelect: 'listening',
  dictation: 'listening',
  listenComprehend: 'listening',
  wordBank: 'grammar',
  grammarChoice: 'grammar',
  fillBlank: 'grammar',
  correctMistake: 'grammar',
  chooseNatural: 'grammar',
  reading: 'vocabulary',
  translateToEs: 'production',
  conversation: 'production',
  buildResponse: 'production',
  speak: 'production',
};

export type Grade = 'correct' | 'almost' | 'incorrect';

/** Per-concept memory record. This is the learner model. */
export interface ConceptState {
  id: string;
  firstSeen: number;
  lastReviewed: number;
  timesSeen: number;
  correct: number;
  incorrect: number;
  /** Times a previously-known concept was forgotten. */
  lapses: number;
  /** Consecutive non-failures. */
  streak: number;
  /** 0..1 difficulty-weighted performance average. */
  strength: number;
  /** Days until predicted retrievability falls to the review threshold. */
  stability: number;
  /** Growth multiplier, SM-2 style. */
  ease: number;
  dueAt: number;
  /** Deepest exercise difficulty answered correctly — drives adaptive difficulty. */
  depth: Difficulty;
  /** Exercise kinds already attempted, so the mix stays varied. */
  kinds: ExerciseKind[];
  /** True once the concept has had its teaching card. */
  introduced: boolean;
}

export interface MistakeRecord {
  id: string;
  at: number;
  conceptIds: string[];
  kind: ExerciseKind;
  prompt: string;
  given: string;
  expected: string;
  explanation?: string;
  /** Set once the learner answers this mistake correctly again. */
  resolvedAt?: number;
}

export interface SessionRecord {
  id: string;
  at: number;
  /** Lesson id, or a practice-mode id like `smart-review`. */
  source: string;
  label: string;
  xp: number;
  correct: number;
  total: number;
  /** Seconds of study. */
  duration: number;
  newConcepts: number;
}

export interface DailyRecord {
  /** ISO date, local time: YYYY-MM-DD. */
  date: string;
  xp: number;
  seconds: number;
  exercises: number;
}

export type Appearance = 'system' | 'light' | 'dark';
export type DailyGoal = 5 | 10 | 20 | 30;

export interface Settings {
  name: string;
  appearance: Appearance;
  haptics: boolean;
  /** Speaks the Spanish aloud after a correct answer. */
  autoPlayAudio: boolean;
  /** Marks missing accents wrong instead of accepting with a note. */
  strictAccents: boolean;
  /** Removes word banks and hints, and prefers free production. */
  hardMode: boolean;
  /** Include speaking prompts in sessions. */
  speakingExercises: boolean;
  /** Default listening speed for new audio items. */
  slowAudioDefault: boolean;
  /** Chosen TTS voice id, or undefined to let the app pick the best available. */
  voiceId?: string;
  /** Shows the English translation alongside Spanish in teaching cards. */
  showTranslations: boolean;
  dailyGoal: DailyGoal;
  /**
   * Profile picture, as a small JPEG data URI. Undefined means the panda.
   * Stored inline rather than as a file path because a cache path is not
   * guaranteed to survive, and the image is deliberately kept tiny.
   */
  avatarUri?: string;
}

export interface PlacementResult {
  level: CefrLevel;
  /** "A1+" style label including the plus. */
  label: string;
  strengths: string[];
  weaknesses: string[];
  takenAt: number;
  /** Lesson id the learner was placed at. */
  startLesson: string;
}

export interface LearnerState {
  version: number;
  settings: Settings;
  concepts: Record<string, ConceptState>;
  completedLessons: Record<string, { at: number; accuracy: number; times: number }>;
  mistakes: MistakeRecord[];
  sessions: SessionRecord[];
  daily: DailyRecord[];
  xp: number;
  /** Consecutive days with any study. Never decremented as a punishment — it is recomputed. */
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  placement: PlacementResult | null;
  onboarded: boolean;
  favourites: string[];
  /** Total seconds studied, all time. */
  totalSeconds: number;
  createdAt: number;
}
