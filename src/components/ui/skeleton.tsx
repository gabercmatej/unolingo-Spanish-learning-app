import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

/**
 * A placeholder for content that is on its way.
 *
 * Unolingo is a local-first app and almost nothing in it waits on anything, so
 * this is deliberately rare — the only genuine wait is the device's list of
 * Spanish voices, which comes back from the OS. That rarity is the argument for
 * having the component at all rather than against it: the alternative pattern,
 * a section that is simply absent until its data exists, makes a slow device
 * look like a device with no Spanish voices, and those are opposite facts.
 *
 * The breath is the one piece of continuous animation in the app, and it is
 * only ever on screen while something is genuinely pending. Under Reduce Motion
 * it holds still at the midpoint — a placeholder still has to read as "not
 * content yet", which is a job the colour does on its own.
 */
export function Skeleton({ width = '100%', height = 16, radius = Radius.sm }: SkeletonProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const breath = useSharedValue(reduced ? 0.5 : 1);

  useEffect(() => {
    if (reduced) return;
    breath.set(
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: Motion.slow + 240 }),
          withTiming(1, { duration: Motion.slow + 240 }),
        ),
        -1,
        false,
      ),
    );
  }, [breath, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: breath.get() }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.backgroundSunken }, style]}
    />
  );
}

/**
 * A stand-in for a list of rows — an icon, a title and a subtitle.
 *
 * Widths vary per row so the block reads as *text* rather than as a bar chart.
 * A column of identical grey rectangles is the tell that separates a loading
 * state somebody designed from one somebody generated.
 */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.rows}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton width={32} height={32} radius={Radius.full} />
          <View style={styles.rowText}>
            <Skeleton width={index % 2 === 0 ? '62%' : '48%'} height={13} />
            <Skeleton width={index % 3 === 0 ? '34%' : '41%'} height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowText: { flex: 1, minWidth: 0, gap: Spacing.two },
});
