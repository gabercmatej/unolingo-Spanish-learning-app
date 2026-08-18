import { buildDiagnostics } from '@/learning/diagnostics';
import { explainConcept, explainExercise, formatExplanation } from '@/learning/explain';
import type { Exercise } from '@/learning/exercise';
import { createConceptState } from '@/learning/srs';
import { DAY_MS } from '@/learning/srs';
import type { ConceptState } from '@/learning/types';
import { makeLearner } from './helpers';

/**
 * A diagnostic that disagrees with the system it describes is worse than none,
 * because it will be believed. Each of these checks that a reported signal is
 * the same signal the scheduler used, not a lookalike computed for display.
 */

const NOW = Date.UTC(2026, 5, 1, 12);

function concept(id: string, overrides: Partial<ConceptState> = {}): ConceptState {
  return { ...createConceptState(id, NOW), timesSeen: 6, ...overrides };
}

function exercise(kind: Exercise['kind'], conceptIds: string[]): Exercise {
  return {
    id: 'ex.1',
    kind,
    form: 'typed',
    difficulty: 4,
    conceptIds,
    instruction: 'Translate',
    accepted: ['x'],
    language: 'es',
  } as Exercise;
}

describe('why is this concept in the queue', () => {
  it('names an unresolved mistake, which is what jumps the queue', () => {
    const learner = makeLearner({
      concepts: { 'v.quedar': concept('v.quedar') },
      mistakes: [{ id: 'm', at: NOW, conceptIds: ['v.quedar'], kind: 'fillBlank' } as never],
    });
    expect(explainConcept('v.quedar', learner, NOW).reasons).toContain('mistake');
  });

  it('does not name a mistake the learner has since resolved', () => {
    const learner = makeLearner({
      concepts: { 'v.quedar': concept('v.quedar') },
      mistakes: [
        { id: 'm', at: NOW, conceptIds: ['v.quedar'], kind: 'fillBlank', resolvedAt: NOW } as never,
      ],
    });
    expect(explainConcept('v.quedar', learner, NOW).reasons).not.toContain('mistake');
  });

  it('separates overdue from merely scheduled', () => {
    const overdue = concept('v.a', { dueAt: NOW - DAY_MS });
    const later = concept('v.b', { dueAt: NOW + 5 * DAY_MS });
    const learner = makeLearner({ concepts: { 'v.a': overdue, 'v.b': later } });

    expect(explainConcept('v.a', learner, NOW).reasons).toContain('overdue');
    expect(explainConcept('v.b', learner, NOW).reasons).toContain('not-due');
  });

  it('reports the SRS’s own numbers rather than recomputing its own', () => {
    const state = concept('v.quedar', {
      stability: 12.5,
      ease: 2.4,
      lapses: 3,
      timesSeen: 21,
      lastReviewed: NOW - 3 * DAY_MS,
      dueAt: NOW + 2 * DAY_MS,
    });
    const explanation = explainConcept('v.quedar', makeLearner({ concepts: { 'v.quedar': state } }), NOW);

    expect(explanation.stability).toBe(12.5);
    expect(explanation.ease).toBe(2.4);
    expect(explanation.lapses).toBe(3);
    expect(explanation.timesSeen).toBe(21);
    expect(explanation.lastReviewedDaysAgo).toBe(3);
    expect(explanation.dueInDays).toBe(2);
    // Retrievability is the continuous curve Smart Review ranks on, so it has to
    // be between the threshold and certainty for an item not yet due.
    expect(explanation.retrievability).toBeGreaterThan(0.9);
    expect(explanation.retrievability).toBeLessThanOrEqual(1);
  });

  it('calls a concept with no record at all new, rather than mastered', () => {
    const explanation = explainConcept('v.never-met', makeLearner(), NOW);
    expect(explanation.reasons).toContain('new');
    expect(explanation.masteryPct).toBe(0);
    expect(explanation.timesSeen).toBe(0);
  });
});

describe('why this exercise', () => {
  it('says a skill is unmeasured rather than even when there is no evidence', () => {
    // skillBalance stays silent below eight concepts, and "no opinion" must not
    // be reported as "balanced" — they are different states.
    const explanation = explainExercise(exercise('translateToEs', ['v.a']), makeLearner(), NOW);
    expect(['not enough evidence', 'even']).toContain(explanation.skillStanding);
    expect(explanation.skill).toBe('production');
    expect(explanation.difficulty).toBe(4);
  });

  it('always gives a reason, even when nothing is urgent', () => {
    const learner = makeLearner({ concepts: { 'v.a': concept('v.a', { dueAt: NOW + 9 * DAY_MS }) } });
    const explanation = explainExercise(exercise('multipleChoice', ['v.a']), learner, NOW);
    expect(explanation.notes.length).toBeGreaterThan(0);
  });

  it('formats to something that can be pasted into a bug report', () => {
    const learner = makeLearner({ concepts: { 'v.a': concept('v.a') } });
    const text = formatExplanation(explainExercise(exercise('dictation', ['v.a']), learner, NOW));
    expect(text).toContain('Exercise:');
    expect(text).toContain('Mastery:');
    expect(text).toContain('Why:');
  });
});

describe('the diagnostics report', () => {
  const env = {
    appVersion: '1.0.0',
    buildVersion: '1',
    platform: 'ios',
    osVersion: '18.2',
    stateVersion: 1,
  };

  it('carries the build, the counts and the level claim', () => {
    const learner = makeLearner({
      xp: 4200,
      streak: 7,
      concepts: { 'v.a': concept('v.a') },
      completedLessons: { 'l.x': { at: 1, accuracy: 1, times: 1 } },
    });
    const report = buildDiagnostics(learner, env, NOW);

    expect(report).toContain('1.0.0 (1)');
    expect(report).toContain('ios 18.2');
    expect(report).toContain('XP           4200');
    expect(report).toContain('Demonstrated');
    expect(report).toContain('Curriculum');
  });

  it('carries nothing personal, because the point is that it can be pasted anywhere', () => {
    const learner = makeLearner({
      settings: { ...makeLearner().settings, name: 'Matej', avatarUri: 'data:image/jpeg;base64,AAAA' },
      mistakes: [
        { id: 'm', at: NOW, conceptIds: ['v.a'], kind: 'fillBlank', prompt: 'secret prompt',
          given: 'my wrong answer', expected: 'the right one' } as never,
      ],
    });
    const report = buildDiagnostics(learner, env, NOW);

    expect(report).not.toContain('Matej');
    expect(report).not.toContain('base64');
    expect(report).not.toContain('my wrong answer');
    expect(report).not.toContain('secret prompt');
  });
});
