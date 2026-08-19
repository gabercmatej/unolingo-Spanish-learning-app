import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { LevelHero, RankJourney } from '@/components/profile/level-card';
import { Standing } from '@/components/profile/standing';
import { AvatarButton } from '@/components/profile/learner-avatar';
import { Card } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm';
import { Icon, type IconName } from '@/components/ui/icon';
import { Divider, Section, Stat, StatGrid } from '@/components/ui/layout';
import { PressScale } from '@/components/ui/press-scale';
import { ProgressBar } from '@/components/ui/progress';
import { Screen } from '@/components/ui/screen';
import { Reveal, stagger, usePop } from '@/components/ui/motion';
import { Segmented } from '@/components/ui/segmented';
import { SkeletonRows } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { STATE_VERSION, useLearner } from '@/context/LearnerContext';
import { useTheme } from '@/hooks/use-theme';
import { achievements, achievementsByGroup, type AchievementTier } from '@/learning/achievements';
import {
  backupFilename,
  buildBackup,
  compareForRestore,
  parseBackup,
  stateFromBackup,
} from '@/learning/backup';
import { curriculumLevel, estimateProficiency, wordsMastered } from '@/learning/mastery';
import { rankProgress } from '@/learning/ranks';
import type { Appearance, DailyGoal } from '@/learning/types';
import { buildDiagnostics } from '@/learning/diagnostics';
import { pickBackupFile, saveBackupFile } from '@/lib/backup-file';
import { environment } from '@/lib/environment';
import { currentStreak } from '@/lib/date';
import { listSnapshots, type Snapshot } from '@/lib/snapshots';
import { configureSound, sound } from '@/lib/sound';
import {
  availableSpanishVoices,
  primeSpanishVoice,
  setPreferredVoice,
  speakSpanish,
  type SpanishVoice,
} from '@/lib/speech';

const GOALS: { value: DailyGoal; label: string; caption: string }[] = [
  { value: 5, label: 'Casual', caption: '5 min' },
  { value: 10, label: 'Normal', caption: '10 min' },
  { value: 20, label: 'Serious', caption: '20 min' },
  { value: 30, label: 'Intense', caption: '30 min' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { learner, settings, updateSettings, resetProgress, restoreState } = useLearner();
  const confirm = useConfirm();
  const [name, setName] = useState(settings.name);

  const [showAllBadges, setShowAllBadges] = useState(false);
  const badges = useMemo(() => achievements(learner), [learner]);
  const groups = useMemo(() => achievementsByGroup(learner), [learner]);
  const unlocked = badges.filter((badge) => badge.unlocked);

  const [voices, setVoices] = useState<SpanishVoice[]>([]);
  /**
   * Tracked separately from `voices.length`, because an empty list is two
   * different facts. "Still asking the OS" and "this device has no Spanish
   * voice installed" both render as zero rows, and only one of them should
   * show a placeholder — conflating them is how a slow lookup ends up looking
   * like a device that cannot speak Spanish.
   */
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    primeSpanishVoice().then(() => {
      if (cancelled) return;
      setVoices(availableSpanishVoices());
      setVoicesLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const progress = useMemo(() => rankProgress(learner.xp), [learner.xp]);
  const streak = currentStreak(learner.lastStudyDate, learner.streak);
  const lessonsDone = Object.keys(learner.completedLessons).length;
  const mastered = useMemo(() => wordsMastered(learner), [learner]);
  const proficiency = useMemo(() => estimateProficiency(learner), [learner]);
  const courseLevel = useMemo(() => curriculumLevel(learner), [learner]);

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [backupNote, setBackupNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSnapshots().then((found) => {
      if (!cancelled) setSnapshots(found);
    });
    return () => {
      cancelled = true;
    };
  }, [learner]);

  const exportBackup = async () => {
    const backup = buildBackup(learner);
    const result = await saveBackupFile(JSON.stringify(backup, null, 2), backupFilename());
    if (!result.ok) {
      setBackupNote(`Could not save the backup: ${result.reason}`);
      return;
    }
    /**
     * The two outcomes are different promises and are worded as such. A file
     * handed to the share sheet is off the device; a file written to the app's
     * own folder is not, and survives an update but not an uninstall — which is
     * the exact event a backup exists for.
     */
    setBackupNote(
      result.shared
        ? `Exported ${describeSummary(backup.summary)}. Keep it somewhere off this device.`
        : `Saved ${describeSummary(backup.summary)} inside the app’s folder — this copy does not survive deleting Unolingo.`,
    );
  };

  const exportDiagnostics = async () => {
    const report = buildDiagnostics(learner, environment);
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const result = await saveBackupFile(report, `unolingo-diagnostics-${stamp}.txt`);
    setBackupNote(
      result.ok ? 'Diagnostics report exported.' : `Could not export it: ${result.reason}`,
    );
  };

  /**
   * Restore is the one irreversible-feeling action in the app, so it says out
   * loud what is being swapped for what — and refuses quietly to do nothing when
   * the file turns out not to be a backup at all.
   */
  const importBackup = async () => {
    const picked = await pickBackupFile();
    if (!picked.ok) {
      if (!picked.canceled) setBackupNote(picked.reason);
      return;
    }

    const parsed = parseBackup(picked.text, STATE_VERSION);
    if (!parsed.ok) {
      setBackupNote(parsed.reason);
      return;
    }

    const comparison = compareForRestore(parsed.file.state, learner);
    const ok = await confirm({
      title: 'Restore this backup?',
      message: comparison.losing
        ? `The backup has ${describeSummary(comparison.incoming)}. You currently have ${describeSummary(comparison.current)} — restoring gives up ${comparison.xpLost.toLocaleString('en-GB')} XP. A snapshot of what you have now is taken first.`
        : `The backup has ${describeSummary(comparison.incoming)}. It replaces what is on this device. A snapshot of what you have now is taken first.`,
      confirmLabel: 'Restore',
      destructive: comparison.losing,
    });
    if (!ok) return;

    await restoreState(stateFromBackup(parsed.file, settings));
    setBackupNote(`Restored ${describeSummary(parsed.file.summary)}.`);
  };

  const restoreSnapshot = async (snapshot: Snapshot) => {
    const ok = await confirm({
      title: 'Go back to this snapshot?',
      message: `It has ${describeSummary(snapshot.summary)}, from ${formatWhen(snapshot.at)}. What you have now is snapshotted first, so this is undoable.`,
      confirmLabel: 'Go back',
      destructive: true,
    });
    if (!ok) return;
    await restoreState(snapshot.state);
    setBackupNote(`Went back to the snapshot from ${formatWhen(snapshot.at)}.`);
  };

  const confirmReset = async () => {
    const ok = await confirm({
      title: 'Reset all progress?',
      message:
        'This erases every word, mistake, streak and lesson you have completed. Your settings are kept. It cannot be undone.',
      confirmLabel: 'Erase everything',
      destructive: true,
    });
    if (ok) {
      resetProgress();
      router.replace('/(tabs)');
    }
  };

  /**
   * A retake is a normal push, and nothing changes until the new test finishes.
   * Backing out has to leave the existing placement exactly as it was.
   */
  const startRetake = () => {
    router.push({ pathname: '/onboarding', params: { retake: '1' } });
  };

  return (
    <Screen title="Profile" subtitle="Settings, achievements and your account of yourself">
      <Card>
        <View style={styles.identity}>
          <AvatarButton
            uri={settings.avatarUri}
            rank={progress.rank}
            size={76}
            onChange={(avatarUri) => updateSettings({ avatarUri })}
          />
          <View style={styles.flex}>
            <Text variant="heading" rounded numberOfLines={1}>
              {settings.name || 'Learner'}
            </Text>
            {/* Three different measures, never conflated — see the "Where you
                stand" section below, which is where they get room to disagree. */}
            <Text variant="small" color="textSecondary">
              {progress.rank.name} · Spanish around {proficiency.level}
              {proficiency.plus ? '+' : ''}
            </Text>
          </View>
        </View>
        <LevelHero progress={progress} />
      </Card>

      <Section
        title="Where you stand"
        caption="Finishing a stage and speaking at that level are separate claims, and this is allowed to say so.">
        <Card variant="flat">
          <Standing rank={progress.rank} curriculum={courseLevel} proficiency={proficiency} />
        </Card>
      </Section>

      {/* Two rows of two rather than one wrapping grid: four tiles wrap to 3 + 1
          at phone widths, which reads as a layout accident. */}
      <Section title="Your numbers">
        <View style={styles.statRows}>
          <StatGrid>
            <Stat
              value={learner.xp.toLocaleString('en-GB')}
              label="Lifetime XP"
              icon="flash"
              tone={theme.accent}
            />
            <Stat value={`${streak}`} label="Day streak" icon="flame" tone={theme.tint} />
          </StatGrid>
          <StatGrid>
            <Stat
              value={`${lessonsDone}`}
              label="Lessons"
              icon="school"
              tone={theme.conversation}
            />
            <Stat
              value={`${mastered}`}
              label="Words mastered"
              icon="book"
              tone={theme.listening}
            />
          </StatGrid>
        </View>
      </Section>

      <Section
        title="Rank journey"
        caption="Ranks track the distance you have walked — your CEFR level tracks how good your Spanish is.">
        <Card variant="flat" padding="four">
          <RankJourney level={progress.level} />
        </Card>
      </Section>

      <Section
        title="Achievements"
        caption={`${unlocked.length} of ${badges.length} unlocked`}
        action={{
          label: showAllBadges ? 'Show less' : 'Show all',
          onPress: () => setShowAllBadges((value) => !value),
        }}>
        <View style={styles.groups}>
          {groups.map((group) => {
            // Collapsed view shows what's in reach: unlocked, plus the next one
            // to aim for in each family.
            const items = showAllBadges
              ? group.items
              : [
                  ...group.items.filter((item) => item.unlocked).slice(-2),
                  ...group.items.filter((item) => !item.unlocked).slice(0, 2),
                ];
            if (items.length === 0) return null;

            return (
              <View key={group.group} style={styles.group}>
                <Text variant="smallBold" color="textSecondary">
                  {group.label}
                </Text>
                <View style={styles.badges}>
                  {items.map((badge, index) => (
                    <BadgeTile key={badge.id} badge={badge} index={index} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="Daily goal" caption="A target, never a limit — you can always keep going">
        <View style={styles.goals}>
          {GOALS.map((goal) => {
            const active = settings.dailyGoal === goal.value;
            return (
              <PressScale
                key={goal.value}
                onPress={() => updateSettings({ dailyGoal: goal.value })}
                scaleTo={0.95}
                style={styles.flex}
                accessibilityLabel={`${goal.label}, ${goal.caption}`}
                accessibilityState={{ selected: active }}>
                <View
                  style={[
                    styles.goal,
                    {
                      backgroundColor: active ? theme.tintSoft : theme.backgroundElement,
                      borderColor: active ? theme.tint : theme.border,
                    },
                  ]}>
                  <Text variant="smallBold" tone={active ? theme.tintText : theme.text}>
                    {goal.label}
                  </Text>
                  <Text variant="caption" color="textTertiary">
                    {goal.caption}
                  </Text>
                </View>
              </PressScale>
            );
          })}
        </View>
      </Section>

      <Section title="Learning">
        <Card variant="flat" padding="four">
          <SettingSwitch
            label="Hard mode"
            caption="Removes word banks and hints, and prefers free production"
            value={settings.hardMode}
            onChange={(hardMode) => updateSettings({ hardMode })}
          />
          <Divider />
          <SettingSwitch
            label="Strict accent checking"
            caption="Off: missing accents are accepted with a reminder"
            value={settings.strictAccents}
            onChange={(strictAccents) => updateSettings({ strictAccents })}
          />
          <Divider />
          <SettingSwitch
            label="Show English translations"
            caption="Turn off for more immersion"
            value={settings.showTranslations}
            onChange={(showTranslations) => updateSettings({ showTranslations })}
          />
          <Divider />
          <SettingSwitch
            label="Speaking exercises"
            caption="Include say-it-aloud prompts"
            value={settings.speakingExercises}
            onChange={(speakingExercises) => updateSettings({ speakingExercises })}
          />
        </Card>
      </Section>

      <Section title="Audio and feedback">
        <Card variant="flat" padding="four">
          <SettingSwitch
            label="Speak answers aloud"
            caption="Plays the Spanish after you answer correctly"
            value={settings.autoPlayAudio}
            onChange={(autoPlayAudio) => updateSettings({ autoPlayAudio })}
          />
          <Divider />
          <SettingSwitch
            label="Slow audio by default"
            caption="Start listening exercises at reduced speed"
            value={settings.slowAudioDefault}
            onChange={(slowAudioDefault) => updateSettings({ slowAudioDefault })}
          />
          <Divider />
          <SettingSwitch
            label="Haptics"
            caption="Vibration feedback on answers"
            value={settings.haptics}
            onChange={(haptics) => updateSettings({ haptics })}
          />
          <Divider />
          <SettingSwitch
            label="Sound effects"
            caption="Short cues on answers, levels and unlocks — never over your music"
            value={settings.sounds}
            onChange={(sounds) => {
              updateSettings({ sounds });
              // Configured on the next render by the provider, so this preview
              // has to go through the module directly — and a toggle that says
              // "sound effects" while making no sound is a toggle you have to
              // go and test somewhere else.
              if (sounds) {
                configureSound({ sounds: true });
                sound.correct();
              }
            }}
          />
        </Card>
      </Section>

      {!voicesLoaded || voices.length > 0 ? (
        <Section
          title="Spanish voice"
          caption="Voice quality varies by device — pick the one that sounds best to you">
          <Card variant="flat" padding="four">
            {!voicesLoaded ? <SkeletonRows count={3} /> : null}
            <View style={styles.voiceList}>
              {voices.slice(0, 6).map((voice) => {
                const active = (settings.voiceId ?? voices[0]?.id) === voice.id;
                return (
                  <PressScale
                    key={voice.id}
                    onPress={() => {
                      updateSettings({ voiceId: voice.id });
                      setPreferredVoice(voice.id);
                      speakSpanish('Hola, ¿qué tal? Vamos a aprender español.');
                    }}
                    scaleTo={0.98}
                    accessibilityLabel={`Use ${voice.name}`}
                    accessibilityState={{ selected: active }}>
                    <View
                      style={[
                        styles.voiceRow,
                        {
                          borderColor: active ? theme.tint : theme.border,
                          backgroundColor: active ? theme.tintSoft : 'transparent',
                        },
                      ]}>
                      <Icon
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        tone={active ? theme.tint : theme.textTertiary}
                      />
                      <View style={styles.flex}>
                        <Text variant="small" numberOfLines={1}>
                          {voice.name}
                        </Text>
                        <Text variant="caption" color="textTertiary">
                          {voice.castilian ? '🇪🇸 Castilian' : voice.language}
                        </Text>
                      </View>
                      <Icon name="play-circle-outline" size={20} tone={theme.listening} />
                    </View>
                  </PressScale>
                );
              })}
            </View>
            {voicesLoaded ? (
              <Text variant="caption" color="textTertiary">
                Tap any voice to hear a sample. On iOS and macOS, downloading the “enhanced” or
                “premium” Spanish voice in system settings makes a large difference.
              </Text>
            ) : null}
          </Card>
        </Section>
      ) : null}

      <Section title="Appearance">
        <Segmented
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={settings.appearance}
          onChange={(appearance: Appearance) => updateSettings({ appearance })}
        />
      </Section>

      <Section title="Your name">
        <Card variant="flat" padding="four">
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => updateSettings({ name: name.trim() })}
            placeholder="What should the app call you?"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => updateSettings({ name: name.trim() })}
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text, fontFamily: Fonts.sans },
            ]}
          />
        </Card>
      </Section>

      <Section
        title="Your progress"
        caption="Everything lives on this device. That is fine until the device is not around, so keep a copy somewhere else.">
        <Card variant="flat" padding="none">
          <ActionRow
            icon="download-outline"
            label="Export a backup"
            caption={`${describeSummary(buildBackup(learner).summary)} as a file`}
            onPress={exportBackup}
          />
          <Divider />
          <ActionRow
            icon="cloud-upload-outline"
            label="Restore from a backup"
            caption="Replaces what is on this device — you are shown both first"
            onPress={importBackup}
          />
          {snapshots.map((snapshot) => (
            <View key={snapshot.at}>
              <Divider />
              <ActionRow
                icon="time-outline"
                label={`Snapshot · ${formatWhen(snapshot.at)}`}
                caption={describeSummary(snapshot.summary)}
                onPress={() => restoreSnapshot(snapshot)}
              />
            </View>
          ))}
        </Card>
        {backupNote ? (
          <Text variant="caption" color="textSecondary">
            {backupNote}
          </Text>
        ) : (
          <Text variant="caption" color="textTertiary">
            Unolingo keeps up to three automatic snapshots, taken twice a day and before
            anything destructive.
          </Text>
        )}
      </Section>

      <Section
        title="About"
        caption="Version and a diagnostics report, for when something behaves oddly">
        <Card variant="flat" padding="none">
          {/* `padding="none"` so the dividers and the pressable rows below can
              run edge to edge — which means every *non*-pressable row in here
              has to supply the inset itself. `settingRow` does not, because in
              every other section it sits inside a padded card. */}
          <View style={styles.settingRowInset}>
            <View style={styles.flex}>
              <Text>Version</Text>
              <Text variant="caption" color="textSecondary" numeric>
                {environment.appVersion} ({environment.buildVersion}) · {environment.platform}{' '}
                {environment.osVersion}
              </Text>
            </View>
          </View>
          <Divider />
          <View style={styles.settingRowInset}>
            <View style={styles.flex}>
              <Text>Developer mode</Text>
              <Text variant="caption" color="textSecondary">
                Adds a “why am I seeing this?” panel under every exercise
              </Text>
            </View>
            <Toggle
              value={settings.developerMode ?? false}
              onValueChange={(developerMode) => updateSettings({ developerMode })}
            />
          </View>
          <Divider />
          <ActionRow
            icon="clipboard-outline"
            label="Export a diagnostics report"
            caption="Counts, versions and the state of the adaptive layer — no personal data"
            onPress={exportDiagnostics}
          />
        </Card>
      </Section>

      <Section title="Course">
        <Card variant="flat" padding="none">
          <ActionRow
            icon="compass-outline"
            label="Take the placement test again"
            caption={
              learner.placement
                ? `Placed at ${learner.placement.label}`
                : 'You skipped it the first time'
            }
            onPress={startRetake}
          />
          <Divider />
          <ActionRow
            icon="reader-outline"
            label="Mistake notebook"
            caption={`${learner.mistakes.filter((m) => !m.resolvedAt).length} still open`}
            onPress={() => router.push('/mistakes')}
          />
          <Divider />
          <ActionRow
            icon="trash-outline"
            label="Reset all progress"
            caption="Erases everything except settings"
            tone={theme.danger}
            onPress={confirmReset}
          />
        </Card>
      </Section>

      <Text variant="caption" color="textTertiary" center>
        Unolingo · Peninsular Spanish · offline, no account, no limits
      </Text>
    </Screen>
  );
}

/** "12,400 XP · 412 words · 38 lessons" — the same phrase everywhere it is needed. */
function describeSummary(summary: { xp: number; concepts: number; lessons: number }): string {
  return `${summary.xp.toLocaleString('en-GB')} XP · ${summary.concepts} words · ${summary.lessons} lessons`;
}

function formatWhen(at: number): string {
  return new Date(at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Tier colours: bronze → platinum reads as increasing rarity, not decoration. */
function tierColor(tier: AchievementTier, theme: ReturnType<typeof useTheme>): string {
  switch (tier) {
    case 'bronze':
      return theme.warning;
    case 'silver':
      return theme.textSecondary;
    case 'gold':
      return theme.accent;
    case 'platinum':
      return theme.grammar;
  }
}

function tierSoft(tier: AchievementTier, theme: ReturnType<typeof useTheme>): string {
  switch (tier) {
    case 'bronze':
      return theme.warningSoft;
    case 'silver':
      return theme.backgroundSunken;
    case 'gold':
      return theme.accentSoft;
    case 'platinum':
      return theme.grammarSoft;
  }
}

/**
 * One achievement tile.
 *
 * Its own component so it can hold `usePop`, which fires when `unlocked` flips
 * under it — the Profile re-renders on every learner change, so a badge earned
 * in the session you just closed marks itself the moment you arrive here. It
 * cannot fire on mount, so a wall of already-earned badges stays still.
 *
 * The progress bar on a locked badge is the more useful half of this: it turns
 * "not yet" into "three more", which is the difference between a list of things
 * you have not done and a list of things you could.
 */
function BadgeTile({
  badge,
  index,
}: {
  badge: ReturnType<typeof achievements>[number];
  index: number;
}) {
  const theme = useTheme();
  const pop = usePop(badge.unlocked, { scale: 1.12 });

  return (
    // The sizing lives on the `Reveal`, not on the tile inside it.
    // `styles.badges` is a wrapping flex row, so whichever element is its
    // *direct child* has to carry the width — and wrapping the tile in an
    // animation wrapper quietly made that the wrapper. Without this the tiles
    // shrink to their text and the grid collapses into slivers.
    <Reveal delay={stagger(index)} style={styles.badgeSlot}>
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: badge.unlocked
              ? tierSoft(badge.tier, theme)
              : theme.backgroundElement,
            borderColor: badge.unlocked ? tierColor(badge.tier, theme) : theme.border,
          },
          pop,
        ]}>
        <View
          style={[
            styles.badgeIcon,
            {
              backgroundColor: badge.unlocked
                ? tierColor(badge.tier, theme)
                : theme.backgroundSunken,
            },
          ]}>
          <Icon
            name={badge.icon as IconName}
            size={16}
            tone={badge.unlocked ? theme.onTint : theme.textTertiary}
          />
        </View>
        <Text variant="caption" center numberOfLines={2}>
          {badge.title}
        </Text>
        {badge.unlocked ? (
          <Text variant="caption" tone={tierColor(badge.tier, theme)}>
            {badge.tier}
          </Text>
        ) : (
          <View style={styles.badgeProgress}>
            <ProgressBar
              value={badge.target > 0 ? badge.progress / badge.target : 0}
              height={3}
              tone={theme.textTertiary}
              delay={stagger(index)}
            />
            <Text variant="caption" color="textTertiary">
              {badge.progress}/{badge.target}
            </Text>
          </View>
        )}
      </Animated.View>
    </Reveal>
  );
}

function SettingSwitch({
  label,
  caption,
  value,
  onChange,
}: {
  label: string;
  caption: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.flex}>
        <Text variant="small">{label}</Text>
        <Text variant="caption" color="textTertiary">
          {caption}
        </Text>
      </View>
      <Toggle value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  caption,
  tone,
  onPress,
}: {
  icon: IconName;
  label: string;
  caption: string;
  tone?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressScale onPress={onPress} scaleTo={0.99} accessibilityLabel={label}>
      <View style={styles.actionRow}>
        <Icon name={icon} size={20} tone={tone ?? theme.textSecondary} />
        <View style={styles.flex}>
          <Text variant="small" tone={tone}>
            {label}
          </Text>
          <Text variant="caption" color="textTertiary">
            {caption}
          </Text>
        </View>
        <Icon name="chevron-forward" size={16} color="textTertiary" />
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  statRows: { gap: Spacing.three },
  groups: { gap: Spacing.four },
  group: { gap: Spacing.two },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badgeIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeProgress: { width: '100%', gap: 2, alignItems: 'center' },
  voiceList: { gap: Spacing.two },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  badgeSlot: { width: '30%', flexGrow: 1 },
  badge: {
    width: '100%',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 96,
    justifyContent: 'center',
  },
  locked: { opacity: 0.35 },
  goals: { flexDirection: 'row', gap: Spacing.two },
  goal: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  // Same row, for a card that supplies no padding of its own. The inset matches
  // `actionRow` below so the two line up down the left edge of the same card.
  settingRowInset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontSize: Type.body.fontSize,
    minHeight: 48,
  },
});
