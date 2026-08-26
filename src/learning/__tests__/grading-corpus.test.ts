import { conversations, sentences } from '@/content';
import { accentCarriesMeaning } from '@/content/accent-pairs';
import { EN_EQUIVALENCES } from '@/content/equivalences';
import { checkAnswer } from '@/learning/answer-check';
import { COVERAGE_THRESHOLD, meaningCoverage } from '@/learning/meaning';

/**
 * The corpus, not a handful of remembered examples.
 *
 * Every prior test in this branch checks the grader against sentences someone
 * thought to write down. That only ever covers the cases someone remembered —
 * and every commit on this branch made the grader more permissive, which is
 * exactly the kind of change whose failure mode is silent: nothing throws,
 * every existing test stays green, and the app quietly starts accepting
 * answers that are wrong. So these two suites run over the whole corpus
 * instead of a sample of it, and they grow automatically as content is added.
 *
 * Two directions, both load-bearing:
 *   - self-consistency: the grader must accept the content it was calibrated
 *     against. A permissiveness layer that breaks the canonical answer is
 *     worse than no layer at all.
 *   - mutation: the grader must refuse the corpus's own sentences once a
 *     meaning-changing error has been mechanically introduced into them.
 */

const es = { language: 'es' as const, accentCarriesMeaning };
const en = { language: 'en' as const, equivalences: EN_EQUIVALENCES };

describe('the corpus grades itself', () => {
  it('accepts every authored Spanish answer against itself', () => {
    const failures = sentences
      .filter((s) => checkAnswer(s.es, [s.es, ...(s.altEs ?? [])], es).verdict === 'incorrect')
      .map((s) => `${s.id}: ${s.es}`);
    expect(failures).toEqual([]);
  });

  it('accepts every authored English answer against itself', () => {
    const failures = sentences
      .filter((s) => checkAnswer(s.en, [s.en, ...(s.altEn ?? [])], en).verdict === 'incorrect')
      .map((s) => `${s.id}: ${s.en}`);
    expect(failures).toEqual([]);
  });

  it('accepts every authored alternative, not merely the canonical one', () => {
    const failures: string[] = [];
    for (const s of sentences)
      for (const alt of s.altEs ?? [])
        if (checkAnswer(alt, [s.es, ...(s.altEs ?? [])], es).verdict === 'incorrect')
          failures.push(`${s.id}: ${alt}`);
    expect(failures).toEqual([]);
  });

  /**
   * There used to be a test here — "lets every free conversation turn be
   * answered with its own model" — computing, for each authored model,
   * `Math.max(...turn.accepted.map((m) => meaningCoverage(model, m)))` and
   * asserting the max cleared `COVERAGE_THRESHOLD`. It was structurally
   * vacuous, the same way the test below used to be before the rework
   * documented in the comment that follows: `turn.accepted` always contains
   * `model` itself, and `meaningCoverage(model, model)` is 1 by construction,
   * so the max is always ≥ 1 no matter whether `meaningCoverage` works at
   * all. Review proved it by fault-injecting a `meaningCoverage` that
   * returns 0 unless the two strings are identical — every other test in
   * this file caught that break; this one stayed green.
   *
   * It cannot be restated non-vacuously without changing what it measures:
   * keeping self in the comparison set is vacuous by construction, for
   * `checkAnswer` as much as for `meaningCoverage` directly, since a learner
   * typing exactly one of the authored models is comparing that text against
   * a candidate list that contains that exact text. Excluding self turns it
   * into "every model has a recognisable paraphrase among the turn's *other*
   * accepted answers" — which the next comment shows is false about this
   * corpus for a correct, documented reason, not a bug. So it is dropped
   * rather than restated: the reflexivity guard below is the honest
   * one-line version of what it was gesturing at, and the cross-model test
   * below that is the honest version of "own model recognised against the
   * turn".
   */

  /**
   * Calibration, asserted rather than assumed.
   *
   * The brief's own suggested test here computed `meaningCoverage(model,
   * model)` — a model scored against itself, which is 1 by construction for
   * any non-empty string. Asserting that against the threshold proves
   * nothing: it would pass even if the threshold were 0.99, or if
   * `meaningCoverage` were broken in a way that only self-comparison happens
   * to paper over.
   *
   * The obvious replacement — score every model against every *other* model
   * of the same turn, and require the worst of those cross-matches to clear
   * the threshold — turned out to assert something false about this corpus,
   * not something wrong with the grader. Measured directly: **63 of the 107
   * multi-model turns have no pair among their own accepted answers that
   * `meaningCoverage` recognises as equivalent, at any threshold below 1**.
   * Reading the actual pairs shows why this is correct behaviour, not a
   * defect — `conv.debate`'s "puede ser, pero en la ciudad hay más trabajo"
   * and "puede ser, pero yo no lo veo así" are two different debate
   * positions, not two phrasings of one position; `conv.malentendido`'s four
   * "concede the point and add a caveat" answers each name a *different*
   * caveat (trabas / plazos poco realistas / el riesgo de no hacerlo /
   * asumir menos riesgo). A turn's `accepted` list is a set of independently
   * valid answers to an open instruction, not a paraphrase set — nothing
   * requires two of them to share content, and for a genuinely open prompt
   * they usually should not. Asserting a floor over *every* pair would be
   * asserting that authored diversity is a bug.
   *
   * What the corpus does demonstrate — and what is worth calibrating against
   * — is that recognisable cross-model equivalence **exists and is common**
   * where a turn's answers genuinely are restatements of one thing (a short
   * polite exchange, an "I agree, except that…" concession with the same
   * caveat phrased two ways). Measured: 44 of 107 multi-model turns (41%)
   * have an internal pair the grader recognises as equivalent at the current
   * threshold. The floor below asserts a third of that, not the whole of
   * it — high enough that a broken `meaningCoverage` or a threshold raised
   * out of reach would still be caught, low enough that ordinary content
   * growth (which will add more genuinely-divergent open turns, the same
   * shape as the 63 above) does not make this flaky.
   *
   * The vacuous self-check is kept too, as its own test below, reduced to a
   * one-line guard that `meaningCoverage` stays reflexive — not because it
   * says anything about calibration, but because a model scoring less than 1
   * against itself would mean the function itself is broken.
   */
  it('recognises a real cross-model paraphrase in a solid share of multi-model turns', () => {
    let turnsWithModels = 0;
    let turnsWithRecognisedPair = 0;

    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted || turn.accepted.length < 2) continue;
        turnsWithModels += 1;

        let turnBest = 0;
        for (const model of turn.accepted) {
          const others = turn.accepted.filter((m) => m !== model);
          const bestCross = Math.max(...others.map((other) => meaningCoverage(model, other)));
          turnBest = Math.max(turnBest, bestCross);
        }
        if (turnBest >= COVERAGE_THRESHOLD) turnsWithRecognisedPair += 1;
      }

    // A mutation-style guard: if the corpus ever stopped carrying
    // multi-model turns at all, this would report a vacuous 100% on zero
    // turns rather than a real measurement.
    expect(turnsWithModels).toBeGreaterThan(5);
    const share = turnsWithRecognisedPair / turnsWithModels;
    expect(share).toBeGreaterThanOrEqual(0.3);
  });

  it('scores 1 for every authored model against itself (reflexivity guard)', () => {
    let worst = 1;
    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted?.length) continue;
        for (const model of turn.accepted) worst = Math.min(worst, meaningCoverage(model, model));
      }
    expect(worst).toBe(1);
  });
});

/**
 * The other half.
 *
 * Every change in this pass makes the grader more permissive, and the failure
 * mode of permissiveness is silent: nothing breaks, tests stay green, and the
 * app quietly accepts answers that are wrong. Hand-written adversarial examples
 * only cover the examples somebody remembered, so these mutate the corpus
 * itself — the same six error classes the brief named, applied to every
 * sentence that can carry them.
 *
 * `\b` is defined over `[A-Za-z0-9_]` only — to JS, an accented vowel (á, é,
 * í, ó, ú) or ñ/ü is a *non*-word character, exactly like a space or a comma.
 * That silently broke the ser/estar mutations, the only ones built out of
 * accented words, worse than a couple of mangled outputs:
 *
 * - Standalone `está` — the single most common estar form in the corpus —
 *   almost never matched at all. `\b` needs a word/non-word transition on
 *   *both* sides, and the side right after the `á` is a space or full stop
 *   in ordinary use, i.e. non-word next to non-word: no transition, no
 *   match. `está` could only ever satisfy that trailing `\b` when directly
 *   followed by another letter — which happens only where `está` is a
 *   literal prefix of `estáis`/`están`. So the mutation's "tried" count
 *   silently excluded almost every real occurrence of the word it exists to
 *   mutate, and the rare cases that did fire fired for the wrong reason.
 * - Those prefix cases then mutated wrong: with the accented tail counted
 *   as non-word, `\b(está)\b` sees a legal boundary right after the `á`, so
 *   the alternation matches the *prefix* "está" inside "están" instead of
 *   the whole word — the replacement leaves the trailing letters behind
 *   ("Ellos están felices." -> "Ellos esn felices.", not "...son
 *   felices."). Ordering the alternatives longest-first would not fix this:
 *   the boundary itself is the bug, not the match order.
 * - The same mechanism makes a false match the other way: "son" matches
 *   inside "sonó" ("...de repente sonó el móvil." -> "...estánó el
 *   móvil.") because JS treats the "n"/"ó" transition as a word boundary,
 *   when there is no real word break there at all.
 *
 * None of this was ever *accepted* by the grader — a mangled or missing
 * mutation is refused as `incorrect` same as a real ser/estar swap, so there
 * was no false accept. But it was not testing what this mutation claims to
 * test: refusing a string that was never mutated, or mutated into
 * gibberish, proves nothing about whether the grader can tell ser from
 * estar. `spanishBoundary` replaces `\b` with an explicit lookbehind/
 * lookahead over a Spanish-aware word-character class, so accents count as
 * word characters the way they actually are in Spanish — standalone `está`
 * now matches every time (`está` -> `es` throughout the corpus, not just at
 * `están`/`estáis`), and the prefix and cross-word false matches above no
 * longer fire. Reaching for `\b` again here — it is the obvious thing to
 * reach for — would silently reopen all three holes.
 */
const SPANISH_WORD = 'A-Za-z0-9_ÁÉÍÓÚÑÜáéíóúñü';
const spanishBoundary = (alternatives: string) =>
  new RegExp(`(?<![${SPANISH_WORD}])(${alternatives})(?![${SPANISH_WORD}])`, 'i');

const MUTATIONS: { name: string; apply: (es: string) => string | null }[] = [
  {
    name: 'ser for estar',
    apply: (t) => {
      const swapped = t.replace(spanishBoundary('estoy|estás|está|estamos|estáis|están'), (m) =>
        ({ estoy: 'soy', estás: 'eres', está: 'es', estamos: 'somos', estáis: 'sois', están: 'son' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
  {
    name: 'estar for ser',
    apply: (t) => {
      const swapped = t.replace(spanishBoundary('soy|eres|es|somos|sois|son'), (m) =>
        ({ soy: 'estoy', eres: 'estás', es: 'está', somos: 'estamos', sois: 'estáis', son: 'están' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
  // por/para, negation and the article swaps below stay on plain `\b`. None
  // of their targets contain an accented letter, so the internal-prefix bug
  // above cannot occur here, and an audit of the whole corpus (checking
  // every match's neighbouring character for an accent, both classes of
  // false boundary) found zero accent-adjacent matches for any of them —
  // e.g. "por"/"para" never abuts an accented letter with no space between,
  // and "no" never lands as a false substring next to one the way "son" did
  // inside "sonó". If new sentences ever add a word like "porúltimo" (no
  // space) or start a word with "laúd" right after this mutation's target,
  // that could change; watch for it rather than assuming `\b` is safe here
  // because it happens to be safe today.
  {
    name: 'por for para',
    apply: (t) => (/\bpara\b/.test(t) ? t.replace(/\bpara\b/, 'por') : null),
  },
  {
    name: 'para for por',
    apply: (t) => (/\bpor\b/.test(t) ? t.replace(/\bpor\b/, 'para') : null),
  },
  {
    name: 'negation removed',
    apply: (t) => (/\bno\b/.test(t) ? t.replace(/\bno\s+/, '') : null),
  },
  {
    name: 'negation added',
    apply: (t) => {
      const match = t.match(/^([A-ZÁÉÍÓÚÑ¿¡]?[^\s]*)\s(\S+)/);
      return match && !/\bno\b/.test(t) ? t.replace(/\s/, ' no ') : null;
    },
  },
  {
    name: 'plural for singular article',
    apply: (t) => (/\bel\s/.test(t) ? t.replace(/\bel\s/, 'los ') : null),
  },
  {
    name: 'gender flipped',
    apply: (t) => (/\bla\s/.test(t) ? t.replace(/\bla\s/, 'el ') : null),
  },
];

describe('permissiveness has a floor', () => {
  for (const mutation of MUTATIONS) {
    it(`never accepts: ${mutation.name}`, () => {
      const accepted: string[] = [];
      let tried = 0;

      for (const sentence of sentences) {
        const mutated = mutation.apply(sentence.es);
        if (mutated === null || mutated === sentence.es) continue;
        tried += 1;
        const result = checkAnswer(mutated, [sentence.es, ...(sentence.altEs ?? [])], es);
        if (result.verdict !== 'incorrect') {
          accepted.push(`${sentence.id} [${result.error}] "${mutated}" for "${sentence.es}"`);
        }
      }

      // A mutation that never fires tests nothing — fail loudly rather than
      // reporting a vacuous pass, which is how a guard rots.
      expect(tried).toBeGreaterThan(5);
      expect(accepted.slice(0, 10)).toEqual([]);
    });
  }
});

/**
 * The English mutation gate.
 *
 * Everything above mutates `sentence.es` and asserts *zero* acceptances,
 * because a Spanish answer is graded exactly. Nothing mutated `sentence.en`
 * at all — English is deliberately graded on meaning, not form, and it
 * shows: `sameEnglishMeaning` tolerates one unmatched content word by
 * design, so a whole-branch review found a mutation that swaps a sentence's
 * final word for "zebra" was already accepted on 106 of 1663 sentences
 * *before this branch*, purely from that tolerance. A zero-acceptance floor
 * for English would therefore not be testing this app — it would be lying
 * about what `sameEnglishMeaning` has always done. But the same review found
 * that this branch's broadened English equivalences had quietly pushed that
 * number to 128 (+22), and nothing here noticed, because nothing here looked
 * at English at all. That is the gap this describe block closes.
 *
 * So each class is anchored to a *measured, named* baseline — the count
 * accepted on the commit before this branch started (`d4c4b69`, `main` at
 * the time), reproduced by running the identical mutation through that
 * commit's own `checkAnswer`. The assertion is a ceiling on that baseline,
 * not a floor: acceptance may fall (a genuine tightening, like the one this
 * branch just made to `EN_STOPWORDS`/`EN_WORD_CLASSES`) but must never rise
 * above it without the rise being a deliberate, reviewed decision to accept
 * more — never a side effect nobody noticed.
 */
/**
 * Ceilings, as a **share of the sentences each mutation actually fires on**.
 *
 * These were absolute counts — 106 accepted of 1663 tried — which measured the
 * grader only as long as the corpus stayed the same size. It did not: the
 * curriculum expansion took the corpus past 2000 sentences, and the count rose
 * to 126 while the *rate* fell from 6.37% to 5.73%. An absolute ceiling would
 * have reported that improvement as a regression, and the obvious repair —
 * raising the number to 126 — would have quietly ratcheted the ceiling upward
 * every time content was added, which is the opposite of what a ceiling is for.
 *
 * The numbers are the pre-branch rates, unchanged. Only the units moved.
 */
const PRE_BRANCH_LAST_WORD_SWAPPED = 106 / 1663; // pre-existing `sameEnglishMeaning` tolerance, not a target
const PRE_BRANCH_NEGATION_REMOVED = 0; // the polarity guard has always caught this one
const PRE_BRANCH_NEGATION_ADDED = 0; // same guard, the other direction

const EN_MUTATIONS: { name: string; baseline: number; apply: (en: string) => string | null }[] = [
  {
    name: "the sentence's own last word swapped for an unrelated one",
    baseline: PRE_BRANCH_LAST_WORD_SWAPPED,
    apply: (t) => {
      const words = t.split(' ');
      if (words.length < 4) return null;
      return [...words.slice(0, -1), 'zebra.'].join(' ');
    },
  },
  {
    name: 'negation removed',
    baseline: PRE_BRANCH_NEGATION_REMOVED,
    apply: (t) => {
      if (/\bnot\b/.test(t)) return t.replace(/\bnot\s+/, '');
      if (/\bnever\b/.test(t)) return t.replace(/\bnever\s+/, '');
      return null;
    },
  },
  {
    name: 'negation added',
    baseline: PRE_BRANCH_NEGATION_ADDED,
    apply: (t) => {
      // Skips every sentence that already carries a negation (the mutation
      // above covers those) and, deliberately, every contraction too rather
      // than trying to insert around one. `can't` has a genuine `\b` word
      // boundary right after "can" — the apostrophe is a non-word character
      // to a regex engine, curly or straight — so a plain `\b`-bounded match
      // on the auxiliary list below finds "can" *inside* "can't" and inserts
      // "I can not't see it": not a negation, not a sentence, and a false
      // reading of what the mutation was supposed to test either way it
      // graded. Requiring the match to be followed by whitespace rather than
      // just a `\b` transition excludes it and every other contraction in
      // the corpus (`isn't`, `don't`, `won't`, ...) without special-casing
      // any of them by name.
      if (/\b(not|never|no|nothing|nobody)\b/i.test(t)) return null;
      const m = t.replace(/\b(is|are|am|was|were|do|does|did|can|will|would)(?=\s)/, '$1 not');
      return m === t ? null : m;
    },
  },
];

describe('English permissiveness has a ceiling, not a floor', () => {
  for (const mutation of EN_MUTATIONS) {
    it(`never accepts more than the pre-branch baseline: ${mutation.name}`, () => {
      const accepted: string[] = [];
      let tried = 0;

      for (const sentence of sentences) {
        const mutated = mutation.apply(sentence.en);
        if (mutated === null || mutated === sentence.en) continue;
        tried += 1;
        const result = checkAnswer(mutated, [sentence.en, ...(sentence.altEn ?? [])], en);
        if (result.verdict !== 'incorrect') {
          accepted.push(`${sentence.id} [${result.error}] "${mutated}" for "${sentence.en}"`);
        }
      }

      // A mutation that stops firing tests nothing — fail loudly rather than
      // reporting a vacuous pass, the same discipline as the Spanish gate
      // above.
      expect(tried).toBeGreaterThan(5);
      expect(accepted.length / tried).toBeLessThanOrEqual(mutation.baseline);
    });
  }
});
