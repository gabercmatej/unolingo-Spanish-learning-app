import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { PressScale } from '@/components/ui/press-scale';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { mistakePatterns } from '@/learning/mastery';
import { mistakeQueue } from '@/learning/mistakes';
import { KIND_LABELS } from '@/learning/types';
import { relativeDay, toISODate } from '@/lib/date';
import { goBack } from '@/lib/navigation';

/**
 * The mistake notebook. Individual slips are useful; the pattern across them is
 * more useful, so repeated confusions are surfaced first with a one-tap drill.
 */
export default function MistakesScreen() {
  const theme = useTheme();
  const { learner, clearResolvedMistakes } = useLearner();
  const [filter, setFilter] = useState<'open' | 'fixed'>('open');

  const patterns = useMemo(() => mistakePatterns(learner), [learner]);
  const list = useMemo(
    () =>
      [...learner.mistakes]
        .filter((mistake) => (filter === 'open' ? !mistake.resolvedAt : !!mistake.resolvedAt))
        .reverse(),
    [filter, learner.mistakes],
  );

  const openCount = learner.mistakes.filter((mistake) => !mistake.resolvedAt).length;
  /** How many the next session would actually cover — see the button below. */
  const queued = useMemo(() => mistakeQueue(learner).length, [learner]);
  const fixedCount = learner.mistakes.length - openCount;

  return (
    <Screen
      title="Mistakes"
      subtitle="Every slip, with the reason it happened"
      tabBarPadding={false}
      headerRight={
        <PressScale onPress={() => goBack()} scaleTo={0.9} accessibilityLabel="Close">
          <Icon name="close" size={24} color="textSecondary" />
        </PressScale>
      }>
      {patterns.length > 0 ? (
        <Section title="Patterns" caption="Things you get wrong more than once">
          <View style={styles.list}>
            {patterns.map((pattern) => (
              <Card
                key={pattern.conceptId}
                variant="flat"
                onPress={() =>
                  router.push({
                    pathname: '/session',
                    params: {
                      kind: 'concept',
                      source: pattern.conceptId,
                      concepts: pattern.conceptId,
                    },
                  })
                }>
                <View style={styles.row}>
                  <View style={[styles.badge, { backgroundColor: theme.dangerSoft }]}>
                    <Text variant="smallBold" tone={theme.danger}>
                      {pattern.count}×
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyBold">{pattern.label}</Text>
                    <Text variant="caption" color="textSecondary">
                      Tap for a targeted mini-drill
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color="textTertiary" />
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      <Segmented
        options={[
          { value: 'open', label: 'Open', count: openCount },
          { value: 'fixed', label: 'Fixed', count: fixedCount },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {queued > 0 && filter === 'open' ? (
        /*
          Counted from the queue, not from the record list. Three failures on
          the same word are one thing to fix, and a session caps at twelve — so
          promising "practise all 20" and serving eight would be the button
          lying about what it does. The other records stay open and come back
          another day if the retry does not stick.
        */
        <Button
          title={queued === openCount ? `Fix all ${queued} mistakes` : `Fix ${queued} now`}
          icon="barbell-outline"
          onPress={() =>
            router.push({ pathname: '/session', params: { kind: 'mistakes', source: 'mistakes' } })
          }
        />
      ) : null}

      {list.length === 0 ? (
        <EmptyState
          icon={filter === 'open' ? 'checkmark-done-outline' : 'time-outline'}
          title={filter === 'open' ? 'Nothing outstanding' : 'Nothing fixed yet'}
          message={
            filter === 'open'
              ? 'Every mistake you have made, you have since answered correctly.'
              : 'Answer a past mistake correctly and it moves here.'
          }
          tone={theme.success}
        />
      ) : (
        <View style={styles.list}>
          {list.map((mistake) => (
            <Card key={mistake.id} variant="flat">
              <View style={styles.head}>
                <Text variant="caption" color="textTertiary" style={styles.flex}>
                  {KIND_LABELS[mistake.kind]} · {relativeDay(toISODate(mistake.at))}
                </Text>
                {mistake.resolvedAt ? (
                  <Icon name="checkmark-circle" size={16} tone={theme.success} />
                ) : null}
              </View>

              <View style={styles.block}>
                <Text variant="overline" tone={theme.danger}>
                  YOU WROTE
                </Text>
                <Text variant="esSmall" tone={theme.danger}>
                  {mistake.given || '—'}
                </Text>
              </View>

              <View style={styles.block}>
                <View style={styles.row}>
                  <Text variant="overline" tone={theme.success} style={styles.flex}>
                    BETTER
                  </Text>
                  <SpeakIcon text={mistake.expected} tone={theme.success} />
                </View>
                <Text variant="esSmall" tone={theme.success}>
                  {mistake.expected}
                </Text>
              </View>

              {mistake.explanation ? (
                <View style={[styles.why, { backgroundColor: theme.backgroundSunken }]}>
                  <Text variant="overline" color="textTertiary">
                    WHY
                  </Text>
                  <Text variant="small" color="textSecondary">
                    {mistake.explanation}
                  </Text>
                </View>
              ) : null}

              {!mistake.resolvedAt ? (
                <Button
                  title="Practise this again"
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: '/session',
                      params: {
                        kind: 'concept',
                        source: mistake.id,
                        concepts: mistake.conceptIds.join(','),
                      },
                    })
                  }
                />
              ) : null}
            </Card>
          ))}
        </View>
      )}

      {fixedCount > 0 && filter === 'fixed' ? (
        <Button title="Clear fixed mistakes" variant="ghost" onPress={clearResolvedMistakes} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  block: { gap: 2 },
  why: { gap: 2, padding: Spacing.three, borderRadius: Radius.sm },
  badge: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
