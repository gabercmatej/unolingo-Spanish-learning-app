import { auditCurriculum, formatAudit } from '@/content/audit';

/**
 * Prints the curriculum depth report. Run it on its own with:
 *
 *   npm run audit:content
 *
 * This is the definition-of-done gate for course *content*, deliberately kept
 * out of `npm test` (see testPathIgnorePatterns). It is expected to fail while
 * the course is still being deepened — its assertions encode "this stage is
 * finished", not "the code works".
 *
 * The assertions below are floors that describe a course somebody could study
 * from for months: every skill present, every skill *recurring* rather than
 * token, and nothing introduced that the learner can never practise. Making one
 * pass by adding the bare minimum defeats the point of having it.
 */
describe('curriculum audit', () => {
  const audit = auditCurriculum();

  it('prints the depth report', () => {
    console.log(formatAudit(audit));
    expect(audit.stages.length).toBeGreaterThan(0);
  });

  it('has no outline-only units left in the course', () => {
    const planned = audit.stages.filter((stage) => stage.plannedUnits > 0);
    expect(planned.map((s) => `${s.levelRange}: ${s.plannedUnits} planned`)).toEqual([]);
  });

  it('gives every stage listening, conversation, story and checkpoint practice', () => {
    for (const stage of audit.stages) {
      expect({
        stage: stage.levelRange,
        listening: stage.lessonsByKind.listening > 0,
        conversation: stage.lessonsByKind.conversation > 0,
        story: stage.lessonsByKind.story > 0,
        checkpoint: stage.lessonsByKind.checkpoint > 0,
      }).toEqual({
        stage: stage.levelRange,
        listening: true,
        conversation: true,
        story: true,
        checkpoint: true,
      });
    }
  });

  it('introduces vocabulary, chunks and grammar at every stage', () => {
    for (const stage of audit.stages) {
      expect({
        stage: stage.levelRange,
        vocab: stage.vocab > 0,
        chunks: stage.phrases > 0,
        grammar: stage.grammar > 0,
      }).toEqual({ stage: stage.levelRange, vocab: true, chunks: true, grammar: true });
    }
  });

  /**
   * The check the old presence-only audit could not make. A stage where
   * listening lives in exactly one of fourteen units is not a stage that
   * teaches listening.
   */
  it('makes listening, conversation and reading recur across a quarter of each stage', () => {
    const thin = audit.stages.flatMap((stage) =>
      (['listening', 'conversation', 'reading'] as const)
        .filter((modality) => stage.unitsWith[modality] / stage.units < 0.25)
        .map(
          (modality) =>
            `${stage.levelRange}: ${modality} in ${stage.unitsWith[modality]}/${stage.units} units`,
        ),
    );
    expect(thin).toEqual([]);
  });

  it('never introduces a concept it cannot practise', () => {
    const unpractised = audit.stages.flatMap((stage) =>
      stage.unpractised.map((id) => `${stage.levelRange}: ${id}`),
    );
    expect(unpractised).toEqual([]);
  });

  it('gives every lesson enough sentences to vary a session', () => {
    const thin = audit.stages.flatMap((stage) =>
      stage.thinLessons.map((lesson) => `${stage.levelRange}: ${lesson}`),
    );
    expect(thin).toEqual([]);
  });

  /**
   * `correctMistake` and `chooseNatural` are hand-authored only. A level with
   * no drill silently loses both from its exercise mix — and they are the top
   * tier from B2 up.
   */
  it('backs the drill-only exercise kinds at every stage', () => {
    for (const stage of audit.stages) {
      expect({
        stage: stage.levelRange,
        errorDrills: stage.errorDrills > 0,
        naturalDrills: stage.naturalDrills > 0,
      }).toEqual({ stage: stage.levelRange, errorDrills: true, naturalDrills: true });
    }
  });

  it('does not let an advanced stage live off lower-level sentences', () => {
    const leaning = audit.stages
      .filter((stage) => stage.drawnSentences > 0)
      .filter((stage) => stage.drawnBelowLevel / stage.drawnSentences > 0.5)
      .map((stage) => `${stage.levelRange}: ${stage.drawnBelowLevel}/${stage.drawnSentences} below level`);
    expect(leaning).toEqual([]);
  });

  /**
   * The introduction-order gates. These are the content-side counterpart to
   * `learning/eligibility.ts`: the runtime gate keeps an out-of-reach sentence
   * away from the learner, and these keep it out of the course.
   */
  describe('introduced before produced', () => {
    it('never introduces a concept with no sentence the learner could read', () => {
      const gap = audit.gaps.find(
        (entry) => entry.severity === 'warn' && entry.message.includes('could even read'),
      );
      expect(gap?.message ?? null).toBeNull();
    });

    it('never lets a lesson draw on sentences well above its own level', () => {
      // A greetings lesson at A0 whose examples need the present perfect is the
      // shape of the bug this pass was written to close.
      const gap = audit.gaps.find(
        (entry) => entry.severity === 'warn' && entry.message.includes('well above their own level'),
      );
      expect(gap?.message ?? null).toBeNull();
    });
  });
});
