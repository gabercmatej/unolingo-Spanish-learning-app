import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { stagger } from '@/components/ui/motion';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DailyRecord } from '@/learning/types';
import { addDays, toISODate } from '@/lib/date';

/**
 * Progress charts.
 *
 * The rule for both: every mark must carry information. A grid of squares with
 * "Less → More" underneath tells you nothing about *when* you studied, and bare
 * bars tell you nothing about whether a week was good or bad. So the calendar
 * gets month and weekday anchors, and the XP chart gets an average line to
 * compare each week against.
 */

const WEEKS = 17; // ~4 months
const GAP = 3;
/** Width of the M/W/F/S gutter down the left. */
const WEEKDAY_COL = 22;
/** Cell size is derived from the available width; these bound it. */
const MIN_CELL = 8;
const MAX_CELL = 16;

/**
 * The XP value sitting above each bar, and the space the plot gives up for it.
 *
 * Stated here as one number because two places have to agree: the style that
 * draws the label and the arithmetic that decides how tall a bar may be. When
 * they disagreed — the bars scaled to the whole chart box, the label stacked on
 * top of them — the peak week's number was pushed clean out of the chart and
 * onto the caption above it.
 */
const VALUE_TEXT = 12;
const VALUE_GAP = 2;
const VALUE_ROW = VALUE_TEXT + VALUE_GAP;

interface CalendarProps {
  daily: DailyRecord[];
}

export function ActivityCalendar({ daily }: CalendarProps) {
  const theme = useTheme();

  /**
   * Measured rather than assumed.
   *
   * The grid used to be 17 columns of a fixed 13px, which is a hard 269px plus
   * the gutter — a number that happened to fit the phone it was written on and
   * had no reason to fit any other. Deriving the cell from the width the card
   * actually gives it means the calendar fills its card on a large phone and
   * stays inside it on a small one, instead of being right by coincidence.
   */
  const [width, setWidth] = useState(0);

  const cell = useMemo(() => {
    if (width <= 0) return 13;
    const available = width - WEEKDAY_COL - GAP - (WEEKS - 1) * GAP;
    return Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(available / WEEKS)));
  }, [width]);

  const { weeks, monthLabels, activeDays, best, today } = useMemo(() => {
    const lookup = new Map(daily.map((entry) => [entry.date, entry.xp]));
    const now = toISODate();

    // Start on the Monday of the earliest week so columns are true weeks.
    const todayDate = new Date(now);
    const isoWeekday = (todayDate.getDay() + 6) % 7; // 0 = Monday
    const lastMonday = addDays(now, -isoWeekday);

    const columns: { date: string; xp: number }[][] = [];
    const labels: { index: number; label: string }[] = [];
    let seenMonth = '';

    for (let week = WEEKS - 1; week >= 0; week -= 1) {
      const monday = addDays(lastMonday, -week * 7);
      const column: { date: string; xp: number }[] = [];
      for (let day = 0; day < 7; day += 1) {
        const date = addDays(monday, day);
        column.push({ date, xp: date <= now ? (lookup.get(date) ?? 0) : -1 });
      }
      const month = monday.slice(0, 7);
      if (month !== seenMonth) {
        seenMonth = month;
        const [, monthPart] = monday.split('-');
        labels.push({
          index: WEEKS - 1 - week,
          label: MONTHS[Number(monthPart) - 1],
        });
      }
      columns.push(column);
    }

    const values = [...lookup.values()];
    return {
      weeks: columns,
      monthLabels: labels,
      activeDays: values.filter((xp) => xp > 0).length,
      best: Math.max(1, ...values),
      today: now,
    };
  }, [daily]);

  /** Five steps, relative to the learner's own best day. */
  const cellColor = (xp: number) => {
    if (xp < 0) return 'transparent';
    if (xp === 0) return theme.backgroundSunken;
    const ratio = xp / best;
    if (ratio > 0.66) return theme.tint;
    if (ratio > 0.33) return mix(theme.tint, theme.backgroundSunken, 0.7);
    if (ratio > 0.12) return mix(theme.tint, theme.backgroundSunken, 0.45);
    return mix(theme.tint, theme.backgroundSunken, 0.25);
  };

  const step = cell + GAP;
  /**
   * A month label sitting over the last column or two would run off the right
   * edge, so the ones that cannot fit their own text are dropped rather than
   * clipped. Three characters at caption size is about 22px.
   */
  const visibleMonths = monthLabels.filter(
    (entry) => width === 0 || WEEKDAY_COL + GAP + entry.index * step + 24 <= width,
  );

  return (
    <View
      style={styles.calendarBlock}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.monthRow}>
        {visibleMonths.map((entry) => (
          <Text
            key={`${entry.label}-${entry.index}`}
            variant="caption"
            color="textTertiary"
            style={[styles.monthLabel, { left: WEEKDAY_COL + GAP + entry.index * step }]}>
            {entry.label}
          </Text>
        ))}
      </View>

      <View style={styles.calendarRow}>
        <View style={[styles.weekdayColumn, { width: WEEKDAY_COL }]}>
          {['M', '', 'W', '', 'F', '', 'S'].map((label, index) => (
            <View key={index} style={[styles.weekdayCell, { height: cell }]}>
              <Text variant="caption" color="textTertiary">
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekColumn}>
              {week.map((day) => (
                <View
                  key={day.date}
                  accessibilityLabel={day.xp > 0 ? `${day.date}: ${day.xp} XP` : undefined}
                  style={[
                    styles.cell,
                    { width: cell, height: cell, backgroundColor: cellColor(day.xp) },
                    /**
                     * Today gets a ring. Without it the grid is four months of
                     * undifferentiated squares and the eye has nowhere to
                     * start — the most useful cell on the chart is the one
                     * saying whether you have studied yet, and it looked
                     * exactly like the other 118.
                     */
                    day.date === today && {
                      borderWidth: 1.5,
                      borderColor: day.xp > 0 ? theme.tintText : theme.borderStrong,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <Text variant="caption" color="textSecondary">
        {activeDays} active {activeDays === 1 ? 'day' : 'days'} · best day {best} XP
      </Text>
    </View>
  );
}

interface XpChartProps {
  daily: DailyRecord[];
  /** Weeks back from the current one. 0 is this week. */
  weeksAgo?: number;
}

/** Monday-first, because the week the learner lives in starts on Monday. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * XP earned on each day of one week, Monday to Sunday.
 *
 * This used to plot rolling seven-day totals — "now", "1w", "2w" — which
 * answers "am I studying more than I was?" and cannot answer "which days do I
 * actually show up?". Consistency within a week is the thing worth seeing, and
 * a bucket boundary that moves with the current date makes it invisible: the
 * same Tuesday sits in a different bar depending on when you look.
 *
 * Days with no XP are drawn rather than dropped. A gap in a week is the most
 * informative mark on this chart, and a missing bar reads as missing data.
 *
 * Reuses `learner.daily`, which already stores `{date, xp, seconds, exercises}`
 * per local ISO day — no new tracking, and the same source the calendar above
 * it reads, so the two can never disagree.
 */
export function XpChart({ daily, weeksAgo = 0 }: XpChartProps) {
  const theme = useTheme();

  const { bars, weekLabel, total, activeDays } = useMemo(() => {
    const lookup = new Map(daily.map((entry) => [entry.date, entry.xp]));
    const today = toISODate();

    // Monday of the week being shown. `getDay()` is Sunday-first, so shift it.
    const todayDate = new Date(today);
    const isoWeekday = (todayDate.getDay() + 6) % 7;
    const monday = addDays(today, -isoWeekday - weeksAgo * 7);

    const rows = WEEKDAYS.map((label, index) => {
      const date = addDays(monday, index);
      return {
        label,
        date,
        // A future day is not a zero — it has not happened. Distinguished so
        // the rest of this week does not read as six days of failure.
        future: date > today,
        isToday: date === today,
        xp: lookup.get(date) ?? 0,
      };
    });

    const sunday = addDays(monday, 6);
    return {
      bars: rows,
      weekLabel:
        weeksAgo === 0
          ? 'This week'
          : `${monday.slice(8)}–${sunday.slice(8)} ${MONTHS[Number(sunday.slice(5, 7)) - 1]}`,
      total: rows.reduce((sum, row) => sum + row.xp, 0),
      activeDays: rows.filter((row) => row.xp > 0).length,
    };
  }, [daily, weeksAgo]);

  const max = Math.max(1, ...bars.map((bar) => bar.xp));

  /**
   * The chart's box, and the part of it a bar may actually occupy.
   *
   * Each column stacks its XP value *above* its bar, so a bar drawn to the full
   * box height pushes that label out of the top of the chart — and since
   * nothing here clips, the peak day's number lands on the caption above it.
   * Reserving the row up front is better than clipping it: the number is the
   * most useful thing in the column.
   */
  const CHART_HEIGHT = 108;
  const PLOT_HEIGHT = CHART_HEIGHT - VALUE_ROW;

  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartHead}>
        <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.shrink}>
          {weekLabel} · {total} XP
        </Text>
        <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.shrink}>
          {activeDays} of 7 days
        </Text>
      </View>

      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        <View style={styles.bars}>
          {bars.map((bar, index) => (
            <Bar
              key={bar.date}
              label={bar.label}
              xp={bar.xp}
              future={bar.future}
              /*
                A zero day still draws its baseline tick. Drawing nothing would
                make an empty Wednesday indistinguishable from the chart ending
                there, and "which days did I miss?" is the question this chart
                exists to answer.
              */
              height={bar.xp > 0 ? Math.max(4, (bar.xp / max) * PLOT_HEIGHT) : 2}
              index={index}
              tone={
                bar.future
                  ? 'transparent'
                  : bar.xp === 0
                    ? theme.border
                    : bar.isToday
                      ? theme.tint
                      : mix(theme.tint, theme.backgroundSunken, 0.55)
              }
            />
          ))}
        </View>
      </View>

      {/*
        Its own style, not `styles.bars`. That one carries `height: '100%'` so
        the columns inside the plot fill it — a percentage that resolves against
        nothing out here, because this row's parent has no fixed height.
      */}
      <View style={styles.labelRow}>
        {bars.map((bar) => (
          <View key={bar.date} style={styles.barColumn}>
            <Text
              variant="caption"
              numberOfLines={1}
              tone={
                bar.isToday
                  ? theme.tint
                  : bar.future
                    ? theme.border
                    : bar.xp > 0
                      ? theme.textSecondary
                      : theme.textTertiary
              }>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * One day's column.
 *
 * Bars grow from the baseline, Monday to Sunday. That is not decoration: the
 * axis *is* time, so drawing it in the direction time runs makes the shape of
 * the week legible in a way a chart that simply exists does not. Seven bars at
 * one stagger step is over in under half a second, short enough that it never
 * delays reading the number.
 *
 * The calendar above it is deliberately left static — 119 cells is where a
 * per-element animation stops being a flourish and starts being a frame budget.
 */
function Bar({
  label,
  xp,
  height,
  index,
  tone,
  future,
}: {
  label: string;
  xp: number;
  height: number;
  index: number;
  tone: string;
  future?: boolean;
}) {
  const grown = useSharedValue(0);

  useEffect(() => {
    grown.set(withDelay(stagger(index), withSpring(height, Motion.springSoft)));
  }, [grown, height, index]);

  const style = useAnimatedStyle(() => ({ height: grown.get() }));

  return (
    <View style={styles.barColumn}>
      {xp > 0 ? (
        <Text
          variant="caption"
          color="textTertiary"
          style={styles.barValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {xp}
        </Text>
      ) : (
        // Holds the column's height so a zero day lines up with the others
        // instead of floating its bar upward.
        <View style={styles.barValueSpacer} />
      )}
      <Animated.View
        accessibilityLabel={
          future ? `${label}: still to come` : `${label}: ${xp} XP`
        }
        style={[styles.bar, { backgroundColor: tone }, style]}
      />
    </View>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Blends two hex colours. React Native has no `color-mix`, and stacking
 * transparency over a themed surface produces the wrong result in dark mode.
 */
function mix(a: string, b: string, weight: number): string {
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map((c) => c + c)
            .join('')
        : clean;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  };
  try {
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(b);
    const channel = (x: number, y: number) => Math.round(x * weight + y * (1 - weight));
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(channel(r1, r2))}${hex(channel(g1, g2))}${hex(channel(b1, b2))}`;
  } catch {
    return a;
  }
}

const styles = StyleSheet.create({
  calendarBlock: { gap: Spacing.two },
  monthRow: { height: 14 },
  monthLabel: { position: 'absolute', top: 0 },
  calendarRow: { flexDirection: 'row', gap: GAP },
  weekdayColumn: { gap: GAP },
  weekdayCell: { justifyContent: 'center' },
  grid: { flexDirection: 'row', gap: GAP, flex: 1, minWidth: 0 },
  weekColumn: { gap: GAP },
  cell: { borderRadius: 3 },

  chartBlock: { gap: Spacing.two },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  chartArea: { justifyContent: 'flex-end' },
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, height: '100%' },
  labelRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  /**
   * `minWidth: 0` is what keeps a big weekly total inside the card.
   *
   * A flex child in React Native still sizes to its content unless told not to,
   * so a four-figure XP number widened its own column past its flex share and
   * pushed the whole row off the right edge of the screen. Everywhere else in
   * this app that lays text beside a flexible element already carries this; the
   * chart columns were the one place that did not.
   */
  barColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: VALUE_GAP,
  },
  /**
   * Pinned rather than left to the font.
   *
   * `PLOT_HEIGHT` subtracts exactly `VALUE_ROW` to make room for this label, so
   * the label has to actually be that tall. Left to `variant="caption"`'s own
   * line height it is a different number on every platform — and on the one
   * where it is tallest, the reserved gap is too small and the overflow comes
   * straight back.
   */
  barValue: { fontSize: 9, lineHeight: VALUE_TEXT, height: VALUE_TEXT },
  barValueSpacer: { height: VALUE_TEXT },
  shrink: { flexShrink: 1 },
  bar: { width: '100%', borderRadius: Radius.xs, maxWidth: 34 },
});
