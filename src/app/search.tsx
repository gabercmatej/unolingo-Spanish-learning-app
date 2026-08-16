import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { grammarConcepts, sentences, verbs, vocabConcepts } from '@/content';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { deaccent, normalize } from '@/learning/answer-check';
import { masteryBand } from '@/learning/srs';
import { goBack } from '@/lib/navigation';

/**
 * A personal Spanish dictionary. Searching matches Spanish and English, ignores
 * accents, and shows how well you know each hit — the point is that reference
 * and progress are the same thing here, not two separate apps.
 */
export default function SearchScreen() {
  const theme = useTheme();
  const { learner } = useLearner();
  const [query, setQuery] = useState('');

  const term = deaccent(normalize(query));

  const results = useMemo(() => {
    if (term.length < 2) return null;

    const matches = (text: string) => deaccent(normalize(text)).includes(term);

    return {
      words: vocabConcepts.filter((c) => matches(c.es) || matches(c.en)).slice(0, 24),
      grammar: grammarConcepts.filter((g) => matches(g.title) || matches(g.short)).slice(0, 8),
      verbList: verbs.filter((v) => matches(v.infinitive) || matches(v.en)).slice(0, 8),
      examples: sentences.filter((s) => matches(s.es) || matches(s.en)).slice(0, 10),
    };
  }, [term]);

  const empty =
    results &&
    results.words.length === 0 &&
    results.grammar.length === 0 &&
    results.verbList.length === 0 &&
    results.examples.length === 0;

  return (
    <Screen
      title="Search"
      subtitle="Your Spanish dictionary, annotated with what you know"
      tabBarPadding={false}
      headerRight={
        <PressScale onPress={() => goBack()} scaleTo={0.9} accessibilityLabel="Close">
          <Icon name="close" size={24} color="textSecondary" />
        </PressScale>
      }>
      <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Icon name="search" size={18} color="textTertiary" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="quedar, coger, por vs para…"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={[styles.input, { color: theme.text, fontFamily: Fonts.sans }]}
        />
        {query.length > 0 ? (
          <PressScale onPress={() => setQuery('')} scaleTo={0.9} accessibilityLabel="Clear">
            <Icon name="close-circle" size={18} color="textTertiary" />
          </PressScale>
        ) : null}
      </View>

      {!results ? (
        <EmptyState
          icon="search-outline"
          title="Look anything up"
          message="Search in Spanish or English. Results show meanings, examples, conjugation and how well you know each one."
          tone={theme.tint}
        />
      ) : empty ? (
        <EmptyState
          icon="sad-outline"
          title="Nothing found"
          message={`No entry matches “${query}”. The course is still growing — try a related word.`}
          tone={theme.textTertiary}
        />
      ) : (
        <>
          {results.words.length > 0 ? (
            <Section title={`Words (${results.words.length})`}>
              <View style={styles.list}>
                {results.words.map((concept) => {
                  const state = learner.concepts[concept.id];
                  const band = masteryBand(state);
                  return (
                    // Speaker beside the row, not inside it — no nested buttons.
                    <View
                      key={concept.id}
                      style={[
                        styles.row,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      ]}>
                      <PressScale
                        onPress={() =>
                          router.push({ pathname: '/word/[id]', params: { id: concept.id } })
                        }
                        scaleTo={0.985}
                        style={styles.flex}
                        accessibilityLabel={concept.es}>
                        <View style={styles.cardRow}>
                          <View style={styles.flex}>
                            <View style={styles.wordTop}>
                              <Text variant="bodyBold">{concept.es}</Text>
                              {concept.spainOnly ? <Text variant="caption">🇪🇸</Text> : null}
                            </View>
                            <Text variant="caption" color="textSecondary">
                              {concept.en}
                            </Text>
                          </View>
                          <Pill label={band === 'new' ? 'not met' : band} />
                        </View>
                      </PressScale>
                      <SpeakIcon text={concept.es.split('/')[0].trim()} />
                    </View>
                  );
                })}
              </View>
            </Section>
          ) : null}

          {results.verbList.length > 0 ? (
            <Section title="Verbs">
              <View style={styles.list}>
                {results.verbList.map((verb) => (
                  <Card
                    key={verb.id}
                    variant="flat"
                    onPress={() => router.push({ pathname: '/verb/[id]', params: { id: verb.id } })}>
                    <View style={styles.cardRow}>
                      <View style={styles.flex}>
                        <Text variant="bodyBold">{verb.infinitive}</Text>
                        <Text variant="caption" color="textSecondary">
                          {verb.en}
                        </Text>
                      </View>
                      {verb.irregular ? (
                        <Pill label="irregular" tone={theme.warning} background={theme.warningSoft} />
                      ) : null}
                      <Icon name="chevron-forward" size={16} color="textTertiary" />
                    </View>
                  </Card>
                ))}
              </View>
            </Section>
          ) : null}

          {results.grammar.length > 0 ? (
            <Section title="Grammar">
              <View style={styles.list}>
                {results.grammar.map((concept) => (
                  <Card
                    key={concept.id}
                    variant="flat"
                    onPress={() =>
                      router.push({ pathname: '/grammar/[id]', params: { id: concept.id } })
                    }>
                    <View style={styles.cardRow}>
                      <View style={styles.flex}>
                        <Text variant="bodyBold">{concept.title}</Text>
                        <Text variant="caption" color="textSecondary" numberOfLines={2}>
                          {concept.short}
                        </Text>
                      </View>
                      <Pill label={concept.level} tone={theme.grammar} background={theme.grammarSoft} />
                    </View>
                  </Card>
                ))}
              </View>
            </Section>
          ) : null}

          {results.examples.length > 0 ? (
            <Section title="In context">
              <Card variant="flat">
                {results.examples.map((sentence) => (
                  <View key={sentence.id} style={styles.example}>
                    <View style={styles.wordTop}>
                      <Text variant="esSmall" style={styles.flex}>
                        {sentence.es}
                      </Text>
                      <SpeakIcon text={sentence.es} />
                    </View>
                    <Text variant="small" color="textSecondary">
                      {sentence.en}
                    </Text>
                    {sentence.note ? (
                      <Text variant="caption" color="textTertiary">
                        {sentence.note}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </Card>
            </Section>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: Type.body.fontSize, paddingVertical: Spacing.three },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  wordTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  example: { gap: 2, paddingVertical: Spacing.one },
});
