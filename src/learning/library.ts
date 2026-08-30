import { conceptOrigin, curriculum, levelIndex, verbConceptIds, verbOrigin } from '@/content';
import type { CefrLevel, Stage, Unit } from '@/content/types';
import { hasEncountered } from '@/learning/mastery';
import { mastery, masteryBand, type MasteryBand } from '@/learning/srs';
import type { ConceptState, LearnerState } from '@/learning/types';

/**
 * Browsing the Library once it is too big to scroll.
 *
 * 652 vocabulary entries, 100-odd verbs and every grammar rule in the course is
 * past the point where a flat list is a tool. The most useful axis is not the
 * alphabet and not mastery — it is **where the learner met the thing**, because
 * that is how they remember it ("the words from the café unit"). So the default
 * grouping walks the curriculum: section, then unit, in the order they were
 * taught.
 *
 * Pure, so the grouping is testable without mounting a screen. The Library
 * screen renders what this returns and decides nothing itself.
 */

export type LibraryGrouping = 'course' | 'progress' | 'alphabetical';

export type LibraryFilter =
  | 'all'
  /** Met and retrieved at least once — the learner has actually used it. */
  | 'learned'
  /** Learned within the recency window. */
  | 'recent'
  /** The course has not shown it yet. */
  | 'unmet'
  | 'favourites'
  | 'expressions'
  | 'spain'
  | MasteryBand;

/** How far back "recently learned" reaches. Two weeks is one revision cycle. */
export const RECENT_WINDOW_DAYS = 14;

const DAY_MS = 86_400_000;

export interface LibraryUnitGroup {
  unit: Unit;
  ids: string[];
  /** Concepts here the learner has met. */
  met: number;
}

export interface LibraryStageGroup {
  stage: Stage;
  units: LibraryUnitGroup[];
  ids: string[];
  met: number;
  total: number;
}

/**
 * Whether a concept passes a filter.
 *
 * `learned` deliberately means *retrieved*, not *shown*. The distinction is the
 * codebase's own — `hasEncountered` covers "the course has displayed this",
 * `timesSeen > 0` covers "the learner produced it from memory" — and a Library
 * filter called "Learned" that included cards the learner had merely been shown
 * would be the same overstatement the mastery figures are careful to avoid.
 * That also makes it correct for a unit completed by skipping ahead: those
 * concepts are introduced, so they appear in the Library and in `all`, and they
 * do not claim to have been learned.
 */
export function passesFilter(
  filter: LibraryFilter,
  input: {
    id: string;
    state: ConceptState | undefined;
    learner: LearnerState;
    now: number;
    isExpression?: boolean;
    spainOnly?: boolean;
  },
): boolean {
  const { state, learner, now } = input;
  switch (filter) {
    case 'all':
      return true;
    case 'learned':
      return !!state && state.timesSeen > 0;
    case 'recent':
      return (
        !!state && state.timesSeen > 0 && now - state.firstSeen <= RECENT_WINDOW_DAYS * DAY_MS
      );
    case 'unmet':
      return !hasEncountered(state);
    case 'favourites':
      return learner.favourites.includes(input.id);
    case 'expressions':
      return !!input.isExpression;
    case 'spain':
      return !!input.spainOnly;
    default:
      return masteryBand(state, now) === filter;
  }
}

/**
 * Groups ids by the stage and unit that taught them, in curriculum order.
 *
 * Anything the course never explicitly teaches — a derived verb paradigm no
 * lesson was ever given, say — has no origin and is returned separately rather
 * than being filed under a unit it does not belong to. That set is exactly what
 * `audit:content` warns about, so hiding it here would be covering for a
 * content gap with a UI decision.
 */
export function groupByCourse(ids: string[], forVerbs = false): {
  stages: LibraryStageGroup[];
  ungrouped: string[];
} {
  const origin = (id: string) => (forVerbs ? verbOrigin(id) : conceptOrigin(id));

  const byUnit = new Map<string, string[]>();
  const ungrouped: string[] = [];
  for (const id of ids) {
    const where = origin(id);
    if (!where) {
      ungrouped.push(id);
      continue;
    }
    const list = byUnit.get(where.unit.id);
    if (list) list.push(id);
    else byUnit.set(where.unit.id, [id]);
  }

  // Walk the curriculum rather than the map, so the output is in course order
  // by construction instead of by a sort that has to be kept in step with it.
  const stages: LibraryStageGroup[] = [];
  for (const stage of curriculum) {
    const units: LibraryUnitGroup[] = [];
    for (const unit of stage.units) {
      const unitIds = byUnit.get(unit.id);
      if (!unitIds || unitIds.length === 0) continue;
      units.push({ unit, ids: unitIds, met: 0 });
    }
    if (units.length === 0) continue;
    const stageIds = units.flatMap((group) => group.ids);
    stages.push({ stage, units, ids: stageIds, met: 0, total: stageIds.length });
  }

  return { stages, ungrouped };
}

/**
 * Fills in the `met` counts a grouping needs to show progress per section.
 *
 * `forVerbs` has to be passed the same way `groupByCourse` takes it, because a
 * verb entry's id is a verb id and not a concept id: a verb is met when any of
 * the concepts behind it has been. Asking `learner.concepts[verbId]` instead is
 * a lookup that cannot ever hit, so it does not fail loudly — it silently
 * reports every verb section as `0 / n`, which is exactly what it did.
 */
export function countMet(
  groups: { stages: LibraryStageGroup[]; ungrouped: string[] },
  learner: LearnerState,
  forVerbs = false,
): { stages: LibraryStageGroup[]; ungrouped: string[] } {
  const met = (id: string) =>
    forVerbs
      ? verbConceptIds(id).some((conceptId) => hasEncountered(learner.concepts[conceptId]))
      : hasEncountered(learner.concepts[id]);
  return {
    ungrouped: groups.ungrouped,
    stages: groups.stages.map((stage) => {
      const units = stage.units.map((unit) => ({
        ...unit,
        met: unit.ids.filter(met).length,
      }));
      return {
        ...stage,
        units,
        met: units.reduce((sum, unit) => sum + unit.met, 0),
      };
    }),
  };
}

/**
 * The stage a learner is currently working in, so the Library can open there.
 *
 * A Library that opens fully collapsed makes the learner hunt for their own
 * position every time; one that opens fully expanded is the flat list this
 * grouping exists to replace.
 */
export function currentStageId(groups: LibraryStageGroup[]): string | null {
  const partial = groups.find((stage) => stage.met > 0 && stage.met < stage.total);
  if (partial) return partial.stage.id;
  const started = [...groups].reverse().find((stage) => stage.met > 0);
  return started?.stage.id ?? groups[0]?.stage.id ?? null;
}

/** Ordering within a group: weakest-known first is useless for browsing; course order is not. */
export function sortForGrouping(
  ids: string[],
  grouping: LibraryGrouping,
  input: {
    learner: LearnerState;
    now: number;
    label: (id: string) => string;
    order: (id: string) => number;
    level: (id: string) => CefrLevel;
  },
): string[] {
  const { learner, now, label, order, level } = input;
  const copy = [...ids];

  if (grouping === 'alphabetical') {
    return copy.sort((a, b) => label(a).localeCompare(label(b), 'es'));
  }

  if (grouping === 'progress') {
    /**
     * Met first, then by how well it is known — which is the order a revision
     * session would want, and the behaviour the Library had before grouping
     * existed. Kept as an option rather than dropped, because "what am I worst
     * at?" is a real question this list can answer.
     */
    return copy.sort((a, b) => {
      const stateA = learner.concepts[a];
      const stateB = learner.concepts[b];
      const seenA = stateA && stateA.timesSeen > 0 ? 1 : 0;
      const seenB = stateB && stateB.timesSeen > 0 ? 1 : 0;
      if (seenA !== seenB) return seenB - seenA;
      if (seenA === 1) {
        const diff = mastery(stateA!, now) - mastery(stateB!, now);
        if (Math.abs(diff) > 0.001) return diff;
      }
      return label(a).localeCompare(label(b), 'es');
    });
  }

  return copy.sort((a, b) => {
    const diff = order(a) - order(b);
    if (diff !== 0) return diff;
    const byLevel = levelIndex(level(a)) - levelIndex(level(b));
    if (byLevel !== 0) return byLevel;
    return label(a).localeCompare(label(b), 'es');
  });
}

/**
 * The unit inside a section the learner is currently working in.
 *
 * Same shape as `currentStageId` one level down, and for the same reason: a
 * section that opens showing only unit headers is browsable, but it has also
 * lost the learner's own position. Opening the unit they are in gives back the
 * "you are here" the flat list had for free.
 */
export function currentUnitId(stage: LibraryStageGroup): string | null {
  const partial = stage.units.find((unit) => unit.met > 0 && unit.met < unit.ids.length);
  if (partial) return partial.unit.id;
  const started = [...stage.units].reverse().find((unit) => unit.met > 0);
  return started?.unit.id ?? stage.units[0]?.unit.id ?? null;
}

/**
 * Below this many entries, a whole section is short enough to show at once and
 * unit dropdowns are friction rather than structure.
 *
 * The number matters because the filters make section size vary by two orders
 * of magnitude. "Foundations" holds 401 words unfiltered — which is what made
 * an expanded section 30,000 pixels tall and pushed every later section past
 * the end of the scroll, the bug this collapsing exists to fix — and three
 * under "★ Favourites". Collapsing the second case would present a section
 * that is already the size of a glance as a row of closed folders.
 */
export const UNITS_OPEN_BELOW = 40;

/**
 * Whether a unit starts open, before the learner has touched anything.
 *
 * Pure and here rather than in the screen for the usual reason: it is a policy
 * decision about what the learner should see, and the Library screen renders
 * what this decides instead of deciding it inline.
 */
export function defaultUnitOpen(
  stage: LibraryStageGroup,
  unitId: string,
  isCurrentStage: boolean,
): boolean {
  if (stage.total <= UNITS_OPEN_BELOW) return true;
  return isCurrentStage && unitId === currentUnitId(stage);
}
