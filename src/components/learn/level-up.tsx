import { Image } from 'expo-image';
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
import { useEffect } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { feedback } from '@/lib/feedback';
import type { Rank } from '@/learning/ranks';

export interface LevelUpProps {
  level: number;
  /** Set when this level also crossed into a new rank. */
  rank?: Rank;
  /** Progress into the new level, so the bar starts near empty and means it. */
  progress: number;
}

/**
 * The moment a level is reached.
 *
 * Reaching a level is the only thing in Unolingo that happens *to* the learner
 * rather than being something they asked for, so it is the one place a
 * celebration is not decoration. Everything else on the results screen is
 * information; this is the reward, and it goes first.
 *
 * The mascot is one asset, so the reaction is carried by motion and by what the
 * rank says — not by a different face. A pop and a settle reads as arriving; a
 * second face would read as a different animal.
 */
export function LevelUp({ level, rank, progress }: LevelUpProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const tone = (rank ? (theme[rank.tone] as string) : theme.accent) ?? theme.accent;

  const scale = useSharedValue(reduced ? 1 : 0.86);
  const lift = useSharedValue(reduced ? 0 : 10);

  useEffect(() => {
    feedback.celebrate();
    if (reduced) return;
    // Arrive, overshoot slightly, settle. One gesture, not a bounce loop.
    scale.set(withSequence(withTiming(1.04, { duration: Motion.base }), withSpring(1, Motion.spring)));
    lift.set(withSpring(0, Motion.spring));
  }, [lift, reduced, scale]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { translateY: lift.get() }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundRaised, borderColor: tone }]}>
      <View style={styles.head}>
        <Animated.View style={mascotStyle}>
          <Image
            source={require('@/assets/images/brand/face.png')}
            style={styles.mascot}
            contentFit="contain"
            accessibilityLabel="Unolingo mascot"
          />
        </Animated.View>

        <View style={styles.flex}>
          <Text variant="overline" tone={tone}>
            LEVEL UP
          </Text>
          <Text variant="title" rounded numeric>
            Level {level}
          </Text>
          {rank ? (
            <Text variant="small" color="textSecondary">
              {rank.tagline}
            </Text>
          ) : null}
        </View>

        {rank ? (
          <Animated.View style={[styles.badge, badgeStyle, { backgroundColor: `${tone}1F` }]}>
            <Icon name={rank.icon as IconName} size={20} tone={tone} />
          </Animated.View>
        ) : null}
      </View>

      {rank ? (
        <View style={[styles.rankTag, { borderColor: tone }]}>
          <Text variant="smallBold" tone={tone}>
            {rank.name}
          </Text>
        </View>
      ) : null}

      <ProgressBar value={progress} height={8} tone={tone} />
    </View>
  );
}

/**
 * A quieter version for the sessions where nothing was crossed — the mascot
 * still turns up, because a results screen with a face on it reads as somebody
 * noticing, and one without reads as a receipt.
 */
export function MascotNote({ accuracy }: { accuracy: number }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0.9);

  useEffect(() => {
    if (!reduced) scale.set(withDelay(120, withSpring(1, Motion.springBouncy)));
  }, [reduced, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  // One asset, so the difference is in the words, not the face.
  const line =
    accuracy >= 0.9
      ? 'Casi todo bien. Sigue así.'
      : accuracy >= 0.7
        ? 'Buen ritmo. Lo tienes.'
        : 'Esto se practica. Nada más.';

  return (
    <View style={styles.note}>
      <Animated.View style={style}>
        <Image
          source={require('@/assets/images/brand/face.png')}
          style={styles.faceSmall}
          contentFit="contain"
          accessibilityLabel="Unolingo mascot"
        />
      </Animated.View>
      <Text variant="small" color="textSecondary" style={styles.flex}>
        {line}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  mascot: { width: 56, height: 56 },
  faceSmall: { width: 34, height: 34 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  note: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
