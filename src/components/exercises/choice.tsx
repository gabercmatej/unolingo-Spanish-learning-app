import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AudioButton } from '@/components/exercises/audio-button';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChoiceExercise } from '@/learning/exercise';

/**
 * Covers multiple choice, listening selection, grammar challenges, reading
 * comprehension and "which sounds natural" — they differ in what they ask, not
 * in how the learner answers.
 */
export function ChoiceView({
  exercise,
  answer,
  onAnswer,
  result,
  settings,
  onSubmit,
}: ExerciseViewProps<ChoiceExercise>) {
  const theme = useTheme();
  const selected = answer === null ? -1 : Number.parseInt(answer, 10);
  const locked = result !== null;

  return (
    <View style={styles.stack}>
      <Text variant="smallBold" color="textSecondary">
        {exercise.instruction}
      </Text>

      {exercise.audio ? (
        <View style={styles.audio}>
          <AudioButton
            text={exercise.audio.text}
            autoPlay
            defaultSlow={settings.slowAudioDefault}
          />
        </View>
      ) : null}

      {exercise.passage ? (
        <View style={[styles.passage, { backgroundColor: theme.backgroundSunken }]}>
          {exercise.passage.map((line, index) => (
            <View key={index} style={styles.passageLine}>
              {line.speaker ? (
                <Text variant="caption" color="textTertiary">
                  {line.speaker}
                </Text>
              ) : null}
              <Text variant="esSmall">{line.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {exercise.prompt ? (
        <View style={styles.promptBlock}>
          <Text variant={exercise.promptIsSpanish ? 'es' : 'subheading'}>{exercise.prompt}</Text>
          {exercise.promptSub ? (
            <Text variant="small" color="textSecondary">
              {exercise.promptSub}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.options}>
        {exercise.options.map((option, index) => {
          const isSelected = selected === index;
          const isAnswer = index === exercise.answerIndex;

          let border = theme.border;
          let background = theme.backgroundElement;
          let icon: 'checkmark-circle' | 'close-circle' | null = null;
          let iconTone = theme.text;

          if (locked && isAnswer) {
            border = theme.success;
            background = theme.successSoft;
            icon = 'checkmark-circle';
            iconTone = theme.success;
          } else if (locked && isSelected) {
            border = theme.danger;
            background = theme.dangerSoft;
            icon = 'close-circle';
            iconTone = theme.danger;
          } else if (isSelected) {
            // Deliberately ink rather than brand: the brand is a warm
            // vermilion, and a red-tinted option before checking reads as
            // "you got this wrong".
            border = theme.text;
            background = theme.backgroundSelected;
          }

          return (
            <PressScale
              key={`${option.text}-${index}`}
              disabled={locked}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.text}
              scaleTo={0.98}
              onPress={() => {
                onAnswer(String(index));
                onSubmit?.();
              }}>
              <View style={[styles.option, { borderColor: border, backgroundColor: background }]}>
                <View style={styles.optionText}>
                  <Text variant="bodyBold">{option.text}</Text>
                  {option.sub ? (
                    <Text variant="small" color="textSecondary">
                      {option.sub}
                    </Text>
                  ) : null}
                </View>
                {icon ? (
                  <Animated.View entering={FadeIn.duration(180)}>
                    <Icon name={icon} size={22} tone={iconTone} />
                  </Animated.View>
                ) : null}
              </View>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.five },
  audio: { alignItems: 'center', paddingVertical: Spacing.four },
  promptBlock: { gap: Spacing.one },
  passage: { gap: Spacing.three, padding: Spacing.four, borderRadius: Radius.md },
  passageLine: { gap: 2 },
  options: { gap: Spacing.three },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 2,
    minHeight: 60,
  },
  optionText: { flex: 1, gap: 2 },
});
