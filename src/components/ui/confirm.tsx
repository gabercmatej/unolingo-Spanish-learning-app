import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Elevation, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A cross-platform confirmation dialog.
 *
 * `Alert.alert` is a no-op on React Native Web, so anything gated behind it
 * silently did nothing in the browser — which is why closing a session
 * "worked sometimes". This replaces it everywhere with one component that
 * behaves identically on iOS, Android and web, and that we can style.
 */

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Resolver = (confirmed: boolean) => void;

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: Resolver }) | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  const settle = (value: boolean) => {
    request?.resolve(value);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        visible={request !== null}
        transparent
        animationType="none"
        onRequestClose={() => settle(false)}>
        <Animated.View entering={FadeIn.duration(140)} style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => settle(false)}
            accessibilityLabel="Dismiss"
          />
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={[
              styles.sheet,
              { backgroundColor: theme.backgroundElement, shadowColor: theme.shadow },
              Elevation.raised,
            ]}>
            <Text variant="subheading">{request?.title}</Text>
            {request?.message ? (
              <Text variant="small" color="textSecondary">
                {request.message}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Button
                title={request?.confirmLabel ?? 'Confirm'}
                variant={request?.destructive ? 'danger' : 'primary'}
                onPress={() => settle(true)}
              />
              <Button
                title={request?.cancelLabel ?? 'Cancel'}
                variant="secondary"
                onPress={() => settle(false)}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

/** Returns a function that resolves true when the learner confirms. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12,8,6,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth - 120,
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.lg,
  },
  actions: { gap: Spacing.two, paddingTop: Spacing.two },
});

export type { ConfirmOptions };
