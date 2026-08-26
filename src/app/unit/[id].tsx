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
import type { PracticeStep } from '@/learning/unit-practice';
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

  /**
   * Every practice route from this screen carries `unit`, which is what makes
   * it a review *of this unit* rather than a global one that happens to have
   * been started here. The scope is passed structurally rather than as a
   * concept list, so the selection policy in `learning/scope.ts` decides what
   * the unit owns — a concept list assembled here would be a second, weaker
   * copy of that rule.
   */
  const practice = (kind: string) =>
    router.push({ pathname: '/session', params: { kind, source: unit.id, unit: unit.id } });

  const openPracticeStep = (stepId: string) =>
    router.push({ pathname: '/session', params: { kind: 'unitArc', source: stepId, unit: unit.id } });

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
              {/*
                Lessons, and only lessons.

                This used to count the guided arc — the unit's lessons *plus*
                its practice phases — which meant a unit with every lesson
                ticked reported itself unfinished, and the number disagreed with
                the one on the Learn page. Completing a unit means completing
                its required lessons; practice comes after and has its own
                counter, further down this screen, where it cannot be mistaken
                for progress.
              */}
              <View style={styles.flex}>
                <Text variant="caption" color="textTertiary">
                  Lessons
                </Text>
                <Text variant="heading" rounded numeric>
                  {progress.lessonsDone}/{progress.lessonCount}
                </Text>
                <ProgressBar
                  value={progress.progress}
                  height={5}
                  tone={progress.state === 'complete' ? theme.success : tone}
                  delay={stagger(1)}
                />
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
          ) : progress.practice.suggested ? (
            /*
              The lessons are done, so the unit is complete — that is settled
              and nothing below can unsettle it. This is the answer to "I
              finished the unit and it says 22%, now what?", offered as the
              obvious next thing rather than as an obligation.
            */
            <Button
              title={`Practise — ${progress.practice.suggested.title}`}
              size="lg"
              tone={tone}
              icon="barbell-outline"
              onPress={() => openPracticeStep(progress.practice.suggested!.id)}
            />
          ) : null}

          {/*
            Optional practice, once the unit is complete.

            Titled and counted separately from the lessons above on purpose.
            These sessions improve mastery and can be replayed as often as the
            learner likes; none of them can change whether the unit is
            completed. Steps are unordered — any one can be started at any time.
          */}
          {progress.practice.unlocked && progress.practice.steps.length > 0 ? (
            <Section
              title="Optional practice"
              caption={`${progress.practice.done}/${progress.practice.total} done · does not affect completion`}>
              <View style={styles.practiceList}>
                {progress.practice.steps.map((step, index) => (
                  <Reveal key={step.id} delay={stagger(index)}>
                    <ArcRow
                      step={step}
                      tone={tone}
                      onPress={() => openPracticeStep(step.id)}
                    />
                  </Reveal>
                ))}
              </View>
            </Section>
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
                    params: { kind: 'unitSmart', source: unit.id, unit: unit.id },
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
                      params: { kind: 'unitSmart', source: unit.id, unit: unit.id },
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
                    onPress={() => practice('vocabulary')}
                  />
                ) : null}
                {grammar.length > 0 ? (
                  <PracticeOption
                    icon="construct-outline"
                    title="Grammar"
                    caption={grammar.map((g) => (isGrammarConcept(g) ? g.title : '')).join(' · ')}
                    tone={theme.grammar}
                    onPress={() => practice('grammar')}
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

/**
 * One phase of the unit's guided arc.
 *
 * Three states, and the third is the one worth having. A step is `done` because
 * it was played, or because the learner's record already demonstrates what it
 * would have taught — a unit whose concepts are all retrieved under pressure
 * has nothing to gain from an "Active recall" session, and making somebody sit
 * through one to earn a tick is the app inventing work. That case says so,
 * rather than quietly showing a tick it cannot explain.
 */
function ArcRow({
  step,
  tone,
  onPress,
}: {
  step: PracticeStep;
  tone: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  /**
   * Nothing here locks any more.
   *
   * Practice steps used to chain — each unlocked by the one before it — because
   * they were part of the unit's completion sequence. They are not part of it
   * now: the whole set becomes available the moment the unit's lessons are
   * done, in any order, as often as the learner wants. A sequence would be this
   * screen quietly re-introducing the obligation the redesign removed.
   */
  const locked = false;

  return (
    <PressScale
      onPress={onPress}
      scaleTo={0.99}
      hover="lift"
      haptic="press"
      disabled={locked}
      accessibilityLabel={step.title}>
      <View
        style={[
          styles.practiceRow,
          {
            backgroundColor: step.done ? 'transparent' : theme.backgroundElement,
            borderColor: step.done ? theme.border : tone,
            borderWidth: step.done ? 1 : 1.5,
            opacity: locked ? 0.5 : 1,
          },
        ]}>
        <View
          style={[
            styles.practiceIcon,
            { backgroundColor: step.done ? theme.successSoft : theme.backgroundSunken },
          ]}>
          <Icon
            name={step.done ? 'checkmark' : 'play'}
            size={16}
            tone={step.done ? theme.success : tone}
          />
        </View>
        <View style={styles.flex}>
          <Text variant="bodyBold">{step.title}</Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {step.satisfied ? 'Already covered by your practice' : step.subtitle}
          </Text>
        </View>
        {step.done ? null : (
          <Text variant="caption" color="textTertiary" numeric>
            ~{step.estMinutes} min
          </Text>
        )}
      </View>
    </PressScale>
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
