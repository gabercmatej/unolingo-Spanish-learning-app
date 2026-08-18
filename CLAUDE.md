# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Unolingo is a Spanish-learning app for one learner, built with Expo + React Native and
targeting **iOS, Android and web** from one codebase. Expo SDK 57, React Native 0.86,
React 19, TypeScript strict.

It teaches **Peninsular Spanish (es-ES)**: vosotros, coger, móvil, ordenador, vale.
That is not a stylistic preference — it is the product. Latin-American forms appear only
as labelled 🇪🇸/🌎 comparisons, never as the default.

## Commands

```bash
npx expo start                   # dev server; press i (iOS), a (Android), w (web)
npm run ios | android | web
npm test                         # jest — learning logic + content integrity
npm run typecheck                # tsc --noEmit
npm run audit:content            # curriculum coverage report + gap list
npm run lint
npx expo export --platform web   # full-graph bundle + static render of every route
```

Running a subset of tests:

```bash
npx jest src/learning/__tests__/srs.test.ts   # one file
npx jest -t "converges"                       # one test by name
npx jest --watch
```

### Three gates, two of which must be green

`npm test`, `npm run typecheck` and `npm run lint` are **regression gates** and must always
pass. Lint is not cosmetic here: the React Compiler rules in it have caught two real bugs
(a `Date.now()` in four render bodies that silently defeated every memo depending on it, and
a results screen assembled from refs during render).

`npm run audit:content` is the **definition-of-done gate** for course content. It is
deliberately excluded from `npm test` (see `testPathIgnorePatterns` in package.json) and is
*expected to fail* while curriculum gaps remain — its assertions encode "this stage is
finished", not "the code works". Read its gap list; don't try to make it pass by weakening it.

It measures **distribution and depth, not presence**. The presence version of this file
went green the moment every stage had one of everything, while thirteen of fourteen A1
units still had no audio — so it now reports how far each modality *reaches* across a
stage's units, which lessons are individually thin regardless of the stage average,
which concepts are introduced without enough material to practise, and whether an advanced
stage is quietly living off lower-level sentences. Output is split into **WARNINGS**
(act on these) and **NOTES** (context for judgement — a stage with no warnings is not
finished, it is merely no longer broken).

The depth NOTE is deliberately **relative, not absolute**: it always names the eight
least-practised concepts in each stage against that stage's median. An absolute threshold
goes permanently quiet once it is met, which is how a diagnostic starts arguing that the
work is done. This one survives its own success — but that also means it never reaches
zero, and it is not supposed to. Read it as a queue and apply judgement about which
concepts actually deserve more.

For anything touching the module graph or routing, also run the web export — it statically
renders every route and catches what a dev-server smoke test misses. There is no native
project checked in (`/ios`, `/android` are gitignored); web is the fastest verification loop,
and several bugs in this codebase only manifest there (see Platform traps).

## The three layers

The whole design rests on keeping these apart. Breaking the boundary is the main way this
codebase would rot.

**`src/content/` — data only, no React, no logic.**
Concepts, sentences, grammar, verbs, curriculum, conversations, stories, culture notes,
drills, placement questions. Adding course material means editing these arrays and nothing
else. `src/content/index.ts` is the registry: every consumer reads through it, and
`validateContent()` (run automatically in `__DEV__` and by the test suite) catches mistyped
ids, missing sentences and broken lesson prerequisites.

**`src/learning/` — pure logic, no React.**
`srs.ts` (spaced repetition), `mastery.ts` (aggregation, weak areas, unit/stage progress,
CEFR estimate), `answer-check.ts`, `generator.ts` (concept + learner state → exercise),
`session.ts` (session assembly and ordering), `placement.ts`, `xp.ts`, `ranks.ts`,
`check.ts` (grading), `achievements.ts`. All of it is unit-testable and tested.

**`src/app/`, `src/components/` — UI.**
Screens wire the store to components. Components never compute mastery or decide what to
show next; they render what the learning layer produced.

`src/context/LearnerContext.tsx` is the only persisted state. It hydrates from AsyncStorage,
auto-saves on a 400ms debounce, and exposes typed actions. `STATE_VERSION` gates hydration —
bumping it silently discards every learner's saved progress, so only do it with a migration
or a deliberate decision. Hydration merges `{...DEFAULT_SETTINGS, ...saved.settings}`, so
**adding an optional setting needs no version bump**.

## Curriculum shape

`content/curriculum.ts` is one continuous journey across six CEFR stages, all of which now
have real content — there are no `planned` (outline-only) stages left.

- **Stage → Unit → Lesson → Exercise.** The *unit* is the navigation unit; the Learn page
  renders stages as accordions and units as rows, and only the current unit expands.
- **Checkpoints** (`kind: 'checkpoint'` + `checkpointFor: <stageId>`) ignore `teaches` and
  draw from every concept in the stage.
- **Completion ≠ mastery.** `unitProgress()` returns lesson completion *and* a separately
  decaying `mastery`, plus `needsReview`.
- CEFR placement of a unit is a **deliberate pedagogical decision**, not an accident of file
  order. The course was restructured bottom-up specifically because A1 competencies were
  sitting in the A1→A2 stage. If placement looks wrong, moving it is legitimate.

### The spine, and how to change it

Lessons form a **linear required chain**: each core lesson requires the previous one. This is
maintained by a re-link script rather than by hand — see the git history for the exact
snippet. After moving units between stages you **must** re-link, and the re-link must respect
`optional`.

`Lesson.optional` marks enrichment (stories, listening, conversations). Optional lessons:

- hang off the chain — the next required lesson points at the last **required** one, so
  skipping a story never walls off the rest of the course
- do not count toward unit completion (`unitProgress` measures against required lessons,
  falling back to all lessons for a unit that is entirely optional)

Three regression tests in `content.test.ts` lock this down (`never lets an optional lesson
block another lesson`, `never reports an untouched unit as already complete`). A naive
re-link that treats every lesson uniformly will pass typecheck and break progression — that
is exactly what these tests exist to catch.

## Key invariants

- **Lessons never contain exercises.** A lesson declares `teaches`, `grammar` and
  `sentences`; `session.ts` builds the exercises. That is what lets the same lesson be
  easier on a first pass and harder on a later one.
- **Concepts are the unit of memory.** Vocabulary, grammar rules and verb paradigms are all
  concepts with one `ConceptState`. Verb-form concepts (`f.<verb>.<tense>`) are *derived*
  from `content/verbs.ts`, so adding a verb creates its practice targets automatically —
  but **deriving them is not the same as reaching them**. A concept no lesson teaches and
  no sentence tags never enters the learner's state, so it is never generated, never
  reviewed and never appears in the Library. The course shipped for a long time with all
  101 paradigms stranded exactly this way: the conjugation system existed and was dead,
  and the Library's verb pages showed only the present tense forever because `metTenses`
  could never populate. **Adding a verb therefore means also assigning its paradigms to a
  lesson** — a test enforces this now, and the audit warns on any stranded paradigm.
- **Verb paradigms are practised by text-matching the conjugated form**, not by concept
  tags. `content/verb-corpus.ts` derives that association — which sentences contain which
  form, per person — and both `buildVerbForm` and `audit:content` read the same index, so
  the exercise a learner gets and the number the audit prints cannot drift apart. Authors
  tag nothing: the information is already in the sentence text, so annotating sentences
  with `f.comer.preterite` would be busywork that rots. Adding a sentence updates the
  index automatically.
  - **An irregular future stem is always the conditional stem.** tendré/tendría, haré/haría,
    saldré/saldría are the same word twice, and the seeds originally defined only one of each
    pair, arbitrarily — so a learner who met `tendré` could never reach `tendría`. Adding a
    `future` to a verb means adding its `conditional` too, and vice versa.
  - Multi-word forms are matched as **token sequences**, and the blank falls on the token
    that carries the person — the auxiliary for compounds (`he comido`), the verb for
    reflexives (`me levanto`). Matching a single token is why every present perfect and
    every reflexive was silently table-only for a long time.
  - The audit reports taught paradigms, paradigms with sentence support, exposure by tense,
    exposure by person, and paradigms resting on a single sentence. Person exposure is
    *deliberately not equal* — `él` and `yo` dominate real Spanish — but **`vosotros`** is
    the one to watch, because it is what makes this course Peninsular and it was the least
    represented form in the corpus.
  - **Surface forms collide, and a naive match inflates exposure silently.** ser and ir
    share their whole preterite; `trabajo`, `vino`, `paga` and `como` are also nouns or
    conjunctions; `era` is both `yo` and `él`. The index guards all three — a preceding
    determiner or preposition rejects the noun reading, an ambiguous form must be
    corroborated by the sentence carrying the verb's own vocabulary concept, and a form
    shared between persons is counted once rather than once per person. `verb-corpus.test.ts`
    locks each case with the real example that exposed it. Extending the guards means adding
    a case there first: the failure mode is a number quietly being too high, which nothing
    else notices.
- **A lesson cannot teach more concepts than its session can generate.** The session target
  is `clamp(estMinutes × 1.8, 10, 20)`, and a concept that is never generated never enters
  the learner's state, is never scheduled, and never reaches the Library — so `teaches`
  declaring more than that is a promise the session silently breaks. `audit:content` warns
  on it. Raising `estMinutes` is the honest fix when the lesson genuinely needs the time;
  past 20 exercises the lesson has to split.
- **`stability` is days-until-review-threshold**, and `retrievability()` is a continuous
  decay curve. That curve — not a fixed interval ladder — ranks Smart Review.
- **One grading path.** Everything answerable goes through `checkExercise()`. Do not grade
  inside a component.
- **One session player.** `src/app/session.tsx` runs every `SessionKind`. Add a kind in
  `session.ts`, not a new screen.
- **Answer checking is asymmetric on purpose.** English answers are a *comprehension* check
  and accept any equivalent phrasing. Spanish answers stay strict — but an added subject
  pronoun is accepted only when it agrees with the verb, so "tú tengo" still fails.
  - **Negation is never the word that slides.** `sameEnglishMeaning` tolerates one unmatched
    content word, and negation is exactly one content word: "I don't like coffee" was accepted
    as "I like coffee". Polarity counts must match before a paraphrase counts.
  - **yo shares -a/-e endings with él only in the imperfect and conditional.** Treating every
    -a ending as compatible with yo let "yo habla español" through as a near miss.
- **No hearts, no energy, no daily limits.** A wrong answer shortens a review interval and
  writes a mistake record. It never blocks learning. Streaks are recomputed, never punished.
- **Unolingo rank ≠ CEFR level.** `learning/ranks.ts` (Principiante → Leyenda) measures
  distance walked; `estimateLevel()` measures demonstrated ability. The Profile shows both
  side by side and they are allowed to disagree — never conflate them or derive one from the
  other. Rank names are invariable Spanish nouns so the app never guesses the user's gender.
- **A CEFR level has to be demonstrated, not accumulated.** `estimateProficiency()` gates each
  level on concept coverage *and* on enough of that level's strong concepts carrying listening
  and production evidence, because `strength` records how well a concept is known and not how
  it was learned. Without the gate a learner who only ever pressed multiple-choice buttons
  reached B1 on the same evidence as one who could take dictation. When the concepts are there
  and the evidence is not, the estimate reports `plus` and names the skill — "A2+, held back by
  listening" — and `measured` distinguishes "nothing is holding you back" from "we have not
  looked yet", which are opposite states that both produce an empty `heldBackBy`.
- **`curriculumLevel()` and `estimateProficiency()` are allowed to disagree**, and the Profile
  shows them side by side. Finishing the B1 stage and speaking B1 are different claims.
- **A checkpoint carries a per-skill floor.** `skillBalance` steps demanding kinds back inside a
  lagging skill, which is right in a lesson and inverts the purpose in a checkpoint: for a
  learner experienced in every kind and weak at production, every checkpoint in the course
  produced 0–2 production exercises out of 18, at every seed. Production collapses further than
  listening because every production kind is difficulty 4–5, so demoting the demanding ones
  demotes the whole skill, while listening keeps the gentle `listenSelect`. `cefr.test.ts` pins
  it with the weak-but-experienced fixture — the obvious fixture (a recognition-only learner)
  passes without the fix, because freshness alone already gives that learner breadth.
- **The exercise mix shifts at B2+.** `candidateKinds()` takes the learner's *demonstrated*
  level. From B2, tiers move up one step and plain recognition (`multipleChoice`, `match`) is
  **demoted to the tail, not removed** — reached only when a concept has nothing else to
  build from. Discriminating recognition (`chooseNatural`, `grammarChoice`, `listenSelect`)
  stays first-class at every level, because choosing between two registers is harder than
  translating. The demotion is applied *after* the freshness shuffle, or a never-used
  `multipleChoice` would jump the queue on novelty alone.
- **Difficulty is calibrated per skill, not just per level.** `skillBalance()` in
  `mastery.ts` reports which of the four skills sit meaningfully above and below the
  learner's own average, and `candidateKinds()` uses it in the same final ranking pass as
  the demotion above: within a lagging skill the *demanding* kinds (difficulty ≥ 4) step
  back and the gentler ones come forward, and within a leading skill the reverse. Nothing
  is ever removed — a lagging skill still gets practised, at a difficulty the learner can
  actually meet, which is the only way it stops lagging. It is derived from the exercise
  kinds already recorded in `ConceptState.kinds`, so it needs **no new persisted field and
  no `STATE_VERSION` bump**. It stays silent until a skill has ≥8 concepts behind it,
  because a skill looking weak after three items is a sample artefact.
- **Modality is a property of the generator, not of the timetable.** The course ships
  dedicated listening, reading and conversation lessons, but those are *additional* depth,
  not the only place those skills live: every sentence can become audio, so a plain
  vocabulary or grammar lesson still generates listening and production. Measured across
  the 78 core/grammar lessons, 100% contain at least one listening exercise and one
  production exercise, and the overall mix is roughly 34% grammar / 27% production /
  25% listening / 14% vocabulary. A test in `session.test.ts` holds this at a floor of 80%,
  because a change to `candidateKinds` could quietly turn ordinary lessons back into
  reading-only sessions and nothing else would notice.
- **`correctMistake` and `chooseNatural` are hand-authored only.** They come from
  `content/drills.ts` and cannot be generated. A level with no drill silently loses both
  from its mix — and they are the *top* tier from B2 up, so the loss is invisible and
  expensive. `validateContent()` checks drill concept ids resolve (a mistyped id makes a
  drill unreachable rather than throwing), and both the unit tests and `audit:content`
  assert every level has drills of both kinds.
- **The Library lists grammar and verbs in teaching order**, not alphabetically — it is a
  revision tool, so it has to match the path the learner walked. Use `byTeachingOrder` /
  `byVerbTeachingOrder` from the registry. A concept no lesson teaches sorts to the very end,
  which `audit:content` flags.

## Progress is not disposable

`src/learning/backup.ts` is pure policy (what a backup is, what a restore must refuse, when a
snapshot is due); `src/lib/snapshots.ts` and `src/lib/backup-file.ts` are the plumbing.

- **Three rolling snapshots, twice a day**, under their own storage key so a learner record that
  fails to parse cannot take its own backups with it, plus a forced snapshot before anything
  destructive — including restore, which makes restoring the wrong file undoable.
- **An empty state may never displace a full one.** Without that rule the snapshot taken in the
  moments after a reset consumes a slot, and three cycles later there is nothing to go back to.
- **File export/import needs no new dependency**: a Blob download and a file input on web,
  `expo-file-system` on native, which ships with Expo and has carried its own system file picker
  since SDK 57.
- **Restore refuses by default.** The file must claim to be a Unolingo backup, from a format and
  a `STATE_VERSION` this build understands, with its concepts, lesson history, mistakes and
  sessions intact. Settings stay local — a phone backup must not redecorate a laptop.

## Platform traps

These have each caused a real bug here; most are invisible on native and only bite on web.

- **`Alert.alert` is a no-op on React Native Web.** Use `useConfirm()` from
  `components/ui/confirm.tsx`.
- **OS-drawn controls ignore your theme.** RN's `Switch` honours `trackColor` on iOS, tints
  from the platform accent on Android, and falls back to its own teal on web — one component
  in three colours. Styling props on a platform-native control are a request, not a contract.
  Use `components/ui/toggle.tsx`; the same reasoning applies to any future picker or slider.
- **Never nest a pressable inside a pressable.** It emits nested `<button>` elements —
  invalid HTML and a hydration error. Put the secondary control beside the row, not inside it.
- **Flex children size to their content in RN.** Long text spills out unless the flex parent
  has `minWidth: 0`. That is what `styles.flex` in `components/ui/layout.tsx` encodes.
- **Shadows carry no information in dark mode.** Elevation needs a second channel — `Card`'s
  `raised` variant also uses `backgroundRaised` plus a lit `highlight` edge, or `raised` and
  `flat` render as the same slab.
- `BottomTabInset` in `constants/theme.ts` must match the bar height in `(tabs)/_layout.tsx`.

## Conventions

- Files kebab-case; components and types PascalCase; `@/*` maps to `src/`, `@/assets/*` to
  `assets/*` (both resolved by Metro, so `require('@/assets/…')` works).
- All colour, spacing, radius, type and motion tokens live in `src/constants/theme.ts` and
  are consumed via `useTheme()` / `useGradients()`. Never hardcode a colour — add a token.
- Use `PressScale` rather than bare `Pressable`; the app's tactility depends on it. It drives
  shared values through `.set()` from memoised handlers — assigning to `.value` inside a handler
  created during render reads to the React Compiler as mutating a value it holds.
- **Reduce Motion is already honoured**: every Reanimated animation defaults to
  `ReduceMotion.System`. `components/ui/motion.tsx` is not an accessibility shim — `Reveal` exists
  so entrance timings are one delay ladder instead of fifteen hand-tuned numbers. `useCountUp`
  *is* the piece that needs an explicit check, being a plain rAF loop the library knows nothing about.
- **Never call `Date.now()` in a render body.** Use `useNow()`. A fresh timestamp every render is a
  fresh dependency every render, which silently turns every memo that depends on it into a no-op.
- `<Text numeric>` for anything that counts or ticks — proportional digits make a changing
  XP total visibly jitter and stop columns of figures lining up.
- **Emoji are not iconography.** Interface icons come from one Ionicons vocabulary
  (`components/ui/icon.tsx`, and the `UnitIcon` union in `content/types.ts` so content stays
  free of UI imports). Emoji appear only where they carry meaning — the 🇪🇸/🌎 comparisons.
- Brand artwork lives in `assets/images/brand/` (`mark`, `lockup`, `mascot`, `face`), all
  transparent PNGs that sit correctly on cream and on the dark surface.
- Audio goes through `src/lib/speech.ts`, which ranks the device's `es-ES` voices. It is the
  single seam where recorded native-speaker audio would replace on-device synthesis.
- Cross-platform is a hard requirement: RN primitives, `Platform.select`, JS `Tabs` (not
  `NativeTabs`). Any new dependency must work on iOS, Android and web.
- Install with `npx expo install <pkg>`, not `npm install`.

### Content id scheme

`v.` vocabulary · `p.` phrase/chunk · `g.` grammar · `f.<verb>.<tense>` verb form (derived) ·
`s.` sentence · `l.` lesson · `unit.` · `stage.`

Sentence ids are prefixed **per file**, and the letters do not correspond to CEFR level:
`s.f` foundations · `s.k` a1-core · `s.m` a2-core · `s.b` b1-core · `s.c` b2-core ·
`s.d` c1-core · `s.e` everyday **and** c2-core (c2 disambiguates with a trailing `c`:
`s.e1c`) · `s.r` routine · `s.s` social · `s.a` around-spain.

That `s.e` overlap is a live hazard — check for collisions when adding sentences, and note
that the id uniqueness test is what catches it.

## Adding course content

1. Add vocabulary to `src/content/vocab/*.ts`, sentences to `src/content/sentences/*.ts`
   (tagged with the concept ids they exercise). Thematic files hold the original material;
   `{a1,a2,b1,b2,c1,c2}-core.ts` hold the per-level expansion.
2. Add the lesson to a unit in `src/content/curriculum.ts` with `teaches`, `sentences`,
   `requires`, and `optional: true` if it is enrichment.
3. Register any new file in `src/content/index.ts`.
4. Run `npm test`, then `npm run audit:content`.

No screen, generator or renderer needs to change.

## Testing notes

The suite targets the two things most likely to break silently:

- **Content integrity.** Ids resolve and are unique, every lesson can build a non-empty
  session, every generated exercise's own correct answer passes the grader, verb paradigms
  are complete, prerequisites are ordered, optional lessons never gate.
- **Learning-model behaviour.** SRS intervals move the right way, XP cannot be farmed, hard
  mode never offers a word bank, ranks tile every level with no gaps, the B2 production shift
  holds, and the placement staircase converges within one level.

When changing the generator or the curriculum, run the full suite rather than one file:
those tests cross-check content against logic.

## Known open work

- **Depth is median 4–8 sentences per concept and every stage draws ≤8% from below its level.**
  The audit's NOTE reports the eight least-practised concepts per stage against that stage's
  median, and it says so *whether or not anything is wrong* — a standing priority queue, not a
  defect report. The queue is now mostly narrow items (clothes, months, individual idioms) that
  are finished at two or three exposures; do not read it as a quota. The spine — ser (43),
  estar (39), ir (32), tener (27), quedar, llevar, hacer, ya, todavía, aunque — is where density
  was actually spent.
- **`vosotros` (79) and `tú` (92) remain the thinnest persons against `él` (491).** Partly
  legitimate: third-person narration dominates any corpus. The target is not parity — it is that
  group dialogue keeps appearing, since that is where those forms live.
- **`presentPerfect` (63) and `future` (46) are now the thinnest tenses**; `conditional` went from
  16 to 104 when the future/conditional stems were paired.
- **Four paradigms cover only one person each**, which the audit reports without warning on. That
  is a real limit, not a defect: some verbs genuinely appear in one person in this corpus.
- **Speaking is scored on self-report.** `speak` exercises play and accept; there is no
  pronunciation check. A deliberate limit — see `lib/speech.ts` for the seam where real audio and
  recognition would land. This is the largest remaining gap in the course as a whole.
- **Composition is the surface that breaks silently.** The conjugation subsystem stayed dead
  through 119 passing tests because every link was tested individually and the chain was not.
  `verb-flow.test.ts` walks verb → tense → paradigm → exercise → grade → mastery → Library, and
  `journey.test.ts` walks placement → lesson → mistake → Smart Review → unit completion →
  skipping the optional lessons → app restart → story → checkpoint. When adding a subsystem,
  prefer one test of the pathway over more tests of the parts.
- **A fixture that passes without the fix is not a test of the fix.** The first checkpoint-breadth
  fixture passed before the floor existed; only the weak-but-experienced learner exposed the
  defect. Check that a new regression test fails without its change.
