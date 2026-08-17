import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { ExampleRow } from '@/components/learn/grammar-blocks';
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
import { getVerb, verbFormConceptId } from '@/content';
import { PERSONS, PERSON_LABELS, TENSE_LABELS, type Conjugation, type TenseId } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { hasMetVerbTense } from '@/learning/mastery';
import { mastery } from '@/learning/srs';
import { goBack } from '@/lib/navigation';

/**
 * A verb's own screen. Tenses the learner has not reached yet are collapsed
 * behind a note rather than dumped on them all at once, and irregular forms are
 * marked so the eye goes straight to what has to be memorised.
 */
export default function VerbScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { learner } = useLearner();

  const verb = id ? getVerb(id) : undefined;

  if (!verb) {
    return (
      <Screen title="Not found" tabBarPadding={false}>
        <EmptyState
          icon="help-circle-outline"
          title="Verb not found"
          message="This verb is not part of the course."
          action={<Button title="Back" onPress={() => goBack()} full={false} />}
        />
      </Screen>
    );
  }

  const tenses = Object.entries(verb.tenses) as [TenseId, Conjugation][];
  // Shared with the learning layer, so the Library and the tests agree on what
  // "met" means. This predicate was silently false for every verb for a long
  // time, and an inline copy is why nothing noticed.
  const metTenses = tenses.filter(([tense]) => hasMetVerbTense(verb.id, tense, learner));
  const unmetTenses = tenses.filter(([tense]) => !hasMetVerbTense(verb.id, tense, learner));

  // Always show at least the present, even before it has been formally met.
  const visible = metTenses.length > 0 ? metTenses : tenses.slice(0, 1);
  const hidden = metTenses.length > 0 ? unmetTenses : tenses.slice(1);

  const allConceptIds = tenses.map(([tense]) => verbFormConceptId(verb.id, tense));

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
          <Pill label={verb.level} tone={theme.tintText} background={theme.tintSoft} />
          <Pill label={`-${verb.group}`} />
          {verb.irregular ? (
            <Pill label="irregular" tone={theme.warning} background={theme.warningSoft} />
          ) : (
            <Pill label="regular" tone={theme.success} background={theme.successSoft} />
          )}
        </View>

        <View style={styles.titleRow}>
          <Text variant="title" rounded style={styles.flex}>
            {verb.infinitive}
          </Text>
          <SpeakIcon text={verb.infinitive} />
        </View>
        <Text variant="subheading" color="textSecondary">
          {verb.en}
        </Text>

        {verb.irregularityNote ? (
          <View style={[styles.note, { backgroundColor: theme.warningSoft }]}>
            <Icon name="alert-circle-outline" size={16} tone={theme.warning} />
            <Text variant="small" tone={theme.warning} style={styles.flex}>
              {verb.irregularityNote}
            </Text>
          </View>
        ) : null}

        <View style={styles.formsRow}>
          <Text variant="caption" color="textTertiary">
            gerundio: {verb.gerund}
          </Text>
          <Text variant="caption" color="textTertiary">
            participio: {verb.participle}
          </Text>
        </View>
      </View>

      {visible.map(([tense, conjugation]) => {
        const conceptId = verbFormConceptId(verb.id, tense);
        const state = learner.concepts[conceptId];
        const value = state ? mastery(state) : 0;

        return (
          <Section key={tense} title={TENSE_LABELS[tense]}>
            <Card variant="flat" padding="none">
              {state ? (
                <View style={styles.masteryStrip}>
                  <ProgressBar value={value} height={4} tone={theme.grammar} />
                </View>
              ) : null}
              {PERSONS.map((person, index) => {
                const irregular = conjugation.irregular?.includes(person);
                return (
                  <View
                    key={person}
                    style={[
                      styles.formRow,
                      index < PERSONS.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.border,
                      },
                    ]}>
                    <Text variant="caption" color="textTertiary" style={styles.person}>
                      {PERSON_LABELS[person]}
                    </Text>
                    <Text
                      variant="bodyBold"
                      tone={irregular ? theme.warning : theme.text}
                      style={styles.flex}>
                      {conjugation.forms[person]}
                    </Text>
                    {irregular ? (
                      <View style={[styles.irregularDot, { backgroundColor: theme.warning }]} />
                    ) : null}
                    <SpeakIcon text={conjugation.forms[person]} />
                  </View>
                );
              })}
            </Card>
          </Section>
        );
      })}

      {hidden.length > 0 ? (
        <Card variant="outline">
          <View style={styles.row}>
            <Icon name="lock-closed-outline" size={16} color="textTertiary" />
            <Text variant="small" color="textSecondary" style={styles.flex}>
              {hidden.map(([tense]) => TENSE_LABELS[tense]).join(', ')} unlock as you reach them in
              the course.
            </Text>
          </View>
        </Card>
      ) : null}

      {verb.patterns && verb.patterns.length > 0 ? (
        <Section title="Common constructions">
          <Card variant="flat">
            {verb.patterns.map((pattern) => (
              <View key={pattern.pattern} style={styles.pattern}>
                <Text variant="smallBold" tone={theme.tint}>
                  {pattern.pattern}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {pattern.en}
                </Text>
                <ExampleRow example={pattern.example} />
              </View>
            ))}
          </Card>
        </Section>
      ) : null}

      <Button
        title="Practise this verb"
        icon="barbell-outline"
        onPress={() =>
          router.push({
            pathname: '/session',
            params: { kind: 'concept', source: verb.id, concepts: allConceptIds.join(',') },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.two,
  },
  formsRow: { flexDirection: 'row', gap: Spacing.four, paddingTop: Spacing.two },
  masteryStrip: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  person: { width: 108 },
  irregularDot: { width: 6, height: 6, borderRadius: Radius.full },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pattern: { gap: Spacing.one },
});
