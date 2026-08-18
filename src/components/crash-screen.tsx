import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

/**
 * What a crash looks like when progress is the thing at stake.
 *
 * The message matters as much as the button. A learner who sees a blank screen
 * assumes the app is broken and reinstalls it, and reinstalling is the single
 * action that deletes the record — so the first thing this says is that nothing
 * has been lost, and the last thing it suggests is anything drastic.
 *
 * Deliberately free of hooks and context: it has to render when something
 * further up has already failed, so it depends on as little as possible.
 */
export function CrashScreen({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Screen title="Something went wrong" tabBarPadding={false}>
      <Text color="textSecondary">
        Your progress is safe — it is stored on this device and nothing here touches
        it. Try again, and if this keeps happening, export a backup from Profile
        before doing anything else.
      </Text>

      <Card variant="outline" style={styles.detail}>
        <Text variant="caption" color="textTertiary">
          {error.name}: {error.message}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Try again" icon="refresh-outline" onPress={onRetry} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  detail: { marginTop: Spacing.four },
  actions: { marginTop: Spacing.five },
});
