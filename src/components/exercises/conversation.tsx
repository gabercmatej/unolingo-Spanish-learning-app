import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SpeakIcon } from '@/components/exercises/audio-button';
import { Avatar } from '@/components/ui/avatar';
import { AccentRow } from '@/components/exercises/accent-row';
import type { ExerciseViewProps } from '@/components/exercises/shared';
import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ConversationExercise } from '@/learning/exercise';

/**
 * A conversation turn, rendered as a chat. Guided mode offers replies to
 * choose between (including one that is grammatical but not what a Spaniard
 * would say); free mode gives a text box and optional hints. The session
 * decides which, based on how solid the underlying concepts are.
 */
export function ConversationView({
  exercise,
  answer,
  onAnswer,
  result,
  settings,
  onSubmit,
}: ExerciseViewProps<ConversationExercise>) {
  const theme = useTheme();
  const locked = result !== null;
  const guided = !!exercise.options;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (guided) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [exercise.id, guided]);

  const selected = answer === null ? -1 : Number.parseInt(answer, 10);

  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <View style={[styles.sceneIcon, { backgroundColor: theme.conversationSoft }]}>
          <Icon name={exercise.scene.icon} size={22} tone={theme.conversation} />
        </View>
        <View style={styles.flex}>
          <Text variant="subheading">{exercise.scene.title}</Text>
          <Text variant="caption" color="textSecondary">
            {exercise.scene.setting}
          </Text>
        </View>
      </View>

      <View style={styles.chat}>
        {exercise.history.map((line, index) => (
          <View
            key={index}
            style={[styles.bubbleRow, line.speaker === 'you' && styles.bubbleRowMine]}>
            {line.speaker === 'partner' ? (
              <Avatar name={exercise.scene.partner.name} size={28} />
            ) : null}
            <View
              style={[
                styles.bubble,
                line.speaker === 'you'
                  ? { backgroundColor: theme.tint, borderBottomRightRadius: Radius.xs }
                  : { backgroundColor: theme.backgroundSunken, borderBottomLeftRadius: Radius.xs },
              ]}>
              <View style={styles.bubbleTop}>
                <Text
                  variant="esSmall"
                  tone={line.speaker === 'you' ? theme.onTint : theme.text}
                  style={styles.flex}>
                  {line.es}
                </Text>
                {line.speaker === 'partner' ? <SpeakIcon text={line.es} /> : null}
              </View>
              {line.en && settings.showTranslations ? (
                <Text
                  variant="caption"
                  tone={line.speaker === 'you' ? theme.onTint : theme.textTertiary}>
                  {line.en}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.task, { backgroundColor: theme.accentSoft }]}>
        <Icon name="chatbubble-ellipses-outline" size={16} tone={theme.accentText} />
        <Text variant="smallBold" tone={theme.accentText} style={styles.flex}>
          {exercise.instruction}
        </Text>
      </View>

      {guided ? (
        <View style={styles.options}>
          {exercise.options!.map((option, index) => {
            const isSelected = selected === index;
            let border = theme.border;
            let background = theme.backgroundElement;

            if (locked && option.natural) {
              border = theme.success;
              background = theme.successSoft;
            } else if (locked && isSelected) {
              border = theme.danger;
              background = theme.dangerSoft;
            } else if (isSelected) {
              // Ink, not brand — see the note in choice.tsx.
              border = theme.text;
              background = theme.backgroundSelected;
            }

            return (
              <PressScale
                key={index}
                disabled={locked}
                scaleTo={0.98}
                accessibilityLabel={option.text}
                onPress={() => {
                  onAnswer(String(index));
                  onSubmit?.();
                }}>
                <Animated.View
                  entering={FadeInUp.delay(index * 40).duration(220)}
                  style={[styles.option, { borderColor: border, backgroundColor: background }]}>
                  <Text variant="bodyBold">{option.text}</Text>
                  {option.sub ? (
                    <Text variant="small" color="textSecondary">
                      {option.sub}
                    </Text>
                  ) : null}
                </Animated.View>
              </PressScale>
            );
          })}
        </View>
      ) : (
        <>
          <TextInput
            ref={inputRef}
            value={answer ?? ''}
            onChangeText={(text) => onAnswer(text.length > 0 ? text : null)}
            editable={!locked}
            placeholder="Escribe tu respuesta"
            placeholderTextColor={theme.textTertiary}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardAppearance={theme.background === '#151215' ? 'dark' : 'light'}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => onSubmit?.()}
            style={[
              styles.input,
              {
                borderColor: locked
                  ? result.grade === 'incorrect'
                    ? theme.danger
                    : theme.success
                  : theme.borderStrong,
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                fontFamily: Fonts.sans,
              },
            ]}
          />
          {!locked ? (
            <AccentRow value={answer ?? ''} onChange={(next) => onAnswer(next.length > 0 ? next : null)} />
          ) : null}
          {!locked && exercise.hints && exercise.hints.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
              <View style={styles.hintRow}>
                {exercise.hints.map((hint, index) => (
                  <PressScale
                    key={`${hint}-${index}`}
                    scaleTo={0.92}
                    onPress={() =>
                      onAnswer(`${answer ?? ''}${answer ? ' ' : ''}${hint}`)
                    }>
                    <View style={[styles.hint, { backgroundColor: theme.backgroundSunken }]}>
                      <Text variant="small" color="textSecondary">
                        {hint}
                      </Text>
                    </View>
                  </PressScale>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  sceneIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chat: { gap: Spacing.three },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '86%', padding: Spacing.three, borderRadius: Radius.lg, gap: 2 },
  bubbleTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  options: { gap: Spacing.three },
  option: { gap: 2, padding: Spacing.four, borderRadius: Radius.md, borderWidth: 2 },
  input: {
    minHeight: 88,
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.four,
    fontSize: Type.body.fontSize,
    lineHeight: Type.body.lineHeight,
    textAlignVertical: 'top',
  },
  hintRow: { flexDirection: 'row', gap: Spacing.two },
  hint: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
  },
});
