import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Set false when the screen owns its own scrolling (FlatList, player). */
  scroll?: boolean;
  headerRight?: ReactNode;
  /** Adds bottom padding clear of the tab bar. */
  tabBarPadding?: boolean;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Safe-area aware page frame with a centred, max-width column. */
export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  headerRight,
  tabBarPadding = true,
  background,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const body = (
    <View style={[styles.column, contentStyle]}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="title" rounded>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="small" color="textSecondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {headerRight}
        </View>
      ) : null}
      {children}
    </View>
  );

  const padding = {
    paddingTop: insets.top + Spacing.four,
    paddingBottom: insets.bottom + (tabBarPadding ? BottomTabInset + Spacing.five : Spacing.five),
  };

  return (
    <View style={[styles.flex, { backgroundColor: background ?? theme.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, padding]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, padding]}>{body}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  headerText: { flex: 1, gap: Spacing.one },
});
