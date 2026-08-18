import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Motion } from '@/constants/theme';

/**
 * The app's motion primitives.
 *
 * Worth being precise about what this does and does not buy, because it is easy
 * to claim credit for something the library already does: every Reanimated
 * animation — `withTiming`, `withSpring`, and every entering builder — defaults
 * to `ReduceMotion.System`, so the system setting is already honoured everywhere
 * without anyone opting in. That is not what `Reveal` is for.
 *
 * `Reveal` is for the delay ladder. Entrance timings were fifteen hand-tuned
 * numbers across the app, which is how a results screen ends up with one card
 * arriving 40 ms after another for no reason anybody can reconstruct. One
 * component means one rhythm, and it degrades to a shorter crossfade under
 * Reduce Motion rather than to nothing, because a results screen that simply
 * appears whole is harder to read than one that arrives in order.
 *
 * `useCountUp` genuinely does need the check: it is a plain rAF loop and
 * Reanimated knows nothing about it.
 */

interface RevealProps {
  children: ReactNode;
  /** Stagger position in a group. Capped so a long list never crawls. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function Reveal({ children, delay = 0, style }: RevealProps) {
  const reduced = useReducedMotion();
  const entering = reduced
    ? FadeIn.duration(Motion.fast).delay(Math.min(delay, 120))
    : FadeInDown.duration(Motion.base + 60).delay(delay);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

/**
 * A number that rolls to its new value.
 *
 * XP is the one number in the app worth watching move: it is the reward, and a
 * total that simply appears is a reward you have to be told about rather than
 * one you see arrive. Everything else — accuracy, counts — should just be
 * correct immediately.
 *
 * Eased out rather than linear, because the last few tenths of a second are what
 * make it feel like it is settling rather than being scrubbed. Pair with
 * `<Text numeric>`: proportional digits make a rolling total visibly jitter.
 */
export function useCountUp(target: number, duration = 900): number {
  const reduced = useReducedMotion();
  // Whether to animate at all is decided during render, not by setting state in
  // an effect — an effect that immediately calls setState is a second render for
  // a value that was knowable in the first.
  const animate = !reduced && duration > 0 && target > 0;
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) return;

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      // ease-out-quart: fast to begin with, settling rather than stopping.
      const eased = 1 - (1 - t) ** 4;
      setValue(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [animate, duration, target]);

  return animate ? value : target;
}
