import { useCallback, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/constants/theme';
import { feedback } from '@/lib/feedback';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressScaleProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks. Bigger surfaces should move less. */
  scaleTo?: number;
  haptic?: false | 'tap' | 'press';
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
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
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
    opacity.set(withTiming(0.92, { duration: Motion.fast }));
  }, [opacity, scale, scaleTo]);

  const pressOut = useCallback(() => {
    scale.set(withSpring(1, Motion.springBouncy));
    opacity.set(withTiming(1, { duration: Motion.fast }));
  }, [opacity, scale]);

  /**
   * Hover exists only on web, where a pointer can rest on something without
   * committing. React Native Web maps these onto mouseenter/mouseleave and
   * native simply never fires them, so no platform check is needed — the lift is
   * deliberately smaller than the press so the two read as different states
   * rather than as the same one at two strengths.
   */
  const hoverIn = useCallback(() => {
    scale.set(withSpring(1.02, Motion.spring));
  }, [scale]);

  const hoverOut = useCallback(() => {
    scale.set(withSpring(1, Motion.spring));
  }, [scale]);

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
      style={[animatedStyle, { opacity: disabled ? 0.45 : 1 }, style]}>
      {children}
    </AnimatedPressable>
  );
}
