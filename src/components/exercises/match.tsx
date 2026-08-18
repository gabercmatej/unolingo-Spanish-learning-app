import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseViewProps } from '@/components/exercises/shared';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MatchExercise } from '@/learning/exercise';
import { feedback } from '@/lib/feedback';
import { speakSpanish } from '@/lib/speech';

/**
 * Tap a Spanish word, then its English meaning. Completing without a wrong tap
 * grades as correct; needing a second go grades as "almost", which is honest
 * about the difference without making a matching grid feel punishing.
 */
export function MatchView({ exercise, onAnswer, result }: ExerciseViewProps<MatchExercise>) {
  const theme = useTheme();
  const locked = result !== null;

  const [selectedEs, setSelectedEs] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);

  const english = [...exercise.pairs].sort((a, b) => a.en.localeCompare(b.en));

  useEffect(() => {
    if (matched.length === exercise.pairs.length && exercise.pairs.length > 0) {
      onAnswer(errors === 0 ? 'perfect' : 'imperfect');
    } else {
      onAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, errors]);

  const tapEnglish = (en: string) => {
    if (!selectedEs || locked) return;
    const pair = exercise.pairs.find((p) => p.es === selectedEs);
    if (pair && pair.en === en) {
      feedback.correct();
      setMatched((prev) => [...prev, selectedEs]);
      setSelectedEs(null);
    } else {
      feedback.incorrect();
      setErrors((count) => count + 1);
      setWrong(en);
      setTimeout(() => setWrong(null), 420);
      setSelectedEs(null);
    }
  };

  return (
    <View style={styles.stack}>
      <Text variant="smallBold" color="textSecondary">
        {exercise.instruction}
      </Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          {exercise.pairs.map((pair) => {
            const isMatched = matched.includes(pair.es);
            const isSelected = selectedEs === pair.es;
            return (
              <PressScale
                key={pair.es}
                disabled={isMatched || locked}
                onPress={() => {
                  setSelectedEs(pair.es);
                  speakSpanish(pair.es);
                }}
                scaleTo={0.96}
                accessibilityLabel={pair.es}>
                <View
                  style={[
                    styles.tile,
                    {
                      backgroundColor: isMatched
                        ? theme.successSoft
                        : isSelected
                          ? theme.tintSoft
                          : theme.backgroundElement,
                      borderColor: isMatched
                        ? theme.success
                        : isSelected
                          ? theme.tint
                          : theme.border,
                      opacity: isMatched ? 0.55 : 1,
                    },
                  ]}>
                  <Text variant="smallBold" center>
                    {pair.es}
                  </Text>
                </View>
              </PressScale>
            );
          })}
        </View>

        <View style={styles.column}>
          {english.map((pair) => {
            const isMatched = matched.includes(pair.es);
            const isWrong = wrong === pair.en;
            return (
              <PressScale
                key={pair.en}
                disabled={isMatched || locked}
                onPress={() => tapEnglish(pair.en)}
                scaleTo={0.96}
                accessibilityLabel={pair.en}>
                <View
                  style={[
                    styles.tile,
                    {
                      backgroundColor: isMatched
                        ? theme.successSoft
                        : isWrong
                          ? theme.dangerSoft
                          : theme.backgroundElement,
                      borderColor: isMatched
                        ? theme.success
                        : isWrong
                          ? theme.danger
                          : theme.border,
                      opacity: isMatched ? 0.55 : 1,
                    },
                  ]}>
                  <Text variant="small" center>
                    {pair.en}
                  </Text>
                </View>
              </PressScale>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.five },
  columns: { flexDirection: 'row', gap: Spacing.three },
  column: { flex: 1, gap: Spacing.three },
  tile: {
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
