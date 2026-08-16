import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
