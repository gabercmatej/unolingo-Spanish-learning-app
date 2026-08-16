import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressScale } from '@/components/ui/press-scale';
import { Elevation, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** `sunken` for grouped lists, `outline` for low-emphasis blocks. */
  variant?: 'raised' | 'flat' | 'sunken' | 'outline';
  padding?: keyof typeof Spacing | 'none';
  tone?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  children,
  onPress,
  variant = 'raised',
  padding = 'five',
  tone,
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();

  const background =
    tone ??
    {
      raised: theme.backgroundRaised,
      flat: theme.backgroundElement,
      sunken: theme.backgroundSunken,
      outline: 'transparent',
    }[variant];

  /**
   * A cast shadow is what separates `raised` from `flat` — except in dark mode,
   * where a shadow on a near-black page is invisible and the two variants
   * collapse into the same slab. So `raised` also gets a lighter surface and a
   * lit top edge, which is how depth actually reads on dark.
   */
  const raised = variant === 'raised';

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: background,
      padding: padding === 'none' ? 0 : Spacing[padding],
      borderWidth: variant === 'outline' || variant === 'flat' || raised ? 1 : 0,
      borderColor: raised ? theme.highlight : theme.border,
      shadowColor: theme.shadow,
    },
    raised ? Elevation.card : null,
    style,
  ];

  if (onPress) {
    return (
      <PressScale
        onPress={onPress}
        scaleTo={0.985}
        haptic="press"
        accessibilityLabel={accessibilityLabel}
        style={cardStyle}>
        {children}
      </PressScale>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    gap: Spacing.three,
    overflow: 'hidden',
  },
});
