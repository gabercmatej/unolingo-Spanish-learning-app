import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { AudioButton } from '@/components/exercises/audio-button';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WordBankExercise } from '@/learning/exercise';

interface Token {
  id: string;
  text: string;
}

/** Reconstruct the sentence from a shuffled bank of words. */
export function WordBankView({
  exercise,
  onAnswer,
  result,
  settings,
}: ExerciseViewProps<WordBankExercise>) {
  const theme = useTheme();
  const locked = result !== null;

  const [bank, setBank] = useState<Token[]>(() =>
    exercise.tokens.map((text, index) => ({ id: `${index}-${text}`, text })),
  );
  const [line, setLine] = useState<Token[]>([]);

  useEffect(() => {
    setBank(exercise.tokens.map((text, index) => ({ id: `${index}-${text}`, text })));
    setLine([]);
  }, [exercise.id, exercise.tokens]);

  useEffect(() => {
    onAnswer(line.length > 0 ? line.map((token) => token.text).join(' ') : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  const take = (token: Token) => {
    if (locked) return;
    setBank((prev) => prev.filter((item) => item.id !== token.id));
    setLine((prev) => [...prev, token]);
  };

  const put = (token: Token) => {
    if (locked) return;
    setLine((prev) => prev.filter((item) => item.id !== token.id));
    setBank((prev) => [...prev, token]);
  };

  const lineTone = locked
    ? result.grade === 'incorrect'
      ? theme.danger
      : theme.success
    : theme.borderStrong;

  return (
    <View style={styles.stack}>
      <Text variant="smallBold" color="textSecondary">
        {exercise.instruction}
      </Text>

      {exercise.audio ? (
        <View style={styles.audio}>
          <AudioButton
            text={exercise.audio.text}
            autoPlay={exercise.audio.hideText}
            size="sm"
            defaultSlow={settings.slowAudioDefault}
          />
        </View>
      ) : null}

      <Text variant="subheading">{exercise.prompt}</Text>

      <Animated.View
        layout={LinearTransition.duration(180)}
        style={[styles.line, { borderColor: lineTone, backgroundColor: theme.backgroundElement }]}>
        {line.length === 0 ? (
          <Text variant="small" color="textTertiary">
            Tap the words below
          </Text>
        ) : (
          line.map((token) => (
            <PressScale key={token.id} onPress={() => put(token)} scaleTo={0.92} disabled={locked}>
              <View style={[styles.token, { backgroundColor: theme.tintSoft, borderColor: theme.tint }]}>
                <Text variant="bodyBold" tone={theme.tintText}>
                  {token.text}
                </Text>
              </View>
            </PressScale>
          ))
        )}
      </Animated.View>

      <Animated.View layout={LinearTransition.duration(180)} style={styles.bank}>
        {bank.map((token) => (
          <PressScale key={token.id} onPress={() => take(token)} scaleTo={0.92} disabled={locked}>
            <View
              style={[
                styles.token,
                { backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong },
              ]}>
              <Text variant="bodyBold">{token.text}</Text>
            </View>
          </PressScale>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.five },
  audio: { alignItems: 'center' },
  line: {
    minHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignContent: 'flex-start',
  },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  token: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
  },
});
