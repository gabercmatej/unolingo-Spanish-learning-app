import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioButton } from '@/components/exercises/audio-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm';
import { Icon } from '@/components/ui/icon';
import { Logo } from '@/components/ui/logo';
import { Pill } from '@/components/ui/pill';
import { Burst, Reveal, stagger, useEntrancePop } from '@/components/ui/motion';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Fonts, MaxContentWidth, Radius, Spacing, Type } from '@/constants/theme';
import type { PlacementQuestion } from '@/content/placement';
import { useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { checkAnswer } from '@/learning/answer-check';
import {
  adjustAbility,
  nextPlacementQuestion,
  PLACEMENT_LENGTH,
  scorePlacement,
  type PlacementAnswer,
  type PlacementScore,
} from '@/learning/placement';
import { feedback } from '@/lib/feedback';
import { goBack } from '@/lib/navigation';
import { sound } from '@/lib/sound';

type Phase = 'welcome' | 'test' | 'result';

/**
 * First launch.
 *
 * The placement test starts at A1 and follows the learner up or down after each
 * answer, so someone who already knows the basics reaches B1 material in a few
 * questions instead of being made to prove they know "hola". Skipping is always
 * available — the learner model catches up either way.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { updateSettings, finishPlacement, skipPlacement, settings } = useLearner();
  const confirm = useConfirm();

  /**
   * First run is a gate — there is nowhere to go until a level is set. A retake
   * is not: it is opened from Profile and must be abandonable without touching
   * the existing placement.
   */
  const { retake } = useLocalSearchParams<{ retake?: string }>();
  const isRetake = retake === '1';

  const [phase, setPhase] = useState<Phase>('welcome');
  const [name, setName] = useState(settings.name);

  /** Continuous CEFR position, 0 = A0 … 6 = C2. Converges as the test runs. */
  const [ability, setAbility] = useState(1.2);
  const [asked, setAsked] = useState<string[]>([]);
  const [question, setQuestion] = useState<PlacementQuestion | null>(null);
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState<PlacementScore | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  /**
   * Declared up here with every other hook rather than beside the result markup
   * it belongs to — the three phases are early returns, so a hook called inside
   * one of them would run on some renders and not others.
   */
  const levelPop = useEntrancePop(180, 0.45);

  const beginTest = useCallback(() => {
    if (name.trim()) updateSettings({ name: name.trim() });
    const first = nextPlacementQuestion([], 1.2, []);
    setQuestion(first);
    setAsked(first ? [first.id] : []);
    setPhase('test');
  }, [name, updateSettings]);

  /** Advances the test with a known outcome. Shared by "Continue" and "Skip". */
  const record = useCallback(
    (correct: boolean) => {
      if (!question) return;

      if (correct) feedback.correct();
      else feedback.incorrect();

      const nextAnswers = [...answers, { question, correct }];
      setAnswers(nextAnswers);

      const nextAbility = adjustAbility(ability, correct, nextAnswers.length);
      setAbility(nextAbility);
      setChoice(null);
      setTyped('');

      if (nextAnswers.length >= PLACEMENT_LENGTH) {
        setScore(scorePlacement(nextAnswers));
        setPhase('result');
        return;
      }

      const following = nextPlacementQuestion(asked, nextAbility, nextAnswers);
      if (!following) {
        setScore(scorePlacement(nextAnswers));
        setPhase('result');
        return;
      }
      setAsked((prev) => [...prev, following.id]);
      setQuestion(following);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    },
    [ability, answers, asked, question],
  );

  const submit = useCallback(() => {
    if (!question) return;

    if (question.form === 'typed') {
      if (typed.trim().length === 0) return;
      record(checkAnswer(typed, question.accepted ?? [], { language: 'es' }).grade !== 'incorrect');
      return;
    }

    if (choice === null) return;
    record(choice === question.answer);
  }, [choice, question, record, typed]);

  /** Explicitly not knowing is a valid, informative answer. */
  const skipQuestion = useCallback(() => record(false), [record]);

  useEffect(() => {
    if (phase !== 'result' || !score) return;
    feedback.celebrate();
    // `complete` rather than `levelUp`: finishing the placement is the end of a
    // piece of work, not a level crossed. The fanfare belongs to the first time
    // the learner earns one.
    sound.complete();
  }, [phase, score]);

  const finish = () => {
    if (score) finishPlacement(score, answers);
    router.replace('/(tabs)');
  };

  const skip = () => {
    if (name.trim()) updateSettings({ name: name.trim() });
    skipPlacement();
    router.replace('/(tabs)');
  };

  /** Leaves a retake without changing anything. Confirms once answers exist. */
  const exitRetake = async () => {
    if (answers.length > 0) {
      const leave = await confirm({
        title: 'Stop the retake?',
        message: 'Your current level and progress stay exactly as they are.',
        confirmLabel: 'Stop',
        cancelLabel: 'Keep going',
      });
      if (!leave) return;
    }
    goBack();
  };

  // --- Welcome --------------------------------------------------------------
  if (phase === 'welcome') {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.seven, paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(420)} style={styles.column}>
            {/* The mascot greets you on first run — it is the one screen where
                the app introduces itself. A retake is not a brand moment, so it
                gets a smaller one. */}
            <Logo size={isRetake ? 72 : 148} style={styles.mark} />

            <Text variant="display" rounded>
              {isRetake ? 'Retake the test' : 'Unolingo'}
            </Text>
            <Text variant="subheading" color="textSecondary">
              {isRetake
                ? 'Nothing changes unless you finish it. You can stop at any point.'
                : 'Spanish from Spain — taught properly, and worth opening every day.'}
            </Text>

            <View style={styles.pills}>
              <Pill label="🇪🇸 es-ES" tone={theme.tintText} background={theme.tintSoft} size="md" />
              <Pill label="vosotros included" size="md" />
              <Pill label="no hearts, no limits" size="md" />
            </View>

            {isRetake ? null : (
            <Card variant="flat">
              <Text variant="overline" color="textTertiary">
                WHAT SHOULD I CALL YOU?
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textTertiary}
                autoCapitalize="words"
                returnKeyType="done"
                style={[
                  styles.nameInput,
                  { borderColor: theme.border, color: theme.text, fontFamily: Fonts.sans },
                ]}
              />
            </Card>
            )}

            <Card variant="flat">
              <View style={styles.row}>
                <Icon name="compass-outline" size={20} tone={theme.tint} />
                <Text variant="bodyBold" style={styles.flex}>
                  {isRetake ? 'What a retake does' : 'Find your level first'}
                </Text>
              </View>
              <Text variant="small" color="textSecondary">
                {isRetake
                  ? 'Thirty adaptive questions. Your lessons, streak and vocabulary are untouched — only your estimated level and weak areas are updated, and only once you reach the end.'
                  : 'Thirty adaptive questions across vocabulary, grammar, listening and production. It narrows in on your real level and finds your weak areas, so you are not made to sit through what you already know. Around six minutes.'}
              </Text>
            </Card>

            <View style={styles.actions}>
              <Button
                title={isRetake ? 'Start the retake' : 'Take the placement test'}
                size="lg"
                onPress={beginTest}
              />
              {isRetake ? (
                <Button title="Not now" variant="ghost" onPress={exitRetake} />
              ) : (
                <Button title="Skip — start from the beginning" variant="ghost" onPress={skip} />
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // --- Result ---------------------------------------------------------------
  if (phase === 'result' && score) {
    return (
      <ScrollView
        style={[styles.flex, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.seven, paddingBottom: insets.bottom + Spacing.six },
        ]}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.column}>
          <Text variant="smallBold" color="textTertiary">
            Estimated level
          </Text>
          {/* The result of the test is the only thing on this screen the learner
              came for, so it is the only thing that gets a celebration. The
              breakdown below it is evidence, and evidence should sit still. */}
          <View style={styles.levelStage}>
            <Burst tones={[theme.tint, theme.accent]} radius={90} />
            <Animated.View style={levelPop}>
              <Text variant="display" rounded tone={theme.tint}>
                {score.label}
              </Text>
            </Animated.View>
          </View>
          <Text variant="body" color="textSecondary">
            {describeLevel(score.label)}
          </Text>
          <Text variant="caption" color="textTertiary">
            {score.correct} of {score.total} correct across {score.areas.length} skill areas
          </Text>

          {score.areas.length > 0 ? (
            <Card variant="flat">
              <Text variant="smallBold">How you did, by area</Text>
              {score.areas.map((area, index) => (
                <View key={area.area} style={styles.areaRow}>
                  <Text variant="small" style={styles.areaLabel} numberOfLines={1}>
                    {area.label}
                  </Text>
                  <View style={styles.areaBar}>
                    <ProgressBar
                      value={area.accuracy}
                      height={6}
                      tone={
                        area.accuracy >= 0.75
                          ? theme.success
                          : area.accuracy < 0.5
                            ? theme.danger
                            : theme.warning
                      }
                      delay={280 + stagger(index)}
                    />
                  </View>
                  <Text variant="caption" color="textTertiary" numeric style={styles.areaValue}>
                    {Math.round(area.accuracy * 100)}%
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          {score.strengths.length > 0 ? (
            <Card variant="flat">
              <View style={styles.row}>
                <Icon name="trending-up" size={18} tone={theme.success} />
                <Text variant="overline" tone={theme.success}>
                  STRONG
                </Text>
              </View>
              {score.strengths.map((item) => (
                <Text key={item} variant="small">
                  • {item}
                </Text>
              ))}
            </Card>
          ) : null}

          {score.weaknesses.length > 0 ? (
            <Card variant="flat">
              <View style={styles.row}>
                <Icon name="alert-circle-outline" size={18} tone={theme.danger} />
                <Text variant="overline" tone={theme.danger}>
                  NEEDS WORK
                </Text>
              </View>
              {score.weaknesses.map((item) => (
                <Text key={item} variant="small">
                  • {item}
                </Text>
              ))}
              <Text variant="caption" color="textTertiary">
                These start due for review, so your first sessions will target them.
              </Text>
            </Card>
          ) : null}

          <Button title="Start learning" size="lg" onPress={finish} />
        </Animated.View>
      </ScrollView>
    );
  }

  // --- Test -----------------------------------------------------------------
  if (!question) return null;

  const canSubmit = question.form === 'typed' ? typed.trim().length > 0 : choice !== null;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.testHeader, { paddingTop: insets.top + Spacing.three }]}>
        {isRetake ? (
          <PressScale onPress={exitRetake} scaleTo={0.9} accessibilityLabel="Stop the retake">
            <Icon name="close" size={24} color="textSecondary" />
          </PressScale>
        ) : null}
        <View style={styles.flex}>
          <ProgressBar value={answers.length / PLACEMENT_LENGTH} height={10} tone={theme.tint} />
        </View>
        <Text variant="caption" color="textTertiary" numeric>
          {answers.length + 1}/{PLACEMENT_LENGTH}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: Spacing.seven }]}
        keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(220)} key={question.id} style={styles.column}>
          <Pill label={question.level} tone={theme.textSecondary} />

          {question.form === 'listen' && question.audio ? (
            <View style={styles.audio}>
              <AudioButton text={question.audio} autoPlay />
            </View>
          ) : null}

          <Text variant={question.form === 'listen' ? 'subheading' : 'es'}>{question.prompt}</Text>
          {question.promptSub ? (
            <Text variant="small" color="textSecondary">
              {question.promptSub}
            </Text>
          ) : null}

          {question.form === 'typed' ? (
            <TextInput
              value={typed}
              onChangeText={setTyped}
              placeholder="Escribe en español"
              placeholderTextColor={theme.textTertiary}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  borderColor: theme.borderStrong,
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  fontFamily: Fonts.sans,
                },
              ]}
            />
          ) : (
            <View style={styles.options}>
              {(question.options ?? []).map((option, index) => {
                const selected = choice === index;
                return (
                  <Reveal key={option} delay={stagger(index)}>
                    <PressScale
                      onPress={() => setChoice(index)}
                      scaleTo={0.98}
                      hover="lift"
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={option}>
                      <View
                        style={[
                          styles.option,
                          {
                            borderColor: selected ? theme.text : theme.border,
                            backgroundColor: selected
                              ? theme.backgroundSelected
                              : theme.backgroundElement,
                          },
                        ]}>
                        <Text variant="bodyBold">{option}</Text>
                      </View>
                    </PressScale>
                  </Reveal>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.four,
            borderTopColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        <View style={styles.column}>
          <Button title="Continue" size="lg" disabled={!canSubmit} onPress={submit} />
          <Button title="I don’t know this one" variant="ghost" onPress={skipQuestion} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function describeLevel(label: string): string {
  if (label.startsWith('A0')) return 'Right at the start — we will build the foundations properly.';
  if (label.startsWith('A1'))
    return 'You have the basics. Time to turn isolated words into real sentences.';
  if (label.startsWith('A2'))
    return 'You can handle everyday situations. Next: the past, and sounding natural.';
  if (label.startsWith('B1'))
    return 'Solid ground. We will push into nuance, storytelling and the subjunctive.';
  return 'Strong already — expect production, idiom and real Spain Spanish.';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, alignItems: 'center' },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.four },
  mark: { alignSelf: 'flex-start' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  actions: { gap: Spacing.two, paddingTop: Spacing.two },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontSize: Type.body.fontSize,
    minHeight: 48,
  },
  levelStage: { alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 26 },
  areaLabel: { width: 132 },
  areaBar: { flex: 1, minWidth: 0 },
  areaValue: { width: 38, textAlign: 'right' },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  audio: { alignItems: 'center', paddingVertical: Spacing.three },
  options: { gap: Spacing.three },
  option: { padding: Spacing.four, borderRadius: Radius.md, borderWidth: 2, minHeight: 56, justifyContent: 'center' },
  input: {
    minHeight: 88,
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.four,
    fontSize: Type.body.fontSize,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
