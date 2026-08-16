import { ScrollView, StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Scrolls horizontally when there are more options than fit. */
  scrollable?: boolean;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  scrollable,
}: SegmentedProps<T>) {
  const theme = useTheme();

  const chips = options.map((option) => {
    const active = option.value === value;
    return (
      <PressScale
        key={option.value}
        onPress={() => onChange(option.value)}
        scaleTo={0.95}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={option.label}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: active ? theme.text : theme.backgroundElement,
              borderColor: active ? theme.text : theme.border,
            },
          ]}>
          <Text variant="smallBold" tone={active ? theme.background : theme.textSecondary}>
            {option.label}
          </Text>
          {option.count !== undefined ? (
            <Text variant="caption" tone={active ? theme.background : theme.textTertiary}>
              {option.count}
            </Text>
          ) : null}
        </View>
      </PressScale>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}>
        {chips}
      </ScrollView>
    );
  }
  return <View style={styles.row}>{chips}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  scrollRow: { flexDirection: 'row', gap: Spacing.two, paddingRight: Spacing.four },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
