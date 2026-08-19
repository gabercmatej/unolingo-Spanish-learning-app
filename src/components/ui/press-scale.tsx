import { useCallback, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Hover, Motion } from '@/constants/theme';
import { feedback } from '@/lib/feedback';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * How a surface reacts to a pointer resting on it.
 *
 * `grow` scales, which is right for small controls. `lift` only translates,
 * which is right for anything large or text-heavy: a scaled layer is
 * resampled during the transition, and on web that shows up as text going
 * momentarily soft — invisible on a 40px chip, obvious across a full-width
 * card.
 */
export type HoverStyle = false | 'grow' | 'lift';

export interface PressScaleProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks. Bigger surfaces should move less. */
  scaleTo?: number;
  haptic?: false | 'tap' | 'press';
  hover?: HoverStyle;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'radio' | 'checkbox' | 'switch' | 'tab';
  accessibilityState?: { selected?: boolean; disabled?: boolean; checked?: boolean };
  testID?: string;
}

/**
 * The standard tappable surface. Springs down on press-in and back on
 * release — the whole app's tactility depends on this being used everywhere
 * rather than bare `Pressable`.
 */
export function PressScale({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  scaleTo = 0.96,
  haptic = 'tap',
  hover = 'grow',
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  /**
   * Whether a pointer is currently resting on this. Kept as a shared value
   * rather than state so that release can read it without a re-render — a
   * mouse that is still hovering when the button comes back up must settle to
   * the hover pose, not to rest. Springing to rest under a stationary cursor
   * is the bug that makes web buttons feel like they forgot you were there.
   */
  const hovering = useSharedValue(false);

  const hoverScale = hover === 'grow' ? Hover.scale : 1;
  const hoverLift = hover === false ? 0 : Hover.lift;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { translateY: translateY.get() }],
    opacity: opacity.get(),
  }));

  /**
   * `.set()` rather than `.value =`. Reanimated has supported both since 3.6,
   * but assigning to `.value` inside a handler created during render reads to the
   * React Compiler as mutating a value it is holding — which it cannot know is a
   * shared value living off the JS thread. The method form says the same thing
   * and says it in a way that survives the lint.
   */
  const pressIn = useCallback(() => {
    scale.set(withSpring(scaleTo, Motion.spring));
    translateY.set(withSpring(0, Motion.spring));
    opacity.set(withTiming(0.92, { duration: Motion.fast }));
  }, [opacity, scale, scaleTo, translateY]);

  const pressOut = useCallback(() => {
    const resting = hovering.get();
    scale.set(withSpring(resting ? hoverScale : 1, Motion.springBouncy));
    translateY.set(withSpring(resting ? hoverLift : 0, Motion.spring));
    opacity.set(withTiming(1, { duration: Motion.fast }));
  }, [hoverLift, hoverScale, hovering, opacity, scale, translateY]);

  /**
   * Hover exists only on web, where a pointer can rest on something without
   * committing. React Native Web maps these onto mouseenter/mouseleave and
   * native simply never fires them, so no platform check is needed.
   */
  const hoverIn = useCallback(() => {
    hovering.set(true);
    if (hover === false) return;
    scale.set(withSpring(hoverScale, Motion.spring));
    translateY.set(withSpring(hoverLift, Motion.spring));
  }, [hover, hoverLift, hoverScale, hovering, scale, translateY]);

  const hoverOut = useCallback(() => {
    hovering.set(false);
    if (hover === false) return;
    scale.set(withSpring(1, Motion.spring));
    translateY.set(withSpring(0, Motion.spring));
  }, [hover, hovering, scale, translateY]);

  const press = useCallback(() => {
    if (haptic === 'tap') feedback.tap();
    else if (haptic === 'press') feedback.press();
    onPress?.();
  }, [haptic, onPress]);

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onHoverIn={hoverIn}
      onHoverOut={hoverOut}
      onPress={press}
      onLongPress={onLongPress}
      style={[
        animatedStyle,
        // The disabled dim has to come *after* the animated style to win, and
        // only when it applies — as an unconditional object it silently
        // overrode the press fade, which is why that fade had never once been
        // visible.
        disabled ? styles.disabled : null,
        !disabled && onPress ? styles.pointer : null,
        style,
      ]}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.45 },
  // A pointer over something clickable is the oldest affordance on the web and
  // React Native Web does not add it for you.
  pointer: Platform.select({ web: { cursor: 'pointer' }, default: {} }) as ViewStyle,
});
