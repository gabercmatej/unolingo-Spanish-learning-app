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

export type Verdict = 'correct' | 'correctWithFeedback' | 'incorrect';

export type AnswerError =
  /** Exactly right. */
  | 'none'
  /** A missing or added accent on a word that has no accented twin: café. */
  | 'accent'
  /** An accent that distinguishes two real forms: está/esta, hablé/hable. */
  | 'accentContrast'
  /** Capitalisation, a missing ¿ or ¡, stray punctuation. */
  | 'punctuation'
  /** One slipped key inside a word. */
  | 'spelling'
  /** Different words, same meaning. */
  | 'paraphrase'
  /** Acceptable, but the course has a more precise or natural form. */
  | 'preferred'
  /** Right lemma, wrong inflection: person, tense, number, gender, mood. */
  | 'form'
  /** Wrong function word: ser~estar, por~para, article, clitic. */
  | 'grammar'
  /** The polarity is reversed. Never let this slide. */
  | 'negation'
  /** A different meaning, or content missing or added. */
  | 'meaning'
  /**
   * The learner got there, but not cleanly, and no finer classification
   * applies — a match grid finished with a wrong pairing along the way, a
   * speaking prompt skipped rather than attempted. Naming it `spelling` or
   * `meaning` would be a semantic lie once this field starts reaching the
   * feedback bar and `MistakeRecord`, so it gets its own name instead of
   * borrowing one that means something more specific.
   */
  | 'partial';

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

/**
 * A wrong answer, recorded with enough about it to be *reproduced*.
 *
 * The fields below the divider are all optional, so adding them needs no
 * `STATE_VERSION` bump — a record written by an earlier build simply comes back
 * without them, and the retry falls back to the concept. That fallback is the
 * old behaviour, which is worth stating plainly: "Review mistakes" used to keep
 * only `conceptIds`, throw the rest away, and ask the generator for whatever it
 * felt like building for those concepts. A mistake on one sentence became four
 * unrelated exercises on its four tagged concepts, which is exactly the "random
 * questions" the feature was reported for.
 */
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

  // --- Reproduction (all optional: no schema version bump) ------------------
  /** The sentence the exercise was built from, so the exact item can be rebuilt. */
  sentenceId?: string;
  /**
   * The concept the exercise was actually practising, as opposed to the ones
   * that merely appeared in its sentence. This is what a retry must target;
   * scoring the whole list is what let a mistake be "resolved" by answering a
   * multiple choice about an unrelated word in the same line.
   */
  targetId?: string;
  /** Retries attempted since the mistake was made, to escalate the scaffolding. */
  attempts?: number;
  /** When it was last retried, whatever the outcome. */
  lastAttemptAt?: number;
  /**
   * What kind of error this was. Optional, so no `STATE_VERSION` bump — a
   * record from an earlier build simply comes back without it.
   */
  error?: AnswerError;
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
  /**
   * UI sound cues on answers, level-ups and unlocks.
   *
   * Non-optional in the type but defaulted in `DEFAULT_SETTINGS`, which is the
   * same shape as `haptics` and needs no `STATE_VERSION` bump: hydration merges
   * defaults *under* the saved object, so a record written before this existed
   * comes back with sound switched on rather than undefined.
   */
  sounds: boolean;
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
  /**
   * Shows the "why am I seeing this?" panel inside a session.
   *
   * Optional, so adding it needs no `STATE_VERSION` bump — hydration merges
   * defaults over a saved settings object, which is exactly what that rule is
   * for. Off by default: this is a tool for diagnosing the adaptive layer
   * during dogfooding, not a feature of the course.
   */
  developerMode?: boolean;
  /**
   * A local reminder at `reminderHour` on any day the learner has not studied.
   *
   * Non-optional but defaulted, the `sounds` shape — hydration merges defaults
   * *under* the saved object, so a record written before this existed comes
   * back with reminders on rather than undefined, and no `STATE_VERSION` bump
   * is needed. Scheduling is best-effort: the OS permission is asked for once
   * and a refusal leaves the flag on but the queue empty, which is why the
   * settings screen distinguishes "off" from "denied".
   */
  reminders: boolean;
  /** Local hour for the daily nudge, 0–23. Six in the evening by default. */
  reminderHour: number;
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
