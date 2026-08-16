import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PressScale } from '@/components/ui/press-scale';
import { Elevation, Motion, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB = 26;
const INSET = (TRACK_HEIGHT - THUMB) / 2;
const TRAVEL = TRACK_WIDTH - THUMB - INSET * 2;

/**
 * The app's switch.
 *
 * React Native's `Switch` is a different control on each platform: iOS honours
 * `trackColor`, Android tints from the platform accent, and React Native Web
 * falls back to its own teal — so one switch rendered in three colours, none of
 * them ours. This draws the whole control instead, the same way `Segmented` and
 * `confirm` do, which is the only way to hold cross-platform parity.
 *
 * "On" is the page inverted — near-black in light, near-white in dark — rather
 * than a brand colour. A settings list is a column of these, and a column of
 * saturated tint reads as alarm rather than state.
 */
export function Toggle({ value, onValueChange, disabled, accessibilityLabel }: ToggleProps) {
  const theme = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, Motion.spring);
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.backgroundSelected, theme.text],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [theme.textTertiary, theme.background]),
  }));

  return (
    <PressScale
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      scaleTo={0.92}
      haptic="tap"
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, { shadowColor: theme.shadow }, thumbStyle]} />
      </Animated.View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: Radius.full,
    padding: INSET,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radius.full,
    ...Elevation.card,
  },
});
