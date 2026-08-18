import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AccentRow } from '@/components/exercises/accent-row';
import { AudioButton } from '@/components/exercises/audio-button';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TypedExercise } from '@/learning/exercise';

/**
 * Free typing: translation both ways, dictation, fill-the-gap, correct the
 * mistake and open-ended responses.
 */
export function TypedView({
  exercise,
  answer,
  onAnswer,
  result,
  settings,
  onSubmit,
}: ExerciseViewProps<TypedExercise>) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const locked = result !== null;
  const value = answer ?? '';

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [exercise.id]);

  const borderColor = locked
    ? result.grade === 'incorrect'
      ? theme.danger
      : theme.success
    : theme.borderStrong;

  return (
    <View style={styles.stack}>
      <Text variant="smallBold" color="textSecondary">
        {exercise.instruction}
      </Text>

      {exercise.audio ? (
        <View style={styles.audio}>
          <AudioButton
            text={exercise.audio.text}
            autoPlay={exercise.audio.hideText}
            defaultSlow={settings.slowAudioDefault}
          />
        </View>
      ) : null}

      {exercise.prompt ? (
        <View style={styles.promptBlock}>
          <Text variant={exercise.promptIsSpanish ? 'es' : 'subheading'}>{exercise.prompt}</Text>
          {exercise.promptSub && settings.showTranslations ? (
            <Text variant="small" color="textSecondary">
              {exercise.promptSub}
            </Text>
          ) : null}
        </View>
      ) : null}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onAnswer(text.length > 0 ? text : null)}
        editable={!locked}
        placeholder={exercise.placeholder}
        placeholderTextColor={theme.textTertiary}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardAppearance={theme.background === '#151215' ? 'dark' : 'light'}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={() => onSubmit?.()}
        accessibilityLabel={exercise.instruction}
        style={[
          styles.input,
          {
            borderColor,
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            fontFamily: Fonts.sans,
          },
        ]}
      />

      {!locked && exercise.language === 'es' ? (
        <AccentRow value={value} onChange={(next) => onAnswer(next)} />
      ) : null}

      {!locked && exercise.hints && exercise.hints.length > 0 ? (
        <View style={styles.hints}>
          <Text variant="caption" color="textTertiary">
            Hints
          </Text>
          <View style={styles.hintRow}>
            {exercise.hints.map((hint, index) => (
              <PressScale
                key={`${hint}-${index}`}
                onPress={() => onAnswer(`${value}${value.length > 0 ? ' ' : ''}${hint}`)}
                scaleTo={0.92}>
                <View
                  style={[
                    styles.hint,
                    { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft },
                  ]}>
                  <Text variant="small" tone={theme.accentText}>
                    {hint}
                  </Text>
                </View>
              </PressScale>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.four },
  audio: { alignItems: 'center', paddingVertical: Spacing.three },
  promptBlock: { gap: Spacing.one },
  input: {
    minHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.four,
    fontSize: Type.body.fontSize,
    lineHeight: Type.body.lineHeight,
    textAlignVertical: 'top',
  },
  hints: { gap: Spacing.two },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  hint: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
