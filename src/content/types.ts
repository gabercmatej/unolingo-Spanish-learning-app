/**
 * Unolingo content model.
 *
 * Everything the course teaches is data in `src/content/**`. No lesson is ever
 * hard-coded into a screen. The rules that keep this maintainable as the course
 * grows to hundreds of lessons:
 *
 *   1. A **Concept** is the atomic unit of knowledge the learner model tracks.
 *      Vocabulary items, grammar rules and verb paradigms are all concepts.
 *   2. A **Sentence** is a reusable, natural example tagged with the concepts it
 *      exercises. Exercises are *generated* from sentences + concepts, so one
 *      well-written sentence yields a translation, a word-bank, a fill-the-gap,
 *      a dictation and a listening item.
 *   3. A **Lesson** never contains exercises. It declares what it teaches and
 *      which sentences it draws on; the generator does the rest, adapting the
 *      exercise mix to the learner.
 *
 * Adding content = adding entries to these arrays. Nothing else has to change.
 */

// ---------------------------------------------------------------------------
// Shared vocabulary of the model
// ---------------------------------------------------------------------------

export const CEFR_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export type Register = 'neutral' | 'informal' | 'formal' | 'colloquial';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'determiner'
  | 'interjection'
  | 'expression'
  | 'number';

export type Gender = 'm' | 'f' | 'mf';

export type TopicId =
  | 'greetings'
  | 'introductions'
  | 'people'
  | 'family'
  | 'numbers'
  | 'time'
  | 'food'
  | 'cafe'
  | 'restaurant'
  | 'shopping'
  | 'city'
  | 'directions'
  | 'transport'
  | 'home'
  | 'university'
  | 'work'
  | 'hobbies'
  | 'plans'
  | 'feelings'
  | 'describing'
  | 'opinions'
  | 'travel'
  | 'health'
  | 'weather'
  | 'daily-routine'
  | 'social'
  | 'past'
  | 'storytelling'
  | 'slang';

/** Human labels for topics, used in the Library filters and lesson headers. */
export const TOPIC_LABELS: Record<TopicId, string> = {
  greetings: 'Greetings',
  introductions: 'Introductions',
  people: 'People',
  family: 'Family',
  numbers: 'Numbers',
  time: 'Time',
  food: 'Food',
  cafe: 'Cafés',
  restaurant: 'Restaurants',
  shopping: 'Shopping',
  city: 'The city',
  directions: 'Directions',
  transport: 'Transport',
  home: 'Home',
  university: 'University',
  work: 'Work',
  hobbies: 'Hobbies',
  plans: 'Making plans',
  feelings: 'Feelings',
  describing: 'Describing people',
  opinions: 'Opinions',
  travel: 'Travel',
  health: 'Health',
  weather: 'Weather',
  'daily-routine': 'Daily routine',
  social: 'Social Spanish',
  past: 'Talking about the past',
  storytelling: 'Storytelling',
  slang: 'Everyday slang',
};

// ---------------------------------------------------------------------------
// Concepts
// ---------------------------------------------------------------------------

export type ConceptKind = 'vocab' | 'phrase' | 'grammar' | 'verbform';

export interface ConceptBase {
  id: string;
  kind: ConceptKind;
  level: CefrLevel;
  topics: TopicId[];
}

/**
 * A word or fixed expression. `phrase` behaves identically but is surfaced
 * separately in the Library, because chunks ("me apetece", "qué guay") are
 * learned and reviewed differently from single words.
 */
export interface VocabConcept extends ConceptBase {
  kind: 'vocab' | 'phrase';
  es: string;
  en: string;
  /** Additional English renderings accepted when translating ES → EN. */
  altEn?: string[];
  pos: PartOfSpeech;
  gender?: Gender;
  plural?: string;
  register?: Register;
  /** True when this is the form used in Spain but not the pan-Hispanic default. */
  spainOnly?: boolean;
  /** Shown as the 🇪🇸 / 🌎 comparison card. */
  regional?: { spain: string; latam: string; note?: string };
  /** Short usage note shown in the dictionary and after answering. */
  note?: string;
  /** Concept ids commonly mixed up with this one — drives interleaved drills. */
  confusableWith?: string[];
  /** Verb id in `content/verbs` when this word is a verb. */
  verbId?: string;
}

export type GrammarBlock =
  | { type: 'text'; text: string }
  | { type: 'rule'; label: string; text: string; tone?: 'grammar' | 'success' | 'danger' }
  | { type: 'contrast'; left: ContrastSide; right: ContrastSide }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'examples'; items: ExampleLine[] }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string };

export interface ContrastSide {
  title: string;
  caption: string;
  tone?: 'grammar' | 'listening' | 'success' | 'danger' | 'accent';
  examples: ExampleLine[];
}

export interface ExampleLine {
  es: string;
  en: string;
  note?: string;
  /** Substrings rendered in the accent colour. */
  highlight?: string[];
}

export interface GrammarConcept extends ConceptBase {
  kind: 'grammar';
  title: string;
  /** One line the learner sees on cards and in results. */
  short: string;
  /** The concise teaching card shown before practice. */
  summary: GrammarBlock[];
  /** Revealed by "Explain more" — depth on demand, never up front. */
  deepDive?: GrammarBlock[];
  examples: ExampleLine[];
  pitfalls?: string[];
  /** Grammar concept ids this builds on. */
  requires?: string[];
}

/**
 * A verb paradigm (one verb × one tense), e.g. "tener, present".
 * These are *derived* from `content/verbs` at registry build time, so adding a
 * verb automatically creates its trackable conjugation concepts.
 */
export interface VerbFormConcept extends ConceptBase {
  kind: 'verbform';
  verbId: string;
  tense: TenseId;
  label: string;
}

export type Concept = VocabConcept | GrammarConcept | VerbFormConcept;

// ---------------------------------------------------------------------------
// Verbs
// ---------------------------------------------------------------------------

export const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const;
export type Person = (typeof PERSONS)[number];

/** Peninsular pronoun labels — vosotros is a first-class citizen here. */
export const PERSON_LABELS: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él / ella / usted',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos / ellas / ustedes',
};

export const PERSON_SHORT: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él',
  nosotros: 'nos.',
  vosotros: 'vos.',
  ellos: 'ellos',
};

export type TenseId =
  | 'present'
  | 'preterite'
  | 'imperfect'
  | 'presentPerfect'
  | 'future'
  | 'conditional'
  | 'presentSubjunctive'
  | 'imperative';

export const TENSE_LABELS: Record<TenseId, string> = {
  present: 'Present',
  preterite: 'Preterite',
  imperfect: 'Imperfect',
  presentPerfect: 'Present perfect',
  future: 'Future',
  conditional: 'Conditional',
  presentSubjunctive: 'Present subjunctive',
  imperative: 'Imperative',
};

export interface Conjugation {
  forms: Record<Person, string>;
  /** Persons that deviate from the regular pattern — highlighted in the UI. */
  irregular?: Person[];
}

export interface Verb {
  id: string;
  infinitive: string;
  en: string;
  group: 'ar' | 'er' | 'ir';
  irregular: boolean;
  /** e.g. "e → ie stem change, plus an irregular yo form". */
  irregularityNote?: string;
  level: CefrLevel;
  gerund: string;
  participle: string;
  tenses: Partial<Record<TenseId, Conjugation>>;
  /** Common constructions worth knowing, e.g. "tener que + infinitivo". */
  patterns?: { pattern: string; en: string; example: ExampleLine }[];
}

// ---------------------------------------------------------------------------
// Sentences
// ---------------------------------------------------------------------------

export interface Sentence {
  id: string;
  es: string;
  en: string;
  /** Other equally natural Spanish versions — accepted when translating EN → ES. */
  altEs?: string[];
  /** Other acceptable English versions. */
  altEn?: string[];
  concepts: string[];
  level: CefrLevel;
  topics: TopicId[];
  register?: Register;
  /**
   * Words that make good gaps. Must appear verbatim in `es`. When omitted the
   * generator falls back to words carrying a tracked concept.
   */
  blanks?: string[];
  /** Shown after answering — the "why", not just the what. */
  note?: string;
  /** Suppresses listening/dictation use (e.g. sentences with written-only forms). */
  noAudio?: boolean;
}

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

export type LessonKind =
  | 'core'
  | 'grammar'
  | 'conversation'
  | 'listening'
  | 'story'
  | 'checkpoint';

export interface Lesson {
  id: string;
  title: string;
  /** Learner-facing objective: "Order a coffee and pay in a Madrid café". */
  goal: string;
  kind: LessonKind;
  level: CefrLevel;
  estMinutes: number;
  /** Lesson ids that must be complete first. */
  requires?: string[];
  /**
   * Enrichment rather than spine: stories, listening and conversation practice.
   *
   * Optional lessons hang off the core chain — they unlock with it and count
   * towards mastery, but nothing downstream requires them and a unit is
   * complete without them. Skipping a story must never wall off the next unit.
   */
  optional?: boolean;
  /** Concepts introduced here for the first time. */
  teaches: string[];
  /** Grammar concept ids presented as teaching cards before practice. */
  grammar?: string[];
  /** Sentence ids this lesson draws its exercises from. */
  sentences: string[];
  /** Culture note ids surfaced between exercises. */
  culture?: string[];
  /** Conversation scene id for `kind: 'conversation'`. */
  conversation?: string;
  /** Story id for `kind: 'story'`. */
  story?: string;
  /**
   * Stage id for `kind: 'checkpoint'`. The session builder gathers every
   * concept taught anywhere in that stage rather than using `teaches`.
   */
  checkpointFor?: string;
}

/**
 * Icons are Ionicons names, listed as a union so content stays free of UI
 * imports while still being checked. Emoji are reserved for actual content
 * (flags in regional comparisons), never used as interface iconography.
 */
export type UnitIcon =
  | 'chatbubbles-outline'
  | 'person-outline'
  | 'people-outline'
  | 'finger-print-outline'
  | 'pulse-outline'
  | 'cube-outline'
  | 'calculator-outline'
  | 'time-outline'
  | 'cafe-outline'
  | 'restaurant-outline'
  | 'home-outline'
  | 'heart-outline'
  | 'sunny-outline'
  | 'repeat-outline'
  | 'checkmark-done-outline'
  | 'thumbs-up-outline'
  | 'calendar-outline'
  | 'beer-outline'
  | 'sparkles-outline'
  | 'navigate-outline'
  | 'subway-outline'
  | 'bag-handle-outline'
  | 'hourglass-outline'
  | 'book-outline'
  | 'git-branch-outline'
  | 'swap-horizontal-outline'
  | 'chatbox-ellipses-outline'
  | 'bulb-outline'
  | 'flag-outline'
  | 'newspaper-outline'
  | 'mic-outline'
  | 'briefcase-outline'
  | 'school-outline'
  | 'earth-outline'
  | 'trending-up-outline'
  | 'layers-outline'
  | 'happy-outline'
  | 'ribbon-outline';

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  icon: UnitIcon;
  /** Channel colour key from the palette. */
  tone: 'vocab' | 'grammar' | 'listening' | 'conversation' | 'story' | 'culture' | 'speaking';
  level: CefrLevel;
  /** Learner-facing summary of what the unit covers, shown on the unit card. */
  topics: string[];
  lessons: Lesson[];
  /**
   * `planned` units are curriculum outline: title and topics only, no lessons
   * written yet. They are shown so the journey ahead is visible, and are never
   * presented as playable.
   */
  status?: 'available' | 'planned';
}

export interface Stage {
  id: string;
  title: string;
  subtitle: string;
  /** e.g. "A0 → A1" */
  levelRange: string;
  from: CefrLevel;
  to: CefrLevel;
  units: Unit[];
}

// ---------------------------------------------------------------------------
// Conversations, stories, culture
// ---------------------------------------------------------------------------

export interface ConversationOption {
  es: string;
  en: string;
  /** False for grammatically possible but unnatural replies — teaches nuance. */
  natural: boolean;
  note?: string;
}

export interface ConversationTurn {
  speaker: 'partner' | 'you';
  /** Partner turns. */
  es?: string;
  en?: string;
  /** Your turns: what you're being asked to say. */
  instruction?: string;
  /** Accepted free-text answers (first is shown as the model answer). */
  accepted?: string[];
  /** Word hints offered in guided mode. */
  hints?: string[];
  /** Guided multiple-choice replies for lower levels. */
  options?: ConversationOption[];
  concepts?: string[];
  note?: string;
}

export interface ConversationScene {
  id: string;
  title: string;
  icon: UnitIcon;
  setting: string;
  level: CefrLevel;
  topics: TopicId[];
  partner: { name: string };
  turns: ConversationTurn[];
}

export interface ComprehensionQuestion {
  question: string;
  /** Question posed in Spanish once the learner is ready for it. */
  questionEs?: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface StoryLine {
  speaker?: string;
  es: string;
  en: string;
}

export interface StoryScene {
  lines: StoryLine[];
  question?: ComprehensionQuestion;
}

export interface Story {
  id: string;
  title: string;
  blurb: string;
  icon: UnitIcon;
  level: CefrLevel;
  topics: TopicId[];
  concepts: string[];
  scenes: StoryScene[];
}

export interface CultureNote {
  id: string;
  title: string;
  icon: UnitIcon;
  body: string;
  level: CefrLevel;
  topics: TopicId[];
}
