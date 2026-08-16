import * as Speech from 'expo-speech';

/**
 * Peninsular Spanish audio.
 *
 * Every listening exercise goes through `speakSpanish`, so the source of audio
 * is a single seam: swapping in recorded native-speaker clips later means
 * changing this file only. On-device TTS is used today because it is offline,
 * free, instant for any new content, and available in `es-ES` everywhere.
 *
 * Voice quality varies enormously by platform — the difference between a
 * device's default compact voice and its neural one is the difference between
 * "robot" and "person". So rather than take whatever comes first, we rank the
 * available voices and let the learner override the choice in Settings.
 */

export const SPANISH_LOCALE = 'es-ES';

export type SpeechSpeed = 'normal' | 'slow';

/** Tuned by ear: platform default reads a touch fast and clipped for a learner. */
const RATE: Record<SpeechSpeed, number> = { normal: 0.96, slow: 0.62 };

export interface SpanishVoice {
  id: string;
  name: string;
  language: string;
  /** True for the Castilian voices — the ones this course wants. */
  castilian: boolean;
  /** Our quality guess, used for ordering and for the default pick. */
  rank: number;
}

let voices: SpanishVoice[] = [];
let preferredVoice: string | undefined;
let overrideVoice: string | undefined;
let lookupPromise: Promise<void> | null = null;

/**
 * Higher is better. Neural / enhanced / premium voices are dramatically better
 * than the compact defaults, and on the web the Google voices beat the OS ones.
 */
function rankVoice(name: string, identifier: string, language: string): number {
  const haystack = `${name} ${identifier}`.toLowerCase();
  let score = 0;

  const lang = language.toLowerCase().replace('_', '-');
  if (lang === 'es-es') score += 40;
  else if (lang.startsWith('es')) score += 5;

  if (/neural|premium|enhanced/.test(haystack)) score += 30;
  if (/google/.test(haystack)) score += 22;
  if (/siri/.test(haystack)) score += 18;
  // Named Castilian voices, best-known first.
  if (/m[oó]nica/.test(haystack)) score += 12;
  if (/marisol|elvira|laia|dario|dar[ií]o/.test(haystack)) score += 10;
  if (/compact|eloquence/.test(haystack)) score -= 25;
  // Latin-American voices are a last resort for an es-ES course.
  if (/paulina|juan|jorge|penelope|pen[eé]lope|lupe/.test(haystack)) score -= 8;

  return score;
}

/** Loads and ranks the device's Spanish voices. Safe to call repeatedly. */
export async function primeSpanishVoice(): Promise<void> {
  if (lookupPromise) return lookupPromise;

  lookupPromise = (async () => {
    try {
      const available = await Speech.getAvailableVoicesAsync();
      voices = available
        .filter((voice) => voice.language?.toLowerCase().startsWith('es'))
        .map((voice) => {
          const language = voice.language ?? '';
          const name = voice.name ?? voice.identifier ?? 'Spanish';
          return {
            id: voice.identifier,
            name,
            language,
            castilian: language.toLowerCase().replace('_', '-').startsWith('es-es'),
            rank: rankVoice(name, voice.identifier ?? '', language),
          };
        })
        .sort((a, b) => b.rank - a.rank);

      preferredVoice = voices[0]?.id;
    } catch {
      voices = [];
      preferredVoice = undefined;
    }
  })();

  return lookupPromise;
}

/** Voices the learner can choose between in Settings. */
export function availableSpanishVoices(): SpanishVoice[] {
  return voices;
}

/** Overrides the automatic pick. Pass undefined to go back to automatic. */
export function setPreferredVoice(voiceId: string | undefined): void {
  overrideVoice = voiceId;
}

function activeVoice(): string | undefined {
  if (overrideVoice && voices.some((voice) => voice.id === overrideVoice)) return overrideVoice;
  return preferredVoice;
}

export interface SpeakOptions {
  speed?: SpeechSpeed;
  onDone?: () => void;
  onStart?: () => void;
}

export function speakSpanish(text: string, options: SpeakOptions = {}): void {
  const { speed = 'normal', onDone, onStart } = options;
  Speech.stop();
  Speech.speak(stripForSpeech(text), {
    language: SPANISH_LOCALE,
    voice: activeVoice(),
    rate: RATE[speed],
    pitch: 1.0,
    onStart,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}

/**
 * Blanks used in exercises ("Yo ___ un perro") and bracketed stage directions
 * must not be read out loud.
 */
function stripForSpeech(text: string): string {
  return text
    .replace(/_{2,}/g, ' … ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
