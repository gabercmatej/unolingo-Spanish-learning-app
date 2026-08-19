import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LevelUp, MascotNote } from '@/components/learn/level-up';
import { Burst, CountUp, Reveal, stagger, useCountUp, useEntrancePop } from '@/components/ui/motion';
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
import { sound } from '@/lib/sound';

export interface ConceptDelta {
  conceptId: string;
  before: number;
  after: number;
}

/**
 * A course boundary this session crossed.
 *
 * `scope` rather than a boolean because a stage and a unit are the same event
 * at two magnitudes, and the difference has to survive into the rendering — a
 * stage is the larger of the two things Unolingo can tell you outside of a
 * level, and it should not arrive looking like a unit.
 */
export interface Milestone {
  scope: 'unit' | 'stage';
  title: string;
  caption: string;
  /**
   * Typed as the UI's icon vocabulary rather than content's `UnitIcon`. A unit
   * hands its own icon straight through, but a stage has no icon of its own and
   * needs one this union has and that one does not — the narrow content union
   * exists to keep `content/` free of UI imports, not to constrain the UI.
   */
  icon: IconName;
  /** A key into the palette, so content never imports a UI colour. */
  tone: string;
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
  /** The streak as it stood before this session banked its day. */
  streakBefore: number;
  /** Set only when this session finished a unit or a whole stage. */
  milestone?: Milestone;
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
  // A streak only counts as growing if it actually moved *this* session. The
  // second lesson of the day banks no new day, and telling the learner it did
  // would be the app congratulating itself.
  const streakGrew = summary.streak > summary.streakBefore && summary.streak >= 2;
  const goalPop = useEntrancePop(stagger(5) + 120, 0.86);

  /**
   * Finishing plays one cue; crossing a level plays a different one, and
   * `LevelUp` owns that because it owns the moment. Two fanfares over the same
   * event is the fastest way to make a reward sound cheap.
   */
  useEffect(() => {
    if (levelledUp) return;
    sound.complete();
  }, [levelledUp]);

  /**
   * An unlock rides *after* whichever cue went first. They are all built from
   * the same chord so they stack without clashing, but they still need to be
   * two events rather than one noise.
   */
  useEffect(() => {
    if (summary.unlocked.length === 0 && !summary.milestone) return;
    const timer = setTimeout(() => sound.unlock(), levelledUp ? 950 : 640);
    return () => clearTimeout(timer);
  }, [levelledUp, summary.milestone, summary.unlocked.length]);

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
          delay={140}
        />
        <Text variant="title" rounded center>
          {headline}
        </Text>
        <Text variant="small" color="textSecondary" center>
          {summary.title}
        </Text>
      </Reveal>

      {levelledUp ? (
        <Reveal delay={stagger(1)}>
          <LevelUp
            level={summary.levelAfter}
            rank={rankChanged ? newRank : undefined}
            progress={summary.levelProgress}
          />
        </Reveal>
      ) : (
        <Reveal delay={stagger(1)}>
          <MascotNote accuracy={accuracy} />
        </Reveal>
      )}

      {summary.milestone ? (
        <Reveal delay={stagger(2)}>
          <MilestoneCard milestone={summary.milestone} />
        </Reveal>
      ) : null}

      {streakGrew ? (
        <Reveal delay={stagger(3)}>
          <StreakCard streak={summary.streak} />
        </Reveal>
      ) : null}

      {summary.unlocked.length > 0 ? (
        <Reveal delay={stagger(4)}>
          <Card variant="flat">
            <View style={styles.cardHead}>
              <Icon name="ribbon-outline" size={16} tone={theme.accent} />
              <Text variant="overline" tone={theme.accent}>
                {summary.unlocked.length === 1 ? 'ACHIEVEMENT UNLOCKED' : 'ACHIEVEMENTS UNLOCKED'}
              </Text>
            </View>
            {summary.unlocked.map((achievement, index) => (
              <UnlockedRow key={achievement.id} achievement={achievement} index={index} />
            ))}
          </Card>
        </Reveal>
      ) : null}

      {summary.goalReached ? (
        <Reveal delay={stagger(7)}>
          <Animated.View style={[styles.goal, { backgroundColor: theme.accentSoft }, goalPop]}>
            <Icon name="checkmark-circle" size={22} tone={theme.accentText} />
            <View style={styles.flex}>
              <Text variant="smallBold" tone={theme.accentText}>
                Daily goal complete
              </Text>
              <Text variant="caption" tone={theme.accentText}>
                Keep going for as long as you like — nothing stops here.
              </Text>
            </View>
          </Animated.View>
        </Reveal>
      ) : null}

      <Reveal delay={stagger(8)}>
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
        <Reveal delay={stagger(7)}>
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
        <Reveal delay={stagger(8)}>
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

      <Reveal delay={stagger(9)} style={styles.actions}>
        <Button title="Continue" size="lg" onPress={onContinue} />
        {onReviewMistakes && summary.needsReview.length > 0 ? (
          <Button title="Review mistakes now" variant="secondary" onPress={onReviewMistakes} />
        ) : null}
      </Reveal>
    </View>
  );
}

/**
 * A unit or a stage finished.
 *
 * The only place outside `LevelUp` that gets a burst, and only because
 * finishing a unit is genuinely rare — a learner sees this a couple of dozen
 * times across the whole course, against a correct answer several hundred times
 * a week. Rarity is what a celebration is spending; the burst is affordable
 * here and would be worthless one tier down.
 */
function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const theme = useTheme();
  const tone = (theme[milestone.tone as keyof typeof theme] as string) ?? theme.tint;
  const badgePop = useEntrancePop(stagger(2) + 120, 0.5);

  return (
    <View style={[styles.milestone, { borderColor: tone, backgroundColor: theme.backgroundRaised }]}>
      <View style={styles.badgeWrap}>
        <Burst tones={[tone, theme.accent]} radius={54} />
        <Animated.View style={[styles.milestoneBadge, { backgroundColor: `${tone}1F` }, badgePop]}>
          <Icon name={milestone.icon} size={24} tone={tone} />
        </Animated.View>
      </View>
      <View style={styles.flex}>
        <Text variant="overline" tone={tone}>
          {milestone.scope === 'stage' ? 'STAGE COMPLETE' : 'UNIT COMPLETE'}
        </Text>
        <Text variant="subheading" rounded numberOfLines={2}>
          {milestone.title}
        </Text>
        <Text variant="caption" color="textSecondary">
          {milestone.caption}
        </Text>
      </View>
    </View>
  );
}

/**
 * The day the streak grew.
 *
 * Shown only on the session that banked the day, which is what makes it worth
 * looking at — the Profile already carries the number permanently, and a
 * standing figure repeated on the results screen is furniture. The number rolls
 * for the same reason XP does: arriving at seven is the event, not being seven.
 */
function StreakCard({ streak }: { streak: number }) {
  const theme = useTheme();
  const flame = useEntrancePop(stagger(3) + 120, 0.5);

  return (
    <View style={[styles.streak, { backgroundColor: theme.tintSoft }]}>
      <Animated.View style={flame}>
        <Icon name="flame" size={26} tone={theme.tint} />
      </Animated.View>
      <View style={styles.flex}>
        <CountUp
          value={streak}
          duration={700}
          format={(value) => `${value} day streak`}
          variant="smallBold"
          tone={theme.tintText}
        />
        <Text variant="caption" tone={theme.tintText}>
          One more day on the board. Streaks here are recomputed, never punished.
        </Text>
      </View>
    </View>
  );
}

/**
 * One unlocked achievement.
 *
 * Its own component only so it can hold a hook — a pop per row needs a shared
 * value per row, and calling `useEntrancePop` inside a `.map` is the one place
 * the rules of hooks and a readable list disagree.
 */
function UnlockedRow({ achievement, index }: { achievement: Achievement; index: number }) {
  const theme = useTheme();
  const pop = useEntrancePop(stagger(4) + 160 + index * 90, 0.6);

  return (
    <Animated.View style={[styles.row, pop]}>
      <Icon name={achievement.icon as IconName} size={18} tone={theme.accent} />
      <View style={styles.flex}>
        <Text variant="smallBold">{achievement.title}</Text>
        <Text variant="caption" color="textSecondary">
          {achievement.description}
        </Text>
      </View>
    </Animated.View>
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
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  badgeWrap: { alignItems: 'center', justifyContent: 'center' },
  milestoneBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.md,
  },
  actions: { gap: Spacing.three, paddingTop: Spacing.two },
});
