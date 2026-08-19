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

interface FeedbackBarProps {
  result: ExerciseResult;
  xpEarned: number;
  onContinue: () => void;
  /** Adds a "practise this again" affordance for wrong answers. */
  isLast: boolean;
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
export function FeedbackBar({ result, xpEarned, onContinue, isLast }: FeedbackBarProps) {
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
    almost: {
      tone: theme.warning,
      soft: theme.warningSoft,
      icon: 'alert-circle' as const,
      title: 'Almost!',
    },
    incorrect: {
      tone: theme.danger,
      soft: theme.dangerSoft,
      icon: 'information-circle' as const,
      title: 'Not quite',
    },
  }[result.grade];

  const showAnswer = result.grade !== 'correct' && result.expected.length > 0;

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

      {showAnswer ? (
        <View style={styles.answerRow}>
          <View style={styles.flex}>
            <Text variant="caption" tone={scheme.tone}>
              ANSWER
            </Text>
            <Text variant="esSmall" tone={scheme.tone}>
              {result.expected}
            </Text>
          </View>
          <SpeakIcon text={result.expected} tone={scheme.tone} />
        </View>
      ) : null}

      {result.note ? (
        <Text variant="small" tone={scheme.tone}>
          {result.note}
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
  xp: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
});
