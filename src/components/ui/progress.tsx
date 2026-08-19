import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useEntrancePop } from '@/components/ui/motion';
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
  /** Stagger position when several bars arrive together. */
  delay?: number;
}

/**
 * A bar that fills.
 *
 * Two things beyond drawing a rectangle. It **springs rather than jumps**,
 * because a bar that snaps to its new width has told you the number changed but
 * not that *you* changed it — the travel is the whole point of showing a bar
 * instead of a percentage. And it **marks the moment it fills**: reaching 100%
 * is the only event in a progress bar's life, and a bar that arrives at full
 * looking exactly like a bar that was always full throws that away.
 *
 * The completion mark is a vertical swell plus one pass of light. Both are
 * gone inside 700ms, and neither fires on the first render — a goal that was
 * already met when the screen opened is not something that just happened.
 */
export function ProgressBar({
  value,
  height = 10,
  tone,
  track,
  animated = true,
  delay = 0,
}: ProgressBarProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const clamped = clamp01(value);

  const width = useSharedValue(clamped);
  const swell = useSharedValue(1);
  const gleam = useSharedValue(-0.5);
  /**
   * Whether this bar has ever been seen short of full. Without it, opening a
   * screen where the daily goal is already complete plays the completion
   * flourish for something the learner finished hours ago.
   */
  const wasPartial = useRef(clamped < 1);

  useEffect(() => {
    width.set(animated ? withDelay(delay, withSpring(clamped, Motion.spring)) : clamped);
  }, [animated, clamped, delay, width]);

  useEffect(() => {
    if (clamped < 1) {
      wasPartial.current = true;
      return;
    }
    if (!wasPartial.current || reduced || !animated) return;
    wasPartial.current = false;

    swell.set(
      withDelay(
        delay + 160,
        withSequence(withTiming(1.55, { duration: 160 }), withSpring(1, Motion.springBouncy)),
      ),
    );
    gleam.set(
      withDelay(
        delay + 160,
        withSequence(
          withTiming(1.5, { duration: 520 }),
          // Parked off the left edge so the next completion sweeps in again
          // rather than starting mid-bar.
          withTiming(-0.5, { duration: 0 }),
        ),
      ),
    );
  }, [animated, clamped, delay, gleam, reduced, swell]);

  const fill = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));
  // Scaling the track rather than the fill keeps the swell centred on the bar's
  // own midline, so a full-width bar puffs symmetrically instead of growing
  // downwards out of its row.
  const swellStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: swell.get() }] }));
  const gleamStyle = useAnimatedStyle(() => ({ left: `${gleam.get() * 100}%` }));

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      style={[
        styles.track,
        { height, borderRadius: Radius.full, backgroundColor: track ?? theme.backgroundSelected },
        swellStyle,
      ]}>
      <Animated.View
        style={[fill, { height, borderRadius: Radius.full, backgroundColor: tone ?? theme.tint }]}
      />
      <Animated.View style={[styles.gleam, { backgroundColor: theme.gleam }, gleamStyle]} />
    </Animated.View>
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
  delay?: number;
}

/**
 * Circular meter used for mastery, accuracy and daily-goal displays.
 *
 * The sweep is a spring rather than a timing so it arrives with a hint of
 * weight, and the label lands a beat after it — the ring draws the result and
 * then the number confirms it, which is one event with two parts rather than
 * two things happening at once.
 */
export function RingProgress({
  value,
  size = 120,
  thickness = 12,
  tone,
  label,
  caption,
  delay = 0,
}: RingProgressProps) {
  const theme = useTheme();
  const clamped = clamp01(value);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const labelPop = useEntrancePop(delay + Motion.slow, 0.72);

  useEffect(() => {
    progress.set(withDelay(delay, withSpring(clamped, Motion.springSoft)));
  }, [clamped, delay, progress]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
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
        <Animated.View style={[styles.ringLabel, labelPop]}>
          <Text variant="title" rounded numeric>
            {label}
          </Text>
          {caption ? (
            <Text variant="caption" color="textSecondary">
              {caption}
            </Text>
          ) : null}
        </Animated.View>
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
  gleam: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 0,
    bottom: 0,
    width: '35%',
    // Skewed so the pass reads as a highlight travelling across a surface
    // rather than a white block sliding along a groove.
    transform: [{ skewX: '-20deg' }],
  },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringLabel: { alignItems: 'center', gap: 2 },
});
