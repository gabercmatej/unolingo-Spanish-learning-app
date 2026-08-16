import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PressScale } from '@/components/ui/press-scale';
import { Text } from '@/components/ui/text';
import { Elevation, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Rank } from '@/learning/ranks';

const PANDA = require('@/assets/images/brand/face.png');

/**
 * Stored avatars are re-encoded to this before being saved. The learner state is
 * a single AsyncStorage value, and Android caps one value at ~2MB — a raw
 * camera photo base64'd straight in would blow that and lose *all* progress, not
 * just the picture. 256px at 0.7 JPEG lands around 20KB.
 */
const AVATAR_PX = 256;
const AVATAR_QUALITY = 0.7;

/**
 * The learner's profile picture: the panda by default, a photo of their own if
 * they pick one. The ring is the rank and is not choosable — the face inside is
 * personal, the frame around it is earned.
 */
export function LearnerAvatar({
  uri,
  rank,
  size = 72,
}: {
  uri?: string;
  rank?: Rank;
  size?: number;
}) {
  const theme = useTheme();
  const ring = rank ? (theme[rank.tone] as string) : theme.border;
  const ringWidth = Math.max(2, Math.round(size * 0.045));
  const inner = size - ringWidth * 2 - 3;

  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderWidth: ringWidth, borderColor: ring },
      ]}>
      <View
        style={[
          styles.inner,
          { width: inner, height: inner, backgroundColor: theme.tintSoft },
        ]}>
        <Image
          source={uri ? { uri } : PANDA}
          style={{ width: inner, height: inner }}
          contentFit="cover"
          transition={0}
          alt=""
        />
      </View>
    </View>
  );
}

/** Tappable avatar that opens the photo chooser. */
export function AvatarButton({
  uri,
  rank,
  size = 76,
  onChange,
}: {
  uri?: string;
  rank?: Rank;
  size?: number;
  onChange: (uri: string | undefined) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Both sources funnel through here so the picked image is always cropped
   * square and shrunk before it reaches storage.
   */
  const pick = useCallback(
    async (source: 'camera' | 'library') => {
      setError(null);
      setBusy(true);
      try {
        const permission =
          source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setError(
            source === 'camera'
              ? 'Unolingo needs camera access to take a photo. You can turn it on in your device settings.'
              : 'Unolingo needs photo access to choose a picture. You can turn it on in your device settings.',
          );
          return;
        }

        const options: ImagePicker.ImagePickerOptions = {
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        };
        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.[0]) return;

        const context = ImageManipulator.manipulate(result.assets[0].uri);
        context.resize({ width: AVATAR_PX, height: AVATAR_PX });
        const rendered = await context.renderAsync();
        const saved = await rendered.saveAsync({
          format: SaveFormat.JPEG,
          compress: AVATAR_QUALITY,
          base64: true,
        });

        // Stored as a data URI so it survives across reloads and app updates
        // without depending on a cache path that the OS is free to clear.
        if (saved.base64) {
          onChange(`data:image/jpeg;base64,${saved.base64}`);
          setOpen(false);
        } else {
          setError('That image could not be read. Try another one.');
        }
      } catch {
        setError('Something went wrong picking that image. Try again.');
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  return (
    <>
      <PressScale
        onPress={() => {
          setError(null);
          setOpen(true);
        }}
        scaleTo={0.94}
        haptic="press"
        accessibilityLabel="Change your profile picture">
        <View>
          <LearnerAvatar uri={uri} rank={rank} size={size} />
          <View
            style={[
              styles.editBadge,
              { backgroundColor: theme.text, borderColor: theme.backgroundElement },
            ]}>
            <Icon name="camera" size={12} tone={theme.background} />
          </View>
        </View>
      </PressScale>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}>
        <Animated.View entering={FadeIn.duration(140)} style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Dismiss"
          />
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={[
              styles.sheet,
              { backgroundColor: theme.backgroundElement, shadowColor: theme.shadow },
              Elevation.raised,
            ]}>
            <Text variant="subheading">Profile picture</Text>

            {error ? (
              <Text variant="small" tone={theme.danger}>
                {error}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {/* Web has no real camera capture through the picker — offering it
                  there would open a file dialog labelled "take a photo". */}
              {Platform.OS === 'web' ? null : (
                <Button
                  title="Take a photo"
                  icon="camera"
                  loading={busy}
                  onPress={() => pick('camera')}
                />
              )}
              <Button
                title="Choose from gallery"
                icon="image"
                variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
                loading={busy}
                onPress={() => pick('library')}
              />
              {uri ? (
                <Button
                  title="Use the panda"
                  variant="ghost"
                  onPress={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                />
              ) : null}
              <Button title="Cancel" variant="ghost" onPress={() => setOpen(false)} />
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12,8,6,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth - 120,
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.lg,
  },
  actions: { gap: Spacing.two, paddingTop: Spacing.two },
});
