import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RecoveryScreen } from '@/components/recovery-screen';
import { ConfirmProvider } from '@/components/ui/confirm';
import { Colors } from '@/constants/theme';
import { LearnerProvider, ThemeSchemeProvider, useLearner } from '@/context/LearnerContext';
import { useColorScheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

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
        }}>
        {/*
          Onboarding stays registered even once the learner is in, so a retake
          can be pushed and popped like any other screen. Only the *first* run
          is a gate, and that is enforced by guarding the tabs rather than by
          removing the way back.
        */}
        <Stack.Protected guard={learner.onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session" options={{ animation: 'slide_from_bottom' }} />
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
