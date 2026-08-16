import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type GradientName } from '@/constants/theme';
import { useGradients, useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  /** Overrides the variant background — used for channel-coloured actions. */
  tone?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 38, md: 50, lg: 58 };
const PAD: Record<ButtonSize, number> = { sm: Spacing.three, md: Spacing.five, lg: Spacing.five };

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  loading,
  full = true,
  tone,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const gradients = useGradients();

  const scheme: { bg: string; fg: string; border: string; ramp?: GradientName } = {
    primary: { bg: tone ?? theme.tint, fg: theme.onTint, border: 'transparent', ramp: 'tint' as const },
    success: { bg: tone ?? theme.success, fg: theme.onTint, border: 'transparent', ramp: 'success' as const },
    danger: { bg: tone ?? theme.danger, fg: theme.onTint, border: 'transparent', ramp: 'danger' as const },
    secondary: { bg: theme.backgroundElement, fg: tone ?? theme.text, border: theme.borderStrong },
    ghost: { bg: 'transparent', fg: tone ?? theme.textSecondary, border: 'transparent' },
  }[variant];

  /**
   * The filled variants carry a gradient so the primary action reads as the one
   * lit object on the page. A caller-supplied `tone` opts out: a channel colour
   * is a single hex with no ramp to interpolate, and inventing one would drift
   * off the channel it is meant to identify.
   */
  const ramp = scheme.ramp && !tone ? gradients[scheme.ramp] : undefined;

  return (
    <PressScale
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      haptic="press"
      scaleTo={0.97}
      accessibilityLabel={title}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: PAD[size],
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ]}>
      {ramp ? (
        <LinearGradient
          colors={ramp}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={scheme.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 19} tone={scheme.fg} /> : null}
          <Text
            variant={size === 'lg' ? 'subheading' : size === 'sm' ? 'smallBold' : 'bodyBold'}
            tone={scheme.fg}
            numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? (
            <Icon name={iconRight} size={size === 'sm' ? 16 : 19} tone={scheme.fg} />
          ) : null}
        </View>
      )}
    </PressScale>
  );
}

/** Shallow diagonal — steep enough to read as lit, flat enough not to band. */
const GRADIENT_START = { x: 0, y: 0 } as const;
const GRADIENT_END = { x: 1, y: 1 } as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Clips the gradient to the corner radius.
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
