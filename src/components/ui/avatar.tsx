import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Speaker avatar: an initial in a tinted circle, with the tint derived from the
 * name so the same character keeps the same colour throughout a conversation.
 *
 * Emoji faces were the obvious shortcut here, but they clash with the app's
 * single icon vocabulary and read as decoration. Initials are how every serious
 * product does this.
 */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const theme = useTheme();

  const palette = [theme.tint, theme.grammar, theme.listening, theme.conversation, theme.story];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const tone = palette[hash % palette.length];

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: Radius.full, backgroundColor: tone },
      ]}
      accessibilityLabel={name}>
      <Text
        variant={size >= 34 ? 'smallBold' : 'caption'}
        tone={theme.onTint}
        style={styles.initial}>
        {name.trim().slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initial: { includeFontPadding: false },
});
