/**
 * Unolingo design tokens.
 *
 * Identity: warm, sun-bleached Mediterranean. Cream paper, ink text, a
 * vermilion primary and saffron accent. Deliberately *not* the flat green
 * cartoon look — the audience is an adult who still likes fun products.
 *
 * Every colour used in the app comes from here via `useTheme()`. Skill
 * "channels" (vocab / grammar / listening / …) each own a hue so the learner
 * can tell at a glance what kind of practice they're looking at.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Surfaces
    background: '#FBF7F1',
    backgroundElement: '#FFFFFF',
    backgroundRaised: '#FFFFFF',
    backgroundSunken: '#F2ECE3',
    backgroundSelected: '#EFE7DA',
    border: '#E7DFD2',
    borderStrong: '#D5C9B6',
    shadow: '#3B2A17',
    // Top edge of a lifted surface. Light mode gets its depth from the tinted
    // shadow, so this is only a whisper; dark mode leans on it entirely.
    highlight: 'rgba(255,255,255,0)',
    // Specular pass used by the progress bar's completion sweep. White in both
    // themes because it is light, not paint — deriving it from a surface colour
    // makes it a *dark* sweep on dark, which reads as a fault rather than a
    // flourish.
    gleam: 'rgba(255,255,255,0.6)',

    // Text
    text: '#1C1714',
    textSecondary: '#6B6156',
    textTertiary: '#9C9186',
    textInverse: '#FFFFFF',

    // Brand
    tint: '#E4572E',
    tintSoft: '#FCE9E1',
    tintText: '#B33D1B',
    onTint: '#FFFFFF',

    accent: '#F2A93B',
    accentSoft: '#FDF0DA',
    accentText: '#9A6407',
    /**
     * Text and icons on a gradient-filled surface — white in both themes,
     * because the ramps beneath it are the same in both. Distinct from
     * `onTint`, which sits on *flat* channel fills: those are light in dark
     * mode and genuinely need dark text on them.
     */
    onGradient: '#FFFFFF',

    // Semantic
    success: '#15926B',
    successSoft: '#DFF3EB',
    successText: '#0B6E50',
    danger: '#D62246',
    dangerSoft: '#FCE4E9',
    dangerText: '#A31333',
    warning: '#C97A05',
    warningSoft: '#FBEFD8',

    // Skill channels
    vocab: '#E4572E',
    vocabSoft: '#FCE9E1',
    grammar: '#7A5AF8',
    grammarSoft: '#EDE9FE',
    listening: '#2D7FF9',
    listeningSoft: '#E1EDFE',
    speaking: '#0E9AA7',
    speakingSoft: '#DDF2F4',
    conversation: '#15926B',
    conversationSoft: '#DFF3EB',
    story: '#C44D9B',
    storySoft: '#FBE4F2',
    culture: '#B4791F',
    cultureSoft: '#FAEEDA',

    // Tabs
    tabIconDefault: '#A2988B',
    tabIconSelected: '#E4572E',
  },
  dark: {
    // Surfaces
    background: '#151215',
    backgroundElement: '#211D21',
    backgroundRaised: '#272127',
    backgroundSunken: '#100E10',
    backgroundSelected: '#2E282E',
    border: '#332D33',
    borderStrong: '#4A424A',
    shadow: '#000000',
    highlight: 'rgba(255,255,255,0.07)',
    gleam: 'rgba(255,255,255,0.3)',

    // Text
    text: '#F6F1EA',
    textSecondary: '#ADA39B',
    textTertiary: '#7C736C',
    textInverse: '#151215',

    // Brand
    tint: '#FF7A52',
    tintSoft: '#3A231B',
    tintText: '#FF9878',
    onTint: '#1C1714',

    accent: '#F7BC5C',
    accentSoft: '#3A2C15',
    accentText: '#F7C87A',
    onGradient: '#FFFFFF',

    // Semantic
    success: '#2ECC96',
    successSoft: '#15302A',
    successText: '#5BDCB0',
    danger: '#FF6B85',
    dangerSoft: '#3A1B24',
    dangerText: '#FF8FA3',
    warning: '#EFA83C',
    warningSoft: '#37280F',

    // Skill channels
    vocab: '#FF7A52',
    vocabSoft: '#3A231B',
    grammar: '#A78BFA',
    grammarSoft: '#2A2340',
    listening: '#63A4FF',
    listeningSoft: '#182741',
    speaking: '#3FC5D1',
    speakingSoft: '#123033',
    conversation: '#2ECC96',
    conversationSoft: '#15302A',
    story: '#EE7FC3',
    storySoft: '#3A1B31',
    culture: '#DFA84E',
    cultureSoft: '#33260F',

    // Tabs
    tabIconDefault: '#7C736C',
    tabIconSelected: '#FF7A52',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
/** Widened so consumers see `string`, not the literal hex of one theme. */
export type Palette = { readonly [K in ThemeColor]: string };
export type ColorScheme = 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

/** 4pt base scale. Prefer these over raw numbers. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
  eight: 64,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

/**
 * Type ramp. `display` is reserved for hero numbers and celebration moments;
 * `es` is for Spanish being taught — slightly larger and looser so accents
 * and question marks stay legible.
 *
 * Tracking is optical: large sizes tighten (a headline set at default tracking
 * reads loose and cheap), small sizes stay at zero, and `overline` opens up
 * because letterforms at 11px all-caps need the air to stay separable. `es`
 * keeps neutral tracking — tightening teaching text works against the accents.
 */
export const Type = {
  display: { fontSize: 44, lineHeight: 48, fontWeight: '800', letterSpacing: -1.1 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.7 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: -0.1 },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '700', letterSpacing: -0.1 },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 1 },
  es: { fontSize: 24, lineHeight: 34, fontWeight: '700' },
  esSmall: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
} as const;

export type TypeToken = keyof typeof Type;

/**
 * Two-stop ramps for the surfaces that carry a gradient — the primary action
 * and the two verdict states. Deliberately narrow: a gradient earns its place
 * on the one thing the eye should land on first, and nowhere else.
 *
 * They live outside `Colors` because a palette entry has to stay a single
 * string; read them with `useGradients()`.
 *
 * **The same ramps serve both themes**, which is the one place in this file
 * that rule applies. Every other colour here is a *surface* and takes its value
 * from the page it sits on; a gradient-filled button is a **lit object**, and a
 * light source does not change colour because the room got darker. Dark mode
 * used to lighten these — correct instinct, wrong subject. It left the primary
 * action at 2.3:1 against white and so forced near-black text onto it, which is
 * why the same button read as orange-on-white in light mode and orange-on-black
 * in dark.
 */
const RAMPS = {
  tint: ['#F0713F', '#D8431C'],
  success: ['#1BA97C', '#0E7C57'],
  danger: ['#E23A5B', '#BE1839'],
} as const;

export const Gradients = {
  light: RAMPS,
  dark: RAMPS,
} as const;

export type GradientName = keyof typeof Gradients.light;
export type GradientSet = { readonly [K in GradientName]: readonly [string, string] };

export const Elevation = {
  card: Platform.select({
    ios: { shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 2 },
    default: { boxShadow: '0 4px 12px rgba(59,42,23,0.06)' },
  }),
  raised: Platform.select({
    ios: { shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: 6 },
    default: { boxShadow: '0 10px 24px rgba(59,42,23,0.12)' },
  }),
} as const;

/**
 * Motion. Kept short — feedback should feel immediate, not choreographed.
 *
 * Four springs, and the reason there are four rather than one is that a spring
 * is a *character*, not a duration: `spring` is the neutral one almost
 * everything uses, `springBouncy` is the release of a press, `springPop` is the
 * only one allowed to overshoot visibly and is reserved for the moments that
 * are actually rewards, and `springSoft` is for large surfaces, where the same
 * energy that reads as lively on a 40px badge reads as wobbly on a full card.
 *
 * `stagger` is the delay ladder unit. Entrance timings used to be fifteen
 * hand-tuned numbers; one number times an index is a rhythm, and fifteen
 * numbers is a list of accidents.
 */
export const Motion = {
  fast: 140,
  base: 220,
  slow: 380,
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
  springBouncy: { damping: 12, stiffness: 260, mass: 0.8 },
  /** Visible overshoot. Celebration only — it looks broken on a control. */
  springPop: { damping: 9, stiffness: 300, mass: 0.75 },
  /** Heavier and calmer, for cards, sheets and anything full-width. */
  springSoft: { damping: 22, stiffness: 150, mass: 1 },
  /** One step of the entrance ladder, in ms. */
  stagger: 55,
} as const;

/**
 * How far a surface lifts under a web pointer.
 *
 * Hover and press have to read as *different states*, not the same state at two
 * strengths, so they move on different axes: hover raises (translateY + a
 * fractional scale), press shrinks. A pointer resting on something is not a
 * weaker version of clicking it.
 */
export const Hover = {
  scale: 1.015,
  lift: -2,
} as const;

/**
 * Space a scrolling screen must leave clear of the tab bar. Matches the bar
 * height in `(tabs)/_layout.tsx`; the screen adds the safe-area inset on top.
 */
export const BottomTabInset = 64;
export const MaxContentWidth = 620;
