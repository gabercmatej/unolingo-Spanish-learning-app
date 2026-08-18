import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityCalendar, XpChart } from '@/components/progress/charts';
import { Card } from '@/components/ui/card';
import { EmptyState, Section, Stat, StatGrid } from '@/components/ui/layout';
import { ProgressBar, RingProgress } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { allLessons } from '@/content';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { useNow } from '@/hooks/use-now';
import {
  courseProgress,
  levelProgress,
  skillSummaries,
  vocabCounts,
  weakAreas,
  wordsLearned,
  wordsMastered,
} from '@/learning/mastery';
import { levelInfo } from '@/learning/xp';
import { formatDuration } from '@/lib/date';

/**
 * Analytics for a learner, not a dashboard for a manager. Every number here
 * answers a question someone learning Spanish would actually ask.
 */
export default function ProgressScreen() {
  const theme = useTheme();
  const { learner } = useLearner();
  const now = useNow();

  const skills = useMemo(() => skillSummaries(learner, now), [learner, now]);
  const { level, progress } = useMemo(() => levelProgress(learner, now), [learner, now]);
  const counts = useMemo(() => vocabCounts(learner, now), [learner, now]);
  const weak = useMemo(() => weakAreas(learner, now, 4), [learner, now]);
  const stages = useMemo(() => courseProgress(learner, now), [learner, now]);
  const levels = levelInfo(learner.xp);

  const lessonsDone = Object.keys(learner.completedLessons).length;
  const totalAnswers = learner.sessions.reduce((sum, session) => sum + session.total, 0);
  const totalCorrect = learner.sessions.reduce((sum, session) => sum + session.correct, 0);
  const accuracy = totalAnswers > 0 ? totalCorrect / totalAnswers : 0;

  if (learner.sessions.length === 0) {
    return (
      <Screen title="Progress" subtitle="Your Spanish, measured honestly">
        <EmptyState
          icon="stats-chart-outline"
          title="No data yet"
          message="Finish a session and this fills with mastery, trends and a study calendar."
          tone={theme.tint}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Progress" subtitle="Your Spanish, measured honestly">
      <Card>
        <View style={styles.hero}>
          <RingProgress
            value={progress}
            size={124}
            tone={theme.tint}
            label={level}
            caption={`${Math.round(progress * 100)}% through`}
          />
          <View style={styles.flex}>
            <Text variant="smallBold" color="textTertiary">
              Current estimate
            </Text>
            <Text variant="heading" rounded>
              {level}
            </Text>
            <Text variant="small" color="textSecondary">
              {learner.placement
                ? `Placed at ${learner.placement.label} on day one`
                : 'Based on what you have actually mastered'}
            </Text>
          </View>
        </View>
      </Card>

      <StatGrid>
        <Stat value={`${learner.xp}`} label="Total XP" icon="flash" tone={theme.accent} />
        <Stat value={`${levels.level}`} label="Level" icon="trending-up" tone={theme.tint} />
        <Stat
          value={formatDuration(learner.totalSeconds)}
          label="Studied"
          icon="time-outline"
          tone={theme.listening}
        />
        <Stat value={`${wordsLearned(learner)}`} label="Words met" icon="book-outline" tone={theme.vocab} />
        <Stat
          value={`${wordsMastered(learner, now)}`}
          label="Mastered"
          icon="ribbon-outline"
          tone={theme.success}
        />
        <Stat
          value={`${Math.round(accuracy * 100)}%`}
          label="Accuracy"
          icon="checkmark-circle-outline"
          tone={theme.success}
        />
        <Stat value={`${lessonsDone}/${allLessons.length}`} label="Lessons" icon="school-outline" />
        <Stat value={`${learner.longestStreak}`} label="Best streak" icon="flame-outline" tone={theme.tint} />
      </StatGrid>

      <Section title="Course progress" caption="Units completed in each CEFR stage">
        <Card variant="flat">
          {stages
            .filter((stage) => stage.unitCount > 0)
            .map((stage) => (
              <View key={stage.stage.id} style={styles.stageRow}>
                <Text variant="small" style={styles.stageLabel}>
                  {stage.stage.levelRange}
                </Text>
                <View style={styles.stageBar}>
                  <ProgressBar
                    value={stage.progress}
                    height={7}
                    tone={stage.state === 'complete' ? theme.success : theme.tint}
                  />
                </View>
                <Text variant="caption" color="textTertiary" style={styles.stageValue}>
                  {stage.unitsDone}/{stage.unitCount}
                </Text>
              </View>
            ))}
        </Card>
      </Section>

      <Section title="Skill mastery">
        <Card variant="flat">
          {skills.map((skill) => (
            <View key={skill.skill} style={styles.skillRow}>
              <Text variant="small" style={styles.skillLabel}>
                {skill.label}
              </Text>
              <View style={styles.stageBar}>
                <ProgressBar value={skill.mastery} height={8} tone={skillTone(skill.skill, theme)} />
              </View>
              <Text variant="caption" color="textTertiary" style={styles.skillValue}>
                {skill.seen === 0 ? '—' : `${Math.round(skill.mastery * 100)}%`}
              </Text>
            </View>
          ))}
          <Text variant="caption" color="textTertiary">
            Listening and production only count exercises where you actually had to do them.
          </Text>
        </Card>
      </Section>

      <Section title="Vocabulary breakdown">
        <Card variant="flat">
          <View style={styles.bar}>
            {(
              [
                ['mastered', counts.mastered, theme.success],
                ['strong', counts.strong, theme.accent],
                ['weak', counts.weak, theme.danger],
                ['learning', counts.learning, theme.listening],
                ['new', counts.new, theme.backgroundSelected],
              ] as const
            ).map(([key, count, colour]) =>
              count > 0 ? (
                <View key={key} style={{ flex: count, height: 12, backgroundColor: colour }} />
              ) : null,
            )}
          </View>
          <View style={styles.legend}>
            <Legend label="Mastered" value={counts.mastered} tone={theme.success} />
            <Legend label="Strong" value={counts.strong} tone={theme.accent} />
            <Legend label="Weak" value={counts.weak} tone={theme.danger} />
            <Legend label="Learning" value={counts.learning} tone={theme.listening} />
            <Legend label="Not met" value={counts.new} tone={theme.textTertiary} />
          </View>
        </Card>
      </Section>

      <Section title="Study calendar" caption="The last four months">
        <Card variant="flat">
          <ActivityCalendar daily={learner.daily} />
        </Card>
      </Section>

      <Section title="XP over time" caption="Weekly totals against your average">
        <Card variant="flat">
          <XpChart daily={learner.daily} />
        </Card>
      </Section>

      {weak.length > 0 ? (
        <Section title="Weakest areas">
          <Card variant="flat">
            {weak.map((area) => (
              <View key={area.id} style={styles.skillRow}>
                <Text variant="small" style={styles.flex} numberOfLines={1}>
                  {area.label}
                </Text>
                <Text variant="smallBold" tone={area.mastery < 0.6 ? theme.danger : theme.warning}>
                  {Math.round(area.mastery * 100)}%
                </Text>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

function Legend({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: tone }]} />
      <Text variant="caption" color="textSecondary">
        {label} {value}
      </Text>
    </View>
  );
}

function skillTone(skill: string, theme: ReturnType<typeof useTheme>): string {
  switch (skill) {
    case 'vocabulary':
      return theme.vocab;
    case 'grammar':
      return theme.grammar;
    case 'listening':
      return theme.listening;
    default:
      return theme.speaking;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 26 },
  stageLabel: { width: 68 },
  stageBar: { flex: 1, minWidth: 0 },
  stageValue: { width: 42, textAlign: 'right' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 28 },
  skillLabel: { width: 92 },
  skillValue: { width: 40, textAlign: 'right' },
  bar: { flexDirection: 'row', height: 12, borderRadius: Radius.full, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  legendDot: { width: 8, height: 8, borderRadius: Radius.full },
});
