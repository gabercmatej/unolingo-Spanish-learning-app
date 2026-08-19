import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, type ColorValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { feedback } from '@/lib/feedback';

/**
 * JS-based tabs (not NativeTabs) so the bar renders identically on iOS,
 * Android and web — cross-platform parity is a hard requirement here.
 *
 * The height is computed from the safe-area inset rather than left to the
 * default: without it the labels sit against the bottom edge and clip on web
 * and on Android devices with gesture navigation.
 */
/**
 * Sized from the content, not guessed. React Navigation gives each tab item 5px
 * of its own padding and then lets the label be clipped if the item is short —
 * the label box collapsed to 7px for 11px text, which is what cut the labels
 * off. Icon (28) + gap (2) + label (14) = 44, plus the item's 10px padding and
 * our own 6px top padding.
 */
const BAR_CONTENT_HEIGHT = 64;
const LABEL_LINE_HEIGHT = 14;

/**
 * A tab icon that acknowledges being selected.
 *
 * The colour swap alone is a state change with no event attached to it — you
 * can see which tab is active but not that you just moved. A short rise and
 * settle supplies the event, and it is deliberately tiny: this fires on every
 * navigation in the app, so anything larger would be the most-repeated and
 * therefore fastest-tiring animation in the product.
 *
 * `withSpring` and `withTiming` both default to `ReduceMotion.System`, so the
 * icon simply snaps for anyone who has asked for that.
 */
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  // React Navigation hands the tab tint through as a `ColorValue`, which is
  // wider than a hex string — it can be a platform-opaque handle.
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  const active = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    active.set(
      focused ? withSpring(1, Motion.springPop) : withTiming(0, { duration: Motion.fast }),
    );
  }, [active, focused]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + active.get() * 0.12 }, { translateY: active.get() * -2 }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

const TABS: {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'index', title: 'Learn', icon: 'school' },
  { name: 'practice', title: 'Practice', icon: 'barbell' },
  { name: 'library', title: 'Library', icon: 'library' },
  { name: 'progress', title: 'Progress', icon: 'stats-chart' },
  { name: 'profile', title: 'Profile', icon: 'person-circle' },
];

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'web' ? Spacing.two : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarIconStyle: { marginBottom: 0 },
        // An explicit lineHeight stops the label box being computed as smaller
        // than the glyphs it holds.
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: LABEL_LINE_HEIGHT,
          fontWeight: '600',
          marginTop: 2,
        },
        sceneStyle: { backgroundColor: theme.background },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={tab.icon} color={color} size={size} focused={focused} />
            ),
          }}
          // The tab bar is the one control in the app that was silent. Every
          // other press in Unolingo goes through `PressScale` and reports
          // itself; this one is drawn by React Navigation, so it has to say so
          // explicitly or the bottom edge of the app feels dead by comparison.
          listeners={{ tabPress: () => feedback.tap() }}
        />
      ))}
    </Tabs>
  );
}
