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
  weeks?: number;
}

export function XpChart({ daily, weeks = 8 }: XpChartProps) {
  const theme = useTheme();

  const data = useMemo(() => {
    const lookup = new Map(daily.map((entry) => [entry.date, entry.xp]));
    const today = toISODate();
    const bars: { label: string; xp: number }[] = [];

    for (let week = weeks - 1; week >= 0; week -= 1) {
      let xp = 0;
      for (let day = 0; day < 7; day += 1) {
        xp += lookup.get(addDays(today, -(week * 7 + day))) ?? 0;
      }
      bars.push({ label: week === 0 ? 'now' : `${week}w`, xp });
    }
    return bars;
  }, [daily, weeks]);

  const max = Math.max(1, ...data.map((bar) => bar.xp));
  const total = data.reduce((sum, bar) => sum + bar.xp, 0);
  const active = data.filter((bar) => bar.xp > 0).length;
  const average = active > 0 ? total / active : 0;
  const averageRatio = max > 0 ? average / max : 0;

  /**
   * The chart's box, and the part of it a bar may actually occupy.
   *
   * Each column stacks its XP value *above* its bar, so a bar drawn to the full
   * box height pushes that label out of the top of the chart — and since
   * nothing here clips, the peak week's number landed on top of the "Peak N XP"
   * caption in the header. The taller the best week, the worse it looked, which
   * is why it read as a bug that came and went.
   *
   * Reserving the row up front is better than clipping it: the number is the
   * most useful thing in the column, and a chart that hides its own peak value
   * is worse than one that is a few pixels shorter.
   */
  const CHART_HEIGHT = 108;
  const PLOT_HEIGHT = CHART_HEIGHT - VALUE_ROW;

  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartHead}>
        <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.shrink}>
          Peak {max} XP
        </Text>
        {average > 0 ? (
          <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.shrink}>
            Average {Math.round(average)} XP / active week
          </Text>
        ) : null}
      </View>

      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        {/* Average reference line — what makes a bar readable as good or bad. */}
        {/*
          Measured against `PLOT_HEIGHT`, exactly like the bars. A reference
          line on a different scale from the thing it references is not a
          smaller bug than a misdrawn bar — it is a line that lies.
        */}
        {average > 0 ? (
          <View
            style={[
              styles.averageLine,
              { bottom: averageRatio * PLOT_HEIGHT, borderColor: theme.borderStrong },
            ]}
          />
        ) : null}

        <View style={styles.bars}>
          {data.map((bar, index) => (
            <Bar
              key={bar.label}
              label={bar.label}
              xp={bar.xp}
              height={Math.max(3, (bar.xp / max) * PLOT_HEIGHT)}
              index={index}
              tone={
                bar.xp === 0
                  ? theme.backgroundSunken
                  : index === data.length - 1
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
        {data.map((bar, index) => (
          <View key={bar.label} style={styles.barColumn}>
            <Text
              variant="caption"
              numberOfLines={1}
              tone={index === data.length - 1 ? theme.tint : theme.textTertiary}>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * One weekly column.
 *
 * Bars grow from the baseline, left to right. That is not decoration on a chart
 * of XP over time: the axis *is* time, so drawing it in the direction time runs
 * makes the shape of the last two months legible in a way a chart that simply
 * exists does not. Eight bars at one stagger step is over in under half a
 * second, which is short enough that it never delays reading the number.
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
}: {
  label: string;
  xp: number;
  height: number;
  index: number;
  tone: string;
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
      ) : null}
      <Animated.View
        accessibilityLabel={`${label}: ${xp} XP`}
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
  shrink: { flexShrink: 1 },
  bar: { width: '100%', borderRadius: Radius.xs, maxWidth: 34 },
});
