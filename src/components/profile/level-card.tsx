import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RANKS, xpToReachRank, type Rank, type RankProgress } from '@/learning/ranks';

const format = (n: number) => n.toLocaleString('en-GB');

/**
 * The level hero.
 *
 * "Level 7" on its own is a number with no meaning. This answers the four
 * questions that give it one, in reading order: what am I (rank), how far into
 * this level (bar), what is next (XP owing), and what is the next thing worth
 * reaching (the rank ahead).
 */
export function LevelHero({ progress }: { progress: RankProgress }) {
  const theme = useTheme();
  const tone = theme[progress.rank.tone] as string;

  return (
    <View style={styles.hero}>
      <View style={styles.titleRow}>
        <Icon name={progress.rank.icon as IconName} size={18} tone={tone} />
        <Text variant="heading" rounded numeric style={styles.flex}>
          Level {progress.level}
        </Text>
        <View style={[styles.rankTag, { backgroundColor: `${tone}1F` }]}>
          <Text variant="smallBold" tone={tone}>
            {progress.rank.name}
          </Text>
        </View>
      </View>

      <Text variant="small" color="textSecondary">
        {progress.rank.tagline}
      </Text>

      <View style={styles.barBlock}>
        <ProgressBar value={progress.progress} height={10} tone={tone} />
        <View style={styles.barLabels}>
          <Text variant="caption" color="textTertiary" numeric>
            {format(progress.into)} / {format(progress.needed)} XP
          </Text>
          <Text variant="caption" tone={tone} numeric>
            {format(progress.toNextLevel)} XP to Level {progress.level + 1}
          </Text>
        </View>
      </View>

      {progress.next ? (
        <View style={[styles.nextRank, { borderColor: theme.border }]}>
          <Icon name={progress.next.icon as IconName} size={16} color="textTertiary" />
          <Text variant="caption" color="textSecondary" style={styles.flex}>
            Next rank <Text variant="caption" tone={theme[progress.next.tone] as string}>
              {progress.next.name}
            </Text>{' '}
            at Level {progress.next.from}
          </Text>
          <Text variant="caption" color="textTertiary" numeric>
            {format(progress.toNextRank ?? 0)} XP
          </Text>
        </View>
      ) : (
        <View style={[styles.nextRank, { borderColor: theme.border }]}>
          <Icon name="ribbon-outline" size={16} tone={tone} />
          <Text variant="caption" color="textSecondary" style={styles.flex}>
            Highest rank reached. Levels keep counting.
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * The whole ladder, past and future.
 *
 * Showing the ranks already behind you is the point — a progression bar tells
 * you where you are, but the list tells you how far you have come, which is the
 * part that makes the next one worth walking to.
 */
export function RankJourney({ level }: { level: number }) {
  const theme = useTheme();

  return (
    <View style={styles.journey}>
      {RANKS.map((rank, index) => {
        const state = rankState(rank, level);
        const tone = theme[rank.tone] as string;
        const dim = state === 'locked';
        const isLast = index === RANKS.length - 1;

        return (
          <View key={rank.id} style={styles.rankRow}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  {
                    backgroundColor: state === 'done' ? tone : 'transparent',
                    borderColor: dim ? theme.border : tone,
                  },
                ]}>
                {state === 'done' ? (
                  <Icon name="checkmark" size={11} tone={theme.onTint} />
                ) : state === 'current' ? (
                  <View style={[styles.dot, { backgroundColor: tone }]} />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: state === 'done' ? tone : theme.border },
                  ]}
                />
              ) : null}
            </View>

            <View style={[styles.rankBody, { opacity: dim ? 0.55 : 1 }]}>
              <View style={styles.rankHead}>
                <Text variant="smallBold" tone={state === 'current' ? tone : undefined}>
                  {rank.name}
                </Text>
                <Text variant="caption" color="textTertiary" numeric>
                  {rank.to === null ? `Level ${rank.from}+` : `Level ${rank.from}–${rank.to}`}
                </Text>
                {state === 'current' ? (
                  <View style={[styles.youAreHere, { backgroundColor: `${tone}1F` }]}>
                    <Text variant="caption" tone={tone}>
                      You are here
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="caption" color="textSecondary">
                {rank.tagline}
              </Text>
              {state === 'locked' ? (
                <Text variant="caption" color="textTertiary" numeric>
                  {format(xpToReachRank(rank))} XP total
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function rankState(rank: Rank, level: number): 'done' | 'current' | 'locked' {
  if (rank.to !== null && level > rank.to) return 'done';
  if (level >= rank.from) return 'current';
  return 'locked';
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hero: { gap: Spacing.three },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rankTag: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
  },
  barBlock: { gap: Spacing.two },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  nextRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  journey: { gap: 0 },
  rankRow: { flexDirection: 'row', gap: Spacing.three },
  rail: { alignItems: 'center', width: 22, paddingTop: 2 },
  node: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: Radius.full },
  connector: { width: 2, flex: 1, minHeight: 14, marginTop: 2 },
  rankBody: { flex: 1, minWidth: 0, gap: 2, paddingBottom: Spacing.four },
  rankHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  youAreHere: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
});
