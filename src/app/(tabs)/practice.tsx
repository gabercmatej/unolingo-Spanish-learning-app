import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { conversations } from '@/content';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { dueConcepts, weakAreas } from '@/learning/mastery';
import { unlockedStories } from '@/learning/session';

/**
 * Practice. The app already knows what needs work — this screen shows it and
 * gives one tap to act on it, plus the study modes for when you'd rather choose.
 */
export default function PracticeScreen() {
  const theme = useTheme();
  const { learner } = useLearner();
  const now = Date.now();

  const weak = useMemo(() => weakAreas(learner, now, 6), [learner, now]);
  const due = useMemo(() => dueConcepts(learner, now).length, [learner, now]);
  const openMistakes = learner.mistakes.filter((mistake) => !mistake.resolvedAt).length;
  const stories = useMemo(() => unlockedStories(learner), [learner]);
  const hasHistory = Object.keys(learner.concepts).length > 0;

  const start = (kind: string, source?: string, concepts?: string[]) =>
    router.push({
      pathname: '/session',
      params: { kind, source: source ?? kind, ...(concepts ? { concepts: concepts.join(',') } : {}) },
    });

  if (!hasHistory) {
    return (
      <Screen title="Practice" subtitle="Targeted review, built from your history">
        <EmptyState
          icon="barbell-outline"
          title="Nothing to practise yet"
          message="Finish your first lesson and this fills up with exactly what you need to work on."
          tone={theme.tint}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Practice" subtitle="Targeted review, built from your history">
      <PressScale onPress={() => start('smartReview', 'smart-review')} scaleTo={0.985} haptic="press">
        <View style={[styles.hero, { backgroundColor: theme.text }]}>
          <View style={styles.flex}>
            <Text variant="overline" tone={theme.background}>
              RECOMMENDED
            </Text>
            <Text variant="heading" rounded tone={theme.background}>
              Smart Review
            </Text>
            <Text variant="small" tone={theme.background} style={styles.dim}>
              {due > 0
                ? `${due} concept${due === 1 ? '' : 's'} due, ordered by forgetting risk`
                : 'Nothing overdue — this will stretch what you already know'}
            </Text>
          </View>
          <Icon name="sparkles" size={26} tone={theme.background} />
        </View>
      </PressScale>

      {weak.length > 0 ? (
        <Section title="Your weak areas" caption="Tap any one to drill it right now">
          <Card variant="flat" padding="four">
            {weak.map((area) => {
              const tone =
                area.mastery < 0.5 ? theme.danger : area.mastery < 0.7 ? theme.warning : theme.accent;
              return (
                <PressScale
                  key={area.id}
                  onPress={() => start('concept', area.id, area.conceptIds.slice(0, 14))}
                  scaleTo={0.98}
                  accessibilityLabel={`Practise ${area.label}, ${Math.round(area.mastery * 100)} percent`}>
                  <View style={styles.weakRow}>
                    <View style={[styles.dot, { backgroundColor: tone }]} />
                    <View style={styles.flex}>
                      <Text variant="small" numberOfLines={1}>
                        {area.label}
                      </Text>
                      <ProgressBar value={area.mastery} height={5} tone={tone} />
                    </View>
                    <Text variant="smallBold" tone={tone}>
                      {Math.round(area.mastery * 100)}%
                    </Text>
                  </View>
                </PressScale>
              );
            })}
          </Card>
        </Section>
      ) : null}

      <Section title="Study modes">
        <View style={styles.grid}>
          <ModeTile
            icon="flash-outline"
            title="Quick Practice"
            caption="~3 minutes"
            tone={theme.accent}
            soft={theme.accentSoft}
            onPress={() => start('quickPractice')}
          />
          <ModeTile
            icon="book-outline"
            title="Vocabulary"
            caption="Words you have met"
            tone={theme.vocab}
            soft={theme.vocabSoft}
            onPress={() => start('vocabulary')}
          />
          <ModeTile
            icon="construct-outline"
            title="Grammar"
            caption="Rules and conjugation"
            tone={theme.grammar}
            soft={theme.grammarSoft}
            onPress={() => start('grammar')}
          />
          <ModeTile
            icon="headset-outline"
            title="Listening"
            caption="Spain Spanish, spoken"
            tone={theme.listening}
            soft={theme.listeningSoft}
            onPress={() => start('listening')}
          />
          <ModeTile
            icon="barbell-outline"
            title="Hard Mode"
            caption="No banks, no hints"
            tone={theme.danger}
            soft={theme.dangerSoft}
            onPress={() => start('hardMode')}
          />
          <ModeTile
            icon="shuffle-outline"
            title="Random"
            caption="Anything, any form"
            tone={theme.speaking}
            soft={theme.speakingSoft}
            onPress={() => start('random')}
          />
        </View>
      </Section>

      <Section title="Mistakes" action={{ label: 'Notebook', onPress: () => router.push('/mistakes') }}>
        <Card
          variant="flat"
          onPress={() => (openMistakes > 0 ? start('mistakes') : router.push('/mistakes'))}>
          <View style={styles.row}>
            <View style={[styles.badge, { backgroundColor: theme.dangerSoft }]}>
              <Icon name="refresh" size={18} tone={theme.danger} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyBold">
                {openMistakes > 0 ? `${openMistakes} open mistake${openMistakes === 1 ? '' : 's'}` : 'No open mistakes'}
              </Text>
              <Text variant="caption" color="textSecondary">
                {openMistakes > 0
                  ? 'Practise them until they stop coming back'
                  : 'Everything you got wrong, you have since fixed'}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color="textTertiary" />
          </View>
        </Card>
      </Section>

      <Section title="Conversation">
        <View style={styles.list}>
          {conversations.map((scene) => (
            <Card key={scene.id} variant="flat" onPress={() => start('conversation', scene.id)}>
              <View style={styles.row}>
                <View style={[styles.listIcon, { backgroundColor: theme.conversationSoft }]}>
                  <Icon name={scene.icon} size={18} tone={theme.conversation} />
                </View>
                <View style={styles.flex}>
                  <Text variant="bodyBold">{scene.title}</Text>
                  <Text variant="caption" color="textSecondary" numberOfLines={2}>
                    {scene.setting}
                  </Text>
                </View>
                <Text variant="caption" color="textTertiary">
                  {scene.level}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </Section>

      {stories.length > 0 ? (
        <Section title="Stories">
          <View style={styles.list}>
            {stories.map((story) => (
              <Card key={story.id} variant="flat" onPress={() => start('story', story.id)}>
                <View style={styles.row}>
                  <View style={[styles.listIcon, { backgroundColor: theme.storySoft }]}>
                    <Icon name={story.icon} size={18} tone={theme.story} />
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyBold">{story.title}</Text>
                    <Text variant="caption" color="textSecondary" numberOfLines={2}>
                      {story.blurb}
                    </Text>
                  </View>
                  <Text variant="caption" color="textTertiary">
                    {story.level}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}

function ModeTile({
  icon,
  title,
  caption,
  tone,
  soft,
  onPress,
}: {
  icon: IconName;
  title: string;
  caption: string;
  tone: string;
  soft: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressScale onPress={onPress} scaleTo={0.96} haptic="press" style={styles.tile}>
      <View style={[styles.tileInner, { backgroundColor: soft }]}>
        <View style={[styles.tileIcon, { backgroundColor: theme.backgroundElement }]}>
          <Icon name={icon} size={18} tone={tone} />
        </View>
        <Text variant="smallBold" tone={tone}>
          {title}
        </Text>
        <Text variant="caption" tone={tone} style={styles.dim}>
          {caption}
        </Text>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dim: { opacity: 0.8 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.five,
    borderRadius: Radius.lg,
  },
  weakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: Radius.full },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  tile: { flexBasis: '48%', flexGrow: 1 },
  tileInner: { gap: Spacing.one, padding: Spacing.four, borderRadius: Radius.md, minHeight: 108 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  badge: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: Spacing.three },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
