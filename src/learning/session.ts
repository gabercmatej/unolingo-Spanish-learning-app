import {
  allLessons,
  conversations,
  getGrammar,
  getLesson,
  getLessonSentences,
  getStageConcepts,
  getUnit,
  getUnitTaughtConcepts,
  getStory,
  levelIndex,
  stories,
} from '@/content';
import type { CefrLevel, Lesson } from '@/content/types';
import type { ChoiceExercise, Exercise } from '@/learning/exercise';
import {
  buildConversationTurn,
  buildCultureCard,
  buildExact,
  buildGrammarCard,
  buildReading,
  generateForConcept,
  generateOfKind,
  mulberry32,
  shuffle,
  type GenContext,
} from '@/learning/generator';
import { knowledgeOf } from '@/learning/eligibility';
import { mistakeQueue, scaffoldKindFor } from '@/learning/mistakes';
import {
  describeScope,
  selectTargets,
  type ReviewScope,
  type SelectionIntent,
} from '@/learning/scope';
import {
  arcPhaseOf,
  arcStepId,
  unitIdForArcStep,
  type ArcPhase,
} from '@/learning/unit-arc';
import {
  dueConcepts,
  estimateLevel,
  hasEncountered,
  skillBalance,
  unitStrengthPlan,
  SESSION_CAP,
  type UnitStrengthPlan,
} from '@/learning/mastery';
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
  | 'unitSmart'
  /** One phase of a unit's guided teaching arc — see `learning/unit-arc.ts`. */
  | 'unitArc';

/**
 * Session kinds that write into `completedLessons`.
 *
 * `completedLessons` is keyed by string and nothing requires the keys to name
 * lessons in the curriculum, which is what lets a unit's arc phases store their
 * progress there under `arc:<unitId>:<phase>` with no `STATE_VERSION` bump.
 */
export const LESSON_KINDS: SessionKind[] = [
  'lesson',
  'conversation',
  'story',
  'checkpoint',
  'unitArc',
];

/**
 * Which lesson, if any, a session that is ending has actually finished.
 *
 * Answering is not finishing, and the two were being written by the same call.
 * The session screen banks a session when it unmounts so that leaving partway
 * does not throw the XP away — every answer is already committed as it happens,
 * but the session record and the reward are written once, at the end, and
 * losing those reads to a learner as having lost everything. That part is
 * right.
 *
 * What went with it was `lessonId`, and the lesson tick is a different claim
 * from the reward: XP is earned by work done, while the tick says the lesson
 * was *walked*. So answering one exercise and pressing the close button marked
 * the lesson complete. Measured against the curriculum, 36 of the course's 63
 * units carry exactly one required lesson — so for more than half the course
 * that finished the unit's teaching outright and moved the "units done" figure
 * on the Learn tab. An arc phase could be ticked off the same way, without
 * being played.
 *
 * Reaching the end of the queue is the only thing that finishes a lesson.
 */
export function completedLessonId(input: {
  kind: SessionKind;
  source: string;
  reachedEnd: boolean;
}): string | undefined {
  if (!input.reachedEnd) return undefined;
  return LESSON_KINDS.includes(input.kind) ? input.source : undefined;
}

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
  /** The unit or lesson the session was started from, where the kind needs it. */
  source?: string;
  targetLength?: number;
  /**
   * Where this review may draw its *targets* from.
   *
   * Passed explicitly by the screen that started it, so "Smart Review" on the
   * home page and "Smart Review" inside a unit are different sessions by
   * construction rather than by each call site remembering to send a concept
   * list. See `learning/scope.ts`. Omitted means global.
   */
  scope?: ReviewScope;
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
    // What the course has actually shown this learner. Everything the generator
    // does with a sentence is gated on it — see `learning/eligibility.ts`.
    knowledge: knowledgeOf(options.learner),
    // Shared across the whole session so a concept coming back later comes back
    // in a different sentence, not the same one under a new heading.
    usedSentences: new Set<string>(),
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

  /**
   * How many *answerable* exercises the lesson is worth.
   *
   * Teaching cards are deliberately not counted against it. They used to be —
   * cards were pushed into the same array the practice budget was measured
   * against — and the consequence was a hard `slice(0, 8)` on new concepts,
   * because any more would have eaten the whole session. Fifty of the course's
   * lessons teach more than eight things, up to twenty, so most of what the
   * course introduces was reaching the learner with no introduction at all:
   * no "NEW WORD" card, no meaning, no example, just a multiple choice about a
   * word they had never been shown. A card is a few seconds of reading, not an
   * exercise, and budgeting it as one was the whole cause.
   */
  const target = options.targetLength ?? clamp(Math.round(lesson.estMinutes * 1.8), 10, 20);
  const exercises: Exercise[] = [];

  // 1. Grammar cards for anything new, before it is tested — a rule frames the
  //    words that follow it.
  for (const grammarId of lesson.grammar ?? []) {
    if (learner.concepts[grammarId]?.introduced) continue;
    const card = buildGrammarCard(grammarId);
    if (card) exercises.push(card);
  }

  const unmet = lesson.teaches.filter((id) => !learner.concepts[id]?.introduced);
  const knownConcepts = lesson.teaches.filter((id) => learner.concepts[id]?.introduced);

  /**
   * What this sitting will introduce, and what waits for the next one.
   *
   * Anything beyond the cap is left genuinely untouched — not introduced, not
   * practised, not scored. The alternative, which is what used to happen, is
   * that the surplus reached the learner through the practice pool: marked as
   * met, tested, and never once shown. A word the app has never displayed is
   * not a word the learner has been taught, and recording it as one is how the
   * Library fills up with things nobody has seen.
   */
  const newConcepts = unmet.slice(0, MAX_NEW_PER_SESSION);

  // 2. Practice: new concepts first (now "introduced"), then revision of the
  //    lesson's known concepts and its grammar.
  const introduced: LearnerState['concepts'] = { ...learner.concepts };
  for (const conceptId of newConcepts) {
    introduced[conceptId] = {
      ...(introduced[conceptId] ?? emptyState(conceptId, ctx.now)),
      introduced: true,
    };
  }
  const practiceLearner: LearnerState = { ...learner, concepts: introduced };

  /**
   * Re-derive the knowledge set from the *post-teaching* learner.
   *
   * Without this the eligibility gate would refuse to let a lesson practise
   * what it had just taught: `knowledge` was built at `makeContext` time, from
   * the learner as they were before the teaching cards ran, so every sentence
   * containing this lesson's new words would count them as unknown. The point
   * of the gate is that introduction comes before production — not that they
   * cannot happen in the same sitting.
   */
  ctx.knowledge = {
    ...knowledgeOf(practiceLearner),
    /**
     * A lesson may practise at its own level, whatever the learner's history
     * says.
     *
     * `productionCeiling` asks "how much has this learner been shown?", which
     * is the right question for a review session assembled from everything they
     * have ever met and the wrong one inside a lesson: on the first lesson of
     * the course it answers A0, so every A1 sentence in that lesson's own list
     * was refused and the session collapsed to the one exercise kind that needs
     * no sentence at all — sixteen multiple choices in a row. Where a lesson is
     * placed is a deliberate pedagogical decision by the author, and inside
     * that lesson it outranks the estimate.
     */
    ceiling: higherLevel(knowledgeOf(practiceLearner).ceiling, lesson.level),
  };

  /**
   * Every new concept gets its card, and its first use immediately after.
   *
   * The pairing is the point. Eight cards in a row followed by eight questions
   * reads as a glossary and then a quiz; card → use → card → use is the shape
   * of actually learning something, and it means the word is retrieved while
   * the introduction is still on the previous screen.
   */
  for (const conceptId of newConcepts) {
    const card = generateForConcept(conceptId, undefined, ctx);
    if (!card) continue;
    exercises.push(card);
    /**
     * `recentKinds` carries across the loop rather than being reset per word.
     * Resetting it made every one of these checks a multiple choice — the
     * freshness pass had nothing to steer by, so it returned the tier order
     * unchanged every time and the first kind in it always had the material it
     * needed.
     */
    const check = generateForConcept(conceptId, introduced[conceptId], ctx);
    if (check && check.form !== 'presentation') {
      exercises.push(check);
      ctx.recentKinds = [check.kind, ...(ctx.recentKinds ?? [])].slice(0, 3);
    }
  }

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

  const answeredSoFar = exercises.filter((exercise) => exercise.form !== 'presentation').length;
  const practice = generate(
    practicePool,
    practiceLearner,
    ctx,
    Math.max(0, target - answeredSoFar),
  );
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
    /**
     * Cards are additive to the budget, not deducted from it — see `target`
     * above. The cap is on answerable work; a lesson that introduces twenty
     * things is longer than one that introduces four, which is what it should
     * be.
     */
    exercises: final.slice(0, target + cards(final) + reviews.length + cultureCards.length),
  };
}

/**
 * A checkpoint tests the whole stage, not one lesson: no teaching cards, a
 * deliberate spread across vocabulary, grammar, listening and production, and
 * the weakest concepts first so the result actually diagnoses something.
 */
/**
 * What a checkpoint has to test before it is allowed to certify anything.
 *
 * A checkpoint that samples the stage's weakest concepts will, left alone, pick
 * whatever exercise kind the learner's own history makes freshest — and for a
 * learner who has drilled vocabulary and skipped everything else, that is more
 * vocabulary. Which is exactly how somebody reaches the B1 checkpoint, passes
 * it, and cannot understand a spoken sentence.
 *
 * So the checkpoint carries a floor per skill. It is a floor, not a quota split:
 * the rest of the session is still chosen adaptively.
 */
const CHECKPOINT_SKILL_FLOOR: { kinds: ExerciseKind[]; min: number }[] = [
  { kinds: ['listenSelect', 'listenComprehend', 'dictation'], min: 3 },
  { kinds: ['translateToEs', 'buildResponse', 'speak'], min: 3 },
];

/** Kinds cheap enough to give up a slot when a skill floor is unmet. */
const SUBSTITUTABLE: ExerciseKind[] = ['multipleChoice', 'match', 'translateToEn'];

/**
 * Tops a session up until every skill floor is met, replacing the cheapest
 * exercises rather than lengthening the session. Concepts already used are
 * skipped so the substitution does not just re-ask the same word.
 */
function enforceSkillQuota(
  exercises: Exercise[],
  pool: string[],
  learner: LearnerState,
  ctx: GenContext,
): Exercise[] {
  const out = [...exercises];

  for (const { kinds, min } of CHECKPOINT_SKILL_FLOOR) {
    let have = out.filter((exercise) => kinds.includes(exercise.kind)).length;
    if (have >= min) continue;

    for (const conceptId of pool) {
      if (have >= min) break;
      if (out.some((exercise) => exercise.conceptIds.includes(conceptId))) continue;

      const replacement = generateOfKind(conceptId, learner.concepts[conceptId], ctx, kinds);
      if (!replacement) continue;

      // Take a recognition slot if there is one; otherwise extend.
      const victim = out.findIndex(
        (exercise) => SUBSTITUTABLE.includes(exercise.kind) && exercise.form !== 'presentation',
      );
      if (victim === -1) out.push(replacement);
      else out.splice(victim, 1, replacement);
      have += 1;
    }
  }

  return out;
}

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
  const generated = enforceSkillQuota(generate(ordered, learner, ctx, target), ordered, learner, ctx);
  const exercises = interleave(generated);

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

  /**
   * Scope-aware, and global unless told otherwise.
   *
   * The home page's Smart Review is the global one — everything the learner has
   * encountered, ranked by the scheduler. A unit screen passes a unit scope and
   * gets the same ranking confined to that unit, which is what stops a review
   * started from "In the café" asking about the weather.
   */
  const scope = options.scope ?? { type: 'global' };
  const ordered = selectTargets(scope, 'smart', learner, ctx.now);
  const exercises = interleave(generate(ordered, learner, ctx, target));

  return {
    id: `smart-review:${ctx.now}`,
    kind: 'smartReview',
    source: 'smart-review',
    title: 'Smart Review',
    subtitle:
      scope.type === 'global'
        ? 'Built from what you are closest to forgetting'
        : `${describeScope(scope)} — what most needs attention`,
    exercises,
  };
}

/**
 * One phase of a unit's guided arc.
 *
 * The three phases draw from the same pool — everything the unit teaches — and
 * differ in how much support the exercises are allowed to give. That is the
 * whole mechanism, and it is why this adds no content: a lesson declares
 * material, `session.ts` decides what to do with it, so the fourth pass over a
 * unit can be a different session from the first without a single new sentence
 * being written.
 *
 * Scaffolding is stepped down by *demoting* the gentle kinds rather than
 * banning them, using the same `recentKinds` seam the listening rotation uses.
 * Banning them would strand any concept that can only support recognition —
 * and a phase that silently drops a third of the unit is worse than one that
 * occasionally offers an easy question.
 */
const PHASE_KINDS: Record<ArcPhase, ExerciseKind[] | null> = {
  /**
   * Null means "let the learner's own history choose", which is what mixed
   * practice should be: the ordinary adaptive mix, interleaved with earlier
   * material. Only the two purely-recognition kinds are nudged back, through
   * `recentKinds`.
   */
  mixed: null,
  /**
   * Retrieval means retrieving. Every kind here makes the learner produce the
   * answer rather than pick it out of a list, ordered gently-first so a phase
   * opens on comprehension and works up to production.
   */
  recall: [
    'fillBlank',
    'translateToEs',
    'translateToEn',
    'dictation',
    'grammarChoice',
    'listenComprehend',
  ],
  /**
   * Breadth across the four skills rather than maximum difficulty — the
   * question a consolidation asks is "can you use this?", not "can you survive
   * an exam?". Production and listening lead because they are the two the rest
   * of a unit's practice under-serves.
   */
  consolidate: [
    'translateToEs',
    'listenComprehend',
    'fillBlank',
    'chooseNatural',
    'translateToEn',
    'dictation',
    'wordBank',
  ],
};

/** Nudged down where the phase has no explicit kind list to impose. */
const PHASE_DEMOTE: Record<ArcPhase, ExerciseKind[]> = {
  mixed: ['multipleChoice', 'match'],
  recall: ['multipleChoice', 'match', 'wordBank', 'listenSelect'],
  consolidate: ['multipleChoice', 'match'],
};

export function buildArcSession(
  unitId: string,
  phase: ArcPhase,
  options: BuildOptions,
): SessionPlan | null {
  const unit = getUnit(unitId);
  if (!unit) return null;

  const ctx = makeContext(options);
  const { learner } = options;
  const target = options.targetLength ?? 10;

  const taught = getUnitTaughtConcepts(unit).filter((id) =>
    hasEncountered(learner.concepts[id]),
  );
  if (taught.length === 0) return null;

  const weakestFirst = [...taught].sort(byWeakness(learner, ctx.now));

  /**
   * `mixed` earns its name by actually mixing: a third of it is earlier
   * material, interleaved. The other two phases stay inside the unit, because
   * "can I use what this unit taught me?" is a question about this unit.
   */
  const outside =
    phase === 'mixed'
      ? dueConcepts(learner, ctx.now)
          .map((state) => state.id)
          .filter((id) => !taught.includes(id))
          .slice(0, 3)
      : [];

  const pool = phase === 'consolidate' ? weakestFirst : dedupe([...weakestFirst, ...taught]);

  const phaseCtx: GenContext = {
    ...ctx,
    recentKinds: [...PHASE_DEMOTE[phase], ...(ctx.recentKinds ?? [])],
  };

  /**
   * The phase's own kinds first, the ordinary generator as the fallback.
   *
   * `generateOfKind` is the existing escape hatch a checkpoint uses to *test* a
   * skill the learner's history would not have offered, and this is the same
   * need: a fourth pass over a unit is only worth doing if it asks differently
   * from the first three. It returns null for a concept that cannot support any
   * of the wanted kinds — a grammar concept, or a word with no eligible
   * sentence — and those fall through rather than being dropped, because a
   * phase that silently omits a third of the unit is worse than one that
   * occasionally offers an easy question.
   */
  const wanted = PHASE_KINDS[phase];
  const exercises: Exercise[] = [];
  for (const conceptId of pool) {
    if (exercises.length >= target) break;
    const state = learner.concepts[conceptId];
    /**
     * Rotated, not ranked.
     *
     * `generateOfKind` takes the first kind that works, so handing it the same
     * ordered list every time produces a session of one exercise type repeated
     * — six `translateToEn` in a row, measured. That is the Duolingo failure
     * this arc exists to avoid, arrived at from the opposite direction. So the
     * list is rotated by position: every exercise still comes from the phase's
     * register, and successive ones prefer different members of it. The same
     * device as `LISTENING_ROTATION`, for the same reason.
     */
    const order = wanted
      ? wanted.map((_, i) => wanted[(i + exercises.length) % wanted.length])
      : null;
    const exercise =
      (order ? generateOfKind(conceptId, state, phaseCtx, order) : null) ??
      generateForConcept(conceptId, state, phaseCtx);
    if (!exercise || exercise.form === 'presentation') continue;
    exercises.push(exercise);
    phaseCtx.recentKinds = [exercise.kind, ...(phaseCtx.recentKinds ?? [])].slice(0, 4);
  }

  const interleaved = sprinkle(
    interleave(exercises),
    generate(outside, learner, phaseCtx, outside.length),
  );

  const copy = {
    mixed: { title: 'Mixed practice', subtitle: 'This unit alongside what you already knew' },
    recall: { title: 'Active recall', subtitle: 'Without the word banks this time' },
    consolidate: { title: 'Consolidate', subtitle: 'The whole unit — can you use it?' },
  }[phase];

  return {
    id: `${arcStepId(unit.id, phase)}:${ctx.now}`,
    kind: 'unitArc',
    /**
     * The arc step id, not the unit id. `completeSession` writes `source` into
     * `completedLessons` for lesson-shaped sessions, which is how an arc step
     * records that it was played without needing a new persisted field.
     */
    source: arcStepId(unit.id, phase),
    title: `${unit.title} — ${copy.title}`,
    subtitle: copy.subtitle,
    exercises: interleaved,
  };
}

/**
 * The second pass at something the learner just got wrong, within the session.
 *
 * A wrong answer already re-queues the exercise once, later in the same
 * session. It used to re-queue it *unchanged*, which for a free-production item
 * is asking the same impossible question a second time — and the learner has
 * just demonstrated they cannot answer it. That is not spaced practice, it is
 * the app having nothing to offer.
 *
 * So the retry steps down one rung of support while keeping the concept and the
 * sentence: "translate this" becomes "assemble this from these words". Same
 * target, same line, less to supply from nothing — which is what tutoring looks
 * like. The ladder is shared with mistake review rather than copied, and if
 * nothing can be rebuilt the original comes back, because a second look at a
 * hard question still beats no second look.
 */
export function buildRetry(exercise: Exercise, options: BuildOptions): Exercise {
  const gentler = scaffoldKindFor(exercise.kind);
  const target = exercise.targetId ?? exercise.conceptIds[0];
  if (!gentler || !exercise.sourceId || !target) return exercise;

  const ctx = makeContext(options);
  const rebuilt = buildExact(exercise.sourceId, gentler, target, ctx);
  return rebuilt ? { ...rebuilt, targetId: target } : exercise;
}

/**
 * Review Mistakes: the mistakes, and nothing else.
 *
 * Built from `mistakeQueue` rather than from the concept pool, which is the
 * whole correction. The old path took the unresolved mistakes, kept only their
 * `conceptIds`, and handed them to the ordinary generator — so a failed
 * "Translate: I am tired" came back as a multiple choice about `v.cansado`,
 * the other three concepts tagged on that sentence each produced their own
 * unrelated exercise, and their sentence pools filled the rest of the session
 * with lines the learner had never seen, let alone got wrong.
 *
 * Three rules hold here and nowhere else:
 *
 *   • **One exercise per mistake.** Not one per concept the mistake touched.
 *   • **The same item, where it can be rebuilt.** `buildExact` re-creates the
 *     original sentence and kind; only a record too old to name its sentence
 *     falls back to generating for the concept.
 *   • **Nothing is added.** No due concepts, no weak areas, no reading break.
 *     An empty queue produces an empty session, and the screen says so.
 */
export function buildMistakeSession(options: BuildOptions): SessionPlan {
  const ctx = makeContext(options);
  const { learner } = options;
  const queue = mistakeQueue(learner, options.targetLength ?? 12);

  const exercises: Exercise[] = [];
  for (const retry of queue) {
    const state = learner.concepts[retry.conceptId];

    /**
     * The scaffolded kind comes first when the original was demanding — see
     * `retryKinds`. Re-asking somebody the free-production question they just
     * failed, unchanged, teaches them that the app has nothing to offer but the
     * same wall.
     */
    let exercise: Exercise | null = null;
    if (retry.sentenceId) {
      for (const kind of retry.kinds) {
        exercise = buildExact(retry.sentenceId, kind, retry.conceptId, ctx);
        if (exercise) break;
      }
    }
    // No sentence on the record, or none of the kinds could be rebuilt from it.
    exercise ??= generateOfKind(retry.conceptId, state, ctx, retry.kinds);
    exercise ??= generateForConcept(retry.conceptId, state, ctx);

    if (!exercise || exercise.form === 'presentation') continue;
    /**
     * Pinned to the mistake's own target so the store can tell a genuine
     * correction from a correct answer that merely brushed past the concept.
     * Resolution policy lives in `learning/mistakes.ts`.
     */
    exercises.push({ ...exercise, targetId: retry.conceptId });
    ctx.recentKinds = [exercise.kind, ...(ctx.recentKinds ?? [])].slice(0, 3);
  }

  return {
    id: `mistakes:${ctx.now}`,
    kind: 'mistakes',
    source: 'mistakes',
    title: 'Review mistakes',
    subtitle:
      exercises.length > 0
        ? `${exercises.length} to put right`
        : 'Nothing to review — you have fixed them all',
    // Not interleaved: the queue order is the point, and shuffling it would
    // undo the "oldest unresolved first" the learner can watch shorten.
    exercises,
  };
}

export function buildPracticeSession(kind: SessionKind, options: BuildOptions): SessionPlan {
  const ctx = makeContext(options);
  const { learner } = options;
  const now = ctx.now;

  /**
   * The scope this session may draw its targets from.
   *
   * Explicit when the screen passed one; otherwise global, except for the two
   * kinds that are inherently about a single unit. This is what makes "Smart
   * Review" mean different things on the home page and inside a unit without
   * either button having to remember to filter anything.
   */
  const scope: ReviewScope =
    options.scope ??
    (options.conceptIds && options.conceptIds.length > 0
      ? { type: 'concepts', conceptIds: options.conceptIds }
      : { type: 'global' });

  const scoped = (intent: SelectionIntent) => selectTargets(scope, intent, learner, now);
  const local = scope.type !== 'global';

  let ids: string[] = [];
  let title = 'Practice';
  let subtitle = '';
  let target = options.targetLength ?? 12;

  switch (kind) {
    case 'quickPractice':
      target = options.targetLength ?? 6;
      title = 'Quick Practice';
      subtitle = 'About three minutes';
      ids = scoped('quick');
      break;

    case 'vocabulary':
      title = 'Vocabulary review';
      subtitle = local
        ? `Words from ${describeScope(scope)}`
        : 'Words you have met, ranked by how shaky they are';
      ids = scoped('vocabulary');
      break;

    case 'grammar':
      title = 'Grammar review';
      subtitle = local
        ? `Grammar from ${describeScope(scope)}`
        : 'The rules you are least sure of';
      ids = scoped('grammar');
      break;

    case 'listening':
      title = 'Listening practice';
      subtitle = local ? `${describeScope(scope)}, spoken` : 'Spain Spanish, spoken';
      ids = scoped('listening');
      break;

    case 'hardMode':
      title = 'Hard mode';
      subtitle = 'No word banks, no hints — produce it yourself';
      ids = scoped('hard');
      break;

    case 'concept':
      /**
       * "Full review" from a unit screen arrives here. Breadth, not urgency:
       * everything in scope appears, weakest first, including what is already
       * solid — which is the difference between a full review and a smart one.
       */
      title = local ? `Full review — ${describeScope(scope)}` : 'Focused practice';
      subtitle = local ? 'Everything this unit covered' : 'Drilling one area';
      ids = scoped('full');
      break;

    case 'unitSmart': {
      /**
       * Strengthening a unit, not replaying it.
       *
       * The order comes from `unitStrengthPlan`, which puts unresolved mistakes
       * first, then concepts a single lesson pass met once and left, then what
       * has decayed, then what has only ever been recognised. Replaying the
       * original lesson would hand back the same exercises in the same order,
       * which is the one thing a revisit must not do.
       */
      const unitId = scope.type === 'unit' ? scope.unitId : options.source;
      const unit = unitId ? getUnit(unitId) : undefined;
      const plan = unit ? unitStrengthPlan(unit, learner, now) : null;

      title = plan && plan.unseen.length > 0 ? 'Finish this unit' : 'Strengthen this unit';
      subtitle = plan
        ? strengthenSubtitle(plan)
        : 'Weak and overdue concepts from this unit';
      target = options.targetLength ?? SESSION_CAP;

      if (plan && plan.conceptIds.length + plan.unseen.length > 0) {
        /**
         * Unmet concepts come first and generate teaching cards, because a
         * lesson introduces at most `MAX_NEW_PER_SESSION` things a sitting and
         * a large unit legitimately has some left over. Without this they would
         * be reachable only by replaying the lesson, which the learner has no
         * reason to do once it shows a tick.
         */
        ids = [...plan.unseen, ...plan.conceptIds];
      } else {
        // No plan (no unit resolved): fall back to the scope's own smart order,
        // which for a unit scope is still that unit and nothing else.
        ids = scoped('smart');
      }
      break;
    }

    case 'random':
    default:
      title = 'Random challenge';
      subtitle = 'Anything you have learned, in any form';
      ids = shuffle(scoped('random'), ctx.rng);
      break;
  }

  /**
   * No post-hoc intersection any more.
   *
   * `ids` came out of `selectTargets`, which already applied the scope — so
   * filtering again here would be the second, weaker copy of a rule that now
   * has one home. It also used to be wrong in a way nothing caught: it ran for
   * every kind except two, so a caller passing both a concept list and a kind
   * whose pool was built differently silently got the intersection of two
   * unrelated policies.
   */

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

/**
 * Listening is three different skills, not one exercise in three costumes.
 *
 *   • `listenSelect` — sound discrimination. Which of these did you hear?
 *   • `listenComprehend` — meaning. What did it say?
 *   • `dictation` — transcription, the hardest of the three.
 *
 * Left to the ordinary ranking, a listening session collapsed onto whichever of
 * them the learner's own history made freshest, and a "listening practice"
 * session that only ever asks you to match waveforms trains an ear that cannot
 * understand anything. So this rotates deliberately and only falls back to the
 * general generator when a concept cannot support the kind it is due.
 *
 * The rotation is ordered easiest-first so a session opens on discrimination
 * and works up, and it advances per exercise rather than per concept — the
 * point is variety through the session, not per word.
 */
const LISTENING_ROTATION: ExerciseKind[] = ['listenSelect', 'listenComprehend', 'dictation'];

function buildListeningExercises(
  ids: string[],
  learner: LearnerState,
  ctx: GenContext,
  target: number,
): Exercise[] {
  const out: Exercise[] = [];

  for (const conceptId of ids) {
    if (out.length >= target) break;
    const state = learner.concepts[conceptId];

    /**
     * Dictation on a concept the learner has barely met is a spelling test with
     * no memory behind it, so the rotation starts shallow and only reaches the
     * hardest kind once there is something to transcribe from.
     */
    const depth = state && mastery(state, ctx.now) >= 0.5 ? LISTENING_ROTATION.length : 2;
    const wanted = LISTENING_ROTATION[out.length % depth];

    const exercise =
      generateOfKind(conceptId, state, ctx, [
        wanted,
        ...LISTENING_ROTATION.filter((kind) => kind !== wanted),
      ]) ??
      // Nothing audible for this concept — a bare word with no sentence, or a
      // `noAudio` line. Take whatever it can offer rather than dropping it,
      // but only while the session still has room for real listening.
      (out.length + 4 < target
        ? generateForConcept(conceptId, state, {
            ...ctx,
            recentKinds: (['multipleChoice', 'wordBank', 'translateToEn'] as ExerciseKind[]).concat(
              ctx.recentKinds ?? [],
            ),
          })
        : null);

    if (exercise) out.push(exercise);
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

/** "8 developing · 3 weak" — the reason this session exists, in the learner's terms. */
function strengthenSubtitle(plan: UnitStrengthPlan): string {
  const parts: string[] = [];
  if (plan.unseen.length > 0) parts.push(`${plan.unseen.length} still to meet`);
  if (plan.mistaken.length > 0) parts.push(`${plan.mistaken.length} to fix`);
  if (plan.developing.length > 0) parts.push(`${plan.developing.length} still developing`);
  if (plan.weak.length > 0) parts.push(`${plan.weak.length} faded`);
  if (plan.unproduced.length > 0) parts.push(`${plan.unproduced.length} never produced`);
  return parts.length > 0 ? parts.join(' · ') : 'A varied pass over everything this unit covered';
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
    /**
     * Its own builder, deliberately not routed through `buildPracticeSession`.
     * Mistake review is a queue to replay, not a pool to rank, and the one line
     * that used to send it through the shared path is what filled it with
     * unrelated practice.
     */
    case 'mistakes':
      return buildMistakeSession(options);
    case 'unitArc': {
      // `source` is the arc step id: "arc:<unitId>:<phase>".
      const unitId = unitIdForArcStep(source);
      const phase = arcPhaseOf(source);
      return unitId && phase ? buildArcSession(unitId, phase, options) : null;
    }
    case 'hardMode':
      return buildPracticeSession('hardMode', { ...options, forceHardMode: true });
    default:
      return buildPracticeSession(kind, { ...options, source });
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

/** The higher of two CEFR levels. */
function higherLevel(a: CefrLevel, b: CefrLevel): CefrLevel {
  return levelIndex(a) >= levelIndex(b) ? a : b;
}

/**
 * The most new material one sitting may introduce.
 *
 * A ceiling on cognitive load, not on the curriculum: a lesson declaring more
 * than this introduces the rest on a later pass, and `unitStrengthPlan` lists
 * what is still unmet so it stays reachable. Twelve rather than eight — eight
 * left too much of the course silently un-introduced, and a card is cheap.
 */
const MAX_NEW_PER_SESSION = 12;

/** Presentation cards in a built session — they do not count against the budget. */
function cards(exercises: Exercise[]): number {
  return exercises.filter((exercise) => exercise.form === 'presentation').length;
}

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
