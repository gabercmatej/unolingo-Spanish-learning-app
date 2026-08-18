import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LevelUp, MascotNote } from '@/components/learn/level-up';
import { Reveal, useCountUp } from '@/components/ui/motion';
import { Icon, type IconName } from '@/components/ui/icon';
import { RingProgress } from '@/components/ui/progress';
import { Stat, StatGrid } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { conceptLabel, getConcept } from '@/content';
import { useTheme } from '@/hooks/use-theme';
import type { Achievement } from '@/learning/achievements';
import { rankForLevel } from '@/learning/ranks';
import { formatDuration } from '@/lib/date';

export interface ConceptDelta {
  conceptId: string;
  before: number;
  after: number;
}

export interface SessionSummary {
  title: string;
  xp: number;
  correct: number;
  total: number;
  seconds: number;
  newConcepts: number;
  improved: ConceptDelta[];
  needsReview: string[];
  goalReached: boolean;
  streak: number;
  /**
   * Level before and after this session. Equal means nothing was crossed, which
   * is the usual case and is why the celebration is conditional rather than a
   * permanent block of the layout.
   */
  levelBefore: number;
  levelAfter: number;
  /** Progress into the new level, 0..1. */
  levelProgress: number;
  /** Achievements this session crossed, diffed at the moment it ended. */
  unlocked: Achievement[];
}

interface SessionResultsProps {
  summary: SessionSummary;
  onContinue: () => void;
  onReviewMistakes?: () => void;
}

/**
 * Results that mean something. Accuracy and XP are table stakes; what makes
 * this worth reading is the named movement ("Past tense +7%") and the honest
 * list of what still needs work.
 */
export function SessionResults({ summary, onContinue, onReviewMistakes }: SessionResultsProps) {
  const theme = useTheme();
  const accuracy = summary.total > 0 ? summary.correct / summary.total : 1;

  const headline =
    accuracy >= 0.9 ? '¡Genial!' : accuracy >= 0.7 ? 'Good work' : 'That was a tough one';

  const levelledUp = summary.levelAfter > summary.levelBefore;
  const newRank = rankForLevel(summary.levelAfter);
  // A rank only counts as new if the session actually crossed into it.
  const rankChanged = levelledUp && rankForLevel(summary.levelBefore).id !== newRank.id;

  const xp = useCountUp(summary.xp);

  const topImproved = [...summary.improved]
    .filter((delta) => delta.after > delta.before + 0.01)
    .sort((a, b) => b.after - b.before - (a.after - a.before))
    .slice(0, 3);

  return (
    <View style={styles.stack}>
      <Reveal style={styles.hero}>
        <RingProgress
          value={accuracy}
          size={148}
          thickness={14}
          tone={accuracy >= 0.7 ? theme.success : theme.accent}
          label={`${Math.round(accuracy * 100)}%`}
          caption="accuracy"
        />
        <Text variant="title" rounded center>
          {headline}
        </Text>
        <Text variant="small" color="textSecondary" center>
          {summary.title}
        </Text>
      </Reveal>

      {levelledUp ? (
        <Reveal delay={80}>
          <LevelUp
            level={summary.levelAfter}
            rank={rankChanged ? newRank : undefined}
            progress={summary.levelProgress}
          />
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <MascotNote accuracy={accuracy} />
        </Reveal>
      )}

      {summary.unlocked.length > 0 ? (
        <Reveal delay={120}>
          <Card variant="flat">
            <View style={styles.cardHead}>
              <Icon name="ribbon-outline" size={16} tone={theme.accent} />
              <Text variant="overline" tone={theme.accent}>
                {summary.unlocked.length === 1 ? 'ACHIEVEMENT UNLOCKED' : 'ACHIEVEMENTS UNLOCKED'}
              </Text>
            </View>
            {summary.unlocked.map((achievement) => (
              <View key={achievement.id} style={styles.row}>
                <Icon name={achievement.icon as IconName} size={18} tone={theme.accent} />
                <View style={styles.flex}>
                  <Text variant="smallBold">{achievement.title}</Text>
                  <Text variant="caption" color="textSecondary">
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Reveal>
      ) : null}

      {summary.goalReached ? (
        <Reveal delay={160}>
          <View style={[styles.goal, { backgroundColor: theme.accentSoft }]}>
            <Icon name="checkmark-circle" size={22} tone={theme.accentText} />
            <View style={styles.flex}>
              <Text variant="smallBold" tone={theme.accentText}>
                Daily goal complete
              </Text>
              <Text variant="caption" tone={theme.accentText}>
                Keep going for as long as you like — nothing stops here.
              </Text>
            </View>
          </View>
        </Reveal>
      ) : null}

      <Reveal delay={200}>
        <StatGrid>
          <Stat value={`+${xp}`} label="XP earned" icon="flash" tone={theme.accent} />
          <Stat value={`${summary.newConcepts}`} label="New" icon="sparkles" tone={theme.tint} />
          <Stat
            value={formatDuration(summary.seconds)}
            label="Time"
            icon="time-outline"
            tone={theme.listening}
          />
        </StatGrid>
      </Reveal>

      {topImproved.length > 0 ? (
        <Reveal delay={260}>
          <Card variant="flat">
            <Text variant="overline" color="textTertiary">
              IMPROVED
            </Text>
            {topImproved.map((delta) => {
              const concept = getConcept(delta.conceptId);
              const gain = Math.round((delta.after - delta.before) * 100);
              return (
                <View key={delta.conceptId} style={styles.row}>
                  <Text variant="small" style={styles.flex} numberOfLines={1}>
                    {concept ? conceptLabel(concept) : delta.conceptId}
                  </Text>
                  <Text variant="smallBold" tone={theme.success}>
                    +{gain}%
                  </Text>
                </View>
              );
            })}
          </Card>
        </Reveal>
      ) : null}

      {summary.needsReview.length > 0 ? (
        <Reveal delay={300}>
          <Card variant="flat">
            <View style={styles.cardHead}>
              <Icon name="refresh-outline" size={16} tone={theme.danger} />
              <Text variant="overline" tone={theme.danger}>
                NEEDS REVIEW
              </Text>
            </View>
            {summary.needsReview.slice(0, 4).map((conceptId) => {
              const concept = getConcept(conceptId);
              return (
                <Text key={conceptId} variant="small" numberOfLines={1}>
                  {concept ? conceptLabel(concept) : conceptId}
                </Text>
              );
            })}
            <Text variant="caption" color="textTertiary">
              These will come back sooner in your next review.
            </Text>
          </Card>
        </Reveal>
      ) : null}

      <Reveal delay={340} style={styles.actions}>
        <Button title="Continue" size="lg" onPress={onContinue} />
        {onReviewMistakes && summary.needsReview.length > 0 ? (
          <Button title="Review mistakes now" variant="secondary" onPress={onReviewMistakes} />
        ) : null}
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: Spacing.four },
  hero: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  actions: { gap: Spacing.three, paddingTop: Spacing.two },
});
