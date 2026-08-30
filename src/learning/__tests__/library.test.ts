import {
  conceptOrigin,
  curriculum,
  getLessonThatIntroduces,
  verbConceptIds,
  verbs,
  vocabConcepts,
} from '@/content';
import { makeLearner } from '@/learning/__tests__/helpers';
import {
  RECENT_WINDOW_DAYS,
  UNITS_OPEN_BELOW,
  countMet,
  currentStageId,
  currentUnitId,
  defaultUnitOpen,
  groupByCourse,
  passesFilter,
  sortForGrouping,
} from '@/learning/library';
import { createConceptState, introduce } from '@/learning/srs';
import type { ConceptState, LearnerState } from '@/learning/types';

/**
 * Browsing the Library once it is too big to scroll.
 *
 * The organising claim under test: entries are grouped by **where the learner
 * met them**, in curriculum order, and the filters distinguish *shown to me*
 * from *retrieved by me* — the same encountered-vs-retrieved line the mastery
 * figures draw, because a filter called "Learned" that counted teaching cards
 * would overstate exactly what the rest of the app is careful not to.
 */

const NOW = Date.UTC(2026, 1, 1);
const DAY = 86_400_000;

function retrieved(id: string, firstSeen = NOW - DAY): ConceptState {
  return {
    ...createConceptState(id, firstSeen),
    introduced: true,
    timesSeen: 3,
    correct: 3,
    strength: 0.7,
    depth: 3,
    lastReviewed: NOW - DAY,
  };
}

describe('grouping walks the curriculum', () => {
  const ids = vocabConcepts.map((concept) => concept.id);
  const { stages, ungrouped } = groupByCourse(ids);

  it('emits stages in curriculum order', () => {
    const expected = curriculum.map((stage) => stage.id);
    const actual = stages.map((group) => group.stage.id);
    expect(actual).toEqual(expected.filter((id) => actual.includes(id)));
  });

  it('emits units in curriculum order inside each stage', () => {
    for (const group of stages) {
      const expected = group.stage.units.map((unit) => unit.id);
      const actual = group.units.map((unit) => unit.unit.id);
      expect(actual).toEqual(expected.filter((id) => actual.includes(id)));
    }
  });

  it('files every concept under the unit whose lesson first teaches it', () => {
    for (const group of stages) {
      for (const unit of group.units) {
        for (const id of unit.ids) {
          expect(conceptOrigin(id)?.unit.id).toBe(unit.unit.id);
        }
      }
    }
  });

  it('loses nothing: every id lands in exactly one place', () => {
    const placed = stages.flatMap((group) => group.units.flatMap((unit) => unit.ids));
    expect([...placed, ...ungrouped].sort()).toEqual([...ids].sort());
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('sets aside anything no lesson teaches rather than filing it wrongly', () => {
    for (const id of ungrouped) {
      expect(getLessonThatIntroduces(id)).toBeUndefined();
    }
  });
});

describe('the filters distinguish shown from retrieved', () => {
  const id = vocabConcepts[0].id;
  const base = { id, learner: makeLearner(), now: NOW };

  it('counts a never-seen concept as not yet met', () => {
    expect(passesFilter('unmet', { ...base, state: undefined })).toBe(true);
    expect(passesFilter('learned', { ...base, state: undefined })).toBe(false);
  });

  it('does not call a concept learned just because a card introduced it', () => {
    /**
     * The case a skipped-ahead unit produces, and the one this rule exists for.
     * `introduce` sets `introduced` and schedules review without touching
     * `timesSeen` — so the concept is in the Library and out of "Not yet met",
     * and it is not claimed as learned.
     */
    const state = introduce(createConceptState(id, NOW), NOW);
    expect(passesFilter('unmet', { ...base, state })).toBe(false);
    expect(passesFilter('learned', { ...base, state })).toBe(false);
    expect(passesFilter('all', { ...base, state })).toBe(true);
  });

  it('calls it learned once it has been retrieved', () => {
    expect(passesFilter('learned', { ...base, state: retrieved(id) })).toBe(true);
  });

  it('scopes "recent" to the recency window', () => {
    const fresh = retrieved(id, NOW - 2 * DAY);
    const old = retrieved(id, NOW - (RECENT_WINDOW_DAYS + 5) * DAY);
    expect(passesFilter('recent', { ...base, state: fresh })).toBe(true);
    expect(passesFilter('recent', { ...base, state: old })).toBe(false);
  });

  it('never reports a merely-introduced concept as recent', () => {
    const state = introduce(createConceptState(id, NOW), NOW);
    expect(passesFilter('recent', { ...base, state })).toBe(false);
  });
});

describe('met counts and the section that opens first', () => {
  const ids = vocabConcepts.map((concept) => concept.id);

  it('counts introduced concepts as met, in the section that taught them', () => {
    const groups = groupByCourse(ids);
    const firstUnit = groups.stages[0].units[0];
    const concepts: Record<string, ConceptState> = {};
    for (const id of firstUnit.ids) concepts[id] = introduce(createConceptState(id, NOW), NOW);
    const learner: LearnerState = makeLearner({ concepts });

    const counted = countMet(groups, learner);
    expect(counted.stages[0].units[0].met).toBe(firstUnit.ids.length);
    expect(counted.stages[0].met).toBe(firstUnit.ids.length);
    // Nothing leaks into a later section.
    expect(counted.stages[counted.stages.length - 1].met).toBe(0);
  });

  it('opens on the section the learner is partway through', () => {
    const groups = groupByCourse(ids);
    const target = groups.stages[1];
    const concepts: Record<string, ConceptState> = {};
    for (const id of groups.stages[0].ids) concepts[id] = retrieved(id);
    for (const id of target.ids.slice(0, 3)) concepts[id] = retrieved(id);

    const counted = countMet(groups, makeLearner({ concepts }));
    expect(currentStageId(counted.stages)).toBe(target.stage.id);
  });

  it('opens on the first section for a learner who has met nothing', () => {
    const counted = countMet(groupByCourse(ids), makeLearner());
    expect(currentStageId(counted.stages)).toBe(counted.stages[0].stage.id);
  });
});

/**
 * Two levels of collapse, and why the second one is not decoration.
 *
 * The Library rendered every entry of an open section inline. Unfiltered, the
 * first section holds 401 words, which made it ~30,000 pixels tall and put
 * every *later* section past the end of the scroll — still mounted, still in
 * the accessibility tree, and unreachable by any learner who was not prepared
 * to scroll thirty-eight screens. Because which section opens by default
 * depends on progress, and because a filter can shrink a section to three
 * entries, it looked intermittent rather than structural.
 *
 * So these assert a *scale* property, not the presence of a chevron: a section
 * that opens must not, by opening, bury the sections after it.
 */
describe('the unit that opens inside a section', () => {
  const ids = vocabConcepts.map((concept) => concept.id);

  it('opens the unit the learner is partway through', () => {
    const groups = groupByCourse(ids);
    const stage = groups.stages[0];
    const target = stage.units[2];
    const concepts: Record<string, ConceptState> = {};
    for (const id of stage.units[0].ids) concepts[id] = retrieved(id);
    for (const id of stage.units[1].ids) concepts[id] = retrieved(id);
    for (const id of target.ids.slice(0, 1)) concepts[id] = retrieved(id);

    const counted = countMet(groups, makeLearner({ concepts }));
    expect(currentUnitId(counted.stages[0])).toBe(target.unit.id);
  });

  it('opens the first unit for a learner who has met nothing', () => {
    const counted = countMet(groupByCourse(ids), makeLearner());
    const stage = counted.stages[0];
    expect(currentUnitId(stage)).toBe(stage.units[0].unit.id);
  });

  it('never opens more than one unit of a section big enough to bury the next one', () => {
    const counted = countMet(groupByCourse(ids), makeLearner());
    for (const stage of counted.stages) {
      if (stage.total <= UNITS_OPEN_BELOW) continue;
      const open = stage.units.filter((unit) =>
        defaultUnitOpen(stage, unit.unit.id, true),
      );
      expect(open).toHaveLength(1);
    }
  });

  it('leaves a section short enough to read at a glance fully open', () => {
    // What a narrow filter produces: a handful of entries spread over units.
    // Presenting three words as a row of closed folders is friction, not
    // structure, so the collapsing releases below a threshold.
    const counted = countMet(groupByCourse(ids.slice(0, 12)), makeLearner());
    for (const stage of counted.stages) {
      expect(stage.total).toBeLessThanOrEqual(UNITS_OPEN_BELOW);
      for (const unit of stage.units) {
        expect(defaultUnitOpen(stage, unit.unit.id, false)).toBe(true);
      }
    }
  });

  it('opens nothing in a big section the learner is not currently in', () => {
    const counted = countMet(groupByCourse(ids), makeLearner());
    const big = counted.stages.find((stage) => stage.total > UNITS_OPEN_BELOW)!;
    for (const unit of big.units) {
      expect(defaultUnitOpen(big, unit.unit.id, false)).toBe(false);
    }
  });
});

describe('ordering', () => {
  const sample = vocabConcepts.slice(0, 40).map((c) => c.id);
  const label = (id: string) => {
    const concept = vocabConcepts.find((c) => c.id === id)!;
    return concept.es;
  };
  const level = (id: string) => vocabConcepts.find((c) => c.id === id)!.level;

  it('sorts alphabetically on request', () => {
    const sorted = sortForGrouping(sample, 'alphabetical', {
      learner: makeLearner(),
      now: NOW,
      label,
      order: () => 0,
      level,
    });
    const labels = sorted.map(label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, 'es')));
  });

  it('puts retrieved concepts before unmet ones under progress ordering', () => {
    const concepts: Record<string, ConceptState> = {};
    for (const id of sample.slice(10, 15)) concepts[id] = retrieved(id);
    const sorted = sortForGrouping(sample, 'progress', {
      learner: makeLearner({ concepts }),
      now: NOW,
      label,
      order: () => 0,
      level,
    });
    expect(sorted.slice(0, 5).sort()).toEqual(sample.slice(10, 15).sort());
  });

  it('does not mutate the array it was given', () => {
    const original = [...sample];
    sortForGrouping(sample, 'alphabetical', {
      learner: makeLearner(),
      now: NOW,
      label,
      order: () => 0,
      level,
    });
    expect(sample).toEqual(original);
  });
});

/**
 * A verb has no `ConceptState` of its own.
 *
 * It is known through its paradigms (`f.<verb>.<tense>`) and its vocabulary
 * entry, which is why the verbs tab's filter asks about those rather than about
 * a `v.<verb>` that does not exist. `countMet` did not know it and looked up
 * `learner.concepts['ser']` — always undefined — so every verb section reported
 * `0 / n` however much of the course the learner had walked, and the section
 * and unit that open by default fell back to the first ones rather than to the
 * learner's own position.
 */
describe('verbs are met through their paradigms', () => {
  const ids = verbs.map((verb) => verb.id);

  it('counts a verb as met when one of its concepts has been', () => {
    const groups = groupByCourse(ids, true);
    const unit = groups.stages[0].units[0];
    const verbId = unit.ids[0];
    const behind = verbConceptIds(verbId);
    expect(behind.length).toBeGreaterThan(0);

    const learner = makeLearner({
      concepts: { [behind[0]]: introduce(createConceptState(behind[0], NOW), NOW) },
    });
    const counted = countMet(groups, learner, true);
    expect(counted.stages[0].units[0].met).toBe(1);
    expect(counted.stages[0].met).toBe(1);
  });

  it('reports nothing met for a learner who has met nothing', () => {
    const counted = countMet(groupByCourse(ids, true), makeLearner(), true);
    expect(counted.stages.every((stage) => stage.met === 0)).toBe(true);
  });

  it('opens the verb section the learner is partway through', () => {
    const groups = groupByCourse(ids, true);
    const target = groups.stages[1];
    const concepts: Record<string, ConceptState> = {};
    for (const id of groups.stages[0].ids.flatMap(verbConceptIds)) concepts[id] = retrieved(id);
    for (const id of target.ids.slice(0, 2).flatMap(verbConceptIds)) concepts[id] = retrieved(id);

    const counted = countMet(groups, makeLearner({ concepts }), true);
    expect(currentStageId(counted.stages)).toBe(target.stage.id);
  });
});
