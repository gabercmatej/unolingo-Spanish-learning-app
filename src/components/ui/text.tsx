import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { Fonts, Type, type ThemeColor, type TypeToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface TextProps extends RNTextProps {
  variant?: TypeToken;
  color?: ThemeColor;
  /** Overrides `color` with a raw value — use for channel colours. */
  tone?: string;
  center?: boolean;
  /** iOS rounded system face. Used for numerals and playful headings. */
  rounded?: boolean;
  /**
   * Fixed-width digits. Set it on anything that counts, ticks or animates —
   * a proportional `1` is narrower than a `7`, so an XP total or a percentage
   * visibly jitters as it changes and columns of figures fail to line up.
   */
  numeric?: boolean;
}

/**
 * The only text component in the app. Always pick a `variant` from the ramp
 * rather than setting fontSize inline.
 */
export function Text({
  variant = 'body',
  color = 'text',
  tone,
  center,
  rounded,
  numeric,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const spec = Type[variant] as TextStyle;

  return (
    <RNText
      style={[
        spec,
        { color: tone ?? theme[color] },
        rounded ? { fontFamily: Fonts.rounded } : null,
        numeric ? styles.numeric : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
});
