import { Platform } from 'react-native';

/**
 * Local reminders — the platform seam, and nothing else.
 *
 * Shaped like `feedback.ts` and `sound.ts`: the store hands it a plan and a
 * flag, and call sites stay synchronous. **No policy lives here.** Which
 * instants deserve a notification is decided by `learning/reminders.ts`, which
 * is pure and therefore testable; this file only knows how to put them on the
 * system scheduler and how to take them off again.
 *
 * Everything is best-effort. A learner who declined notification permission
 * should get an app that works, not an app that throws on launch — so every
 * failure here is swallowed after being narrowed to a boolean the settings
 * screen can show.
 */

const supported = Platform.OS !== 'web';

/** Lazily imported so web never pulls the native module into its bundle. */
async function api() {
  if (!supported) return null;
  return import('expo-notifications');
}

let configured = false;

async function ensureHandler() {
  const Notifications = await api();
  if (!Notifications || configured) return Notifications;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  configured = true;
  return Notifications;
}

export async function hasReminderPermission(): Promise<boolean> {
  const Notifications = await api();
  if (!Notifications) return false;
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

/**
 * Asks once. iOS only ever shows the system prompt on the first call; later
 * calls resolve to whatever the learner decided, which is why the settings
 * screen needs `hasReminderPermission` to tell "off" from "denied".
 */
export async function requestReminderPermission(): Promise<boolean> {
  const Notifications = await api();
  if (!Notifications) return false;
  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function cancelReminders(): Promise<void> {
  const Notifications = await api();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing scheduled, or no permission. Either way there is nothing to undo.
  }
}

/**
 * Replaces the whole queue. Cancelling first is what makes this idempotent —
 * it is called on every launch and after every session, and without the cancel
 * a fortnight of duplicates would pile up within a week of ordinary use.
 */
export async function scheduleReminders(
  when: Date[],
  content: { title: string; body: string },
): Promise<number> {
  const Notifications = await ensureHandler();
  if (!Notifications) return 0;

  await cancelReminders();
  if (when.length === 0) return 0;
  if (!(await hasReminderPermission())) return 0;

  let scheduled = 0;
  for (const date of when) {
    if (date.getTime() <= Date.now()) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: content.title, body: content.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      scheduled += 1;
    } catch {
      // One failed slot should not cost the rest of the queue.
    }
  }
  return scheduled;
}
