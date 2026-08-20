# Grading like a tutor, not a string comparator

**Status:** approved design, pending implementation
**Scope:** P1 of four. See "Where this sits" at the end.

## The problem, measured

Three separate defects, each found by probing the corpus rather than by reading
the code.

**1. Free conversation turns are effectively ungradeable.** 107 free-typed
`conversation` / `buildResponse` turns are graded by exact match against four
hand-authored alternatives apiece, each a full natural sentence:

```
["no es que dude de su sistema, es que el servicio sigue sin funcionar",
 "más bien diría que el sistema no refleja la realidad",
 "no es que no le crea, pero sigo sin conexión",
 "permítame que matice: figurará como resuelta, pero no lo está"]
```

The probability of a learner producing one of those verbatim is approximately
zero. This is the single largest source of "I knew what that meant but the app
wanted different wording", and it is invisible from the call site because the
exercise looks well-formed.

**2. English comprehension rejects obvious paraphrases.** `sameEnglishMeaning`
compares content-word multisets and tolerates an unmatched word only via a
length difference. So for `nice to meet you`, the answer `pleased to meet you`
has equal length, one non-matching word, and is **rejected**. So are
`delighted`, `lovely`, `a pleasure`. The synonym table backing it is 25 entries,
one-directional, and buried inside `learning/answer-check.ts`.

**3. Accents are folded away globally, including where the accent is the
lesson.** `deaccent` runs on every comparison, so `hablo` is accepted for
`habló` and `esta` for `está` — even inside a conjugation drill whose entire
purpose is that distinction. `CLAUDE.md` records this as unsolvable without
knowing which words are verbs.

It is solvable, and without a dictionary. Deriving from **Spanish text only** —
sentence `es` and `altEs`, vocabulary headwords, drill sentences, conversation
turns and every conjugated form — 3,397 distinct surface words collapse into
**65 groups** where two real forms differ only by an accent. Every one is a
genuine minimal pair:

| family | examples |
|---|---|
| diacritical accent | `qué/que` · `él/el` · `sí/si` · `mí/mi` · `sé/se` · `té/te` · `dé/de` · `cómo/como` · `dónde/donde` · `cuándo/cuando` · `quién/quien` · `cuál/cual` · `aún/aun` |
| demonstrative vs verb | `está/esta` · `estás/estas` · `esté/este` |
| present *yo* vs preterite *él* | `hablo/habló` · `trabajo/trabajó` · `cambio/cambió` · `llego/llegó` · `paso/pasó` · `llamo/llamó` |
| subjunctive vs preterite *yo* | `hable/hablé` · `llegue/llegué` · `quede/quedé` · `deje/dejé` |
| noun vs imperative + clitic | `tomate/tómate` |

(The first probe of this said 64. It walked `naturalDrills` through a field name
that does not exist — `option.text` rather than `option.es` — and so read none of
them, missing `pase/pasé`. The implementation walks them and the number is 65.)

Deriving from Spanish text only is load-bearing rather than tidy. An earlier
pass scanned every string literal in `content/` and produced 107 groups — but
that swept in English homographs (`opinion`, `decision`, `reunion`) and ASCII
slugs (`espanol`, `anos`, `manana`), which would have made `años`, `español` and
`mañana` accent-critical and downgraded a learner who typed them without the
diacritic on a phone keyboard. Restricted to Spanish, `café`, `años`, `español`,
`mañana`, `niño` and `jardín` all correctly fall **outside** the set.

"Does this accent carry meaning?" is therefore *derived data*, exactly as
`verb-corpus.ts` derives which sentences contain which conjugated form — and it
tracks the corpus for free as content is added.

**A non-defect, for the record.** A dropped comma was reported as failing an
answer. `normalize` already strips `, . ; : ¿ ¡ " ' « » ( ) - – —` on both
sides. Probing the whole corpus — every comma deleted from every Spanish and
every English sentence, regraded — produced **0 failures in both directions**.
The comma was the visible difference in an answer that failed for defect 1.

## The design

### One classification, two derived outputs

The hazard in this brief is ending up with two grading systems that disagree.
The guard is that **one enum is produced by the checker and everything else is
derived from it by a single table**.

```ts
// learning/types.ts
export type Grade   = 'correct' | 'almost' | 'incorrect';              // SRS-facing, unchanged
export type Verdict = 'correct' | 'correctWithFeedback' | 'incorrect'; // learner-facing

export type AnswerError =
  | 'none'
  | 'accent'          // orthographic — this word has no accented twin
  | 'accentContrast'  // the accent distinguishes two real forms
  | 'punctuation'     // capitalisation, ¿ ¡ and friends
  | 'spelling'        // one slipped key
  | 'paraphrase'      // equivalent wording
  | 'preferred'       // acceptable, but a more precise form exists
  | 'form'            // person / tense / number / gender / mood
  | 'grammar'         // ser~estar, por~para, article, clitic
  | 'negation'
  | 'meaning';        // different meaning, or content missing/added
```

`learning/grading.ts` holds the only mapping in the codebase:

| `AnswerError` | `Verdict` | `Grade` |
|---|---|---|
| `none` | correct | correct |
| `accent` · `punctuation` · `paraphrase` · `preferred` | correctWithFeedback | **correct** |
| `accentContrast` · `spelling` | correctWithFeedback | **almost** |
| `form` · `grammar` · `negation` · `meaning` | incorrect | incorrect |

Both `correctWithFeedback` rows are successful retrieval in the SRS: `review()`
treats only `incorrect` as failure, so neither resets stability, breaks the
streak, nor writes a mistake record. `almost` costs a little interval growth and
half XP, which is the right price for a slipped key.

`Grade` is not persisted anywhere — `MistakeRecord` stores no grade and
`SessionRecord` stores counts — so none of this needs a `STATE_VERSION` bump.

### Task-awareness

`profileFor(exercise, settings)` in `learning/grading.ts` derives what the task
is actually testing. Nothing else assembles a tolerance by hand — the same
reasoning that moved review scoping into `scope.ts`.

```ts
export interface GradingProfile {
  language: 'es' | 'en';
  /** The exact written form is the thing under test. */
  formIsTarget: boolean;
  paraphrase: 'none' | 'english' | 'spanish' | 'spanishFree';
  /** Corpus-derived: does an accent on this word distinguish two real forms? */
  accentCarriesMeaning?: (bare: string) => boolean;
}
```

- **`formIsTarget`** — `dictation`; any exercise whose `targetId` is
  `f.<verb>.<tense>`; or `settings.strictAccents`. Here an accent difference on
  a contrasting word is a `form` error and **fails**. `hablo` for `habló` in a
  conjugation drill is wrong, which is the point.
- **`paraphrase`** — `translateToEn` → `english`; `translateToEs` / `wordBank` →
  `spanish`; free `conversation` / `buildResponse` → `spanishFree`;
  `fillBlank` / `dictation` → `none`.

The `spanish` mode accepts a fixed, enumerated set of **derived** equivalents —
no authoring, no per-sentence data:

| variant | example |
|---|---|
| optional subject pronoun, when it agrees | `Voy a comer` ≡ `Yo voy a comer` (already implemented) |
| `al` ≡ `a el`, `del` ≡ `de el` | `Voy al cine` ≡ `Voy a el cine` |
| clitic climbing on verb + infinitive | `Quiero verte` ≡ `Te quiero ver` |

Clitic climbing is the riskiest of the three and fires only when the second
token ends in a real infinitive ending (`-ar` / `-er` / `-ir`) with an attached
clitic, so it cannot trigger on arbitrary word pairs. If the mutation corpus
shows it accepting anything it should not, it comes out — the other two carry
most of the value.

Outside form-testing tasks: `cafe` for `café` is `accent` (full credit, "Remember
the accent"), and `esta` for `está` is `accentContrast` (`almost`, with the
contrast named). The three-way ladder is the whole point — the same keystroke
means different things depending on what is being asked.

### `answer-check.ts` stays content-free

It imports from `learning/types` and nothing else, and it keeps that. Corpus
knowledge arrives as the injected `accentCarriesMeaning` predicate, the way
`teachingFor` already receives `isKnown`. The layers, in order:

1. exact normalised match — `none`, or `preferred` when it matched a non-first
   entry in `accepted`
2. punctuation-only difference (compared against the raw input, before
   normalising, so a missing `¿` can be *taught* rather than silently ignored) —
   `punctuation`
3. accent-only — `accent`, or `accentContrast`, or `form` when `formIsTarget`
4. one slipped key (the existing `isTypo`, unchanged) — `spelling`
5. paraphrase, per profile
6. **classify the failure** rather than returning a bare `incorrect`: polarity
   mismatch → `negation`; equal word count with one word differing and a shared
   stem ≥ 3 → `form`; a differing closed-class function word → `grammar`;
   otherwise → `meaning`

### `content/` additions — data and derived, no logic

- **`content/accent-pairs.ts`** — derived, not authored. Walks sentences, vocab,
  drills, conversation turns and every conjugated form; groups by deaccented
  string; exports the groups holding two or more distinct real surface forms.
  107 today, and it tracks the corpus for free as content is added.
- **`content/equivalences.ts`** — English word equivalence classes and phrase
  groups (`nice / pleased / delighted / lovely / a pleasure to meet you`),
  replacing the one-directional 25-entry map currently inside `answer-check.ts`.
  Phrase groups are substituted before word comparison, so multi-word idioms
  match as units.
- **`VocabConcept.altEn` is declared in the type and read by nothing.** Light it
  up in the generator alongside the equivalence data.

### Free turns — `learning/meaning.ts`

Pure, no content imports. Scores the learner's answer against each accepted
model by content-word coverage; polarity must match; the best-scoring model
above threshold accepts as `paraphrase`, and becomes `best` so the feedback
shows the natural phrasing the learner did not quite reach. This is what makes
those 107 turns winnable.

**The threshold is calibrated, not guessed.** It is set by the two corpus tests
below: the lowest value at which every authored model still passes its own turn,
and the highest at which no mutated answer passes. If those two bounds cross,
coverage alone is insufficient for that turn — that is a finding to report, not a
number to nudge.

### The feedback teaches the canonical form

`feedback-bar.tsx` currently suppresses the model answer whenever the grade is
`correct`, which is precisely why the preferred wording is never taught. New
rule: show it whenever `error !== 'none'`.

```
✓ Correct
ANSWER   Encantada, yo soy Marta.
         Remember the accent: soy — you wrote "Encantada yo soy Marta"
```

`teaching.ts`'s `shouldShowMeaning` keys off `Verdict` rather than `Grade`.
`MistakeRecord` gains an optional `error?: AnswerError` so Review Mistakes can
say what *kind* of error it was — optional, so no version bump.

## Testing

Beyond hand-written adversarial pairs (each must-pass beside the must-fail that
would be satisfied by moving the same threshold), two corpus-wide tests:

- **Self-consistency.** Every authored answer in the corpus grades `correct`
  against itself, and every conversation turn's own four models pass meaning
  coverage. A paraphrase layer that breaks the canonical answer is worse than no
  paraphrase layer.
- **Mechanically mutated must-fail corpus.** Negation flipped, person swapped,
  tense swapped, ser↔estar, por↔para, singular↔plural — applied across the whole
  corpus, none may grade better than `incorrect`. This is the half that stops
  the permissiveness work from quietly accepting everything, and it scales with
  the corpus instead of with the number of examples someone remembered to write.

Gates: `npm test`, `npm run typecheck`, `npm run lint`, plus
`npm run audit:content` since `content/` gains files.

## Files

New: `learning/grading.ts`, `learning/meaning.ts`, `content/equivalences.ts`,
`content/accent-pairs.ts`, `learning/__tests__/grading.test.ts`.

Touched: `learning/types.ts`, `learning/answer-check.ts`, `learning/check.ts`,
`learning/teaching.ts`, `learning/generator.ts`, `content/index.ts`,
`context/LearnerContext.tsx`, `components/learn/feedback-bar.tsx`,
`learning/__tests__/answer-check.test.ts`.

## Where this sits

P1 of four. P2 is the answer moment (instant repair, compact feedback, rhythm,
mascot) and depends on `Verdict`/`AnswerError` landing here. P3 is the exercise
mix (`SessionIntent`, per-level distributions, the scaffolding ladder, the
difficulty budget). P4 is the unit arc (4–6 phases, shorter sittings,
completion-versus-mastery messaging).
