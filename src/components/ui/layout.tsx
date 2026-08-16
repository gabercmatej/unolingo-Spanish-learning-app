import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SectionProps {
  title: string;
  caption?: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Titled block. Use for every group of content on a tab screen. */
export function Section({ title, caption, action, children, style }: SectionProps) {
  const theme = useTheme();
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <View style={styles.flex}>
          <Text variant="overline" color="textTertiary">
            {title.toUpperCase()}
          </Text>
          {caption ? (
            <Text variant="small" color="textSecondary">
              {caption}
            </Text>
          ) : null}
        </View>
        {action ? (
          <PressScale onPress={action.onPress} scaleTo={0.94}>
            <Text variant="smallBold" tone={theme.tint}>
              {action.label}
            </Text>
          </PressScale>
        ) : null}
      </View>
      {children}
    </View>
  );
}

interface StatProps {
  value: string;
  label: string;
  icon?: IconName;
  tone?: string;
  onPress?: () => void;
}

/** Compact metric tile used in stat grids. */
export function Stat({ value, label, icon, tone, onPress }: StatProps) {
  const theme = useTheme();
  const body = (
    <View
      style={[
        styles.stat,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.statHead}>
        {icon ? <Icon name={icon} size={14} tone={tone ?? theme.textTertiary} /> : null}
        <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.shrink}>
          {label}
        </Text>
      </View>
      {/* Shrinks rather than spilling: values like "1/43" or "2 h 15 min" must
          stay inside the tile at every width. */}
      <Text
        variant="heading"
        rounded
        numeric
        tone={tone}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {value}
      </Text>
    </View>
  );
  if (onPress) {
    return (
      <PressScale onPress={onPress} scaleTo={0.97} style={styles.flex}>
        {body}
      </PressScale>
    );
  }
  return body;
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.statGrid}>{children}</View>;
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
  tone?: string;
}

export function EmptyState({ icon, title, message, action, tone }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <View
        style={[styles.emptyIcon, { backgroundColor: tone ? `${tone}1A` : theme.backgroundSunken }]}>
        <Icon name={icon} size={26} tone={tone ?? theme.textTertiary} />
      </View>
      <Text variant="subheading" center>
        {title}
      </Text>
      <Text variant="small" color="textSecondary" center>
        {message}
      </Text>
      {action}
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export function Row({
  children,
  gap = Spacing.three,
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  // `minWidth: 0` is what stops a flex child's text from spilling out of its
  // container in React Native — flex children default to their content width.
  flex: { flex: 1, minWidth: 0 },
  shrink: { flexShrink: 1 },
  section: { gap: Spacing.three, width: '100%' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  stat: {
    flex: 1,
    minWidth: 96,
    // Fixed height keeps a wrapped grid of tiles on an even baseline.
    minHeight: 84,
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  empty: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.seven },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
