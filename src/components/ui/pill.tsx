import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface PillProps {
  label: string;
  icon?: IconName;
  /** Text/icon colour. Background is derived unless `background` is given. */
  tone?: string;
  background?: string;
  size?: 'sm' | 'md';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Compact metadata badge: CEFR level, "informal", "🇪🇸 Spain", topic tags. */
export function Pill({ label, icon, tone, background, size = 'sm', onPress, style }: PillProps) {
  const theme = useTheme();
  const fg = tone ?? theme.textSecondary;
  const bg = background ?? theme.backgroundSunken;

  const body = (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          paddingVertical: size === 'sm' ? 4 : Spacing.two,
          paddingHorizontal: size === 'sm' ? Spacing.two : Spacing.three,
        },
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} tone={fg} /> : null}
      <Text variant={size === 'sm' ? 'caption' : 'smallBold'} tone={fg}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <PressScale onPress={onPress} scaleTo={0.94} accessibilityLabel={label}>
        {body}
      </PressScale>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
});
