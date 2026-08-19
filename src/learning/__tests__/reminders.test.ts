import { REMINDER_HORIZON_DAYS, reminderBody, reminderSchedule, shouldRemindToday } from '@/learning/reminders';

/**
 * The reminder rules, which exist because a repeating daily notification
 * cannot answer the only question that matters — "have they studied yet
 * today?" — at the moment it fires. A learner who studied at ten in the
 * morning being told off at six is the failure this file prevents.
 */

const at = (iso: string) => new Date(iso);
const hours = (dates: Date[]) => dates.map((d) => `${d.toISOString().slice(0, 10)} ${d.getHours()}`);

describe('whether today still deserves a nudge', () => {
  it('takes today’s slot when nothing has been studied and six has not passed', () => {
    expect(
      shouldRemindToday({
        now: at('2026-08-19T10:00:00'),
        lastStudyDate: '2026-08-18',
        enabled: true,
        hour: 18,
      }),
    ).toBe(true);
  });

  /** The whole point. A morning session must silence the same evening. */
  it('skips today once the learner has already studied today', () => {
    expect(
      shouldRemindToday({
        now: at('2026-08-19T10:00:00'),
        lastStudyDate: '2026-08-19',
        enabled: true,
        hour: 18,
      }),
    ).toBe(false);
  });

  it('skips today when six has already gone by', () => {
    // A reminder about a moment that has passed is noise, not a nudge.
    expect(
      shouldRemindToday({
        now: at('2026-08-19T19:30:00'),
        lastStudyDate: '2026-08-18',
        enabled: true,
        hour: 18,
      }),
    ).toBe(false);
  });

  it('nudges a learner who has never studied at all', () => {
    expect(
      shouldRemindToday({
        now: at('2026-08-19T09:00:00'),
        lastStudyDate: null,
        enabled: true,
        hour: 18,
      }),
    ).toBe(true);
  });
});

describe('the scheduled queue', () => {
  it('starts today at the chosen hour when today is still open', () => {
    const queue = reminderSchedule({
      now: at('2026-08-19T10:00:00'),
      lastStudyDate: '2026-08-18',
      enabled: true,
      hour: 18,
      horizonDays: 3,
    });
    expect(hours(queue)).toEqual(['2026-08-19 18', '2026-08-20 18', '2026-08-21 18']);
  });

  it('starts tomorrow when today has already been banked', () => {
    const queue = reminderSchedule({
      now: at('2026-08-19T10:00:00'),
      lastStudyDate: '2026-08-19',
      enabled: true,
      hour: 18,
      horizonDays: 3,
    });
    expect(hours(queue)).toEqual(['2026-08-20 18', '2026-08-21 18', '2026-08-22 18']);
  });

  it('honours a different hour', () => {
    const queue = reminderSchedule({
      now: at('2026-08-19T05:00:00'),
      lastStudyDate: null,
      enabled: true,
      hour: 7,
      horizonDays: 2,
    });
    expect(hours(queue)).toEqual(['2026-08-19 7', '2026-08-20 7']);
  });

  it('returns nothing at all when reminders are off, so the caller cancels', () => {
    expect(
      reminderSchedule({
        now: at('2026-08-19T10:00:00'),
        lastStudyDate: null,
        enabled: false,
        hour: 18,
      }),
    ).toEqual([]);
  });

  it('refuses a nonsense hour rather than scheduling at midnight', () => {
    for (const hour of [-1, 24, 99, 1.5]) {
      expect(
        reminderSchedule({ now: at('2026-08-19T10:00:00'), lastStudyDate: null, enabled: true, hour }),
      ).toEqual([]);
    }
  });

  it('stops after the horizon, so an abandoned app goes quiet', () => {
    const queue = reminderSchedule({
      now: at('2026-08-19T10:00:00'),
      lastStudyDate: null,
      enabled: true,
      hour: 18,
    });
    expect(queue).toHaveLength(REMINDER_HORIZON_DAYS);
  });

  it('never schedules an instant in the past', () => {
    const now = at('2026-08-19T23:00:00');
    const queue = reminderSchedule({ now, lastStudyDate: null, enabled: true, hour: 18 });
    for (const date of queue) expect(date.getTime()).toBeGreaterThan(now.getTime());
  });

  it('crosses a month boundary without inventing a 32nd', () => {
    const queue = reminderSchedule({
      now: at('2026-08-30T10:00:00'),
      lastStudyDate: null,
      enabled: true,
      hour: 18,
      horizonDays: 3,
    });
    expect(hours(queue)).toEqual(['2026-08-30 18', '2026-08-31 18', '2026-09-01 18']);
  });
});

describe('what the notification says', () => {
  it('names the streak once there is one worth protecting', () => {
    expect(reminderBody(5)).toContain('5');
    expect(reminderBody(1)).toMatch(/[Aa]yer/);
    // No streak, no guilt trip about a streak that does not exist.
    expect(reminderBody(0)).not.toMatch(/\d/);
  });
});
