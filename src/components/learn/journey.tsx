import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { stagger, usePop } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Elevation, Motion, Radius, Spacing } from '@/constants/theme';
import type { Lesson } from '@/content/types';
import { useTheme } from '@/hooks/use-theme';
import type { StageProgress, UnitProgress, UnitState } from '@/learning/mastery';

/**
 * The learning path.
 *
 * CEFR stages are accordions; **the unit is the visual unit**. Everything a
 * unit owns is drawn inside one bounded block with a rail running down its
 * lessons and an explicit cap where it ends, so that where a unit begins, what
 * belongs to it, and where it hands over to the next are all answerable at a
 * glance rather than inferred from spacing.
 *
 * The one rule this screen now enforces above all others:
 *
 *   **Lessons are progression. Practice is optional mastery.**
 *
 * The lesson list is the spine and every row in it is required. The practice
 * row is a separate affordance below the cap, reachable only once the unit is
 * complete, and it is never counted in the unit's progress. This screen used to
 * render the *practice* counter as the unit's progress, which is how a unit with
 * every lesson ticked came to display `2/5` with "Next: Active recall" under
 * it — two different questions answered through one number, and unreadable as
 * either.
 *
 * Iconography is a single Ionicons vocabulary, not emoji.
 */

interface JourneyProps {
  stages: StageProgress[];
  onOpenUnit: (unitId: string) => void;
  onStartLesson: (lesson: Lesson) => void;
  /**
   * Start optional practice for a completed unit.
   *
   * `step` is a suggested practice phase when the unit still has one that has
   * not been played. It is a recommendation only — practice steps are unordered
   * and nothing about them gates anything.
   */
  onPractiseUnit: (unitId: string, step?: string) => void;
}

export function Journey({ stages, onOpenUnit, onStartLesson, onPractiseUnit }: JourneyProps) {
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
          onPractiseUnit={onPractiseUnit}
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
  onPractiseUnit,
}: {
  stage: StageProgress;
  expanded: boolean;
  onToggle: () => void;
  onOpenUnit: (unitId: string) => void;
  onStartLesson: (lesson: Lesson) => void;
  onPractiseUnit: (unitId: string, step?: string) => void;
}) {
  const theme = useTheme();
  const { state } = stage;

  /**
   * The chevron rotates rather than being swapped for its opposite. Swapping
   * two glyphs states the result; rotating one states the *change*, which is
   * the only thing a disclosure control has to communicate.
   */
  const turn = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    turn.set(withSpring(expanded ? 1 : 0, Motion.spring));
  }, [expanded, turn]);
  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.get() * 180}deg` }],
  }));

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
        hover="lift"
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

          <Animated.View style={chevron}>
            <Icon name="chevron-down" size={18} color="textTertiary" />
          </Animated.View>
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
        // `exiting` is what makes this an accordion rather than a toggle: the
        // parent's LinearTransition already animates the height change, so
        // without a matching exit the rows disappear on the first frame and
        // the card is left collapsing around nothing.
        <Animated.View
          entering={FadeIn.duration(Motion.base)}
          exiting={FadeOut.duration(Motion.fast)}
          style={styles.units}>
          {stage.units.map((unit, index) => (
            <UnitBlock
              key={unit.unit.id}
              unit={unit}
              index={index}
              isLast={index === stage.units.length - 1}
              onOpen={() => onOpenUnit(unit.unit.id)}
              onStartLesson={onStartLesson}
              onPractise={() => onPractiseUnit(unit.unit.id, unit.practice.suggested?.id)}
            />
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/**
 * How a unit's state reads at a glance.
 *
 * `locked` is a **soft** state now: the unit is dimmed and marked as ahead of
 * the path, and it still opens. Finishing a lesson inside it is how the learner
 * declares they meant to skip what came before, so presenting it as a refusal
 * would be a lie about what pressing it does.
 */
function unitChrome(state: UnitState, theme: ReturnType<typeof useTheme>) {
  switch (state) {
    case 'complete':
      return { label: 'Completed', tone: theme.success, icon: 'checkmark-circle' as IconName };
    case 'current':
      return { label: 'In progress', tone: theme.tint, icon: 'radio-button-on' as IconName };
    case 'available':
      return { label: 'Ready to start', tone: theme.tint, icon: 'play-circle' as IconName };
    case 'locked':
      return { label: 'Ahead', tone: theme.textTertiary, icon: 'arrow-forward-circle-outline' as IconName };
    case 'planned':
    default:
      return { label: 'Planned', tone: theme.textTertiary, icon: 'ellipsis-horizontal-circle-outline' as IconName };
  }
}

function UnitBlock({
  unit,
  index,
  isLast,
  onOpen,
  onStartLesson,
  onPractise,
}: {
  unit: UnitProgress;
  index: number;
  isLast: boolean;
  onOpen: () => void;
  onStartLesson: (lesson: Lesson) => void;
  onPractise: () => void;
}) {
  const theme = useTheme();
  const { state } = unit;
  const chrome = unitChrome(state, theme);
  const tone = theme[unit.unit.tone];
  const soft = theme[`${unit.unit.tone}Soft` as keyof typeof theme] as string;

  const active = state === 'current' || state === 'available';
  const dimmed = state === 'locked' || state === 'planned';
  const complete = state === 'complete';

  /**
   * Which units open their lesson list without being asked.
   *
   * The one being worked on, and nothing else. A completed unit's lessons are
   * still there and still replayable — the block expands on tap — but leaving
   * every finished unit open turns a six-stage course into an endless screen
   * and buries the one row that matters.
   */
  const [expanded, setExpanded] = useState(active);

  /**
   * The badge pops when the unit's state changes underneath it — in practice,
   * the moment a learner returns from the session that finished it. `usePop`
   * skips its first run, so a screen opening on an already-complete unit stays
   * still; only the transition is worth marking.
   */
  const statePop = usePop(state, { scale: 1.25 });

  const required = unit.unit.lessons.filter((lesson) => !lesson.optional);
  const extras = unit.unit.lessons.filter((lesson) => lesson.optional);

  return (
    <View style={styles.unitBlock}>
      <View
        style={[
          styles.unit,
          {
            backgroundColor: active ? soft : theme.backgroundElement,
            borderColor: active ? tone : complete ? theme.border : theme.border,
            borderWidth: active ? 1.5 : 1,
            opacity: dimmed ? 0.6 : 1,
          },
        ]}>
        {/* --- Unit header: where the unit begins ------------------------- */}
        <PressScale
          onPress={() => {
            if (state === 'planned') return;
            setExpanded((value) => !value);
          }}
          disabled={state === 'planned'}
          scaleTo={0.995}
          hover="lift"
          haptic="press"
          accessibilityLabel={`${unit.unit.title}, ${unitStateLabel(unit)}`}
          accessibilityState={{ selected: expanded }}>
          <View style={styles.unitHead}>
            <View
              style={[
                styles.unitIcon,
                {
                  backgroundColor: active ? theme.backgroundElement : theme.backgroundSunken,
                  borderColor: active ? tone : 'transparent',
                  borderWidth: active ? 1 : 0,
                },
              ]}>
              <Icon name={unit.unit.icon} size={18} tone={dimmed ? theme.textTertiary : tone} />
            </View>

            <View style={styles.flex}>
              <Text variant="bodyBold" numberOfLines={1}>
                {unit.unit.title}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {unit.unit.subtitle}
              </Text>
            </View>

            <Animated.View style={[styles.unitBadge, statePop]}>
              <Icon name={chrome.icon} size={15} tone={chrome.tone} />
              {/*
                Lessons, and only lessons. This figure used to come from the
                practice counter, which is what made a finished unit read as
                unfinished. Required lessons are the whole of what completing a
                unit means, so they are the whole of what this counts.
              */}
              {state !== 'planned' && unit.lessonCount > 0 ? (
                <Text variant="caption" numeric tone={chrome.tone}>
                  {unit.lessonsDone}/{unit.lessonCount}
                </Text>
              ) : null}
            </Animated.View>
          </View>
        </PressScale>

        {state !== 'planned' && unit.lessonCount > 0 ? (
          <ProgressBar
            value={unit.progress}
            height={4}
            tone={complete ? theme.success : tone}
          />
        ) : null}

        {/* --- The spine: every required lesson, on one rail -------------- */}
        {expanded && state !== 'planned' ? (
          <Animated.View
            entering={FadeIn.duration(Motion.base)}
            exiting={FadeOut.duration(Motion.fast)}
            style={styles.lessons}>
            {required.map((lesson, lessonIndex) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={lessonIndex}
                done={unit.completedLessonIds.includes(lesson.id)}
                isNext={unit.nextLesson?.id === lesson.id}
                tone={tone}
                /* The rail runs between nodes, so the last row has no tail. */
                connected={lessonIndex < required.length - 1 || extras.length > 0}
                onPress={() => onStartLesson(lesson)}
              />
            ))}

            {/*
              Enrichment, fenced off. Stories, listening and conversation
              lessons never gate a unit and are never auto-completed by a skip,
              so presenting them in the same list as the spine would be telling
              the learner they are required. The divider is the whole point.
            */}
            {extras.length > 0 ? (
              <>
                <View style={styles.extrasDivider}>
                  <View style={[styles.rule, { backgroundColor: theme.border }]} />
                  <Text variant="caption" color="textTertiary">
                    Extra — optional
                  </Text>
                  <View style={[styles.rule, { backgroundColor: theme.border }]} />
                </View>
                {extras.map((lesson, extraIndex) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={required.length + extraIndex}
                    done={unit.completedLessonIds.includes(lesson.id)}
                    isNext={false}
                    optional
                    tone={tone}
                    connected={extraIndex < extras.length - 1}
                    onPress={() => onStartLesson(lesson)}
                  />
                ))}
              </>
            ) : null}
          </Animated.View>
        ) : null}

        {/* --- The cap: where the unit ends ------------------------------- */}
        {state !== 'planned' ? (
          <View
            style={[
              styles.cap,
              {
                backgroundColor: complete ? theme.successSoft : theme.backgroundSunken,
                borderColor: complete ? theme.success : theme.border,
              },
            ]}>
            <Icon
              name={complete ? 'flag' : 'flag-outline'}
              size={13}
              tone={complete ? theme.success : theme.textTertiary}
            />
            <Text
              variant="caption"
              tone={complete ? theme.successText : theme.textTertiary}
              numberOfLines={1}
              style={styles.flex}>
              {complete
                ? `${unit.unit.title} complete`
                : `Finish ${unit.lessonCount - unit.lessonsDone} lesson${
                    unit.lessonCount - unit.lessonsDone === 1 ? '' : 's'
                  } to complete`}
            </Text>
          </View>
        ) : null}

        {/*
          Practice — a sibling of the header's PressScale, never a child of it.
          Nesting pressables emits nested <button> elements, invalid HTML and a
          hydration error on web.

          It sits *below the cap* deliberately. The unit is already finished by
          the time this appears; nothing here can change that, and its counter
          is its own. This is the "revision/mastery" half of the model and it is
          drawn outside the spine so it can never be mistaken for one.
        */}
        {complete && unit.practice.unlocked ? (
          <PressScale
            onPress={onPractise}
            scaleTo={0.98}
            hover="lift"
            haptic="press"
            accessibilityLabel={`Practise ${unit.unit.title}, ${Math.round(unit.mastery * 100)} percent mastery`}>
            <View
              style={[
                styles.practice,
                { backgroundColor: unit.needsReview ? theme.warningSoft : theme.backgroundSunken },
              ]}>
              <Icon
                name={unit.needsReview ? 'refresh-outline' : 'barbell-outline'}
                size={13}
                tone={unit.needsReview ? theme.warning : theme.textSecondary}
              />
              <Text
                variant="caption"
                tone={unit.needsReview ? theme.warning : theme.textSecondary}
                style={styles.flex}
                numberOfLines={1}>
                {unit.needsReview
                  ? `Review recommended — ${Math.round(unit.mastery * 100)}% mastery`
                  : `Practice — ${Math.round(unit.mastery * 100)}% mastery`}
                {unit.practice.total > 0
                  ? ` · ${unit.practice.done}/${unit.practice.total} sessions`
                  : ''}
              </Text>
              <Icon
                name="chevron-forward"
                size={13}
                tone={unit.needsReview ? theme.warning : theme.textTertiary}
              />
            </View>
          </PressScale>
        ) : null}

        {state === 'locked' ? (
          <Text variant="caption" color="textTertiary" numberOfLines={2}>
            Ahead of your path — you can still open it. Finishing a lesson here marks
            the units before it complete.
          </Text>
        ) : null}

        {state === 'planned' ? (
          <Text variant="caption" color="textTertiary" numberOfLines={2}>
            {unit.unit.topics.join(' · ')}
          </Text>
        ) : null}

        {/* Full unit detail — the study sheet — is one tap away, always. */}
        {state !== 'planned' ? (
          <PressScale
            onPress={onOpen}
            scaleTo={0.98}
            haptic="tap"
            accessibilityLabel={`Open ${unit.unit.title}`}>
            <View style={styles.openRow}>
              <Text variant="caption" tone={theme.textSecondary}>
                {complete ? 'What I learned here' : 'Unit details'}
              </Text>
              <Icon name="chevron-forward" size={13} color="textTertiary" />
            </View>
          </PressScale>
        ) : null}
      </View>

      {/*
        The hand-over to the next unit. A short connector rather than a plain
        gap: the gap alone says "these are two cards", and this says "and you
        pass from the first to the second", which is the thing a path has to
        communicate.
      */}
      {!isLast ? (
        <View style={styles.handover}>
          <View
            style={[
              styles.handoverLine,
              { backgroundColor: complete ? theme.success : theme.border },
            ]}
          />
          <Icon
            name="chevron-down"
            size={12}
            tone={complete ? theme.success : theme.textTertiary}
          />
          <View
            style={[
              styles.handoverLine,
              { backgroundColor: complete ? theme.success : theme.border },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

function LessonRow({
  lesson,
  index,
  done,
  isNext,
  optional,
  tone,
  connected,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  done: boolean;
  isNext: boolean;
  optional?: boolean;
  tone: string;
  connected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  const nodeTone = done ? theme.success : isNext ? tone : theme.borderStrong;

  return (
    <Animated.View
      // Keyed on the lesson's position in its own unit, not on the unit's
      // position in the stage — offsetting by the unit index means the seventh
      // unit's lessons start arriving a third of a second late for no reason
      // the learner can see.
      entering={FadeIn.duration(Motion.base).delay(stagger(index))}
      style={styles.lessonRow}>
      {/* The rail. This is what makes the lessons read as belonging to the
          unit above them rather than as a loose list underneath it. */}
      <View style={styles.rail}>
        <View
          style={[
            styles.node,
            {
              backgroundColor: done ? theme.success : isNext ? tone : theme.backgroundElement,
              borderColor: nodeTone,
              borderStyle: optional ? 'dashed' : 'solid',
            },
          ]}>
          {done ? <Icon name="checkmark" size={9} tone={theme.onTint} /> : null}
        </View>
        {connected ? (
          <View style={[styles.railLine, { backgroundColor: done ? theme.success : theme.border }]} />
        ) : null}
      </View>

      <PressScale
        onPress={onPress}
        scaleTo={0.98}
        haptic="press"
        style={styles.flex}
        accessibilityLabel={`${lesson.title}. ${lesson.goal}`}>
        <View
          style={[
            styles.lesson,
            {
              backgroundColor: isNext ? theme.backgroundElement : 'transparent',
              borderColor: isNext ? tone : theme.border,
              borderWidth: isNext ? 1.5 : 1,
            },
          ]}>
          <Text
            variant={isNext ? 'smallBold' : 'small'}
            color={done ? 'textSecondary' : 'text'}
            numberOfLines={1}
            style={styles.flex}>
            {lesson.title}
          </Text>
          <Text variant="caption" tone={isNext ? tone : theme.textTertiary}>
            {lesson.estMinutes} min
          </Text>
        </View>
      </PressScale>
    </Animated.View>
  );
}

function unitStateLabel(unit: UnitProgress): string {
  switch (unit.state) {
    case 'complete':
      return `completed, ${Math.round(unit.mastery * 100)} percent mastery`;
    case 'current':
      return `in progress, ${unit.lessonsDone} of ${unit.lessonCount} lessons`;
    case 'available':
      return 'ready to start';
    case 'locked':
      return 'ahead of your path, still openable';
    default:
      return 'planned';
  }
}

const NODE = 18;

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
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
  units: { paddingTop: Spacing.two },

  unitBlock: { gap: 0 },
  unit: {
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  unitHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  unitIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },

  lessons: { paddingTop: Spacing.one },
  lessonRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'stretch' },
  rail: { width: NODE, alignItems: 'center', paddingTop: Spacing.two },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railLine: { width: 2, flex: 1, minHeight: 10 },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    marginBottom: Spacing.two,
  },
  extrasDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingLeft: NODE + Spacing.two,
  },
  rule: { height: 1, flex: 1 },

  cap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  practice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },

  handover: { alignItems: 'center', paddingVertical: Spacing.one },
  handoverLine: { width: 2, height: 8 },
});
