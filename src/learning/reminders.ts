import { toISODate } from '@/lib/date';

/**
 * When to nudge, and when to shut up.
 *
 * Policy, not plumbing — `lib/notifications.ts` knows how to schedule a local
 * notification and nothing about when one is deserved. That split is the same
 * one that moved the snapshot rules out of `lib/snapshots.ts`: the rules here
 * are the part worth testing, and they cannot be tested through a module that
 * imports a native scheduler.
 *
 * The product rule is "remind me at 6pm if I haven't studied yet today", and
 * the hard part is the *yet*. A repeating daily trigger cannot ask a question
 * at fire time — it either fires every day or it does not exist — so a learner
 * who studied at 10am would still be told off at six. The way round it is to
 * stop treating the reminder as one recurring thing and treat it as a short
 * queue of individual days, recomputed whenever the app has new information:
 * on launch, on backgrounding, and the moment a session is banked.
 *
 * The queue is deliberately finite. If the app has not been opened in a
 * fortnight the reminders lapse, and that is correct behaviour rather than a
 * limitation — an app nobody opens should eventually stop talking.
 */

export const REMINDER_HORIZON_DAYS = 14;

export interface ReminderInput {
  now: Date;
  /** ISO date of the last day the learner actually studied, if any. */
  lastStudyDate: string | null;
  enabled: boolean;
  /** Local hour, 0–23. */
  hour: number;
  horizonDays?: number;
}

function at(day: Date, hour: number): Date {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Whether today's slot is still worth taking. Two reasons it is not: the
 * learner already studied today, so there is nothing to nudge about, or six
 * o'clock has already passed, and a reminder that arrives late is just noise
 * about a moment that has gone.
 */
export function shouldRemindToday(input: ReminderInput): boolean {
  const today = toISODate(input.now);
  if (input.lastStudyDate === today) return false;
  return input.now.getTime() < at(input.now, input.hour).getTime();
}

/**
 * The instants to schedule, soonest first. Empty when reminders are off, which
 * the caller reads as "cancel everything".
 */
export function reminderSchedule(input: ReminderInput): Date[] {
  if (!input.enabled) return [];
  if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23) return [];

  const horizon = input.horizonDays ?? REMINDER_HORIZON_DAYS;
  const out: Date[] = [];

  const startOffset = shouldRemindToday(input) ? 0 : 1;
  for (let offset = startOffset; offset < startOffset + horizon; offset += 1) {
    const day = new Date(input.now);
    day.setDate(day.getDate() + offset);
    out.push(at(day, input.hour));
  }
  return out;
}

/** The line the notification shows. Kept here so the copy is testable too. */
export function reminderBody(streak: number): string {
  if (streak >= 2) return `Llevas ${streak} días seguidos. Cinco minutos y sigues.`;
  if (streak === 1) return 'Ayer estudiaste. Cinco minutos y van dos.';
  return 'Cinco minutos de español y listo.';
}
