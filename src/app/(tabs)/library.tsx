import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Icon } from '@/components/ui/icon';
import { EmptyState, Section } from '@/components/ui/layout';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import {
  getConcept,
  getGrammar,
  getVerb,
  grammarConcepts,
  teachingOrder,
  verbTeachingOrder,
  verbs,
  vocabConcepts,
} from '@/content';
import type { CefrLevel } from '@/content/types';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { useNow } from '@/hooks/use-now';
import {
  countMet,
  currentStageId,
  groupByCourse,
  passesFilter,
  sortForGrouping,
  type LibraryFilter,
  type LibraryGrouping,
  type LibraryStageGroup,
} from '@/learning/library';
import { mastery, masteryBand, type MasteryBand } from '@/learning/srs';

type Tab = 'words' | 'grammar' | 'verbs';

/**
 * The Library — the learner's own dictionary, annotated with how well they
 * actually know each entry.
 *
 * At 652 words, 100-odd verbs and every grammar rule in the course, a flat list
 * stopped being browsable. The organising principle that fixes it is **where
 * you met it**: section, then unit, in teaching order. That is how the material
 * is actually remembered, and it is the axis that connects a Library entry back
 * to the lesson it came from.
 *
 * Grouping and filtering are separate controls on purpose. "Show me only what I
 * have learned" and "arrange it by where I learned it" are different questions,
 * and folding them into one row of chips is what makes a filter bar grow to
 * fourteen options that each mean something slightly different.
 *
 * Search is unchanged and still lives at `/search`.
 */
export default function LibraryScreen() {
  const theme = useTheme();
  const { learner } = useLearner();
  const [tab, setTab] = useState<Tab>('words');
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [grouping, setGrouping] = useState<LibraryGrouping>('course');
  const now = useNow();

  /** The ids in the active tab, filtered but not yet ordered or grouped. */
  const ids = useMemo(() => {
    if (tab === 'grammar') {
      return grammarConcepts
        .filter((concept) =>
          passesFilter(filter, {
            id: concept.id,
            state: learner.concepts[concept.id],
            learner,
            now,
          }),
        )
        .map((concept) => concept.id);
    }
    if (tab === 'verbs') {
      /**
       * A verb is known through its paradigms, not through a concept of its
       * own, so its filter state is the best of them. Asking about a
       * non-existent `v.<verb>` state would report every verb as unmet.
       */
      return verbs
        .filter((verb) => {
          const related = [
            ...Object.keys(verb.tenses).map((tense) => `f.${verb.id}.${tense}`),
            ...vocabConcepts.filter((c) => c.verbId === verb.id).map((c) => c.id),
          ];
          return related.some((id) =>
            passesFilter(filter, { id, state: learner.concepts[id], learner, now }),
          );
        })
        .map((verb) => verb.id);
    }
    return vocabConcepts
      .filter((concept) =>
        passesFilter(filter, {
          id: concept.id,
          state: learner.concepts[concept.id],
          learner,
          now,
          isExpression: concept.kind === 'phrase' || concept.pos === 'expression',
          spainOnly: concept.spainOnly,
        }),
      )
      .map((concept) => concept.id);
  }, [tab, filter, learner, now]);

  const label = useMemo(
    () => (id: string) => {
      if (tab === 'verbs') return getVerb(id)?.infinitive ?? id;
      if (tab === 'grammar') return getGrammar(id)?.title ?? id;
      const concept = getConcept(id);
      return concept && 'es' in concept ? concept.es : id;
    },
    [tab],
  );

  const levelOf = useMemo(
    () => (id: string): CefrLevel =>
      (tab === 'verbs' ? getVerb(id)?.level : getConcept(id)?.level) ?? 'A1',
    [tab],
  );

  const ordered = useMemo(
    () =>
      sortForGrouping(ids, grouping, {
        learner,
        now,
        label,
        order: (id) => (tab === 'verbs' ? verbTeachingOrder(id) : teachingOrder(id)),
        level: levelOf,
      }),
    [ids, grouping, learner, now, label, levelOf, tab],
  );

  const grouped = useMemo(
    () => (grouping === 'course' ? countMet(groupByCourse(ordered, tab === 'verbs'), learner) : null),
    [grouping, ordered, tab, learner],
  );

  const openStage = currentStageId(grouped?.stages ?? []);
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({});
  const isStageOpen = (stageId: string) => openStages[stageId] ?? stageId === openStage;

  const counts = useMemo(() => {
    const result = { new: 0, learning: 0, familiar: 0, strong: 0, mastered: 0 };
    for (const concept of vocabConcepts) result[masteryBand(learner.concepts[concept.id], now)] += 1;
    return result;
  }, [learner.concepts, now]);

  const learnedCount = useMemo(
    () => vocabConcepts.filter((c) => (learner.concepts[c.id]?.timesSeen ?? 0) > 0).length,
    [learner.concepts],
  );

  const renderRow = (id: string) => {
    if (tab === 'grammar') return <GrammarRow key={id} id={id} now={now} />;
    if (tab === 'verbs') return <VerbRow key={id} id={id} />;
    return <WordRow key={id} id={id} now={now} />;
  };

  return (
    <Screen
      title="Library"
      subtitle="Everything you have met, and how well you know it"
      headerRight={
        <PressScale onPress={() => router.push('/search')} scaleTo={0.9} accessibilityLabel="Search">
          <View
            style={[
              styles.iconButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <Icon name="search" size={18} />
          </View>
        </PressScale>
      }>
      <Segmented
        options={[
          { value: 'words', label: 'Words' },
          { value: 'grammar', label: 'Grammar' },
          { value: 'verbs', label: 'Verbs' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* What to show */}
      <Segmented
        scrollable
        options={[
          { value: 'all', label: 'All', count: ids.length && filter === 'all' ? ids.length : undefined },
          { value: 'learned', label: 'Learned', count: tab === 'words' ? learnedCount : undefined },
          { value: 'recent', label: 'Recent' },
          { value: 'unmet', label: 'Not yet met' },
          ...(tab === 'words'
            ? ([
                { value: 'learning', label: 'Learning', count: counts.learning },
                { value: 'familiar', label: 'Familiar', count: counts.familiar },
                { value: 'strong', label: 'Strong', count: counts.strong },
                { value: 'mastered', label: 'Mastered', count: counts.mastered },
                { value: 'favourites', label: '★ Favourites', count: learner.favourites.length },
                { value: 'expressions', label: 'Expressions' },
                { value: 'spain', label: '🇪🇸 Spain only' },
              ] as const)
            : []),
        ]}
        value={filter}
        onChange={setFilter}
      />

      {/*
        How to arrange it. A separate control from the filter above, because
        "which entries?" and "in what order?" are different questions — merging
        them is how a filter bar ends up with fourteen chips that each mean
        something subtly different.
      */}
      <View style={styles.groupRow}>
        <Text variant="caption" color="textTertiary">
          Group by
        </Text>
        <View style={styles.groupChips}>
          {(
            [
              { value: 'course', label: 'Section' },
              { value: 'progress', label: 'Progress' },
              { value: 'alphabetical', label: 'A–Z' },
            ] as const
          ).map((option) => {
            const active = grouping === option.value;
            return (
              <PressScale
                key={option.value}
                onPress={() => setGrouping(option.value)}
                scaleTo={0.95}
                haptic="tap"
                accessibilityLabel={`Group by ${option.label}`}
                accessibilityState={{ selected: active }}>
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? theme.tintSoft : theme.backgroundElement,
                      borderColor: active ? theme.tint : theme.border,
                    },
                  ]}>
                  <Text variant="caption" tone={active ? theme.tintText : theme.textSecondary}>
                    {option.label}
                  </Text>
                </View>
              </PressScale>
            );
          })}
        </View>
      </View>

      {ordered.length === 0 ? (
        <EmptyState
          icon="albums-outline"
          title="Nothing here yet"
          message="Entries appear as the course reaches them. Try a different filter, or finish a lesson."
          tone={theme.tint}
        />
      ) : grouped ? (
        /*
          Grouped by where it was taught. Sections collapse, and the one the
          learner is working in opens by default — a Library that opens fully
          collapsed makes them hunt for their own position every time, and one
          that opens fully expanded is the flat list this grouping replaces.
        */
        <View style={styles.groups}>
          {grouped.stages.map((stage) => (
            <StageGroup
              key={stage.stage.id}
              group={stage}
              expanded={isStageOpen(stage.stage.id)}
              onToggle={() =>
                setOpenStages((value) => ({
                  ...value,
                  [stage.stage.id]: !isStageOpen(stage.stage.id),
                }))
              }
              renderRow={renderRow}
            />
          ))}
          {grouped.ungrouped.length > 0 ? (
            <Section
              title="Not taught by any lesson"
              caption="Reachable in the Library, but no lesson introduces these yet">
              <View style={styles.list}>{grouped.ungrouped.map(renderRow)}</View>
            </Section>
          ) : null}
        </View>
      ) : (
        /* One fade per view change, not one per row. The Library runs to
           hundreds of entries, and a stagger down a list that long stops being
           a rhythm and becomes a wait. */
        <Reveal>
          <View style={styles.list}>{ordered.map(renderRow)}</View>
        </Reveal>
      )}
    </Screen>
  );
}

function StageGroup({
  group,
  expanded,
  onToggle,
  renderRow,
}: {
  group: LibraryStageGroup;
  expanded: boolean;
  onToggle: () => void;
  renderRow: (id: string) => React.ReactNode;
}) {
  const theme = useTheme();
  const complete = group.met === group.total;

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={[
        styles.stage,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <PressScale
        onPress={onToggle}
        scaleTo={0.995}
        hover="lift"
        haptic="tap"
        accessibilityLabel={`${group.stage.title}, ${group.met} of ${group.total} met`}
        accessibilityState={{ selected: expanded }}>
        <View style={styles.stageHead}>
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color="textTertiary"
          />
          <View style={styles.flex}>
            <Text variant="smallBold" numberOfLines={1}>
              {group.stage.title}
            </Text>
            <Text variant="caption" color="textTertiary" numeric>
              {group.stage.levelRange} · {group.met}/{group.total} met
            </Text>
          </View>
          {complete ? <Icon name="checkmark-circle" size={16} tone={theme.success} /> : null}
        </View>
      </PressScale>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(Motion.base)}
          exiting={FadeOut.duration(Motion.fast)}
          style={styles.units}>
          {group.units.map((unit) => (
            <View key={unit.unit.id} style={styles.unit}>
              <View style={styles.unitHead}>
                <Icon name={unit.unit.icon} size={14} tone={theme[unit.unit.tone]} />
                <Text variant="caption" color="textSecondary" numberOfLines={1} style={styles.flex}>
                  {unit.unit.title}
                </Text>
                <Text variant="caption" color="textTertiary" numeric>
                  {unit.met}/{unit.ids.length}
                </Text>
              </View>
              <View style={styles.list}>{unit.ids.map(renderRow)}</View>
            </View>
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function WordRow({ id, now }: { id: string; now: number }) {
  const theme = useTheme();
  const { learner } = useLearner();
  const concept = getConcept(id);
  if (!concept || !('es' in concept)) return null;

  const state = learner.concepts[id];
  const band = masteryBand(state, now);
  const value = state ? mastery(state, now) : 0;

  return (
    // The speaker sits beside the row rather than inside it — nesting a button
    // in a button is invalid HTML on web.
    <View
      style={[styles.wordRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <PressScale
        onPress={() => router.push({ pathname: '/word/[id]', params: { id } })}
        scaleTo={0.985}
        hover="lift"
        style={styles.flex}
        accessibilityLabel={`${concept.es}, ${concept.en}`}>
        <View style={styles.wordMain}>
          <View style={[styles.bandDot, { backgroundColor: bandColor(band, theme) }]} />
          <View style={styles.flex}>
            <View style={styles.wordTop}>
              <Text variant="bodyBold" numberOfLines={1} style={styles.flex}>
                {concept.es}
              </Text>
              {concept.spainOnly ? <Text variant="caption">🇪🇸</Text> : null}
              {learner.favourites.includes(id) ? (
                <Icon name="star" size={13} tone={theme.accent} />
              ) : null}
            </View>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {concept.en}
            </Text>
          </View>
          <Text variant="caption" tone={bandColor(band, theme)}>
            {state && state.timesSeen > 0 ? `${Math.round(value * 100)}%` : state ? 'met' : 'new'}
          </Text>
        </View>
      </PressScale>
      <SpeakIcon text={concept.es.split('/')[0].trim()} />
    </View>
  );
}

function GrammarRow({ id, now }: { id: string; now: number }) {
  const theme = useTheme();
  const { learner } = useLearner();
  const concept = getGrammar(id);
  if (!concept) return null;

  const state = learner.concepts[id];
  const value = state ? mastery(state, now) : 0;

  return (
    <PressScale
      onPress={() => router.push({ pathname: '/grammar/[id]', params: { id } })}
      scaleTo={0.99}
      hover="lift"
      accessibilityLabel={concept.title}>
      <View
        style={[
          styles.wordRow,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <View style={styles.flex}>
          <Text variant="bodyBold">{concept.title}</Text>
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {concept.short}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <Pill label={concept.level} tone={theme.grammar} background={theme.grammarSoft} />
          {state && state.timesSeen > 0 ? (
            <Text variant="caption" color="textTertiary">
              {Math.round(value * 100)}%
            </Text>
          ) : null}
        </View>
      </View>
    </PressScale>
  );
}

function VerbRow({ id }: { id: string }) {
  const theme = useTheme();
  const verb = getVerb(id);
  if (!verb) return null;

  return (
    <PressScale
      onPress={() => router.push({ pathname: '/verb/[id]', params: { id } })}
      scaleTo={0.99}
      hover="lift"
      accessibilityLabel={`${verb.infinitive}, ${verb.en}`}>
      <View
        style={[
          styles.wordRow,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <View style={styles.flex}>
          <View style={styles.wordTop}>
            <Text variant="bodyBold">{verb.infinitive}</Text>
            {verb.irregular ? (
              <Pill label="irregular" tone={theme.warning} background={theme.warningSoft} />
            ) : null}
          </View>
          <Text variant="caption" color="textSecondary">
            {verb.en}
          </Text>
        </View>
        <Pill label={verb.level} />
        <Icon name="chevron-forward" size={16} color="textTertiary" />
      </View>
    </PressScale>
  );
}

function bandColor(band: MasteryBand, theme: ReturnType<typeof useTheme>): string {
  switch (band) {
    case 'new':
      return theme.textTertiary;
    case 'learning':
      return theme.listening;
    case 'familiar':
      return theme.warning;
    case 'strong':
      return theme.accent;
    case 'mastered':
      return theme.success;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  list: { gap: Spacing.two },
  rightCol: { alignItems: 'flex-end', gap: 2 },

  groupRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  groupChips: { flexDirection: 'row', gap: Spacing.two, flex: 1, minWidth: 0 },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },

  groups: { gap: Spacing.three },
  stage: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  units: { gap: Spacing.three, paddingTop: Spacing.one },
  unit: { gap: Spacing.two },
  unitHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },

  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  wordMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  wordTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  bandDot: { width: 6, height: 32, borderRadius: Radius.full },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
