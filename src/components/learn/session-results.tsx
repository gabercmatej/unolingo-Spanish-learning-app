import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { RingProgress } from '@/components/ui/progress';
import { Stat, StatGrid } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { conceptLabel, getConcept } from '@/content';
import { useTheme } from '@/hooks/use-theme';
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

  const topImproved = [...summary.improved]
    .filter((delta) => delta.after > delta.before + 0.01)
    .sort((a, b) => b.after - b.before - (a.after - a.before))
    .slice(0, 3);

  return (
    <View style={styles.stack}>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.hero}>
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
      </Animated.View>

      {summary.goalReached ? (
        <Animated.View entering={FadeInDown.delay(120).duration(280)}>
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
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(160).duration(280)}>
        <StatGrid>
          <Stat value={`+${summary.xp}`} label="XP earned" icon="flash" tone={theme.accent} />
          <Stat value={`${summary.newConcepts}`} label="New" icon="sparkles" tone={theme.tint} />
          <Stat
            value={formatDuration(summary.seconds)}
            label="Time"
            icon="time-outline"
            tone={theme.listening}
          />
        </StatGrid>
      </Animated.View>

      {topImproved.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(220).duration(280)}>
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
        </Animated.View>
      ) : null}

      {summary.needsReview.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(260).duration(280)}>
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
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(320).duration(280)} style={styles.actions}>
        <Button title="Continue" size="lg" onPress={onContinue} />
        {onReviewMistakes && summary.needsReview.length > 0 ? (
          <Button title="Review mistakes now" variant="secondary" onPress={onReviewMistakes} />
        ) : null}
      </Animated.View>
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
