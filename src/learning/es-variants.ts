/**
 * Spanish sentences that are the same sentence.
 *
 * Derived, not authored. `altEs` exists for genuinely different phrasings an
 * author chose; these three are the ones the language produces mechanically,
 * where refusing the learner's version would be refusing correct Spanish
 * because the author happened to type the other one.
 *
 *   al ≡ a el        del ≡ de el        quiero verte ≡ te quiero ver
 *
 * Clitic climbing is the one with any risk in it, so it is gated hard: the
 * second token must end in a real infinitive ending with a clitic attached, and
 * the clitic must be one of the eight that exist. It cannot fire on "busco un
 * lugar" — nothing is attached to `lugar` — which is the case that would
 * otherwise make this rule dangerous.
 *
 * Input and output are both `normalize`d text: lower case, no punctuation,
 * single spaces.
 */

const CLITICS = ['me', 'te', 'se', 'nos', 'os', 'lo', 'la', 'le', 'los', 'las', 'les'];

/**
 * Particles that link a conjugated verb to the infinitive it governs in a
 * periphrasis — "voy A comprarlo", "acabo DE verlo", "tengo QUE hacerlo". The
 * clitic climbs past the link to sit before the conjugated verb, not before
 * the link itself: "lo voy a comprar", never "voy lo a comprar".
 */
const PERIPHRASIS_LINKS = new Set(['a', 'de', 'que', 'en']);

/** The longest clitic attached to the end of this word, or null. */
function attachedClitic(word: string): { stem: string; clitic: string } | null {
  for (const clitic of [...CLITICS].sort((a, b) => b.length - a.length)) {
    if (!word.endsWith(clitic)) continue;
    const stem = word.slice(0, -clitic.length);
    if (isInfinitive(stem)) return { stem, clitic };
  }
  return null;
}

function isInfinitive(word: string): boolean {
  // Short enough to be an ending rather than a verb is not a verb — but "ver"
  // and "dar" are genuine three-letter infinitives, so the floor is 3, not 4.
  if (word.length < 3) return false;
  return word.endsWith('ar') || word.endsWith('er') || word.endsWith('ir');
}

function contractions(text: string): string[] {
  const out: string[] = [];
  if (/\bal\b/.test(text)) out.push(text.replace(/\bal\b/g, 'a el'));
  if (/\ba el\b/.test(text)) out.push(text.replace(/\ba el\b/g, 'al'));
  if (/\bdel\b/.test(text)) out.push(text.replace(/\bdel\b/g, 'de el'));
  if (/\bde el\b/.test(text)) out.push(text.replace(/\bde el\b/g, 'del'));
  return out;
}

/** `quiero verte` → `te quiero ver`, and the reverse. */
function cliticMovement(text: string): string[] {
  const words = text.split(' ');
  const out: string[] = [];

  for (let i = 0; i + 1 < words.length; i += 1) {
    const attached = attachedClitic(words[i + 1]);
    if (!attached) continue;
    // The token before the infinitive must look like a conjugated verb, not a
    // preposition — "a comprarlo" is not a climb, "voy a comprarlo" is. When
    // it *is* a link, the real conjugated verb sits one word further back and
    // the clitic climbs past the link to reach it.
    const isLink = i > 0 && PERIPHRASIS_LINKS.has(words[i]);
    const verbIndex = isLink ? i - 1 : i;
    const before = words.slice(0, verbIndex);
    const climbed = [
      ...before,
      attached.clitic,
      ...words.slice(verbIndex, i + 1),
      attached.stem,
      ...words.slice(i + 2),
    ];
    out.push(climbed.join(' '));
  }

  for (let i = 0; i < words.length; i += 1) {
    if (!CLITICS.includes(words[i])) continue;
    // Find the infinitive this clitic climbed off, and put it back.
    for (let j = i + 1; j < words.length; j += 1) {
      if (!isInfinitive(words[j])) continue;
      const lowered = [
        ...words.slice(0, i),
        ...words.slice(i + 1, j),
        `${words[j]}${words[i]}`,
        ...words.slice(j + 1),
      ];
      out.push(lowered.join(' '));
      break;
    }
  }

  return out;
}

export function spanishVariants(normalized: string): string[] {
  const seen = new Set<string>([normalized]);
  const queue = [normalized];

  // One round of each rule against the original, plus contractions applied to
  // anything clitic movement produced. Two rounds is enough for every pattern
  // that occurs; iterating to a fixed point would only add cost.
  for (const text of [...queue]) {
    for (const variant of [...contractions(text), ...cliticMovement(text)]) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      queue.push(variant);
    }
  }
  for (const text of queue.slice(1)) {
    for (const variant of contractions(text)) seen.add(variant);
  }

  return [...seen];
}
