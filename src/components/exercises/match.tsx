import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { ExerciseViewProps } from '@/components/exercises/shared';
import { usePop, useShake } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MatchExercise } from '@/learning/exercise';
import { feedback } from '@/lib/feedback';
import { sound } from '@/lib/sound';
import { speakSpanish } from '@/lib/speech';

/**
 * Tap a Spanish word, then its English meaning. Completing without a wrong tap
 * grades as correct; needing a second go grades as "almost", which is honest
 * about the difference without making a matching grid feel punishing.
 *
 * A mismatch is the one place inside an exercise that gets a sound of its own.
 * Every other cue in the app fires on a *graded* answer, and a matching grid
 * has four to six correct taps before it reaches one — chiming on each would
 * turn the most repetitive exercise in the course into the loudest. A wrong
 * pair is rare, is the only moment here that needs an answer, and the grid
 * carries on afterwards with nothing else to mark it.
 */
export function MatchView({ exercise, onAnswer, result }: ExerciseViewProps<MatchExercise>) {
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
      sound.incorrect();
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
          {exercise.pairs.map((pair) => (
            <Tile
              key={pair.es}
              label={pair.es}
              spanish
              matched={matched.includes(pair.es)}
              selected={selectedEs === pair.es}
              wrong={false}
              disabled={locked}
              onPress={() => {
                setSelectedEs(pair.es);
                speakSpanish(pair.es);
              }}
            />
          ))}
        </View>

        <View style={styles.column}>
          {english.map((pair) => (
            <Tile
              key={pair.en}
              label={pair.en}
              matched={matched.includes(pair.es)}
              selected={false}
              wrong={wrong === pair.en}
              disabled={locked}
              onPress={() => tapEnglish(pair.en)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * One tile in either column.
 *
 * Pairing off is the entire loop of this exercise, so the pop on `matched` is
 * the feedback that makes the grid feel like a game rather than a form — and it
 * fires on both halves at once, which is what draws the eye to the fact that
 * *two* things just resolved. The shake on a wrong tap is the same gesture the
 * session player uses when an answer is refused; reusing it means a learner
 * only ever has to learn one vocabulary of "not that".
 */
function Tile({
  label,
  spanish,
  matched,
  selected,
  wrong,
  disabled,
  onPress,
}: {
  label: string;
  spanish?: boolean;
  matched: boolean;
  selected: boolean;
  wrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const pop = usePop(matched, { scale: 1.06 });
  const shake = useShake(wrong ? label : null, 5);

  return (
    <Animated.View style={[pop, shake]}>
      <PressScale
        disabled={matched || disabled}
        onPress={onPress}
        scaleTo={0.96}
        accessibilityLabel={label}>
        <View
          style={[
            styles.tile,
            {
              backgroundColor: matched
                ? theme.successSoft
                : wrong
                  ? theme.dangerSoft
                  : selected
                    ? theme.tintSoft
                    : theme.backgroundElement,
              borderColor: matched
                ? theme.success
                : wrong
                  ? theme.danger
                  : selected
                    ? theme.tint
                    : theme.border,
              opacity: matched ? 0.55 : 1,
            },
          ]}>
          <Text variant={spanish ? 'smallBold' : 'small'} center>
            {label}
          </Text>
        </View>
      </PressScale>
    </Animated.View>
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
