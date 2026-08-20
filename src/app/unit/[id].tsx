import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { Reveal, stagger } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import {
  conceptLabel,
  getConcept,
  getStageForUnit,
  getUnit,
  isGrammarConcept,
  isVocabConcept,
} from '@/content';
import type { Lesson } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { unitProgress, unitStrengthPlan, type UnitPhase } from '@/learning/mastery';
import { mastery, masteryBand } from '@/learning/srs';
import { goBack } from '@/lib/navigation';

/**
 * A unit, opened from the path.
 *
 * Completing a unit does not retire it. This screen is what makes "completed"
 * and "mastered" separate things the learner can act on: the lessons stay
 * replayable, and the practice options are ordered so that Smart Review — drill
 * only what has actually decayed — is the obvious first choice.
 */
/**
 * What each stage of a unit's life means, in the learner's terms.
 *
 * The old copy had two states — "finished, and still solid" or "finished, but
 * faded" — which quietly agreed that a finished unit was either fine or broken.
 * Most units are neither: covered, half-remembered, and waiting for the work
 * that makes them stick. `unitProgress().phase` names that middle.
 */
const PHASE_CAPTION: Record<UnitPhase, string> = {
  learning: 'Still learning the material here.',
  practising:
    'Lessons done — most of this has only been recognised so far, not recalled.',
  strengthening: 'You know this. Now it needs to become reliable.',
  maintaining: 'Solid. It will come back on its own through Smart Review.',
};

export default function UnitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { learner } = useLearner();

  const unit = id ? getUnit(id) : undefined;
  const progress = useMemo(
    () => (unit ? unitProgress(unit, learner) : null),
    [unit, learner],
  );
  const strength = useMemo(
    () => (unit ? unitStrengthPlan(unit, learner) : null),
    [unit, learner],
  );

  if (!unit || !progress) {
    return (
      <Screen title="Not found" tabBarPadding={false}>
        <EmptyState
          icon="help-circle-outline"
          title="Unit not found"
          message="This unit is not part of the course."
          action={<Button title="Back" onPress={goBack} full={false} />}
        />
      </Screen>
    );
  }

  const stage = getStageForUnit(unit.id);
  const tone = theme[unit.tone];
  const soft = theme[`${unit.tone}Soft` as keyof typeof theme] as string;

  const vocab = progress.conceptIds
    .map(getConcept)
    .filter((concept) => !!concept && isVocabConcept(concept))
    .map((concept) => concept!);
  const grammar = progress.conceptIds
    .map(getConcept)
    .filter((concept) => !!concept && isGrammarConcept(concept))
    .map((concept) => concept!);

  const started = progress.lessonsDone > 0;

  const practice = (kind: string, ids: string[] = progress.conceptIds) =>
    router.push({
      pathname: '/session',
      params: { kind, source: unit.id, concepts: ids.join(',') },
    });

  const openLesson = (lesson: Lesson) => {
    const kind =
      lesson.kind === 'conversation'
        ? 'conversation'
        : lesson.kind === 'story'
          ? 'story'
          : lesson.kind === 'checkpoint'
            ? 'checkpoint'
            : 'lesson';
    router.push({ pathname: '/session', params: { kind, source: lesson.id } });
  };

  return (
    <Screen
      tabBarPadding={false}
      headerRight={
        <PressScale onPress={goBack} scaleTo={0.9} accessibilityLabel="Close">
          <Icon name="close" size={24} color="textSecondary" />
        </PressScale>
      }>
      {/* Identity */}
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: soft }]}>
          <Icon name={unit.icon} size={26} tone={tone} />
        </View>
        <View style={styles.tags}>
          {stage ? <Pill label={stage.levelRange} tone={tone} background={soft} /> : null}
          <Pill label={unit.level} />
          {unit.status === 'planned' ? <Pill label="Planned" /> : null}
        </View>
        <Text variant="title" rounded>
          {unit.title}
        </Text>
        <Text variant="body" color="textSecondary">
          {unit.subtitle}
        </Text>
      </View>

      {unit.status === 'planned' ? (
        <Card variant="outline">
          <View style={styles.row}>
            <Icon name="construct-outline" size={18} color="textTertiary" />
            <Text variant="smallBold" style={styles.flex}>
              Not written yet
            </Text>
          </View>
          <Text variant="small" color="textSecondary">
            This unit is part of the planned curriculum. It is shown so you can see where the
            course is going — there are no lessons behind it yet.
          </Text>
          <View style={styles.topicList}>
            {unit.topics.map((topic) => (
              <View key={topic} style={styles.topicRow}>
                <Icon name="ellipse" size={5} color="textTertiary" />
                <Text variant="small" color="textSecondary">
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <>
          {/* Progress vs mastery — deliberately two separate numbers */}
          <Card variant="flat">
            <View style={styles.metricRow}>
              <View style={styles.flex}>
                <Text variant="caption" color="textTertiary">
                  Lessons
                </Text>
                <Text variant="heading" rounded>
                  {progress.lessonsDone}/{progress.lessonCount}
                </Text>
                <ProgressBar value={progress.progress} height={5} tone={tone} delay={stagger(1)} />
              </View>
              <View style={styles.divider} />
              <View style={styles.flex}>
                <Text variant="caption" color="textTertiary">
                  Mastery
                </Text>
                <Text
                  variant="heading"
                  rounded
                  tone={progress.needsReview ? theme.warning : undefined}>
                  {started ? `${Math.round(progress.mastery * 100)}%` : '—'}
                </Text>
                <ProgressBar
                  value={progress.mastery}
                  height={5}
                  tone={progress.needsReview ? theme.warning : theme.success}
                  delay={stagger(2)}
                />
              </View>
            </View>
            <Text variant="caption" color="textTertiary">
              {PHASE_CAPTION[progress.phase]}
            </Text>
          </Card>

          {/* Primary action */}
          {progress.nextLesson ? (
            <Button
              title={started ? 'Continue unit' : 'Start unit'}
              size="lg"
              tone={tone}
              icon="play"
              onPress={() => openLesson(progress.nextLesson!)}
            />
          ) : null}

          {/*
            Once the lessons are done, the unit is not over — it moves into the
            phase where the work is strengthening rather than covering. This is
            the primary action for that phase, and it says what it will actually
            do rather than offering a percentage and leaving the learner to
            guess. `unitStrengthPlan` does the counting.
          */}
          {!progress.nextLesson && strength && strength.conceptIds.length > 0 ? (
            <Card variant="raised">
              <View style={styles.row}>
                <Icon name="trending-up-outline" size={18} tone={theme.tint} />
                <Text variant="bodyBold" style={styles.flex}>
                  Strengthen this unit
                </Text>
                <Text variant="caption" color="textTertiary" numeric>
                  ~{strength.estimatedMinutes} min
                </Text>
              </View>
              <View style={styles.countList}>
                <StrengthLine
                  count={strength.unseen.length}
                  label="still to meet"
                  tone={theme.tint}
                />
                <StrengthLine
                  count={strength.mistaken.length}
                  label="to fix from your mistakes"
                  tone={theme.danger}
                />
                <StrengthLine
                  count={strength.developing.length}
                  label="still developing"
                  tone={theme.listening}
                />
                <StrengthLine count={strength.weak.length} label="faded since you met them" tone={theme.warning} />
                <StrengthLine
                  count={strength.unproduced.length}
                  label="recognised but never produced"
                  tone={theme.accent}
                />
                <StrengthLine count={strength.strong.length} label="solid" tone={theme.success} />
              </View>
              <Button
                title="Continue mastering"
                size="lg"
                tone={tone}
                icon="sparkles"
                onPress={() =>
                  router.push({
                    pathname: '/session',
                    params: { kind: 'unitSmart', source: unit.id },
                  })
                }
              />
            </Card>
          ) : null}

          {/* Practice — Smart Review first, deliberately */}
          {started ? (
            <Section title="Practise this unit">
              <View style={styles.practiceList}>
                <PracticeOption
                  icon="sparkles-outline"
                  title="Smart Review"
                  caption={
                    strength && strength.conceptIds.length > 0
                      ? 'Mistakes first, then what has faded, then what you have only recognised'
                      : 'Only what has weakened or is overdue'
                  }
                  tone={theme.tint}
                  recommended
                  onPress={() =>
                    router.push({
                      pathname: '/session',
                      params: { kind: 'unitSmart', source: unit.id },
                    })
                  }
                />
                <PracticeOption
                  icon="repeat-outline"
                  title="Full review"
                  caption="Everything this unit covered"
                  tone={theme.textSecondary}
                  onPress={() => practice('concept')}
                />
                {vocab.length > 0 ? (
                  <PracticeOption
                    icon="book-outline"
                    title="Vocabulary"
                    caption={`${vocab.length} words and expressions`}
                    tone={theme.vocab}
                    onPress={() => practice('vocabulary', vocab.map((c) => c.id))}
                  />
                ) : null}
                {grammar.length > 0 ? (
                  <PracticeOption
                    icon="construct-outline"
                    title="Grammar"
                    caption={grammar.map((g) => (isGrammarConcept(g) ? g.title : '')).join(' · ')}
                    tone={theme.grammar}
                    onPress={() => practice('grammar', grammar.map((c) => c.id))}
                  />
                ) : null}
              </View>
            </Section>
          ) : null}

          {/* Lessons */}
          <Section title="Lessons" caption="Replay any of them at any time">
            <View style={styles.lessonList}>
              {unit.lessons.map((lesson, index) => {
                const done = progress.completedLessonIds.includes(lesson.id);
                const isNext = progress.nextLesson?.id === lesson.id;
                return (
                  <Reveal key={lesson.id} delay={stagger(index)}>
                    <Card
                      variant={isNext ? 'flat' : 'outline'}
                      onPress={() => openLesson(lesson)}>
                      <View style={styles.row}>
                        <Icon
                          name={
                            done ? 'checkmark-circle' : isNext ? 'play-circle' : 'ellipse-outline'
                          }
                          size={20}
                          tone={done ? theme.success : isNext ? tone : theme.textTertiary}
                        />
                        <View style={styles.flex}>
                          <Text variant="bodyBold">{lesson.title}</Text>
                          <Text variant="caption" color="textSecondary" numberOfLines={2}>
                            {lesson.goal}
                          </Text>
                        </View>
                        <Text variant="caption" color="textTertiary">
                          {lesson.estMinutes}m
                        </Text>
                      </View>
                    </Card>
                  </Reveal>
                );
              })}
            </View>
          </Section>

          {/* What is solid and what is not — §11's "strong / needs practice". */}
          {started && strength && strength.conceptIds.length > 0 ? (
            <Section title="Where you stand">
              <Card variant="flat">
                <ConceptGroup
                  title="Solid"
                  ids={strength.strong}
                  tone={theme.success}
                  empty="Nothing has settled yet — that is what practice is for."
                />
                <ConceptGroup
                  title="Needs practice"
                  ids={[...strength.mistaken, ...strength.developing, ...strength.weak]}
                  tone={theme.warning}
                  empty="Nothing shaky right now."
                />
                {strength.unproduced.length > 0 ? (
                  <ConceptGroup
                    title="Recognised, never produced"
                    ids={strength.unproduced}
                    tone={theme.accent}
                    empty=""
                  />
                ) : null}
              </Card>
            </Section>
          ) : null}

          {/* What it taught */}
          {started && vocab.length > 0 ? (
            <Section title="What this unit taught you">
              <Card variant="flat">
                <View style={styles.chips}>
                  {vocab.slice(0, 24).map((concept) => {
                    const state = learner.concepts[concept.id];
                    const band = masteryBand(state);
                    const value = state ? mastery(state) : 0;
                    return (
                      <PressScale
                        key={concept.id}
                        scaleTo={0.94}
                        onPress={() =>
                          router.push({ pathname: '/word/[id]', params: { id: concept.id } })
                        }
                        accessibilityLabel={`${isVocabConcept(concept) ? concept.es : conceptLabel(concept)}, ${Math.round(value * 100)} percent`}>
                        <View
                          style={[
                            styles.chip,
                            {
                              backgroundColor: theme.backgroundSunken,
                              borderColor:
                                band === 'familiar'
                                  ? theme.danger
                                  : band === 'mastered'
                                    ? theme.success
                                    : theme.border,
                            },
                          ]}>
                          <Text variant="caption">
                            {isVocabConcept(concept) ? concept.es : conceptLabel(concept)}
                          </Text>
                        </View>
                      </PressScale>
                    );
                  })}
                </View>
                {vocab.length > 24 ? (
                  <Text variant="caption" color="textTertiary">
                    +{vocab.length - 24} more
                  </Text>
                ) : null}
              </Card>
            </Section>
          ) : null}
        </>
      )}
    </Screen>
  );
}

/** One "3 still developing" line, hidden entirely when the count is zero. */
function StrengthLine({ count, label, tone }: { count: number; label: string; tone: string }) {
  if (count === 0) return null;
  return (
    <View style={styles.countRow}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text variant="small" color="textSecondary" style={styles.flex}>
        <Text variant="smallBold">{count}</Text> {label}
      </Text>
    </View>
  );
}

/**
 * A named group of concepts as chips.
 *
 * Deliberately shows the words themselves rather than a count: "encantado,
 * ¿de dónde eres?" is something the learner can react to, and "3 concepts
 * needing practice" is not.
 */
function ConceptGroup({
  title,
  ids,
  tone,
  empty,
}: {
  title: string;
  ids: string[];
  tone: string;
  empty: string;
}) {
  const theme = useTheme();
  const labels = [...new Set(ids)]
    .map(getConcept)
    .filter((concept): concept is NonNullable<typeof concept> => !!concept)
    .map(conceptLabel)
    .slice(0, 10);

  if (labels.length === 0 && !empty) return null;

  return (
    <View style={styles.group}>
      <Text variant="overline" tone={tone}>
        {title.toUpperCase()}
      </Text>
      {labels.length === 0 ? (
        <Text variant="caption" color="textTertiary">
          {empty}
        </Text>
      ) : (
        <View style={styles.chips}>
          {labels.map((label) => (
            <View
              key={label}
              style={[styles.chip, { backgroundColor: theme.backgroundSunken, borderColor: tone }]}>
              <Text variant="caption">{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PracticeOption({
  icon,
  title,
  caption,
  tone,
  recommended,
  onPress,
}: {
  icon: IconName;
  title: string;
  caption: string;
  tone: string;
  recommended?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressScale onPress={onPress} scaleTo={0.99} hover="lift" haptic="press" accessibilityLabel={title}>
      <View
        style={[
          styles.practiceRow,
          {
            backgroundColor: recommended ? theme.backgroundElement : 'transparent',
            borderColor: recommended ? tone : theme.border,
            borderWidth: recommended ? 1.5 : 1,
          },
        ]}>
        <View style={[styles.practiceIcon, { backgroundColor: theme.backgroundSunken }]}>
          <Icon name={icon} size={17} tone={tone} />
        </View>
        <View style={styles.flex}>
          <View style={styles.row}>
            <Text variant="bodyBold">{title}</Text>
            {recommended ? (
              <View style={[styles.recommend, { backgroundColor: tone }]}>
                <Text variant="caption" tone={theme.onTint}>
                  Recommended
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {caption}
          </Text>
        </View>
        <Icon name="chevron-forward" size={16} color="textTertiary" />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: Spacing.two },
  icon: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  metricRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.four },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: 'transparent' },
  practiceList: { gap: Spacing.two },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  practiceIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommend: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
  lessonList: { gap: Spacing.two },
  topicList: { gap: Spacing.two, paddingTop: Spacing.one },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  countList: { gap: Spacing.two },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 7, height: 7, borderRadius: Radius.full },
  group: { gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
