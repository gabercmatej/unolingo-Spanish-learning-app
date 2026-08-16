import { allLessons, getConcept, levelIndex } from '@/content';
import {
  AREA_LABELS,
  placementQuestions,
  type PlacementArea,
  type PlacementQuestion,
} from '@/content/placement';
import { CEFR_LEVELS, type CefrLevel } from '@/content/types';
import { createConceptState } from '@/learning/srs';
import type { ConceptState, LearnerState, PlacementResult } from '@/learning/types';

/**
 * Placement.
 *
 * The test is adaptive in the simplest way that works: it starts at A1 and
 * follows the learner up or down a level after each answer, so a strong learner
 * reaches B2 questions in four or five steps instead of grinding through A0.
 * Twelve questions is enough to place someone and name their weak spots — the
 * ongoing learner model refines the rest far better than a longer test would.
 */

/**
 * Long enough to actually place someone. Twelve questions could only ever find
 * a rough band; thirty, with a converging step size and enforced coverage of
 * every skill area, produces an estimate worth acting on — and a weakness
 * profile with more than one data point behind each claim.
 */
export const PLACEMENT_LENGTH = 30;

/** Below this many answers in an area, we don't claim it as a strength or weakness. */
const MIN_AREA_SAMPLES = 2;

export interface PlacementAnswer {
  question: PlacementQuestion;
  correct: boolean;
}

/**
 * Adaptive difficulty as a converging staircase.
 *
 * `ability` is a continuous position on the CEFR scale (0 = A0 … 6 = C2). Early
 * answers move it a long way so the test finds the right region fast; later
 * answers move it a little so it settles. That is far more accurate than a
 * fixed ±1 level, which oscillates forever and never converges.
 */
export function stepSize(answered: number, total: number = PLACEMENT_LENGTH): number {
  const progress = Math.min(1, answered / Math.max(1, total - 1));
  // 1.0 at the start, easing down to 0.2 by the end.
  return 1.0 - 0.8 * progress;
}

export function adjustAbility(ability: number, correct: boolean, answered: number): number {
  const step = stepSize(answered);
  // Wrong answers pull down slightly harder than right answers push up, which
  // keeps the estimate honest for a learner guessing multiple choice.
  const next = correct ? ability + step : ability - step * 1.25;
  return Math.max(0, Math.min(CEFR_LEVELS.length - 1, next));
}

/**
 * Picks the next question. Prefers the level nearest the current ability
 * estimate, but pulls in an under-sampled area when one is lagging, so the
 * result can say something about listening and production rather than only
 * about whatever the staircase happened to land on.
 */
export function nextPlacementQuestion(
  asked: string[],
  ability: number,
  answers: PlacementAnswer[] = [],
): PlacementQuestion | null {
  const available = placementQuestions.filter((q) => !asked.includes(q.id));
  if (available.length === 0) return null;

  const targetIdx = Math.round(ability);

  // Which areas have we barely touched?
  const counts = new Map<PlacementArea, number>();
  for (const answer of answers) {
    counts.set(answer.question.area, (counts.get(answer.question.area) ?? 0) + 1);
  }
  const areasSeen = [...counts.keys()];
  const starved = (['listening', 'vocabulary', 'present', 'past', 'serEstar'] as PlacementArea[]).filter(
    (area) => (counts.get(area) ?? 0) < MIN_AREA_SAMPLES,
  );

  // Score every remaining question: closeness to target level, plus a bonus for
  // an under-sampled area, so coverage never derails the difficulty estimate.
  const scored = available.map((question) => {
    const distance = Math.abs(levelIndex(question.level) - targetIdx);
    const starvedBonus = starved.includes(question.area) ? 1.5 : 0;
    const repeatPenalty = areasSeen.includes(question.area) ? 0.2 : 0;
    return { question, score: -distance + starvedBonus - repeatPenalty + Math.random() * 0.4 };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].question;
}

/** Back-compat shim for the level-index stepping used by older callers. */
export function adjustLevel(levelIdx: number, correct: boolean): number {
  const next = correct ? levelIdx + 1 : levelIdx - 1;
  return Math.max(0, Math.min(CEFR_LEVELS.length - 1, next));
}

export interface AreaScore {
  area: PlacementArea;
  label: string;
  accuracy: number;
  total: number;
}

export interface PlacementScore {
  level: CefrLevel;
  label: string;
  strengths: string[];
  weaknesses: string[];
  /** Per-area breakdown, for the result screen's detail. */
  areas: AreaScore[];
  correct: number;
  total: number;
}

/**
 * The estimate is the highest level the learner answered at least 60% of
 * correctly, with a "+" when they were comfortably above that bar.
 *
 * Only levels with a real sample count. With 30 questions there is usually
 * enough at each level to mean something; a single lucky answer at B2 should
 * never place someone at B2.
 */
export function scorePlacement(answers: PlacementAnswer[]): PlacementScore {
  const byLevel = new Map<number, { correct: number; total: number }>();
  const byArea = new Map<PlacementArea, { correct: number; total: number }>();

  for (const answer of answers) {
    const levelIdx = levelIndex(answer.question.level);
    const level = byLevel.get(levelIdx) ?? { correct: 0, total: 0 };
    level.total += 1;
    if (answer.correct) level.correct += 1;
    byLevel.set(levelIdx, level);

    const area = byArea.get(answer.question.area) ?? { correct: 0, total: 0 };
    area.total += 1;
    if (answer.correct) area.correct += 1;
    byArea.set(answer.question.area, area);
  }

  // A level needs at least two questions before it can be "reached", unless it
  // is the only evidence we have (very short tests in the fallback path).
  const minSample = answers.length >= 10 ? 2 : 1;

  let reached = 0;
  let reachedAccuracy = 0;
  for (let i = 0; i < CEFR_LEVELS.length; i += 1) {
    const stats = byLevel.get(i);
    if (!stats || stats.total < minSample) continue;
    const accuracy = stats.correct / stats.total;
    if (accuracy >= 0.6) {
      reached = i;
      reachedAccuracy = accuracy;
    }
  }

  const level = CEFR_LEVELS[reached];
  const label = reachedAccuracy >= 0.85 && reached < CEFR_LEVELS.length - 1 ? `${level}+` : level;

  const areas: AreaScore[] = [...byArea.entries()]
    .map(([area, stats]) => ({
      area,
      label: AREA_LABELS[area],
      accuracy: stats.correct / stats.total,
      total: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const sampled = areas.filter((entry) => entry.total >= MIN_AREA_SAMPLES);
  const strengths = sampled.filter((entry) => entry.accuracy >= 0.75).map((entry) => entry.label);
  const weaknesses = sampled.filter((entry) => entry.accuracy < 0.5).map((entry) => entry.label);

  return {
    level,
    label,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    areas,
    correct: answers.filter((answer) => answer.correct).length,
    total: answers.length,
  };
}

/**
 * Turns a placement result into a starting learner model.
 *
 * Everything below the estimated level is marked as already met, at a moderate
 * strength and due for review soon — so the app does not re-teach "hola", but
 * still checks it. Concepts in a weak area start lower and due immediately,
 * which is what makes the first Smart Review genuinely targeted.
 */
export function applyPlacement(
  learner: LearnerState,
  score: PlacementScore,
  answers: PlacementAnswer[],
  now: number = Date.now(),
): LearnerState {
  const targetIdx = levelIndex(score.level);
  const concepts: Record<string, ConceptState> = { ...learner.concepts };

  const weakConceptIds = new Set(
    answers.filter((a) => !a.correct).flatMap((a) => a.question.concepts),
  );
  const provenConceptIds = new Set(
    answers.filter((a) => a.correct).flatMap((a) => a.question.concepts),
  );

  /**
   * `dueInDays: 0` means "surface this in the very next review session".
   *
   * `introduced` is what decides whether the app still shows a teaching card.
   * A concept the learner demonstrably got wrong stays *un*-introduced, so it
   * gets taught properly rather than silently drilled — being placed at a level
   * is not evidence you have met every word below it.
   */
  const seed = (
    conceptId: string,
    strength: number,
    dueInDays: number,
    introduced: boolean,
  ) => {
    const concept = getConcept(conceptId);
    if (!concept) return;
    const existing = concepts[conceptId] ?? createConceptState(conceptId, now);
    concepts[conceptId] = {
      ...existing,
      introduced: existing.introduced || introduced,
      timesSeen: Math.max(existing.timesSeen, 1),
      strength: Math.max(existing.strength, strength),
      stability: Math.max(dueInDays, 0.02),
      depth: 2,
      lastReviewed: now,
      dueAt: now + dueInDays * 86_400_000,
    };
  };

  // Everything comfortably below the placement level counts as already met.
  for (const lesson of allLessons) {
    if (levelIndex(lesson.level) >= targetIdx) continue;
    for (const conceptId of [...lesson.teaches, ...(lesson.grammar ?? [])]) {
      if (weakConceptIds.has(conceptId)) continue;
      seed(conceptId, 0.55, 2.5, true);
    }
  }

  // Concepts the test actually proved get a stronger start.
  for (const conceptId of provenConceptIds) seed(conceptId, 0.65, 4, true);

  // Anything they got wrong starts shaky, due now, and still to be taught.
  for (const conceptId of weakConceptIds) seed(conceptId, 0.2, 0, false);

  // Lessons strictly below the placement level are marked done, so the path
  // opens at the right place instead of at "Hola".
  const completedLessons = { ...learner.completedLessons };
  let startLesson = allLessons[0]?.id ?? '';
  for (const lesson of allLessons) {
    if (levelIndex(lesson.level) < targetIdx) {
      completedLessons[lesson.id] = { at: now, accuracy: 0.8, times: 0 };
    } else {
      startLesson = startLesson === allLessons[0]?.id ? lesson.id : startLesson;
    }
  }
  // The first lesson at or above the placement level is where they begin.
  const firstOpen = allLessons.find((lesson) => !completedLessons[lesson.id]);
  if (firstOpen) startLesson = firstOpen.id;

  const placement: PlacementResult = {
    level: score.level,
    label: score.label,
    strengths: score.strengths,
    weaknesses: score.weaknesses,
    takenAt: now,
    startLesson,
  };

  return { ...learner, concepts, completedLessons, placement, onboarded: true };
}
