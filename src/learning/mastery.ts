import {
  allConcepts,
  conceptLabel,
  curriculum,
  getConcept,
  getGrammar,
  getUnitConcepts,
  isGrammarConcept,
  isVocabConcept,
  levelIndex,
} from '@/content';
import {
  CEFR_LEVELS,
  TOPIC_LABELS,
  type CefrLevel,
  type Lesson,
  type Stage,
  type TopicId,
  type Unit,
} from '@/content/types';
import { isLessonUnlocked } from '@/learning/session';
import { mastery, masteryBand, retrievability, urgency } from '@/learning/srs';
import type { ConceptState, LearnerState, Skill } from '@/learning/types';

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

/** Concepts due for review right now, most urgent first. */
export function dueConcepts(learner: LearnerState, now = Date.now()): ConceptState[] {
  return conceptStates(learner)
    .filter((state) => state.timesSeen > 0 && state.dueAt <= now)
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
  weak: number;
  strong: number;
  mastered: number;
  total: number;
}

export function vocabCounts(learner: LearnerState, now = Date.now()): VocabCounts {
  const counts: VocabCounts = { new: 0, learning: 0, weak: 0, strong: 0, mastered: 0, total: 0 };
  for (const concept of allConcepts) {
    if (!isVocabConcept(concept)) continue;
    counts.total += 1;
    counts[masteryBand(learner.concepts[concept.id], now)] += 1;
  }
  return counts;
}

/** Words the learner has actually met (any exposure). */
export function wordsLearned(learner: LearnerState): number {
  return Object.values(learner.concepts).filter((state) => {
    const concept = getConcept(state.id);
    return concept ? isVocabConcept(concept) && state.timesSeen > 0 : false;
  }).length;
}

export function wordsMastered(learner: LearnerState, now = Date.now()): number {
  return Object.values(learner.concepts).filter((state) => {
    const concept = getConcept(state.id);
    return concept ? isVocabConcept(concept) && mastery(state, now) >= 0.8 : false;
  }).length;
}

/**
 * Running CEFR estimate. A level counts as reached once most of its concepts
 * are at least "strong" — a placement result sets the floor so the estimate
 * never reads lower than where the learner actually started.
 */
export function estimateLevel(learner: LearnerState, now = Date.now()): CefrLevel {
  const floor = learner.placement ? levelIndex(learner.placement.level) : 0;
  let reached = 0;

  for (let i = 0; i < CEFR_LEVELS.length; i += 1) {
    const level = CEFR_LEVELS[i];
    const levelConcepts = allConcepts.filter((c) => c.level === level);
    if (levelConcepts.length === 0) continue;

    const strong = levelConcepts.filter((c) => {
      const state = learner.concepts[c.id];
      return state ? mastery(state, now) >= 0.7 : false;
    }).length;

    if (strong / levelConcepts.length >= 0.6) reached = i;
    else break;
  }

  return CEFR_LEVELS[Math.max(reached, floor)];
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

export type UnitState =
  /** Not written yet — curriculum outline only. */
  | 'planned'
  /** Prerequisites unmet. */
  | 'locked'
  /** Unlocked, nothing started. */
  | 'available'
  /** Started but not finished. */
  | 'current'
  /** Every lesson finished. */
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
  conceptIds: string[];
  /** Lesson ids already finished — lessons need not be done in order. */
  completedLessonIds: string[];
  /** The lesson to open when the learner taps Continue / Start. */
  nextLesson: Lesson | null;
}

/**
 * Course progression and knowledge mastery are different things: a unit can be
 * complete and still have decayed. `needsReview` is what surfaces that on the
 * path without forcing a repeat of the original lesson.
 */
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
  const nonOptional = unit.lessons.filter((lesson) => !lesson.optional);
  const required = nonOptional.length > 0 ? nonOptional : unit.lessons;
  const lessonCount = required.length;
  const completedLessonIds = unit.lessons
    .filter((lesson) => learner.completedLessons[lesson.id])
    .map((lesson) => lesson.id);
  const lessonsDone = required.filter((lesson) => learner.completedLessons[lesson.id]).length;
  const nextLesson = unit.lessons.find((lesson) => !learner.completedLessons[lesson.id]) ?? null;
  const unlocked = unit.lessons.some((lesson) => isLessonUnlocked(lesson, learner));

  let state: UnitState;
  if (unit.status === 'planned' || unit.lessons.length === 0) state = 'planned';
  else if (lessonsDone === lessonCount) state = 'complete';
  else if (!unlocked) state = 'locked';
  else if (lessonsDone > 0) state = 'current';
  else state = 'available';

  return {
    unit,
    state,
    lessonsDone,
    lessonCount,
    progress: lessonCount > 0 ? lessonsDone / lessonCount : 0,
    mastery: value,
    // Only meaningful once the unit is done and there is something to measure.
    needsReview: state === 'complete' && states.length >= 3 && value < 0.75,
    conceptIds,
    completedLessonIds,
    nextLesson,
  };
}

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
