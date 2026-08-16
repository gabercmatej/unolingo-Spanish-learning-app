import { type ReactNode } from 'react';
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
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, Motion.spring);
        opacity.value = withTiming(0.92, { duration: Motion.fast });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.springBouncy);
        opacity.value = withTiming(1, { duration: Motion.fast });
      }}
      onPress={() => {
        if (haptic === 'tap') feedback.tap();
        else if (haptic === 'press') feedback.press();
        onPress?.();
      }}
      onLongPress={onLongPress}
      style={[animatedStyle, { opacity: disabled ? 0.45 : 1 }, style]}>
      {children}
    </AnimatedPressable>
  );
}
