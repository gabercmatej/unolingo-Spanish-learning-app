import {
  allConcepts,
  conceptLabel,
  curriculum,
  getConcept,
  getGrammar,
  getUnitConcepts,
  getUnitTaughtConcepts,
  getVerb,
  isGrammarConcept,
  isVocabConcept,
  levelIndex,
  verbFormConceptId,
} from '@/content';
import {
  CEFR_LEVELS,
  TOPIC_LABELS,
  type CefrLevel,
  type Lesson,
  type Stage,
  type TenseId,
  type TopicId,
  type Unit,
} from '@/content/types';
import { unitPractice, type UnitPractice } from '@/learning/unit-practice';
import { continueTarget, isRequired } from '@/learning/progression';
import { mastery, masteryBand, retrievability, urgency } from '@/learning/srs';
import type { ConceptState, ExerciseKind, LearnerState, Skill } from '@/learning/types';

/**
 * Aggregates the per-concept memory records into the numbers the learner sees:
 * skill mastery, weak areas, and a running CEFR estimate.
 */

export interface WeakArea {
  id: string;
  label: string;
  /** 0..1 */
  mastery: number;
  /** Concept ids to drill. */
  conceptIds: string[];
  kind: 'grammar' | 'topic' | 'verb';
}

export interface SkillSummary {
  skill: Skill;
  label: string;
  mastery: number;
  /** Concepts with any history in this skill. */
  seen: number;
}

const SKILL_LABELS: Record<Skill, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  listening: 'Listening',
  production: 'Production',
};

/** Average mastery over a set of concepts, ignoring ones never seen. */
export function averageMastery(states: ConceptState[], now = Date.now()): number {
  const seen = states.filter((s) => s.timesSeen > 0);
  if (seen.length === 0) return 0;
  return seen.reduce((sum, s) => sum + mastery(s, now), 0) / seen.length;
}

export function conceptStates(learner: LearnerState): ConceptState[] {
  return Object.values(learner.concepts);
}

/**
 * Skill mastery. Vocabulary and grammar come from the concepts themselves;
 * listening and production come from which *exercise kinds* a concept has been
 * answered in, because those are skills of doing, not of knowing.
 */
export function skillSummaries(learner: LearnerState, now = Date.now()): SkillSummary[] {
  const states = conceptStates(learner);

  const vocab = states.filter((s) => {
    const concept = getConcept(s.id);
    return concept ? isVocabConcept(concept) : false;
  });
  const grammar = states.filter((s) => {
    const concept = getConcept(s.id);
    return concept ? isGrammarConcept(concept) || concept.kind === 'verbform' : false;
  });
  const listened = states.filter((s) =>
    s.kinds.some((k) => k === 'listenSelect' || k === 'dictation' || k === 'listenComprehend'),
  );
  const produced = states.filter((s) =>
    s.kinds.some(
      (k) => k === 'translateToEs' || k === 'conversation' || k === 'buildResponse' || k === 'speak',
    ),
  );

  return [
    { skill: 'vocabulary', label: SKILL_LABELS.vocabulary, mastery: averageMastery(vocab, now), seen: vocab.length },
    { skill: 'grammar', label: SKILL_LABELS.grammar, mastery: averageMastery(grammar, now), seen: grammar.length },
    { skill: 'listening', label: SKILL_LABELS.listening, mastery: averageMastery(listened, now), seen: listened.length },
    { skill: 'production', label: SKILL_LABELS.production, mastery: averageMastery(produced, now), seen: produced.length },
  ];
}

/**
 * Which skills are ahead of, and behind, the learner's own average.
 *
 * One CEFR estimate cannot describe somebody who reads at B2, listens at B1 and
 * produces at A2 — and handing that learner B2 production because their overall
 * estimate says B2 is how a course stops being usable. This is the signal the
 * generator uses to calibrate difficulty *per skill* rather than globally.
 *
 * It is deliberately derived from data already in `ConceptState` (the exercise
 * kinds a concept has been answered in), so it needs no new persisted field and
 * therefore no `STATE_VERSION` bump.
 */
export interface SkillBalance {
  /** Skills meaningfully behind the learner's own mean. */
  lagging: Skill[];
  /** Skills meaningfully ahead of it. */
  leading: Skill[];
}

/**
 * How much a skill has to diverge from the learner's mean before it counts.
 * Set wide on purpose: normal noise between skills is not a per-skill profile,
 * and reacting to noise would make the exercise mix feel arbitrary.
 */
const SKILL_DIVERGENCE = 0.12;

/**
 * Below this many concepts a skill has simply not been measured. Listening
 * looking "weak" after three items is an artefact of the sample, not evidence.
 */
const SKILL_MIN_SAMPLE = 8;

export function skillBalance(learner: LearnerState, now = Date.now()): SkillBalance {
  const measured = skillSummaries(learner, now).filter(
    (summary) => summary.seen >= SKILL_MIN_SAMPLE,
  );
  // Comparing a skill against a mean of one skill is comparing it to itself.
  if (measured.length < 2) return { lagging: [], leading: [] };

  const mean = measured.reduce((sum, s) => sum + s.mastery, 0) / measured.length;

  return {
    lagging: measured.filter((s) => s.mastery < mean - SKILL_DIVERGENCE).map((s) => s.skill),
    leading: measured.filter((s) => s.mastery > mean + SKILL_DIVERGENCE).map((s) => s.skill),
  };
}

/**
 * Weak areas, grouped so they are actionable. A list of forty shaky words is
 * not useful; "past tense, 62%" is.
 */
export function weakAreas(learner: LearnerState, now = Date.now(), limit = 6): WeakArea[] {
  const areas: WeakArea[] = [];

  // Grammar concepts stand on their own — each is already a teachable area.
  for (const state of conceptStates(learner)) {
    if (state.timesSeen < 2) continue;
    const concept = getConcept(state.id);
    if (!concept || !isGrammarConcept(concept)) continue;
    areas.push({
      id: concept.id,
      label: concept.title,
      mastery: mastery(state, now),
      conceptIds: [concept.id],
      kind: 'grammar',
    });
  }

  // Vocabulary is grouped by topic, which is how the learner experiences it.
  const byTopic = new Map<TopicId, ConceptState[]>();
  for (const state of conceptStates(learner)) {
    if (state.timesSeen < 2) continue;
    const concept = getConcept(state.id);
    if (!concept || !isVocabConcept(concept)) continue;
    for (const topic of concept.topics) {
      const list = byTopic.get(topic);
      if (list) list.push(state);
      else byTopic.set(topic, [state]);
    }
  }
  for (const [topic, states] of byTopic) {
    if (states.length < 4) continue; // too small a sample to call a weakness
    areas.push({
      id: `topic:${topic}`,
      label: `${TOPIC_LABELS[topic]} vocabulary`,
      mastery: averageMastery(states, now),
      conceptIds: states.map((s) => s.id),
      kind: 'topic',
    });
  }

  // Verb paradigms, grouped per verb across tenses.
  const byVerb = new Map<string, ConceptState[]>();
  for (const state of conceptStates(learner)) {
    if (state.timesSeen < 2) continue;
    const concept = getConcept(state.id);
    if (!concept || concept.kind !== 'verbform') continue;
    const list = byVerb.get(concept.verbId);
    if (list) list.push(state);
    else byVerb.set(concept.verbId, [state]);
  }
  for (const [verbId, states] of byVerb) {
    areas.push({
      id: `verb:${verbId}`,
      label: `${verbId} conjugation`,
      mastery: averageMastery(states, now),
      conceptIds: states.map((s) => s.id),
      kind: 'verb',
    });
  }

  return areas
    .filter((area) => area.mastery < 0.82)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit);
}

/**
 * Verb tenses the learner has actually met, in the order `verbs.ts` lists them.
 *
 * The Library's verb page shows a tense only once its paradigm concept exists in
 * the learner's state, and hides the rest behind "not met yet". That predicate
 * used to live inline in the screen, which is part of why nobody noticed it was
 * permanently false: no lesson taught any paradigm, so `metTenses` was always
 * empty and every verb page showed the present tense and nothing else. Keeping
 * it here means the integration test exercises the same predicate the screen
 * does, rather than a copy of it that could stay green while the screen broke.
 */
export function metVerbTenses(verbId: string, learner: LearnerState): TenseId[] {
  const verb = getVerb(verbId);
  if (!verb) return [];
  return (Object.keys(verb.tenses) as TenseId[]).filter(
    (tense) => !!learner.concepts[verbFormConceptId(verbId, tense)],
  );
}

export function hasMetVerbTense(
  verbId: string,
  tense: TenseId,
  learner: LearnerState,
): boolean {
  return !!learner.concepts[verbFormConceptId(verbId, tense)];
}

/**
 * Has the course shown this concept to the learner at all?
 *
 * The distinction this draws is the one that keeps mastery honest. A concept
 * that has had its teaching card has been *encountered* — it belongs in review
 * queues, in the global practice pool, in "words met". It has not been
 * *retrieved*, so it carries no evidence and must stay out of every average
 * that claims to measure how well something is known. `introduce` used to blur
 * the two by incrementing `timesSeen`, which is why reading a card could move a
 * mastery percentage.
 */
export function hasEncountered(state: ConceptState | undefined): boolean {
  return !!state && (state.introduced || state.timesSeen > 0);
}

/** Every concept the course has shown this learner, in no particular order. */
export function encounteredIds(learner: LearnerState): string[] {
  return conceptStates(learner)
    .filter(hasEncountered)
    .map((state) => state.id);
}

/**
 * Concepts due for review right now, most urgent first.
 *
 * Gated on having been encountered rather than practised, so a word introduced
 * by a card and never reached again is exactly what Smart Review offers next —
 * which is the case most in need of it.
 */
export function dueConcepts(learner: LearnerState, now = Date.now()): ConceptState[] {
  return conceptStates(learner)
    .filter((state) => hasEncountered(state) && state.dueAt <= now)
    .sort((a, b) => urgency(b, now) - urgency(a, now));
}

/** Learned concepts closest to being forgotten, whether or not they are due. */
export function atRiskConcepts(learner: LearnerState, now = Date.now(), limit = 20): ConceptState[] {
  return conceptStates(learner)
    .filter((state) => state.timesSeen >= 2 && retrievability(state, now) < 0.75)
    .sort((a, b) => retrievability(a, now) - retrievability(b, now))
    .slice(0, limit);
}

export interface VocabCounts {
  new: number;
  learning: number;
  familiar: number;
  strong: number;
  mastered: number;
  total: number;
}

export function vocabCounts(learner: LearnerState, now = Date.now()): VocabCounts {
  const counts: VocabCounts = { new: 0, learning: 0, familiar: 0, strong: 0, mastered: 0, total: 0 };
  for (const concept of allConcepts) {
    if (!isVocabConcept(concept)) continue;
    counts.total += 1;
    counts[masteryBand(learner.concepts[concept.id], now)] += 1;
  }
  return counts;
}

/** Words the learner has actually met (any exposure, including a teaching card). */
export function wordsLearned(learner: LearnerState): number {
  return Object.values(learner.concepts).filter((state) => {
    const concept = getConcept(state.id);
    return concept ? isVocabConcept(concept) && hasEncountered(state) : false;
  }).length;
}

export function wordsMastered(learner: LearnerState, now = Date.now()): number {
  return Object.values(learner.concepts).filter((state) => {
    const concept = getConcept(state.id);
    return concept ? isVocabConcept(concept) && mastery(state, now) >= 0.8 : false;
  }).length;
}

/**
 * Which exercise kinds count as evidence for each skill. Vocabulary and grammar
 * are properties of the *concept*; listening and production are properties of
 * how it was answered, which is why they need this table and the other two do
 * not.
 */
const SKILL_KINDS: Record<'listening' | 'production', readonly ExerciseKind[]> = {
  listening: ['listenSelect', 'dictation', 'listenComprehend'],
  production: ['translateToEs', 'conversation', 'buildResponse', 'speak'],
};

/**
 * Concept coverage a level needs before it counts as reached at all.
 */
const LEVEL_COVERAGE = 0.6;

/**
 * And of the concepts that *are* strong at that level, the share that must
 * carry evidence in each of listening and production.
 *
 * This is the gate that stops a level being bought with vocabulary. Without it
 * `estimateLevel` counted concepts and nothing else, so a learner who never
 * finished a dictation or produced a Spanish sentence could still be handed B1
 * — the concepts were strong, and strength does not record *how* it was earned.
 *
 * A third rather than a half, deliberately. Not every concept can produce a
 * listening item, and requiring parity would make the estimate impossible to
 * reach rather than merely hard.
 */
const SKILL_EVIDENCE = 0.35;

/**
 * Below this many strong concepts at a level, the skill shares are noise and the
 * gate is not applied. A learner three exercises into A0 has not failed a
 * listening test; they have not taken one.
 */
const SKILL_GATE_MIN = 10;

export interface ProficiencyEstimate {
  /** The highest level demonstrated across concepts *and* both active skills. */
  level: CefrLevel;
  /**
   * True when the next level's concept coverage is already there and only a
   * skill gate is holding it back. This is the difference between "A2" and
   * "A2+", and the reason the two are worth distinguishing at all.
   */
  plus: boolean;
  /** The skills failing the gate on the level immediately above `level`. */
  heldBackBy: Skill[];
  /**
   * Whether there is enough evidence for the gate to have run at all.
   *
   * False and `heldBackBy` empty look identical from the outside and mean
   * opposite things — "nothing is holding you back" versus "we have not looked
   * yet". A brand-new learner told their A0 is "demonstrated across every skill"
   * is being flattered by a rounding error.
   */
  measured: boolean;
}

interface LevelEvidence {
  coverage: number;
  strongCount: number;
  /** Share of the level's strong concepts carrying evidence for each skill. */
  listening: number;
  production: number;
}

function levelEvidence(learner: LearnerState, level: CefrLevel, now: number): LevelEvidence {
  const levelConcepts = allConcepts.filter((c) => c.level === level);
  if (levelConcepts.length === 0) {
    return { coverage: 1, strongCount: 0, listening: 1, production: 1 };
  }

  const strong = levelConcepts
    .map((c) => learner.concepts[c.id])
    .filter((state): state is ConceptState => !!state && mastery(state, now) >= 0.7);

  const share = (kinds: readonly ExerciseKind[]) =>
    strong.length === 0
      ? 0
      : strong.filter((state) => state.kinds.some((k) => kinds.includes(k))).length / strong.length;

  return {
    coverage: strong.length / levelConcepts.length,
    strongCount: strong.length,
    listening: share(SKILL_KINDS.listening),
    production: share(SKILL_KINDS.production),
  };
}

/** Which of the two evidence-based skills a level's record fails. */
function gateFailures(evidence: LevelEvidence): Skill[] {
  if (evidence.strongCount < SKILL_GATE_MIN) return [];
  const failing: Skill[] = [];
  if (evidence.listening < SKILL_EVIDENCE) failing.push('listening');
  if (evidence.production < SKILL_EVIDENCE) failing.push('production');
  return failing;
}

/**
 * Running CEFR estimate, gated by demonstrated skill.
 *
 * A level counts as reached once most of its concepts are at least "strong"
 * *and* enough of those strong concepts were answered in a listening and a
 * production exercise. A placement result still sets the floor, so the estimate
 * never reads lower than where the learner actually started — but the floor is
 * a starting point, not a permanent grant.
 */
export function estimateProficiency(learner: LearnerState, now = Date.now()): ProficiencyEstimate {
  const floor = learner.placement ? levelIndex(learner.placement.level) : 0;
  let reached = 0;
  let blockedAt: Skill[] = [];

  for (let i = 0; i < CEFR_LEVELS.length; i += 1) {
    const evidence = levelEvidence(learner, CEFR_LEVELS[i], now);
    if (evidence.coverage < LEVEL_COVERAGE) break;

    const failing = gateFailures(evidence);
    if (failing.length > 0) {
      // The concepts are there; the evidence of using them is not. Stop here and
      // remember why, so the profile can say "A2+, held back by listening".
      blockedAt = failing;
      break;
    }
    reached = i;
  }

  const level = CEFR_LEVELS[Math.max(reached, floor)];
  // The "+" only means something when the block is above where we landed.
  const plus = blockedAt.length > 0 && levelIndex(level) === reached;
  const measured = levelEvidence(learner, level, now).strongCount >= SKILL_GATE_MIN;

  return { level, plus, heldBackBy: plus ? blockedAt : [], measured };
}

/**
 * The single level, for callers that only need a label. Kept as the original
 * name because the whole app reads it.
 */
export function estimateLevel(learner: LearnerState, now = Date.now()): CefrLevel {
  return estimateProficiency(learner, now).level;
}

/**
 * How far through the *course* the learner has walked, which is a different
 * question from what they can do. A stage counts once every playable unit in it
 * is complete; the label is that stage's upper level.
 *
 * Keeping this apart from `estimateProficiency` is the whole point: finishing
 * the B1 stage and being a B1 speaker are separate claims, and the profile is
 * allowed — expected — to show them disagreeing.
 */
export function curriculumLevel(learner: LearnerState, now = Date.now()): CefrLevel | null {
  let highest: CefrLevel | null = null;
  for (const stage of curriculum) {
    if (stageProgress(stage, learner, now).state !== 'complete') break;
    highest = stage.to;
  }
  return highest;
}

/** Progress through the current level, for the home-screen "A1 — 64%" line. */
export function levelProgress(learner: LearnerState, now = Date.now()): { level: CefrLevel; progress: number } {
  const level = estimateLevel(learner, now);
  const levelConcepts = allConcepts.filter((c) => c.level === level);
  if (levelConcepts.length === 0) return { level, progress: 0 };

  const total = levelConcepts.reduce((sum, concept) => {
    const state = learner.concepts[concept.id];
    return sum + (state ? mastery(state, now) : 0);
  }, 0);

  return { level, progress: total / levelConcepts.length };
}

/**
 * Where a unit sits in its own life, which is a different question from how
 * many of its lessons are ticked.
 *
 * "Complete" was doing two jobs — the lessons are finished, and there is
 * nothing left to do here — and only the first was ever true. These name the
 * five stages the course actually puts a unit through, so a screen can say
 * "you have covered this, now make it stick" instead of showing a tick and an
 * unexplained 22%.
 *
 *   • **learning** — new material is still arriving.
 *   • **practising** — lessons done, but most of it has only been recognised.
 *   • **strengthening** — met and retrieved, not yet reliable.
 *   • **maintaining** — solid; it comes back through spaced review, not here.
 */
export type UnitPhase = 'learning' | 'practising' | 'strengthening' | 'maintaining';

export type UnitState =
  /** Not written yet — curriculum outline only. */
  | 'planned'
  /**
   * Ahead of the learner's position on the path.
   *
   * A **soft** lock. The unit is dimmed and visibly off the recommended route,
   * but it opens, and its lessons can be played. Finishing one is how the
   * learner says "I already know what came before" — see
   * `learning/progression.ts`. The name is kept because the visual language is
   * unchanged; what changed is that it no longer refuses.
   */
  | 'locked'
  /** On the path, nothing started. */
  | 'available'
  /** Started but not finished. */
  | 'current'
  /** Every required lesson finished. */
  | 'complete';

export interface UnitProgress {
  unit: Unit;
  state: UnitState;
  lessonsDone: number;
  lessonCount: number;
  /** 0..1 through the unit's lessons. */
  progress: number;
  /** 0..1 average mastery of the unit's concepts — decays over time. */
  mastery: number;
  /** True when the unit is complete but its concepts have decayed. */
  needsReview: boolean;
  /**
   * The stage of the unit's lifecycle, for screens that need to say what to do
   * next rather than only how far through it the learner is.
   */
  phase: UnitPhase;
  conceptIds: string[];
  /** Lesson ids already finished — lessons need not be done in order. */
  completedLessonIds: string[];
  /** The lesson to open when the learner taps Continue / Start. */
  nextLesson: Lesson | null;
  /**
   * Optional practice, offered once the unit is complete.
   *
   * Deliberately **not** part of any progress figure. This used to be `arc`,
   * and its step counter was what the Learn page rendered as the unit's
   * progress — so a unit with every lesson ticked read `2/5`. Lessons are
   * progression; practice is optional mastery; they never share a number.
   * See `learning/unit-practice.ts`.
   */
  practice: UnitPractice;
}

/**
 * Course progression and knowledge mastery are different things: a unit can be
 * complete and still have decayed. `needsReview` is what surfaces that on the
 * path without forcing a repeat of the original lesson.
 */
/** Above this a unit looks after itself through spaced review. */
const MAINTENANCE_MASTERY = 0.8;
/** Above this the material is known and the work is making it reliable. */
const PRACTISED_MASTERY = 0.55;

export function unitProgress(unit: Unit, learner: LearnerState, now = Date.now()): UnitProgress {
  const conceptIds = getUnitConcepts(unit);
  const states = conceptIds
    .map((id) => learner.concepts[id])
    .filter((state): state is ConceptState => !!state && state.timesSeen > 0);

  const value = averageMastery(states, now);
  // Completion is measured against the required lessons only. A story left
  // unplayed should not hold a unit at 4/5 forever, but it still shows in the
  // list and still feeds mastery.
  // A unit built entirely of enrichment (a standalone conversation, say) is
  // itself the optional thing — measure it against all of its lessons, or it
  // would report complete before it had been opened.
  const nonOptional = unit.lessons.filter(isRequired);
  const required = nonOptional.length > 0 ? nonOptional : unit.lessons;
  const lessonCount = required.length;
  const completedLessonIds = unit.lessons
    .filter((lesson) => learner.completedLessons[lesson.id])
    .map((lesson) => lesson.id);
  const lessonsDone = required.filter((lesson) => learner.completedLessons[lesson.id]).length;
  /**
   * The next thing to play here, required first.
   *
   * Required before optional, so opening a half-finished unit offers the next
   * step on the spine rather than a story that happens to sit earlier in the
   * list. Optional lessons are still reachable — they are listed — they just
   * never present themselves as the way forward.
   */
  const nextLesson =
    required.find((lesson) => !learner.completedLessons[lesson.id]) ??
    unit.lessons.find((lesson) => !learner.completedLessons[lesson.id]) ??
    null;

  /**
   * Whether this unit sits on the learner's path or ahead of it.
   *
   * `locked` is now a soft state: it dims the unit and marks it as ahead, and
   * the unit still opens. A unit is on the path once anything in it has been
   * started, or once the course's own Continue target lands inside it.
   */
  const target = continueTarget(learner);
  const onPath = target ? unit.lessons.some((lesson) => lesson.id === target.id) : false;

  let state: UnitState;
  if (unit.status === 'planned' || unit.lessons.length === 0) state = 'planned';
  else if (lessonCount > 0 && lessonsDone === lessonCount) state = 'complete';
  else if (lessonsDone > 0 || completedLessonIds.length > 0) state = 'current';
  else if (onPath) state = 'available';
  else state = 'locked';

  /**
   * The unit's *revision* standing, which is a different question from whether
   * it is complete and is never allowed to answer that one.
   *
   * Read off mastery, so finishing the lessons moves a unit out of `learning`
   * and no further — what happens after that is practice's business.
   */
  const practice = unitPractice(unit, learner, now);

  let phase: UnitPhase;
  if (state !== 'complete') phase = 'learning';
  // A complete unit still holding material the learner has never been shown has
  // more to introduce, however solid the part they have met looks. Lessons
  // introduce at most `MAX_NEW_PER_SESSION` concepts a sitting, so a large unit
  // legitimately has some left after its lessons are ticked.
  else if (getUnitTaughtConcepts(unit).some((id) => !learner.concepts[id]?.introduced))
    phase = 'practising';
  else if (value >= MAINTENANCE_MASTERY) phase = 'maintaining';
  else if (value >= PRACTISED_MASTERY) phase = 'strengthening';
  else phase = 'practising';

  return {
    unit,
    state,
    lessonsDone,
    lessonCount,
    progress: lessonCount > 0 ? lessonsDone / lessonCount : 0,
    mastery: value,
    phase,
    // Only meaningful once the unit is done and there is something to measure.
    needsReview: state === 'complete' && states.length >= 3 && value < 0.75,
    conceptIds,
    completedLessonIds,
    nextLesson,
    practice,
  };
}

/**
 * What a unit still needs, and what practising it would cost.
 *
 * "Complete" and "learned" are different claims — the unit screen has said so
 * for a while, and the mastery figure beside it was the evidence. It was also
 * inert: a number telling the learner their unit sits at 22% and offering
 * nothing to do about it is a diagnosis with no treatment. This is the queue
 * behind that number, ordered the way a revision session should be.
 *
 * Ordering, most urgent first:
 *
 *   1. concepts behind an unresolved mistake — the learner already knows these
 *      are broken;
 *   2. concepts introduced but never actually retrieved (`timesSeen < 2`), the
 *      ones a single lesson pass leaves stranded;
 *   3. concepts that are due, weakest first;
 *   4. concepts never answered in a demanding kind — recognised, never produced;
 *   5. everything else, weakest first, so a full pass is still varied.
 */
export interface UnitStrengthPlan {
  unit: Unit;
  /** Concepts to practise, most urgent first. */
  conceptIds: string[];
  /** Met, but not yet retrieved with any confidence. */
  developing: string[];
  /** Met and decayed or failing. */
  weak: string[];
  /** Recognised but never produced. */
  unproduced: string[];
  /** Solid enough to be left alone. */
  strong: string[];
  /** Introduced concepts behind an unresolved mistake. */
  mistaken: string[];
  /** Concepts the unit covers that the learner has never met. */
  unseen: string[];
  /** Rough minutes for a session that works through the queue. */
  estimatedMinutes: number;
}

/** Exercise kinds that count as having produced or retrieved a concept, not merely recognised it. */
const PRODUCED_KINDS: readonly ExerciseKind[] = [
  'translateToEs',
  'dictation',
  'conversation',
  'buildResponse',
  'speak',
  'correctMistake',
];

/** Below this, a concept has decayed far enough to be worth revisiting. */
const STRENGTHEN_THRESHOLD = 0.78;

/** How long one exercise takes, in seconds — the basis of the estimate. */
const SECONDS_PER_EXERCISE = 18;

export function unitStrengthPlan(
  unit: Unit,
  learner: LearnerState,
  now = Date.now(),
): UnitStrengthPlan {
  const conceptIds = getUnitConcepts(unit);
  /**
   * "Still to meet" means what the unit *teaches* and has not shown yet — not
   * every word its sentences happen to contain. Those arrive in their own
   * lessons later, and listing them here would make every unit look unfinished
   * for ever.
   */
  const taught = new Set(getUnitTaughtConcepts(unit));

  const unresolved = new Set(
    learner.mistakes.filter((m) => !m.resolvedAt).flatMap((m) => m.conceptIds),
  );

  const mistaken: string[] = [];
  const developing: string[] = [];
  const weak: string[] = [];
  const unproduced: string[] = [];
  const strong: string[] = [];
  const unseen: string[] = [];

  for (const id of conceptIds) {
    const state = learner.concepts[id];
    /**
     * "Still to meet" means never shown — not merely never answered.
     *
     * Before `introduce` stopped touching `timesSeen`, a concept whose card had
     * been displayed looked practised here and left this bucket. Now the two
     * are distinguishable, and an introduced-but-never-retrieved concept is the
     * most urgent kind of *developing*: the learner has been shown it and has
     * never once had to remember it.
     */
    if (!hasEncountered(state)) {
      if (taught.has(id)) unseen.push(id);
      continue;
    }
    if (unresolved.has(id)) mistaken.push(id);

    const value = state ? mastery(state, now) : 0;
    const produced = !!state?.kinds.some((kind) => PRODUCED_KINDS.includes(kind));

    if (!state || state.timesSeen < 2) developing.push(id);
    else if (value < 0.5 || state.dueAt <= now) weak.push(id);
    else if (!produced) unproduced.push(id);
    else if (value < STRENGTHEN_THRESHOLD) weak.push(id);
    else strong.push(id);
  }

  const byWeakest = (a: string, b: string) => {
    const stateA = learner.concepts[a];
    const stateB = learner.concepts[b];
    return (stateA ? mastery(stateA, now) : 0) - (stateB ? mastery(stateB, now) : 0);
  };

  const queue = [
    ...mistaken.slice().sort(byWeakest),
    ...developing.slice().sort(byWeakest),
    ...weak.slice().sort(byWeakest),
    ...unproduced.slice().sort(byWeakest),
    ...strong.slice().sort(byWeakest),
  ];
  const ordered = [...new Set(queue)];

  /**
   * The estimate covers the part of the queue a session would actually reach,
   * not the whole unit — quoting eighteen minutes for a session that runs for
   * six is the kind of number that teaches the learner to ignore numbers.
   */
  const workable = Math.min(ordered.length, SESSION_CAP);
  const estimatedMinutes = Math.max(1, Math.round((workable * SECONDS_PER_EXERCISE) / 60));

  return {
    unit,
    conceptIds: ordered,
    developing,
    weak,
    unproduced,
    strong,
    mistaken,
    unseen,
    estimatedMinutes,
  };
}

/** The longest a strengthen session runs — it is a revisit, not a re-do. */
export const SESSION_CAP = 16;

export interface StageProgress {
  stage: Stage;
  unitsDone: number;
  /** Playable units only — outline units are not counted as achievable. */
  unitCount: number;
  plannedCount: number;
  progress: number;
  mastery: number;
  state: 'complete' | 'current' | 'locked' | 'planned';
  units: UnitProgress[];
}

export function stageProgress(stage: Stage, learner: LearnerState, now = Date.now()): StageProgress {
  const units = stage.units.map((unit) => unitProgress(unit, learner, now));
  const playable = units.filter((entry) => entry.state !== 'planned');
  const unitsDone = playable.filter((entry) => entry.state === 'complete').length;

  const conceptIds = [...new Set(units.flatMap((entry) => entry.conceptIds))];
  const states = conceptIds
    .map((id) => learner.concepts[id])
    .filter((state): state is ConceptState => !!state && state.timesSeen > 0);

  let state: StageProgress['state'];
  if (playable.length === 0) state = 'planned';
  else if (unitsDone === playable.length) state = 'complete';
  else if (units.some((entry) => entry.state === 'current' || entry.state === 'available'))
    state = 'current';
  else state = 'locked';

  return {
    stage,
    unitsDone,
    unitCount: playable.length,
    plannedCount: units.length - playable.length,
    progress: playable.length > 0 ? unitsDone / playable.length : 0,
    mastery: averageMastery(states, now),
    state,
    units,
  };
}

/** The whole course, stage by stage — what the Learn page renders. */
export function courseProgress(learner: LearnerState, now = Date.now()): StageProgress[] {
  return curriculum.map((stage) => stageProgress(stage, learner, now));
}

/** Groups repeated mistakes so the notebook can say "you often confuse X". */
export interface MistakePattern {
  conceptId: string;
  label: string;
  count: number;
}

export function mistakePatterns(learner: LearnerState, limit = 5): MistakePattern[] {
  const counts = new Map<string, number>();
  for (const mistake of learner.mistakes) {
    if (mistake.resolvedAt) continue;
    for (const conceptId of mistake.conceptIds) {
      counts.set(conceptId, (counts.get(conceptId) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([conceptId, count]) => {
      const concept = getConcept(conceptId);
      const grammar = getGrammar(conceptId);
      return {
        conceptId,
        label: grammar?.title ?? (concept ? conceptLabel(concept) : conceptId),
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
