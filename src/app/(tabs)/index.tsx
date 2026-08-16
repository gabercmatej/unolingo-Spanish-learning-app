import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Coach, coachLine } from '@/components/learn/coach';
import { Journey } from '@/components/learn/journey';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { getUnitForLesson } from '@/content';
import { CEFR_LEVELS, type Lesson } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { courseProgress, dueConcepts, levelProgress, weakAreas } from '@/learning/mastery';
import { nextLesson } from '@/learning/session';
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
  const now = Date.now();

  const upcoming = useMemo(() => nextLesson(learner), [learner]);
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
      <View style={styles.strip}>
        <StatusChip icon="flame" value={`${streak}`} label={streak === 1 ? 'day' : 'days'} tone={theme.tint} />
        <StatusChip icon="flash" value={`${levels.level}`} label="level" tone={theme.accentText} />
        <StatusChip icon="ribbon" value={level} label={`${Math.round(progress * 100)}%`} tone={theme.grammar} />
      </View>

      {/* The mascot greets you on every visit, whatever the learner state — it
          is the app's face, so it is never conditional. */}
      <Coach
        line={coachLine({ due, streak, goalMet, todayXp })}
        showTranslation={settings.showTranslations}
      />

      {/* Daily goal — a target, never a gate */}
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
        <ProgressBar value={goalProgress} height={8} tone={goalMet ? theme.success : theme.accent} />
        {goalMet ? (
          <Text variant="caption" color="textSecondary">
            Nothing stops here — keep going as long as you like.
          </Text>
        ) : null}
      </Card>

      {/* Continue */}
      {upcoming ? (
        <Section title="Continue learning">
          <Card>
            <View style={styles.continueTop}>
              {upcomingUnit ? (
                <Pill label={upcomingUnit.title} tone={theme.tintText} background={theme.tintSoft} />
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
            <Button title="Start lesson" size="lg" icon="play" onPress={() => startLesson(upcoming)} />
          </Card>
        </Section>
      ) : null}

      {/* Smart Review */}
      <PressScale
        onPress={() =>
          router.push({ pathname: '/session', params: { kind: 'smartReview', source: 'smart-review' } })
        }
        scaleTo={0.985}
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

      {/* Needs work */}
      {weak.length > 0 ? (
        <Section title="Needs work" action={{ label: 'Practice', onPress: () => router.push('/practice') }}>
          <Card variant="flat">
            {weak.map((area) => (
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
                    <ProgressBar value={area.mastery} height={5} tone={masteryTone(area.mastery, theme)} />
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
      ) : null}

      {/* The journey */}
      <Section
        title="Your journey"
        caption={`${unitsDone} of ${unitsTotal} units · A0 to C2`}>
        <CourseRail stages={stages} />
        <Journey
          stages={stages}
          onOpenUnit={(unitId) => router.push({ pathname: '/unit/[id]', params: { id: unitId } })}
          onStartLesson={startLesson}
        />
      </Section>
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
              <View
                style={[
                  styles.railFill,
                  {
                    backgroundColor: done
                      ? theme.success
                      : isCurrent
                        ? theme.tint
                        : theme.backgroundSelected,
                  },
                ]}>
                {isCurrent ? (
                  <View
                    style={[
                      styles.railProgress,
                      { width: `${Math.max(6, stage.progress * 100)}%`, backgroundColor: theme.tint },
                    ]}
                  />
                ) : null}
              </View>
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
  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Icon name={icon} size={14} tone={tone} />
      <Text variant="smallBold" numeric>
        {value}
      </Text>
      <Text variant="caption" color="textSecondary" numeric>
        {label}
      </Text>
    </View>
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
  railFill: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  railProgress: { height: 6, borderRadius: Radius.full },
  railEnd: { paddingLeft: Spacing.one },
});
