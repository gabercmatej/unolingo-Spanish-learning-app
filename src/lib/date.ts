/** Local-time date helpers. Streaks and daily goals are local-day based. */

export function toISODate(date: Date | number = new Date()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86_400_000);
}

/**
 * A streak survives today being empty — it only breaks once a whole day has
 * passed without study. Opening the app on day 2 having studied on day 1 shows
 * the streak intact, which is honest and avoids the manipulative "you lost it"
 * moment before the day is over.
 */
export function currentStreak(lastStudyDate: string | null, streak: number, today = toISODate()): number {
  if (!lastStudyDate) return 0;
  const gap = daysBetween(lastStudyDate, today);
  if (gap <= 1) return streak;
  return 0;
}

export function nextStreak(lastStudyDate: string | null, streak: number, today = toISODate()): number {
  if (!lastStudyDate) return 1;
  const gap = daysBetween(lastStudyDate, today);
  if (gap === 0) return Math.max(streak, 1);
  if (gap === 1) return streak + 1;
  return 1;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function relativeDay(iso: string, today = toISODate()): string {
  const gap = daysBetween(iso, today);
  if (gap === 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  if (gap < 7) return `${gap} days ago`;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}
