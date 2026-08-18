import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import {
  byTeachingOrder,
  byVerbTeachingOrder,
  grammarConcepts,
  verbs,
  vocabConcepts,
} from '@/content';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { useNow } from '@/hooks/use-now';
import { mastery, masteryBand, type MasteryBand } from '@/learning/srs';

type Tab = 'words' | 'grammar' | 'verbs';
type Filter = MasteryBand | 'all' | 'favourites' | 'verbs' | 'expressions' | 'spain';

/**
 * The Library is the learner's own dictionary: everything the course contains,
 * annotated with how well they actually know it.
 */
export default function LibraryScreen() {
  const theme = useTheme();
  const { learner } = useLearner();
  const [tab, setTab] = useState<Tab>('words');
  const [filter, setFilter] = useState<Filter>('all');
  const now = useNow();

  const words = useMemo(() => {
    const list = vocabConcepts.filter((concept) => {
      const state = learner.concepts[concept.id];
      const band = masteryBand(state, now);
      switch (filter) {
        case 'all':
          return true;
        case 'favourites':
          return learner.favourites.includes(concept.id);
        case 'verbs':
          return concept.pos === 'verb';
        case 'expressions':
          return concept.kind === 'phrase' || concept.pos === 'expression';
        case 'spain':
          return !!concept.spainOnly;
        default:
          return band === filter;
      }
    });
    return list.sort((a, b) => {
      const stateA = learner.concepts[a.id];
      const stateB = learner.concepts[b.id];
      const seenA = stateA ? 1 : 0;
      const seenB = stateB ? 1 : 0;
      if (seenA !== seenB) return seenB - seenA;
      return a.es.localeCompare(b.es, 'es');
    });
  }, [filter, learner.concepts, learner.favourites, now]);

  // Grammar and verbs follow the course, not the alphabet: this list is what
  // you revise from, so it has to match the order you met things in.
  const orderedGrammar = useMemo(() => [...grammarConcepts].sort(byTeachingOrder), []);
  const orderedVerbs = useMemo(() => [...verbs].sort(byVerbTeachingOrder), []);

  const counts = useMemo(() => {
    const result = { new: 0, learning: 0, weak: 0, strong: 0, mastered: 0 };
    for (const concept of vocabConcepts) result[masteryBand(learner.concepts[concept.id], now)] += 1;
    return result;
  }, [learner.concepts, now]);

  return (
    <Screen
      title="Library"
      subtitle="Everything you have met, and how well you know it"
      headerRight={
        <PressScale onPress={() => router.push('/search')} scaleTo={0.9} accessibilityLabel="Search">
          <View style={[styles.iconButton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Icon name="search" size={18} />
          </View>
        </PressScale>
      }>
      <Segmented
        options={[
          { value: 'words', label: 'Words' },
          { value: 'grammar', label: 'Grammar' },
          { value: 'verbs', label: 'Verbs' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'words' ? (
        <>
          <Segmented
            scrollable
            options={[
              { value: 'all', label: 'All', count: vocabConcepts.length },
              { value: 'learning', label: 'Learning', count: counts.learning },
              { value: 'weak', label: 'Weak', count: counts.weak },
              { value: 'strong', label: 'Strong', count: counts.strong },
              { value: 'mastered', label: 'Mastered', count: counts.mastered },
              { value: 'new', label: 'New', count: counts.new },
              { value: 'favourites', label: '★ Favourites', count: learner.favourites.length },
              { value: 'verbs', label: 'Verbs' },
              { value: 'expressions', label: 'Expressions' },
              { value: 'spain', label: '🇪🇸 Spain only' },
            ]}
            value={filter}
            onChange={setFilter}
          />

          {words.length === 0 ? (
            <EmptyState
              icon="albums-outline"
              title="Nothing here yet"
              message="Words appear as you meet them. Try a different filter, or finish a lesson."
              tone={theme.tint}
            />
          ) : (
            <View style={styles.list}>
              {words.map((concept) => {
                const state = learner.concepts[concept.id];
                const band = masteryBand(state, now);
                const value = state ? mastery(state, now) : 0;
                return (
                  // The speaker sits beside the row rather than inside it —
                  // nesting a button in a button is invalid HTML on web.
                  <View
                    key={concept.id}
                    style={[
                      styles.wordRow,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    ]}>
                    <PressScale
                      onPress={() =>
                        router.push({ pathname: '/word/[id]', params: { id: concept.id } })
                      }
                      scaleTo={0.985}
                      style={styles.flex}
                      accessibilityLabel={`${concept.es}, ${concept.en}`}>
                      <View style={styles.wordMain}>
                        <View style={[styles.bandDot, { backgroundColor: bandColor(band, theme) }]} />
                        <View style={styles.flex}>
                          <View style={styles.wordTop}>
                            <Text variant="bodyBold" numberOfLines={1} style={styles.flex}>
                              {concept.es}
                            </Text>
                            {concept.spainOnly ? <Text variant="caption">🇪🇸</Text> : null}
                            {learner.favourites.includes(concept.id) ? (
                              <Icon name="star" size={13} tone={theme.accent} />
                            ) : null}
                          </View>
                          <Text variant="caption" color="textSecondary" numberOfLines={1}>
                            {concept.en}
                          </Text>
                        </View>
                        <Text variant="caption" tone={bandColor(band, theme)}>
                          {state ? `${Math.round(value * 100)}%` : 'new'}
                        </Text>
                      </View>
                    </PressScale>
                    <SpeakIcon text={concept.es.split('/')[0].trim()} />
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : null}

      {tab === 'grammar' ? (
        <Section title="Grammar" caption="In the order the course teaches it — tap any rule to read more">
          <View style={styles.list}>
            {orderedGrammar.map((concept) => {
              const state = learner.concepts[concept.id];
              const value = state ? mastery(state, now) : 0;
              return (
                <Card
                  key={concept.id}
                  variant="flat"
                  onPress={() => router.push({ pathname: '/grammar/[id]', params: { id: concept.id } })}>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Text variant="bodyBold">{concept.title}</Text>
                      <Text variant="caption" color="textSecondary" numberOfLines={2}>
                        {concept.short}
                      </Text>
                    </View>
                    <View style={styles.rightCol}>
                      <Pill label={concept.level} tone={theme.grammar} background={theme.grammarSoft} />
                      {state ? (
                        <Text variant="caption" color="textTertiary">
                          {Math.round(value * 100)}%
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </Section>
      ) : null}

      {tab === 'verbs' ? (
        <Section
          title="Verbs"
          caption="In the order the course teaches them — full conjugations, irregular forms highlighted">
          <View style={styles.list}>
            {orderedVerbs.map((verb) => (
              <Card
                key={verb.id}
                variant="flat"
                onPress={() => router.push({ pathname: '/verb/[id]', params: { id: verb.id } })}>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <View style={styles.wordTop}>
                      <Text variant="bodyBold">{verb.infinitive}</Text>
                      {verb.irregular ? (
                        <Pill label="irregular" tone={theme.warning} background={theme.warningSoft} />
                      ) : null}
                    </View>
                    <Text variant="caption" color="textSecondary">
                      {verb.en}
                    </Text>
                  </View>
                  <Pill label={verb.level} />
                  <Icon name="chevron-forward" size={16} color="textTertiary" />
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}

function bandColor(band: MasteryBand, theme: ReturnType<typeof useTheme>): string {
  switch (band) {
    case 'new':
      return theme.textTertiary;
    case 'learning':
      return theme.listening;
    case 'weak':
      return theme.danger;
    case 'strong':
      return theme.accent;
    case 'mastered':
      return theme.success;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rightCol: { alignItems: 'flex-end', gap: 2 },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  wordMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  wordTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  bandDot: { width: 6, height: 32, borderRadius: Radius.full },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
