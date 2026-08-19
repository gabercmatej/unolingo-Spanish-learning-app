import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/ui/text';
import { Motion, Radius } from '@/constants/theme';

/**
 * The app's motion primitives.
 *
 * Worth being precise about what this does and does not buy, because it is easy
 * to claim credit for something the library already does: every Reanimated
 * animation — `withTiming`, `withSpring`, and every entering builder — defaults
 * to `ReduceMotion.System`, so the system setting is already honoured everywhere
 * without anyone opting in. That is not what these are for.
 *
 * They exist so that motion in this app is a *vocabulary* rather than a habit.
 * There are exactly five things a surface is allowed to do — arrive (`Reveal`),
 * acknowledge (`usePop`), refuse (`useShake`), count (`useCountUp`) and
 * celebrate (`Burst`) — and a screen that wants a sixth is nearly always a
 * screen that wanted one of these five. The alternative is what this file
 * replaced: entrance timings as fifteen hand-tuned numbers, and every new
 * celebration inventing its own idea of what "pop" means.
 *
 * The two that genuinely need their own Reduce Motion check are `useCountUp`
 * and `Burst`: the first is a plain rAF loop the library knows nothing about,
 * and the second is not a smaller version of itself under Reduce Motion — a
 * particle burst has no quiet form, so it renders nothing at all.
 */

// --- Arriving ---------------------------------------------------------------

interface RevealProps {
  children: ReactNode;
  /** Stagger position in a group. Capped so a long list never crawls. */
  delay?: number;
  /**
   * Which direction it arrives from. `below` is the default and means "this is
   * new here"; `right` means "this is the next one" and belongs to anything
   * advancing through a queue, where downward motion would read as a fresh
   * screen rather than the following item.
   */
  from?: 'below' | 'right';
  style?: StyleProp<ViewStyle>;
}

export function Reveal({ children, delay = 0, from = 'below', style }: RevealProps) {
  const reduced = useReducedMotion();
  const arrive = from === 'right' ? FadeInRight : FadeInDown;
  const entering = reduced
    ? FadeIn.duration(Motion.fast).delay(Math.min(delay, 120))
    : arrive.duration(Motion.base + 60).delay(delay);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

/**
 * The delay for the nth item in an entrance ladder.
 *
 * Capped rather than linear: the eleventh row of a list arriving two-thirds of
 * a second after the first is not a rhythm, it is a wait. Past the cap
 * everything lands together, which is what the eye expects anyway once the
 * group has clearly started.
 */
export function stagger(index: number, max = 8): number {
  return Math.min(index, max) * Motion.stagger;
}

// --- Acknowledging ----------------------------------------------------------

interface PopOptions {
  /** Peak scale. Bigger surfaces should move less. */
  scale?: number;
  /** Skips the pop until this is true — for values that hydrate late. */
  enabled?: boolean;
}

/**
 * An animated style that pops whenever `trigger` changes.
 *
 * Deliberately skips the first run. A streak counter that pops the moment the
 * screen opens is claiming something happened, and nothing did — the pop means
 * "this number just went up", so it has to fire on the change and never on the
 * arrival.
 *
 * Up fast and linear, back on a spring: the asymmetry is the whole effect. Two
 * springs read as a wobble, and two timings read as a bounce in a cartoon.
 */
export function usePop(trigger: unknown, { scale = 1.16, enabled = true }: PopOptions = {}) {
  const reduced = useReducedMotion();
  const value = useSharedValue(1);
  const seen = useRef<unknown>(trigger);

  useEffect(() => {
    if (seen.current === trigger) return;
    seen.current = trigger;
    if (reduced || !enabled) return;
    value.set(
      withSequence(
        withTiming(scale, { duration: Motion.fast }),
        withSpring(1, Motion.springBouncy),
      ),
    );
  }, [enabled, reduced, scale, trigger, value]);

  return useAnimatedStyle(() => ({ transform: [{ scale: value.get() }] }));
}

/** `usePop` as a wrapper, for when the target is a whole subtree. */
export function Pop({
  trigger,
  children,
  scale,
  style,
}: {
  trigger: unknown;
  children: ReactNode;
  scale?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pop = usePop(trigger, { scale });
  return <Animated.View style={[style, pop]}>{children}</Animated.View>;
}

/**
 * A one-shot entrance pop, for something that appears already deserving
 * attention — an achievement row, a verdict icon.
 *
 * Separate from `usePop` because the two are opposites: this one only ever
 * fires on arrival, and that one never does.
 */
export function useEntrancePop(delay = 0, from = 0.7) {
  const reduced = useReducedMotion();
  const value = useSharedValue(reduced ? 1 : from);

  useEffect(() => {
    if (reduced) return;
    value.set(withDelay(delay, withSpring(1, Motion.springPop)));
  }, [delay, reduced, value]);

  return useAnimatedStyle(() => ({ transform: [{ scale: value.get() }] }));
}

// --- Refusing ---------------------------------------------------------------

/**
 * A short lateral shake, for a wrong answer.
 *
 * Four beats and 220ms in total, which is about as long as this is allowed to
 * be: a shake is the app saying "not that" and then getting out of the way. It
 * moves rather than flashes red because the colour is already doing that job,
 * and two channels saying the same thing at the same volume is shouting.
 */
export function useShake(trigger: unknown, distance = 7) {
  const reduced = useReducedMotion();
  const value = useSharedValue(0);
  const seen = useRef<unknown>(trigger);

  useEffect(() => {
    if (seen.current === trigger) return;
    seen.current = trigger;
    if (reduced || trigger === null || trigger === undefined) return;
    value.set(
      withSequence(
        withTiming(-distance, { duration: 55 }),
        withTiming(distance, { duration: 55 }),
        withTiming(-distance * 0.55, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      ),
    );
  }, [distance, reduced, trigger, value]);

  return useAnimatedStyle(() => ({ transform: [{ translateX: value.get() }] }));
}

export function Shake({
  trigger,
  children,
  style,
}: {
  trigger: unknown;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const shake = useShake(trigger);
  return <Animated.View style={[style, shake]}>{children}</Animated.View>;
}

// --- Counting ---------------------------------------------------------------

/**
 * A number that rolls to its new value.
 *
 * XP is the one number in the app worth watching move: it is the reward, and a
 * total that simply appears is a reward you have to be told about rather than
 * one you see arrive. Everything else — accuracy, counts — should just be
 * correct immediately.
 *
 * It counts from wherever it currently *is*, not from zero. A header total that
 * restarts from nothing every time three XP is added is not counting, it is
 * re-introducing itself; and because the value it starts from is the one on
 * screen rather than the last settled target, retargeting mid-roll continues
 * smoothly instead of jumping back.
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
  const animate = !reduced && duration > 0;
  const [value, setValue] = useState(0);
  const shown = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) return;

    const from = shown.current;
    const delta = target - from;
    if (delta === 0) return;

    const started = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - started) / duration);
      // ease-out-quart: fast to begin with, settling rather than stopping.
      const eased = 1 - (1 - t) ** 4;
      const next = Math.round(from + delta * eased);
      shown.current = next;
      setValue(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [animate, duration, target]);

  return animate ? value : target;
}

interface CountUpProps extends Omit<TextProps, 'children'> {
  value: number;
  duration?: number;
  /** Wrapped around the rolled number, e.g. `+{n} XP`. */
  format?: (value: number) => string;
}

/**
 * `useCountUp` bound to a `Text`, so a call site never forgets `numeric` — a
 * rolling total set in proportional digits visibly jitters, and it is the kind
 * of thing nobody notices is missing until they see the two side by side.
 */
export function CountUp({ value, duration, format, ...rest }: CountUpProps) {
  const rolled = useCountUp(value, duration);
  return (
    <Text numeric {...rest}>
      {format ? format(rolled) : String(rolled)}
    </Text>
  );
}

// --- Celebrating ------------------------------------------------------------

const PARTICLES = 12;

/**
 * Deterministic jitter.
 *
 * `Math.random()` in a render body is impure and would also re-roll the whole
 * burst on every render, so the scatter is derived from the particle's index —
 * same input, same burst, and no dependency on when React decided to re-run.
 */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function Particle({ index, tone, radius }: { index: number; tone: string; radius: number }) {
  const angle = (index / PARTICLES) * Math.PI * 2 + jitter(index) * 0.4;
  const distance = radius * (0.68 + jitter(index + 9) * 0.42);
  const size = 4 + jitter(index + 21) * 3.5;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(index * 9, withTiming(1, { duration: 620 + jitter(index + 3) * 180 })),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => {
    const t = progress.get();
    return {
      // Eased out so the particles fling and then drift, rather than travelling
      // at a constant speed like something being animated.
      transform: [
        { translateX: Math.cos(angle) * distance * (1 - (1 - t) ** 3) },
        { translateY: Math.sin(angle) * distance * (1 - (1 - t) ** 3) },
        { scale: 1 - t * 0.7 },
      ],
      opacity: t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: Radius.full, backgroundColor: tone },
        style,
      ]}
    />
  );
}

/**
 * A single sparse burst, fired once on mount.
 *
 * Twelve small dots rather than confetti, and it is worth saying why: this app's
 * visual identity is deliberately not the flat cartoon look, and falling
 * confetti is that look's signature. A short radial burst in the colour of the
 * thing being celebrated reads as the surface itself releasing energy, which is
 * the same reward without the costume.
 *
 * It is absolutely positioned and non-interactive, so it never affects layout —
 * drop it behind whatever is being celebrated and it will centre on it.
 */
export function Burst({ tones, radius = 72 }: { tones: string[]; radius?: number }) {
  const reduced = useReducedMotion();
  // A burst has no quiet form. Under Reduce Motion it is simply absent, rather
  // than a slower version of the thing the setting exists to avoid.
  if (reduced || tones.length === 0) return null;

  return (
    <View style={styles.burst}>
      {Array.from({ length: PARTICLES }, (_, index) => (
        <Particle
          key={index}
          index={index}
          radius={radius}
          tone={tones[index % tones.length]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    // In `style`, not as a prop: the `pointerEvents` prop is deprecated in
    // React Native and warns on every render on web.
    pointerEvents: 'none',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: { position: 'absolute' },
});
