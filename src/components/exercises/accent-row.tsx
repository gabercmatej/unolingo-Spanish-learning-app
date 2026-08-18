import { ScrollView, StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The row of Spanish characters a phone keyboard buries behind a long press.
 *
 * It is the difference between typing Spanish on a phone and not bothering, so
 * it belongs on *every* input that takes a Spanish answer — it lived only on the
 * typed exercises for a while, which left conversation and build-a-response, the
 * two hardest and most valuable production kinds, as the two with no way to
 * reach á or ñ.
 *
 * Tapping "á" upgrades a trailing "a" rather than appending, so you type
 * normally and fix the accent as you go.
 */
const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

const BASE: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ñ: 'n',
  ü: 'u',
};

export function accentAppend(value: string, character: string): string {
  const base = BASE[character];
  const last = value.slice(-1).toLowerCase();
  if (base && last === base) {
    const wasUpper = value.slice(-1) !== last;
    return value.slice(0, -1) + (wasUpper ? character.toUpperCase() : character);
  }
  return value + character;
}

export function AccentRow({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
      <View style={styles.row}>
        {ACCENTS.map((character) => (
          <PressScale
            key={character}
            onPress={() => onChange(accentAppend(value, character))}
            scaleTo={0.88}
            accessibilityLabel={`Insert ${character}`}>
            <View
              style={[
                styles.key,
                { backgroundColor: theme.backgroundSunken, borderColor: theme.border },
              ]}>
              <Text variant="bodyBold">{character}</Text>
            </View>
          </PressScale>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.one },
  key: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
