import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CrashScreen } from '@/components/crash-screen';
import { RecoveryScreen } from '@/components/recovery-screen';
import { ConfirmProvider } from '@/components/ui/confirm';
import { Colors } from '@/constants/theme';
import { LearnerProvider, ThemeSchemeProvider, useLearner } from '@/context/LearnerContext';
import { useColorScheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

/**
 * Expo Router renders this instead of the tree when a screen throws.
 *
 * Without it, an uncaught render error is a red box in development and a blank
 * app in a release build — and a learner faced with a blank app reinstalls,
 * which is the one action that takes their progress with it. Retrying costs
 * nothing here because none of the state lives in the component tree.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <CrashScreen error={error} onRetry={retry} />;
}

function RootNavigator() {
  const { ready, recovery, learner } = useLearner();
  const scheme = useColorScheme();

  useEffect(() => {
    // Recovery counts as loaded: the splash must come down, or an unreadable
    // record leaves the app on the splash screen forever.
    if (ready || recovery) SplashScreen.hideAsync();
  }, [ready, recovery]);

  if (recovery) return <RecoveryScreen />;
  if (!ready) return null;

  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = Colors[scheme];

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: palette.background,
          card: palette.backgroundElement,
          text: palette.text,
          border: palette.border,
          primary: palette.tint,
        },
      }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          /**
           * Stated rather than left to the platform. The default differs per
           * OS — iOS slides from the right, Android fades from the bottom —
           * and "push means the thing moves in from the leading edge" is a
           * spatial claim the whole app makes, not a per-platform preference.
           * Modals below opt out, because a modal is not further along; it is
           * on top.
           */
          animation: 'slide_from_right',
        }}>
        {/*
          Onboarding stays registered even once the learner is in, so a retake
          can be pushed and popped like any other screen. Only the *first* run
          is a gate, and that is enforced by guarding the tabs rather than by
          removing the way back.
        */}
        <Stack.Protected guard={learner.onboarded}>
          <Stack.Screen name="(tabs)" />
          {/*
            The back gesture is off here, and only here.
            
            A session is the one screen with unsaved work in it, and the iOS
            edge swipe pops it with no confirmation — a stray thumb halfway
            through a lesson banked nothing: no XP, no session record, no lesson
            completion. Leaving has to go through the close button, which asks.
            `session.tsx` still commits on unmount as a second line of defence,
            because "the only way out asks first" is a claim about navigation
            and not a guarantee about process lifetime.
          */}
          <Stack.Screen
            name="session"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen name="unit/[id]" />
          <Stack.Screen name="word/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="verb/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="grammar/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="mistakes" />
          <Stack.Screen name="search" />
        </Stack.Protected>

        <Stack.Screen name="onboarding" />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LearnerProvider>
          <ThemeSchemeProvider>
            <ConfirmProvider>
              <RootNavigator />
            </ConfirmProvider>
          </ThemeSchemeProvider>
        </LearnerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
