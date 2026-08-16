import { createContext, useContext } from 'react';

import {
  Colors,
  Gradients,
  type ColorScheme,
  type GradientSet,
  type Palette,
} from '@/constants/theme';

/**
 * Resolved colour scheme. Supplied by `ThemeSchemeProvider`, which folds the
 * user's appearance preference (light / dark / system) together with the OS
 * setting so that no component has to know which won.
 */
export const ColorSchemeContext = createContext<ColorScheme>('light');

export function useColorScheme(): ColorScheme {
  return useContext(ColorSchemeContext);
}

export function useTheme(): Palette {
  return Colors[useContext(ColorSchemeContext)];
}

export function useGradients(): GradientSet {
  return Gradients[useContext(ColorSchemeContext)];
}

export function useIsDark(): boolean {
  return useContext(ColorSchemeContext) === 'dark';
}
