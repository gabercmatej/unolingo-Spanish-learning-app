import { conversations } from '@/content/conversations';
import { cultureNotes } from '@/content/culture';
import { curriculum } from '@/content/curriculum';
import { a1CoreGrammar } from '@/content/grammar/a1-core';
import { a2CoreGrammar } from '@/content/grammar/a2-core';
import { b1CoreGrammar } from '@/content/grammar/b1-core';
import { b2CoreGrammar } from '@/content/grammar/b2-core';
import { c1CoreGrammar } from '@/content/grammar/c1-core';
import { c2CoreGrammar } from '@/content/grammar/c2-core';
import { expansionGrammar } from '@/content/grammar/expansion';
import { beyondGrammar } from '@/content/grammar/beyond';
import { foundationsGrammar } from '@/content/grammar/foundations';
import { a1CoreSentences } from '@/content/sentences/a1-core';
import { a1EverydayLifeSentences } from '@/content/sentences/a1-everyday-life';
import { a2CoreSentences } from '@/content/sentences/a2-core';
import { b1CoreSentences } from '@/content/sentences/b1-core';
import { b2CoreSentences } from '@/content/sentences/b2-core';
import { c1CoreSentences } from '@/content/sentences/c1-core';
import { c2CoreSentences } from '@/content/sentences/c2-core';
import { aroundSpainSentences } from '@/content/sentences/around-spain';
import { everydaySentences } from '@/content/sentences/everyday';
import { foundationsSentences } from '@/content/sentences/foundations';
import { routineSentences } from '@/content/sentences/routine';
import { socialSentences } from '@/content/sentences/social';
import { advancedExpansionSentences } from '@/content/sentences/advanced-expansion';
import { cityAndStanceSentences } from '@/content/sentences/city-and-stance';
import { imperativeSentences } from '@/content/sentences/imperatives';
import { verbDepthSentences } from '@/content/sentences/verb-depth';
import { verbWorkshopSentences } from '@/content/sentences/verb-workshop';
import { verbWorkshopMoodSentences } from '@/content/sentences/verb-workshop-moods';
import { subjunctiveImperativeSentences } from '@/content/sentences/subjunctive-imperative';
import { a1CoreVocab } from '@/content/vocab/a1-core';
import { a1EverydayVocab } from '@/content/vocab/a1-everyday-life';
import { a2b2ExpansionVocab } from '@/content/vocab/a2b2-expansion';
import { advancedExpansionVocab } from '@/content/vocab/advanced-expansion';
import { a2CoreVocab } from '@/content/vocab/a2-core';
import { b1CoreVocab } from '@/content/vocab/b1-core';
import { b2CoreVocab } from '@/content/vocab/b2-core';
import { c1CoreVocab } from '@/content/vocab/c1-core';
import { c2CoreVocab } from '@/content/vocab/c2-core';
import { aroundSpainVocab } from '@/content/vocab/around-spain';
import { everydayVocab } from '@/content/vocab/everyday';
import { foundationsVocab } from '@/content/vocab/foundations';
import { routineVocab } from '@/content/vocab/routine';
import { socialVocab } from '@/content/vocab/social';
import { verbs } from '@/content/verbs';
import {
  CEFR_LEVELS,
  TENSE_LABELS,
  type CefrLevel,
  type Concept,
  type ConversationScene,
  type CultureNote,
  type GrammarConcept,
  type Lesson,
  type Sentence,
  type Stage,
  type Unit,
  type Verb,
  type VerbFormConcept,
  type VocabConcept,
} from '@/content/types';
import { stories } from '@/content/stories';
import { errorDrills, naturalDrills } from '@/content/drills';

/**
 * The content registry.
 *
 * Everything downstream — the exercise generator, the Library, search, the
 * learner model — reads from here rather than importing content files directly.
 * That keeps "add a lesson" to a single edit in one data file.
 */

export const vocabConcepts: VocabConcept[] = [
  ...foundationsVocab,
  ...a1CoreVocab,
  ...a1EverydayVocab,
  ...a2b2ExpansionVocab,
  ...advancedExpansionVocab,
  ...a2CoreVocab,
  ...b1CoreVocab,
  ...b2CoreVocab,
  ...c1CoreVocab,
  ...c2CoreVocab,
  ...everydayVocab,
  ...routineVocab,
  ...socialVocab,
  ...aroundSpainVocab,
];

export const grammarConcepts: GrammarConcept[] = [
  ...foundationsGrammar,
  ...a1CoreGrammar,
  ...a2CoreGrammar,
  ...b1CoreGrammar,
  ...b2CoreGrammar,
  ...c1CoreGrammar,
  ...c2CoreGrammar,
  ...beyondGrammar,
  ...expansionGrammar,
];

/**
 * Verb paradigms become trackable concepts automatically, so authoring a verb
 * also creates its conjugation practice targets.
 */
export const verbFormConcepts: VerbFormConcept[] = verbs.flatMap((verb) =>
  (Object.keys(verb.tenses) as (keyof typeof verb.tenses)[]).map((tense) => ({
    id: verbFormConceptId(verb.id, tense),
    kind: 'verbform' as const,
    level: verb.level,
    topics: [],
    verbId: verb.id,
    tense,
    label: `${verb.infinitive} — ${TENSE_LABELS[tense].toLowerCase()}`,
  })),
);

export function verbFormConceptId(verbId: string, tense: string): string {
  return `f.${verbId}.${tense}`;
}

export const allConcepts: Concept[] = [...vocabConcepts, ...grammarConcepts, ...verbFormConcepts];

export const sentences: Sentence[] = [
  ...foundationsSentences,
  ...a1CoreSentences,
  ...a1EverydayLifeSentences,
  ...a2CoreSentences,
  ...b1CoreSentences,
  ...b2CoreSentences,
  ...c1CoreSentences,
  ...c2CoreSentences,
  ...everydaySentences,
  ...routineSentences,
  ...socialSentences,
  ...aroundSpainSentences,
  ...subjunctiveImperativeSentences,
  ...verbWorkshopSentences,
  ...verbWorkshopMoodSentences,
  ...verbDepthSentences,
  ...imperativeSentences,
  ...cityAndStanceSentences,
  ...advancedExpansionSentences,
];

export { conversations, cultureNotes, curriculum, stories, verbs };

// --- Lookup maps -----------------------------------------------------------

const conceptById = new Map(allConcepts.map((c) => [c.id, c]));
const sentenceById = new Map(sentences.map((s) => [s.id, s]));
const verbById = new Map(verbs.map((v) => [v.id, v]));
const grammarById = new Map(grammarConcepts.map((g) => [g.id, g]));
const conversationById = new Map(conversations.map((c) => [c.id, c]));
const storyById = new Map(stories.map((s) => [s.id, s]));
const cultureById = new Map(cultureNotes.map((c) => [c.id, c]));

/** Every lesson in curriculum order — the canonical progression. */
export const allLessons: Lesson[] = curriculum.flatMap((stage) =>
  stage.units.flatMap((unit) => unit.lessons),
);

const lessonById = new Map(allLessons.map((l) => [l.id, l]));
const lessonIndex = new Map(allLessons.map((l, i) => [l.id, i]));

const unitByLessonId = new Map<string, Unit>();
const stageByLessonId = new Map<string, Stage>();
const unitById = new Map<string, Unit>();
const stageById = new Map<string, Stage>();
const stageByUnitId = new Map<string, Stage>();

for (const stage of curriculum) {
  stageById.set(stage.id, stage);
  for (const unit of stage.units) {
    unitById.set(unit.id, unit);
    stageByUnitId.set(unit.id, stage);
    for (const lesson of unit.lessons) {
      unitByLessonId.set(lesson.id, unit);
      stageByLessonId.set(lesson.id, stage);
    }
  }
}

/** Units that actually have lessons — everything the learner can play. */
export const allUnits: Unit[] = curriculum.flatMap((stage) => stage.units);
export const playableUnits: Unit[] = allUnits.filter((unit) => unit.lessons.length > 0);

/** conceptId → sentences that exercise it. Built once; drives generation. */
const sentencesByConcept = new Map<string, Sentence[]>();
for (const sentence of sentences) {
  for (const conceptId of sentence.concepts) {
    const list = sentencesByConcept.get(conceptId);
    if (list) list.push(sentence);
    else sentencesByConcept.set(conceptId, [sentence]);
  }
}

/** conceptId → the first lesson that teaches it. */
const introducingLesson = new Map<string, string>();
for (const lesson of allLessons) {
  for (const conceptId of lesson.teaches) {
    if (!introducingLesson.has(conceptId)) introducingLesson.set(conceptId, lesson.id);
  }
  for (const grammarId of lesson.grammar ?? []) {
    if (!introducingLesson.has(grammarId)) introducingLesson.set(grammarId, lesson.id);
  }
}

// --- Accessors -------------------------------------------------------------

export const getConcept = (id: string): Concept | undefined => conceptById.get(id);
export const getSentence = (id: string): Sentence | undefined => sentenceById.get(id);
export const getVerb = (id: string): Verb | undefined => verbById.get(id);
export const getGrammar = (id: string): GrammarConcept | undefined => grammarById.get(id);
export const getLesson = (id: string): Lesson | undefined => lessonById.get(id);
export const getConversation = (id: string): ConversationScene | undefined => conversationById.get(id);
export const getStory = (id: string) => storyById.get(id);
export const getCultureNote = (id: string): CultureNote | undefined => cultureById.get(id);
export const getUnitForLesson = (lessonId: string): Unit | undefined => unitByLessonId.get(lessonId);
export const getStageForLesson = (lessonId: string): Stage | undefined => stageByLessonId.get(lessonId);
export const getUnit = (unitId: string): Unit | undefined => unitById.get(unitId);
export const getStage = (stageId: string): Stage | undefined => stageById.get(stageId);
export const getStageForUnit = (unitId: string): Stage | undefined => stageByUnitId.get(unitId);

/**
 * Concepts a unit actually *claims to teach* — its lessons' `teaches` and
 * `grammar`, and nothing else.
 *
 * Distinct from `getUnitConcepts`, which also sweeps in every concept appearing
 * in the unit's sentences. That wider set is right for building practice from a
 * unit and wrong for asking "what has this unit still not shown me?": the first
 * greetings unit's sentences mention `v.ver` and `v.cafe`, which it does not
 * teach and which arrive properly forty lessons later. Counting those as unmet
 * material would leave the unit reporting itself unfinished for ever.
 */
export function getUnitTaughtConcepts(unit: Unit): string[] {
  const ids = new Set<string>();
  for (const lesson of unit.lessons) {
    for (const id of lesson.teaches) ids.add(id);
    for (const id of lesson.grammar ?? []) ids.add(id);
  }
  return [...ids];
}

/** Every concept a unit teaches or revises, for unit mastery and unit practice. */
export function getUnitConcepts(unit: Unit): string[] {
  const ids = new Set<string>();
  for (const lesson of unit.lessons) {
    for (const id of lesson.teaches) ids.add(id);
    for (const id of lesson.grammar ?? []) ids.add(id);
    for (const sentenceId of lesson.sentences) {
      const sentence = sentenceById.get(sentenceId);
      for (const id of sentence?.concepts ?? []) ids.add(id);
    }
  }
  return [...ids];
}

/** Every concept taught anywhere in a stage — the pool a checkpoint draws on. */
export function getStageConcepts(stageId: string): string[] {
  const stage = stageById.get(stageId);
  if (!stage) return [];
  const ids = new Set<string>();
  for (const unit of stage.units) {
    for (const id of getUnitConcepts(unit)) ids.add(id);
  }
  return [...ids];
}
export const getLessonIndex = (lessonId: string): number => lessonIndex.get(lessonId) ?? -1;
export const getLessonThatIntroduces = (conceptId: string): string | undefined =>
  introducingLesson.get(conceptId);

// --- Teaching order --------------------------------------------------------

/**
 * Where a concept sits in the course, as the index of the lesson that first
 * teaches it.
 *
 * The Library is a revision tool, not a dictionary: grammar and verbs listed in
 * file order or alphabetically leave the learner hunting for the thing they
 * covered last week. Sorting by the path they actually walked means "scroll to
 * where I am" always works. Anything never taught explicitly sorts to the end.
 */
const UNTAUGHT = Number.MAX_SAFE_INTEGER;

export function teachingOrder(conceptId: string): number {
  const lessonId = introducingLesson.get(conceptId);
  if (!lessonId) return UNTAUGHT;
  return lessonIndex.get(lessonId) ?? UNTAUGHT;
}

/**
 * A verb has no lesson of its own — it is reached through its conjugation
 * concepts and through the vocabulary entry that points at it, so its position
 * is the earliest of those.
 */
const verbOrder = new Map<string, number>();
for (const verb of verbs) {
  let earliest = UNTAUGHT;
  for (const concept of verbFormConcepts) {
    if (concept.verbId === verb.id) earliest = Math.min(earliest, teachingOrder(concept.id));
  }
  for (const concept of vocabConcepts) {
    if (concept.verbId === verb.id) earliest = Math.min(earliest, teachingOrder(concept.id));
  }
  verbOrder.set(verb.id, earliest);
}

export const verbTeachingOrder = (verbId: string): number => verbOrder.get(verbId) ?? UNTAUGHT;

// --- Where a concept was taught -------------------------------------------

/**
 * The lesson, unit and stage that first teach a concept.
 *
 * One lookup, shared by everything that needs to say *where* something was
 * learned: the Library's section/unit grouping, and a completed unit's study
 * sheet. Both questions are "which part of the course owns this?", and
 * answering them separately is how two screens come to disagree about the same
 * word.
 *
 * `undefined` for a concept no lesson teaches — a derived verb paradigm that
 * was never assigned, say. That is a real state the audit reports on, so it is
 * represented rather than papered over.
 */
export interface ConceptOrigin {
  lesson: Lesson;
  unit: Unit;
  stage: Stage;
}

const originByConcept = new Map<string, ConceptOrigin>();
for (const [conceptId, lessonId] of introducingLesson) {
  const lesson = lessonById.get(lessonId);
  const unit = unitByLessonId.get(lessonId);
  const stage = stageByLessonId.get(lessonId);
  if (lesson && unit && stage) originByConcept.set(conceptId, { lesson, unit, stage });
}

export const conceptOrigin = (conceptId: string): ConceptOrigin | undefined =>
  originByConcept.get(conceptId);

/**
 * The earliest unit that reaches a verb, through any of its paradigms or its
 * vocabulary entry — the same rule `verbTeachingOrder` uses, so the Library's
 * verb grouping and its verb ordering cannot drift apart.
 */
const verbOriginById = new Map<string, ConceptOrigin>();
for (const verb of verbs) {
  let best: ConceptOrigin | undefined;
  let bestOrder = UNTAUGHT;
  const candidates = [
    ...verbFormConcepts.filter((concept) => concept.verbId === verb.id).map((c) => c.id),
    ...vocabConcepts.filter((concept) => concept.verbId === verb.id).map((c) => c.id),
  ];
  for (const id of candidates) {
    const order = teachingOrder(id);
    if (order < bestOrder) {
      const origin = originByConcept.get(id);
      if (origin) {
        bestOrder = order;
        best = origin;
      }
    }
  }
  if (best) verbOriginById.set(verb.id, best);
}

export const verbOrigin = (verbId: string): ConceptOrigin | undefined =>
  verbOriginById.get(verbId);

/** Comparator for concepts: course order first, then level, then alphabetical. */
export function byTeachingOrder(
  a: { id: string; level: CefrLevel },
  b: { id: string; level: CefrLevel },
): number {
  const order = teachingOrder(a.id) - teachingOrder(b.id);
  if (order !== 0) return order;
  const level = levelIndex(a.level) - levelIndex(b.level);
  if (level !== 0) return level;
  return a.id.localeCompare(b.id, 'es');
}

/** Comparator for verbs, on the same principle. */
export function byVerbTeachingOrder(a: Verb, b: Verb): number {
  const order = verbTeachingOrder(a.id) - verbTeachingOrder(b.id);
  if (order !== 0) return order;
  const level = levelIndex(a.level) - levelIndex(b.level);
  if (level !== 0) return level;
  return a.infinitive.localeCompare(b.infinitive, 'es');
}

export function getSentencesForConcept(conceptId: string): Sentence[] {
  return sentencesByConcept.get(conceptId) ?? [];
}

/** Sentences a lesson may draw on, de-duplicated and resolved. */
export function getLessonSentences(lesson: Lesson): Sentence[] {
  const seen = new Set<string>();
  const out: Sentence[] = [];
  for (const id of lesson.sentences) {
    const sentence = sentenceById.get(id);
    if (sentence && !seen.has(id)) {
      seen.add(id);
      out.push(sentence);
    }
  }
  return out;
}

/** All concepts a lesson touches: what it teaches plus what its grammar covers. */
export function getLessonConcepts(lesson: Lesson): string[] {
  return [...new Set([...lesson.teaches, ...(lesson.grammar ?? [])])];
}

export function isVocabConcept(concept: Concept): concept is VocabConcept {
  return concept.kind === 'vocab' || concept.kind === 'phrase';
}

export function isGrammarConcept(concept: Concept): concept is GrammarConcept {
  return concept.kind === 'grammar';
}

export function isVerbFormConcept(concept: Concept): concept is VerbFormConcept {
  return concept.kind === 'verbform';
}

/** Display label for any concept, used in results and the mistake notebook. */
export function conceptLabel(concept: Concept): string {
  if (isVocabConcept(concept)) return concept.es;
  if (isGrammarConcept(concept)) return concept.title;
  return concept.label;
}

export function levelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

export function levelAtMost(level: CefrLevel, ceiling: CefrLevel): boolean {
  return levelIndex(level) <= levelIndex(ceiling);
}

// --- Development-time integrity check --------------------------------------

/**
 * Content is hand-authored, so a mistyped concept id is the most likely bug in
 * the whole app. This surfaces those immediately in dev instead of silently
 * producing an exercise with no answer.
 */
export function validateContent(): string[] {
  const problems: string[] = [];
  const known = new Set(allConcepts.map((c) => c.id));

  const seenConceptIds = new Set<string>();
  for (const concept of allConcepts) {
    if (seenConceptIds.has(concept.id)) problems.push(`Duplicate concept id: ${concept.id}`);
    seenConceptIds.add(concept.id);
  }

  for (const sentence of sentences) {
    for (const conceptId of sentence.concepts) {
      if (!known.has(conceptId)) {
        problems.push(`Sentence ${sentence.id} references unknown concept "${conceptId}"`);
      }
    }
    for (const blank of sentence.blanks ?? []) {
      if (!sentence.es.includes(blank)) {
        problems.push(`Sentence ${sentence.id} blank "${blank}" is not present in its text`);
      }
    }
  }

  for (const vocab of vocabConcepts) {
    if (vocab.verbId && !verbById.has(vocab.verbId)) {
      problems.push(`Vocab ${vocab.id} references unknown verb "${vocab.verbId}"`);
    }
    for (const other of vocab.confusableWith ?? []) {
      if (!known.has(other)) problems.push(`Vocab ${vocab.id} confusableWith unknown "${other}"`);
    }
  }

  for (const lesson of allLessons) {
    for (const conceptId of [...lesson.teaches, ...(lesson.grammar ?? [])]) {
      if (!known.has(conceptId)) {
        problems.push(`Lesson ${lesson.id} teaches unknown concept "${conceptId}"`);
      }
    }
    for (const sentenceId of lesson.sentences) {
      if (!sentenceById.has(sentenceId)) {
        problems.push(`Lesson ${lesson.id} references unknown sentence "${sentenceId}"`);
      }
    }
    for (const requirement of lesson.requires ?? []) {
      if (!lessonById.has(requirement)) {
        problems.push(`Lesson ${lesson.id} requires unknown lesson "${requirement}"`);
      }
    }
    for (const cultureId of lesson.culture ?? []) {
      if (!cultureById.has(cultureId)) {
        problems.push(`Lesson ${lesson.id} references unknown culture note "${cultureId}"`);
      }
    }
    if (lesson.conversation && !conversationById.has(lesson.conversation)) {
      problems.push(`Lesson ${lesson.id} references unknown conversation "${lesson.conversation}"`);
    }
    if (lesson.story && !storyById.has(lesson.story)) {
      problems.push(`Lesson ${lesson.id} references unknown story "${lesson.story}"`);
    }
    if (lesson.kind === 'conversation' && !lesson.conversation) {
      problems.push(`Lesson ${lesson.id} is a conversation lesson but has no conversation`);
    }
    if (lesson.kind === 'story' && !lesson.story) {
      problems.push(`Lesson ${lesson.id} is a story lesson but has no story`);
    }
    // Every lesson must be able to produce exercises from something.
    if (lesson.sentences.length === 0 && !lesson.conversation && !lesson.story) {
      problems.push(`Lesson ${lesson.id} has no sentences, conversation or story to draw on`);
    }
  }

  for (const scene of conversations) {
    for (const turn of scene.turns) {
      if (turn.speaker === 'you' && (!turn.accepted || turn.accepted.length === 0)) {
        problems.push(`Conversation ${scene.id} has a "you" turn with no accepted answers`);
      }
      for (const conceptId of turn.concepts ?? []) {
        if (!known.has(conceptId)) {
          problems.push(`Conversation ${scene.id} references unknown concept "${conceptId}"`);
        }
      }
    }
  }

  /**
   * Drills are keyed to concepts by id and reached only through a `some()`
   * filter, so a mistyped id does not throw — it silently makes the drill
   * unreachable and quietly removes `correctMistake` / `chooseNatural` from
   * that concept's exercise mix. Nothing else would ever surface that.
   */
  for (const drill of errorDrills) {
    if (drill.concepts.length === 0) problems.push(`Error drill ${drill.id} is keyed to no concept`);
    for (const conceptId of drill.concepts) {
      if (!known.has(conceptId)) {
        problems.push(`Error drill ${drill.id} references unknown concept "${conceptId}"`);
      }
    }
  }
  for (const drill of naturalDrills) {
    if (drill.concepts.length === 0) {
      problems.push(`Natural drill ${drill.id} is keyed to no concept`);
    }
    for (const conceptId of drill.concepts) {
      if (!known.has(conceptId)) {
        problems.push(`Natural drill ${drill.id} references unknown concept "${conceptId}"`);
      }
    }
  }

  for (const story of stories) {
    for (const conceptId of story.concepts) {
      if (!known.has(conceptId)) {
        problems.push(`Story ${story.id} references unknown concept "${conceptId}"`);
      }
    }
    for (const scene of story.scenes) {
      if (scene.question && (scene.question.answer < 0 || scene.question.answer >= scene.question.options.length)) {
        problems.push(`Story ${story.id} has a question with an out-of-range answer index`);
      }
    }
  }

  return problems;
}
