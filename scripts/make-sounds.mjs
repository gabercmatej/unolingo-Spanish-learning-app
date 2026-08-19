/**
 * Generates Unolingo's UI sound cues as small mono WAV files.
 *
 * These are synthesised rather than sourced so they are licence-free, tiny, and
 * — the actual reason — *tunable*. A sound cue is a design token like any other:
 * when the "correct" chime turns out to be a semitone too bright, the fix should
 * be editing a number here and re-running, not hunting for a replacement clip
 * that happens to sit right next to five others in timbre.
 *
 *   node scripts/make-sounds.mjs
 *
 * House style, so the five read as one family:
 *   - A major is home. Every cue is built from A / C# / E, so they stack without
 *     clashing when two fire close together (a correct answer that also
 *     completes a lesson).
 *   - Bell-like, not beepy: a fundamental with two quiet harmonics and a second
 *     voice detuned by a few cents. A bare sine reads as an error tone.
 *   - Short. The longest is the level-up at ~1.2s; nothing else passes 700ms.
 *   - Down means "not quite", never "wrong". The incorrect cue is the only one
 *     that descends, and it is the quietest of the five.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'audio');

/** Equal temperament from A4 = 440. */
const note = (semitonesFromA4) => 440 * 2 ** (semitonesFromA4 / 12);
const A4 = note(0);
const CS5 = note(4);
const E5 = note(7);
const A5 = note(12);
const CS6 = note(16);
const E6 = note(19);
const E3 = note(-29);
const G3 = note(-26);

/**
 * One struck tone. `decay` is the exponential time constant, so the tail is
 * always the same shape and only its length changes between cues.
 */
function tone(buffer, { at, freq, gain, decay, attack = 0.006, detune = 0.004 }) {
  const start = Math.floor(at * RATE);
  // Four time constants is inaudible; going further only bloats the file.
  const length = Math.floor(decay * 4 * RATE);

  for (let i = 0; i < length; i += 1) {
    const index = start + i;
    if (index >= buffer.length) break;
    const t = i / RATE;

    const envelope =
      (t < attack ? t / attack : Math.exp(-(t - attack) / decay)) * gain;

    const voice = (f) =>
      Math.sin(2 * Math.PI * f * t) +
      0.25 * Math.sin(2 * Math.PI * f * 2 * t) +
      0.07 * Math.sin(2 * Math.PI * f * 3 * t);

    // The detuned copy is what stops it sounding like a test tone.
    buffer[index] += envelope * (voice(freq) + 0.35 * voice(freq * (1 + detune)));
  }
}

function render(seconds, voices) {
  const buffer = new Float32Array(Math.ceil(seconds * RATE));
  voices.forEach((voice) => tone(buffer, voice));

  // Normalise to a consistent headroom, then soft-clip: two cues that fire
  // together must not sum into distortion.
  let peak = 0;
  for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
  const scale = peak > 0 ? 0.72 / peak : 0;

  const out = Buffer.alloc(buffer.length * 2);
  const fade = Math.floor(0.008 * RATE);
  for (let i = 0; i < buffer.length; i += 1) {
    let sample = Math.tanh(buffer[i] * scale * 1.15);
    // Ramp the last few ms to zero — a truncated tail clicks on every platform.
    if (i > buffer.length - fade) sample *= (buffer.length - i) / fade;
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), i * 2);
  }
  return out;
}

function wav(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const CUES = {
  /** Answered correctly. Two notes up, over almost before you notice it. */
  correct: render(0.42, [
    { at: 0, freq: E5, gain: 0.9, decay: 0.075 },
    { at: 0.065, freq: A5, gain: 1, decay: 0.11 },
  ]),

  /**
   * Answered wrongly. Low, soft and short — a wrong answer is information, and
   * the cue that reports it should not be the loudest thing in the app.
   */
  incorrect: render(0.42, [
    { at: 0, freq: G3, gain: 0.5, decay: 0.06, attack: 0.012 },
    { at: 0.075, freq: E3, gain: 0.45, decay: 0.085, attack: 0.012 },
  ]),

  /** A lesson or session finished. The full triad, arpeggiated then held. */
  complete: render(0.95, [
    { at: 0, freq: A4, gain: 0.8, decay: 0.09 },
    { at: 0.075, freq: CS5, gain: 0.85, decay: 0.09 },
    { at: 0.15, freq: E5, gain: 0.9, decay: 0.1 },
    { at: 0.225, freq: A5, gain: 1, decay: 0.22 },
    { at: 0.225, freq: E5, gain: 0.4, decay: 0.24 },
  ]),

  /**
   * A level crossed. The only cue allowed a tail: it is the one moment that
   * happens *to* the learner rather than being something they asked for.
   */
  levelUp: render(1.5, [
    { at: 0, freq: A4, gain: 0.7, decay: 0.07 },
    { at: 0.06, freq: CS5, gain: 0.75, decay: 0.07 },
    { at: 0.12, freq: E5, gain: 0.8, decay: 0.08 },
    { at: 0.18, freq: A5, gain: 0.95, decay: 0.1 },
    { at: 0.26, freq: CS6, gain: 0.8, decay: 0.12 },
    { at: 0.32, freq: E6, gain: 1, decay: 0.3 },
    // The chord underneath is what makes it land rather than just stop.
    { at: 0.32, freq: A5, gain: 0.55, decay: 0.34 },
    { at: 0.32, freq: E5, gain: 0.35, decay: 0.36 },
  ]),

  /** An achievement. Bell-like and high, distinct from the level fanfare. */
  unlock: render(0.8, [
    { at: 0, freq: E6, gain: 0.85, decay: 0.14 },
    { at: 0.09, freq: CS6, gain: 0.7, decay: 0.16 },
    { at: 0.09, freq: A5, gain: 0.5, decay: 0.18 },
  ]),
};

mkdirSync(OUT, { recursive: true });
for (const [name, pcm] of Object.entries(CUES)) {
  const file = join(OUT, `${name}.wav`);
  writeFileSync(file, wav(pcm));
  console.log(`${name}.wav  ${(wav(pcm).length / 1024).toFixed(1)} KB`);
}
