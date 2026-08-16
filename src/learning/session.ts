import {
  allLessons,
  conversations,
  getConcept,
  getGrammar,
  getLesson,
  getLessonSentences,
  getStageConcepts,
  getStory,
  isGrammarConcept,
  isVocabConcept,
  levelIndex,
  stories,
} from '@/content';
import type { Lesson } from '@/content/types';
import type { ChoiceExercise, Exercise } from '@/learning/exercise';
import {
  buildConversationTurn,
  buildCultureCard,
  buildGrammarCard,
  buildReading,
  generateForConcept,
  mulberry32,
  shuffle,
  type GenContext,
} from '@/learning/generator';
import { atRiskConcepts, dueConcepts, estimateLevel, skillBalance, weakAreas } from '@/learning/mastery';
import { mastery } from '@/learning/srs';
import { KIND_DIFFICULTY, type ExerciseKind, type LearnerState } from '@/learning/types';

/**
 * Session assembly.
 *
 * A lesson is not a fixed list of exercises — it is a set of concepts plus a
 * shape. This module decides the *order*: teach before test, easy before hard,
 * and never two of the same exercise type in a row. Reviews from earlier
 * lessons are interleaved into new material deliberately, because spacing and
 * interleaving are where the retention actually comes from.
 */

export type SessionKind =
  | 'lesson'
  | 'checkpoint'
  | 'smartReview'
  | 'quickPractice'
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'mistakes'
  | 'hardMode'
  | 'conversation'
  | 'story'
  | 'random'
  | 'concept'
  /** Weak and overdue concepts from one unit — the recommended unit revisit. */
  | 'unitSmart';

export interface SessionPlan {
  id: string;
  kind: SessionKind;
  /** Lesson id for lessons, or the practice mode id. */
  source: string;
  title: string;
  subtitle: string;
  exercises: Exercise[];
}

interface BuildOptions {
  learner: LearnerState;
  now?: number;
  seed?: number;
  /** Overrides the hard-mode setting for a one-off hard session. */
  forceHardMode?: boolean;
  /** Restrict practice to these concepts (weak-area drilling). */
  conceptIds?: string[];
  targetLength?: number;
}

function makeContext(options: BuildOptions): GenContext {
  const now = options.now ?? Date.now();
  return {
    settings: options.forceHardMode
      ? { ...options.learner.settings, hardMode: true }
      : options.learner.settings,
    now,
    rng: mulberry32(options.seed ?? Math.floor(Math.random() * 2 ** 31)),
    recentKinds: [],
    // Demonstrated ability, not curriculum position: the exercise mix should
    // follow what the learner can actually do.
    level: estimateLevel(options.learner, now),
    // …and ability is not one number. This lets the mix stay hard in the skills
    // the learner is ahead in without over-reaching in the ones they are not.
    skills: skillBalance(options.learner, now),
  };
}

/**
 * Reorders so that no two adjacent exercises share a kind or a lead concept.
 * Presentation cards keep their position — a teaching card must precede the
 * practice it sets up.
 */
function interleave(exercises: Exercise[]): Exercise[] {
  const out: Exercise[] = [];
  const remaining = [...exercises];

  while (remaining.length > 0) {
    const previous = out[out.length - 1];
    let index = remaining.findIndex((candidate) => {
      if (!previous) return true;
      if (candidate.form === 'presentation') return true;
      const sameKind = candidate.kind === previous.kind;
      const sameConcept = candidate.conceptIds[0] === previous.conceptIds[0];
      return !sameKind && !sameConcept;
    });
    if (index === -1) index = 0;
    out.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return out;
}

/** Inserts `items` at roughly even positions through `base`. */
function sprinkle(base: Exercise[], items: Exercise[]): Exercise[] {
  if (items.length === 0) return base;
  const out = [...base];
  const gap = Math.max(2, Math.floor(base.length / (items.length + 1)));
  items.forEach((item, i) => {
    const position = Math.min(out.length, gap * (i + 1) + i);
    out.splice(position, 0, item);
  });
  return out;
}

function generate(
  conceptIds: string[],
  learner: LearnerState,
  ctx: GenContext,
  limit: number,
): Exercise[] {
  const out: Exercise[] = [];
  for (const conceptId of conceptIds) {
    if (out.length >= limit) break;
    const exercise = generateForConcept(conceptId, learner.concepts[conceptId], ctx);
    if (!exercise) continue;
    out.push(exercise);
    ctx.recentKinds = [exercise.kind, ...(ctx.recentKinds ?? [])].slice(0, 3);
  }
  return out;
}

// --- Lessons ---------------------------------------------------------------

export function buildLessonSession(lessonId: string, options: BuildOptions): SessionPlan | null {
  const lesson = getLesson(lessonId);
  if (!lesson) return null;

  const ctx = makeContext(options);
  const { learner } = options;

  if (lesson.kind === 'conversation' && lesson.conversation) {
    return buildConversationSession(lesson.conversation, options, lesson);
  }
  if (lesson.kind === 'story' && lesson.story) {
    return buildStorySession(lesson.story, options, lesson);
  }
  if (lesson.kind === 'checkpoint' && lesson.checkpointFor) {
    return buildCheckpointSession(lesson, options);
  }

  const target = options.targetLength ?? clamp(Math.round(lesson.estMinutes * 1.8), 10, 20);
  const exercises: Exercise[] = [];

  // 1. Grammar cards for anything new, before it is tested.
  for (const grammarId of lesson.grammar ?? []) {
    if (learner.concepts[grammarId]?.introduced) continue;
    const card = buildGrammarCard(grammarId);
    if (card) exercises.push(card);
  }

  // 2. Each new word gets a teaching card followed immediately by a light check.
  const newConcepts = lesson.teaches.filter((id) => !learner.concepts[id]?.introduced);
  const knownConcepts = lesson.teaches.filter((id) => learner.concepts[id]?.introduced);

  for (const conceptId of newConcepts.slice(0, 8)) {
    const concept = getConcept(conceptId);
    if (!concept) continue;
    const card = generateForConcept(conceptId, undefined, ctx);
    if (card) exercises.push(card);
  }

  // 3. Practice: new concepts first (now "introduced"), then revision of the
  //    lesson's known concepts and its grammar.
  const introduced: LearnerState['concepts'] = { ...learner.concepts };
  for (const conceptId of newConcepts) {
    introduced[conceptId] = {
      ...(introduced[conceptId] ?? emptyState(conceptId, ctx.now)),
      introduced: true,
    };
  }
  const practiceLearner: LearnerState = { ...learner, concepts: introduced };

  // Concepts implied by the lesson's own sentences. Without these, a lesson
  // that only lists sentences (a listening or consolidation lesson, which
  // teaches nothing new) would generate no exercises at all.
  const declared = new Set([...newConcepts, ...knownConcepts, ...(lesson.grammar ?? [])]);
  const fromSentences = [
    ...new Set(getLessonSentences(lesson).flatMap((sentence) => sentence.concepts)),
  ].filter((id) => !declared.has(id));

  // The repeated `newConcepts` is deliberate: each new concept is practised
  // once early and again later, and the generator picks a different exercise
  // kind the second time because the first is now in `recentKinds`.
  const practicePool = [
    ...newConcepts,
    ...knownConcepts,
    ...(lesson.grammar ?? []),
    ...fromSentences,
    ...newConcepts,
  ];

  const practice = generate(practicePool, practiceLearner, ctx, target - exercises.length);
  exercises.push(...interleave(practice));

  // 4. Interleave a couple of reviews from earlier lessons — spacing matters
  //    more than keeping a lesson "pure".
  const reviewIds = dueConcepts(learner, ctx.now)
    .filter((state) => !lesson.teaches.includes(state.id))
    .slice(0, 3)
    .map((state) => state.id);
  const reviews = generate(reviewIds, learner, ctx, 3);

  // 5. Culture note, placed mid-session as a breather.
  const cultureCards = (lesson.culture ?? [])
    .map(buildCultureCard)
    .filter((card): card is Exercise => card !== null)
    .slice(0, 1);

  const withReviews = sprinkle(exercises, reviews);
  const final = sprinkle(withReviews, cultureCards);

  return {
    id: `lesson:${lesson.id}:${ctx.now}`,
    kind: 'lesson',
    source: lesson.id,
    title: lesson.title,
    subtitle: lesson.goal,
    exercises: final.slice(0, target + reviews.length + cultureCards.length),
  };
}

/**
 * A checkpoint tests the whole stage, not one lesson: no teaching cards, a
 * deliberate spread across vocabulary, grammar, listening and production, and
 * the weakest concepts first so the result actually diagnoses something.
 */
function buildCheckpointSession(lesson: Lesson, options: BuildOptions): SessionPlan | null {
  const ctx = makeContext(options);
  const { learner } = options;
  const now = ctx.now;

  const stageConcepts = getStageConcepts(lesson.checkpointFor!);
  const met = stageConcepts.filter((id) => learner.concepts[id]?.introduced);
  // A checkpoint reached normally tests what you have met. Opened early — or
  // replayed after a reset — it falls back to the whole stage rather than
  // producing an empty session.
  const pool = (met.length >= 4 ? met : stageConcepts).slice().sort(byWeakness(learner, now));

  // Weakest half first, then a shuffled spread of the rest, so a checkpoint
  // both probes the shaky areas and samples broadly.
  const half = Math.ceil(pool.length / 2);
  const ordered = dedupe([
    ...pool.slice(0, Math.min(half, 10)),
    ...shuffle(pool.slice(half), ctx.rng),
    ...pool,
  ]);

  const target = options.targetLength ?? 18;
  const exercises = interleave(generate(ordered, learner, ctx, target));

  const reading = buildReading(ctx, levelIndex(estimateLevel(learner, now)));
  if (reading && exercises.length > 6) {
    exercises.splice(Math.floor(exercises.length / 2), 0, reading);
  }

  return {
    id: `checkpoint:${lesson.id}:${now}`,
    kind: 'checkpoint',
    source: lesson.id,
    title: lesson.title,
    subtitle: lesson.goal,
    exercises,
  };
}

function buildConversationSession(
  sceneId: string,
  options: BuildOptions,
  lesson?: Lesson,
): SessionPlan | null {
  const scene = conversations.find((s) => s.id === sceneId);
  if (!scene) return null;

  const ctx = makeContext(options);
  const { learner } = options;

  // Guided until the underlying concepts are solid, then free production.
  const relevant = scene.turns.flatMap((turn) => turn.concepts ?? []);
  const averageMastery =
    relevant.length > 0
      ? relevant.reduce((sum, id) => {
          const state = learner.concepts[id];
          return sum + (state ? mastery(state, ctx.now) : 0);
        }, 0) / relevant.length
      : 0;
  const guided = !learner.settings.hardMode && averageMastery < 0.6;

  const exercises: Exercise[] = [];
  scene.turns.forEach((turn, index) => {
    if (turn.speaker !== 'you') return;
    const exercise = buildConversationTurn(scene.id, index, guided, ctx);
    if (exercise) exercises.push(exercise);
  });

  return {
    id: `conversation:${scene.id}:${ctx.now}`,
    kind: 'conversation',
    source: lesson?.id ?? scene.id,
    title: lesson?.title ?? scene.title,
    subtitle: scene.setting,
    exercises,
  };
}

function buildStorySession(storyId: string, options: BuildOptions, lesson?: Lesson): SessionPlan | null {
  const story = getStory(storyId);
  if (!story) return null;

  const ctx = makeContext(options);
  const exercises: Exercise[] = [];

  story.scenes.forEach((scene, index) => {
    if (!scene.question) return;
    const question = scene.question;
    const options_ = shuffle(
      question.options.map((text) => ({ text })),
      ctx.rng,
    );
    const answerIndex = options_.findIndex((o) => o.text === question.options[question.answer]);

    const exercise: ChoiceExercise = {
      id: `story-${story.id}-${index}`,
      kind: 'reading',
      form: 'choice',
      conceptIds: story.concepts,
      difficulty: KIND_DIFFICULTY.reading,
      xp: 3,
      instruction: story.title,
      prompt: question.questionEs ?? question.question,
      promptSub: question.questionEs ? question.question : undefined,
      passage: scene.lines.map((line) => ({ speaker: line.speaker, text: line.es })),
      options: options_,
      answerIndex,
      note: question.explanation,
    };
    exercises.push(exercise);
  });

  return {
    id: `story:${story.id}:${ctx.now}`,
    kind: 'story',
    source: lesson?.id ?? story.id,
    title: story.title,
    subtitle: story.blurb,
    exercises,
  };
}

// --- Practice modes ---------------------------------------------------------

/**
 * Smart Review: the single best session the app can build right now.
 * Priorities, in order: things about to be forgotten, recent unresolved
 * mistakes, weak grammar, and freshly introduced material that has not settled.
 */
export function buildSmartReview(options: BuildOptions): SessionPlan {
  const ctx = makeContext(options);
  const { learner } = options;
  const target = options.targetLength ?? 14;

  const due = dueConcepts(learner, ctx.now).map((s) => s.id);
  const mistakeIds = learner.mistakes
    .filter((m) => !m.resolvedAt)
    .slice(-20)
    .flatMap((m) => m.conceptIds);
  const weak = weakAreas(learner, ctx.now, 4).flatMap((area) => area.conceptIds.slice(0, 3));
  const atRisk = atRiskConcepts(learner, ctx.now, 10).map((s) => s.id);
  const fresh = Object.values(learner.concepts)
    .filter((s) => s.timesSeen > 0 && s.timesSeen < 3)
    .map((s) => s.id);

  const ordered = dedupe([...mistakeIds, ...due, ...weak, ...atRisk, ...fresh]);
  const exercises = interleave(generate(ordered, learner, ctx, target));

  return {
    id: `smart-review:${ctx.now}`,
    kind: 'smartReview',
    source: 'smart-review',
    title: 'Smart Review',
    subtitle: 'Built from what you are closest to forgetting',
    exercises,
  };
}

export function buildPracticeSession(kind: SessionKind, options: BuildOptions): SessionPlan {
  const ctx = makeContext(options);
  const { learner } = options;
  const now = ctx.now;

  const seenIds = Object.values(learner.concepts)
    .filter((state) => state.timesSeen > 0)
    .map((state) => state.id);

  const byKind = (predicate: (id: string) => boolean) => seenIds.filter(predicate);

  let ids: string[] = [];
  let title = 'Practice';
  let subtitle = '';
  let target = options.targetLength ?? 12;

  switch (kind) {
    case 'quickPractice':
      target = options.targetLength ?? 6;
      title = 'Quick Practice';
      subtitle = 'About three minutes';
      ids = dedupe([
        ...dueConcepts(learner, now).slice(0, 6).map((s) => s.id),
        ...shuffle(seenIds, ctx.rng),
      ]);
      break;

    case 'vocabulary':
      title = 'Vocabulary review';
      subtitle = 'Words you have met, ranked by how shaky they are';
      ids = byKind((id) => {
        const concept = getConcept(id);
        return !!concept && isVocabConcept(concept);
      }).sort(byWeakness(learner, now));
      break;

    case 'grammar':
      title = 'Grammar review';
      subtitle = 'The rules you are least sure of';
      ids = byKind((id) => {
        const concept = getConcept(id);
        return !!concept && (isGrammarConcept(concept) || concept.kind === 'verbform');
      }).sort(byWeakness(learner, now));
      break;

    case 'listening':
      title = 'Listening practice';
      subtitle = 'Spain Spanish, spoken';
      ids = shuffle(seenIds, ctx.rng);
      break;

    case 'mistakes': {
      title = 'Your mistakes';
      subtitle = 'The ones you have not fixed yet';
      ids = dedupe(learner.mistakes.filter((m) => !m.resolvedAt).flatMap((m) => m.conceptIds));
      break;
    }

    case 'hardMode':
      title = 'Hard mode';
      subtitle = 'No word banks, no hints — produce it yourself';
      ids = seenIds.sort(byWeakness(learner, now));
      break;

    case 'concept':
      title = 'Focused practice';
      subtitle = 'Drilling one area';
      ids = (options.conceptIds ?? []).slice().sort(byWeakness(learner, now));
      break;

    case 'unitSmart': {
      title = 'Unit review';
      subtitle = 'Weak and overdue concepts from this unit';
      const pool = options.conceptIds ?? [];
      const shaky = pool.filter((id) => {
        const state = learner.concepts[id];
        if (!state || state.timesSeen === 0) return false;
        return state.dueAt <= now || mastery(state, now) < 0.78;
      });
      // If nothing is actually shaky, fall back to the whole unit rather than
      // handing back an empty session.
      ids = (shaky.length > 0 ? shaky : pool.filter((id) => learner.concepts[id])).sort(
        byWeakness(learner, now),
      );
      break;
    }

    case 'random':
    default:
      title = 'Random challenge';
      subtitle = 'Anything you have learned, in any form';
      ids = shuffle(seenIds, ctx.rng);
      break;
  }

  if (options.conceptIds && kind !== 'concept') {
    ids = options.conceptIds.filter((id) => ids.includes(id));
  }

  let exercises: Exercise[];

  if (kind === 'listening') {
    exercises = buildListeningExercises(ids, learner, ctx, target);
  } else {
    exercises = generate(ids, learner, ctx, target);
  }

  // Reading and story comprehension add welcome variety to longer sessions.
  if ((kind === 'random' || kind === 'smartReview') && exercises.length >= 6) {
    const reading = buildReading(ctx, levelIndex(estimateLevel(learner, now)));
    if (reading) exercises.splice(Math.floor(exercises.length / 2), 0, reading);
  }

  return {
    id: `${kind}:${now}`,
    kind,
    source: kind,
    title,
    subtitle,
    exercises: interleave(exercises),
  };
}

/** Listening sessions force audio-first kinds regardless of concept depth. */
function buildListeningExercises(
  ids: string[],
  learner: LearnerState,
  ctx: GenContext,
  target: number,
): Exercise[] {
  const listeningKinds: ExerciseKind[] = ['listenSelect', 'listenComprehend', 'dictation'];
  const out: Exercise[] = [];

  for (const conceptId of ids) {
    if (out.length >= target) break;
    // Bias the generator towards audio by pretending the other kinds are recent.
    const listeningCtx: GenContext = {
      ...ctx,
      recentKinds: (['multipleChoice', 'wordBank', 'translateToEn'] as ExerciseKind[]).concat(
        ctx.recentKinds ?? [],
      ),
    };
    const exercise = generateForConcept(conceptId, learner.concepts[conceptId], listeningCtx);
    if (exercise && listeningKinds.includes(exercise.kind)) out.push(exercise);
    else if (exercise && out.length + 4 < target) out.push(exercise);
  }
  return out;
}

function byWeakness(learner: LearnerState, now: number) {
  return (a: string, b: string) => {
    const stateA = learner.concepts[a];
    const stateB = learner.concepts[b];
    const masteryA = stateA ? mastery(stateA, now) : 0;
    const masteryB = stateB ? mastery(stateB, now) : 0;
    return masteryA - masteryB;
  };
}

// --- Session router --------------------------------------------------------

export function buildSession(
  kind: SessionKind,
  source: string,
  options: BuildOptions,
): SessionPlan | null {
  switch (kind) {
    case 'lesson':
    case 'checkpoint':
      return buildLessonSession(source, options);
    case 'smartReview':
      return buildSmartReview(options);
    case 'conversation':
      return buildConversationSession(source, options);
    case 'story':
      return buildStorySession(source, options);
    case 'hardMode':
      return buildPracticeSession('hardMode', { ...options, forceHardMode: true });
    default:
      return buildPracticeSession(kind, options);
  }
}

// --- Progression ------------------------------------------------------------

export function isLessonUnlocked(lesson: Lesson, learner: LearnerState): boolean {
  if (!lesson.requires || lesson.requires.length === 0) return true;
  return lesson.requires.every((id) => !!learner.completedLessons[id]);
}

export function isLessonComplete(lessonId: string, learner: LearnerState): boolean {
  return !!learner.completedLessons[lessonId];
}

/**
 * The lesson the home screen offers. Prefers the first incomplete unlocked
 * lesson; if a placement test set a starting point, everything before it counts
 * as already available.
 */
export function nextLesson(learner: LearnerState): Lesson | null {
  for (const lesson of allLessons) {
    if (learner.completedLessons[lesson.id]) continue;
    if (isLessonUnlocked(lesson, learner)) return lesson;
  }
  return null;
}

/** Stories unlocked by progress, for the Library. */
export function unlockedStories(learner: LearnerState) {
  const level = levelIndex(estimateLevel(learner));
  return stories.filter((story) => levelIndex(story.level) <= level + 1);
}

// --- helpers ---------------------------------------------------------------

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)];
}


function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function emptyState(id: string, now: number) {
  return {
    id,
    firstSeen: now,
    lastReviewed: now,
    timesSeen: 0,
    correct: 0,
    incorrect: 0,
    lapses: 0,
    streak: 0,
    strength: 0,
    stability: 0.4,
    ease: 2,
    dueAt: now,
    depth: 1 as const,
    kinds: [],
    introduced: false,
  };
}

/** Grammar concept ids the learner has met, for the Library. */
export function metGrammar(learner: LearnerState): string[] {
  return Object.values(learner.concepts)
    .filter((state) => state.introduced && getGrammar(state.id))
    .map((state) => state.id);
}
