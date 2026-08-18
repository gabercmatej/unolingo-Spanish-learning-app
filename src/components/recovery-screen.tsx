import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useLearner } from '@/context/LearnerContext';
import { backupFilename } from '@/learning/backup';
import { saveBackupFile } from '@/lib/backup-file';

/**
 * What the app shows instead of a blank slate when it cannot open the saved
 * record.
 *
 * The screen exists because of what the alternative looked like: the app opened
 * normally, showed zero XP, and then saved that over the record it had failed to
 * read. Everything here is arranged around the fact that the progress is still
 * on the device and still intact — the app simply cannot parse it — so the first
 * offer is to get a copy of it out, and starting fresh is deliberately the last
 * and least prominent thing on the page.
 */
export function RecoveryScreen() {
  const { recovery, discardUnreadable } = useLearner();
  const confirm = useConfirm();
  const [note, setNote] = useState<string | null>(null);

  if (!recovery) return null;

  const rescue = async () => {
    const result = await saveBackupFile(recovery.raw, backupFilename());
    setNote(
      result.ok
        ? 'Saved. Keep that file — it still holds your progress.'
        : `Could not save the file: ${result.reason}`,
    );
  };

  const startOver = async () => {
    const sure = await confirm({
      title: 'Start again from zero?',
      message:
        'Your unreadable progress stays on the device, but the app will begin a new record. Save a copy first if you have not already.',
      confirmLabel: 'Start again',
      destructive: true,
    });
    if (sure) await discardUnreadable();
  };

  return (
    <Screen title="Unolingo could not open your progress" tabBarPadding={false}>
      <Card variant="raised">
        <View style={styles.row}>
          <Icon name="alert-circle" size={22} color="warning" />
          <Text style={styles.flex}>{recovery.reason}</Text>
        </View>
      </Card>

      <Text color="textSecondary" style={styles.body}>
        Nothing has been deleted. The record is still on this device exactly as it
        was found, and Unolingo has not written over it — that is why you are
        seeing this screen instead of an empty profile.
      </Text>

      <View style={styles.actions}>
        <Button title="Save a copy of the file" icon="download-outline" onPress={rescue} />
        <Button
          title="Start again from zero"
          variant="ghost"
          icon="refresh-outline"
          onPress={startOver}
        />
      </View>

      {note ? (
        <Text color="textSecondary" style={styles.body}>
          {note}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  flex: { flex: 1, minWidth: 0 },
  body: { marginTop: Spacing.four },
  actions: { marginTop: Spacing.five, gap: Spacing.three },
});
