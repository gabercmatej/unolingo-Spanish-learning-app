import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { ExampleRow, GrammarBlocks } from '@/components/learn/grammar-blocks';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type {
  CultureCardExercise,
  GrammarCardExercise,
  TeachExercise,
} from '@/learning/exercise';

/** A new word: the word, its meaning, how it is used, and why it matters here. */
export function TeachCard({ exercise }: { exercise: TeachExercise }) {
  const theme = useTheme();
  const { concept } = exercise;

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.stack}>
      <View style={styles.tags}>
        <Pill label={concept.level} tone={theme.tintText} background={theme.tintSoft} />
        <Pill label={concept.pos} />
        {concept.gender ? <Pill label={concept.gender === 'mf' ? 'm/f' : concept.gender} /> : null}
        {concept.register && concept.register !== 'neutral' ? (
          <Pill label={concept.register} tone={theme.accentText} background={theme.accentSoft} />
        ) : null}
        {concept.spainOnly ? (
          <Pill label="🇪🇸 Spain" tone={theme.tintText} background={theme.tintSoft} />
        ) : null}
      </View>

      <View style={styles.headword}>
        <Text variant="title" rounded style={styles.flex}>
          {concept.es}
        </Text>
        <SpeakIcon text={concept.es.split('/')[0].trim()} />
      </View>
      <Text variant="subheading" color="textSecondary">
        {concept.en}
      </Text>

      {concept.note ? (
        <View style={[styles.note, { backgroundColor: theme.backgroundSunken }]}>
          <Icon name="information-circle-outline" size={16} tone={theme.textTertiary} />
          <Text variant="small" color="textSecondary" style={styles.flex}>
            {concept.note}
          </Text>
        </View>
      ) : null}

      {concept.regional ? (
        <View style={[styles.regional, { borderColor: theme.border }]}>
          <View style={styles.regionalRow}>
            <Text variant="smallBold">🇪🇸 {concept.regional.spain}</Text>
          </View>
          <View style={styles.regionalRow}>
            <Text variant="smallBold" color="textSecondary">
              🌎 {concept.regional.latam}
            </Text>
          </View>
          {concept.regional.note ? (
            <Text variant="caption" color="textTertiary">
              {concept.regional.note}
            </Text>
          ) : null}
        </View>
      ) : null}

      {exercise.examples.length > 0 ? (
        <View style={styles.examples}>
          <Text variant="overline" color="textTertiary">
            IN USE
          </Text>
          {exercise.examples.map((example, index) => (
            <ExampleRow key={index} example={example} />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

/** A grammar concept: the concise card, with depth behind "Explain more". */
export function GrammarCard({ exercise }: { exercise: GrammarCardExercise }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const { grammar } = exercise;

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.stack}>
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

      <GrammarBlocks blocks={grammar.summary} />

      {grammar.deepDive && !expanded ? (
        <Button
          title="Explain more"
          variant="secondary"
          icon="chevron-down"
          tone={theme.grammar}
          onPress={() => setExpanded(true)}
        />
      ) : null}

      {expanded && grammar.deepDive ? (
        <Animated.View entering={FadeInDown.duration(220)} style={styles.stack}>
          <GrammarBlocks blocks={grammar.deepDive} />
        </Animated.View>
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
    </Animated.View>
  );
}

/** A short cultural aside, used as a breather between exercises. */
export function CultureCard({ exercise }: { exercise: CultureCardExercise }) {
  const theme = useTheme();
  const { culture } = exercise;

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.stack}>
      <View style={[styles.cultureBadge, { backgroundColor: theme.cultureSoft }]}>
        <Icon name={culture.icon} size={30} tone={theme.culture} />
      </View>
      <Pill label="Culture" tone={theme.culture} background={theme.cultureSoft} />
      <Text variant="title" rounded>
        {culture.title}
      </Text>
      <Text variant="body" color="textSecondary">
        {culture.body}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: Spacing.four },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  headword: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  note: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  regional: { gap: Spacing.one, padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  regionalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  examples: { gap: Spacing.three },
  pitfalls: { gap: Spacing.one, padding: Spacing.four, borderRadius: Radius.md },
  cultureBadge: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
