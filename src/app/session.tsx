import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView } from '@/components/exercises';
import { useConfirm } from '@/components/ui/confirm';
import { FeedbackBar } from '@/components/learn/feedback-bar';
import {
  SessionResults,
  type ConceptDelta,
  type Milestone,
  type SessionSummary,
} from '@/components/learn/session-results';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CountUp, Reveal, Shake, usePop } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Motion, Radius, Spacing } from '@/constants/theme';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { WhyPanel } from '@/components/session/why-panel';
import { getStageForUnit, getUnitForLesson } from '@/content';
import { checkExercise, type ExerciseResult } from '@/learning/check';
import type { Exercise } from '@/learning/exercise';
import {
  LESSON_KINDS,
  buildRetry,
  buildSession,
  completedLessonId,
  type SessionKind,
} from '@/learning/session';
import { estimateLevel, stageProgress, unitProgress } from '@/learning/mastery';
import { teachingFor, type Teaching } from '@/learning/teaching';
import { mastery, masteryBand } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';
import { levelInfo } from '@/learning/xp';
import { newlyUnlocked } from '@/learning/achievements';
import { toISODate } from '@/lib/date';
import { feedback } from '@/lib/feedback';
import { goBack } from '@/lib/navigation';
import { primeSounds, sound } from '@/lib/sound';
import { speakSpanish, stopSpeaking } from '@/lib/speech';


/** The session as it stood when it ended — see `ending` below for why. */
interface SessionEnding {
  seconds: number;
  /**
   * The instant the session ended.
   *
   * Passed explicitly into every `mastery`/`unitProgress` call below rather than
   * letting them default to `Date.now()`. A results screen is a record of a
   * session that is over, so every figure on it has to be measured from the
   * same moment — and a fresh timestamp read during render is the exact thing
   * this codebase forbids, because it makes every derived value a new one.
   */
  endedAt: number;
  /** Level at the moment the session ended, before its XP was banked. */
  levelBefore: number;
  /** The learner as they were before this session's results were committed. */
  learnerBefore: LearnerState;
  /** Mastery per concept before the session touched it. */
  before: [string, number][];
  needsReview: string[];
  newConcepts: number;
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    kind?: string;
    source?: string;
    concepts?: string;
    title?: string;
    /** Set when the session was started from inside a unit — see `plan` below. */
    unit?: string;
  }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { learner, settings, recordAnswer, markIntroduced, completeSession } = useLearner();
  const confirm = useConfirm();

  const kind = (params.kind ?? 'smartReview') as SessionKind;
  const source = params.source ?? kind;

  // The plan is built once, from the learner state as it was at launch.
  const plan = useMemo(
    () =>
      buildSession(kind, source, {
        learner,
        conceptIds: params.concepts ? params.concepts.split(',') : undefined,
        /**
         * Passed by the screen that started the session, so a review knows what
         * it is a review *of*. A `unit` param means the session was opened from
         * inside that unit and may only target its concepts; without one the
         * session is global. See `learning/scope.ts`.
         */
        scope: params.unit ? { type: 'unit', unitId: params.unit } : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, source, params.concepts, params.unit],
  );

  const [queue, setQueue] = useState<Exercise[]>(() => plan?.exercises ?? []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  /**
   * The one extra thing this answer taught. Computed at submit time alongside
   * the grade rather than in render: it depends on the learner as they were
   * *before* the answer was committed, and rendering it later would show the
   * concept as already known the moment it had been answered once.
   */
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [lastXp, setLastXp] = useState(0);
  /**
   * Bumped on every wrong answer, purely to drive the shake.
   *
   * It has to be a fresh value each time rather than a boolean, because two
   * wrong answers in a row are two events and a boolean that is already true
   * cannot report the second one.
   */
  const [wrongAt, setWrongAt] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  /**
   * What the session looked like at the moment it ended.
   *
   * These used to be read out of refs while rendering the results screen, which
   * the React Compiler rightly rejects: a ref can change without a re-render, so
   * a screen built from one is a screen that can silently disagree with itself.
   * Snapshotting at `finish` is also the honest semantics — the summary is a
   * record of a session that is over, not a live view.
   */
  const [ending, setEnding] = useState<SessionEnding | null>(null);

  // Lazy initialiser: Date.now() in the argument position runs on every render
  // and is an impure call in the render phase, even though only the first result
  // is ever kept.
  const [startedAt] = useState(() => Date.now());
  const retried = useRef(new Set<string>());
  /** Mastery at the moment a concept was first touched this session. */
  const masteryBefore = useRef(new Map<string, number>());
  const needsReview = useRef(new Set<string>());
  const newConcepts = useRef(new Set<string>());
  const committed = useRef(false);
  /**
   * The running tallies, mirrored into a ref for the unmount commit below.
   *
   * The cleanup runs once, on unmount, so it closes over the state as it was on
   * first render — zero of everything. A ref is the only thing it can read that
   * is current.
   */
  const tally = useRef({ xp: 0, correct: 0, answered: 0 });

  const exercise = queue[index];
  const total = queue.length;

  /**
   * Everything the unmount commit needs, in one ref.
   *
   * Initialised once and never written during render — a ref assigned while
   * rendering can be read by a render that never commits, which is why the
   * React Compiler rejects it. `kind`, `source` and the plan's title are all
   * fixed for the life of this screen, so the initial value is the only one
   * there will ever be.
   */
  const identity = useRef({ source, kind, title: plan?.title ?? 'Practice' });

  /**
   * The running XP total pops each time it grows. It is the only number on the
   * player, and a reward that changes without moving is a reward the learner
   * has to go looking for.
   */
  const xpPop = usePop(xpEarned, { scale: 1.22 });

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    tally.current = { xp: xpEarned, correct, answered };
  }, [xpEarned, correct, answered]);

  /**
   * Bank the session if the screen goes away without finishing it.
   *
   * Every individual answer is already saved — `recordAnswer` commits to the
   * learner record as it happens — but the *session* is not: the XP, the
   * session record and the lesson completion are all written by
   * `completeSession`, which only runs from `finish()`. So a learner who left
   * mid-lesson by any route other than the close button kept the memory
   * updates and lost the reward, which reads as having lost everything.
   *
   * Empty deps deliberately, with everything read from refs. Listing the
   * callbacks instead would run this cleanup on every dependency change rather
   * than on unmount, committing the session out from under a learner who is
   * still in it.
   */
  useEffect(() => {
    /**
     * Captured at setup, read at teardown. The lint rule warns that a ref's
     * `.current` may have moved by the time a cleanup runs — which is exactly
     * what is wanted here, so the refs are bound to locals to say so
     * deliberately rather than silenced.
     */
    const totals = tally;
    const met = newConcepts;
    const done = committed;
    const { source: from, kind: how, title } = identity.current;

    return () => {
      if (done.current) return;
      if (totals.current.answered === 0) return;
      done.current = true;
      completeSession({
        source: from,
        label: title,
        xp: totals.current.xp,
        correct: totals.current.correct,
        total: totals.current.answered,
        seconds: Math.round((Date.now() - startedAt) / 1000),
        newConcepts: met.current.size,
        /**
         * Deliberately not a completion. The XP and the session record are
         * earned by the work done and are banked here; the lesson tick says
         * the lesson was walked, which leaving partway is precisely not.
         */
        lessonId: completedLessonId({ kind: how, source: from, reachedEnd: false }),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Decode the cues now rather than on the first correct answer. A session is
   * the only place they fire, and opening one is already a moment the learner
   * expects to take a beat.
   */
  useEffect(() => {
    primeSounds();
  }, []);

  // Teaching cards mark their concepts as met the moment they are shown.
  useEffect(() => {
    if (!exercise || exercise.form !== 'presentation') return;
    if (exercise.kind === 'cultureCard') return;
    exercise.conceptIds.forEach((id) => {
      if (!learner.concepts[id]?.introduced) newConcepts.current.add(id);
    });
    markIntroduced(exercise.conceptIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise?.id]);

  const finish = useCallback(() => {
    if (committed.current) return;
    committed.current = true;
    const seconds = Math.round((Date.now() - startedAt) / 1000);

    setEnding({
      seconds,
      endedAt: Date.now(),
      // Captured before completeSession commits the XP, so the results screen
      // can say "you crossed a level" rather than only "here is your level".
      levelBefore: levelInfo(learner.xp).level,
      // Achievements are derived, so "new" is a diff against this snapshot.
      learnerBefore: learner,
      before: [...masteryBefore.current.entries()],
      needsReview: [...needsReview.current],
      newConcepts: newConcepts.current.size,
    });

    completeSession({
      source,
      label: plan?.title ?? 'Practice',
      xp: xpEarned,
      correct,
      total: answered,
      seconds,
      newConcepts: newConcepts.current.size,
      lessonId: completedLessonId({ kind, source, reachedEnd: true }),
    });
  }, [answered, completeSession, correct, kind, learner, plan?.title, source, startedAt, xpEarned]);

  const advance = useCallback(() => {
    stopSpeaking();
    setResult(null);
    setTeaching(null);
    setAnswer(null);
    setLastXp(0);

    if (index + 1 >= queue.length) finish();
    else setIndex((value) => value + 1);
  }, [finish, index, queue.length]);

  const submit = useCallback(() => {
    if (!exercise || result !== null) return;

    if (exercise.form === 'presentation') {
      advance();
      return;
    }
    if (answer === null) return;

    const outcome = checkExercise(exercise, answer, settings);

    // Snapshot mastery before the record updates, so the results screen can
    // report what actually moved over the whole session.
    for (const conceptId of exercise.conceptIds) {
      if (masteryBefore.current.has(conceptId)) continue;
      const state = learner.concepts[conceptId];
      masteryBefore.current.set(conceptId, state ? mastery(state) : 0);
    }

    const recorded = recordAnswer({
      exercise,
      grade: outcome.grade,
      given: outcome.given,
      expected: outcome.expected,
    });

    setResult(outcome);
    setTeaching(
      teachingFor(exercise, outcome, {
        level: estimateLevel(learner),
        isKnown: (conceptId) => !!learner.concepts[conceptId]?.introduced,
      }),
    );
    setLastXp(recorded.xp);
    setXpEarned((value) => value + recorded.xp);
    setAnswered((value) => value + 1);

    if (outcome.grade === 'incorrect') {
      feedback.incorrect();
      sound.incorrect();
      setWrongAt(Date.now());
      exercise.conceptIds.forEach((id) => needsReview.current.add(id));
      /**
       * One second pass later in this session, then it belongs to the
       * scheduler — and the second pass is *easier* than the first.
       *
       * Re-queueing the identical exercise meant a learner who could not
       * produce a sentence from nothing was asked to produce it from nothing
       * again, twenty questions later. `buildRetry` steps the support down one
       * rung while keeping the concept and the sentence, so the retry is a way
       * through rather than the same wall.
       */
      if (!retried.current.has(exercise.id)) {
        retried.current.add(exercise.id);
        const retry = buildRetry(exercise, { learner });
        setQueue((prev) => [...prev, retry]);
      }
    } else {
      setCorrect((value) => value + 1);
      feedback.correct();
      sound.correct();
      if (settings.autoPlayAudio && outcome.expected && exerciseSpeaksSpanish(exercise)) {
        speakSpanish(outcome.expected);
      }
    }
  }, [advance, answer, exercise, learner, recordAnswer, result, settings]);

  const confirmExit = useCallback(async () => {
    if (answered === 0) {
      goBack();
      return;
    }
    const leave = await confirm({
      title: 'Leave this session?',
      message: 'Everything you have answered is already saved.',
      confirmLabel: 'Leave',
      cancelLabel: 'Keep going',
      destructive: true,
    });
    if (leave) {
      finish();
      goBack();
    }
  }, [answered, confirm, finish]);

  // --- Empty and finished states -------------------------------------------

  if (!plan || plan.exercises.length === 0) {
    /**
     * An empty mistake queue is a *result*, not a failure to build a session.
     *
     * "Finish a lesson first" is actively wrong for somebody who has finished
     * plenty and simply has nothing outstanding — and the alternative the old
     * generator took, padding the session with unrelated practice so it was
     * never empty, is the behaviour this pass exists to remove. Nothing to fix
     * is the good outcome, so it gets said plainly.
     */
    const noMistakes = kind === 'mistakes';
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.background }]}>
        <View style={styles.emptyBox}>
          <Text variant="heading" center>
            {noMistakes ? 'No mistakes to review' : 'Nothing to practise yet'}
          </Text>
          <Text variant="small" color="textSecondary" center>
            {noMistakes
              ? 'You have put right everything you got wrong. Smart Review is the place to keep it that way.'
              : 'Finish a lesson first — practice sessions are built from what you have already met.'}
          </Text>
          <Button title="Back" onPress={() => goBack()} />
        </View>
      </View>
    );
  }

  if (ending) {
    const todayXp = learner.daily.find((entry) => entry.date === toISODate())?.xp ?? 0;
    const goalXp = settings.dailyGoal * 3;

    // "After" is read from the live learner state, which is now fully updated.
    const improved: ConceptDelta[] = ending.before.map(([conceptId, before]) => {
      const state = learner.concepts[conceptId];
      return {
        conceptId,
        before,
        after: state ? mastery(state, ending.endedAt) : before,
        // Both bands measured from `endedAt`, like every other figure here —
        // the results screen is a record of a session that is over, and a
        // second timestamp would let two lines of the same card disagree.
        bandBefore: masteryBand(
          ending.learnerBefore.concepts[conceptId],
          ending.endedAt,
        ),
        bandAfter: masteryBand(state, ending.endedAt),
      };
    });

    const after = levelInfo(learner.xp);
    const unlocked = newlyUnlocked(ending.learnerBefore, learner);
    const summary: SessionSummary = {
      milestone: crossedMilestone(kind, source, ending, learner),
      streakBefore: ending.learnerBefore.streak,
      unlocked,
      title: plan.title,
      levelBefore: ending.levelBefore,
      levelAfter: after.level,
      levelProgress: after.progress,
      xp: xpEarned,
      correct,
      total: answered,
      seconds: ending.seconds,
      newConcepts: ending.newConcepts,
      improved,
      needsReview: ending.needsReview,
      goalReached: todayXp >= goalXp,
      streak: learner.streak,
    };

    return (
      <ScrollView
        style={[styles.flex, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.resultsContent,
          { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <View style={styles.column}>
          <SessionResults
            summary={summary}
            onContinue={() => goBack()}
            onReviewMistakes={() => {
              router.replace({
                pathname: '/session',
                params: { kind: 'concept', source: 'review-mistakes', concepts: summary.needsReview.join(',') },
              });
            }}
          />
        </View>
      </ScrollView>
    );
  }

  // --- Player ---------------------------------------------------------------

  const canCheck = exercise.form === 'presentation' || answer !== null;
  const progress = total > 0 ? index / total : 0;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <PressScale onPress={confirmExit} scaleTo={0.9} accessibilityLabel="Close session">
          <Icon name="close" size={26} color="textSecondary" />
        </PressScale>
        <View style={styles.flex}>
          <ProgressBar value={progress} height={12} tone={theme.tint} />
        </View>
        <Animated.View style={[styles.xpPill, { backgroundColor: theme.accentSoft }, xpPop]}>
          <Icon name="flash" size={13} tone={theme.accentText} />
          <CountUp
            value={xpEarned}
            duration={Motion.slow}
            variant="caption"
            tone={theme.accentText}
          />
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: result ? 320 : 160 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Shake sits outside the keyed child so it survives the remount —
              the thing being refused is the question you are still on. */}
          <Shake trigger={wrongAt} style={styles.column}>
            <Reveal key={exercise.id} from="right">
              <ExerciseView
                exercise={exercise}
                answer={answer}
                onAnswer={setAnswer}
                result={result}
                settings={settings}
                onSubmit={submit}
              />
              <WhyPanel exercise={exercise} />
            </Reveal>
          </Shake>
        </ScrollView>

        {result === null ? (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: insets.bottom + Spacing.four,
                backgroundColor: theme.background,
                borderTopColor: theme.border,
              },
            ]}>
            <View style={styles.column}>
              <Button
                title={exercise.form === 'presentation' ? 'Got it' : 'Check'}
                size="lg"
                disabled={!canCheck}
                onPress={submit}
              />
            </View>
          </View>
        ) : (
          <FeedbackBar
            result={result}
            xpEarned={lastXp}
            onContinue={advance}
            isLast={index + 1 >= queue.length}
            teaching={teaching}
            given={result.given}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * Whether this session finished a unit, or the stage that unit belongs to.
 *
 * Diffed rather than derived: "the unit is complete" is a state a learner sees
 * every time they open it, and "the unit *just became* complete" is an event
 * that happens once. Only the second is worth celebrating, and the only way to
 * know which one you have is to hold both sides.
 *
 * The stage is checked first because finishing a stage necessarily finishes a
 * unit, and being told both at once would spend the larger moment on the
 * smaller one.
 */
function crossedMilestone(
  kind: SessionKind,
  source: string,
  ending: SessionEnding,
  after: LearnerState,
): Milestone | undefined {
  if (!LESSON_KINDS.includes(kind)) return undefined;

  const unit = getUnitForLesson(source);
  if (!unit) return undefined;

  const { learnerBefore: before, endedAt } = ending;
  const stage = getStageForUnit(unit.id);

  if (
    stage &&
    stageProgress(stage, before, endedAt).state !== 'complete' &&
    stageProgress(stage, after, endedAt).state === 'complete'
  ) {
    return {
      scope: 'stage',
      title: stage.title,
      caption: `${stage.levelRange} complete — every unit in this stage is done.`,
      icon: 'trophy',
      tone: 'accent',
    };
  }

  if (
    unitProgress(unit, before, endedAt).state !== 'complete' &&
    unitProgress(unit, after, endedAt).state === 'complete'
  ) {
    return {
      scope: 'unit',
      title: unit.title,
      caption: 'Unit complete. It stays open — finishing it is not the same as knowing it.',
      icon: unit.icon,
      tone: unit.tone,
    };
  }

  return undefined;
}

/** Only speak back answers that are actually Spanish. */
function exerciseSpeaksSpanish(exercise: Exercise): boolean {
  if (exercise.form === 'typed') return exercise.language === 'es';
  return exercise.form === 'wordBank' || exercise.form === 'conversation';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: Spacing.five },
  emptyBox: { gap: Spacing.four, maxWidth: 320, alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
    minWidth: 46,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    alignItems: 'center',
  },
  resultsContent: { paddingHorizontal: Spacing.four, alignItems: 'center' },
  column: { width: '100%', maxWidth: MaxContentWidth },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
