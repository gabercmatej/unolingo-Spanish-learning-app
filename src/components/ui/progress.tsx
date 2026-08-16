import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { Motion, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  tone?: string;
  track?: string;
  animated?: boolean;
}

export function ProgressBar({ value, height = 10, tone, track, animated = true }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = clamp01(value);
  const width = useSharedValue(clamped);

  useEffect(() => {
    width.value = animated ? withSpring(clamped, Motion.spring) : clamped;
  }, [clamped, animated, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      style={[
        styles.track,
        { height, borderRadius: Radius.full, backgroundColor: track ?? theme.backgroundSelected },
      ]}>
      <Animated.View
        style={[fill, { height, borderRadius: Radius.full, backgroundColor: tone ?? theme.tint }]}
      />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProgressProps {
  /** 0..1 */
  value: number;
  size?: number;
  thickness?: number;
  tone?: string;
  /** Big centred value, e.g. "87%". */
  label?: string;
  caption?: string;
}

/** Circular meter used for mastery, accuracy and daily-goal displays. */
export function RingProgress({
  value,
  size = 120,
  thickness = 12,
  tone,
  label,
  caption,
}: RingProgressProps) {
  const theme = useTheme();
  const clamped = clamp01(value);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: Motion.slow });
  }, [clamped, progress]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.backgroundSelected}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone ?? theme.tint}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={circleProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label ? (
        <View style={styles.ringLabel}>
          <Text variant="title" rounded>
            {label}
          </Text>
          {caption ? (
            <Text variant="caption" color="textSecondary">
              {caption}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringLabel: { alignItems: 'center', gap: 2 },
});
