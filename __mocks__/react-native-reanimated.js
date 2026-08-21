/**
 * Reanimated, flattened for jest.
 *
 * The library ships its own `mock.js`, but it re-imports the real entry point,
 * which pulls in `react-native-worklets` and dies on a native module that does
 * not exist under jest. This replaces the module outright instead.
 *
 * Animated views render as plain views and every animation helper returns its
 * target value immediately, so a component test sees the settled frame. That is
 * the right resolution for these tests: they assert what a press *does*, not
 * how it looks getting there.
 *
 * Lives in the root `__mocks__` so jest applies it to every suite
 * automatically — node module mocks in this directory need no `jest.mock` call.
 */
const React = require('react');
const { View } = require('react-native');

const passthrough = (value) => value;
const noop = () => {};

/**
 * Chainable without enumerating the chain.
 *
 * Call sites write `SlideInDown.springify().damping(20).stiffness(190).mass(0.9)`,
 * and a hand-listed set of methods only fails later, in whichever suite first
 * renders a component using the one that was missed. Answering every property
 * with "another link in the chain" cannot go stale.
 */
const entering = new Proxy(function entering() {}, {
  get: (_target, key) => (key === 'then' ? undefined : () => entering),
  apply: () => entering,
});

const createAnimatedComponent = (Component) => {
  const Wrapped = React.forwardRef((props, ref) =>
    React.createElement(Component, { ...props, ref }),
  );
  Wrapped.displayName = `Animated(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
};

const Animated = {
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(View),
  ScrollView: createAnimatedComponent(View),
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  createAnimatedComponent,

  FadeIn: entering,
  FadeOut: entering,
  FadeInUp: entering,
  FadeInDown: entering,
  FadeInRight: entering,
  SlideInDown: entering,
  ZoomIn: entering,
  ZoomOut: entering,
  LinearTransition: entering,

  useSharedValue: (initial) => {
    let current = initial;
    return {
      get value() {
        return current;
      },
      set value(next) {
        current = next;
      },
      get: () => current,
      set: (next) => {
        current = typeof next === 'function' ? next(current) : next;
      },
      addListener: noop,
      removeListener: noop,
      modify: noop,
    };
  },
  useAnimatedStyle: (factory) => {
    try {
      return factory() ?? {};
    } catch {
      return {};
    }
  },
  useAnimatedRef: () => ({ current: null }),
  useAnimatedProps: (factory) => {
    try {
      return factory() ?? {};
    } catch {
      return {};
    }
  },
  useReducedMotion: () => false,
  useFrameCallback: () => ({ setActive: noop }),
  useDerivedValue: (factory) => ({ value: factory(), get: factory, set: noop }),

  withSpring: passthrough,
  withTiming: passthrough,
  withSequence: (...values) => values[values.length - 1],
  withRepeat: passthrough,
  withDelay: (_delay, value) => value,
  cancelAnimation: noop,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  interpolate: () => 0,
  interpolateColor: () => 'transparent',

  Easing: {
    bezier: () => ({ factory: () => passthrough }),
    linear: passthrough,
    ease: passthrough,
    out: passthrough,
    inOut: passthrough,
  },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
};
