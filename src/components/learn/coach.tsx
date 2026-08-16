import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MASCOT = require('@/assets/images/brand/mascot.png');

/** Intrinsic proportions of `mascot.png`, so callers only set a width. */
const MASCOT_RATIO = 586 / 640;

export interface CoachLine {
  es: string;
  en: string;
}

export interface CoachProps {
  line: CoachLine;
  /** Mirrors the learner's "show English translations" setting. */
  showTranslation?: boolean;
  size?: number;
}

/**
 * The mascot with something to say.
 *
 * The speech bubble is drawn in theme tokens rather than baked into the
 * artwork, which is what lets the line be live, translated and theme-aware —
 * and it keeps one mascot asset serving every message.
 *
 * It speaks Spanish first. A greeting the learner can actually read is a free
 * repetition, so the English sits underneath as a gloss and disappears entirely
 * for anyone running in immersion mode.
 */
export function Coach({ line, showTranslation = true, size = 72 }: CoachProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Image
        source={MASCOT}
        style={{ width: size, height: size * MASCOT_RATIO }}
        contentFit="contain"
        transition={0}
        // Decorative: the bubble beside it already carries the message.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        alt=""
      />

      <View style={[styles.bubble, { backgroundColor: theme.backgroundSunken }]}>
        <View style={[styles.tail, { backgroundColor: theme.backgroundSunken }]} />
        <Text variant="smallBold">{line.es}</Text>
        {showTranslation ? (
          <Text variant="caption" color="textSecondary">
            {line.en}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface CoachState {
  due: number;
  streak: number;
  goalMet: boolean;
  todayXp: number;
}

/**
 * Picks what the mascot says from state the learning layer has already worked
 * out. Ordered by what is most worth saying right now, not by severity — the
 * point is one useful nudge, never a status dump.
 */
export function coachLine({ due, streak, goalMet, todayXp }: CoachState): CoachLine {
  if (goalMet) {
    return {
      es: 'Objetivo cumplido. Sigue si te apetece.',
      en: 'Goal done for today. Keep going if you feel like it.',
    };
  }
  if (due > 0) {
    return {
      es: due === 1 ? 'Tienes 1 concepto para repasar.' : `Tienes ${due} conceptos para repasar.`,
      en: due === 1 ? 'You have 1 concept to review.' : `You have ${due} concepts to review.`,
    };
  }
  if (streak >= 3) {
    return {
      es: `${streak} días seguidos. ¡Qué bien vas!`,
      en: `${streak} days in a row. You are doing well.`,
    };
  }
  if (todayXp > 0) {
    return { es: 'Buen comienzo. Vamos a por más.', en: 'Good start. Let us go for more.' };
  }
  return { es: '¿Empezamos? Con diez minutos vale.', en: 'Shall we start? Ten minutes is plenty.' };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bubble: {
    flex: 1,
    // Flex children size to their content in RN; without this a long line
    // pushes the bubble past the card edge instead of wrapping.
    minWidth: 0,
    gap: 2,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  // A rotated square tucked under the bubble's left edge. Same fill, so the two
  // read as one shape.
  tail: {
    position: 'absolute',
    left: -4,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});
