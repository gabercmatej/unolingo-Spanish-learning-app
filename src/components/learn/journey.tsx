import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Elevation, Radius, Spacing } from '@/constants/theme';
import type { Lesson } from '@/content/types';
import { useTheme } from '@/hooks/use-theme';
import type { StageProgress, UnitProgress, UnitState } from '@/learning/mastery';

/**
 * The learning path.
 *
 * The brief was to make the whole course legible as one journey without an
 * endless screen, so: CEFR stages are accordions (the current one open by
 * default), units are the navigation unit, and only the unit you are on expands
 * to show its lessons. Completed units stay visible and tappable — finishing
 * something once is not the same as knowing it, which is why each carries its
 * own decaying mastery figure and can ask for review.
 *
 * Iconography is a single Ionicons vocabulary, not emoji. Emoji here would read
 * as decoration and break the one-icon-style rule the rest of the app follows.
 */

interface JourneyProps {
  stages: StageProgress[];
  onOpenUnit: (unitId: string) => void;
  onStartLesson: (lesson: Lesson) => void;
}

export function Journey({ stages, onOpenUnit, onStartLesson }: JourneyProps) {
  const currentStageId = stages.find((stage) => stage.state === 'current')?.stage.id ?? null;
  const [open, setOpen] = useState<string | null>(currentStageId ?? stages[0]?.stage.id ?? null);

  /**
   * If progress moves the learner into a new stage, follow them there — but only
   * on the render where it actually changed, so a learner who collapses the
   * accordion is not fought with on the next render. Adjusting state during
   * render is the sanctioned pattern for this; the effect it replaces cost an
   * extra render every time the Learn page recomputed.
   */
  const [followed, setFollowed] = useState(currentStageId);
  if (currentStageId !== followed) {
    setFollowed(currentStageId);
    if (currentStageId) setOpen(currentStageId);
  }

  return (
    <View style={styles.stages}>
      {stages.map((stage) => (
        <StageSection
          key={stage.stage.id}
          stage={stage}
          expanded={open === stage.stage.id}
          onToggle={() => setOpen((value) => (value === stage.stage.id ? null : stage.stage.id))}
          onOpenUnit={onOpenUnit}
          onStartLesson={onStartLesson}
        />
      ))}
    </View>
  );
}

function StageSection({
  stage,
  expanded,
  onToggle,
  onOpenUnit,
  onStartLesson,
}: {
  stage: StageProgress;
  expanded: boolean;
  onToggle: () => void;
  onOpenUnit: (unitId: string) => void;
  onStartLesson: (lesson: Lesson) => void;
}) {
  const theme = useTheme();
  const { state } = stage;

  const accent =
    state === 'complete' ? theme.success : state === 'current' ? theme.tint : theme.textTertiary;

  const statusIcon: IconName =
    state === 'complete'
      ? 'checkmark-circle'
      : state === 'current'
        ? 'radio-button-on'
        : state === 'planned'
          ? 'ellipsis-horizontal-circle-outline'
          : 'lock-closed';

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={[
        styles.stage,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: expanded && state === 'current' ? theme.tint : theme.border,
          shadowColor: theme.shadow,
        },
        expanded ? Elevation.card : null,
      ]}>
      <PressScale
        onPress={onToggle}
        scaleTo={0.995}
        haptic="tap"
        accessibilityLabel={`${stage.stage.levelRange} ${stage.stage.title}, ${stage.unitsDone} of ${stage.unitCount} units`}
        accessibilityState={{ selected: expanded }}>
        <View style={styles.stageHead}>
          <Icon name={statusIcon} size={20} tone={accent} />

          <View style={styles.flex}>
            <View style={styles.stageTitleRow}>
              <Text variant="smallBold" tone={accent}>
                {stage.stage.levelRange}
              </Text>
              <Text variant="caption" color="textTertiary">
                ·
              </Text>
              <Text variant="smallBold" numberOfLines={1} style={styles.flex}>
                {stage.stage.title}
              </Text>
            </View>
            <Text variant="caption" color="textSecondary" numeric numberOfLines={1}>
              {stage.unitCount > 0
                ? `${stage.unitsDone} / ${stage.unitCount} units`
                : `${stage.plannedCount} units planned`}
              {stage.plannedCount > 0 && stage.unitCount > 0
                ? ` · ${stage.plannedCount} planned`
                : ''}
            </Text>
          </View>

          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="textTertiary"
          />
        </View>
      </PressScale>

      {stage.unitCount > 0 ? (
        <View style={styles.stageBar}>
          <ProgressBar
            value={stage.progress}
            height={5}
            tone={state === 'complete' ? theme.success : theme.tint}
          />
        </View>
      ) : null}

      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.units}>
          {stage.units.map((unit, index) => (
            <UnitRow
              key={unit.unit.id}
              unit={unit}
              isLast={index === stage.units.length - 1}
              onOpen={() => onOpenUnit(unit.unit.id)}
              onStartLesson={onStartLesson}
            />
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function nodeAppearance(state: UnitState, theme: ReturnType<typeof useTheme>) {
  switch (state) {
    case 'complete':
      return { fill: theme.success, ring: theme.success, icon: 'checkmark' as IconName, iconTone: theme.onTint };
    case 'current':
      return { fill: theme.tint, ring: theme.tint, icon: 'ellipse' as IconName, iconTone: theme.onTint };
    case 'available':
      return { fill: theme.backgroundElement, ring: theme.tint, icon: null, iconTone: theme.tint };
    case 'locked':
      return {
        fill: theme.backgroundSunken,
        ring: theme.border,
        icon: 'lock-closed' as IconName,
        iconTone: theme.textTertiary,
      };
    case 'planned':
    default:
      return { fill: 'transparent', ring: theme.borderStrong, icon: null, iconTone: theme.textTertiary };
  }
}

function UnitRow({
  unit,
  isLast,
  onOpen,
  onStartLesson,
}: {
  unit: UnitProgress;
  isLast: boolean;
  onOpen: () => void;
  onStartLesson: (lesson: Lesson) => void;
}) {
  const theme = useTheme();
  const { state } = unit;
  const node = nodeAppearance(state, theme);
  const tone = theme[unit.unit.tone];
  const soft = theme[`${unit.unit.tone}Soft` as keyof typeof theme] as string;

  const isCurrent = state === 'current' || state === 'available';
  const dimmed = state === 'locked' || state === 'planned';

  return (
    <View style={styles.unitRow}>
      {/* Rail: node plus the connector down to the next unit. */}
      <View style={styles.rail}>
        <View
          style={[
            styles.node,
            {
              backgroundColor: node.fill,
              borderColor: node.ring,
              borderStyle: state === 'planned' ? 'dashed' : 'solid',
            },
          ]}>
          {node.icon ? <Icon name={node.icon} size={12} tone={node.iconTone} /> : null}
        </View>
        {!isLast ? (
          <View
            style={[
              styles.connector,
              { backgroundColor: state === 'complete' ? theme.success : theme.border },
            ]}
          />
        ) : null}
      </View>

      {/* The lesson rows are siblings of the header, not children of it: a
          pressable inside a pressable is invalid on web and breaks a11y. */}
      <View
        style={[
          styles.unitCard,
          styles.flex,
          {
            backgroundColor: isCurrent ? soft : 'transparent',
            borderColor: isCurrent ? tone : 'transparent',
            borderWidth: isCurrent ? 1.5 : 0,
            opacity: dimmed ? 0.55 : 1,
          },
        ]}>
        <PressScale
          onPress={onOpen}
          disabled={state === 'planned'}
          scaleTo={0.99}
          haptic="press"
          accessibilityLabel={`${unit.unit.title}, ${unitStateLabel(unit)}`}>
          <View style={styles.unitTop}>
            <View
              style={[
                styles.unitIcon,
                { backgroundColor: isCurrent ? theme.backgroundElement : theme.backgroundSunken },
              ]}>
              <Icon name={unit.unit.icon} size={17} tone={dimmed ? theme.textTertiary : tone} />
            </View>

            <View style={styles.flex}>
              <Text variant="bodyBold" numberOfLines={1}>
                {unit.unit.title}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {unit.unit.subtitle}
              </Text>
            </View>

            <UnitMeta unit={unit} />
          </View>
        </PressScale>

        {/* Only the unit you are on opens up inline. */}
        {isCurrent ? (
          <>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {unit.unit.topics.join(' · ')}
            </Text>
            <View style={styles.lessonList}>
              {unit.unit.lessons.map((lesson) => (
                <LessonLine
                  key={lesson.id}
                  lesson={lesson}
                  done={unit.completedLessonIds.includes(lesson.id)}
                  isNext={unit.nextLesson?.id === lesson.id}
                  tone={tone}
                  onPress={() => onStartLesson(lesson)}
                />
              ))}
            </View>
          </>
        ) : null}

        {state === 'complete' && unit.needsReview ? (
          <View style={[styles.reviewFlag, { backgroundColor: theme.warningSoft }]}>
            <Icon name="refresh-outline" size={13} tone={theme.warning} />
            <Text variant="caption" tone={theme.warning}>
              Review recommended — {Math.round(unit.mastery * 100)}% mastery
            </Text>
          </View>
        ) : null}

        {state === 'locked' ? (
          <Text variant="caption" color="textTertiary">
            Finish the previous unit to unlock
          </Text>
        ) : null}

        {state === 'planned' ? (
          <Text variant="caption" color="textTertiary" numberOfLines={2}>
            {unit.unit.topics.join(' · ')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function UnitMeta({ unit }: { unit: UnitProgress }) {
  const theme = useTheme();

  if (unit.state === 'planned') {
    return (
      <View style={[styles.tag, { backgroundColor: theme.backgroundSunken }]}>
        <Text variant="caption" color="textTertiary">
          Planned
        </Text>
      </View>
    );
  }
  if (unit.state === 'complete') {
    return (
      <Text variant="caption" numeric tone={unit.needsReview ? theme.warning : theme.success}>
        {Math.round(unit.mastery * 100)}%
      </Text>
    );
  }
  if (unit.state === 'locked') {
    return <Icon name="lock-closed" size={13} color="textTertiary" />;
  }
  return (
    <Text variant="caption" color="textSecondary" numeric>
      {unit.lessonsDone}/{unit.lessonCount}
    </Text>
  );
}

function LessonLine({
  lesson,
  done,
  isNext,
  tone,
  onPress,
}: {
  lesson: Lesson;
  done: boolean;
  isNext: boolean;
  tone: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <PressScale
      onPress={onPress}
      scaleTo={0.98}
      haptic="press"
      accessibilityLabel={`${lesson.title}. ${lesson.goal}`}>
      <View
        style={[
          styles.lessonLine,
          {
            backgroundColor: isNext ? theme.backgroundElement : 'transparent',
            borderColor: isNext ? tone : theme.border,
          },
        ]}>
        <Icon
          name={done ? 'checkmark-circle' : isNext ? 'play-circle' : 'ellipse-outline'}
          size={16}
          tone={done ? theme.success : isNext ? tone : theme.textTertiary}
        />
        <Text
          variant={isNext ? 'smallBold' : 'small'}
          color={done ? 'textSecondary' : 'text'}
          numberOfLines={1}
          style={styles.flex}>
          {lesson.title}
        </Text>
        {isNext ? (
          <Text variant="caption" tone={tone}>
            {lesson.estMinutes} min
          </Text>
        ) : null}
      </View>
    </PressScale>
  );
}

function unitStateLabel(unit: UnitProgress): string {
  switch (unit.state) {
    case 'complete':
      return `complete, ${Math.round(unit.mastery * 100)} percent mastery`;
    case 'current':
      return `in progress, ${unit.lessonsDone} of ${unit.lessonCount} lessons`;
    case 'available':
      return 'ready to start';
    case 'locked':
      return 'locked';
    default:
      return 'planned';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stages: { gap: Spacing.three },
  stage: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stageBar: { paddingHorizontal: Spacing.half },
  units: { gap: 0, paddingTop: Spacing.two },
  unitRow: { flexDirection: 'row', gap: Spacing.three },
  rail: { alignItems: 'center', width: 24, paddingTop: Spacing.three },
  node: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: { width: 2, flex: 1, minHeight: 16, marginTop: 2 },
  unitCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
  },
  unitTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  unitIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.full,
  },
  lessonList: { gap: Spacing.two, paddingTop: Spacing.one },
  lessonLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  reviewFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
  },
});
