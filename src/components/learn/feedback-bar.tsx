import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CountUp, useEntrancePop } from '@/components/ui/motion';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseResult } from '@/learning/check';
import type { Teaching } from '@/learning/teaching';

interface FeedbackBarProps {
  result: ExerciseResult;
  xpEarned: number;
  onContinue: () => void;
  /** Adds a "practise this again" affordance for wrong answers. */
  isLast: boolean;
  /**
   * The one extra thing this answer is worth teaching. See `learning/teaching.ts`
   * — the policy lives there so the bar renders a decision rather than making
   * one, and so it can be tested without a renderer.
   */
  teaching?: Teaching | null;
  /** What the learner actually gave, shown beside the model answer when wrong. */
  given?: string;
}

/**
 * The moment after answering. A wrong answer is never scolded — it shows the
 * right answer and explains why, because that explanation is the whole reason
 * the mistake was worth making.
 *
 * It rises from the bottom edge on a spring rather than fading down from above.
 * The bar lives at the bottom of the screen, so entering downwards meant it
 * arrived travelling away from where it came from — a small thing that reads,
 * without being nameable, as the interface not knowing its own geography.
 */
export function FeedbackBar({
  result,
  xpEarned,
  onContinue,
  isLast,
  teaching,
  given,
}: FeedbackBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  // The verdict icon is the first thing the eye goes to, so it is the one thing
  // here allowed to overshoot.
  const iconPop = useEntrancePop(60, 0.5);
  const xpPop = useEntrancePop(140, 0.6);

  const scheme = {
    correct: {
      tone: theme.success,
      soft: theme.successSoft,
      icon: 'checkmark-circle' as const,
      title: '¡Bien!',
    },
    correctWithFeedback: {
      tone: theme.success,
      soft: theme.successSoft,
      icon: 'checkmark-circle' as const,
      title: '¡Bien!',
    },
    incorrect: {
      tone: theme.danger,
      soft: theme.dangerSoft,
      icon: 'information-circle' as const,
      title: 'Not quite',
    },
  }[result.verdict];

  /**
   * Shown whenever there is something to learn from, not only when the answer
   * was wrong. A learner who wrote "pleased to meet you" understood the
   * Spanish perfectly and should still see the wording the course prefers,
   * the old rule keyed off `correct`, so it suppressed the teaching in
   * exactly the case the teaching existed for.
   */
  const showAnswer = result.error !== 'none' && result.expected.length > 0;
  /**
   * Only worth showing beside the model answer when the two are actually
   * different to look at — echoing "hola" back at somebody who typed "hola"
   * with a missing accent is a comparison with nothing in it.
   */
  const showGiven =
    showAnswer &&
    !!given &&
    given.trim().length > 0 &&
    given.trim().toLowerCase() !== result.expected.trim().toLowerCase();

  const note = teaching?.note ?? result.note;

  return (
    <Animated.View
      entering={
        reduced
          ? FadeIn.duration(Motion.fast)
          : SlideInDown.springify().damping(20).stiffness(190).mass(0.9)
      }
      style={[
        styles.container,
        {
          backgroundColor: scheme.soft,
          paddingBottom: insets.bottom + Spacing.four,
          borderTopColor: scheme.tone,
        },
      ]}>
      <View style={styles.head}>
        <Animated.View style={iconPop}>
          <Icon name={scheme.icon} size={24} tone={scheme.tone} />
        </Animated.View>
        <Text variant="subheading" tone={scheme.tone} style={styles.flex}>
          {scheme.title}
        </Text>
        {xpEarned > 0 ? (
          <Animated.View style={[styles.xp, { backgroundColor: theme.accent }, xpPop]}>
            <CountUp
              value={xpEarned}
              duration={Motion.slow}
              format={(value) => `+${value} XP`}
              variant="caption"
              tone={theme.textInverse}
            />
          </Animated.View>
        ) : null}
      </View>

      {showGiven ? (
        <View>
          <Text variant="caption" tone={scheme.tone}>
            YOU WROTE
          </Text>
          <Text
            variant="esSmall"
            tone={scheme.tone}
            style={result.verdict === 'incorrect' ? styles.given : undefined}>
            {given}
          </Text>
        </View>
      ) : null}

      {showAnswer ? (
        <View style={styles.answerRow}>
          <View style={styles.flex}>
            <Text variant="caption" tone={scheme.tone}>
              {result.verdict === 'incorrect' ? (showGiven ? 'BETTER' : 'ANSWER') : 'PREFERRED'}
            </Text>
            <Text variant="esSmall" tone={scheme.tone}>
              {result.expected}
            </Text>
          </View>
          <SpeakIcon text={result.expected} tone={scheme.tone} />
        </View>
      ) : null}

      {/*
        The teaching moment. On a correct listening answer this is the whole
        point of the bar: the learner heard it, picked it, and still may have no
        idea what it meant.
      */}
      {teaching?.es ? (
        <View style={[styles.reveal, { borderColor: scheme.tone }]}>
          <View style={styles.answerRow}>
            <Text variant="esSmall" tone={scheme.tone} style={styles.flex}>
              {teaching.es}
            </Text>
            <SpeakIcon text={teaching.es} tone={scheme.tone} />
          </View>
          {teaching.en ? (
            <Text variant="small" tone={scheme.tone}>
              {teaching.en}
            </Text>
          ) : null}
        </View>
      ) : null}

      {teaching?.newToYou.length ? (
        <View style={styles.newRow}>
          <Icon name="sparkles" size={13} tone={scheme.tone} />
          <Text variant="caption" tone={scheme.tone} style={styles.flex}>
            {teaching.untaught && result.verdict === 'incorrect' ? 'New here, not your fault: ' : 'New here: '}
            {teaching.newToYou
              .map((entry) => (entry.meaning ? `${entry.label}: ${entry.meaning}` : entry.label))
              .join(' · ')}
          </Text>
        </View>
      ) : null}

      {note ? (
        <Text variant="small" tone={scheme.tone}>
          {note}
        </Text>
      ) : null}

      <Button
        title={isLast ? 'See results' : 'Continue'}
        tone={scheme.tone}
        onPress={onContinue}
        size="lg"
        iconRight="arrow-forward"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 3,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  given: { textDecorationLine: 'line-through', opacity: 0.75 },
  reveal: {
    gap: Spacing.one,
    paddingLeft: Spacing.three,
    borderLeftWidth: 3,
  },
  newRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  xp: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
});
