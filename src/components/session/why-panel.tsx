import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/learning/exercise';
import { explainExercise } from '@/learning/explain';

/**
 * The developer's answer to "why am I seeing this?".
 *
 * Collapsed to a single line until tapped, and only present at all when
 * Developer mode is on, because this is an instrument for diagnosing the
 * adaptive layer rather than something a learner should be reading mid-session.
 * When a review feels wrong, the point of this panel is to say *which* layer is
 * wrong — mastery, scheduling, ranking, or skill adaptation — instead of leaving
 * a hunch to argue with four tested subsystems.
 */
export function WhyPanel({ exercise }: { exercise: Exercise }) {
  const { learner, settings } = useLearner();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  if (!settings.developerMode) return null;

  const explanation = explainExercise(exercise, learner);

  return (
    <Card variant="outline" style={styles.card}>
      <PressScale onPress={() => setOpen((was) => !was)} scaleTo={0.99}>
        <View style={styles.head}>
          <Icon name="bug-outline" size={15} color="textTertiary" />
          <Text variant="caption" color="textSecondary" style={styles.flex}>
            {explanation.kindLabel} · difficulty {explanation.difficulty} · {explanation.skill}{' '}
            {explanation.skillStanding}
          </Text>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} color="textTertiary" />
        </View>
      </PressScale>

      {open ? (
        <View style={styles.body}>
          {explanation.notes.map((note) => (
            <View key={note} style={styles.note}>
              <Text variant="caption" color="textTertiary">
                ·
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.flex}>
                {note}
              </Text>
            </View>
          ))}

          {explanation.concepts.map((concept) => (
            <View
              key={concept.conceptId}
              style={[styles.concept, { borderColor: theme.border, borderRadius: Radius.sm }]}>
              <Text variant="caption" color="text">
                {concept.label}
                {concept.level ? ` · ${concept.level}` : ''}
              </Text>
              <Text variant="caption" color="textTertiary" numeric>
                mastery {concept.masteryPct}% · recall {Math.round(concept.retrievability * 100)}% ·
                stability {concept.stability}d · ease {concept.ease}
              </Text>
              <Text variant="caption" color="textTertiary" numeric>
                seen {concept.timesSeen}× · lapses {concept.lapses} ·{' '}
                {concept.lastReviewedDaysAgo === null
                  ? 'never reviewed'
                  : `reviewed ${concept.lastReviewedDaysAgo}d ago`}{' '}
                · due {concept.dueInDays === null ? '—' : `${concept.dueInDays}d`}
              </Text>
              <Text variant="caption" color="textTertiary">
                {concept.reasons.join(' · ')}
              </Text>
            </View>
          ))}

          <Text variant="caption" color="textTertiary">
            Level driving the exercise mix: {explanation.demonstratedLevel} (demonstrated)
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.five, width: '100%' },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1, minWidth: 0 },
  body: { marginTop: Spacing.three, gap: Spacing.three },
  note: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  concept: { borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: 2 },
});
