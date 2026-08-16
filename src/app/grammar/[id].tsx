import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExampleRow, GrammarBlocks } from '@/components/learn/grammar-blocks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { getGrammar } from '@/content';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { mastery } from '@/learning/srs';
import { goBack } from '@/lib/navigation';

/** The full grammar reference for one rule — the same card the lessons show. */
export default function GrammarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { learner } = useLearner();
  const [expanded, setExpanded] = useState(false);

  const grammar = id ? getGrammar(id) : undefined;

  if (!grammar) {
    return (
      <Screen title="Not found" tabBarPadding={false}>
        <EmptyState
          icon="help-circle-outline"
          title="Rule not found"
          message="This grammar point is not part of the course."
          action={<Button title="Back" onPress={() => goBack()} full={false} />}
        />
      </Screen>
    );
  }

  const state = learner.concepts[grammar.id];
  const value = state ? mastery(state) : 0;

  return (
    <Screen
      tabBarPadding={false}
      headerRight={
        <PressScale onPress={() => goBack()} scaleTo={0.9} accessibilityLabel="Close">
          <Icon name="close" size={24} color="textSecondary" />
        </PressScale>
      }>
      <View style={styles.head}>
        <View style={styles.tags}>
          <Pill label={grammar.level} tone={theme.grammar} background={theme.grammarSoft} />
          <Pill label="Grammar" tone={theme.grammar} background={theme.grammarSoft} />
        </View>
        <Text variant="title" rounded>
          {grammar.title}
        </Text>
        <Text variant="body" color="textSecondary">
          {grammar.short}
        </Text>
      </View>

      {state ? (
        <Card variant="flat" padding="four">
          <View style={styles.masteryRow}>
            <Text variant="smallBold" style={styles.flex}>
              Your mastery
            </Text>
            <Text variant="smallBold" tone={theme.grammar}>
              {Math.round(value * 100)}%
            </Text>
          </View>
          <ProgressBar value={value} tone={theme.grammar} />
        </Card>
      ) : null}

      <GrammarBlocks blocks={grammar.summary} />

      {grammar.deepDive ? (
        expanded ? (
          <GrammarBlocks blocks={grammar.deepDive} />
        ) : (
          <Button
            title="Explain more"
            variant="secondary"
            icon="chevron-down"
            tone={theme.grammar}
            onPress={() => setExpanded(true)}
          />
        )
      ) : null}

      {grammar.examples.length > 0 ? (
        <Section title="Examples">
          <Card variant="flat">
            {grammar.examples.map((example, index) => (
              <ExampleRow key={index} example={example} />
            ))}
          </Card>
        </Section>
      ) : null}

      {grammar.pitfalls && grammar.pitfalls.length > 0 ? (
        <View style={[styles.pitfalls, { backgroundColor: theme.dangerSoft }]}>
          <Text variant="overline" tone={theme.dangerText}>
            COMMON SLIPS
          </Text>
          {grammar.pitfalls.map((pitfall, index) => (
            <Text key={index} variant="small" tone={theme.dangerText}>
              • {pitfall}
            </Text>
          ))}
        </View>
      ) : null}

      <Button
        title="Practise this"
        icon="barbell-outline"
        tone={theme.grammar}
        onPress={() =>
          router.push({
            pathname: '/session',
            params: { kind: 'concept', source: grammar.id, concepts: grammar.id },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: Spacing.two },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  masteryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pitfalls: { gap: Spacing.one, padding: Spacing.four, borderRadius: Radius.md },
});
