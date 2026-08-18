import { conceptLabel, getConcept, levelIndex } from '@/content';
import type { CefrLevel } from '@/content/types';
import type { Exercise } from '@/learning/exercise';
import { atRiskConcepts, estimateLevel, skillBalance } from '@/learning/mastery';
import { DAY_MS, isDue, mastery, retrievability, urgency } from '@/learning/srs';
import {
  KIND_DIFFICULTY,
  KIND_LABELS,
  KIND_SKILL,
  type ConceptState,
  type LearnerState,
} from '@/learning/types';

/**
 * "Why am I seeing this?"
 *
 * The adaptive layer is now four systems deep — spaced repetition picks the
 * concept, the mistake notebook and the weak-area report jump the queue, the
 * per-skill balance nudges the difficulty, and the demonstrated CEFR level moves
 * whole tiers of exercise kind. Each is tested. The thing none of them can tell
 * you, once they are stacked, is why *this* card is on screen right now.
 *
 * That matters for dogfooding specifically. When a review feels wrong, the
 * useful question is not "is it wrong" but "which layer is wrong" — mastery,
 * scheduling, ranking, content, or skill adaptation. Every field below is read
 * from a signal the scheduler actually used; nothing here is computed for
 * display, because a diagnostic that invents its own numbers can agree with
 * itself while the system disagrees with both.
 */

export type QueueReason =
  | 'mistake'
  | 'overdue'
  | 'at-risk'
  | 'new'
  | 'weak-skill'
  | 'not-due';

export interface ConceptExplanation {
  conceptId: string;
  label: string;
  /** The concept's own CEFR level — where in the course this is spiralling from. */
  level: CefrLevel | null;
  masteryPct: number;
  /** Predicted chance of recall right now, 0..1. */
  retrievability: number;
  /** Days until review threshold, the SRS's own unit. */
  stability: number;
  ease: number;
  timesSeen: number;
  lapses: number;
  lastReviewedDaysAgo: number | null;
  dueInDays: number | null;
  due: boolean;
  urgency: number;
  reasons: QueueReason[];
}

export interface ExerciseExplanation {
  exerciseId: string;
  kind: string;
  kindLabel: string;
  difficulty: number;
  skill: string;
  /** How that skill sits against this learner's own average. */
  skillStanding: 'lagging' | 'leading' | 'even' | 'not enough evidence';
  /** The level driving `candidateKinds` — demonstrated, not curriculum. */
  demonstratedLevel: CefrLevel;
  concepts: ConceptExplanation[];
  /** Plain sentences, in the order they carry weight. */
  notes: string[];
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Why one concept is in the queue.
 *
 * The reasons mirror `buildSmartReview`'s five lists in the order it
 * concatenates them, so a concept reported as `mistake` really is the one that
 * jumped the queue rather than merely being eligible for it.
 */
export function explainConcept(
  conceptId: string,
  learner: LearnerState,
  now = Date.now(),
): ConceptExplanation {
  const state: ConceptState | undefined = learner.concepts[conceptId];
  const concept = getConcept(conceptId);
  const reasons: QueueReason[] = [];

  const openMistake = learner.mistakes.some(
    (m) => !m.resolvedAt && m.conceptIds.includes(conceptId),
  );
  if (openMistake) reasons.push('mistake');

  if (state) {
    if (isDue(state, now)) reasons.push('overdue');
    else reasons.push('not-due');
    if (state.timesSeen > 0 && state.timesSeen < 3) reasons.push('new');
    if (atRiskConcepts(learner, now, 20).some((s) => s.id === conceptId)) reasons.push('at-risk');
  } else {
    reasons.push('new');
  }

  return {
    conceptId,
    label: concept ? conceptLabel(concept) : conceptId,
    level: concept?.level ?? null,
    masteryPct: state ? Math.round(mastery(state, now) * 100) : 0,
    retrievability: state ? round(retrievability(state, now), 3) : 0,
    stability: state ? round(state.stability) : 0,
    ease: state ? round(state.ease) : 0,
    timesSeen: state?.timesSeen ?? 0,
    lapses: state?.lapses ?? 0,
    lastReviewedDaysAgo: state ? round((now - state.lastReviewed) / DAY_MS, 1) : null,
    dueInDays: state ? round((state.dueAt - now) / DAY_MS, 1) : null,
    due: state ? isDue(state, now) : true,
    urgency: state ? round(urgency(state, now), 3) : 1,
    reasons,
  };
}

/**
 * Why this exercise, in this form, for these concepts.
 *
 * `skillStanding` is the one worth reading first: it is the signal that decides
 * whether a demanding kind steps forward or back, and it is silent until a skill
 * has eight concepts behind it — so "not enough evidence" is a real answer and
 * not a missing one.
 */
export function explainExercise(
  exercise: Exercise,
  learner: LearnerState,
  now = Date.now(),
): ExerciseExplanation {
  const skill = KIND_SKILL[exercise.kind];
  const balance = skillBalance(learner, now);
  const level = estimateLevel(learner, now);

  const standing: ExerciseExplanation['skillStanding'] = !skill
    ? 'not enough evidence'
    : balance.lagging.includes(skill)
      ? 'lagging'
      : balance.leading.includes(skill)
        ? 'leading'
        : 'even';

  const concepts = exercise.conceptIds.map((id) => explainConcept(id, learner, now));
  const notes: string[] = [];

  const jumped = concepts.filter((c) => c.reasons.includes('mistake'));
  if (jumped.length > 0) {
    notes.push(`Jumped the queue: an unresolved mistake on ${jumped.map((c) => c.label).join(', ')}.`);
  }
  const overdue = concepts.filter((c) => c.due && c.timesSeen > 0);
  if (overdue.length > 0) {
    const worst = overdue.reduce((a, b) => (a.retrievability <= b.retrievability ? a : b));
    notes.push(
      `Overdue: ${worst.label} is ${Math.round(worst.retrievability * 100)}% likely to be recalled, below the 90% threshold.`,
    );
  }
  const fresh = concepts.filter((c) => c.reasons.includes('new'));
  if (fresh.length > 0) {
    notes.push(`Still new: ${fresh.map((c) => c.label).join(', ')} seen fewer than three times.`);
  }
  if (skill && standing === 'lagging') {
    notes.push(
      `${skill} is lagging your own average, so gentler kinds in it come forward and difficulty-4+ kinds step back.`,
    );
  }
  if (skill && standing === 'leading') {
    notes.push(`${skill} is ahead of your own average, so the demanding kinds in it come first.`);
  }
  if (levelIndex(level) >= levelIndex('B2')) {
    notes.push(
      `At ${level} the tiers shift up and plain recognition is demoted to the tail of the list.`,
    );
  }
  const spiral = concepts.filter((c) => c.level && levelIndex(c.level) < levelIndex(level));
  if (spiral.length > 0) {
    notes.push(
      `Spiralled from ${spiral.map((c) => c.level).join(', ')} — below your demonstrated ${level}.`,
    );
  }
  if (notes.length === 0) {
    notes.push('Filling out the session: nothing was urgent, so this is ordinary spaced practice.');
  }

  return {
    exerciseId: exercise.id,
    kind: exercise.kind,
    kindLabel: KIND_LABELS[exercise.kind],
    difficulty: KIND_DIFFICULTY[exercise.kind],
    skill: skill ?? 'none',
    skillStanding: standing,
    demonstratedLevel: level,
    concepts,
    notes,
  };
}

/** The explanation as the flat block of text a bug report can carry. */
export function formatExplanation(explanation: ExerciseExplanation): string {
  const lines: string[] = [
    `Exercise:    ${explanation.kindLabel} (${explanation.kind}, difficulty ${explanation.difficulty})`,
    `Skill:       ${explanation.skill} — ${explanation.skillStanding}`,
    `Level used:  ${explanation.demonstratedLevel} (demonstrated)`,
  ];
  for (const concept of explanation.concepts) {
    lines.push(
      '',
      `Concept:     ${concept.label} [${concept.conceptId}]${concept.level ? ` · ${concept.level}` : ''}`,
      `Mastery:     ${concept.masteryPct}%   recall ${Math.round(concept.retrievability * 100)}%`,
      `Stability:   ${concept.stability}d   ease ${concept.ease}   seen ${concept.timesSeen}×   lapses ${concept.lapses}`,
      `Reviewed:    ${concept.lastReviewedDaysAgo === null ? 'never' : `${concept.lastReviewedDaysAgo}d ago`}   due ${
        concept.dueInDays === null ? '—' : `${concept.dueInDays}d`
      }`,
      `Reasons:     ${concept.reasons.join(', ')}`,
    );
  }
  lines.push('', 'Why:', ...explanation.notes.map((note) => `  · ${note}`));
  return lines.join('\n');
}
