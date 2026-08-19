import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { speakSpanish } from '@/lib/speech';

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
 *
 * **And it is tappable.** That started as a place to put a bit of delight and
 * turned out to be the most defensible interaction on the screen: the panda is
 * already saying a real Spanish sentence, so hearing it is another free
 * repetition, on the one surface a learner passes every single day. The tap
 * feedback is the panda leaning in — motion the mascot could plausibly make,
 * rather than a UI element pretending to be a character.
 */
export function Coach({ line, showTranslation = true, size = 72 }: CoachProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  const scale = useSharedValue(reduced ? 1 : 0.82);
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    scale.set(withDelay(80, withSpring(1, Motion.springPop)));
  }, [reduced, scale]);

  const speak = useCallback(() => {
    speakSpanish(line.es);
    if (reduced) return;
    // Lean in and back. Deliberately not the level-up's choreography — that one
    // is a reward and this one is an acknowledgement, and they should not feel
    // like the same event at two volumes.
    scale.set(
      withSequence(withTiming(1.1, { duration: Motion.fast }), withSpring(1, Motion.springBouncy)),
    );
    tilt.set(
      withSequence(withTiming(-6, { duration: Motion.fast }), withSpring(0, Motion.springBouncy)),
    );
  }, [line.es, reduced, scale, tilt]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { rotate: `${tilt.get()}deg` }],
  }));

  return (
    <PressScale
      onPress={speak}
      scaleTo={0.985}
      hover="lift"
      haptic="tap"
      accessibilityLabel={`Hear the coach say: ${line.es}`}>
      <View style={styles.row}>
        <Animated.View style={mascotStyle}>
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
        </Animated.View>

        <View style={[styles.bubble, { backgroundColor: theme.backgroundSunken }]}>
          <View style={[styles.tail, { backgroundColor: theme.backgroundSunken }]} />
          <View style={styles.bubbleText}>
            <Text variant="smallBold">{line.es}</Text>
            {showTranslation ? (
              <Text variant="caption" color="textSecondary">
                {line.en}
              </Text>
            ) : null}
          </View>
          {/* A tappable mascot is not an obvious idea, and an affordance nobody
              finds is the same as one that does not exist. */}
          <Icon name="volume-medium-outline" size={14} color="textTertiary" />
        </View>
      </View>
    </PressScale>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  bubbleText: { flex: 1, minWidth: 0, gap: 2 },
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
