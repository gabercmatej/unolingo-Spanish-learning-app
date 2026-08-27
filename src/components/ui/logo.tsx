import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MASCOT = require('@/assets/images/brand/mascot.png');

/** Intrinsic proportions of `mascot.png`, so the caller only sets a width. */
const MASCOT_RATIO = 586 / 640;

export interface LogoProps {
  /** Width. Height follows the artwork's own proportions. */
  size?: number;
  /**
   * Wraps the mark in a round brand plate. Use where the logo sits against a
   * busy or ambiguous surface and needs its own ground — a page header, say.
   */
  plate?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The Unolingo mark — the mascot.
 *
 * One piece of artwork rather than the mark/lockup pair it replaced, which is
 * why there is no `variant`: two variants that resolve to the same image is a
 * prop that reads as a choice and makes none.
 *
 * The artwork is a transparent PNG rather than inline SVG or an emoji: it is a
 * painted illustration with soft interior shading that vector primitives would
 * flatten, and the cutout means the same file sits correctly on cream and on
 * the dark surface without a second asset.
 */
export function Logo({ size = 72, plate, style }: LogoProps) {
  const theme = useTheme();

  const art = (
    <Image
      source={MASCOT}
      style={{ width: size, height: size * MASCOT_RATIO }}
      contentFit="contain"
      // Bundled artwork — a fade would read as a loading glitch.
      transition={0}
      accessibilityLabel="Unolingo"
    />
  );

  if (!plate) return <View style={style}>{art}</View>;

  return (
    <View
      style={[
        styles.plate,
        {
          width: size * PLATE_SCALE,
          height: size * PLATE_SCALE,
          backgroundColor: theme.tintSoft,
          borderColor: theme.highlight,
        },
        style,
      ]}>
      {art}
    </View>
  );
}

/** Enough ring around the artwork that the raised paw does not touch the edge. */
const PLATE_SCALE = 1.28;

const styles = StyleSheet.create({
  plate: {
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
