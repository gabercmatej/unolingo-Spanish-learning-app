import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback, gated by the user's setting.
 *
 * The settings provider calls `configureFeedback` on hydration and on change,
 * so call sites stay synchronous and don't need context.
 */
let hapticsEnabled = true;

export function configureFeedback(options: { haptics: boolean }) {
  hapticsEnabled = options.haptics;
}

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

function run(fn: () => Promise<unknown>) {
  if (!hapticsEnabled || !supported) return;
  fn().catch(() => {
    /* haptics are best-effort; a failure must never interrupt a lesson */
  });
}

export const feedback = {
  /** Selecting an option, toggling, picking a word from the bank. */
  tap: () => run(() => Haptics.selectionAsync()),
  /** Committing an answer, opening a lesson. */
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  correct: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Deliberately soft — a wrong answer is information, not a punishment. */
  incorrect: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
  celebrate: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
