import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
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
 */
export function FeedbackBar({ result, xpEarned, onContinue, isLast }: FeedbackBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
      entering={FadeInDown.duration(220)}
      style={[
        styles.container,
        {
          backgroundColor: scheme.soft,
          paddingBottom: insets.bottom + Spacing.four,
          borderTopColor: scheme.tone,
        },
      ]}>
      <View style={styles.head}>
        <Icon name={scheme.icon} size={24} tone={scheme.tone} />
        <Text variant="subheading" tone={scheme.tone} style={styles.flex}>
          {scheme.title}
        </Text>
        {xpEarned > 0 ? (
          <View style={[styles.xp, { backgroundColor: theme.accent }]}>
            <Text variant="caption" tone={theme.textInverse}>
              +{xpEarned} XP
            </Text>
          </View>
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
