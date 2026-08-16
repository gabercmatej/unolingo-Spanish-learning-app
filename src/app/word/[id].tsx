import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AudioButton } from '@/components/exercises/audio-button';
import { ExampleRow } from '@/components/learn/grammar-blocks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section, Stat, StatGrid } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { getConcept, getSentencesForConcept, isVocabConcept } from '@/content';
import { TOPIC_LABELS } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { mastery, masteryBand, retrievability } from '@/learning/srs';
import { relativeDay, toISODate } from '@/lib/date';
import { goBack } from '@/lib/navigation';

/** A word's full record: meaning, usage, examples, and your history with it. */
export default function WordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { learner, toggleFavourite } = useLearner();

  const concept = id ? getConcept(id) : undefined;

  if (!concept || !isVocabConcept(concept)) {
    return (
      <Screen title="Not found" tabBarPadding={false}>
        <EmptyState
          icon="help-circle-outline"
          title="Word not found"
          message="This entry is no longer part of the course."
          action={<Button title="Back" onPress={() => goBack()} full={false} />}
        />
      </Screen>
    );
  }

  const state = learner.concepts[concept.id];
  const band = masteryBand(state);
  const value = state ? mastery(state) : 0;
  const isFavourite = learner.favourites.includes(concept.id);
  const examples = getSentencesForConcept(concept.id).slice(0, 5);
  const headword = concept.es.split('/')[0].trim();

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
          <Pill label={concept.level} tone={theme.tintText} background={theme.tintSoft} />
          <Pill label={concept.pos} />
          {concept.gender ? <Pill label={concept.gender === 'mf' ? 'm / f' : concept.gender} /> : null}
          {concept.register && concept.register !== 'neutral' ? (
            <Pill label={concept.register} tone={theme.accentText} background={theme.accentSoft} />
          ) : null}
          {concept.spainOnly ? (
            <Pill label="🇪🇸 Spain" tone={theme.tintText} background={theme.tintSoft} />
          ) : null}
          {concept.topics.slice(0, 2).map((topic) => (
            <Pill key={topic} label={TOPIC_LABELS[topic]} />
          ))}
        </View>

        <View style={styles.titleRow}>
          <Text variant="title" rounded style={styles.flex}>
            {concept.es}
          </Text>
          <PressScale
            onPress={() => toggleFavourite(concept.id)}
            scaleTo={0.88}
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}>
            <Icon
              name={isFavourite ? 'star' : 'star-outline'}
              size={24}
              tone={isFavourite ? theme.accent : theme.textTertiary}
            />
          </PressScale>
        </View>
        <Text variant="subheading" color="textSecondary">
          {concept.en}
        </Text>
        {concept.plural ? (
          <Text variant="small" color="textTertiary">
            plural: {concept.plural}
          </Text>
        ) : null}

        <View style={styles.audioRow}>
          <AudioButton text={headword} size="sm" />
        </View>
      </View>

      {concept.note ? (
        <Card variant="flat">
          <View style={styles.row}>
            <Icon name="information-circle-outline" size={16} tone={theme.textTertiary} />
            <Text variant="overline" color="textTertiary">
              USAGE
            </Text>
          </View>
          <Text variant="small" color="textSecondary">
            {concept.note}
          </Text>
        </Card>
      ) : null}

      {concept.regional ? (
        <Card variant="flat">
          <Text variant="overline" color="textTertiary">
            REGIONAL
          </Text>
          <View style={styles.regionRow}>
            <Text variant="bodyBold">🇪🇸 {concept.regional.spain}</Text>
          </View>
          <View style={styles.regionRow}>
            <Text variant="body" color="textSecondary">
              🌎 {concept.regional.latam}
            </Text>
          </View>
          {concept.regional.note ? (
            <Text variant="caption" color="textTertiary">
              {concept.regional.note}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {examples.length > 0 ? (
        <Section title="In use">
          <Card variant="flat">
            {examples.map((sentence) => (
              <ExampleRow
                key={sentence.id}
                example={{ es: sentence.es, en: sentence.en, note: sentence.note }}
              />
            ))}
          </Card>
        </Section>
      ) : null}

      <Section title="Your progress">
        <Card variant="flat">
          <View style={styles.masteryRow}>
            <Text variant="smallBold" style={styles.flex}>
              {bandLabel(band)}
            </Text>
            <Text variant="smallBold" tone={theme.tint}>
              {Math.round(value * 100)}%
            </Text>
          </View>
          <ProgressBar value={value} tone={theme.tint} />

          {state ? (
            <StatGrid>
              <Stat value={`${state.correct}`} label="Correct" icon="checkmark" tone={theme.success} />
              <Stat value={`${state.incorrect}`} label="Wrong" icon="close" tone={theme.danger} />
              <Stat
                value={`${Math.round(retrievability(state) * 100)}%`}
                label="Recall now"
                icon="pulse"
                tone={theme.listening}
              />
            </StatGrid>
          ) : null}

          {state ? (
            <View style={styles.metaRow}>
              <Text variant="caption" color="textTertiary">
                Last seen {relativeDay(toISODate(state.lastReviewed))}
              </Text>
              <Text variant="caption" color="textTertiary">
                Next review {relativeDay(toISODate(state.dueAt))}
              </Text>
            </View>
          ) : (
            <Text variant="caption" color="textTertiary">
              You have not met this word yet.
            </Text>
          )}
        </Card>
      </Section>

      {concept.verbId ? (
        <Button
          title="Open conjugation"
          variant="secondary"
          icon="grid-outline"
          onPress={() => router.push({ pathname: '/verb/[id]', params: { id: concept.verbId! } })}
        />
      ) : null}

      {state ? (
        <Button
          title="Practise this word"
          icon="barbell-outline"
          onPress={() =>
            router.push({
              pathname: '/session',
              params: { kind: 'concept', source: concept.id, concepts: concept.id },
            })
          }
        />
      ) : null}
    </Screen>
  );
}

function bandLabel(band: ReturnType<typeof masteryBand>): string {
  switch (band) {
    case 'new':
      return 'Not met yet';
    case 'learning':
      return 'Learning';
    case 'weak':
      return 'Needs work';
    case 'strong':
      return 'Strong';
    case 'mastered':
      return 'Mastered';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: Spacing.two },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  audioRow: { paddingTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  masteryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
});
