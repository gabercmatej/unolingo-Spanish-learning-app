import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A timestamp that is stable across renders and refreshes when it should.
 *
 * `const now = Date.now()` in a render body looks free and is not. Every memo
 * that lists it as a dependency gets a new dependency on every render, so
 * `useMemo(() => courseProgress(learner, now), [learner, now])` recomputed the
 * whole course on every keystroke, scroll and theme change — the memo was
 * decoration. It is also an impure call during render, which the React Compiler
 * is right to reject.
 *
 * This makes the clock a piece of state, which is what it always was: it moves
 * on a slow interval, and again when the app comes back from the background,
 * because that is when a due date has most likely changed without anything in
 * the app having happened.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [intervalMs]);

  return now;
}
