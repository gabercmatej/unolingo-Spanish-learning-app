import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AudioButton } from '@/components/exercises/audio-button';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { Icon } from '@/components/ui/icon';
import { stagger, useEntrancePop, usePop, useShake } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
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
        {exercise.options.map((option, index) => (
          <Option
            key={`${option.text}-${index}`}
            text={option.text}
            sub={option.sub}
            index={index}
            locked={locked}
            isSelected={selected === index}
            isAnswer={index === exercise.answerIndex}
            onPress={() => {
              onAnswer(String(index));
              onSubmit?.();
            }}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * One answer option.
 *
 * Split out of the map so it can hold hooks, which buys the two things that
 * make the verdict land: the right answer **pops** and a wrong pick **shakes**.
 * Colour alone states the outcome, but it states it in the past tense — by the
 * time the eye has read a green border the moment has gone. Motion puts the
 * verdict on the frame the learner is already looking at.
 *
 * Both are driven off `locked`, so they fire once when the answer is graded and
 * never on selection.
 */
function Option({
  text,
  sub,
  index,
  locked,
  isSelected,
  isAnswer,
  onPress,
}: {
  text: string;
  sub?: string;
  index: number;
  locked: boolean;
  isSelected: boolean;
  isAnswer: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  const revealed = locked && isAnswer;
  const wrongPick = locked && isSelected && !isAnswer;

  const pop = usePop(revealed, { scale: 1.04 });
  const shake = useShake(wrongPick ? index : null, 6);
  const iconPop = useEntrancePop(0, 0.4);

  let border = theme.border;
  let background = theme.backgroundElement;
  let icon: 'checkmark-circle' | 'close-circle' | null = null;
  let iconTone = theme.text;

  if (revealed) {
    border = theme.success;
    background = theme.successSoft;
    icon = 'checkmark-circle';
    iconTone = theme.success;
  } else if (wrongPick) {
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
    <Animated.View
      entering={FadeIn.duration(Motion.base).delay(stagger(index))}
      style={[pop, shake]}>
      <PressScale
        disabled={locked}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={text}
        scaleTo={0.98}
        hover="lift"
        onPress={onPress}>
        <View style={[styles.option, { borderColor: border, backgroundColor: background }]}>
          <View style={styles.optionText}>
            <Text variant="bodyBold">{text}</Text>
            {sub ? (
              <Text variant="small" color="textSecondary">
                {sub}
              </Text>
            ) : null}
          </View>
          {icon ? (
            <Animated.View style={iconPop}>
              <Icon name={icon} size={22} tone={iconTone} />
            </Animated.View>
          ) : null}
        </View>
      </PressScale>
    </Animated.View>
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
