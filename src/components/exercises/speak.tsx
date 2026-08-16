import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AudioButton } from '@/components/exercises/audio-button';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SpeakExercise } from '@/learning/exercise';

/**
 * Listen and repeat.
 *
 * Pronunciation *scoring* needs on-device speech recognition, which is not
 * wired up yet — so rather than fake a score, this asks the learner to judge
 * whether they managed it. "Tricky" grades as `almost`, which genuinely
 * shortens the review interval. When recognition arrives it replaces the two
 * buttons and nothing else in the pipeline changes.
 */
export function SpeakView({
  exercise,
  answer,
  onAnswer,
  result,
  settings,
  onSubmit,
}: ExerciseViewProps<SpeakExercise>) {
  const theme = useTheme();
  const [revealed, setRevealed] = useState(false);
  const locked = result !== null;

  return (
    <View style={styles.stack}>
      <Text variant="smallBold" color="textSecondary">
        {exercise.instruction}
      </Text>

      <View style={[styles.card, { backgroundColor: theme.speakingSoft }]}>
        <Icon name="mic-outline" size={22} tone={theme.speaking} />
        <Text variant="es" center>
          {exercise.text}
        </Text>
        {settings.showTranslations || revealed ? (
          <Text variant="small" color="textSecondary" center>
            {exercise.translation}
          </Text>
        ) : null}
      </View>

      <View style={styles.audio}>
        <AudioButton text={exercise.text} defaultSlow={settings.slowAudioDefault} />
      </View>

      {!locked ? (
        <View style={styles.actions}>
          <Button
            title="I said it"
            icon="checkmark"
            tone={theme.speaking}
            onPress={() => {
              onAnswer('said');
              onSubmit?.();
            }}
          />
          <Button
            title="Tricky — bring it back"
            variant="secondary"
            onPress={() => {
              setRevealed(true);
              onAnswer('skip');
              onSubmit?.();
            }}
          />
        </View>
      ) : null}

      {locked && answer === 'skip' ? (
        <Text variant="small" color="textSecondary" center>
          Noted — this one will come round again sooner.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.five },
  card: {
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  audio: { alignItems: 'center' },
  actions: { gap: Spacing.three },
});
