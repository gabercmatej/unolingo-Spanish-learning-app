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
node scripts/make-sounds.mjs     # regenerate the UI sound cues in assets/audio/
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
deliberately excluded from `npm test` (see `testPathIgnorePatterns` in package.json) because
its assertions encode "this stage is finished", not "the code works".

It was written expecting to fail, and for a long time it did. **It now passes 11/11 with zero
warnings, so a failure is a regression rather than the normal state** — read its gap list and
fix the content; never make it pass by weakening an assertion. Note the third possibility,
which has happened: the audit's *model* of the runtime can be wrong. When a check disagrees
with the app, find out which of them is lying before changing either. Passing is still not the same
as finished: the NOTES are a standing priority queue and are supposed to keep printing.

It also measures **what a stage can say**, not only how much it contains.
`content/coverage.ts` declares semantic slots — one thing the learner must be able to
express, several acceptable Spanish words, tied to the stage that needs it — plus core verb
and core grammar coverage, and a check for a later stage going shallow relative to the
course's own busiest one. That shape resists the two failure modes of a coverage metric: it
cannot be satisfied by padding (forty more adjectives do not fill the "knee" slot), and it is
not a quota (nothing says a stage needs N words). Its first run found A1 "Home and rooms" at
5 of 19 and A2 "The city" at 1 of 14 — the volume table had been green throughout.

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
`eligibility.ts` (what the learner may be *asked to produce*), `scope.ts` (where a review may
draw its targets from, and what it is trying to achieve), `mistakes.ts` (the retry queue and
what closes a mistake), `progression.ts` (where the learner is on the path, and what finishing
something ahead implies about everything behind it), `unit-practice.ts` (the optional practice
a completed unit offers), `library.ts` (how the Library is grouped and filtered),
`teaching.ts` (what to say
after an answer), `session.ts` (session assembly and ordering), `placement.ts`, `xp.ts`, `ranks.ts`,
`check.ts` (the one grading entry point) with `grading.ts` (the error → verdict/grade policy
table), `meaning.ts` (whether a free answer said the same thing) and `es-variants.ts` (Spanish
sentences that are mechanically the same sentence), `achievements.ts`, `reminders.ts` (which
days the daily nudge is due), `backup.ts` (what a backup is, what a restore
must refuse, when a snapshot is due), `migrate.ts` (opening a record written by another
build), `defaults.ts` + `schema.ts` (the blank learner and `STATE_VERSION`, kept out of the
store so the migrator never has to import React), `explain.ts` and `diagnostics.ts` (the
developer surfaces). `types.ts` carries the learner model and `KIND_SKILL`; `exercise.ts`
the exercise shapes. All of it is unit-testable and tested.

**`src/app/`, `src/components/` — UI.**
Screens wire the store to components. Components never compute mastery or decide what to
show next; they render what the learning layer produced. `src/hooks/` holds the two hooks
that are neither (`use-theme`, `use-now`).

**`src/lib/` — platform seams, and nothing else.**
`speech.ts` (TTS), `sound.ts` (UI sound cues), `storage.ts` (AsyncStorage), `snapshots.ts` (the
snapshot ring), `backup-file.ts` (file export/import), `feedback.ts` (haptics),
`notifications.ts` (local reminders), `navigation.ts`,
`date.ts`, `environment.ts` (which build this is). Each one exists so exactly one file imports a
platform API — swapping AsyncStorage for MMKV, or synthesis for recorded audio, is a change
to one file. **Policy never lives here.** When `snapshots.ts` first held the "three rolling
snapshots, never let an empty state displace a full one" rules they could not be tested at
all, because the file imports AsyncStorage; the rules moved to `learning/backup.ts` and the
plumbing stayed. That split is the pattern.

`src/context/LearnerContext.tsx` is the only persisted state. It hydrates from AsyncStorage,
auto-saves on a 400ms debounce **plus an immediate flush when the app backgrounds** — a
suspended JS thread never fires a pending timer, so without that flush the last answer of a
session can simply fail to exist — and exposes typed actions. Hydration merges
`{...DEFAULT_SETTINGS, ...saved.settings}`, so **adding an optional setting needs no version
bump**.

**Hydration goes through `learning/migrate.ts`, and refusing to read a record is not a
failure mode — it is the safety property.** The rule is that *a record we could not read must
never be written over*. The original hydration did the most dangerous possible thing with a
record it did not recognise: nothing. It skipped it, carried on with a blank learner, and
400ms later the debounced save wrote that blank learner over the record it had just declined
to read — so bumping `STATE_VERSION`, restoring an older backup, or meeting a truncated file
all ended the same way.

`migrateState` walks a chain of steps keyed by the version they migrate *from*, and refuses
when one is missing rather than guessing; guessing is how a migration becomes a corruption.
On refusal the store never reaches `setReady(true)` — which is the switch that turns saving
on — so the bytes stay exactly as found, a verbatim copy goes to the quarantine storage key,
and `components/recovery-screen.tsx` offers to save that copy out. Starting fresh is on that
screen, last and behind a confirm.

`MIGRATIONS` is empty today on purpose: the schema has only ever been version 1, and
inventing steps for structures that do not exist is testing fiction. **Bumping
`STATE_VERSION` obliges you to add the step that carries records forward** — and to write the
regression test at a *second* version, because with one version in existence "stamp with the
incoming version" and "stamp with this build's version" produce identical bytes and the bug
is invisible. `migrate.test.ts` shows the shape.

Content drift needs no machinery: concept and lesson ids that no longer exist are already
guarded at every call site, so a renamed lesson orphans an entry rather than breaking a
screen. That was measured before deciding not to build for it.

## Curriculum shape

`content/curriculum.ts` is one continuous journey across six CEFR stages, all of which now
have real content — there are no `planned` (outline-only) stages left. **Re-read every figure
below from `npm run audit:content` rather than from here**; they drift with each content
commit, and a stale number is worse than none.

- **Stage → Unit → Lesson → Exercise.** The *unit* is the navigation unit; the Learn page
  renders stages as accordions and units as rows, and only the current unit expands.
- **Checkpoints** (`kind: 'checkpoint'` + `checkpointFor: <stageId>`) ignore `teaches` and
  draw from every concept in the stage.
- **Lessons are progression. Practice is optional mastery.** A unit is complete when every
  *required* lesson in it is complete — full stop. Mixed practice, active recall,
  consolidation, strengthening and Smart Review all happen *after* that, improve `mastery`,
  and can never move `state`. The two never share a counter, a progress bar or a list.
  - This was the single worst piece of incoherence in the app, and it was not a bug in any
    module. A unit described itself through three overlapping state machines at once —
    `UnitState` off required lessons, `UnitPhase` off mastery, and a generated arc whose
    revision steps were stored as pseudo-lessons — and the Learn page rendered the *arc's*
    counter as the unit's progress. So a unit with every lesson ticked read `2/5` with
    "Next: Active recall" under it: two questions answered through one number, unreadable as
    either. Each machine was internally correct, which is why no per-module search found it.
  - `UnitProgress.practice` (was `arc`) is the optional half. Steps are unordered, available
    the moment the unit completes, and excluded from every progress figure. `unitStrengthPlan`
    still orders unresolved mistakes → met-once → faded → recognised-but-never-produced → the
    rest, and never replays the original lesson.
- CEFR placement of a unit is a **deliberate pedagogical decision**, not an accident of file
  order. The course was restructured bottom-up specifically because A1 competencies were
  sitting in the A1→A2 stage. If placement looks wrong, moving it is legitimate.

### The spine, and how to change it

Lessons form a **linear required chain**: each core lesson requires the previous one. This is
maintained by a one-off re-link script rather than by hand; the script is not checked in, so
the rule matters more than the snippet. **Walk the lessons in curriculum order carrying the id
of the last *required* lesson seen. A required lesson's `requires` is that id, and then it
becomes the carried id. An optional lesson's `requires` must name a required lesson — never
another optional one — and it does not disturb the carry.** After moving units between stages
you **must** re-link.

`Lesson.optional` marks enrichment (stories, listening, conversations). Optional lessons:

- hang off the chain — the next required lesson points at the last **required** one, so
  skipping a story never walls off the rest of the course
- do not count toward unit completion (`unitProgress` measures against required lessons,
  falling back to all lessons for a unit that is entirely optional)

Three regression tests in `content.test.ts` lock this down (`orders lesson prerequisites
before the lessons that need them`, `never lets an optional lesson block another lesson`,
`never reports an untouched unit as already complete`). A naive
re-link that treats every lesson uniformly will pass typecheck and break progression — that
is exactly what these tests exist to catch.

### Locking is soft, and finishing something ahead is what moves you

`learning/progression.ts` owns where the learner is. Content ahead of them is dimmed and
marked as off the recommended path, and it still **opens**: the course guides order without
enforcing it.

**Successfully completing required lesson X auto-completes every unfinished required lesson
before X, and nothing else, ever.** Opening a future unit does nothing. Opening a future
lesson does nothing. Starting one and quitting does nothing. Being killed by the OS halfway
through does nothing. Only reaching the real end of a session counts — which
`completedLessonId` already gated on, because *answering is not finishing*.

- Optional lessons are never auto-completed, and nothing after the reached lesson is touched.
- A skipped lesson's concepts go through **`introduce()`**, which sets `introduced` and
  schedules `dueAt` while leaving `timesSeen`, `strength`, `depth` and `lastReviewed` alone.
  That is the **encountered vs retrieved** rule again: a skip unlocks the Library, the verb
  pages, the grammar and eligibility for production exactly like a played unit, without
  fabricating recall evidence the mastery figure would then report as real. A skip is a
  declaration of intent, not proof.
- **`continueTarget` is a one-line lookup — the first incomplete required lesson — and that is
  only correct because completed required lessons can never have a hole in them.** Placement
  completes a prefix; a skip back-fills. `progression.test.ts` asserts that contiguous-prefix
  invariant directly, because if it ever breaks Continue silently starts pointing *behind* the
  learner and nothing else in the app would notice.
- **In progress, abandoned and completed are three different states**, and completion is never
  inferred from answers submitted or XP earned. `activeLesson` marks the first; leaving the
  screen clears it (abandoned); reaching the end clears it and completes the lesson. React
  cleanup does not run when the OS kills the process, which is exactly what makes Resume
  possible and what makes quitting distinguishable from being interrupted.

No `STATE_VERSION` bump for any of it: `completedLessons[id].skipped` and `activeLesson` are
both optional fields, the `MistakeRecord` and `developerMode` shapes.

## Key invariants

- **Only evidence may move mastery.** Generating a session is a pure read; answering is the
  only thing that writes. This was broken in one line: `introduce` incremented `timesSeen`,
  and `averageMastery` counts every concept with `timesSeen > 0` — so *displaying* a teaching
  card moved a concept into the denominator carrying a mastery of zero. Opening a unit
  revisit, which opens with cards for everything the lessons had not reached, halved the
  unit's percentage before the learner answered anything. Measured on the regression fixture:
  0.72 → 0.20.
  - The distinction that fixes it is **encountered** vs **retrieved**. Encountered (`introduced
    || timesSeen > 0`, via `hasEncountered`) means the course has shown it: it belongs in review
    queues, in the global practice pool, in "words met". Retrieved (`timesSeen > 0`) means it
    was produced from memory: it is the only thing that counts as evidence, and the only thing
    any average may see. `introduce` may set `introduced` and schedule `dueAt`; it may not
    touch `timesSeen`, `strength`, `depth` or `lastReviewed` — that last one because
    `masteryBand` gates `mastered` on `lastReviewed - firstSeen`, so a card would let a concept
    age towards mastery by being looked at on two different days.
  - `transactional.test.ts` holds it, including that unanswered exercises have zero effect.
- **A review's targets come from its scope.** `learning/scope.ts` makes this structural:
  `ReviewScope` (`global` | `unit` | `concepts` | `mistakes`) and `SelectionIntent` (`smart`,
  `full`, `vocabulary`, `grammar`, `listening`, `weak`, `quick`, `random`, `hard`) are separate
  types, and `selectTargets` is the one place either is interpreted. Inside a unit, review means
  "help me with this unit"; from Home or Practice it means "help me with everything I have met".
  - Supporting language from anywhere already met may still appear *inside the sentences* —
    that is the spiral — but the concept being practised must belong to the scope. A café
    sentence must not become a vehicle for an unrelated B1 grammar point.
  - Unit **targets** come from `getUnitTaughtConcepts`, not `getUnitConcepts`: the latter sweeps
    in every concept the unit's sentences mention, which is right for measuring what a unit
    exercises and wrong for deciding what it owns.
  - It was *mostly* right before, by convention — each screen passed a concept list and
    `buildPracticeSession` intersected it. "Mostly, by convention, at each call site" is the
    kind of correctness that decays the first time somebody adds a button, which is why the
    screens now pass a `unit` param and nothing assembles a filter by hand.
- **Review Mistakes reviews the mistakes.** `buildMistakeSession` is a separate builder and
  deliberately does not route through `buildPracticeSession`. The old path kept only
  `conceptIds` and asked the generator for anything about them, so a failed "Translate: I am
  tired" came back as a multiple choice about `v.cansado`, the other three concepts tagged on
  that sentence each spawned their own exercise, and their sentence pools filled the rest of
  the session with lines the learner had never seen. One exercise per mistake; the same item
  rebuilt via `buildExact` where the record names its sentence; nothing added, so an empty
  queue produces an empty session and the screen says so.
  - `MistakeRecord` gained `sentenceId`, `targetId`, `attempts`, `lastAttemptAt` — all
    optional, so **no `STATE_VERSION` bump**, and an older record falls back to the concept.
  - **Resolution is narrow.** The old rule closed any open mistake sharing any concept with any
    correct answer, so the queue emptied itself without a mistake being confronted. `resolves`
    needs a *correct* answer (not `almost`, which lengthens the interval and would hide the
    mistake for longer than getting it right) aimed at the mistake's own `targetId`.
  - **Failure lowers scaffolding, not the target.** `scaffoldKindFor` is one shared ladder —
    `translateToEs → wordBank`, `dictation → listenSelect`, `correctMistake → grammarChoice`.
    Both the in-session retry (`buildRetry`) and the mistake queue step down it, so they cannot
    drift. Only `output` kinds are scaffolded: getting a multiple choice wrong is not evidence
    that multiple choice was too hard.
- **A completed unit is not a finished unit, and the app says so in two numbers rather than
  one.** Measured: **36 of 63 units had exactly one required lesson**, median 13 minutes — and
  the curriculum expansion did not dissolve it, at 41 of 88 units and a median of 17. So
  finishing a unit meant meeting nine words, answering twelve questions, and landing on ~22%
  mastery with nothing to do but replay the lesson. `learning/unit-practice.ts` generates
  `mixed → recall → consolidate` from what the unit already declares — it adds **no content**,
  which is what "lessons never contain exercises" buys.
  - **It is offered, never required.** Practice unlocks when the unit completes and is
    unordered from then on; a learner who wants to jump straight to consolidation may. The
    version that chained these steps and counted them into the unit's progress is what made a
    fully-lessoned unit render `2/5`.
  - **A step still reports `satisfied` when the record already demonstrates its goal.** A
    learner who retrieves every concept under pressure gains nothing from a recall session,
    and nudging them at one forever is the app inventing work.
  - Progress is stored in `completedLessons` under `arc:<unitId>:<phase>`. That key is
    deliberately unchanged from when these were arc steps: it is a storage key existing
    records already contain, and renaming it would orphan every learner's practice history to
    rename a string nobody sees. No `STATE_VERSION` bump; a stale key orphans an entry.
- **Nothing is asked for before it is taught.** `learning/eligibility.ts` gates every
  sentence, drill and conversation turn on what the learner has actually been introduced
  to. This closed a bug where a learner who had just met `v.amigo` in the Family unit was
  asked to translate "Mis vecinos han visto el partido en el bar de abajo." into Spanish.
  Three defects compounded, and each is worth knowing separately:
  1. **A mis-tag.** That sentence was tagged `v.amigo` and contains no "amigo" at all.
     `audit:content` now reports a tag whose word family appears nowhere in the sentence.
  2. **No filter on the pool.** `getSentencesForConcept(id)` returns every sentence tagged
     with a concept at any level, and `attemptKind` picked one at random. So any practice
     touching an A1 word could hand over an A2 present-perfect line. Now the pool is
     narrowed *before* the draw, per exercise kind — filtering after the draw would fall
     through to the next kind on a bad draw, so a concept with one bad sentence in five
     would lose production four times in five for no visible reason.
  3. **Exposure recorded as teaching.** `mergeIds` put every sentence concept into
     `exercise.conceptIds`, `recordAnswer` ran `review()` over all of them, and `review()`
     sets `introduced: true`. One exercise silently marked four unseen concepts as taught,
     and next session *those* were eligible for production. The leak spread on its own.
     Unknown supporting concepts now go to `exercise.supportIds`, which is shown to the
     learner as new and never scored.
  - The rule is **directional, not restrictive**: past concepts spiral forward for ever, and
    only unseen material is kept out of required output. `KIND_DEMAND` splits exercise kinds
    into `output` (the learner writes or says Spanish — zero unknown), `comprehension`
    (`translateToEn`: free typing that needs every word understood, so vocabulary room but no
    level headroom), `guided` (the sentence is on screen with a gap), and `input` (choosing
    from options — the most room, plus a level of headroom). A sentence may stretch the learner
    **on its level or on its vocabulary, and not on both at once**: without that clause the two
    tolerances multiply, which is precisely how the offending sentence qualified.
  - **The tag list under-counts, so eligibility also counts *words*.** This was the documented
    residual and it was still reachable: "Estaban viendo el partido abajo en el bar." declares
    the imperfect, passes a concept check with room to spare, and asks a beginner for four
    words nobody has shown them. Authors tag what a sentence is *for* — two or three ideas —
    not the eleven words it contains, and tagging harder is not the fix. `content/lexicon.ts`
    *derives* the words from the text, the way `verb-corpus.ts` derives conjugations, and
    `UNKNOWN_WORDS` is the budget over them.
    - Three kinds of token come out of a sentence. **Function words** (`el`, `en`, `que`) never
      count — structural, and present in lesson one. **Covered** words are ones some concept
      accounts for, and are the ones worth counting. **Untracked** words — content words no
      concept covers, 20% of the corpus — are deliberately *not* counted as unknown: refusing
      every sentence containing one would reject most of the corpus and make eligibility a
      measure of vocabulary-file completeness. `audit:content` reports the frequent ones
      instead (`nadie` appears 93 times and is never taught).
    - Verb forms register against the **paradigm as well as the verb**, because either is
      enough to read the word: "han visto" is legible to somebody who knows *ver*, and equally
      to somebody studying the present perfect.
    - `output` tolerates **zero** unknown words. That is affordable because it was measured: for
      a learner who has genuinely reached a level, 72% (A1) to 96% (B2) of the sentences at or
      below it contain no unknown word at all.
  - The ceiling comes from what has been *introduced*, not from `estimateProficiency` —
    the question is "has the course shown them this?", not "how good are they?". A placement
    result sets the floor.
  - `audit:content` measures the same rule by calling `sentenceEligible`, for the reason the
    verb corpus index is shared with `buildVerbForm`: a diagnostic with its own copy of a
    threshold silently stops describing the thing it watches. It had **two** such copies, and
    both were wrong once the gate tightened. It anchored "at the point it is taught" to the
    first lesson whose *sentences* mention a concept rather than the lesson that teaches it —
    `v.casa` is taught at lesson 29 and appears incidentally around lesson 5 — and it took the
    concept's declared level as the production ceiling, when the runtime derives the ceiling
    from the introduced set (`ceilingFromKnown`, now shared) and raises it to the lesson's own
    level. Between them those two approximations reported 62 concepts as having no readable
    sentence. Anchoring and ceiling fixed, the true figure is zero.
- **Introduced → learning → familiar → strong → mastered.** `masteryBand` is a ladder, and
  nothing jumps it. `mastered` needs demanding retrieval (`depth >= 3`), six encounters, *and*
  `lastReviewed - firstSeen` of about a day — ten correct answers inside one sitting reach
  `strong` and stop. That last clause reads two fields that already existed and nothing was
  using, so it costs no `STATE_VERSION` bump.
- **A freshly met concept cannot be scheduled away.** `srs.ts` caps stability at ~1.4 days
  while a concept is under four encounters or below 0.5 strength. Not a blanket "everything
  returns tomorrow": the cap releases the moment the concept is neither young nor shaky. What
  it prevents is one good answer on a difficulty-4 exercise buying a week's absence on day one.
- **The feedback moment teaches.** `learning/teaching.ts` decides what to add after an
  answer — the source line, its meaning, one compact note, and any concept that was new here.
  Meaning is **level-sensitive**: always through A2, at B1 only where answering revealed
  nothing about meaning (dictation, "what did you hear?"), and from B2 only on a wrong answer.
  A correct `listenSelect` used to say "¡Bien!" and nothing else, which tests the ear and
  leaves the meaning exactly where it found it. Policy lives in `learning/`; `FeedbackBar`
  renders a decision rather than making one.
- **Dialogue dashes are typography, not language.** `practiceText` strips `—`/`–` from word
  bank tokens and typed hints. `normalize` in `answer-check.ts` has always stripped them
  before comparing, so the app was asking for a keystroke it then ignored.
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
  - **The imperative is separated by position, not by tag.** "Ella habla despacio" and
    "¡Habla más despacio!" are the same six letters, the same verb, the same `v.hablar`
    tag, and different paradigms — corroboration cannot tell them apart. So a command in
    this corpus is written the way Spanish writes one: opening `¡`, verb first, and the
    index applies that **symmetrically** — the imperative counts only sentence-initial
    forms in `¡…!`, and every other paradigm skips them. Without the second half one
    sentence feeds two paradigms and both numbers are wrong upwards. The rule is global
    rather than per-verb because the collision is: `ve` is *ir*'s imperative and *ver*'s
    third-person present.
  - **Surface forms collide, and a naive match inflates exposure silently.** ser and ir
    share their whole preterite; `trabajo`, `vino`, `paga` and `como` are also nouns or
    conjunctions; `era` is both `yo` and `él`. The index guards all three — a preceding
    determiner or preposition rejects the noun reading, an ambiguous form must be
    corroborated by the sentence carrying the verb's own vocabulary concept, and a form
    shared between persons is counted once rather than once per person. `verb-corpus.test.ts`
    locks each case with the real example that exposed it. Extending the guards means adding
    a case there first: the failure mode is a number quietly being too high, which nothing
    else notices.
  - **JavaScript's `\b` treats an accented character as non-word.** `grading-corpus.test.ts`'s
    ser/estar mutation barely matched its own `está` — `\b` needs a word/non-word transition on
    both sides, and the character right after `á` in ordinary text is a space or full stop,
    itself non-word, so no boundary ever fired there. Where it did fire, on the accented tail of
    `están`/`estáis`, it matched only the shared prefix and left the rest of the word behind
    (`"Ellos están felices."` → `"Ellos esn felices."`). `content/verb-corpus.ts` already
    tokenises rather than matching with `\b`, which is why it never hit this; the test's fix was
    the same move — a Spanish-aware character class in place of `\b`.
- **A declared tense with no paradigm is invisible to a coverage percentage.** `TenseId`
  declares eight tenses. For a long time `presentSubjunctive` and `imperative` had no
  paradigm on any verb, so they were absent from the numerator *and* the denominator, and
  the audit reported "134 of 134 paradigms taught (100%)" — true, and about the wrong set.
  A percentage over the rows that exist answers "of what I built, how much is good?"; the
  question is "of what the type promised, how much exists?". `audit:content` now walks
  `TENSE_LABELS`' keys and **warns on any declared tense with zero paradigms**, with
  `DELIBERATELY_UNCONJUGATED` as the written-down escape hatch. It is empty, and that is
  the point. `tense-coverage.test.ts` holds both halves.
- **`buildVerb` throws rather than falling through.** Its `default:` branch used to
  generate *present-indicative* endings for any tense it did not recognise, so the first
  verb to declare a subjunctive would have been handed "hablo, hablas, habla" and the
  course would have taught the indicative under a subjunctive label. A tense with no
  builder, a subjunctive whose stem cannot be derived, and a reflexive imperative all
  raise now. The subjunctive stem is **the present-tense yo form minus its -o** — that is
  the actual rule, and it is why tengo → tenga and conozco → conozca need no hand-written
  forms. Where the yo form does not end in -o (soy, estoy, voy, sé, doy) the precondition
  failing *is* the signal that an override is required.
- **The imperative has no `yo`, and `Conjugation.forms` is `Partial` because of it.**
  Typing it as total made that gap a `string` that was really `undefined`: the one
  paradigm with a genuine hole looked complete to the compiler and broke at the call
  site. Iterate with `personsWithForms`. The generator's old `?? 'yo'` fallback asked
  learners "venir — which form goes with 'yo'?" for the imperative.
- **A lesson cannot teach more concepts than its session can generate.** The session target
  is `clamp(estMinutes × 1.8, 10, 20)`, and a concept that is never generated never enters
  the learner's state, is never scheduled, and never reaches the Library — so `teaches`
  declaring more than that is a promise the session silently breaks. `audit:content` warns
  on it. Raising `estMinutes` is the honest fix when the lesson genuinely needs the time;
  past 20 exercises the lesson has to split.
- **Teaching cards are not exercises, and are not budgeted as ones.** They used to be pushed
  into the same array the practice target was measured against, which forced a hard
  `slice(0, 8)` on new concepts per lesson. Eighty-seven of the 238 lessons teach more than
  eight things and one teaches twenty, so most of what the course introduced reached the learner
  with **no introduction at all** — no card, no meaning, no example, just a multiple choice
  about a word they had never been shown. The target now counts answerable work only;
  cards are additive.
  - **Card, then immediate use, per word.** Eight cards followed by eight questions is a
    glossary and then a quiz. Card → use → card → use retrieves the word while the
    introduction is still on the previous screen, and it is why `recentKinds` carries across
    that loop instead of resetting per word — resetting made every one of those first checks
    a `multipleChoice`, because the freshness pass had nothing to steer by.
  - `MAX_NEW_PER_SESSION` (12) caps how much one sitting introduces. Anything beyond it is
    left **genuinely untouched** — not introduced, not practised, not scored — and picked up
    on the next pass. The alternative is what used to happen: the surplus arrived through the
    practice pool, marked as met and tested, and never once displayed.
- **Sentence building is a core format, and was unreachable on a first encounter.**
  `wordBank` is the only kind that tests word order, clitic position, agreement, negation,
  question inversion and preposition choice at once — and it was absent from the tier that
  brand-new concepts sit in. Generation is a pure read, so nothing a learner answers inside a
  lesson moves them out of that tier while it is being built: measured at the time across the
  then-86 core and grammar lessons, a word bank appeared in **none** on a first pass, and in
  7 of 86 for a learner early in the course. It now runs through every band below mastery,
  second in the gentle tiers — after one recognition, because a word met thirty seconds ago
  deserves one look before being built into a sentence. Measured after, and again on the
  expanded course: 148 of 148 at each of 0.2, 0.45 and 0.7. Above 0.78 it deliberately drops
  out, because assembling blocks is the bridge *to* production and handing it back to
  somebody across it is a step backwards dressed as variety.
  Both halves are pinned in `session.test.ts`.
- **`candidateKinds` used to `return` early for a never-seen concept**, which skipped the
  freshness and recency pass at the bottom of the function. The order was therefore always
  exactly `RECOGNITION`, `multipleChoice` always came first, and it always had the material
  it needed — so the first practice of every new word in the course was a multiple choice.
  The tiers for an unseen concept are still the gentle ones; only the *ordering* is now
  shared with every other branch.
- **A match grid scores every pair in it.** `buildMatch` fills three slots besides the
  target, and drawing them from anywhere meant one answer could credit three concepts the
  learner had never seen — `mergeIds`' bug in a different shape. Met concepts fill the grid
  first; anything unmet that has to fill a gap goes to `supportIds` and is never scored.
- **`stability` is days-until-review-threshold**, and `retrievability()` is a continuous
  decay curve. That curve — not a fixed interval ladder — ranks Smart Review.
- **One grading path.** Everything answerable goes through `checkExercise()`. Do not grade
  inside a component.
- **One classifier, one policy table.** `checkAnswer` decides an `AnswerError` and nothing
  else; `ERROR_POLICY` in `learning/grading.ts` derives both the learner-facing `Verdict` and
  the SRS-facing `Grade` from it — never set a grade by hand, or the banner and the scheduler
  come to disagree. `correctWithFeedback` is successful retrieval in both its forms: `accent`,
  `punctuation`, `paraphrase` and `preferred` grade `correct`; `accentContrast`, `spelling` and
  `partial` grade `almost`. No `STATE_VERSION` bump: `Grade` is not persisted, and
  `MistakeRecord.error` is optional.
- **One session player.** `src/app/session.tsx` runs every `SessionKind`. Add a kind in
  `session.ts`, not a new screen.
- **Answer checking is asymmetric on purpose.** English answers are a *comprehension* check
  and accept any equivalent phrasing. Spanish answers stay strict — but an added subject
  pronoun is accepted only when it agrees with the verb, so "tú tengo" still fails.
  - **Negation is never the word that slides.** `sameEnglishMeaning` tolerates one unmatched
    content word, and negation is exactly one content word: "I don't like coffee" was accepted
    as "I like coffee". Polarity counts must match before a paraphrase counts.
  - **A lossy normaliser must never feed an exact guard.** `contentWords` strips a trailing
    `-s` from words over four characters, which is right for comparing content words but wrong
    for the polarity set: it silently folded `jamas` to `jama` and `unless` to `unles`, dropping
    both out of it. `meaningCoverage` scored "jamas voy" as equivalent to "voy" — an opposite
    accepted — and `sameEnglishMeaning` let "I will call you unless" pass as "I will call you".
    The same footgun fired at two different call sites before it was closed structurally:
    `polarity(words)` is no longer exported, and `polarityOf(text)` — which tokenises for itself
    rather than trusting a caller's already-stripped words — is the only public entry.
  - **yo shares -a/-e endings with él only in the imperfect and conditional.** Treating every
    -a ending as compatible with yo let "yo habla español" through as a near miss.
  - **A typo is a slipped key; a grammar error is a different word — and position separates
    them.** The tolerance used to be edit distance across the whole sentence, two characters
    of slack on anything long. Every grammatical error in Spanish is one or two characters, so
    nineteen of fifty adversarial answers were accepted: "Soy cansado" for "Estoy cansado",
    "la problema", "Gracias para la comida", "Quiero que hablas", "Lo veo" for "La veo". Not
    as `correct` but as `almost`, which is worth 0.75 **and lengthens the review interval** —
    so each one taught the mistake and then hid it for longer than getting it right would
    have. A near miss is now: same number of words, exactly one different, one edit apart, and
    the two still sharing their **last two letters**. Spanish inflection lives on the end of
    the word, which is why that clause keeps "pero" for "perro" a slip and makes "habla" for
    "hablo" an error. Tests come in pairs — the error that must fail beside the slip that must
    pass — because either half alone can be satisfied by moving a threshold.
  - **Accent-only minimal pairs are derived from the corpus, not listed by hand.**
    `src/content/accent-pairs.ts` groups every Spanish surface word by its deaccented form and
    keeps the groups with two or more spellings — 91 of them, every one a genuine minimal pair:
    the diacritical set (`qué`/`que`, `él`/`el`, `sí`/`si`, `cómo`/`como`), demonstrative against
    verb (`está`/`esta`), present yo against preterite él (`hablo`/`habló`), subjunctive against
    preterite yo (`hable`/`hablé`). Deriving from **Spanish text only** is load-bearing, not
    tidy: an earlier pass that read every string literal in `content/` found 107 groups, because
    it was also reading the English glosses (`opinion`, `decision`) and the ASCII id slugs
    (`espanol`, `anos`, `manana`) — a set that would have made `años`, `español` and `mañana`
    accent-critical, punishing the learner for the one thing a phone keyboard genuinely makes
    hard. The same keystroke means something different depending on the task: orthography in a
    translation, a form error in a conjugation drill.
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
  the 148 core/grammar lessons, 100% contain at least one listening exercise and one
  production exercise, and the overall mix is roughly 45% grammar / 22% production /
  21% listening / 12% vocabulary. A test in `session.test.ts` holds this at a floor of 80%,
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

## Getting it onto a phone

The device build is automated by the **`ios-device-builds`** skill
(`~/.claude/skills/ios-device-builds/`), which is app-agnostic and owns the whole procedure:

```bash
~/.claude/skills/ios-device-builds/build-to-iphone.sh          # sync, gate, build, install
~/.claude/skills/ios-device-builds/build-to-iphone.sh --check  # preflight only
```

It lives outside this repo on purpose — the same ritual applies to every app here, and a
copy per repo would rot. What matters locally: a **free Apple certificate expires every
seven days**, so this runs weekly; rebuilding over the top preserves the learner record and
**deleting the app is the only thing that destroys it**; and `expo prebuild --clean` wipes
`DEVELOPMENT_TEAM`, so it is never part of a routine rebuild.

`plugins/with-local-notifications-only.js` exists for this reason — see the reminder section
above for why removing `expo-notifications` from `plugins` cannot achieve the same thing.

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
- **A debounced save is a gap on a phone, not a nicety.** A backgrounded app can have its JS
  thread suspended before a pending timer fires, so the write does not land late — it never
  lands. `LearnerContext` flushes on `AppState` change for exactly this.
- **Every input that takes a Spanish answer needs `components/exercises/accent-row.tsx`.** It
  lived inside `typed.tsx` for a while, which left conversation and build-a-response — the two
  hardest production kinds — with no way to reach á or ñ but a long press. Spanish inputs also
  want `spellCheck={false}`, or iOS red-underlines correct Spanish.
- **A plain style object after an animated style silently wins.** `PressScale` applied
  `{ opacity: disabled ? 0.45 : 1 }` unconditionally *after* its animated style, so the
  press-in fade it had been carrying all along had never once rendered — RN flattens a style
  array last-wins, and an unconditional override is indistinguishable from a deliberate one.
  Conditional overrides only, and put animated styles last when they are meant to win.
- **An uncaught render error is a blank app in a release build**, and a learner facing a blank
  app reinstalls — the one action that deletes their progress. `_layout.tsx` exports an
  `ErrorBoundary` that says the progress is safe and offers a retry.

## Motion, sound and haptics

Three feedback channels, one ladder. The point of writing this down is that the top of the
ladder is only worth anything because the bottom is held back.

### The vocabulary

`components/ui/motion.tsx` defines the five things a surface is allowed to do. A screen that
wants a sixth has nearly always wanted one of these:

| primitive | the thing it means |
|---|---|
| `Reveal` + `stagger()` | arriving. `from="right"` for anything advancing through a queue |
| `usePop` / `Pop` | acknowledging — fires **on change, never on mount** |
| `useEntrancePop` | acknowledging on arrival — the exact opposite, and never on change |
| `useShake` / `Shake` | refusing |
| `useCountUp` / `CountUp` | counting |
| `Burst` | celebrating |

The `usePop` / `useEntrancePop` split is load-bearing rather than stylistic. A streak counter
that pops when the screen opens is claiming something just happened, and nothing did.

`useCountUp` counts **from wherever it currently is**, not from zero, so a header total that
gains three XP continues rather than re-introducing itself.

**Reduce Motion is already honoured** — every Reanimated animation defaults to
`ReduceMotion.System`, so the system setting applies without anyone opting in. The two that
need their own check are `useCountUp` (a plain rAF loop the library knows nothing about) and
`Burst`, which has no quiet form and therefore renders *nothing* rather than a slower version
of the thing the setting exists to avoid.

### The escalation ladder

answer → lesson → unit → stage → level. Each rung gets strictly more than the one below it.

| moment | haptic | sound | motion |
|---|---|---|---|
| answer | `correct` / `incorrect` | `correct` / `incorrect` | option pops or shakes; XP pill rolls |
| lesson finished | — | `complete` | results ladder, accuracy ring, XP roll |
| unit or stage finished | — | `unlock` | milestone card **+ burst** |
| level crossed | `celebrate` | `levelUp` | mascot pop and tilt, rank badge, **burst** |

A burst on a correct answer would spend the level-up. `Burst` appears in exactly three places —
`LevelUp`, `MilestoneCard` and the placement result — and adding a fourth should be argued for.

Milestones are **diffed, not derived**: `crossedMilestone` in `session.tsx` compares the learner
before and after, because "the unit is complete" is a state seen on every visit and "the unit just
became complete" is an event that happens once. The same applies to the streak card, which only
appears on the session that actually banked the day.

### Sound

`src/lib/sound.ts` is shaped exactly like `feedback.ts` — plumbing plus a flag, configured by
`LearnerContext` on hydration and on change, so call sites stay synchronous. **Policy is not in
`lib/`**: which moment earns which cue lives at the call site, the same split that moved the
snapshot rules out of `snapshots.ts`.

The rule is **haptics marks every interaction; sound marks a graded outcome.** Sound carries
further than a vibration, so it gets the higher bar. The one deliberate exception is a mismatched
pair in `match.tsx`, which argues its own case in a comment.

Cues are synthesised, not sourced: `node scripts/make-sounds.mjs` writes `assets/audio/*.wav`.
Edit the script and re-run rather than hand-editing a WAV. All five are built from the same
A-major triad so that two firing close together stack instead of clashing, and the audio session
is explicitly `mixWithOthers` — taking audio focus for a 300ms chime and stopping the learner's
music is the rudest thing a sound effect can do.

`settings.sounds` is non-optional in the type but defaulted in `DEFAULT_SETTINGS`, which is the
`haptics` shape and **needs no `STATE_VERSION` bump**.

### The daily reminder

`settings.reminders` + `settings.reminderHour` (18 by default), both non-optional but
defaulted, so **no `STATE_VERSION` bump** — the `sounds` shape.

The rule is "remind me at six if I haven't studied yet today", and the *yet* is the hard
part: a repeating daily trigger cannot ask a question at fire time, so a learner who
studied at ten in the morning still gets told off at six. `learning/reminders.ts` solves it
by not treating the reminder as one recurring thing at all — it emits a **finite queue of
individual days**, recomputed whenever the app has new information (launch, backgrounding,
and the moment `lastStudyDate` moves). `lib/notifications.ts` cancels and re-arms, which is
what makes it idempotent; without the cancel a fortnight of duplicates piles up in a week.

The horizon is deliberately 14 days. An app nobody opens should eventually stop talking.

**`expo-notifications` is deliberately *not* in `app.json`'s `plugins`.** Its config plugin
writes `aps-environment` into the entitlements — the Push Notifications capability — and a
free Apple Personal Team cannot provision an app that asks for it: *"Personal development
teams do not support the Push Notifications capability."* Nothing here needs push. Every
notification is scheduled locally on the device, and the native module is autolinked from
`node_modules` whether or not the plugin runs, so dropping it costs only the Android
notification icon and colour. **Adding the plugin back breaks local device builds** until
there is a paid developer account; if it is ever needed for Android styling, it has to be
added under an Android-only condition.

Permission is asked **at the moment the learner opts in**, never on launch — the system
prompt appears once per install, and spending it on a cold start trades a permission for
nothing. "Off" and "denied" are different states and the settings screen says which.

### Hover is web-only, and it is not press at half strength

`PressScale` moves the two on different axes: hover **raises**, press **shrinks**. Pass
`hover="lift"` for anything large or text-heavy and `"grow"` (the default) for small controls —
a scaled text layer is resampled during the transition, which is invisible on a chip and
unmissable across a card of copy. Releasing settles back to the *hover* pose when the pointer is
still there, which is what stops a web button feeling like it forgot you.

## Conventions

- Files kebab-case; components and types PascalCase; `@/*` maps to `src/`, `@/assets/*` to
  `assets/*` (both resolved by Metro, so `require('@/assets/…')` works).
- All colour, spacing, radius, type and motion tokens live in `src/constants/theme.ts` and
  are consumed via `useTheme()` / `useGradients()`. Never hardcode a colour — add a token.
- Use `PressScale` rather than bare `Pressable`; the app's tactility depends on it. It drives
  shared values through `.set()` from memoised handlers — assigning to `.value` inside a handler
  created during render reads to the React Compiler as mutating a value it holds.
- **Motion comes from `components/ui/motion.tsx`, never from a screen.** See "Motion, sound and
  haptics" below for the vocabulary and the escalation ladder. A one-off animation written inline
  in a screen is the thing that file exists to prevent.
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
`s.e1c`) · `s.r` routine · `s.s` social · `s.a` around-spain · `s.g` a1-everyday-life ·
`s.n` verb-workshop · `s.h` verb-workshop-moods · `s.i` imperatives ·
`s.j` subjunctive-imperative · `s.t` city-and-stance · `s.u` advanced-expansion ·
`s.v` verb-depth.

That `s.e` overlap is a live hazard — check for collisions when adding sentences, and note
that the id uniqueness test is what catches it — nineteen files across eighteen letters, and
the doubled one is `s.e`. A new sentence file has to claim a letter this list does not already
use, so read the list rather than guessing: a collision is caught by that test and by nothing
in the compiler.

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

### Which suite guards what

| Suite | Guards |
|---|---|
| `content.test.ts` | ids resolve and are unique, every lesson builds a session, verb paradigms are complete and reachable, prerequisites are ordered, optional lessons never gate |
| `session.test.ts` | session assembly and interleaving, checkpoints, the B2 production shift, `skillBalance`, the modality floor, the placement staircase, XP |
| `srs.test.ts` | `retrievability`, review intervals, mastery bands, due dates |
| `answer-check.test.ts` | normalisation, accents, the typo-versus-grammar rule, `pronounAgrees`, English comprehension leniency and its polarity guard |
| `accent-pairs.test.ts` | that the derived accent set is a plausible size and holds the real minimal pairs while leaving `café`/`años`/`mañana` out of it |
| `equivalences.test.ts` | the English equivalence table, at word and at phrase level |
| `es-variants.test.ts` | the three mechanical Spanish rewrites — `al`/`a el`, `del`/`de el`, and the clitic climb that must not fire on "busco un lugar" |
| `meaning.test.ts` | free-turn coverage scoring, and that polarity is absolute rather than weighted |
| `grading.test.ts` | the policy table's totality, and what each exercise kind is actually testing |
| `grading-corpus.test.ts` | that the corpus accepts its own authored answers, and refuses eight classes of mechanical mutation of them |
| `cefr.test.ts` | `estimateProficiency`'s skill gate, and the checkpoint's per-skill floor |
| `ranks.test.ts` | the rank ladder tiles every level with no gaps |
| `backup.test.ts` | what a backup is, what a restore refuses, when a snapshot is due, and that a reinstall restores the memory model and not merely the totals |
| `migrate.test.ts` | what a saved record must prove before it is opened, and that a refusal never returns a blank learner for the debounced save to commit |
| `explain.test.ts` | that the developer diagnostics report the scheduler's own signals, and carry nothing personal |
| `eligibility.test.ts` | the introduction-before-production rule itself, per exercise kind |
| `introduction-order.test.ts` | the same rule end to end — a real learner walking real lessons, plus spiral reuse and the drill/conversation gate |
| `teaching.test.ts` | what an answer is worth saying, and the level policy on showing meaning |
| `progression.test.ts` | what completion may mean and what may cause it — the skip-forward rule, the three lesson states, and the contiguous-prefix invariant Continue depends on |
| `library.test.ts` | Library grouping by the section and unit that taught a thing, and the shown-vs-retrieved line the filters draw |
| `unit-cycle.test.ts` | the strength plan, the actionable mastery figure, and listening rotation |
| `transactional.test.ts` | that only evidence moves mastery — a card is exposure, generation is a pure read, and an abandoned session commits only what was answered |
| `mistake-review.test.ts` | that Review Mistakes contains the mistakes and nothing else, what closes one, and the scaffolded retry |
| `review-scope.test.ts` | global vs unit scope: where each review may draw its targets from |
| `unit-practice.test.ts` | optional practice — its shape per unit, that it is gated only by completion, the already-met escape hatch, and that playing it moves nothing but its own counter |
| `verb-corpus.test.ts` | the ambiguity guards — cross-verb syncretism, homographs, person syncretism, multi-word forms |
| `verb-flow.test.ts` | the whole conjugation pathway, end to end, including the subjunctive and imperative moods |
| `tense-coverage.test.ts` | that every declared `TenseId` is carried, and that an unbuildable tense throws instead of fabricating forms |
| `reminders.test.ts` | when the daily nudge is due and when it must stay quiet |
| `journey.test.ts` | the whole learner pathway, end to end — placement through losing the phone and restoring onto a new one |
| `audit.test.ts` | **not** in `npm test` — the definition-of-done gate for content |

The last three are composition tests and are the ones worth extending: the conjugation
subsystem stayed dead through 119 passing tests because every link was tested individually.

## Known open work

- **Depth is median 2–4 sentences per concept, and the later stages draw a fifth to a quarter
  of their sentences from below their own level** (0% at A0→A1, 22% at B1→B2, 26% at B2→C1,
  against a warning threshold of 50%). That share rose with the expansion and is not itself a
  defect — a B2 stage reusing A2 sentences is the spiral — but it is the number to watch if a
  later stage starts feeling easy. The audit's NOTE reports the eight least-practised concepts
  per stage against that stage's median, and it says so *whether or not anything is wrong* — a
  standing priority queue, not a defect report. The queue is now mostly narrow items (clothes,
  months, individual idioms) that are finished at two or three exposures; do not read it as a
  quota. Density was actually spent on the grammar spine — g.preterite (115), g.present-perfect
  (99), g.subjunctive-intro (91), v.vosotros (88), g.conditional (82) — and on the core verbs
  behind it: ser (46), estar (39), ir (33), tener (30), hacer (29), quedar and llevar (23).
- **`vosotros` and `tú` remain the thinnest persons against `él`.** Partly legitimate:
  third-person narration dominates any corpus. The target is not parity — it is that group
  dialogue keeps appearing, since that is where those forms live. The imperative corpus added
  in the expansion is deliberately written across all five persons for exactly this reason.
- **The future, the imperative and the present perfect remain the thinnest tenses**, though
  far less so than before the expansion: adding 44 verbs without their non-indicative moods
  would have recreated the table-only state at scale, so `verb-workshop-moods.ts` and
  `imperatives.ts` exist to stop that.
- **103 of the 485 paradigms cover only one person each**, which the audit reports without
  warning on. Adding 44 verbs multiplied the paradigm count roughly fourfold, and a new verb
  enters the corpus in one or two persons before its sentences catch up — so this number grew
  with the expansion and is a queue rather than a defect. Some verbs genuinely appear in one
  person in this corpus and always will.
- **41 concepts can be read but not produced at the moment they are introduced** — every
  sentence carrying them still needs something the learner has not met, so the eligibility gate
  offers them for comprehension and withholds them from production until the spiral catches up.
  The audit reports it as a NOTE rather than a warning, because the gate is behaving correctly:
  the fix is another sentence for the concept, not a looser rule. Distinct from the *readable*
  figure below it, which is zero and must stay there.
- **Speaking is scored on self-report.** `speak` exercises play and accept; there is no
  pronunciation check. A deliberate limit — see `lib/speech.ts` for the seam where real audio and
  recognition would land. This is the largest remaining gap in the course as a whole.
  `speakSpanish` already ranks the device's `es-ES` voices and strips blanks and stage
  directions before reading, so the *output* half of that seam is finished; the input half —
  recording, scoring, feedback — does not exist and is the next major feature pass.
- **Developer mode** (`settings.developerMode`, optional so it needs no version bump) adds a
  "why am I seeing this?" panel under every exercise, built from `learning/explain.ts`. It
  reports the signals the scheduler *actually used* — retrievability, stability, ease, lapses,
  queue reason, skill standing, spiral source — because when a review feels wrong the useful
  question is which layer is wrong, not whether it is. Nothing there computes its own numbers:
  a diagnostic that invents them can agree with itself while the system disagrees with both.
- **Untracked vocabulary is the remaining hole in the eligibility gate.** The word gate closed
  the tag shortfall, but 20% of the corpus's content words belong to no concept at all, and
  those are invisible to it by design — see the `content/lexicon.ts` note above for why
  counting them would be worse. `audit:content` reports the ones appearing eight or more times
  (37 of them, led by `nadie` at 93) as a standing authoring queue. Teaching those words is the
  cheapest way to make the gate sharper, and it is content work rather than a code change.
- **Composition is the surface that breaks silently.** The conjugation subsystem stayed dead
  through 119 passing tests because every link was tested individually and the chain was not.
  `verb-flow.test.ts` walks verb → tense → paradigm → exercise → grade → mastery → Library, and
  `journey.test.ts` walks placement → lesson → mistake → Smart Review → unit completion →
  skipping the optional lessons → app restart → story → checkpoint → export → reinstall →
  import → carry on. Its restart goes through `migrateState` rather than a bare JSON
  round-trip, because a round-trip that skips the migrator stays green through the whole class
  of bug where a record is readable and the app declines to read it. When adding a subsystem,
  prefer one test of the pathway over more tests of the parts.
- **A fixture that passes without the fix is not a test of the fix.** The first checkpoint-breadth
  fixture passed before the floor existed; only the weak-but-experienced learner exposed the
  defect. Check that a new regression test fails without its change.

Every number in this section comes from `npm run audit:content`. **Re-read them there rather
than trusting this file** — they drift with every content commit, and a stale number here is
worse than none. They have already been wrong once: a restore from an older commit brought
back the previous pass's figures, and they read as plausibly as the real ones.
