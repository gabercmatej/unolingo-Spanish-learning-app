import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView } from '@/components/exercises';
import { useConfirm } from '@/components/ui/confirm';
import { FeedbackBar } from '@/components/learn/feedback-bar';
import {
  SessionResults,
  type ConceptDelta,
  type SessionSummary,
} from '@/components/learn/session-results';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { checkExercise, type ExerciseResult } from '@/learning/check';
import type { Exercise } from '@/learning/exercise';
import { buildSession, type SessionKind } from '@/learning/session';
import { mastery } from '@/learning/srs';
import type { LearnerState } from '@/learning/types';
import { levelInfo } from '@/learning/xp';
import { newlyUnlocked } from '@/learning/achievements';
import { toISODate } from '@/lib/date';
import { feedback } from '@/lib/feedback';
import { goBack } from '@/lib/navigation';
import { speakSpanish, stopSpeaking } from '@/lib/speech';

/**
 * The session player — the core loop.
 *
 * One screen runs every kind of session: lessons, Smart Review, conversations,
 * stories and every practice mode. It owns the queue, the grading, the feedback
 * moment and the results, so those behave identically no matter how the session
 * was started.
 *
 * A wrong answer re-queues the exercise once, later in the same session. Once —
 * repeating it until you get it right teaches the answer, not the language; the
 * spaced-repetition schedule handles the rest across days.
 */
/** Session kinds that count as completing a lesson on the path. */
const LESSON_KINDS: SessionKind[] = ['lesson', 'conversation', 'story', 'checkpoint'];

/** The session as it stood when it ended — see `ending` below for why. */
interface SessionEnding {
  seconds: number;
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
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, source, params.concepts],
  );

  const [queue, setQueue] = useState<Exercise[]>(() => plan?.exercises ?? []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [lastXp, setLastXp] = useState(0);
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

  const exercise = queue[index];
  const total = queue.length;

  useEffect(() => () => stopSpeaking(), []);

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
      lessonId: LESSON_KINDS.includes(kind) ? source : undefined,
    });
  }, [answered, completeSession, correct, kind, learner, plan?.title, source, startedAt, xpEarned]);

  const advance = useCallback(() => {
    stopSpeaking();
    setResult(null);
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
    setLastXp(recorded.xp);
    setXpEarned((value) => value + recorded.xp);
    setAnswered((value) => value + 1);

    if (outcome.grade === 'incorrect') {
      feedback.incorrect();
      exercise.conceptIds.forEach((id) => needsReview.current.add(id));
      // One second pass later in this session, then it belongs to the scheduler.
      if (!retried.current.has(exercise.id)) {
        retried.current.add(exercise.id);
        setQueue((prev) => [...prev, exercise]);
      }
    } else {
      setCorrect((value) => value + 1);
      feedback.correct();
      if (settings.autoPlayAudio && outcome.expected && exerciseSpeaksSpanish(exercise)) {
        speakSpanish(outcome.expected);
      }
    }
  }, [advance, answer, exercise, learner.concepts, recordAnswer, result, settings]);

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
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.background }]}>
        <View style={styles.emptyBox}>
          <Text variant="heading" center>
            Nothing to practise yet
          </Text>
          <Text variant="small" color="textSecondary" center>
            Finish a lesson first — practice sessions are built from what you have already met.
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
      return { conceptId, before, after: state ? mastery(state) : before };
    });

    const after = levelInfo(learner.xp);
    const unlocked = newlyUnlocked(ending.learnerBefore, learner);
    const summary: SessionSummary = {
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
        <View style={[styles.xpPill, { backgroundColor: theme.accentSoft }]}>
          <Icon name="flash" size={13} tone={theme.accentText} />
          <Text variant="caption" tone={theme.accentText}>
            {xpEarned}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: result ? 320 : 160 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.column} key={exercise.id}>
            <ExerciseView
              exercise={exercise}
              answer={answer}
              onAnswer={setAnswer}
              result={result}
              settings={settings}
              onSubmit={submit}
            />
          </View>
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
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
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
