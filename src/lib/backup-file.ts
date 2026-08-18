import { Platform } from 'react-native';

/**
 * Getting a backup out of the app and back into it.
 *
 * Two platforms, two completely different mechanisms, one interface — because
 * the screen that offers "Export" should not have to know which one it is
 * talking to. On web this is a Blob download and a file input; on iOS and
 * Android it is `expo-file-system`, which since SDK 57 carries its own system
 * file picker, plus `expo-sharing` for the way out.
 *
 * The way out is the part that matters. Writing to the app's document directory
 * is not a backup: that directory survives an app update and does not survive
 * an uninstall, so the one event a backup exists for — losing or replacing the
 * phone — is precisely the one it does not cover. Staging the file in the cache
 * and handing it to the system share sheet puts it somewhere that outlives the
 * app: Files, iCloud Drive, Drive, AirDrop, an email to yourself.
 *
 * Everything returns a result object rather than throwing. A failed export is a
 * sentence to show the learner, not a crash in the middle of the one screen
 * whose entire purpose is reassurance.
 */

export type SaveResult =
  | { ok: true; where: string; shared: boolean }
  | { ok: false; reason: string; canceled?: boolean };

export type LoadResult =
  | { ok: true; text: string; name: string }
  | { ok: false; reason: string; canceled?: boolean };

const isWeb = Platform.OS === 'web';

export async function saveBackupFile(text: string, filename: string): Promise<SaveResult> {
  if (isWeb) return saveOnWeb(text, filename);

  try {
    const { File, Paths } = await import('expo-file-system');
    const Sharing = await import('expo-sharing');

    /**
     * The cache, not the documents directory. This copy is a staging post on the
     * way to the share sheet, not the backup itself — the backup is wherever the
     * learner chooses to put it. Leaving it in documents would accumulate a
     * folder of stale exports that look like safety and are not.
     */
    const file = new File(Paths.cache, filename);
    if (file.exists) file.delete();
    file.create();
    file.write(text);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: 'Save your Unolingo backup',
      });
      return { ok: true, where: filename, shared: true };
    }

    /**
     * No share sheet available. Fall back to the documents directory and say so
     * plainly, because "saved" and "saved somewhere an uninstall will erase" are
     * different promises and the learner is entitled to know which one they got.
     */
    const kept = new File(Paths.document, filename);
    if (kept.exists) kept.delete();
    kept.create();
    kept.write(text);
    return { ok: true, where: kept.uri, shared: false };
  } catch (err) {
    return { ok: false, reason: describe(err) };
  }
}

export async function pickBackupFile(): Promise<LoadResult> {
  if (isWeb) return pickOnWeb();

  try {
    const { File } = await import('expo-file-system');
    const picked = await File.pickFileAsync({ mimeTypes: ['application/json'] });
    if (picked.canceled || !picked.result) return { ok: false, reason: 'No file chosen.', canceled: true };
    return { ok: true, text: await picked.result.text(), name: picked.result.uri };
  } catch (err) {
    return { ok: false, reason: describe(err) };
  }
}

// --- Web -------------------------------------------------------------------

function saveOnWeb(text: string, filename: string): SaveResult {
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking immediately can cancel the download in Safari; one tick is enough.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true, where: filename, shared: true };
  } catch (err) {
    return { ok: false, reason: describe(err) };
  }
}

function pickOnWeb(): Promise<LoadResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    /**
     * Browsers fire no event when the picker is dismissed, so a promise that
     * only settles on `change` hangs forever on cancel. `focus` on the window
     * comes back either way; a short delay lets a real `change` win the race.
     */
    let settled = false;
    const finish = (result: LoadResult) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('focus', onFocus);
      input.remove();
      resolve(result);
    };
    const onFocus = () => {
      setTimeout(() => finish({ ok: false, reason: 'No file chosen.', canceled: true }), 500);
    };

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return finish({ ok: false, reason: 'No file chosen.', canceled: true });
      try {
        finish({ ok: true, text: await file.text(), name: file.name });
      } catch (err) {
        finish({ ok: false, reason: describe(err) });
      }
    });

    document.body.appendChild(input);
    window.addEventListener('focus', onFocus);
    input.click();
  });
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong with the file.';
}
