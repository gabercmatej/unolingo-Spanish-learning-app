import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  tone?: string;
}

export function Icon({ name, size = 20, color = 'text', tone }: IconProps) {
  const theme = useTheme();
  return <Ionicons name={name} size={size} color={tone ?? theme[color]} />;
}
