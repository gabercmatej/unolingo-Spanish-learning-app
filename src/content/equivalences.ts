/**
 * English wordings that mean the same thing here.
 *
 * Translating into English is a *comprehension* check. The learner is
 * demonstrating that they understood the Spanish, and refusing "pleased to meet
 * you" because the author happened to write "nice to meet you" teaches nothing
 * about Spanish — it teaches that the app has a preferred synonym. The
 * canonical wording is still shown afterwards, so precision is taught without
 * comprehension being failed.
 *
 * Two levels, because English equivalence works at two levels. `good`/`well` is
 * a word swap. "Nice to meet you" against "a pleasure to meet you" is not — no
 * word-level mapping relates them, and only the phrase as a unit does.
 *
 * This is data, not policy. `answer-check.ts` consults it and decides nothing
 * here; `content/` holds no logic.
 *
 * **Two rules when extending.** A word may appear in exactly one class, or the
 * mapping becomes order-dependent. And no class may contain a negation word —
 * `not`, `never`, `nobody` — because that would let polarity be swapped for a
 * synonym and defeat the guard that stops "I don't like coffee" being accepted
 * as "I like coffee". Both are held by tests.
 */

/** Interchangeable single words. First member is the class representative. */
export const EN_WORD_CLASSES: string[][] = [
  ['good', 'well', 'fine', 'great', 'nice', 'lovely', 'pleasant', 'wonderful'],
  ['pleased', 'delighted', 'glad', 'happy'],
  ['hello', 'hi', 'hey'],
  ['goodbye', 'bye'],
  ['film', 'movie', 'movies', 'films'],
  ['apartment', 'flat'],
  ['mother', 'mum', 'mom'],
  ['father', 'dad'],
  ['picture', 'photo', 'photograph'],
  ['money', 'cash'],
  ['friend', 'mate', 'buddy', 'pal'],
  ['man', 'guy', 'bloke'],
  ['child', 'kid', 'kids', 'children'],
  // 'would like' stays out on purpose. It is the polite conditional register
  // (quisiera / me gustaría / querría), not the direct present 'want' teaches
  // (quiero) — the course draws that contrast deliberately (p.quisiera glosses
  // exactly "I would like…", and s.a27's note calls out "the conditional is the
  // polite, hypothetical 'would like'"). Merging them would let "I want" pass
  // for a concept taught specifically as the polite form: a mood error, not a
  // wording one. It also could not have matched here regardless — it is a
  // two-word string sitting in a class the word map looks up per token.
  ['want', 'wanna'],
  ['car', 'automobile'],
  ['metro', 'underground', 'subway', 'tube'],
  ['check', 'bill'],
  ['vacation', 'holiday', 'holidays'],
  ['fall', 'autumn'],
  ['elevator', 'lift'],
  ['line', 'queue'],
  ['sofa', 'couch'],
  ['rubbish', 'trash', 'garbage'],
  ['beer', 'lager'],
  ['starter', 'appetiser', 'appetizer'],
  ['pavement', 'sidewalk'],
  ['petrol', 'gas', 'gasoline'],
  ['tired', 'exhausted'],
  ['begin', 'start'],
  ['speak', 'talk'],
  ['buy', 'purchase'],
  ['quick', 'fast'],
  ['big', 'large'],
  ['small', 'little'],
];

/**
 * Whole phrases that render the same Spanish. Written already normalised:
 * lower case, no punctuation, single spaces.
 */
export const EN_PHRASE_GROUPS: string[][] = [
  [
    'nice to meet you',
    'pleased to meet you',
    'delighted to meet you',
    'lovely to meet you',
    'good to meet you',
    'great to meet you',
    'a pleasure to meet you',
    'pleasure to meet you',
    'nice meeting you',
    'how do you do',
  ],
  ['how are you', 'how are things', 'how is it going', 'how goes it', 'hows everything'],
  ['see you later', 'see you soon', 'see you', 'catch you later'],
  // 'not at all' stays out of this group. The other members are idiomatically
  // positive despite their surface negation, consistently — but "not at all"
  // is also the plain English rendering of "para nada" answering a yes/no
  // question ("¿Te gusta?" -> "Not at all"), a literal negative-degree answer,
  // not courtesy (see conversations.ts's "Qué va" note, and the five "para
  // nada" sentences in the corpus). Phrase groups match as whole strings, so
  // keeping it here would let "my pleasure" pass for an answer that means the
  // opposite. No sentence's canonical English is exactly "not at all" today —
  // this is latent, not live — but the invariant is meaning over convenience.
  ['you are welcome', 'no problem', 'my pleasure', 'dont mention it'],
  ['excuse me', 'pardon me', 'sorry to bother you'],
  ['i am sorry', 'sorry', 'my apologies'],
  ['of course', 'sure', 'certainly', 'absolutely'],
  ['what is your name', 'whats your name', 'what are you called'],
  ['my name is', 'i am called', 'i go by'],
  ['where are you from', 'whereabouts are you from'],
  ['how much is it', 'how much does it cost', 'what does it cost', 'how much'],
  ['the bill please', 'the check please', 'can i have the bill', 'can i have the check'],
  ['i do not know', 'i have no idea', 'no idea'],
  ['it does not matter', 'it doesnt matter', 'never mind', 'no matter'],
  ['right now', 'at the moment', 'just now'],
  ['a little', 'a bit', 'a little bit'],
];

interface Equivalences {
  /** Lower-case word to the representative of its class. */
  word: ReadonlyMap<string, string>;
  /** Normalised multi-word phrase to the representative of its group. */
  phrase: ReadonlyMap<string, string>;
}

function buildWordMap(): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const group of EN_WORD_CLASSES) {
    const representative = group[0];
    for (const word of group) map.set(word, representative);
  }
  return map;
}

function buildPhraseMap(): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const group of EN_PHRASE_GROUPS) {
    const representative = group[0];
    for (const phrase of group) map.set(phrase, representative);
  }
  return map;
}

export const EN_EQUIVALENCES: Equivalences = {
  word: buildWordMap(),
  phrase: buildPhraseMap(),
};
