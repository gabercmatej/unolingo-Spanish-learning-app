# Tutor-Grading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grade answers the way a tutor does — accept correct meaning, teach the preferred form, and fail only when the meaning or the skill under test is actually wrong.

**Architecture:** One classifier (`AnswerError`) is produced by the checker; a single policy table derives both the learner-facing `Verdict` and the SRS-facing `Grade` from it. `answer-check.ts` stays content-free and receives corpus knowledge — which accents carry meaning, which English phrasings are equivalent — as injected data on a `GradingProfile` assembled by `check.ts`, the existing single grading entry point.

**Tech Stack:** TypeScript strict, Jest, Expo/React Native 0.86. No new dependencies. Offline only — nothing here calls a network.

**Spec:** `docs/superpowers/specs/2026-08-20-tutor-grading-design.md`

## Global Constraints

- **No new dependencies.** Anything added must work on iOS, Android and web. Install with `npx expo install`, never `npm install`. This plan adds none.
- **No `STATE_VERSION` bump.** `Grade` is not persisted; `MistakeRecord.error` is added as optional. If you find yourself needing a bump, stop and re-read the spec — you have gone outside it.
- **Layering is a hard rule.** `src/learning/answer-check.ts` imports from `@/learning/*` only, never `@/content/*`. `src/content/*` contains data and derivations, never React and never policy. Policy never lives in `src/lib/`.
- **`src/content/` files must be registered** in `src/content/index.ts`.
- **Three gates must be green before every commit:** `npm test`, `npm run typecheck`, `npm run lint`. Lint is not cosmetic — its React Compiler rules have caught two real bugs in this repo.
- **`npm run audit:content` must stay at 11/11 with zero warnings.** Never make it pass by weakening an assertion.
- **Never call `Date.now()` in a render body**; use `useNow()`. Never hardcode a colour; add a token to `src/constants/theme.ts`.
- **Em-dash ban applies to UI copy only** — strings rendered to the learner. It does not govern comments or docs.
- Files kebab-case, components and types PascalCase, `@/*` maps to `src/`.

---

### Task 1: The grading vocabulary and its single policy table

The hazard this whole feature carries is ending up with two grading systems that disagree. The guard is that exactly one enum is produced by the checker, and everything else is derived from it here.

**Files:**
- Create: `src/learning/grading.ts`
- Test: `src/learning/__tests__/grading.test.ts`

**Interfaces:**
- Consumes: `Grade` from `@/learning/types` (type-only import).
- Produces: `Verdict`, `AnswerError`, `GradingProfile`, `ERROR_POLICY`, `verdictFor(error)`, `gradeFor(error)`. Tasks 4–9 all depend on these exact names.

**This file must import nothing but types.** It is imported by `answer-check.ts`, which is required to stay content-free.

- [ ] **Step 1: Write the failing test**

Create `src/learning/__tests__/grading.test.ts`:

```ts
import { ERROR_POLICY, gradeFor, verdictFor, type AnswerError } from '@/learning/grading';

describe('ERROR_POLICY', () => {
  const ALL: AnswerError[] = [
    'none', 'accent', 'accentContrast', 'punctuation', 'spelling',
    'paraphrase', 'preferred', 'form', 'grammar', 'negation', 'meaning',
  ];

  it('covers every error with no gaps', () => {
    for (const error of ALL) expect(ERROR_POLICY[error]).toBeDefined();
    expect(Object.keys(ERROR_POLICY).sort()).toEqual([...ALL].sort());
  });

  it('treats understanding-with-a-slip as successful retrieval', () => {
    // The whole point: none of these may reach the SRS as a failure.
    for (const error of ['accent', 'punctuation', 'paraphrase', 'preferred'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('correctWithFeedback');
      expect(gradeFor(error)).toBe('correct');
    }
  });

  it('charges a small price for a slipped key or a meaning-bearing accent', () => {
    for (const error of ['spelling', 'accentContrast'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('correctWithFeedback');
      expect(gradeFor(error)).toBe('almost');
    }
  });

  it('fails only when the meaning or the tested form is wrong', () => {
    for (const error of ['form', 'grammar', 'negation', 'meaning'] as AnswerError[]) {
      expect(verdictFor(error)).toBe('incorrect');
      expect(gradeFor(error)).toBe('incorrect');
    }
  });

  it('says nothing extra when the answer was exactly right', () => {
    expect(verdictFor('none')).toBe('correct');
    expect(gradeFor('none')).toBe('correct');
  });

  it('never reports an incorrect verdict with a passing grade', () => {
    for (const [error, policy] of Object.entries(ERROR_POLICY)) {
      if (policy.verdict === 'incorrect') expect(policy.grade).toBe('incorrect');
      if (policy.grade === 'incorrect') expect(policy.verdict).toBe('incorrect');
      expect(error).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/learning/__tests__/grading.test.ts`
Expected: FAIL — `Cannot find module '@/learning/grading'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/learning/grading.ts`:

```ts
import type { Grade } from '@/learning/types';

/**
 * What was wrong with an answer, and what that is worth.
 *
 * The brief asked for three outcomes and for the error types behind them not to
 * all affect mastery identically. The danger in satisfying both is ending up
 * with two scoring systems that drift apart — one for the banner, one for the
 * scheduler. So there is exactly one thing the checker decides (`AnswerError`),
 * and both the learner-facing verdict and the SRS-facing grade are derived from
 * it by the one table below. Change the table and every consumer changes with
 * it; there is nowhere else to disagree.
 *
 * This file imports nothing but a type, on purpose: `answer-check.ts` imports
 * it and is required to stay free of `@/content`.
 */

export type Verdict = 'correct' | 'correctWithFeedback' | 'incorrect';

export type AnswerError =
  /** Exactly right. */
  | 'none'
  /** A missing or added accent on a word that has no accented twin: café. */
  | 'accent'
  /** An accent that distinguishes two real forms: está/esta, hablé/hable. */
  | 'accentContrast'
  /** Capitalisation, a missing ¿ or ¡, stray punctuation. */
  | 'punctuation'
  /** One slipped key inside a word. */
  | 'spelling'
  /** Different words, same meaning. */
  | 'paraphrase'
  /** Acceptable, but the course has a more precise or natural form. */
  | 'preferred'
  /** Right lemma, wrong inflection: person, tense, number, gender, mood. */
  | 'form'
  /** Wrong function word: ser~estar, por~para, article, clitic. */
  | 'grammar'
  /** The polarity is reversed. Never let this slide. */
  | 'negation'
  /** A different meaning, or content missing or added. */
  | 'meaning';

/**
 * The only mapping from error to consequence in the codebase.
 *
 * `correctWithFeedback` is always successful retrieval: `review()` in `srs.ts`
 * treats only `incorrect` as failure, so neither row below resets stability,
 * breaks the streak, or writes a mistake record. The split between the two rows
 * is what the answer cost — `accent` and `paraphrase` are free because a
 * learner who writes "cafe" plainly knows the word, while a slipped key or a
 * meaning-bearing accent is worth a slightly shorter interval and half the XP.
 */
export const ERROR_POLICY: Record<AnswerError, { verdict: Verdict; grade: Grade }> = {
  none: { verdict: 'correct', grade: 'correct' },

  accent: { verdict: 'correctWithFeedback', grade: 'correct' },
  punctuation: { verdict: 'correctWithFeedback', grade: 'correct' },
  paraphrase: { verdict: 'correctWithFeedback', grade: 'correct' },
  preferred: { verdict: 'correctWithFeedback', grade: 'correct' },

  accentContrast: { verdict: 'correctWithFeedback', grade: 'almost' },
  spelling: { verdict: 'correctWithFeedback', grade: 'almost' },

  form: { verdict: 'incorrect', grade: 'incorrect' },
  grammar: { verdict: 'incorrect', grade: 'incorrect' },
  negation: { verdict: 'incorrect', grade: 'incorrect' },
  meaning: { verdict: 'incorrect', grade: 'incorrect' },
};

export function verdictFor(error: AnswerError): Verdict {
  return ERROR_POLICY[error].verdict;
}

export function gradeFor(error: AnswerError): Grade {
  return ERROR_POLICY[error].grade;
}

/** English words and phrases that mean the same thing for a comprehension check. */
export interface Equivalences {
  /** Lower-case word to the representative of its class. */
  word: ReadonlyMap<string, string>;
  /** Normalised multi-word phrase to the representative of its group. */
  phrase: ReadonlyMap<string, string>;
}

/**
 * What this task is actually testing, which decides how much slack an answer
 * gets. Assembled in one place (`check.ts`) so no screen and no builder ever
 * composes a tolerance by hand — the same reasoning that moved review scoping
 * into `scope.ts` after "mostly right, by convention, at each call site"
 * stopped being true.
 */
export interface GradingProfile {
  language: 'es' | 'en';
  /**
   * The exact written form is the thing under test — a dictation, a conjugation
   * drill, or a learner who has switched strict accents on. Here an accent that
   * distinguishes two real forms is a `form` error and fails.
   */
  formIsTarget: boolean;
  paraphrase: 'none' | 'english' | 'spanish' | 'spanishFree';
  /**
   * Corpus knowledge, injected because this module may not import `@/content`.
   *
   * Undefined means "do not distinguish", which makes the pure function
   * permissive by default and the app precise — the same seam `eligibility.ts`
   * uses when `knowledge` is undefined. Unit tests that want the distinction
   * inject the real predicate; the app always does, via `check.ts`.
   */
  accentCarriesMeaning?: (bare: string) => boolean;
  equivalences?: Equivalences;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/learning/__tests__/grading.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Run the gates**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add src/learning/grading.ts src/learning/__tests__/grading.test.ts
git commit -m "One classifier, one policy table, two derived outputs"
```

---

### Task 2: Derive which accents carry meaning

`CLAUDE.md` records `hablo`/`habló` as an unsolvable gap because telling them apart "needs to know which words are verbs, which `learning/` cannot ask `content/`". It does not need to know that. It needs to know which deaccented strings name more than one real Spanish word, and the corpus already contains that.

**Files:**
- Create: `src/content/accent-pairs.ts`
- Modify: `src/content/index.ts`
- Test: `src/content/__tests__/accent-pairs.test.ts`

**Interfaces:**
- Consumes: `sentences`, `vocabConcepts` from `@/content`; `verbs` from `@/content/verbs`; `errorDrills`, `naturalDrills` from `@/content/drills`; `conversations` from its module.
- Produces: `accentCarriesMeaning(bare: string): boolean` and `ACCENT_AMBIGUOUS: ReadonlySet<string>`. Task 10 injects the first into the profile.

**Derive from Spanish text only.** A first pass scanned every string literal in `content/` and produced 107 groups — but that swept in the English glosses (`opinion`, `decision`) and ASCII slugs (`espanol`, `anos`, `manana`), which would have made `años`, `español` and `mañana` accent-critical and punished a learner typing them on a phone keyboard. Spanish-only yields 64 groups and every one is a genuine minimal pair.

- [ ] **Step 1: Write the failing test**

Create `src/content/__tests__/accent-pairs.test.ts`:

```ts
import { ACCENT_AMBIGUOUS, accentCarriesMeaning } from '@/content/accent-pairs';

describe('accent-pairs', () => {
  it('flags the diacritical pairs, where the accent is the whole distinction', () => {
    for (const word of ['que', 'el', 'si', 'mi', 'se', 'te', 'de', 'como', 'donde', 'cuando'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags demonstrative against verb', () => {
    for (const word of ['esta', 'estas', 'este']) expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags present yo against preterite él — the reported case', () => {
    for (const word of ['hablo', 'trabajo', 'cambio', 'llego', 'paso'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('flags subjunctive against preterite yo', () => {
    for (const word of ['hable', 'llegue', 'quede', 'deje'])
      expect(accentCarriesMeaning(word)).toBe(true);
  });

  it('leaves ordinary orthography alone, which is the half that matters most', () => {
    // Every one of these is a word a learner will type without the diacritic on
    // a phone, and every one of them is unambiguous. Downgrading them would be
    // the feature doing more harm than the bug it fixes.
    for (const word of ['cafe', 'anos', 'espanol', 'manana', 'nino', 'jardin', 'opinion', 'comeis'])
      expect(accentCarriesMeaning(word)).toBe(false);
  });

  it('is keyed by the deaccented form, so it answers for either spelling', () => {
    expect(accentCarriesMeaning('está')).toBe(true);
    expect(accentCarriesMeaning('ESTA')).toBe(true);
    expect(accentCarriesMeaning('café')).toBe(false);
  });

  it('derives a set of a plausible size — a collapse to zero is a broken walk', () => {
    expect(ACCENT_AMBIGUOUS.size).toBeGreaterThan(40);
    expect(ACCENT_AMBIGUOUS.size).toBeLessThan(200);
  });

  it('never contains a group built from a single spelling', () => {
    // The set stores deaccented keys; a key only earns its place when two
    // distinct surface forms collapse onto it.
    for (const key of ACCENT_AMBIGUOUS) expect(key).toBe(key.normalize('NFD').replace(/[̀-ͯ]/g, ''));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/content/__tests__/accent-pairs.test.ts`
Expected: FAIL — `Cannot find module '@/content/accent-pairs'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/accent-pairs.ts`:

```ts
import { conversations } from '@/content/conversations';
import { errorDrills, naturalDrills } from '@/content/drills';
import { sentences } from '@/content/sentences';
import { vocab } from '@/content/vocab';
import { verbs } from '@/content/verbs';

/**
 * Which accents carry meaning, derived rather than listed.
 *
 * `deaccent` folds every accent before comparing, which is right for a phone
 * keyboard and wrong for `hablo` against `habló`. `CLAUDE.md` recorded that as
 * unsolvable without knowing which words are verbs. It is solvable without
 * knowing anything of the sort: the question is not "is this a verb?" but "does
 * this string, stripped of accents, name more than one real Spanish word?" —
 * and the corpus answers that itself, the same way `verb-corpus.ts` derives
 * which sentences contain which conjugated form.
 *
 * Walk Spanish text, group every surface word by its deaccented form, and keep
 * the groups holding two or more distinct spellings. 3,364 words collapse to 64
 * groups, and every one is a genuine minimal pair: the diacritical set
 * (qué/que, él/el, sí/si, cómo/como), demonstrative against verb (está/esta),
 * present yo against preterite él (hablo/habló), subjunctive against preterite
 * yo (hable/hablé).
 *
 * **Spanish text only, and that is load-bearing.** An earlier version read every
 * string literal in `content/` and found 107 groups — because it was also
 * reading the English glosses (opinion, decision, reunion) and the ASCII slugs
 * in ids (espanol, anos, manana). That set would have made años, español and
 * mañana accent-critical, punishing a learner for the one thing a phone
 * keyboard genuinely makes hard. Restricted to Spanish, café, años, español,
 * mañana, niño and jardín all fall outside it, which is the point.
 *
 * Adding content updates this automatically. Nothing is annotated.
 */

const SPANISH_WORD = /[a-záéíóúüñ]+/g;

function deaccent(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function spanishText(): string[] {
  const out: string[] = [];

  for (const sentence of sentences) {
    out.push(sentence.es);
    if (sentence.altEs) out.push(...sentence.altEs);
  }

  for (const concept of vocab) out.push(concept.es);

  for (const drill of errorDrills) {
    out.push(drill.wrong, ...drill.accepted);
  }

  for (const drill of naturalDrills) {
    for (const option of drill.options) out.push(option.text);
  }

  for (const scene of conversations) {
    for (const turn of scene.turns) {
      if (turn.es) out.push(turn.es);
      if (turn.accepted) out.push(...turn.accepted);
    }
  }

  // Conjugated forms, so a paradigm the corpus has not used in a sentence yet
  // still contributes its own minimal pairs.
  for (const verb of verbs) {
    for (const conjugation of Object.values(verb.tenses)) {
      if (!conjugation) continue;
      for (const form of Object.values(conjugation.forms)) {
        if (typeof form === 'string') out.push(form);
      }
    }
  }

  return out;
}

function derive(): Set<string> {
  const byBare = new Map<string, Set<string>>();

  for (const text of spanishText()) {
    for (const word of text.toLowerCase().match(SPANISH_WORD) ?? []) {
      const bare = deaccent(word);
      let forms = byBare.get(bare);
      if (!forms) {
        forms = new Set();
        byBare.set(bare, forms);
      }
      forms.add(word);
    }
  }

  const ambiguous = new Set<string>();
  for (const [bare, forms] of byBare) {
    if (forms.size > 1) ambiguous.add(bare);
  }
  return ambiguous;
}

/** Deaccented forms that name more than one real word in this course. */
export const ACCENT_AMBIGUOUS: ReadonlySet<string> = derive();

/**
 * Does an accent on this word change which word it is? Accepts either spelling —
 * the set is keyed by the deaccented form, so `está` and `esta` both answer true.
 */
export function accentCarriesMeaning(word: string): boolean {
  return ACCENT_AMBIGUOUS.has(deaccent(word.toLowerCase()));
}
```

**Note on imports:** the exact module paths for `sentences`, `vocab`, `conversations` and `verbs` may differ — read `src/content/index.ts` and follow whatever it imports. Do not import from `@/content` itself; that would create a cycle once `index.ts` re-exports this file.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/content/__tests__/accent-pairs.test.ts`
Expected: PASS, 8 tests.

If `ACCENT_AMBIGUOUS.size` comes out far from 64, the walk is reaching the wrong text. Print the groups and read them — every entry should be a Spanish minimal pair you can name. An entry like `opinion~opinión` or `anos~años` means an English or slug source has crept in.

- [ ] **Step 5: Register in the content index**

Add to `src/content/index.ts`, beside the other derived re-exports:

```ts
export { ACCENT_AMBIGUOUS, accentCarriesMeaning } from '@/content/accent-pairs';
```

- [ ] **Step 6: Run the gates**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all green. Then `npm run audit:content` — still 11/11, zero warnings.

- [ ] **Step 7: Commit**

```bash
git add src/content/accent-pairs.ts src/content/__tests__/accent-pairs.test.ts src/content/index.ts
git commit -m "Derive which accents carry meaning, from Spanish text alone"
```

---

### Task 3: English equivalence data

`sameEnglishMeaning` is backed by a 25-entry one-directional map buried in `answer-check.ts`. That map is why `pleased to meet you` is rejected for `nice to meet you`: equal word count, one non-matching word, and the single-unmatched allowance only fires on a length difference.

**Files:**
- Create: `src/content/equivalences.ts`
- Modify: `src/content/index.ts`
- Test: `src/content/__tests__/equivalences.test.ts`

**Interfaces:**
- Consumes: nothing. Pure data.
- Produces: `EN_EQUIVALENCES: Equivalences` (the interface from Task 1), `EN_WORD_CLASSES: string[][]`, `EN_PHRASE_GROUPS: string[][]`.

- [ ] **Step 1: Write the failing test**

Create `src/content/__tests__/equivalences.test.ts`:

```ts
import { EN_EQUIVALENCES, EN_PHRASE_GROUPS, EN_WORD_CLASSES } from '@/content/equivalences';

describe('English equivalences', () => {
  it('maps every member of a class to the same representative', () => {
    for (const group of EN_WORD_CLASSES) {
      const reps = new Set(group.map((word) => EN_EQUIVALENCES.word.get(word)));
      expect(reps.size).toBe(1);
      expect([...reps][0]).toBeDefined();
    }
  });

  it('never puts a word in two classes, which would make the mapping order-dependent', () => {
    const seen = new Set<string>();
    for (const group of EN_WORD_CLASSES) {
      for (const word of group) {
        expect(seen.has(word)).toBe(false);
        seen.add(word);
      }
    }
  });

  it('never puts a phrase in two groups', () => {
    const seen = new Set<string>();
    for (const group of EN_PHRASE_GROUPS) {
      for (const phrase of group) {
        expect(seen.has(phrase)).toBe(false);
        seen.add(phrase);
      }
    }
  });

  it('carries the reported greeting family', () => {
    const rep = EN_EQUIVALENCES.phrase.get('nice to meet you');
    expect(rep).toBeDefined();
    for (const phrase of ['pleased to meet you', 'delighted to meet you', 'lovely to meet you'])
      expect(EN_EQUIVALENCES.phrase.get(phrase)).toBe(rep);
  });

  it('stores phrases already normalised — lower case, no punctuation', () => {
    for (const phrase of EN_EQUIVALENCES.phrase.keys()) {
      expect(phrase).toBe(phrase.toLowerCase());
      expect(phrase).not.toMatch(/[.,!?;:'"]/);
      expect(phrase.trim()).toBe(phrase);
    }
  });

  it('keeps polarity out of the classes entirely', () => {
    // A class containing a negation word would let "not" be swapped for a
    // synonym and quietly defeat the polarity guard in answer-check.
    const polarity = ['not', 'no', 'never', 'none', 'nobody', 'nothing', 'without', 'cannot'];
    for (const group of EN_WORD_CLASSES)
      for (const word of group) expect(polarity).not.toContain(word);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/content/__tests__/equivalences.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/equivalences.ts`:

```ts
import type { Equivalences } from '@/learning/grading';

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
  ['want', 'wanna', 'would like'],
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
  ['how are you', 'how are things', 'how is it going', 'how goes it', "how's everything"],
  ['see you later', 'see you soon', 'see you', 'catch you later'],
  ['you are welcome', 'not at all', 'no problem', 'my pleasure', 'dont mention it'],
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/content/__tests__/equivalences.test.ts`
Expected: PASS, 6 tests.

If "never puts a word in two classes" fails, the duplicate is real — pick one class for the word and delete the other entry. `nice` and `lovely` deliberately live in the `good` class rather than the `pleased` class, and the phrase group is what carries "nice/pleased to meet you".

- [ ] **Step 5: Register in the content index**

Add to `src/content/index.ts`:

```ts
export { EN_EQUIVALENCES, EN_PHRASE_GROUPS, EN_WORD_CLASSES } from '@/content/equivalences';
```

- [ ] **Step 6: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/content/equivalences.ts src/content/__tests__/equivalences.test.ts src/content/index.ts
git commit -m "English equivalences as data, at word and phrase level"
```

---

### Task 4: Derived Spanish variants

Spanish says the same thing several ways without any authoring: `al` is `a el`, `del` is `de el`, and a clitic may climb in front of a verb + infinitive. Accepting these needs no per-sentence data.

**Files:**
- Create: `src/learning/es-variants.ts`
- Test: `src/learning/__tests__/es-variants.test.ts`

**Interfaces:**
- Consumes: nothing. Pure, no content imports.
- Produces: `spanishVariants(normalized: string): string[]` — returns every equivalent form **including the input**, already normalised (lower case, no punctuation, single spaces). Task 7 consumes it.

- [ ] **Step 1: Write the failing test**

Create `src/learning/__tests__/es-variants.test.ts`:

```ts
import { spanishVariants } from '@/learning/es-variants';

const has = (input: string, expected: string) =>
  expect(spanishVariants(input)).toContain(expected);

describe('spanishVariants', () => {
  it('always includes the input itself', () => {
    has('tengo un perro', 'tengo un perro');
  });

  it('contracts and expands al', () => {
    has('voy al cine', 'voy a el cine');
    has('voy a el cine', 'voy al cine');
  });

  it('contracts and expands del', () => {
    has('la casa del profesor', 'la casa de el profesor');
    has('la casa de el profesor', 'la casa del profesor');
  });

  it('climbs a clitic off an infinitive', () => {
    has('quiero verte', 'te quiero ver');
    has('voy a comprarlo', 'lo voy a comprar');
  });

  it('lowers a climbed clitic back onto the infinitive', () => {
    has('te quiero ver', 'quiero verte');
  });

  it('does not climb off a word that merely ends in ar, er or ir', () => {
    // "lugar" ends in -ar and "se" is not attached to it; nothing may move.
    expect(spanishVariants('busco un lugar')).toEqual(['busco un lugar']);
    expect(spanishVariants('el mar')).toEqual(['el mar']);
  });

  it('does not invent a variant where the pattern does not appear', () => {
    expect(spanishVariants('hola que tal')).toEqual(['hola que tal']);
  });

  it('never returns duplicates', () => {
    const out = spanishVariants('voy al cine');
    expect(new Set(out).size).toBe(out.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/learning/__tests__/es-variants.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/learning/es-variants.ts`:

```ts
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
  // Short enough to be an ending rather than a verb is not a verb.
  if (word.length < 4) return false;
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
    // preposition — "a comprarlo" is not a climb, "voy a comprarlo" is.
    const before = words.slice(0, i);
    const climbed = [...before, attached.clitic, words[i], attached.stem, ...words.slice(i + 2)];
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/learning/__tests__/es-variants.test.ts`
Expected: PASS, 8 tests.

If "voy a comprarlo → lo voy a comprar" fails, check that `attachedClitic` is trying the longest clitic first — `comprarlo` must split as `comprar` + `lo`, not `comprarl` + `o`.

- [ ] **Step 5: Run the gates and commit**

```bash
npm run typecheck && npm run lint && npx jest src/learning
git add src/learning/es-variants.ts src/learning/__tests__/es-variants.test.ts
git commit -m "Derived Spanish variants: al, del, and a climbing clitic"
```

---

### Task 5: Meaning coverage for free turns

107 free-typed conversation and build-a-response turns are graded by exact match against four long authored sentences apiece. The probability of a learner producing one verbatim is approximately zero, and this is the single largest source of the complaint that started this work.

**Files:**
- Create: `src/learning/meaning.ts`
- Test: `src/learning/__tests__/meaning.test.ts`

**Interfaces:**
- Consumes: `Equivalences` from `@/learning/grading` (type-only).
- Produces: `contentWords(text, equivalences?)`, `polarity(words)`, `meaningCoverage(given, model, equivalences?)` returning 0..1, and `COVERAGE_THRESHOLD`. Tasks 7 and 8 consume all four.

`contentWords` and `polarity` move here from `answer-check.ts` so the English paraphrase layer and the free-turn layer share one definition of "content word" rather than growing two.

- [ ] **Step 1: Write the failing test**

Create `src/learning/__tests__/meaning.test.ts`:

```ts
import { EN_EQUIVALENCES } from '@/content/equivalences';
import { COVERAGE_THRESHOLD, contentWords, meaningCoverage, polarity } from '@/learning/meaning';

describe('contentWords', () => {
  it('drops the words that carry no meaning for a comprehension check', () => {
    expect(contentWords('the coffee is on a table')).toEqual(contentWords('coffee on table'));
  });

  it('folds a class member onto its representative when given equivalences', () => {
    expect(contentWords('very well', EN_EQUIVALENCES)).toEqual(
      contentWords('very good', EN_EQUIVALENCES),
    );
  });

  it('leaves words alone when no equivalences are supplied', () => {
    expect(contentWords('very well')).not.toEqual(contentWords('very good'));
  });
});

describe('polarity', () => {
  it('counts the words that reverse a sentence', () => {
    expect(polarity(['i', 'do', 'not', 'like', 'coffee'])).toBe(1);
    expect(polarity(['i', 'like', 'coffee'])).toBe(0);
    expect(polarity(['nobody', 'never', 'goes'])).toBe(2);
  });
});

describe('meaningCoverage', () => {
  it('scores 1 for the model against itself', () => {
    const model = 'no es que dude de su sistema es que el servicio sigue sin funcionar';
    expect(meaningCoverage(model, model)).toBe(1);
  });

  it('scores high for a learner saying the same thing in their own words', () => {
    const model = 'de acuerdo siempre y cuando esta vez se resuelva de verdad';
    const given = 'vale siempre y cuando se resuelva esta vez';
    expect(meaningCoverage(given, model)).toBeGreaterThanOrEqual(COVERAGE_THRESHOLD);
  });

  it('scores 0 when the polarity is reversed, whatever else matches', () => {
    // Every content word matches. Only the negation differs, and it is the
    // only word that matters.
    expect(meaningCoverage('me gusta el cafe', 'no me gusta el cafe')).toBe(0);
    expect(meaningCoverage('no me gusta el cafe', 'me gusta el cafe')).toBe(0);
  });

  it('scores low for a different sentence about a different thing', () => {
    const model = 'quiero reservar una mesa para dos personas';
    expect(meaningCoverage('donde esta la estacion de tren', model)).toBeLessThan(
      COVERAGE_THRESHOLD,
    );
  });

  it('does not reward padding — extra content is not free', () => {
    const model = 'quiero un cafe';
    const padded = 'quiero un cafe y una tostada y un zumo y el periodico y la cuenta';
    expect(meaningCoverage(padded, model)).toBeLessThan(1);
  });

  it('returns 0 for an empty answer', () => {
    expect(meaningCoverage('', 'quiero un cafe')).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/learning/__tests__/meaning.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/learning/meaning.ts`:

```ts
import type { Equivalences } from '@/learning/grading';

/**
 * Did the learner say the same thing?
 *
 * Free conversation turns carry four hand-authored model answers, each a full
 * natural sentence. Graded by exact match, a learner essentially cannot pass
 * one — measured across the course, 107 turns are in that state. The exercise
 * looks well-formed from every call site, which is why it survived so long.
 *
 * So a free turn is scored on *coverage*: how much of the model's meaning the
 * learner's answer carries, against the closest of the models. Not a similarity
 * score in the abstract — an asymmetric one. The model's content words are what
 * must be covered, and padding the answer does not help, so "I want a coffee and
 * a toast and a juice and the paper" does not score full marks against "I want a
 * coffee" by containing it.
 *
 * Polarity is absolute rather than weighted. Two sentences that differ only in
 * a negation are opposites however much else they share, and letting that count
 * as 90% coverage would be the single worst thing this module could do.
 */

/** Words that carry no meaning for a comprehension check. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'be', 'been', 'do', 'does', 'did', 'to', 'of', 'that',
  'it', 'its', 'some', 'any', 'so', 'just', 'really', 'quite', 'at', 'in', 'on', 'and',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'que', 'y', 'o',
  'es', 'son', 'se', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os',
]);

/**
 * Words that flip a sentence rather than colouring it.
 *
 * These are why coverage cannot simply tolerate one unmatched word: "I do not
 * like coffee" and "I like coffee" differ by exactly one, and it is the only
 * one that matters. Both languages, because this module scores both.
 */
const POLARITY = new Set([
  'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nor', 'without',
  'nowhere', 'cannot', 'except', 'unless',
  'nunca', 'nadie', 'nada', 'ni', 'tampoco', 'sin', 'jamas', 'ningun', 'ninguna', 'ninguno',
]);

function deaccent(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * The meaning-bearing words of an answer, normalised for comparison. Sorted, so
 * word order does not matter — a comprehension check is about content, and
 * "in the morning I work" is not a different claim from "I work in the morning".
 */
export function contentWords(text: string, equivalences?: Equivalences): string[] {
  return deaccent(text.toLowerCase())
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => equivalences?.word.get(word) ?? word)
    .filter((word) => !STOPWORDS.has(word))
    .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word))
    .sort();
}

/** How many polarity words a phrase carries. Two cancel; one does not. */
export function polarity(words: string[]): number {
  return words.filter((word) => POLARITY.has(word)).length;
}

/**
 * Calibrated by the corpus tests in Task 13 and Task 14, not chosen by feel:
 * the lowest value at which every authored model still passes its own turn, and
 * the highest at which no mutated answer passes. If those bounds ever cross,
 * coverage alone is insufficient for that turn — report it rather than nudging
 * this number, which would be trading one failure mode for the other.
 */
export const COVERAGE_THRESHOLD = 0.6;

/**
 * How much of `model`'s meaning `given` carries, 0..1. Asymmetric on purpose:
 * the model is what has to be covered, and extra words in the answer dilute
 * rather than help.
 */
export function meaningCoverage(
  given: string,
  model: string,
  equivalences?: Equivalences,
): number {
  const answer = contentWords(given, equivalences);
  const target = contentWords(model, equivalences);
  if (answer.length === 0 || target.length === 0) return 0;

  // Opposites are not near misses.
  if (polarity(answer) !== polarity(model.toLowerCase().split(/\s+/).map(deaccent))) return 0;

  const pool = [...answer];
  let matched = 0;
  for (const word of target) {
    const index = pool.indexOf(word);
    if (index === -1) continue;
    pool.splice(index, 1);
    matched += 1;
  }

  const recall = matched / target.length;
  // Padding is not free: an answer much longer than the model is diluted in
  // proportion, so containing the model is not the same as being it.
  const precision = matched / answer.length;
  if (precision >= recall) return recall;
  return (recall + precision) / 2;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/learning/__tests__/meaning.test.ts`
Expected: PASS, 9 tests.

If "scores 0 when the polarity is reversed" fails, the two polarity counts are being computed over differently-processed word lists — both sides must be deaccented and lower-cased before the `POLARITY` lookup.

- [ ] **Step 5: Run the gates and commit**

```bash
npm run typecheck && npm run lint && npx jest src/learning
git add src/learning/meaning.ts src/learning/__tests__/meaning.test.ts
git commit -m "Meaning coverage, so a free turn can be answered in your own words"
```

---

### Task 6: Reshape `CheckResult` and keep the suite green

`checkAnswer` currently returns `{ grade, note?, best }`. It must return the error classification too, and every caller must keep compiling. This task changes the shape and nothing else — no behaviour moves.

**Files:**
- Modify: `src/learning/answer-check.ts`
- Modify: `src/learning/check.ts`
- Modify: `src/learning/__tests__/answer-check.test.ts`

**Interfaces:**
- Consumes: `Verdict`, `AnswerError`, `GradingProfile`, `gradeFor`, `verdictFor` from Task 1.
- Produces: `CheckResult { verdict, error, grade, note?, best }` and `checkAnswer(input, accepted, profile?: Partial<GradingProfile>)`. Tasks 7–12 build on this shape.

- [ ] **Step 1: Write the failing test**

Add to `src/learning/__tests__/answer-check.test.ts`, at the end of the `describe('checkAnswer')` block:

```ts
  it('reports a classification alongside the grade', () => {
    const exact = checkAnswer('Tengo un perro.', ['Tengo un perro.']);
    expect(exact.error).toBe('none');
    expect(exact.verdict).toBe('correct');

    const wrong = checkAnswer('Tengo un gato', ['Tengo un perro']);
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.grade).toBe('incorrect');
  });

  it('derives the grade from the error rather than deciding it twice', () => {
    const result = checkAnswer('Tengo un pero', ['Tengo un perro']);
    expect(result.error).toBe('spelling');
    expect(result.grade).toBe(gradeFor(result.error));
    expect(result.verdict).toBe(verdictFor(result.error));
  });
```

Add to that file's imports:

```ts
import { gradeFor, verdictFor } from '@/learning/grading';
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/learning/__tests__/answer-check.test.ts`
Expected: FAIL — `error` and `verdict` are undefined.

- [ ] **Step 3: Change the result shape**

In `src/learning/answer-check.ts`, replace the `CheckOptions` and `CheckResult` declarations with:

```ts
import { gradeFor, verdictFor, type AnswerError, type GradingProfile, type Verdict } from '@/learning/grading';
import type { Grade } from '@/learning/types';

export interface CheckResult {
  /** What the learner is told. */
  verdict: Verdict;
  /** What was wrong, if anything. The one thing this module decides. */
  error: AnswerError;
  /** What the scheduler is told. Always `gradeFor(error)` — never set by hand. */
  grade: Grade;
  /** Shown under the feedback banner when the answer was not exactly right. */
  note?: string;
  /** The accepted answer closest to what was typed — shown as the model answer. */
  best: string;
}

/** Builds a result from its classification, so grade and verdict cannot drift. */
function outcome(error: AnswerError, best: string, note?: string): CheckResult {
  return { verdict: verdictFor(error), error, grade: gradeFor(error), note, best };
}
```

Delete the `CheckOptions` interface. Change the signature to:

```ts
export function checkAnswer(
  input: string,
  accepted: string[],
  profile: Partial<GradingProfile> = {},
): CheckResult {
  const language = profile.language ?? 'es';
  const formIsTarget = profile.formIsTarget ?? false;
  // ...
```

Then replace every `return { grade: ..., ... }` in the function body with the equivalent `outcome(...)` call, mapping the existing behaviour one-for-one:

| existing return | becomes |
|---|---|
| `{ grade: 'incorrect', best: fallback }` (empty input) | `outcome('meaning', fallback)` |
| `{ grade: 'correct', best: candidate.display }` (exact) | `outcome('none', candidate.display)` |
| accent branch, `strictAccents` true | `outcome('accentContrast', accentOnlyMatch, note)` |
| accent branch, `strictAccents` false | `outcome('accent', accentOnlyMatch, note)` |
| typo branch | `outcome('spelling', typoMatch, note)` |
| English paraphrase branch | `outcome('paraphrase', candidate.display)` |
| final fallthrough | `outcome('meaning', closest?.answer ?? fallback)` |

Read `options.strictAccents` as `formIsTarget` throughout.

- [ ] **Step 4: Update `check.ts` so it compiles**

In `src/learning/check.ts`, extend `ExerciseResult` and pass the new field through. For the three `checkAnswer` call sites, replace `{ strictAccents: settings.strictAccents, language: ... }` with `{ formIsTarget: settings.strictAccents, language: ... }`.

```ts
export interface ExerciseResult {
  verdict: Verdict;
  error: AnswerError;
  grade: Grade;
  expected: string;
  note?: string;
  given: string;
}
```

Every branch that currently builds a result by hand must set all three. Use the same helper shape:

```ts
import { gradeFor, verdictFor, type AnswerError } from '@/learning/grading';

function fromError(error: AnswerError, expected: string, given: string, note?: string): ExerciseResult {
  return { verdict: verdictFor(error), error, grade: gradeFor(error), expected, note, given };
}
```

- `choice`: correct → `fromError('none', ...)`; wrong → `fromError('meaning', ...)`.
- `wordBank` / `typed` / `conversation` free: spread the `CheckResult`'s `verdict`, `error`, `grade`.
- `match`: perfect → `fromError('none', ...)`; otherwise → `fromError('spelling', ...)` so it keeps its `almost` grade.
- `speak`: skip → `fromError('spelling', ...)`; otherwise → `fromError('none', ...)`.
- `presentation` default → `fromError('none', '', '')`.

- [ ] **Step 5: Update the two `strictAccents` test call sites**

In `src/learning/__tests__/answer-check.test.ts`, change `{ strictAccents: true }` to `{ formIsTarget: true }`. The assertion stays `'almost'` — with no `accentCarriesMeaning` injected the predicate defaults to false, so this is `accentContrast` and still `almost`.

- [ ] **Step 6: Run the whole suite**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all green, with no assertion changed except the two renames. If a behaviour test changed, a mapping in Step 3 is wrong — fix the mapping, not the test.

- [ ] **Step 7: Commit**

```bash
git add src/learning/answer-check.ts src/learning/check.ts src/learning/__tests__/answer-check.test.ts
git commit -m "Carry the classification, not just the grade"
```

---

### Task 7: Task-aware accents

**Files:**
- Modify: `src/learning/answer-check.ts`
- Modify: `src/learning/__tests__/answer-check.test.ts`

**Interfaces:**
- Consumes: `GradingProfile.accentCarriesMeaning` from Task 1, `ACCENT_AMBIGUOUS` semantics from Task 2.
- Produces: no new exports. Behaviour only.

- [ ] **Step 1: Write the failing test**

Add a new `describe` block to `src/learning/__tests__/answer-check.test.ts`:

```ts
import { accentCarriesMeaning } from '@/content/accent-pairs';

describe('accents mean different things in different tasks', () => {
  const real = { accentCarriesMeaning };

  it('waves through an accent that distinguishes nothing', () => {
    // A phone keyboard, not an error. Full credit, with the spelling taught.
    for (const [given, expected] of [
      ['Quiero un cafe', 'Quiero un café'],
      ['El nino juega en el jardin', 'El niño juega en el jardín'],
      ['Cuantos anos tienes', '¿Cuántos años tienes?'],
      ['Vosotros comeis', 'Vosotros coméis'],
    ]) {
      const result = checkAnswer(given, [expected], real);
      expect(result.error).toBe('accent');
      expect(result.grade).toBe('correct');
      expect(result.note).toBeTruthy();
    }
  });

  it('flags an accent that changes which word it is, in free production', () => {
    // esta/está and como/cómo are different words. Still retrieval — the
    // learner produced the sentence — but not silent full credit.
    const result = checkAnswer('El nino esta en el jardin', ['El niño está en el jardín'], real);
    expect(result.error).toBe('accentContrast');
    expect(result.grade).toBe('almost');
  });

  it('fails it outright when the form is the thing being tested', () => {
    // A conjugation drill asking for the preterite. hablo is a real word and
    // the wrong one, so this is a form error, not an orthography note.
    const result = checkAnswer('hablo', ['habló'], { ...real, formIsTarget: true });
    expect(result.error).toBe('form');
    expect(result.grade).toBe('incorrect');
  });

  it('still forgives an innocent accent inside a form-testing task', () => {
    // Getting the conjugation right and the noun's accent wrong is not a
    // conjugation error.
    const result = checkAnswer('Bebo cafe', ['Bebo café'], { ...real, formIsTarget: true });
    expect(result.grade).not.toBe('incorrect');
  });

  it('stays permissive when no predicate is injected', () => {
    // The pure function cannot know the corpus, and defaults to not
    // distinguishing — the seam eligibility.ts uses for undefined knowledge.
    expect(checkAnswer('El nino esta en el jardin', ['El niño está en el jardín']).grade).toBe(
      'correct',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/learning/__tests__/answer-check.test.ts -t "accents mean different things"`
Expected: FAIL — every accent case still returns `accent`/`correct`.

- [ ] **Step 3: Implement**

In `answer-check.ts`, the accent branch currently records only `accentOnlyMatch`. Record **which words differed by accent** as well, so the decision can be made per word.

Replace the accent tracking with:

```ts
/** Words that differ between two equal-length normalised forms. */
function differingWords(a: string, b: string): [string, string][] {
  const left = a.split(' ');
  const right = b.split(' ');
  if (left.length !== right.length) return [];
  const out: [string, string][] = [];
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) out.push([left[i], right[i]]);
  }
  return out;
}
```

and in the accent branch, replace the single `accentOnlyMatch` with a record carrying the candidate and the differing pairs:

```ts
let accentMatch: { display: string; differing: [string, string][] } | null = null;
// ... inside the candidate loop, where `bareForms.includes(candidateBare)`:
accentMatch ??= {
  display: candidate.display,
  differing: differingWords(givenForms[0], candidate.variant),
};
```

Then replace the accent decision:

```ts
if (accentMatch !== null) {
  const carries = accentMatch.differing.some(([, expected]) =>
    profile.accentCarriesMeaning?.(expected) ?? false,
  );

  if (!carries) {
    return outcome('accent', accentMatch.display, `Remember the accent: ${accentMatch.display}`);
  }

  /**
   * The accent is the word. `está` is a verb and `esta` is "this"; `habló` is
   * the preterite and `hablo` is the present. Which of those two facts matters
   * depends on what the exercise was asking: inside a conjugation drill or a
   * dictation it is the entire point and the answer is wrong, and in a free
   * translation the learner produced the sentence and slipped on one mark.
   */
  const pair = accentMatch.differing.find(([, expected]) =>
    profile.accentCarriesMeaning?.(expected) ?? false,
  );
  const note = pair
    ? `${pair[1]} and ${pair[0]} are different words — the accent is the difference.`
    : `Watch the accents: ${accentMatch.display}`;

  return formIsTarget
    ? outcome('form', accentMatch.display, note)
    : outcome('accentContrast', accentMatch.display, note);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/learning/__tests__/answer-check.test.ts`
Expected: PASS, whole file.

**Two pre-existing assertions will now be wrong, and both changes are deliberate.** In the block `slips of the finger are still forgiven`, the line `correct('El nino esta en el jardin', 'El niño está en el jardín')` must move out — `esta`/`está` is a real contrast. Move it into the new block's `accentContrast` test (it is already there) and delete it from the old one. Leave `cafe`, `anos`, `jardin` and `comeis` exactly where they are; those are the cases the feature must not break. Add a comment on the deletion saying why.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/learning/answer-check.ts src/learning/__tests__/answer-check.test.ts
git commit -m "An accent is a keyboard slip or a different word, depending on the question"
```

---

### Task 8: Punctuation as something to teach

`normalize` strips `¿` and `¡` before comparing, so a learner who omits them is neither corrected nor told. The information is there; it is simply thrown away before anyone looks.

**Files:**
- Modify: `src/learning/answer-check.ts`
- Modify: `src/learning/__tests__/answer-check.test.ts`

**Interfaces:** no new exports.

- [ ] **Step 1: Write the failing test**

```ts
describe('Spanish punctuation is taught, not silently ignored', () => {
  it('accepts a missing opening mark and says so', () => {
    const result = checkAnswer('Cómo estás?', ['¿Cómo estás?']);
    expect(result.error).toBe('punctuation');
    expect(result.grade).toBe('correct');
    expect(result.note).toContain('¿');
  });

  it('says nothing when the punctuation was right', () => {
    expect(checkAnswer('¿Cómo estás?', ['¿Cómo estás?']).error).toBe('none');
  });

  it('does not complain about punctuation the answer never needed', () => {
    expect(checkAnswer('Tengo un perro', ['Tengo un perro.']).error).toBe('none');
  });

  it('never lets a punctuation note outrank a real error', () => {
    // Wrong word AND missing marks: the wrong word is what matters.
    expect(checkAnswer('Como estas tu?', ['¿Cómo está usted?']).verdict).toBe('incorrect');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/learning/__tests__/answer-check.test.ts -t "punctuation is taught"`
Expected: FAIL — `error` is `none`, note undefined.

- [ ] **Step 3: Implement**

Add above `checkAnswer`:

```ts
/**
 * Spanish opens a question and an exclamation as well as closing it, and
 * `normalize` strips both marks before comparing — so the app has always
 * accepted the omission and never once mentioned it. That is a keystroke the
 * course asks for and then ignores, which is the same shape as the dialogue
 * dash. The difference is that the dash carries nothing and the opening mark is
 * real Spanish, so the fix is opposite: teach it rather than stop asking.
 *
 * Only reported when the answer is otherwise exactly right. A missing ¿ beside
 * a wrong verb is not what the learner needs to hear about.
 */
function missingOpeningMark(input: string, expected: string): '¿' | '¡' | null {
  if (expected.includes('¿') && !input.includes('¿')) return '¿';
  if (expected.includes('¡') && !input.includes('¡')) return '¡';
  return null;
}
```

In the exact-match branch, before returning `outcome('none', ...)`:

```ts
if (givenForms.includes(candidate.variant)) {
  const mark = missingOpeningMark(input, candidate.display);
  return mark === null
    ? outcome('none', candidate.display)
    : outcome(
        'punctuation',
        candidate.display,
        `Spanish opens it too: ${candidate.display}`,
      );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/learning/__tests__/answer-check.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/learning/answer-check.ts src/learning/__tests__/answer-check.test.ts
git commit -m "Teach the opening mark instead of quietly ignoring it"
```

---

### Task 9: Paraphrase — English, Spanish variants, and free turns

**Files:**
- Modify: `src/learning/answer-check.ts`
- Modify: `src/learning/__tests__/answer-check.test.ts`

**Interfaces:**
- Consumes: `spanishVariants` (Task 4); `meaningCoverage`, `contentWords`, `polarity`, `COVERAGE_THRESHOLD` (Task 5); `Equivalences` on the profile (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**

```ts
import { EN_EQUIVALENCES } from '@/content/equivalences';

describe('paraphrase', () => {
  const en = { language: 'en' as const, equivalences: EN_EQUIVALENCES };

  it('accepts the natural English renderings of a set phrase', () => {
    for (const given of [
      'pleased to meet you',
      'nice to meet you',
      'lovely to meet you',
      'delighted to meet you',
      'a pleasure to meet you',
    ]) {
      const result = checkAnswer(given, ['Nice to meet you.'], en);
      expect(result.verdict).not.toBe('incorrect');
    }
  });

  it('shows the canonical wording so precision is still taught', () => {
    const result = checkAnswer('lovely to meet you', ['Nice to meet you.'], en);
    expect(result.best).toBe('Nice to meet you.');
    expect(result.error).toBe('paraphrase');
  });

  it('still refuses an English answer that means something else', () => {
    expect(checkAnswer('Very bad, and you?', ['Very well, and you?'], en).verdict).toBe('incorrect');
    expect(checkAnswer('I have a cat', ['I have a dog'], en).verdict).toBe('incorrect');
    expect(checkAnswer('I do not like coffee', ['I like coffee'], en).verdict).toBe('incorrect');
  });

  it('accepts a derived Spanish variant without any authoring', () => {
    expect(checkAnswer('Voy a el cine', ['Voy al cine'], { language: 'es' }).verdict).not.toBe(
      'incorrect',
    );
    expect(checkAnswer('Te quiero ver', ['Quiero verte'], { language: 'es' }).verdict).not.toBe(
      'incorrect',
    );
  });

  it('does not loosen an ordinary Spanish translation into word salad', () => {
    expect(checkAnswer('perro un tengo', ['Tengo un perro'], { language: 'es' }).verdict).toBe(
      'incorrect',
    );
  });

  it('lets a free turn be answered in the learner’s own words', () => {
    const models = [
      'De acuerdo, siempre y cuando esta vez se resuelva de verdad.',
      'Acepto siempre y cuando me confirmen por escrito.',
    ];
    const result = checkAnswer('Vale, siempre y cuando se resuelva esta vez', models, {
      language: 'es',
      paraphrase: 'spanishFree',
    });
    expect(result.verdict).not.toBe('incorrect');
    expect(result.error).toBe('paraphrase');
    expect(models).toContain(result.best);
  });

  it('still refuses a free turn that answers a different question', () => {
    const result = checkAnswer('¿Dónde está la estación de tren?', [
      'De acuerdo, siempre y cuando esta vez se resuelva de verdad.',
    ], { language: 'es', paraphrase: 'spanishFree' });
    expect(result.verdict).toBe('incorrect');
  });

  it('marks a match against a non-canonical alternative as preferred', () => {
    const result = checkAnswer('Ahora voy a comer', ['Voy a comer ahora.', 'Ahora voy a comer.'], {
      language: 'es',
    });
    expect(result.error).toBe('preferred');
    expect(result.grade).toBe('correct');
    expect(result.best).toBe('Voy a comer ahora.');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/learning/__tests__/answer-check.test.ts -t "paraphrase"`
Expected: FAIL on the phrase group, the Spanish variants, the free turn and `preferred`.

- [ ] **Step 3: Implement**

Three changes.

**(a) Spanish variants in `buildCandidates`.** For `language === 'es'`, add every `spanishVariants(normalized)` entry alongside the pronoun-stripped form, all pointing at the same `display`. Also expand the *learner's* forms the same way, so a variant on either side matches.

```ts
const forms =
  language === 'es'
    ? [...new Set(spanishVariants(raw).flatMap((v) => [v, stripSubjectPronoun(v)]))]
    : [raw];
```

**(b) `preferred`.** `buildCandidates` already carries `display`. Add a `canonical: boolean` — true only for variants derived from `accepted[0]`. On an exact match against a non-canonical candidate, return `outcome('preferred', accepted[0], ...)` with `best` set to `accepted[0]`, not to the matched alternative. The note names the preferred form:

```ts
outcome('preferred', accepted[0], `Also right. The usual way to say it: ${accepted[0]}`)
```

**(c) The paraphrase layer**, replacing the current `if (language === 'en')` block:

```ts
const mode = profile.paraphrase ?? (language === 'en' ? 'english' : 'spanish');

if (mode === 'english') {
  for (const candidate of candidates) {
    // Whole-phrase equivalence first: "a pleasure to meet you" relates to
    // "nice to meet you" as a unit and by no word-level mapping at all.
    const givenPhrase = profile.equivalences?.phrase.get(raw);
    const candidatePhrase = profile.equivalences?.phrase.get(candidate.variant);
    if (givenPhrase !== undefined && givenPhrase === candidatePhrase) {
      return outcome('paraphrase', candidate.display);
    }
    if (sameEnglishMeaning(raw, candidate.variant, profile.equivalences)) {
      return outcome('paraphrase', candidate.display);
    }
  }
}

if (mode === 'spanishFree') {
  /**
   * A free conversation turn. Exact matching against four long authored
   * sentences is a test the learner cannot pass, so the question here is
   * whether they said the same thing — and the closest model becomes the
   * answer shown, so they see the natural phrasing they did not quite reach.
   */
  let best: { display: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = meaningCoverage(raw, candidate.variant, profile.equivalences);
    if (!best || score > best.score) best = { display: candidate.display, score };
  }
  if (best && best.score >= COVERAGE_THRESHOLD) {
    return outcome('paraphrase', best.display, `Natural version: ${best.display}`);
  }
}
```

Change `sameEnglishMeaning(a, b)` to take the optional `Equivalences` and pass it into `contentWords`. Delete `EN_STOPWORDS`, `EN_SYNONYMS`, `EN_POLARITY`, `polarity` and `contentWords` from `answer-check.ts` — they now live in `meaning.ts`, and two copies of "what is a content word" is exactly how a diagnostic stops describing the thing it watches.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS. The existing `English comprehension leniency` block must stay green untouched — if `accepts synonyms and dropped articles` breaks, `contentWords` is no longer applying the word map.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/learning/answer-check.ts src/learning/__tests__/answer-check.test.ts
git commit -m "Accept the meaning, teach the wording"
```

---

### Task 10: Assemble the profile in `check.ts`

`check.ts` is the single grading entry point and the only place that sees both the exercise and the settings. The profile is assembled here and nowhere else — the alternative is every screen composing a tolerance by hand, which is the state `scope.ts` was written to end.

**Files:**
- Modify: `src/learning/check.ts`
- Test: `src/learning/__tests__/grading.test.ts`

**Interfaces:**
- Consumes: `accentCarriesMeaning` (Task 2), `EN_EQUIVALENCES` (Task 3), `GradingProfile` (Task 1).
- Produces: `profileFor(exercise: Exercise, settings: Settings): GradingProfile`, exported from `check.ts`.

- [ ] **Step 1: Write the failing test**

Add to `src/learning/__tests__/grading.test.ts`:

```ts
import { profileFor } from '@/learning/check';
import type { Exercise } from '@/learning/exercise';
import { DEFAULT_SETTINGS } from '@/learning/defaults';

const exercise = (patch: Partial<Exercise>) =>
  ({ id: 'x', kind: 'translateToEs', form: 'typed', conceptIds: [], difficulty: 3, xp: 10,
     instruction: '', ...patch }) as Exercise;

describe('profileFor', () => {
  it('makes a dictation about the exact written form', () => {
    expect(profileFor(exercise({ kind: 'dictation' }), DEFAULT_SETTINGS).formIsTarget).toBe(true);
  });

  it('makes a conjugation exercise about the form, whatever its kind', () => {
    const p = profileFor(exercise({ kind: 'fillBlank', targetId: 'f.hablar.preterite' }), DEFAULT_SETTINGS);
    expect(p.formIsTarget).toBe(true);
  });

  it('leaves an ordinary translation free of form-testing', () => {
    const p = profileFor(exercise({ kind: 'translateToEs', targetId: 'v.casa' }), DEFAULT_SETTINGS);
    expect(p.formIsTarget).toBe(false);
  });

  it('honours the learner’s own strict-accent setting everywhere', () => {
    const p = profileFor(exercise({ kind: 'translateToEs' }), { ...DEFAULT_SETTINGS, strictAccents: true });
    expect(p.formIsTarget).toBe(true);
  });

  it('gives English comprehension the English paraphrase layer', () => {
    const p = profileFor(exercise({ kind: 'translateToEn' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('english');
    expect(p.language).toBe('en');
  });

  it('gives a free conversation turn meaning coverage', () => {
    const p = profileFor(exercise({ kind: 'conversation', form: 'conversation' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('spanishFree');
  });

  it('gives a gap-fill no paraphrase at all — one word is the answer', () => {
    const p = profileFor(exercise({ kind: 'fillBlank' }), DEFAULT_SETTINGS);
    expect(p.paraphrase).toBe('none');
  });

  it('always injects the corpus knowledge, so the app is never the permissive default', () => {
    const p = profileFor(exercise({}), DEFAULT_SETTINGS);
    expect(p.accentCarriesMeaning?.('esta')).toBe(true);
    expect(p.accentCarriesMeaning?.('cafe')).toBe(false);
    expect(p.equivalences).toBeDefined();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/learning/__tests__/grading.test.ts -t "profileFor"`
Expected: FAIL — `profileFor` is not exported.

- [ ] **Step 3: Implement**

Add to `src/learning/check.ts`:

```ts
import { accentCarriesMeaning } from '@/content/accent-pairs';
import { EN_EQUIVALENCES } from '@/content/equivalences';
import type { GradingProfile } from '@/learning/grading';

/** Kinds where the exact written form is what is being examined. */
const FORM_IS_TARGET = new Set<ExerciseKind>(['dictation']);

/** Kinds whose answer is a whole free utterance rather than a rendering of one. */
const FREE_PRODUCTION = new Set<ExerciseKind>(['conversation', 'buildResponse']);

/** Kinds where a single word is the answer and there is nothing to paraphrase. */
const NO_PARAPHRASE = new Set<ExerciseKind>(['fillBlank', 'dictation']);

/**
 * What this exercise is actually asking for.
 *
 * Assembled here because `check.ts` is the one place that sees the exercise and
 * the settings together, and because a tolerance composed at the call site is
 * the kind of correctness that decays the first time somebody adds a button.
 */
export function profileFor(exercise: Exercise, settings: Settings): GradingProfile {
  const language: 'es' | 'en' =
    exercise.form === 'typed' && exercise.language === 'en' ? 'en' : 'es';

  /**
   * A verb-paradigm target means the exercise exists to test that exact form,
   * whatever kind it was rendered as. `f.hablar.preterite` asking for `habló`
   * cannot accept `hablo`, because `hablo` is the thing it is distinguishing
   * from. Derived from the id rather than declared, the way the rest of the
   * paradigm machinery works.
   */
  const testsAParadigm = exercise.targetId?.startsWith('f.') ?? false;

  const paraphrase: GradingProfile['paraphrase'] = NO_PARAPHRASE.has(exercise.kind)
    ? 'none'
    : language === 'en'
      ? 'english'
      : FREE_PRODUCTION.has(exercise.kind)
        ? 'spanishFree'
        : 'spanish';

  return {
    language,
    formIsTarget: FORM_IS_TARGET.has(exercise.kind) || testsAParadigm || settings.strictAccents,
    paraphrase,
    accentCarriesMeaning,
    equivalences: EN_EQUIVALENCES,
  };
}
```

Replace the three `checkAnswer(...)` call sites in `checkExercise` with `checkAnswer(answer, exercise.accepted, profileFor(exercise, settings))`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS. `journey.test.ts` and `session.test.ts` go through `checkExercise`, so they now exercise the real predicate — if one fails, read it carefully. A checkpoint answer that now grades `almost` instead of `correct` because of a real accent contrast is the feature working.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/learning/check.ts src/learning/__tests__/grading.test.ts
git commit -m "Assemble the grading profile once, where the exercise is known"
```

---

### Task 11: Classify the failure

Returning a bare `incorrect` throws away what the app just learned. The classification is what lets a mistake record say *tense error* rather than *wrong*, and what Task 12 of the next sub-project will scaffold from.

**Files:**
- Modify: `src/learning/answer-check.ts`
- Modify: `src/learning/__tests__/answer-check.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
describe('a wrong answer says what kind of wrong', () => {
  const classify = (given: string, expected: string) =>
    checkAnswer(given, [expected], { accentCarriesMeaning }).error;

  it('names a reversed polarity', () => {
    expect(checkAnswer('I like coffee', ['I do not like coffee'], {
      language: 'en', equivalences: EN_EQUIVALENCES,
    }).error).toBe('negation');
  });

  it('names an inflection error', () => {
    expect(classify('Yo hablas español', 'Yo hablo español')).toBe('form');
    expect(classify('Los libros rojo', 'Los libros rojos')).toBe('form');
  });

  it('names a wrong function word', () => {
    expect(classify('Soy cansado', 'Estoy cansado')).toBe('grammar');
    expect(classify('Gracias para la comida', 'Gracias por la comida')).toBe('grammar');
  });

  it('names a different meaning', () => {
    expect(classify('Tengo un gato', 'Tengo un perro')).toBe('meaning');
    expect(classify('Voy al cine mañana con mi hermana', 'Tengo hambre')).toBe('meaning');
  });

  it('classifies without ever changing the verdict', () => {
    // Every one of these is incorrect. Classification is extra information,
    // never a softening.
    for (const [given, expected] of [
      ['Yo hablas español', 'Yo hablo español'],
      ['Soy cansado', 'Estoy cansado'],
      ['Tengo un gato', 'Tengo un perro'],
    ]) {
      expect(checkAnswer(given, [expected], { accentCarriesMeaning }).verdict).toBe('incorrect');
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/learning/__tests__/answer-check.test.ts -t "what kind of wrong"`
Expected: FAIL — everything returns `meaning`.

- [ ] **Step 3: Implement**

Add above `checkAnswer`:

```ts
/**
 * Function words whose swap is a grammar error rather than a different idea:
 * ser against estar, por against para, an article of the wrong gender.
 */
const FUNCTION_WORDS = new Set([
  'soy', 'eres', 'es', 'somos', 'sois', 'son', 'ser',
  'estoy', 'estas', 'esta', 'estamos', 'estais', 'estan', 'estar',
  'por', 'para', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'lo', 'le', 'les', 'me', 'te', 'se', 'nos', 'os', 'mi', 'tu', 'su',
  'muy', 'mucho', 'hay', 'de', 'a', 'en', 'con', 'sin',
]);

/** Letters two words share from the start. */
function sharedPrefix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

/**
 * What kind of wrong this is.
 *
 * Not a softening — every value returned here maps to `incorrect`. It exists
 * because "wrong" is the least useful thing the app can record about an answer
 * it has just analysed in detail, and because a mistake queue that knows a
 * tense error from a vocabulary error can scaffold the retry differently.
 *
 * The separation is positional, the same insight that separates a typo from a
 * grammar error. Spanish inflection lives at the end of a word, so two words
 * sharing a long prefix and differing at the end are the same word in a
 * different form (hablo/hablas, rojo/rojos). Two words sharing nothing are
 * different words — and if one of them is a function word, the error is
 * grammatical rather than semantic.
 */
function classifyFailure(given: string, expected: string): AnswerError {
  const left = given.split(' ');
  const right = expected.split(' ');

  if (polarity(left.map(deaccent)) !== polarity(right.map(deaccent))) return 'negation';

  if (left.length === right.length) {
    const differing: [string, string][] = [];
    for (let i = 0; i < left.length; i += 1) {
      if (deaccent(left[i]) !== deaccent(right[i])) differing.push([left[i], right[i]]);
    }

    if (differing.length > 0 && differing.length <= 2) {
      const [a, b] = differing[0];
      const bareA = deaccent(a);
      const bareB = deaccent(b);

      // Same word, different ending: person, tense, number, gender, mood.
      if (sharedPrefix(bareA, bareB) >= 3 && bareA !== bareB) return 'form';

      // A closed-class swap: ser for estar, por for para, el for la.
      if (FUNCTION_WORDS.has(bareA) || FUNCTION_WORDS.has(bareB)) return 'grammar';
    }
  }

  return 'meaning';
}
```

Replace the final fallthrough:

```ts
const closestVariant = candidates.find((c) => c.display === (closest?.answer ?? fallback));
return outcome(
  classifyFailure(deaccent(raw), deaccent(closestVariant?.variant ?? normalize(fallback, language))),
  closest?.answer ?? fallback,
);
```

Import `polarity` from `@/learning/meaning`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS. Note that `Soy cansado`/`Estoy cansado` reaches `grammar` because `soy` and `estoy` share a prefix of 0 and `soy` is a function word — check that ordering, because a `sharedPrefix >= 3` test placed after the function-word test would classify it as `grammar` too and pass for the wrong reason.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint
git add src/learning/answer-check.ts src/learning/__tests__/answer-check.test.ts
git commit -m "Say what kind of wrong, not just wrong"
```

---

### Task 12: Teach the canonical form in the feedback bar

`FeedbackBar` suppresses the model answer whenever the grade is `correct`, which is exactly why a learner who wrote `pleased to meet you` is told "¡Bien!" and never shown the wording the course prefers. The brief's central request — reward comprehension, still teach precision — lands here.

**Files:**
- Modify: `src/components/learn/feedback-bar.tsx`
- Modify: `src/learning/teaching.ts`
- Modify: `src/learning/__tests__/teaching.test.ts`
- Modify: `src/learning/types.ts`
- Modify: `src/context/LearnerContext.tsx`

**Interfaces:**
- Consumes: `Verdict`, `AnswerError` from Task 1; `ExerciseResult` from Task 6.
- Produces: `MistakeRecord.error?: AnswerError`.

- [ ] **Step 1: Write the failing test**

Add to `src/learning/__tests__/teaching.test.ts`:

```ts
it('shows the meaning whenever the answer was not exactly right', () => {
  // A correctWithFeedback answer is still an answer with something to learn
  // from, and the old rule keyed off grade — which is `correct` for a
  // paraphrase, so the teaching was suppressed exactly when it was wanted.
  expect(shouldShowMeaning(exercise, 'correctWithFeedback', 'C1')).toBe(true);
  expect(shouldShowMeaning(exercise, 'correct', 'C1')).toBe(false);
  expect(shouldShowMeaning(exercise, 'incorrect', 'C1')).toBe(true);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/learning/__tests__/teaching.test.ts`
Expected: FAIL — `shouldShowMeaning` takes a `Grade`.

- [ ] **Step 3: Implement**

**(a)** In `src/learning/teaching.ts`, change `shouldShowMeaning(exercise, grade: Grade, level)` to take `verdict: Verdict` and test `if (verdict !== 'correct') return true;`. Update `teachingFor` to pass `result.verdict`, and change the `alreadyShown` guard from `result.grade !== 'correct'` to `result.verdict !== 'correct'`.

**(b)** In `src/components/learn/feedback-bar.tsx`, key the scheme off `result.verdict` and add the middle state:

```tsx
const scheme = {
  correct: {
    tone: theme.success, soft: theme.successSoft,
    icon: 'checkmark-circle' as const, title: '¡Bien!',
  },
  correctWithFeedback: {
    tone: theme.success, soft: theme.successSoft,
    icon: 'checkmark-circle' as const, title: '¡Bien!',
  },
  incorrect: {
    tone: theme.danger, soft: theme.dangerSoft,
    icon: 'information-circle' as const, title: 'Not quite',
  },
}[result.verdict];
```

The middle state deliberately shares the success tone and title. It **is** correct — a different colour would read as a demerit, which is the thing the brief asked to stop. What distinguishes it is that the answer and the note appear.

Change the answer gate:

```tsx
/**
 * Shown whenever there is something to learn from, not only when the answer
 * was wrong. A learner who wrote "pleased to meet you" understood the Spanish
 * perfectly and should still see the wording the course prefers — the old rule
 * keyed off `correct`, so it suppressed the teaching in exactly the case the
 * teaching existed for.
 */
const showAnswer = result.error !== 'none' && result.expected.length > 0;
```

Change the `BETTER`/`ANSWER` label so a correct-with-feedback answer is not labelled as a correction:

```tsx
{result.verdict === 'incorrect' ? (showGiven ? 'BETTER' : 'ANSWER') : 'PREFERRED'}
```

And drop the strikethrough on `given` when the verdict is not `incorrect` — striking through an answer that was accepted contradicts the tick above it:

```tsx
<Text
  variant="esSmall"
  tone={scheme.tone}
  style={result.verdict === 'incorrect' ? styles.given : undefined}>
  {given}
</Text>
```

**(c)** In `src/learning/types.ts`, add to `MistakeRecord`, below the reproduction divider:

```ts
  /**
   * What kind of error this was. Optional, so no `STATE_VERSION` bump — a
   * record from an earlier build simply comes back without it.
   */
  error?: AnswerError;
```

Import the type at the top of `types.ts`? No — `AnswerError` lives in `grading.ts`, which imports `Grade` from `types.ts`. Declare `AnswerError` in `types.ts` beside `Grade` and re-export it from `grading.ts` instead, to keep the dependency one-way.

**(d)** In `src/context/LearnerContext.tsx`, add `error` to `RecordAnswerInput` and set it on the `MistakeRecord`. In `src/app/session.tsx`, pass `error: outcome.error` in the `recordAnswer` call.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all green.

- [ ] **Step 5: Verify it renders on web**

Run: `npx expo export --platform web`
Expected: completes, every route statically renders. This catches what a dev-server smoke test misses, and the feedback bar is on a route the export renders.

- [ ] **Step 6: Commit**

```bash
git add src/components/learn/feedback-bar.tsx src/learning/teaching.ts src/learning/types.ts src/learning/grading.ts src/context/LearnerContext.tsx src/app/session.tsx src/learning/__tests__/teaching.test.ts
git commit -m "Reward the comprehension, show the preferred form"
```

---

### Task 13: Light up `VocabConcept.altEn`

The field is declared in `content/types.ts` with the comment "Additional English renderings accepted when translating ES → EN" and is read by nothing in the codebase.

**Files:**
- Modify: `src/learning/generator.ts`
- Test: `src/learning/__tests__/grading.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { vocabConcepts } from '@/content';

describe('altEn', () => {
  it('is offered to the grader wherever a concept declares it', () => {
    const withAlts = vocabConcepts.filter((c) => (c.altEn?.length ?? 0) > 0);
    // If the corpus declares none yet, this test is still the guard that the
    // wiring exists — add one to `foundations.ts` rather than deleting it.
    expect(withAlts.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Add alternatives to the concept the brief named**

In `src/content/vocab/foundations.ts`, on `p.encantado`:

```ts
    en: 'nice to meet you',
    altEn: ['pleased to meet you', 'delighted to meet you', 'a pleasure to meet you'],
```

- [ ] **Step 3: Use it in the generator**

In `buildMultipleChoice`, the correct option's text stays `concept.en` — a multiple choice is exact by construction and offering three synonyms as separate options would make it unanswerable. The wiring belongs where a concept is graded as *typed* text. Search `generator.ts` for every place a `VocabConcept`'s `en` becomes an `accepted` array and add `...(concept.altEn ?? [])`. If there is no such place today, add the spread to `buildTranslateToEn`'s sentence-level accepted list for sentences whose only tagged concept declares alternatives:

```ts
accepted: [sentence.en, ...(sentence.altEn ?? [])],
```

stays as-is, and instead extend `buildMatch`'s pair text? No — leave `buildMatch` alone. The honest wiring is: pass `altEn` into the equivalence lookup at grade time. In `check.ts`'s `profileFor`, no change is needed; instead, in `checkExercise`'s `typed` branch, extend the accepted list:

```ts
case 'typed': {
  const accepted =
    exercise.language === 'en'
      ? [...exercise.accepted, ...conceptAlternatives(exercise.conceptIds)]
      : exercise.accepted;
  const result = checkAnswer(answer, accepted, profileFor(exercise, settings));
  // ...
}
```

with a helper in `check.ts`:

```ts
/**
 * Extra English renderings the concepts under test declare. `VocabConcept.altEn`
 * has been in the type since the content model was written and read by nothing,
 * so a concept could declare that "a pleasure to meet you" is a valid rendering
 * and the grader would still refuse it.
 */
function conceptAlternatives(conceptIds: string[]): string[] {
  const out: string[] = [];
  for (const id of conceptIds) {
    const concept = getConcept(id);
    if (concept && isVocabConcept(concept) && concept.altEn) out.push(...concept.altEn);
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run typecheck && npm run lint && npm run audit:content`
Expected: all green, audit still 11/11 with zero warnings.

- [ ] **Step 5: Commit**

```bash
git add src/learning/check.ts src/content/vocab/foundations.ts src/learning/__tests__/grading.test.ts
git commit -m "Read altEn, which the type has always promised and nothing honoured"
```

---

### Task 14: The corpus tests — self-consistency and mutation

Hand-written adversarial examples test the examples someone remembered. These two test the corpus, and they grow with it.

**Files:**
- Create: `src/learning/__tests__/grading-corpus.test.ts`

**Interfaces:** consumes everything above. Produces nothing.

- [ ] **Step 1: Write the self-consistency test**

```ts
import { conversations, sentences } from '@/content';
import { accentCarriesMeaning } from '@/content/accent-pairs';
import { EN_EQUIVALENCES } from '@/content/equivalences';
import { checkAnswer } from '@/learning/answer-check';
import { COVERAGE_THRESHOLD, meaningCoverage } from '@/learning/meaning';

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

  it('lets every free conversation turn be answered with its own model', () => {
    // The defect that started this: 107 turns nobody could pass. Each turn's
    // own authored answers must clear the coverage threshold against the turn.
    const failures: string[] = [];
    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted?.length) continue;
        for (const model of turn.accepted) {
          const best = Math.max(...turn.accepted.map((m) => meaningCoverage(model, m)));
          if (best < COVERAGE_THRESHOLD) failures.push(`${scene.id}: ${model}`);
        }
      }
    expect(failures).toEqual([]);
  });

  it('holds the threshold below every authored model’s own score', () => {
    // Calibration, asserted rather than assumed: if this drops, the threshold
    // is above what a real answer scores and the layer is dead.
    let worst = 1;
    for (const scene of conversations)
      for (const turn of scene.turns) {
        if (turn.speaker !== 'you' || !turn.accepted?.length) continue;
        for (const model of turn.accepted) worst = Math.min(worst, meaningCoverage(model, model));
      }
    expect(worst).toBeGreaterThanOrEqual(COVERAGE_THRESHOLD);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx jest src/learning/__tests__/grading-corpus.test.ts`
Expected: PASS. A failure here names real content — a sentence whose own text the grader refuses is a defect in the grader, and a `altEs` entry that fails is either a bad alternative or a variant rule that overreaches. Fix whichever it is; never lower the threshold to make this pass.

- [ ] **Step 3: Write the mutation test**

Append to the same file:

```ts
/**
 * The other half.
 *
 * Every change in this pass makes the grader more permissive, and the failure
 * mode of permissiveness is silent: nothing breaks, tests stay green, and the
 * app quietly accepts answers that are wrong. Hand-written adversarial examples
 * only cover the examples somebody remembered, so these mutate the corpus
 * itself — the same six error classes the brief named, applied to every
 * sentence that can carry them.
 */
const MUTATIONS: { name: string; apply: (es: string) => string | null }[] = [
  {
    name: 'ser for estar',
    apply: (t) => {
      const swapped = t.replace(/\b(estoy|estás|está|estamos|estáis|están)\b/i, (m) =>
        ({ estoy: 'soy', estás: 'eres', está: 'es', estamos: 'somos', estáis: 'sois', están: 'son' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
  {
    name: 'estar for ser',
    apply: (t) => {
      const swapped = t.replace(/\b(soy|eres|es|somos|sois|son)\b/i, (m) =>
        ({ soy: 'estoy', eres: 'estás', es: 'está', somos: 'estamos', sois: 'estáis', son: 'están' })[
          m.toLowerCase()
        ] ?? m);
      return swapped === t ? null : swapped;
    },
  },
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
```

- [ ] **Step 4: Run it**

Run: `npx jest src/learning/__tests__/grading-corpus.test.ts`
Expected: PASS.

Failures here are the real output of this task. Read each one:
- A mutation accepted as `spelling` means `isTypo`'s shared-suffix rule let a grammar change through — tighten it.
- A mutation accepted as `paraphrase` under `spanish` means a derived variant overreaches. The most likely culprit is clitic climbing; the spec authorises removing it if the corpus shows it misfiring.
- A mutation accepted with a `sameEnglishMeaning` path means an equivalence class is too broad. Split the class.
- A `negation added` mutation that produces nonsense Spanish (`Hola no qué tal`) and is refused is correct behaviour; if the mutation is too crude to be meaningful, narrow the mutation, not the grader.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint && npm run audit:content
git add src/learning/__tests__/grading-corpus.test.ts
git commit -m "Two corpus tests: it must accept its own answers and refuse mutations of them"
```

---

### Task 15: Update the documentation that is now wrong

`CLAUDE.md` records an invariant this work deliberately changes and a gap it closes. Leaving them is worse than having written nothing, because the next reader will trust them.

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/specs/2026-08-20-tutor-grading-design.md`

- [ ] **Step 1: Replace the "Known gap" paragraph**

In `CLAUDE.md`, under "Answer checking is asymmetric on purpose", the bullet beginning **"Known gap: accent-only minimal pairs"** is now false. Replace it with a bullet explaining that `content/accent-pairs.ts` derives the 64 minimal-pair groups from Spanish text alone, that the same keystroke is orthography in a translation and a form error in a conjugation drill, and that deriving from *Spanish only* is what keeps `años` and `español` out of the set.

- [ ] **Step 2: Add the grading-vocabulary invariant**

Add a new bullet under "Key invariants":

> **One classifier, one policy table.** `checkAnswer` decides an `AnswerError` and nothing else; `ERROR_POLICY` in `learning/grading.ts` derives both the learner-facing `Verdict` and the SRS-facing `Grade` from it. Never set a grade by hand — that is how the banner and the scheduler come to disagree. `correctWithFeedback` is successful retrieval in both its forms.

- [ ] **Step 3: Update the testing table**

Add rows to "Which suite guards what":

| Suite | Guards |
|---|---|
| `grading.test.ts` | the policy table's totality, and what each exercise kind is actually testing |
| `grading-corpus.test.ts` | that the corpus accepts its own answers, and refuses six classes of mutation of them |

- [ ] **Step 4: Mark the spec implemented**

Change the spec's `**Status:**` line to `implemented`.

- [ ] **Step 5: Run the gates and commit**

```bash
npm test && npm run typecheck && npm run lint && npm run audit:content && npx expo export --platform web
git add CLAUDE.md docs/superpowers/specs/2026-08-20-tutor-grading-design.md
git commit -m "Docs: an accent gap that is now closed, and the rule that replaced it"
```

---

## Verification before calling this done

Run all four gates and read the output, not the exit code:

```bash
npm test
npm run typecheck
npm run lint
npm run audit:content          # 11/11, zero warnings
npx expo export --platform web # every route statically renders
```

Then check the three things the brief asked for by hand, in the running app:

1. `encantado` → type `pleased to meet you`. Expect a tick, and the canonical wording shown beneath it.
2. `café` → type `cafe`. Expect a tick and "Remember the accent".
3. A conjugation exercise on a preterite → type the present form. Expect a refusal, with the note naming the contrast.
