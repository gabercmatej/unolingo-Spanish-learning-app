import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Coach, coachLine } from '@/components/learn/coach';
import { Journey } from '@/components/learn/journey';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Section } from '@/components/ui/layout';
import { Reveal, stagger, usePop } from '@/components/ui/motion';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { getLesson, getUnitForLesson } from '@/content';
import { CEFR_LEVELS, type Lesson } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { useNow } from '@/hooks/use-now';
import { courseProgress, dueConcepts, levelProgress, weakAreas } from '@/learning/mastery';
import { continueTarget } from '@/learning/progression';
import { levelInfo } from '@/learning/xp';
import { currentStreak, toISODate } from '@/lib/date';

/**
 * Learn — the structured curriculum.
 *
 * It has to answer four things on sight: what to learn next, how far along the
 * whole journey I am, what I'm struggling with, and can I start right now.
 * Adaptive reinforcement lives on Practice; this page stays the course.
 */
export default function LearnScreen() {
  const theme = useTheme();
  const { learner, settings } = useLearner();
  const now = useNow();

  /**
   * Where Continue goes: the first incomplete required lesson, which — because
   * skipping ahead back-fills everything behind it — is always the lesson
   * immediately after the furthest one fully completed. Progression state only;
   * never session recency, and never nudged by an unfinished lesson.
   */
  const upcoming = useMemo(() => continueTarget(learner), [learner]);
  /**
   * A lesson that was opened and neither finished nor abandoned — the app was
   * backgrounded, the phone locked, or the process killed. Offered as Resume
   * *beside* Continue rather than instead of it, because an unfinished lesson
   * has not moved the learner's position and must not look as though it has.
   */
  const resuming = useMemo(() => {
    const id = learner.activeLesson?.lessonId;
    if (!id || id === upcoming?.id) return null;
    const lesson = getLesson(id);
    return lesson && !learner.completedLessons[id] ? lesson : null;
  }, [learner.activeLesson, learner.completedLessons, upcoming]);
  const stages = useMemo(() => courseProgress(learner, now), [learner, now]);
  const due = useMemo(() => dueConcepts(learner, now).length, [learner, now]);
  const weak = useMemo(() => weakAreas(learner, now, 3), [learner, now]);
  const { level, progress } = useMemo(() => levelProgress(learner, now), [learner, now]);
  const levels = levelInfo(learner.xp);
  const streak = currentStreak(learner.lastStudyDate, learner.streak);

  const todayXp = learner.daily.find((entry) => entry.date === toISODate())?.xp ?? 0;
  const goalXp = settings.dailyGoal * 3;
  const goalProgress = Math.min(1, todayXp / goalXp);
  const goalMet = goalProgress >= 1;

  const startLesson = (lesson: Lesson) => {
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

  const unitsDone = stages.reduce((sum, stage) => sum + stage.unitsDone, 0);
  const unitsTotal = stages.reduce((sum, stage) => sum + stage.unitCount, 0);
  const upcomingUnit = upcoming ? getUnitForLesson(upcoming.id) : undefined;

  return (
    <Screen
      title={settings.name ? `Hola, ${settings.name}` : 'Hola'}
      subtitle={upcoming ? upcoming.goal : 'You have finished everything available — for now.'}>
      {/* Status */}
      <Reveal style={styles.strip}>
        <StatusChip icon="flame" value={`${streak}`} label={streak === 1 ? 'day' : 'days'} tone={theme.tint} />
        <StatusChip icon="flash" value={`${levels.level}`} label="level" tone={theme.accentText} />
        <StatusChip icon="ribbon" value={level} label={`${Math.round(progress * 100)}%`} tone={theme.grammar} />
      </Reveal>

      {/* The mascot greets you on every visit, whatever the learner state — it
          is the app's face, so it is never conditional. */}
      <Reveal delay={stagger(1)}>
        <Coach
          line={coachLine({ due, streak, goalMet, todayXp })}
          showTranslation={settings.showTranslations}
        />
      </Reveal>

      {/* Daily goal — a target, never a gate */}
      <Reveal delay={stagger(2)}>
        <Card variant="flat" padding="four">
          <View style={styles.goalHead}>
            <Text variant="smallBold" style={styles.flex}>
              {goalMet ? 'Daily goal complete' : 'Today’s goal'}
            </Text>
            {goalMet ? <Icon name="checkmark-circle" size={16} tone={theme.success} /> : null}
            <Text variant="caption" color="textTertiary" numeric>
              {todayXp} / {goalXp} XP
            </Text>
          </View>
          <ProgressBar
            value={goalProgress}
            height={8}
            tone={goalMet ? theme.success : theme.accent}
          />
          {goalMet ? (
            <Text variant="caption" color="textSecondary">
              Nothing stops here — keep going as long as you like.
            </Text>
          ) : null}
        </Card>
      </Reveal>

      {/*
        Resume — an interrupted lesson, offered above Continue and clearly
        distinct from it. It does not replace the Continue target: an unfinished
        lesson never advances progression, so both can be true at once and the
        screen says so rather than picking one.
      */}
      {resuming ? (
        <Reveal delay={stagger(3)}>
          <Section title="Pick up where you left off">
            <Card variant="flat" padding="four">
              <View style={styles.continueTop}>
                <Pill label="Unfinished" tone={theme.warning} background={theme.warningSoft} />
                <Pill label={`${resuming.estMinutes} min`} />
              </View>
              <Text variant="bodyBold">{resuming.title}</Text>
              <Button
                title="Resume lesson"
                size="lg"
                icon="refresh"
                onPress={() => startLesson(resuming)}
              />
            </Card>
          </Section>
        </Reveal>
      ) : null}

      {/* Continue */}
      {upcoming ? (
        <Reveal delay={stagger(3)}>
          <Section title="Continue learning">
            <Card>
              <View style={styles.continueTop}>
                {upcomingUnit ? (
                  <Pill
                    label={upcomingUnit.title}
                    tone={theme.tintText}
                    background={theme.tintSoft}
                  />
                ) : null}
                <Pill label={`${upcoming.estMinutes} min`} />
                <Pill label={upcoming.level} />
              </View>
              <Text variant="heading" rounded>
                {upcoming.title}
              </Text>
              <Text variant="small" color="textSecondary">
                {upcoming.goal}
              </Text>
              <Button
                title="Start lesson"
                size="lg"
                icon="play"
                onPress={() => startLesson(upcoming)}
              />
            </Card>
          </Section>
        </Reveal>
      ) : null}

      {/* Smart Review */}
      <Reveal delay={stagger(4)}>
        <PressScale
          onPress={() =>
            router.push({
              pathname: '/session',
              params: { kind: 'smartReview', source: 'smart-review' },
            })
          }
          scaleTo={0.985}
          hover="lift"
          haptic="press"
          accessibilityLabel="Start Smart Review">
          <View style={[styles.smart, { backgroundColor: theme.text }]}>
            <View style={styles.flex}>
              <Text variant="smallBold" tone={theme.background}>
                Smart Review
              </Text>
              <Text variant="caption" tone={theme.background} style={styles.dim}>
                {due > 0
                  ? `${due} concept${due === 1 ? '' : 's'} ready — ordered by forgetting risk`
                  : 'Sharpen what you already know'}
              </Text>
            </View>
            <View style={[styles.smartIcon, { backgroundColor: theme.background }]}>
              <Icon name="sparkles" size={19} tone={theme.text} />
            </View>
          </View>
        </PressScale>
      </Reveal>

      {/* Needs work */}
      {weak.length > 0 ? (
        <Reveal delay={stagger(5)}>
          <Section
            title="Needs work"
            action={{ label: 'Practice', onPress: () => router.push('/practice') }}>
            <Card variant="flat">
              {weak.map((area, index) => (
                <PressScale
                  key={area.id}
                  onPress={() =>
                    router.push({
                      pathname: '/session',
                      params: {
                        kind: 'concept',
                        source: area.id,
                        concepts: area.conceptIds.slice(0, 12).join(','),
                      },
                    })
                  }
                  scaleTo={0.98}
                  accessibilityLabel={`Practise ${area.label}`}>
                  <View style={styles.weakRow}>
                    <View style={styles.weakText}>
                      <Text variant="small" numberOfLines={1}>
                        {area.label}
                      </Text>
                      <ProgressBar
                        value={area.mastery}
                        height={5}
                        tone={masteryTone(area.mastery, theme)}
                        delay={stagger(index)}
                      />
                    </View>
                    <Text
                      variant="caption"
                      tone={masteryTone(area.mastery, theme)}
                      numeric
                      style={styles.weakValue}>
                      {Math.round(area.mastery * 100)}%
                    </Text>
                  </View>
                </PressScale>
              ))}
            </Card>
          </Section>
        </Reveal>
      ) : null}

      {/* The journey */}
      <Reveal delay={stagger(6)}>
        <Section title="Your journey" caption={`${unitsDone} of ${unitsTotal} units · A0 to C2`}>
          <CourseRail stages={stages} />
          <Journey
            stages={stages}
            onOpenUnit={(unitId) => router.push({ pathname: '/unit/[id]', params: { id: unitId } })}
            onStartLesson={startLesson}
            onPractiseUnit={(unitId, step) =>
              /*
                A suggested practice phase first, a targeted drill second. Both
                are optional and both are local to the unit, which is what the
                `unit` param carries. Neither can change whether the unit is
                completed — that was settled by its lessons.
              */
              router.push({
                pathname: '/session',
                params: step
                  ? { kind: 'unitArc', source: step, unit: unitId }
                  : { kind: 'unitSmart', source: unitId, unit: unitId },
              })
            }
          />
        </Section>
      </Reveal>
    </Screen>
  );
}

/**
 * A single rail showing the whole course A0 → C2 with the current position
 * marked. It exists to answer "how far am I from B1?" at a glance, which a
 * per-stage bar cannot.
 */
function CourseRail({ stages }: { stages: ReturnType<typeof courseProgress> }) {
  const theme = useTheme();
  const currentIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.state === 'current'),
  );

  return (
    <View style={styles.railCard}>
      <View style={styles.railTrack}>
        {stages.map((stage, index) => {
          const done = stage.state === 'complete';
          const isCurrent = index === currentIndex && stage.state === 'current';
          return (
            <View key={stage.stage.id} style={styles.railSegment}>
              {/* The stage you are on is a real bar rather than a painted one,
                  so it springs, stagger-delays and marks its own completion
                  exactly like every other progress bar in the app. */}
              {isCurrent ? (
                <ProgressBar
                  value={Math.max(0.06, stage.progress)}
                  height={6}
                  tone={theme.tint}
                  track={theme.backgroundSelected}
                  delay={stagger(index)}
                />
              ) : (
                <View
                  style={[
                    styles.railFill,
                    { backgroundColor: done ? theme.success : theme.backgroundSelected },
                  ]}
                />
              )}
              <Text
                variant="caption"
                tone={done ? theme.success : isCurrent ? theme.tint : theme.textTertiary}>
                {stage.stage.from}
              </Text>
            </View>
          );
        })}
        <View style={styles.railEnd}>
          <Text variant="caption" color="textTertiary">
            {CEFR_LEVELS[CEFR_LEVELS.length - 1]}
          </Text>
        </View>
      </View>
    </View>
  );
}

function masteryTone(value: number, theme: ReturnType<typeof useTheme>): string {
  if (value < 0.5) return theme.danger;
  if (value < 0.7) return theme.warning;
  return theme.success;
}

function StatusChip({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: string;
  label: string;
  tone: string;
}) {
  const theme = useTheme();
  /**
   * A streak that went up overnight, or a level crossed in the session you just
   * left, is news — and this row is the first thing the learner sees on
   * returning. `usePop` skips its first run, so the chips only move when the
   * number actually changed while the screen was mounted or since it last was.
   */
  const pop = usePop(value, { scale: 1.2 });

  return (
    <Animated.View
      style={[
        styles.chip,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pop,
      ]}>
      <Icon name={icon} size={14} tone={tone} />
      <Text variant="smallBold" numeric>
        {value}
      </Text>
      <Text variant="caption" color="textSecondary" numeric>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dim: { opacity: 0.78 },
  strip: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  goalHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  continueTop: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  smart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.lg,
  },
  smartIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  weakText: { flex: 1, gap: Spacing.one, minWidth: 0 },
  weakValue: { width: 44, textAlign: 'right' },
  railCard: { paddingBottom: Spacing.two },
  railTrack: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one },
  railSegment: { flex: 1, gap: Spacing.one },
  railFill: { height: 6, borderRadius: Radius.full },
  railEnd: { paddingLeft: Spacing.one },
});
