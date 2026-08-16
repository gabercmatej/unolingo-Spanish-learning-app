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
 */
export const Gradients = {
  light: {
    tint: ['#F0713F', '#D8431C'],
    success: ['#1BA97C', '#0E7C57'],
    danger: ['#E23A5B', '#BE1839'],
  },
  dark: {
    tint: ['#FF8C63', '#EF5F35'],
    success: ['#39D8A2', '#1FA57A'],
    danger: ['#FF7C94', '#E24A67'],
  },
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

/** Motion. Kept short — feedback should feel immediate, not choreographed. */
export const Motion = {
  fast: 140,
  base: 220,
  slow: 380,
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
  springBouncy: { damping: 12, stiffness: 260, mass: 0.8 },
} as const;

/**
 * Space a scrolling screen must leave clear of the tab bar. Matches the bar
 * height in `(tabs)/_layout.tsx`; the screen adds the safe-area inset on top.
 */
export const BottomTabInset = 64;
export const MaxContentWidth = 620;
