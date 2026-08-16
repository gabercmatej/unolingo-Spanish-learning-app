import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { speakSpanish, stopSpeaking } from '@/lib/speech';

interface AudioButtonProps {
  text: string;
  /** Plays once on mount — used when the exercise is audio-first. */
  autoPlay?: boolean;
  size?: 'lg' | 'sm';
  defaultSlow?: boolean;
}

/**
 * The listening control. Large primary button for normal speed, with a
 * secondary slow-playback button beside it — slow is always available but
 * deliberately never the default, so it stays a crutch rather than a habit.
 */
export function AudioButton({ text, autoPlay, size = 'lg', defaultSlow }: AudioButtonProps) {
  const theme = useTheme();
  const [playing, setPlaying] = useState<'normal' | 'slow' | null>(null);
  const pulse = useSharedValue(1);
  const played = useRef(false);

  const play = (speed: 'normal' | 'slow') => {
    setPlaying(speed);
    speakSpanish(text, { speed, onDone: () => setPlaying(null) });
  };

  useEffect(() => {
    if (!autoPlay || played.current) return;
    played.current = true;
    const timer = setTimeout(() => play(defaultSlow ? 'slow' : 'normal'), 260);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (playing) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: Motion.base }),
          withTiming(1, { duration: Motion.base }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: Motion.fast });
    }
  }, [playing, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const diameter = size === 'lg' ? 96 : 56;

  return (
    <View style={styles.row}>
      <Animated.View style={pulseStyle}>
        <PressScale
          onPress={() => play('normal')}
          haptic="press"
          accessibilityLabel="Play audio"
          style={[
            styles.main,
            {
              width: diameter,
              height: diameter,
              borderRadius: Radius.lg,
              backgroundColor: theme.listening,
            },
          ]}>
          <Icon name="volume-high" size={size === 'lg' ? 40 : 24} tone="#FFFFFF" />
        </PressScale>
      </Animated.View>

      <PressScale
        onPress={() => play('slow')}
        haptic="tap"
        accessibilityLabel="Play slowly"
        style={[
          styles.slow,
          { backgroundColor: theme.listeningSoft, borderColor: theme.listening },
        ]}>
        <Icon name="hourglass-outline" size={16} tone={theme.listening} />
        <Text variant="caption" tone={theme.listening}>
          Slow
        </Text>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  main: { alignItems: 'center', justifyContent: 'center' },
  slow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});

/** Small inline speaker for word cards and lists. */
export function SpeakIcon({ text, tone }: { text: string; tone?: string }) {
  const theme = useTheme();
  return (
    <PressScale
      onPress={() => speakSpanish(text)}
      scaleTo={0.9}
      accessibilityLabel={`Listen to ${text}`}
      style={[styles.slow, { borderColor: 'transparent', backgroundColor: theme.backgroundSunken }]}>
      <Icon name="volume-medium-outline" size={16} tone={tone ?? theme.listening} />
    </PressScale>
  );
}
