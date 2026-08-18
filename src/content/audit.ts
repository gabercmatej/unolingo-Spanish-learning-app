import {
  allUnits,
  conversations,
  cultureNotes,
  curriculum,
  getLessonSentences,
  getLessonThatIntroduces,
  getSentencesForConcept,
  grammarConcepts,
  sentences,
  verbFormConcepts,
  stories,
  vocabConcepts,
  verbs,
} from '@/content';
import { errorDrills, naturalDrills } from '@/content/drills';
import { reportVerbCorpus } from '@/content/verb-corpus';
import {
  CEFR_LEVELS,
  type CefrLevel,
  type Lesson,
  type LessonKind,
  type Person,
  type Stage,
} from '@/content/types';

/**
 * Curriculum depth audit.
 *
 * The first version of this file counted *presence*: does the stage have a
 * listening lesson, does it have vocabulary, does it have a story. That caught
 * the gaps of a course being built for the first time, and it stopped being
 * useful the moment every box had a 1 in it — one listening lesson turned a
 * whole stage green while the other thirteen units had no audio at all.
 *
 * So this measures **distribution and depth** instead:
 *
 *   • how far a modality reaches *across* the units of a stage, not whether it
 *     exists somewhere in it;
 *   • whether a concept the course introduces has enough material behind it to
 *     be practised more than once;
 *   • whether a lesson is thin even though its stage average looks healthy;
 *   • whether an advanced stage is quietly living off lower-level sentences.
 *
 * Every number here is a diagnostic. None of them is a target, and making a
 * warning disappear by adding the minimum is the one use of this file that is
 * explicitly wrong.
 */

// --- Thresholds -------------------------------------------------------------

/**
 * Deliberately loose. These mark "a human should look at this", not "this is
 * broken" — which is why they are stated once, here, rather than scattered as
 * magic numbers through the checks.
 */
const THRESHOLDS = {
  /** A lesson with fewer than this many sentences repeats itself in one sitting. */
  sentencesPerLesson: 4,
  /** Below this, a session has to reuse the same line under two exercise kinds. */
  sentencesPerConcept: 2,
  /** Fraction of a stage's units that should offer each recurring modality. */
  modalityReach: 0.25,
  /** Above this, an advanced stage is leaning on material below its own level. */
  belowLevelShare: 0.5,
  /** A single sentence opening this dominant in a level reads as a template. */
  templateShare: 0.12,
} as const;

export type Modality = 'listening' | 'conversation' | 'reading';

/** Lesson kinds that carry each recurring modality. */
const MODALITY_KIND: Record<Modality, LessonKind> = {
  listening: 'listening',
  conversation: 'conversation',
  reading: 'story',
};

export interface StageAudit {
  id: string;
  levelRange: string;
  units: number;
  plannedUnits: number;
  lessons: number;
  lessonsByKind: Record<LessonKind, number>;
  estMinutes: number;
  /** Concepts whose own `level` sits in this stage's range. */
  vocab: number;
  phrases: number;
  grammar: number;
  verbForms: number;
  sentences: number;
  conversations: number;
  stories: number;
  cultureNotes: number;

  // --- Depth and distribution ---------------------------------------------
  /** Units offering each recurring modality — reach, not mere presence. */
  unitsWith: Record<Modality, number>;
  /** Required spine vs enrichment. */
  requiredLessons: number;
  optionalLessons: number;
  /** Distinct sentences this stage's lessons actually draw on. */
  drawnSentences: number;
  /** Of those, how many sit below the stage's own level. */
  drawnBelowLevel: number;
  /** Lessons whose own sentence list is too thin to vary a session. */
  thinLessons: string[];
  /**
   * Lessons declaring more concepts than one session can generate. The surplus
   * is silently never introduced — see `findDepthGaps`.
   */
  overSubscribedLessons: string[];
  /** Concepts introduced here with too little material to practise them. */
  thinlyPractised: string[];
  /**
   * The concepts this stage practises least, always reported regardless of how
   * healthy the stage is. An absolute threshold ("fewer than two sentences")
   * answers a question that goes permanently quiet the moment it is satisfied —
   * and a silent diagnostic reads as "finished" when it only means "no longer
   * broken". This is relative, so it survives its own success: it names the
   * next thing to deepen even in a stage with no warnings at all.
   */
  thinnest: { id: string; pool: number }[];
  /** Median sentences per concept here — the yardstick `thinnest` is read against. */
  medianPool: number;
  /** Concepts introduced here that no sentence exercises at all. */
  unpractised: string[];
  /** Drill-backed exercise kinds available at this stage's levels. */
  errorDrills: number;
  naturalDrills: number;
  /** Mean sentences available per concept introduced at this level. */
  sentencesPerConcept: number;
}

export interface Gap {
  /** `warn` is worth a look; `info` is context for judgement. */
  severity: 'warn' | 'info';
  where: string;
  message: string;
}

export interface CurriculumAudit {
  stages: StageAudit[];
  totals: {
    units: number;
    plannedUnits: number;
    lessons: number;
    vocab: number;
    phrases: number;
    grammar: number;
    sentences: number;
    verbs: number;
    errorDrills: number;
    naturalDrills: number;
  };
  gaps: Gap[];
}

const EMPTY_KINDS: Record<LessonKind, number> = {
  core: 0,
  grammar: 0,
  conversation: 0,
  listening: 0,
  story: 0,
  checkpoint: 0,
};

/** Levels a stage is responsible for: everything from `from` up to and including `to`. */
function levelsOwnedBy(stage: Stage, index: number): CefrLevel[] {
  const to = CEFR_LEVELS.indexOf(stage.to);
  // The first stage owns its starting level too; later stages start above the
  // previous one so a level is never counted twice.
  const from = index === 0 ? CEFR_LEVELS.indexOf(stage.from) : to;
  return CEFR_LEVELS.slice(from, to + 1);
}

/**
 * Conversation, story and checkpoint lessons build their exercises from a
 * scene, a passage or the whole stage rather than from their own sentence list,
 * so counting sentences against them measures nothing.
 */
function drawsOnOwnSentences(lesson: Lesson): boolean {
  return lesson.kind !== 'conversation' && lesson.kind !== 'story' && lesson.kind !== 'checkpoint';
}

export function auditCurriculum(): CurriculumAudit {
  const stages = curriculum.map((stage, index) => {
    const owned = new Set<CefrLevel>(levelsOwnedBy(stage, index));
    const lessons = stage.units.flatMap((unit) => unit.lessons);
    const lessonsByKind = { ...EMPTY_KINDS };
    for (const lesson of lessons) lessonsByKind[lesson.kind] += 1;

    const inStage = <T extends { level: CefrLevel }>(items: T[]) =>
      items.filter((item) => owned.has(item.level)).length;

    // Modality reach: how many units offer it, not whether the stage has one.
    const unitsWith = {} as Record<Modality, number>;
    for (const [modality, kind] of Object.entries(MODALITY_KIND) as [Modality, LessonKind][]) {
      unitsWith[modality] = stage.units.filter((unit) =>
        unit.lessons.some((lesson) => lesson.kind === kind),
      ).length;
    }

    // What this stage's lessons actually reach for, and at what level.
    const drawn = new Set<string>();
    const thinLessons: string[] = [];
    const overSubscribedLessons: string[] = [];
    for (const lesson of lessons) {
      for (const sentence of getLessonSentences(lesson)) drawn.add(sentence.id);
      if (drawsOnOwnSentences(lesson) && lesson.sentences.length < THRESHOLDS.sentencesPerLesson) {
        thinLessons.push(`${lesson.id} (${lesson.sentences.length})`);
      }
      // Mirrors `buildLessonSession`'s own target: clamp(estMinutes * 1.8, 10, 20).
      const capacity = Math.max(10, Math.min(20, Math.round(lesson.estMinutes * 1.8)));
      const declared = new Set([...lesson.teaches, ...(lesson.grammar ?? [])]).size;
      if (declared > capacity) {
        overSubscribedLessons.push(`${lesson.id} (${declared}>${capacity})`);
      }
    }
    const stageFloor = Math.min(...[...owned].map((level) => CEFR_LEVELS.indexOf(level)));
    const drawnBelowLevel = [...drawn].filter((id) => {
      const sentence = sentences.find((s) => s.id === id);
      return !!sentence && CEFR_LEVELS.indexOf(sentence.level) < stageFloor;
    }).length;

    // Concepts introduced at this level, and whether anything practises them.
    const introducedHere = [...vocabConcepts, ...grammarConcepts].filter(
      (concept) => owned.has(concept.level) && getLessonThatIntroduces(concept.id),
    );
    const unpractised: string[] = [];
    const thinlyPractised: string[] = [];
    const pools: { id: string; pool: number }[] = [];
    let totalPools = 0;
    for (const concept of introducedHere) {
      const pool = getSentencesForConcept(concept.id).length;
      totalPools += pool;
      pools.push({ id: concept.id, pool });
      if (pool === 0) unpractised.push(concept.id);
      else if (pool < THRESHOLDS.sentencesPerConcept) thinlyPractised.push(concept.id);
    }
    const sortedPools = [...pools].sort((a, b) => a.pool - b.pool);
    const medianPool =
      sortedPools.length > 0 ? sortedPools[Math.floor(sortedPools.length / 2)].pool : 0;

    return {
      id: stage.id,
      levelRange: stage.levelRange,
      units: stage.units.filter((unit) => unit.status !== 'planned').length,
      plannedUnits: stage.units.filter((unit) => unit.status === 'planned').length,
      lessons: lessons.length,
      lessonsByKind,
      estMinutes: lessons.reduce((sum, lesson) => sum + lesson.estMinutes, 0),
      vocab: vocabConcepts.filter((v) => v.kind === 'vocab' && owned.has(v.level)).length,
      phrases: vocabConcepts.filter((v) => v.kind === 'phrase' && owned.has(v.level)).length,
      grammar: inStage(grammarConcepts),
      verbForms: verbs.filter((v) => owned.has(v.level)).length,
      sentences: inStage(sentences),
      conversations: inStage(conversations),
      stories: inStage(stories),
      cultureNotes: inStage(cultureNotes),

      unitsWith,
      requiredLessons: lessons.filter((lesson) => !lesson.optional).length,
      optionalLessons: lessons.filter((lesson) => lesson.optional).length,
      drawnSentences: drawn.size,
      drawnBelowLevel,
      thinLessons,
      overSubscribedLessons,
      thinlyPractised,
      thinnest: sortedPools.slice(0, 8),
      medianPool,
      unpractised,
      errorDrills: errorDrills.filter((d) => owned.has(d.level)).length,
      naturalDrills: naturalDrills.filter((d) => owned.has(d.level)).length,
      sentencesPerConcept: introducedHere.length > 0 ? totalPools / introducedHere.length : 0,
    } satisfies StageAudit;
  });

  return {
    stages,
    totals: {
      units: allUnits.filter((u) => u.status !== 'planned').length,
      plannedUnits: allUnits.filter((u) => u.status === 'planned').length,
      lessons: stages.reduce((n, s) => n + s.lessons, 0),
      vocab: vocabConcepts.filter((v) => v.kind === 'vocab').length,
      phrases: vocabConcepts.filter((v) => v.kind === 'phrase').length,
      grammar: grammarConcepts.length,
      sentences: sentences.length,
      verbs: verbs.length,
      errorDrills: errorDrills.length,
      naturalDrills: naturalDrills.length,
    },
    gaps: [...findStructuralGaps(stages), ...findDepthGaps(stages), ...findUntaught(), ...findParadigmGaps(), ...findTemplates()],
  };
}

/**
 * Concepts no lesson ever introduces.
 *
 * They still appear in the Library, but with no place in the course they sort
 * to the very end of it — so revision lands the learner in a pile of material
 * they have never been shown. Either teach it or drop it.
 */
function findUntaught(): Gap[] {
  const orphanGrammar = grammarConcepts.filter((c) => !getLessonThatIntroduces(c.id));
  const orphanVocab = vocabConcepts.filter((c) => !getLessonThatIntroduces(c.id));
  /**
   * Verb paradigms were omitted from this check for a long time, and all 101 of
   * them were stranded: the conjugation system existed, generated nothing, and
   * no diagnostic said so. A derived concept is exactly the kind that goes
   * unnoticed, because nobody is looking at a file where it was written down.
   */
  const orphanParadigms = verbFormConcepts.filter((c) => !getLessonThatIntroduces(c.id));
  const gaps: Gap[] = [];

  if (orphanParadigms.length > 0) {
    const names = orphanParadigms.slice(0, 5).map((c) => c.id).join(', ');
    gaps.push({
      severity: 'warn',
      where: 'course',
      message:
        `${orphanParadigms.length} verb paradigm(s) are never taught by a lesson, so they ` +
        `can never be practised (${names}${orphanParadigms.length > 5 ? ', …' : ''})`,
    });
  }

  if (orphanGrammar.length > 0) {
    const names = orphanGrammar.slice(0, 4).map((c) => c.title).join(', ');
    gaps.push({
      severity: 'warn',
      where: 'course',
      message:
        `${orphanGrammar.length} grammar concept(s) are never taught by a lesson ` +
        `(${names}${orphanGrammar.length > 4 ? ', …' : ''})`,
    });
  }
  if (orphanVocab.length > 0) {
    const names = orphanVocab.slice(0, 6).map((c) => c.es).join(', ');
    gaps.push({
      severity: 'warn',
      where: 'course',
      message:
        `${orphanVocab.length} vocabulary item(s) are never taught by a lesson ` +
        `(${names}${orphanVocab.length > 6 ? ', …' : ''})`,
    });
  }
  return gaps;
}

/**
 * A whole skill missing from a stage. These were the original checks and they
 * still matter — they just no longer say anything once each is present.
 */
function findStructuralGaps(stages: StageAudit[]): Gap[] {
  const gaps: Gap[] = [];

  for (const stage of stages) {
    const where = stage.levelRange;
    const warn = (message: string) => gaps.push({ severity: 'warn', where, message });

    if (stage.plannedUnits > 0) warn(`${stage.plannedUnits} unit(s) still outline-only`);
    if (stage.units === 0) {
      warn('no playable units at all');
      continue;
    }
    if (stage.lessonsByKind.listening === 0) warn('no listening lessons');
    if (stage.lessonsByKind.conversation === 0) warn('no conversation lessons');
    if (stage.lessonsByKind.checkpoint === 0) warn('no stage checkpoint');
    if (stage.stories === 0) warn('no stories at this level');
    if (stage.grammar === 0) warn('no grammar concepts introduced at this level');
    if (stage.vocab + stage.phrases === 0) warn('no vocabulary introduced at this level');
    if (stage.phrases === 0) warn('no chunks/collocations at this level');
  }

  return gaps;
}

/**
 * The checks that survive a course where every box already has a 1 in it.
 */
function findDepthGaps(stages: StageAudit[]): Gap[] {
  const gaps: Gap[] = [];

  for (const stage of stages) {
    const where = stage.levelRange;
    const warn = (message: string) => gaps.push({ severity: 'warn', where, message });
    const info = (message: string) => gaps.push({ severity: 'info', where, message });

    if (stage.units === 0) continue;

    // Reach: a modality that lives in one unit of fourteen is not a modality,
    // it is a token. This is the check the presence-only audit could not make.
    for (const modality of Object.keys(MODALITY_KIND) as Modality[]) {
      const reached = stage.unitsWith[modality];
      const share = reached / stage.units;
      if (share < THRESHOLDS.modalityReach) {
        warn(
          `${modality} reaches only ${reached} of ${stage.units} units ` +
            `(${Math.round(share * 100)}% — recurring modality, not a single lesson)`,
        );
      }
    }

    /**
     * The mirror image of a thin lesson, and a worse failure. A session is
     * capped at roughly `estMinutes × 1.8` exercises, so a lesson declaring
     * more concepts than that cannot deliver them all — and a concept that is
     * never generated never enters the learner's state, is never scheduled for
     * review, and never appears in the Library. It is `teaches` making a promise
     * the session cannot keep, which looks identical to a healthy lesson from
     * every other angle.
     */
    if (stage.overSubscribedLessons.length > 0) {
      warn(
        `${stage.overSubscribedLessons.length} lesson(s) declare more concepts than a session ` +
          `can deliver, so the surplus is never introduced: ` +
          `${stage.overSubscribedLessons.slice(0, 5).join(', ')}` +
          `${stage.overSubscribedLessons.length > 5 ? ', …' : ''}`,
      );
    }

    // Individual thin lessons, which a healthy stage mean hides completely.
    if (stage.thinLessons.length > 0) {
      warn(
        `${stage.thinLessons.length} lesson(s) draw on fewer than ` +
          `${THRESHOLDS.sentencesPerLesson} sentences: ${stage.thinLessons.slice(0, 5).join(', ')}` +
          `${stage.thinLessons.length > 5 ? ', …' : ''}`,
      );
    }

    // Introduced but barely practised — the quiet failure of a depth pass.
    if (stage.unpractised.length > 0) {
      warn(
        `${stage.unpractised.length} concept(s) taught here have no sentence at all: ` +
          `${stage.unpractised.slice(0, 5).join(', ')}${stage.unpractised.length > 5 ? ', …' : ''}`,
      );
    }
    if (stage.thinlyPractised.length > 0) {
      info(
        `${stage.thinlyPractised.length} concept(s) taught here appear in only one sentence: ` +
          `${stage.thinlyPractised.slice(0, 5).join(', ')}` +
          `${stage.thinlyPractised.length > 5 ? ', …' : ''}`,
      );
    }

    /**
     * The standing priority queue. Reported whether or not anything is wrong,
     * because "which concepts does this stage practise least" is a question
     * that stays useful forever, unlike "does anything fall under a threshold",
     * which stops informing the moment it is answered.
     */
    if (stage.thinnest.length > 0) {
      const worst = stage.thinnest
        .slice(0, 6)
        .map((entry) => `${entry.id}(${entry.pool})`)
        .join(' ');
      info(`least practised here — median ${stage.medianPool} sentences/concept: ${worst}`);
    }

    // An advanced stage living off easier material is the subtlest way for a
    // course to look complete and teach nothing new.
    if (stage.drawnSentences > 0) {
      const share = stage.drawnBelowLevel / stage.drawnSentences;
      if (share > THRESHOLDS.belowLevelShare) {
        warn(
          `${Math.round(share * 100)}% of the sentences this stage draws on sit below its own level`,
        );
      }
    }

    // The drill-only kinds. correctMistake and chooseNatural cannot be
    // generated, so with no drill at a level the generator silently drops them.
    if (stage.errorDrills === 0) warn('no error drills — correctMistake cannot be generated here');
    if (stage.naturalDrills === 0) {
      warn('no naturalness drills — chooseNatural cannot be generated here');
    }

    // Enrichment should exist without swallowing the spine.
    if (stage.optionalLessons === 0) info('no optional/enrichment lessons');
  }

  return gaps;
}

/**
 * Verb paradigms are practised by finding a sentence that contains the exact
 * conjugated form. A paradigm whose forms appear nowhere in the corpus still
 * generates an exercise — but only the bare "which form goes with yo?" table,
 * which is the weakest thing the app can offer and teaches nothing about use.
 *
 * This is invisible to every other check: the paradigm is taught, reachable and
 * not thin by any concept-pool measure, because paradigms are not tagged on
 * sentences at all. Reported per person, because the corpus skews heavily to
 * first and third singular — and in a Peninsular course the form that must not
 * be missing is `vosotros`.
 */
function findParadigmGaps(): Gap[] {
  const report = reportVerbCorpus((id) => !!getLessonThatIntroduces(id));
  const gaps: Gap[] = [];

  if (report.unsupported.length > 0) {
    gaps.push({
      severity: 'warn',
      where: 'verbs',
      message:
        `${report.unsupported.length} taught paradigm(s) have no conjugated form anywhere in ` +
        `the corpus, so they can only be drilled as a bare table: ` +
        `${report.unsupported.slice(0, 5).join(', ')}` +
        `${report.unsupported.length > 5 ? ', …' : ''}`,
    });
  }

  // Reachable but resting on one sentence. Distinguishing this from "healthy"
  // is the whole reason the corpus index exists.
  if (report.barelyPractised.length > 0) {
    gaps.push({
      severity: 'warn',
      where: 'verbs',
      message:
        `${report.barelyPractised.length} taught paradigm(s) rest on a single sentence: ` +
        `${report.barelyPractised.slice(0, 5).join(', ')}` +
        `${report.barelyPractised.length > 5 ? ', …' : ''}`,
    });
  }

  gaps.push({
    severity: 'info',
    where: 'verbs',
    message:
      `${report.taught} of ${report.paradigms} paradigms taught, ` +
      `${report.withSentenceSupport} with sentence support ` +
      `(${Math.round((report.withSentenceSupport / Math.max(report.taught, 1)) * 100)}%)`,
  });

  gaps.push({
    severity: 'info',
    where: 'verbs',
    message:
      'unambiguous form exposures by person: ' +
      (Object.entries(report.exposureByPerson) as [Person, number][])
        .sort((a, b) => b[1] - a[1])
        .map(([person, n]) => `${person}=${n}`)
        .join(' ') +
      ` · shared between persons: ${report.sharedFormExposures}`,
  });

  gaps.push({
    severity: 'info',
    where: 'verbs',
    message:
      'form exposures by tense: ' +
      Object.entries(report.exposureByTense)
        .sort((a, b) => b[1] - a[1])
        .map(([tense, n]) => `${tense}=${n}`)
        .join(' '),
  });

  gaps.push({
    severity: 'info',
    where: 'verbs',
    message:
      'taught paradigms by persons the corpus can illustrate (of 6): ' +
      Object.entries(report.personsCoveredHistogram)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([covered, n]) => `${covered}→${n}`)
        .join(' '),
  });

  return gaps;
}

/**
 * Sentences that share an opening read as generated variations of one another,
 * which is exactly the texture this course is trying to avoid. Flagged per
 * level, because a shared opening is only suspicious relative to a pool size.
 */
function findTemplates(): Gap[] {
  const gaps: Gap[] = [];

  for (const level of CEFR_LEVELS) {
    const pool = sentences.filter((sentence) => sentence.level === level);
    if (pool.length < 12) continue;

    const openings = new Map<string, number>();
    for (const sentence of pool) {
      const opening = sentence.es
        .toLowerCase()
        .replace(/[¿¡]/g, '')
        .split(/\s+/)
        .slice(0, 2)
        .join(' ');
      openings.set(opening, (openings.get(opening) ?? 0) + 1);
    }

    for (const [opening, count] of openings) {
      if (count >= 4 && count / pool.length > THRESHOLDS.templateShare) {
        gaps.push({
          severity: 'info',
          where: level,
          message:
            `${count} of ${pool.length} sentences open with "${opening}" ` +
            `(${Math.round((count / pool.length) * 100)}% — check they are not variations of one frame)`,
        });
      }
    }
  }

  return gaps;
}

// --- Report -----------------------------------------------------------------

function pct(part: number, whole: number): string {
  if (whole === 0) return '  –';
  return `${Math.round((part / whole) * 100)}%`.padStart(4);
}

/** Human-readable report, printed by `npm run audit:content`. */
export function formatAudit(audit: CurriculumAudit = auditCurriculum()): string {
  const width = 78;
  const out: string[] = ['', 'UNOLINGO CURRICULUM AUDIT', '='.repeat(width), ''];

  out.push('VOLUME', '-'.repeat(width));
  out.push(
    [
      'Stage'.padEnd(11),
      'Units'.padStart(6),
      'Less'.padStart(5),
      'Req'.padStart(5),
      'Opt'.padStart(5),
      'Vocab'.padStart(6),
      'Chunk'.padStart(6),
      'Gram'.padStart(5),
      'Sent'.padStart(6),
      'Drill'.padStart(6),
      'Mins'.padStart(6),
    ].join(''),
  );
  for (const s of audit.stages) {
    out.push(
      [
        s.levelRange.padEnd(11),
        String(s.units).padStart(6),
        String(s.lessons).padStart(5),
        String(s.requiredLessons).padStart(5),
        String(s.optionalLessons).padStart(5),
        String(s.vocab).padStart(6),
        String(s.phrases).padStart(6),
        String(s.grammar).padStart(5),
        String(s.sentences).padStart(6),
        String(s.errorDrills + s.naturalDrills).padStart(6),
        String(s.estMinutes).padStart(6),
      ].join(''),
    );
  }

  out.push('', 'DEPTH & DISTRIBUTION', '-'.repeat(width));
  out.push(
    [
      'Stage'.padEnd(11),
      'List%'.padStart(6),
      'Conv%'.padStart(6),
      'Read%'.padStart(6),
      'Sent/L'.padStart(7),
      'Sent/C'.padStart(7),
      'Thin'.padStart(5),
      'NoPrac'.padStart(7),
      'Below'.padStart(6),
    ].join(''),
  );
  out.push(
    // The header needs a legend or the columns are just noise.
    '            share of units offering each modality │ per lesson │ per concept',
  );
  for (const s of audit.stages) {
    const perLesson = s.lessons > 0 ? (s.drawnSentences / s.lessons).toFixed(1) : '–';
    out.push(
      [
        s.levelRange.padEnd(11),
        pct(s.unitsWith.listening, s.units).padStart(6),
        pct(s.unitsWith.conversation, s.units).padStart(6),
        pct(s.unitsWith.reading, s.units).padStart(6),
        perLesson.padStart(7),
        s.sentencesPerConcept.toFixed(1).padStart(7),
        String(s.thinLessons.length).padStart(5),
        String(s.unpractised.length).padStart(7),
        pct(s.drawnBelowLevel, s.drawnSentences).padStart(6),
      ].join(''),
    );
  }

  const t = audit.totals;
  out.push(
    '',
    '-'.repeat(width),
    `TOTAL: ${t.units} units · ${t.lessons} lessons · ${t.vocab} words · ${t.phrases} chunks · ` +
      `${t.grammar} grammar · ${t.sentences} sentences · ${t.verbs} verbs · ` +
      `${t.errorDrills + t.naturalDrills} drills`,
    '',
  );

  const warnings = audit.gaps.filter((gap) => gap.severity === 'warn');
  const notes = audit.gaps.filter((gap) => gap.severity === 'info');

  if (warnings.length === 0) {
    out.push('No depth warnings. That is not the same as finished — read the notes.');
  } else {
    out.push(`WARNINGS (${warnings.length})`, '-'.repeat(width));
    for (const gap of warnings) out.push(`  · ${gap.where.padEnd(9)} ${gap.message}`);
  }

  if (notes.length > 0) {
    out.push('', `NOTES (${notes.length})`, '-'.repeat(width));
    for (const gap of notes) out.push(`  · ${gap.where.padEnd(9)} ${gap.message}`);
  }
  out.push('');

  return out.join('\n');
}
