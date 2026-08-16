import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
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

const WEEKS = 17; // ~4 months, which fits a phone width at 12px cells
const CELL = 13;
const GAP = 3;

interface CalendarProps {
  daily: DailyRecord[];
}

export function ActivityCalendar({ daily }: CalendarProps) {
  const theme = useTheme();

  const { weeks, monthLabels, activeDays, best } = useMemo(() => {
    const lookup = new Map(daily.map((entry) => [entry.date, entry.xp]));
    const today = toISODate();

    // Start on the Monday of the earliest week so columns are true weeks.
    const todayDate = new Date(today);
    const isoWeekday = (todayDate.getDay() + 6) % 7; // 0 = Monday
    const lastMonday = addDays(today, -isoWeekday);

    const columns: { date: string; xp: number }[][] = [];
    const labels: { index: number; label: string }[] = [];
    let seenMonth = '';

    for (let week = WEEKS - 1; week >= 0; week -= 1) {
      const monday = addDays(lastMonday, -week * 7);
      const column: { date: string; xp: number }[] = [];
      for (let day = 0; day < 7; day += 1) {
        const date = addDays(monday, day);
        column.push({ date, xp: date <= today ? (lookup.get(date) ?? 0) : -1 });
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

  return (
    <View style={styles.calendarBlock}>
      <View style={styles.monthRow}>
        {monthLabels.map((entry) => (
          <Text
            key={`${entry.label}-${entry.index}`}
            variant="caption"
            color="textTertiary"
            style={[styles.monthLabel, { left: 26 + entry.index * (CELL + GAP) }]}>
            {entry.label}
          </Text>
        ))}
      </View>

      <View style={styles.calendarRow}>
        <View style={styles.weekdayColumn}>
          {['M', '', 'W', '', 'F', '', 'S'].map((label, index) => (
            <View key={index} style={styles.weekdayCell}>
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
                  style={[styles.cell, { backgroundColor: cellColor(day.xp) }]}
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

  const CHART_HEIGHT = 108;

  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartHead}>
        <Text variant="caption" color="textTertiary">
          Peak {max} XP
        </Text>
        {average > 0 ? (
          <Text variant="caption" color="textTertiary">
            Average {Math.round(average)} XP / active week
          </Text>
        ) : null}
      </View>

      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        {/* Average reference line — what makes a bar readable as good or bad. */}
        {average > 0 ? (
          <View
            style={[
              styles.averageLine,
              { bottom: averageRatio * CHART_HEIGHT, borderColor: theme.borderStrong },
            ]}
          />
        ) : null}

        <View style={styles.bars}>
          {data.map((bar, index) => {
            const isNow = index === data.length - 1;
            const height = Math.max(3, (bar.xp / max) * CHART_HEIGHT);
            return (
              <View key={bar.label} style={styles.barColumn}>
                {bar.xp > 0 ? (
                  <Text variant="caption" color="textTertiary" style={styles.barValue}>
                    {bar.xp}
                  </Text>
                ) : null}
                <View
                  accessibilityLabel={`${bar.label}: ${bar.xp} XP`}
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor:
                        bar.xp === 0
                          ? theme.backgroundSunken
                          : isNow
                            ? theme.tint
                            : mix(theme.tint, theme.backgroundSunken, 0.55),
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.bars}>
        {data.map((bar, index) => (
          <View key={bar.label} style={styles.barColumn}>
            <Text
              variant="caption"
              tone={index === data.length - 1 ? theme.tint : theme.textTertiary}>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
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
  weekdayColumn: { gap: GAP, width: 22 },
  weekdayCell: { height: CELL, justifyContent: 'center' },
  grid: { flexDirection: 'row', gap: GAP, flex: 1 },
  weekColumn: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3 },

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
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  barValue: { fontSize: 9 },
  bar: { width: '100%', borderRadius: Radius.xs, maxWidth: 34 },
});
