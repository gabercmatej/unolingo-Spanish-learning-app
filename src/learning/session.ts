import {
  allLessons,
  conversations,
  getConcept,
  getGrammar,
  getLesson,
  getLessonSentences,
  getStageConcepts,
  getUnit,
  getStory,
  isGrammarConcept,
  isVocabConcept,
  levelIndex,
  stories,
} from '@/content';
import type { CefrLevel, Lesson } from '@/content/types';
import type { ChoiceExercise, Exercise } from '@/learning/exercise';
import {
  buildConversationTurn,
  buildCultureCard,
  buildGrammarCard,
  buildReading,
  generateForConcept,
  generateOfKind,
  mulberry32,
  shuffle,
  type GenContext,
} from '@/learning/generator';
import { knowledgeOf } from '@/learning/eligibility';
import {
  atRiskConcepts,
  dueConcepts,
  estimateLevel,
  skillBalance,
  unitStrengthPlan,
  weakAreas,
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
  /** The unit or lesson the session was started from, where the kind needs it. */
  source?: string;
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
      /**
       * Strengthening a unit, not replaying it.
       *
       * The order comes from `unitStrengthPlan`, which puts unresolved mistakes
       * first, then concepts a single lesson pass met once and left, then what
       * has decayed, then what has only ever been recognised. Replaying the
       * original lesson would hand back the same exercises in the same order,
       * which is the one thing a revisit must not do.
       */
      const unit = options.source ? getUnit(options.source) : undefined;
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
      }
      break;
    }

    case 'random':
    default:
      title = 'Random challenge';
      subtitle = 'Anything you have learned, in any form';
      ids = shuffle(seenIds, ctx.rng);
      break;
  }

  // `unitSmart` derives its own pool from the unit, and intersecting it with
  // the caller's list would drop exactly the concepts the plan added.
  if (options.conceptIds && kind !== 'concept' && kind !== 'unitSmart') {
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
